import json
import os
from importlib import import_module

DEFINITIONS_PATH = os.path.join(os.path.dirname(__file__), "definitions.json")

with open(DEFINITIONS_PATH) as f:
    DEFINITIONS = json.load(f)

_HANDLER_CACHE = {}

def _load_handler(name):
    if name not in _HANDLER_CACHE:
        try:
            _HANDLER_CACHE[name] = import_module(f"backend.tools.{name}")
        except ImportError:
            _HANDLER_CACHE[name] = None
    return _HANDLER_CACHE[name]

def get_tool_defs(tier):
    return [
        {
            "type": "function",
            "function": {
                "name": t["name"],
                "description": t["description"],
                "parameters": t["parameters"],
            },
        }
        for t in DEFINITIONS if tier in t["tiers"]
    ]

def get_tool_list_text(tier):
    lines = []
    for t in DEFINITIONS:
        if tier in t["tiers"]:
            lines.append(f"- {t['name']}: {t['description']}")
    return "\n".join(lines)

def execute(name, args, db, ctx):
    defn = next((t for t in DEFINITIONS if t["name"] == name), None)
    if not defn:
        return {"error": f"Unknown tool: {name}"}
    if ctx.get("tier") not in defn["tiers"]:
        return {"error": f"Tool {name} is not available on your tier"}
    mod = _load_handler(defn["handler"])
    if not mod or not hasattr(mod, name):
        return {"error": f"Tool {name} has no handler"}
    return getattr(mod, name)(args, db, ctx)
