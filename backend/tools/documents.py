import os
from datetime import datetime
from ..templates import receipt, invoice, report

DOCS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "generated_docs")
os.makedirs(DOCS_DIR, exist_ok=True)

def _next_number(ctx, prefix):
    count_file = os.path.join(DOCS_DIR, f"counter_{prefix}.txt")
    try:
        with open(count_file) as f:
            n = int(f.read().strip()) + 1
    except (FileNotFoundError, ValueError):
        n = 1
    with open(count_file, "w") as f:
        f.write(str(n))
    ctx["nextDocNumber"] = n
    return n

def generate_receipt(args, db_conn, ctx):
    items = args.get("items", [])
    if not items:
        return {"error": "No items provided"}
    if not args.get("customer_name"):
        return {"error": "Customer name required"}
    if not args.get("payment_method"):
        return {"error": "Payment method required"}

    _next_number(ctx, "receipt")
    tier = ctx.get("tier", "simula")
    customer = {"name": args["customer_name"], "contact": args.get("customer_contact", "")}
    payment = {"method": args["payment_method"], "status": args.get("payment_status", "paid")}

    doc = receipt.build(items, customer, payment, ctx, tier)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"receipt_{ctx['profileId']}_{ts}.docx"
    path = os.path.join(DOCS_DIR, filename)
    doc.save(path)

    title = f"Receipt — {args['customer_name']}"
    return {"success": True, "filename": filename, "title": title}

def generate_invoice(args, db_conn, ctx):
    items = args.get("items", [])
    if not items:
        return {"error": "No items provided"}
    if not args.get("customer_name"):
        return {"error": "Customer name required"}

    _next_number(ctx, "invoice")
    tier = ctx.get("tier", "sigla")
    customer = {"name": args["customer_name"], "contact": args.get("customer_contact", "")}
    payment = {"method": args.get("payment_method", "Cash"), "status": args.get("payment_status", "unpaid")}
    discount = args.get("discount", 0) or 0
    withholding_tax = args.get("withholding_tax", 0) or 0
    notes = args.get("notes", "")

    if tier == "unlad":
        customer["tin"] = args.get("customer_tin", "")
        customer["address"] = args.get("customer_address", "")

    doc = invoice.build(items, customer, payment, ctx, tier, discount, withholding_tax, notes)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"invoice_{ctx['profileId']}_{ts}.docx"
    path = os.path.join(DOCS_DIR, filename)
    doc.save(path)

    title = f"Invoice — {args['customer_name']}"
    return {"success": True, "filename": filename, "title": title}

def generate_report(args, db_conn, ctx):
    if not args.get("period") or not args.get("ai_summary"):
        return {"error": "Period and summary required"}

    tier = ctx.get("tier", "sigla")
    data = {
        "period": args["period"],
        "ai_summary": args["ai_summary"],
        "total_sales": args.get("total_sales", 0),
        "total_expenses": args.get("total_expenses", 0),
        "comparison_text": args.get("comparison_text", ""),
        "strongest_period_label": args.get("strongest_period_label", ""),
        "strongest_period_amount": args.get("strongest_period_amount", ""),
        "weakest_period_label": args.get("weakest_period_label", ""),
        "weakest_period_amount": args.get("weakest_period_amount", ""),
        "categories": args.get("categories", []),
        "tip_1": args.get("tip_1", ""),
        "tip_2": args.get("tip_2", ""),
    }
    if tier == "unlad":
        data.update({
            "gross_sales": args.get("gross_sales"),
            "total_direct_costs": args.get("total_direct_costs", 0),
            "total_opex": args.get("total_opex"),
            "forecast": args.get("forecast", ""),
            "cash_risk": args.get("cash_risk", "None"),
            "goal_label": args.get("goal_label", ""),
            "goal_progress": args.get("goal_progress", ""),
            "goal_note": args.get("goal_note", ""),
            "ar_current": args.get("ar_current", "₱0.00"),
            "ar_30days": args.get("ar_30days", "₱0.00"),
            "ar_60days": args.get("ar_60days", "₱0.00"),
            "ar_90plus": args.get("ar_90plus", "₱0.00"),
        })

    doc = report.build(ctx, tier, data)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    prefix = "weekly" if tier == "sigla" else "monthly"
    filename = f"{prefix}_report_{ctx['profileId']}_{ts}.docx"
    path = os.path.join(DOCS_DIR, filename)
    doc.save(path)

    label = "Weekly" if tier == "sigla" else "Monthly"
    title = f"{label} Report — {args['period']}"
    return {"success": True, "filename": filename, "title": title}
