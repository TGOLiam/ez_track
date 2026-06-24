# EzTrack

**Financial Companion for Filipino SMBs** — a React SPA with a Python FastAPI backend, built for CCS0103 Technopreneurship at FEU Institute of Technology.

Track income & expenses, manage inventory, get AI-powered insights, and generate receipts/invoices/reports.

---

## Quick Start

```bash
cp .env.example .env                 # configure LLM API key + shared API key
```

**Backend** (Python FastAPI):
```bash
pip install -r backend/requirements.txt
python3 -m uvicorn backend.server:app --reload --port 3001
```

**Frontend** (React + Vite):
```bash
npm install
npm run dev
```

Open http://localhost:5173, pick a demo account (Simula/Sigla/Unlad), and explore.

See `AGENTS.md` for detailed architecture and conventions.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, JSX, shadcn/ui (Radix primitives), Tailwind CSS v4, Vite 6 |
| Backend | Python 3 + FastAPI + uvicorn, SQLite3 (server-side) |
| AI Chat | OpenAI-compatible API via FastAPI proxy (DeepSeek, OpenAI, Ollama, etc.) |
| Auth | Shared API key (`X-API-Key` header) — no session/JWT for prototype |
| Rate Limiting | slowapi (in-memory) — `/chat`: 10/min, `/login`: 20/min, others: 60/min |
| Input Validation | Pydantic v2 models on all write endpoints |
| Document Gen | python-docx — receipts, invoices, sales reports (6 .docx templates) |
| Secrets | `.env` file read server-side |

---

## Project Structure

```
backend/
  server.py               # FastAPI app — 17 REST endpoints, LLM chat loop, rate limiting
  database.py             # SQLite schema, 5 tables, full CRUD, seed data (3 profiles)
  system-prompt.txt       # LLM system prompt template ({{placeholder}} tokens)
  requirements.txt        # Python dependencies
  .env                    # API keys (not committed)
  templates/              # .docx template files + Python builders
    receipt.py            #   generate_receipt — fills receipt template
    invoice.py            #   generate_invoice — fills invoice template
    report.py             #   generate_report — fills sales report template
    Basic\ Receipt.docx   #   (template for non-VAT receipts)
    ...                   #   5 more .docx templates
  tools/                  # Tool registry, definitions, and 14 handler modules
    registry.py           #   tool def loader, tier filter, dispatcher
    definitions.json      #   17 tool definitions
    documents.py          #   generate_receipt, generate_invoice, generate_report
    math.py               #   calculate (AST-parsed safe eval)
    table.py              #   render_table (server-side structured data)
    ...                   #   plus transactions.py, inventory.py, customers.py, etc.
src/
  components/
    layout/               # TopBar, BottomNav, AppLayout (app shell)
    pages/                # Splash, Login, Register, Plans, Setup1/2
    pages/app/            # HomeTab, ReportsTab, InventoryTab, AITab, ProfileTab
    modals/               # LogTransaction, AddItem, AddCustomer, AddGoal, AddMenu
    ui/                   # shadcn/ui primitives (button, card, drawer, input, etc.)
  context/
    AppContext.jsx         # useReducer state + provider (transactions, inventory, etc.)
  lib/
    api.js                # Fetch wrapper with X-API-Key header
  config.js               # All constants (TIERS, TX, limits, labels, plans)
  data/                   # Static data (aiResponses.js, suggestionChips.js)
  App.jsx                 # Router — splash → login → register → plans → setup → app
  main.jsx                # Entry point
old/                      # Original vanilla JS code preserved
```

---

## AI Chat & Tool Calling

The AI assistant uses function calling to read/write financial data. Tools are gated by tier. The server runs **multi-round tool loops** (up to 5 rounds) until the LLM decides to respond.

### Tier Access

| Tool | Description | Simula | Sigla | Unlad |
|------|-------------|--------|-------|-------|
| `list_transactions` | View recent transactions | ✅ | ✅ | ✅ |
| `list_inventory` | View stock items | ✅ | ✅ | ✅ |
| `get_insight_card` | Weekly Taglish insight | ✅ | ✅ | ✅ |
| `check_overspending` | Expenses > income this week? | ✅ | ✅ | ✅ |
| `add_transaction` | Log income or expense | ❌ | ✅ | ✅ |
| `delete_transaction` | Remove a transaction | ❌ | ✅ | ✅ |
| `add_inventory_item` | Add stock item | ❌ | ✅ | ✅ |
| `set_stock_threshold` | Set min stock alert level | ❌ | ✅ | ✅ |
| `add_customer` | Save customer record | ❌ | ✅ | ✅ |
| `generate_receipt` | Generate basic receipt (.docx) | ❌ | ✅ | ✅ |
| `generate_invoice` | Generate invoice (.docx) | ❌ | ❌ | ✅ |
| `update_inventory_item` | Update stock item fields | ❌ | ❌ | ✅ |
| `remove_inventory_item` | Delete stock item | ❌ | ❌ | ✅ |
| `set_financial_goal` | Set profit target with deadline | ❌ | ❌ | ✅ |
| `check_goal_progress` | Monitor goal status | ❌ | ❌ | ✅ |
| `forecast_cashflow` | 30-day projection | ❌ | ❌ | ✅ |
| `check_tax_deadlines` | Upcoming BIR dates | ❌ | ❌ | ✅ |
| `check_restock_needs` | What's below threshold? | ❌ | ❌ | ✅ |
| `generate_report` | Generate sales report (.docx) | ❌ | ❌ | ✅ |
| `calculate` | Safe arithmetic evaluation | ✅ | ✅ | ✅ |
| `render_table` | Display structured tables in chat | ✅ | ✅ | ✅ |

### How it works

1. User types a message in the AI tab
2. `AITab.jsx` → `POST /api/chat` with conversation history + financial context
3. `backend/server.py` builds a system prompt from `backend/system-prompt.txt`, injects context (business name, weekly totals, top category, recent transactions)
4. Sends to the configured LLM with tool definitions for the user's tier
5. If the LLM requests a tool call, the server executes it against the SQLite DB, feeds the result back to the LLM, and repeats up to 5 rounds
6. Returns final text response, list of tool calls used, and any render_table data
7. Write operations return `mutations` applied client-side via context dispatch

---

## API Endpoints

| Method | Path | Description | Rate Limit |
|--------|------|-------------|-----------|
| `GET` | `/api/profiles` | List all demo profiles | 60/min |
| `POST` | `/api/login/{id}` | Load full profile state | 20/min |
| `POST` | `/api/register` | Create new profile | 10/min |
| `PUT` | `/api/profile` | Update profile fields | 60/min |
| `GET` | `/api/transactions` | List transactions | 60/min |
| `POST` | `/api/transactions` | Add transaction | 60/min |
| `DELETE` | `/api/transactions/{id}` | Delete transaction | 60/min |
| `GET` | `/api/inventory` | List inventory | 60/min |
| `POST` | `/api/inventory` | Add inventory item | 60/min |
| `GET` | `/api/customers` | List customers | 60/min |
| `POST` | `/api/customers` | Add customer | 60/min |
| `GET` | `/api/goals` | List goals | 60/min |
| `POST` | `/api/goals` | Add goal | 60/min |
| `POST` | `/api/chat` | AI chat (multi-round tool loop) | 10/min |
| `POST` | `/api/refresh/{id}` | Reload profile state | 60/min |
| `GET` | `/api/documents/{id}` | List generated documents | 60/min |
| `GET` | `/api/documents/{id}/{filename}` | Download .docx file | 60/min |

All endpoints require `X-API-Key` header. All inputs validated via Pydantic models.

---

## Security (prototype-grade)

| Measure | Implementation |
|---------|---------------|
| API key auth | `X-API-Key` header checked by middleware; set via `API_KEY` in `.env` |
| Rate limiting | slowapi — 10/min on chat (costs real money), 20/min on login, 60/min elsewhere |
| Input validation | Pydantic v2 — type checks, length limits, regex patterns on all write endpoints |
| CORS | Locked to `http://localhost:5173,http://localhost:3000` (configurable) |
| Security headers | `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection` |
| SQL injection | Parameterized queries; column names whitelisted in dynamic `SET` clauses |
| Frontend limits | Chat cooldown (3s), 500-char input cap, `maxLength` on all form inputs |

---

## Product Context

| Doc | Contents |
|-----|----------|
| `product.md` | Full product concept: features, tiers, positioning |
| `costing.md` | Infrastructure cost analysis per user per tier |
| `business_plan.md` | Business Model Canvas |
| `AGENTS.md` | Repository conventions for AI coding agents |
| `ARCHITECTURE.md` | Full architecture, data flow, component breakdown |

---

## License

Academic project — FEU Institute of Technology, CCS0103 Technopreneurship.
