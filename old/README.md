# EzTrack

**Financial Companion for Filipino SMBs** — a frontend prototype/demo for CCS0103 Technopreneurship at FEU Institute of Technology.

Track income & expenses, manage inventory, get AI-powered insights, and generate financial reports — all client-side with an optional LLM backend.

---

## Quick Start

```bash
cp .env.example .env    # configure your LLM API key
node backend/api.js     # serves on http://localhost:3001
```

Open http://localhost:3001, pick a demo account (Simula/Sigla/Unlad), and explore.

See `AGENTS.md` for detailed architecture and conventions.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML/CSS/JS — no frameworks, no bundler |
| Persistence | SQLite via `sql.js` WASM, serialized to `localStorage` |
| AI Chat | OpenAI-compatible API via `backend/api.js` proxy (DeepSeek, OpenAI, Ollama, etc.) |
| Secrets | `.env` file read server-side, never exposed to browser |

---

## Project Structure

```
backend/
  api.js                  # Node.js server — static files + /api/chat proxy
  system-prompt.txt       # LLM system prompt template ({{placeholder}} tokens)
  tools/                  # Tool registry, definitions, and handler modules
    _registry.js
    definitions.json
    core.js  transactions.js  inventory.js  customers.js
    goals.js  forecasting.js  tax.js  restock.js
css/
  variables.css           # design tokens (blue palette, fonts, radii)
  base.css                # reset, viewport shell, page system, bottom nav
  components.css          # buttons, forms, modals, pills, cards
  pages.css               # page-specific styles + print overlay
js/
  config.js               # single source of all constants (TIERS, TX, limits, labels)
  state.js                # STATE object, WEEKDATA, AI_CHAT, AI_RESPONSES
  db.js                   # SQLite wrapper (sql.js) — schema, seed, CRUD, persistence
  utils.js                # show(), hide(), showToast()
  navigation.js           # goTo(), switchTab()
  auth.js                 # profile picker, login, register, business setup
  plans.js                # plan picker with billing toggle
  home.js                 # heartbeat card, stats grid, insight, transaction list
  reports.js              # bar chart, summaries, streak, generate report
  inventory.js            # inventory list, tier-gated extras, add item
  ai.js                   # AI chat UI, real LLM calls, keyword fallback
  profile.js              # profile tab, subscription card, support gating
  modals.js               # log transaction, language, add inventory item modals
  main.js                 # bootstrap — DB.init(), render cards, splash, login
assets/
  images/logo.jpg
.evn.example              # LLM API configuration template
```

---

## AI Chat & Tool Calling

The AI assistant uses function calling to read/write financial data. Tools are gated by tier.

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
| `set_financial_goal` | Set profit target with deadline | ❌ | ❌ | ✅ |
| `check_goal_progress` | Monitor goal status | ❌ | ❌ | ✅ |
| `forecast_cashflow` | 30-day projection | ❌ | ❌ | ✅ |
| `check_tax_deadlines` | Upcoming BIR dates | ❌ | ❌ | ✅ |
| `check_restock_needs` | What's below threshold? | ❌ | ❌ | ✅ |

*`generate_invoice` and `generate_report` (`.docx`) are planned but not yet implemented.*

Each inference call type maps to a cost allocation — see `costing.md` for the breakdown.

### How it works

1. User types a message in the AI tab
2. `js/ai.js` → `POST /api/chat` with conversation history + financial context
3. `backend/api.js` builds a system prompt from `backend/system-prompt.txt`, injects context (business name, weekly totals, top category, recent transactions)
4. Sends to the configured LLM with tool definitions for the user's tier
5. If the LLM requests a tool call, the server executes it against the SQLite DB, feeds the result back to the LLM, and returns the final text response
6. If the server or API is unreachable, falls back to keyword-matched demo responses

---

## Product Context

| Doc | Contents |
|-----|----------|
| `product.md` | Full product concept: features, tiers, positioning |
| `costing.md` | Infrastructure cost analysis per user per tier |
| `business_plan.md` | Business Model Canvas |
| `AGENTS.md` | Repository conventions for AI coding agents |

---

## License

Academic project — FEU Institute of Technology, CCS0103 Technopreneurship.
