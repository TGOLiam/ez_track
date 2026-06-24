import os
import json
import httpx
from pathlib import Path
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from pydantic import BaseModel, Field

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

load_dotenv()

from . import database as db
from .tools.registry import get_tool_defs, get_tool_list_text, execute

# ── Config ──
DOCS_DIR = os.path.join(os.path.dirname(__file__), "generated_docs")
os.makedirs(DOCS_DIR, exist_ok=True)

API_KEY = os.getenv("API_KEY", "")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

LLM_API_KEY = os.getenv("OPENAI_API_KEY", "")
LLM_API_URL = os.getenv("LLM_API_URL", "https://api.openai.com/v1/chat/completions")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")
LLM_MAX_TOKENS = int(os.getenv("LLM_MAX_TOKENS", "4096"))

db.init_db()

# ── Rate Limiter ──
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])
app = FastAPI(title="EzTrack API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── API Key verification ──
async def verify_api_key(x_api_key: Optional[str] = Header(None)):
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(403, "Invalid or missing API key")

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-API-Key"],
)

# ── Security Headers ──
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

# ── Pydantic Models ──
class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str = Field(max_length=200)
    avatar: str = ""
    biz_name: str = ""
    biz_type: str = ""
    biz_city: str = ""
    lang: str = "taglish"
    tier: str = "simula"

class UpdateProfileRequest(BaseModel):
    profileId: int
    name: Optional[str] = None
    email: Optional[str] = None
    avatar: Optional[str] = None
    biz_name: Optional[str] = None
    biz_type: Optional[str] = None
    biz_city: Optional[str] = None
    lang: Optional[str] = None
    tier: Optional[str] = None

class AddTransactionRequest(BaseModel):
    profile_id: int
    type: str = Field(pattern=r"^(inc|exp)$")
    desc: str = Field(max_length=200)
    amt: float = Field(gt=0, le=99999999)
    date: str = Field(max_length=10)
    cat: str = ""
    time: str = ""

class AddInventoryRequest(BaseModel):
    profile_id: int
    name: str = Field(max_length=100)
    qty: int = Field(ge=0, le=999999)
    unit: str = Field(max_length=20)
    min_threshold: int = 0

class AddCustomerRequest(BaseModel):
    profile_id: int
    name: str = Field(max_length=150)
    contact: str = Field(max_length=200)

class AddGoalRequest(BaseModel):
    profile_id: int
    name: str = Field(max_length=150)
    target_amt: float = Field(gt=0, le=999999999)
    deadline: str = Field(max_length=10)

class ChatRequest(BaseModel):
    messages: list
    context: dict = {}
    tier: str = "simula"

# ── LLM config ──

def build_system_prompt(ctx: dict, tier: str):
    net = (ctx.get("weeklyIncome") or 0) - (ctx.get("weeklyExpenses") or 0)
    tx_summary = "\n".join(
        f"  {t['date']} {'+' if t['type']=='inc' else '-'}₱{t['amt']} -- {t['desc']}"
        for t in (ctx.get("recentTransactions") or [])
    )
    tool_list = get_tool_list_text(tier)
    return (
        SYSTEM_PROMPT_TEMPLATE
        .replace("{{bizName}}", ctx.get("bizName") or "Unnamed Business")
        .replace("{{tier}}", tier)
        .replace("{{weeklyIncome}}", f"{ctx.get('weeklyIncome') or 0:,.0f}")
        .replace("{{weeklyExpenses}}", f"{ctx.get('weeklyExpenses') or 0:,.0f}")
        .replace("{{netSign}}", "+" if net >= 0 else "")
        .replace("{{netAmount}}", f"{abs(net):,.0f}")
        .replace("{{netTrend}}", "Positive -- you are earning more than you spend." if net >= 0 else "Negative -- expenses have exceeded income this week.")
        .replace("{{topCategory}}", ctx.get("topCategory") or "N/A")
        .replace("{{topCategoryAmount}}", f"{ctx.get('topCategoryAmount') or 0:,.0f}")
        .replace("{{cashToday}}", f"{ctx.get('cashToday') or 0:,.0f}")
        .replace("{{txSummary}}", tx_summary or "  No recent transactions logged.")
        .replace("{{toolList}}", tool_list)
    )

async def call_llm(messages: list, tools: list):
    body = {
        "model": LLM_MODEL,
        "messages": messages,
        "max_tokens": LLM_MAX_TOKENS,
    }
    if tools:
        body["tools"] = tools
        body["tool_choice"] = "auto"
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            LLM_API_URL,
            headers={"Authorization": f"Bearer {LLM_API_KEY}", "Content-Type": "application/json"},
            json=body,
        )
        if not resp.is_success:
            print(f"Upstream API error: {resp.status_code} {resp.text[:300]}")
            return None
        return resp.json()

async def chat_loop(messages: list, ctx: dict, tier: str, max_rounds: int = 5):
    system_prompt = build_system_prompt(ctx, tier)
    tool_defs = get_tool_defs(tier)
    msgs = [{"role": "system", "content": system_prompt}] + messages
    conn = db.get_conn()
    tool_calls_used = []
    tables = []

    for _ in range(max_rounds):
        result = await call_llm(msgs, tool_defs)
        if not result:
            return {"reply": "", "error": "LLM request failed"}
        choice = result.get("choices", [{}])[0]
        msg = choice.get("message", {})
        if choice.get("finish_reason") == "stop" or not msg.get("tool_calls"):
            return {"reply": msg.get("content") or "", "tool_calls_used": tool_calls_used, "tables": tables}
        msgs.append({"role": "assistant", "content": msg.get("content"), "tool_calls": msg["tool_calls"]})
        for tc in msg["tool_calls"]:
            name = tc["function"]["name"]
            tool_calls_used.append(name)
            try:
                func_args = json.loads(tc["function"]["arguments"])
                func_result = execute(tc["function"]["name"], func_args, conn, ctx)
                if name == "render_table":
                    tables.append({"columns": func_args.get("columns", []), "rows": func_args.get("rows", [])})
            except Exception as e:
                func_result = {"error": str(e)}
            msgs.append({"role": "tool", "tool_call_id": tc["id"], "content": json.dumps(func_result)})

    return {"reply": "I could not complete that request in the available steps. Please try again.", "tool_calls_used": tool_calls_used, "tables": tables}

# ── System prompt template ──
PROMPT_PATH = Path(__file__).parent / "system-prompt.txt"
SYSTEM_PROMPT_TEMPLATE = PROMPT_PATH.read_text(encoding="utf-8") if PROMPT_PATH.exists() else ""

# ── REST Endpoints ──

@app.get("/api/profiles", dependencies=[Depends(verify_api_key)])
def list_profiles():
    conn = db.get_conn()
    profiles = db.get_profiles(conn)
    conn.close()
    return profiles

@app.post("/api/login/{profile_id}", dependencies=[Depends(verify_api_key)])
@limiter.limit("20/minute")
def login(request: Request, profile_id: int):
    conn = db.get_conn()
    state = db.load_state(conn, profile_id)
    conn.close()
    if not state:
        raise HTTPException(404, "Profile not found")
    return state

@app.post("/api/register", dependencies=[Depends(verify_api_key)])
@limiter.limit("10/minute")
def register(request: Request, data: RegisterRequest):
    conn = db.get_conn()
    profile_id = db.create_profile(conn, data.model_dump())
    state = db.load_state(conn, profile_id)
    conn.close()
    return state

@app.put("/api/profile", dependencies=[Depends(verify_api_key)])
def update_profile(data: UpdateProfileRequest):
    fields = data.model_dump(exclude_none=True, exclude={"profileId"})
    conn = db.get_conn()
    db.update_profile(conn, data.profileId, fields)
    conn.close()
    return {"ok": True}

@app.get("/api/transactions", dependencies=[Depends(verify_api_key)])
def list_transactions(profile_id: int):
    conn = db.get_conn()
    txs = db.get_transactions(conn, profile_id)
    conn.close()
    return txs

@app.post("/api/transactions", dependencies=[Depends(verify_api_key)])
def add_transaction(data: AddTransactionRequest):
    conn = db.get_conn()
    tx_id = db.add_transaction(conn, data.model_dump())
    conn.close()
    return {"id": tx_id}

@app.delete("/api/transactions/{tx_id}", dependencies=[Depends(verify_api_key)])
def remove_transaction(tx_id: int):
    conn = db.get_conn()
    db.delete_transaction(conn, tx_id)
    conn.close()
    return {"ok": True}

@app.get("/api/inventory", dependencies=[Depends(verify_api_key)])
def list_inventory(profile_id: int):
    conn = db.get_conn()
    items = db.get_inventory(conn, profile_id)
    conn.close()
    return items

@app.post("/api/inventory", dependencies=[Depends(verify_api_key)])
def add_inventory(data: AddInventoryRequest):
    conn = db.get_conn()
    item_id = db.add_inventory_item(conn, data.model_dump())
    conn.close()
    return {"id": item_id}

@app.get("/api/customers", dependencies=[Depends(verify_api_key)])
def list_customers(profile_id: int):
    conn = db.get_conn()
    customers = db.get_customers(conn, profile_id)
    conn.close()
    return customers

@app.post("/api/customers", dependencies=[Depends(verify_api_key)])
def add_customer(data: AddCustomerRequest):
    conn = db.get_conn()
    cust_id = db.add_customer(conn, data.model_dump())
    conn.close()
    return {"id": cust_id}

@app.get("/api/goals", dependencies=[Depends(verify_api_key)])
def list_goals(profile_id: int):
    conn = db.get_conn()
    goals = db.get_goals(conn, profile_id)
    conn.close()
    return goals

@app.post("/api/goals", dependencies=[Depends(verify_api_key)])
def add_goal(data: AddGoalRequest):
    conn = db.get_conn()
    goal_id = db.add_goal(conn, data.model_dump())
    conn.close()
    return {"id": goal_id}

@app.post("/api/chat", dependencies=[Depends(verify_api_key)])
@limiter.limit("10/minute")
async def chat(request: Request, data: ChatRequest):
    messages = data.messages
    ctx = data.context
    tier = ctx.get("tier") or data.tier
    result = await chat_loop(messages, ctx, tier, 5)
    if result.get("error"):
        raise HTTPException(500, result["error"])
    return {
        "choices": [{"message": {"content": result["reply"]}}],
        "tool_calls_used": result.get("tool_calls_used", []),
        "tables": result.get("tables", []),
    }

@app.post("/api/refresh/{profile_id}", dependencies=[Depends(verify_api_key)])
def refresh(profile_id: int):
    conn = db.get_conn()
    state = db.load_state(conn, profile_id)
    conn.close()
    if not state:
        raise HTTPException(404, "Profile not found")
    return state

import re

@app.get("/api/documents/{profile_id}", dependencies=[Depends(verify_api_key)])
def list_documents(profile_id: int):
    files = []
    if not os.path.isdir(DOCS_DIR):
        return files
    for fname in os.listdir(DOCS_DIR):
        if fname.endswith(".docx") and f"_{profile_id}_" in fname:
            parts = fname.split("_")
            dtype = parts[0].capitalize()
            ts_str = "_".join(parts[2:]).replace(".docx", "") if len(parts) >= 3 else ""
            title = fname
            date_str = ""
            if ts_str:
                try:
                    dt = datetime.strptime(ts_str, "%Y%m%d_%H%M%S")
                    date_str = dt.strftime("%b %d, %Y · %I:%M %p")
                except ValueError:
                    date_str = ts_str
            files.append({"filename": fname, "type": dtype, "title": title, "date": date_str})
    files.sort(key=lambda x: x["filename"], reverse=True)
    return files

@app.get("/api/documents/{profile_id}/{filename}", dependencies=[Depends(verify_api_key)])
def serve_document(profile_id: int, filename: str):
    safe = os.path.basename(filename)
    path = os.path.join(DOCS_DIR, safe)
    if not os.path.exists(path):
        raise HTTPException(404, "Document not found")
    return FileResponse(
        path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=safe,
    )
