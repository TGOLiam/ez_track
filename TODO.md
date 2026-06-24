# Document Generation — TODO

## Overview

Generate receipts, invoices, and financial reports as `.docx` files using `python-docx`. Templates are `build()` functions in `backend/templates/` that return a `Document` object. The AI calls a tool → handler builds the doc → saves to `backend/generated_docs/` → My Documents tab lists it.

Tool tier access:

| Tool | Simula | Sigla | Unlad |
|---|---|---|---|
| `generate_receipt` | ✅ | ✅ | ✅ |
| `generate_invoice` | ❌ | ✅ | ✅ |
| `generate_weekly_report` | ❌ | ✅ | ✅ |
| `generate_monthly_report` | ❌ | ❌ | ✅ |

---

## TODO — Backend

### `backend/requirements.txt`
- [ ] Add `python-docx>=1.1.2`

### `backend/templates/`
- [ ] Create `__init__.py` (empty)
- [ ] Create `receipt.py` — `build(items, payment, ctx)` returns `Document`
  - Receives: `items` (array of `{name, qty, price}`), `payment_method`
  - Builds: business name, date, itemized table, total, payment method, footer
- [ ] Create `invoice.py` — `build(customer, items, due_date, ctx)` returns `Document`
  - Receives: `customer`, `items`, `due_date`, `invoice_number`
  - Builds: invoice number, date, customer, itemized table, total, due date
- [ ] Create `weekly_report.py` — `build(ctx)` returns `Document`
  - Reads from `ctx`: `bizName`, `weeklyIncome`, `weeklyExpenses`, `topCategory`, `recentTransactions`
  - Builds: date range, summary stats, top category, transaction table
- [ ] Create `monthly_report.py` — `build(ctx)` returns `Document`
  - Reads from `ctx`: `bizName`, month, P&L summary, category breakdown, transactions
  - Builds: P&L summary, category bars, transaction list

### `backend/tools/documents.py`
- [ ] Create with 4 handler functions: `generate_receipt`, `generate_invoice`, `generate_weekly_report`, `generate_monthly_report`
- [ ] Each handler calls the corresponding template `build()`, saves to `generated_docs/` with timestamped filename, returns `{success, filename, title}`

### `backend/tools/definitions.json`
- [ ] Add 4 tool definitions with tier-gated access and parameter schemas

### `backend/server.py`
- [ ] Add endpoint: `GET /api/documents/{profile_id}` — scan `generated_docs/` for matching files, return list of `{filename, type, title, date}`
- [ ] Add endpoint: `GET /api/documents/{profile_id}/{filename}` — serve the .docx file for download

### `backend/generated_docs/`
- [ ] Create directory (output folder, add to .gitignore)

---

## TODO — Frontend

### `src/components/pages/app/ReportsTab.jsx`
- [ ] Replace the My Documents placeholder with a real document list
- [ ] Fetch docs from `GET /api/documents/{profile_id}` on mount
- [ ] Empty state: doc icon + "No documents yet. Ask the AI to generate one."
- [ ] Doc cards: type badge (RECEIPT / INVOICE / REPORT), title, date, "Open" button
- [ ] "Open" → `window.open(url)` to download the .docx

---

## When you provide template .docx files

1. Place the `.docx` file in `backend/templates/` (e.g. `receipt.docx`)
2. Update the corresponding `build()` function to load it:
   ```python
   from docx import Document
   def build(items, payment, ctx):
       doc = Document("backend/templates/receipt.docx")
       # doc.tables[0], doc.paragraphs — fill placeholders
       return doc
   ```
3. Test by asking the AI: "Generate a receipt for 2 kg rice at ₱50"

---

## Data flow

```
User: "Generate a receipt for 2 kg rice at ₱50 and 1 L oil at ₱120"
  → LLM calls generate_receipt(items=[...], payment="Cash")
    → Handler calls receipt.build(items, payment, ctx)
      → Returns Document object
    → Saves to generated_docs/receipt_1_20260624_143022.docx
    → Returns {success: true, filename: ..., title: ...}
  → AI confirms: "Receipt saved"
  → My Documents tab shows it in the list
  → User taps "Open" → browser downloads the .docx
```

---

## Notes

- Templates are pure `build()` functions — no DB access, no side effects
- The actual `.docx` template files go in `backend/templates/` and are loaded by `python-docx`
- Stub templates can return `Document()` with hardcoded content for now
- Generate filenames with convention: `{type}_{profileId}_{timestamp}.docx`
- `.gitignore` `generated_docs/` — output files aren't committed
