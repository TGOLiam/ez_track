from datetime import datetime

def check_tax_deadlines(args, db_conn, ctx):
    now = datetime.now()
    year = now.year
    deadlines = [
        {"quarter": "Q1 (Jan–Mar)", "deadline": f"May 25, {year}", "status": "Past" if now > datetime(year, 5, 25) else "Upcoming"},
        {"quarter": "Q2 (Apr–Jun)", "deadline": f"August 25, {year}", "status": "Past" if now > datetime(year, 8, 25) else "Upcoming"},
        {"quarter": "Q3 (Jul–Sep)", "deadline": f"November 25, {year}", "status": "Past" if now > datetime(year, 11, 25) else "Upcoming"},
        {"quarter": "Q4 (Oct–Dec)", "deadline": f"February 25, {year+1}", "status": "Past" if now > datetime(year+1, 2, 25) else "Upcoming"},
    ]
    total_inc = ctx.get("weeklyIncome") or 0
    est_tax = round(total_inc * 0.03)
    return {
        "message": "Here are your BIR quarterly deadline reminders for non-VAT registered businesses:",
        "deadlines": deadlines,
        "estimatedQuarterlyTax": f"₱{est_tax:,} (3% percentage tax based on current revenue)",
        "note": "These are estimates. Please consult a bookkeeper or BIR for exact filing requirements.",
    }
