# EzTrack – AGENTS.md

## Project type & status
Vanilla HTML/CSS/JS SPA — a **frontend prototype/demo** for an academic project (CCS0103 Technopreneurship, FEU Institute of Technology). No build tools, no package.json, no bundler, no tests, no CI. The backend (Telegram bot, cloud sync) does not exist in this repo. The AI chat uses a lightweight Node.js proxy (`backend/api.js`) that forwards to an OpenAI-compatible API — configure your key in `.env` (copy from `.env.example`).

Serve locally:
```
node backend/api.js
```
Then open http://localhost:3001. For LLM chat to work, set `OPENAI_API_KEY` in `.env`.

## Quick reference
**For architecture, module responsibilities, data flow, and patterns** — see `ARCHITECTURE.md`. This file focuses on quick-start conventions.

## File structure & load order
- **CSS** (strict order in `<head>`): `variables.css` → `base.css` → `components.css` → `pages.css`
- **JS** (strict order at bottom of `<body>`): `config.js` → `state.js` → `db.js` → `utils.js` → `navigation.js` → `auth.js` → `plans.js` → `home.js` → `reports.js` → `inventory.js` → `ai.js` → `profile.js` → `modals.js` → `main.js`
- All JS functions are globals (no modules/imports). Search by function name when tracing.
- `main.js` bootstraps: `await DB.init()` → renderPlans → renderProfileCards → splash → login.

## Architecture
- `CONFIG` in `config.js` is the source of all constants (tiers, limits, timing, labels). No hardcoded strings.
- `STATE` in `state.js` is the runtime source of truth, populated from the DB on login via `DB.loadState()`.
- `DB` in `db.js` wraps sql.js WASM with SQLite tables (profiles, transactions, inventory, customers, goals). Persisted to `localStorage('ez_db')` as base64 blob.
- Page routing: `splash` → `login` → `register` → `plans` → `setup` → `setup2` → `app`.
- App tabs: `home`, `reports`, `inventory`, `ai`, `profile` (switched via `switchTab()` in `navigation.js`).
- AI tool loop: server-side multi-round LLM calls via `/api/chat`; 14 tools gated by tier; write ops return `mutations` applied client-side.

## Product context (from repo docs)
- **Target users:** Filipino SMB owners with no accounting background.
- **3 pricing tiers:** Simula (free), Sigla (~₱299/mo), Unlad (~₱699/mo).
- **Language:** Taglish (Filipino-English mix).

## Conventions
- `show(id)` / `hide(id)` / `showToast(message)` / `setElementText(id, value)` from `utils.js`.
- Data functions never touch DOM. Render functions never touch DB. Event handlers are thin orchestrators.
- No `style="..."` in HTML. Use CSS classes. No `.style.xxx` in JS — use `show()`/`hide()` or `classList`.
- Use `CONFIG.TIERS.SIMULA` etc. instead of `'simula'` string literals; `CONFIG.TX.INCOME` instead of `'inc'`.
- `'₱'` → `CONFIG.CURRENCY_SYMBOL`. `'en-PH'` → `CONFIG.LOCALE`.
- Error fields follow pattern: `<div class="err-msg hide" id="X-err">` + `form-input err` class toggle.

## Repo docs for reference
- `ARCHITECTURE.md` — full architecture, module responsibilities, data flow, tool loop, schema
- `README.md` — product overview, setup, AI tool table
- `product.md` — full product concept (features, tiers, positioning)
- `costing.md` — infrastructure cost analysis per user per tier
- `business_plan.md` — Business Model Canvas
