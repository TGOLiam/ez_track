# EzTrack — Architecture Reference

Last updated: Phase 6 refactor (Jun 2026). Branch: `functional_prototype`.

---

## 1. System Overview

EzTrack is a vanilla HTML/CSS/JS SPA — no frameworks, no bundler, no package manager. It is a frontend prototype for an academic project (CCS0103 Technopreneurship, FEU Institute of Technology).

```
Browser (SPA)                    Node.js (backend/api.js)              LLM (DeepSeek)
  sql.js WASM DB        POST /api/chat →    → system prompt + tools →
  localStorage          ← response ←        ← text / tool_calls ←
```

- **Frontend**: all features client-side via sql.js SQLite + localStorage persistence.
- **Server**: `backend/api.js` — zero-dependency Node.js server (built-in `http`, `fs`, `path`). Serves static files + proxies `/api/chat` to an OpenAI-compatible LLM endpoint.
- **No real backend**: no auth server, no cloud sync, no Telegram bot in this repo.

---

## 2. File Load Order

### CSS (`<head>`)

| File | Role |
|------|------|
| `variables.css` | Design tokens: colors, radii, shadows, font |
| `base.css` | Reset, viewport shell, `.page` system, bottom nav, toast, `.hide` |
| `components.css` | Buttons, forms, modals, pills, cards, settings items |
| `pages.css` | Page-specific styles (splash, auth, plans, setup, home, reports, inventory, AI, profile) + print overlay + `@media print` |

### JS (`</body>`)

```
config.js → state.js → db.js → utils.js → navigation.js
         → auth.js → plans.js → home.js → reports.js
         → inventory.js → ai.js → profile.js → modals.js
         → main.js
```

`main.js` loads last and bootstraps: `DB.init()` → render profile cards → splash → login.

---

## 3. Module Responsibility

| File | Owns | Must NOT touch |
|------|------|----------------|
| `config.js` | All configurable constants (`TIERS`, `TX`, timing, limits, `PLANS`, `TIER_META`) | Never references STATE, DOM, or DB |
| `state.js` | Runtime state shape (`STATE` object), `WEEKDATA`, `AI_CHAT`, `AI_RESPONSES` | Never touches DOM |
| `db.js` | All SQLite reads/writes via sql.js WASM, schema, seed, CRUD, `localStorage` persistence | Never touches DOM or STATE (except `loadState()`) |
| `utils.js` | Pure DOM helpers: `show()`, `hide()`, `showToast()`, `setElementText()` | No DB, no STATE mutations |
| `navigation.js` | Page routing (`goTo`) and tab switching (`switchTab`); the single dispatcher for tab render functions | No business logic |
| `auth.js` | Profile picker, register, business setup, Telegram setup, logout | No direct DB calls (delegates to `DB`) |
| `plans.js` | Plan picker rendering, billing toggle, plan selection | STATE mutations limited to `tier` / `billing` |
| `home.js` | Heartbeat card, stats grid, insight banner, transaction list, tier-gated extras | No DB calls; reads from STATE; writes DOM |
| `reports.js` | Bar chart, summary totals, streak, generate printable report, tier extras | Same as home.js |
| `inventory.js` | Inventory list render, tier-gated extras, add item form | DB writes via `createInventoryItem()`; DOM writes via `renderInventoryList()` |
| `ai.js` | AI chat UI, LLM request lifecycle, suggestion chips, mutation applicator | No cross-module DOM (uses `renderHomeTab()` for refreshes) |
| `profile.js` | Account summary, subscription card, support section gating, business profile count | No DB calls; reads from STATE; writes DOM |
| `modals.js` | Modal open/close, transaction log form, language modal | DB writes via `createTransaction()`; DOM writes via `clearLogForm()` |
| `main.js` | Bootstrap sequence only: `DB.init()` → render cards → splash → login | No business logic inline |
| `backend/api.js` | Static file server + `/api/chat` proxy + AI tool calling loop | No DOM, no STATE |
| `backend/tools/_registry.js` | Loads tool definitions, filters by tier, dispatches execution | No DOM, no DB |
| `backend/tools/*.js` | Individual tool handlers (one domain per file) | Each handler writes to `ctx.mutations`; never touches DOM or DB directly |

---

## 4. Data Flow

```
User action → Event handler (thin)
  → Named data function (e.g. createTransaction)
    → DB.addTransaction()  (sql.js)
    → STATE.transactions update
    → DB.save()  (localStorage blob)
  → Render function (e.g. renderHomeTab)
    → reads STATE
    → writes innerHTML
```

**Rule**: data functions never touch DOM. Render functions never touch DB. STATE is the bridge.

### `STATE` shape

```javascript
STATE = {
  profileId: null,       // active DB profile id
  user: null,            // { name, email, avatar }
  business: null,        // { name, type, city, lang }
  tier: 'simula',        // from CONFIG.TIERS.*
  billing: 'monthly',
  currentTab: 'home',
  transactionType: 'inc',// from CONFIG.TX.*
  transactions: [],      // loaded from DB on login
  nextTransactionId: 1,
  inventory: [],         // loaded from DB on login
  customers: [],         // loaded from DB on login
  goals: [],             // loaded from DB on login
  simulaQueriesRemaining: 10,  // from CONFIG.AI_QUERY_LIMIT
};
```

---

## 5. Page Routing

```
splash → login → register → plans → setup → setup2 → app
```

| Page ID | File | What happens |
|---------|------|-------------|
| `page-splash` | `main.js` | Animated logo → fade to login after ~2.3s |
| `page-login` | `auth.js` | Profile card picker or "Create New Account" |
| `page-register` | `auth.js:doRegister()` | Form → `DB.createProfile()` → plans |
| `page-plans` | `plans.js` | 3 tier cards with billing toggle |
| `page-setup` | `auth.js` | Business name, type, city, language |
| `page-setup2` | `auth.js` | Telegram connection walkthrough |
| `page-app` | | Main app shell with 5 tabs |

### App Tabs

| Tab | DOM id | Render function |
|-----|--------|----------------|
| Home | `#tab-home` | `renderHomeTab()` |
| Reports | `#tab-reports` | `renderReportsTab()` |
| Inventory | `#tab-inventory` | `renderInventoryExtras()` |
| AI | `#tab-ai` | `renderAITab()` |
| Profile | `#tab-profile` | `renderProfileTab()` |

Tab switching: `switchTab(tab)` in `navigation.js` — the single dispatcher mapping tab names to render functions.

---

## 6. AI Tool Calling Architecture

### Components

```
js/ai.js                  ← frontend: sends messages, receives reply + mutations
backend/api.js            ← server: multi-round tool loop
backend/tools/_registry.js ← loads definitions, filters by tier, dispatches
backend/tools/definitions.json ← 14 tool schemas with tier access
backend/tools/{domain}.js ← handler modules (core, transactions, inventory, customers, goals, forecasting, tax, restock)
backend/system-prompt.txt ← LLM system prompt template with {{placeholders}}
```

### Tool loop (server-side)

```
POST /api/chat { messages, context, tier }
  │
  ├─ buildSystemPrompt(ctx, tier)  ← fills template with financial data + tool list
  ├─ getToolDefs(tier)             ← filters tool definitions by tier
  │
  ├─ callLLM(messages, toolDefs)   → DeepSeek/OpenAI-compatible API
  │    ├─ finish_reason=stop  → return text to frontend
  │    └─ finish_reason=tool_calls
  │         ├─ execute each tool via TOOL_REGISTRY.execute(name, args, ctx)
  │         ├─ append tool result to messages
  │         └─ callLLM again (max 5 rounds)
  │
  └─ return { choices: [...], mutations: ctx.mutations }
```

### Write operations

Tool handlers that modify data append to `ctx.mutations` rather than directly writing to the DB (which lives in the browser). The server returns mutations in the response. The frontend's `applyMutations()` applies them to the local sql.js DB.

### Tier Tool Access

| Tool | Simula | Sigla | Unlad |
|------|--------|-------|-------|
| `list_transactions` | ✅ | ✅ | ✅ |
| `list_inventory` | ✅ | ✅ | ✅ |
| `get_insight_card` | ✅ | ✅ | ✅ |
| `check_overspending` | ✅ | ✅ | ✅ |
| `add_transaction` | ❌ | ✅ | ✅ |
| `delete_transaction` | ❌ | ✅ | ✅ |
| `add_inventory_item` | ❌ | ✅ | ✅ |
| `set_stock_threshold` | ❌ | ✅ | ✅ |
| `add_customer` | ❌ | ✅ | ✅ |
| `set_financial_goal` | ❌ | ❌ | ✅ |
| `check_goal_progress` | ❌ | ❌ | ✅ |
| `forecast_cashflow` | ❌ | ❌ | ✅ |
| `check_tax_deadlines` | ❌ | ❌ | ✅ |
| `check_restock_needs` | ❌ | ❌ | ✅ |

---

## 7. SQLite Schema (sql.js)

```sql
profiles (id, name, email, avatar, biz_name, biz_type, biz_city, lang, tier)
transactions (id, profile_id, type, desc, amt, date, cat, time)
inventory (id, profile_id, name, qty, unit, min_threshold)
customers (id, profile_id, name, contact)
goals (id, profile_id, name, target_amt, deadline)
```

- **3 seeded profiles**: Maria Anning (simula), Juan Dela Cruz (sigla), Rosa Magsaysay (unlad).
- **21 seeded transactions**: same 7 per profile (for demo parity across tiers).
- **Persistence**: DB serialized to `Uint8Array` → base64 → `localStorage('ez_db')`.

---

## 8. Configuration Layer (`js/config.js`)

```javascript
CONFIG = {
  TIERS,          // { SIMULA:'simula', SIGLA:'sigla', UNLAD:'unlad' }
  TX,             // { INCOME:'inc', EXPENSE:'exp' }
  CURRENCY_SYMBOL, // '₱'
  LOCALE,          // 'en-PH'
  TOAST_DURATION_MS, SPLASH_DURATION_MS, SPLASH_FADE_MS,
  AI_QUERY_LIMIT, TX_LIST_LIMIT_SIMULA, TX_LIST_LIMIT_OTHER,
  MIN_PASSWORD_LENGTH, BAR_CHART_HEIGHT_PX,
  TIER_META,       // display labels + colors per tier
  BIZ_ICONS,       // emoji map per business type
  PLANS,           // 3 plan definitions (features, pricing, notIncluded)
  PROFILE_LIMITS,  // per-tier profile count display
  STORAGE_KEY,     // 'ez_db'
};
```

**Rule**: No JS file may use a string literal for a tier, transaction type, currency symbol, or locale. All must reference `CONFIG.*`.

---

## 9. CSS Architecture

```
variables.css   →   design tokens only (colors, radii, shadows, font)
base.css        →   reset, viewport, page system, bottom nav, toast, .hide
components.css  →   reusable: forms, buttons, cards, modals, pills, settings
pages.css       →   page-specific: splash, auth, plans, setup, home, reports, inventory, AI, profile, print overlay
```

**Rule**: No component style in `base.css`. No `style="..."` attributes in HTML (use CSS classes). No `.style.xxx` in JS (use `classList` or the `show()`/`hide()` helpers).

---

## 10. Development Commands

```bash
node backend/api.js   # start server on :3001 (serves static + /api/chat)
cp .env.example .env   # configure LLM API key
```

The server is zero-dependency. It reads `.env` manually (no `dotenv` package). It proxies `/api/chat` to the endpoint specified in `LLM_API_URL`. If the LLM is unreachable, the frontend falls back to keyword-matched demo responses (`AI_RESPONSES` in `state.js`).

---

## 11. Key Patterns

### Global functions
All JS functions are globals (no modules/imports). Search by function name when tracing. The load order in `index.html` is the dependency graph.

### `show()` / `hide()` / `showToast()`
Defined in `utils.js`. `show(id)` removes the `hide` class. `hide(id)` adds it. `showToast(message)` shows a brief notification.

### Error messages
Pattern: `<div class="err-msg hide" id="X-err">` + `form-input.err` class toggle on the input.

### Data → DOM
Data functions return values. Render functions take STATE and produce DOM. Event handlers are thin orchestrators — capture event, call data function, call render function.

### Profile-based demo accounts
The login page shows 3 clickable profile cards (loaded from DB). Clicking a card calls `loginAsProfile(id)` → `DB.loadState(id)` → `launchApp()`. Registration creates a new profile in the DB.

### CSS custom properties
All colors, radii, shadows, and font are CSS variables in `variables.css`. JS-generated inline styles that reference CSS vars (e.g., `var(--blue-600)`) are acceptable when the value is dynamic (e.g., tier color) — use CSS classes for static styles.

---

## Related Files

| File | Purpose |
|------|---------|
| `AGENTS.md` | Quick-start reference for coding agents |
| `README.md` | Product overview, setup, tool table |
| `product.md` | Full product concept document |
| `costing.md` | Infrastructure cost analysis |
| `business_plan.md` | Business Model Canvas |
| `.env.example` | LLM API configuration template |
| `eztrack.sh` | Dev server launcher (gitignored) |
