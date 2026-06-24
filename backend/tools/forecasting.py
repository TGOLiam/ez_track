def forecast_cashflow(args, db_conn, ctx):
    txs = ctx.get("recentTransactions") or []
    inc_txs = [t for t in txs if t["type"] == "inc"]
    exp_txs = [t for t in txs if t["type"] == "exp"]
    avg_inc = round(sum(t["amt"] for t in inc_txs) / 7) if inc_txs else 0
    avg_exp = round(sum(t["amt"] for t in exp_txs) / 7) if exp_txs else 0
    cash_now = ctx.get("cashToday") or 0
    projected = cash_now + (avg_inc - avg_exp) * 30
    return {
        "message": "Based on your recent 7-day pattern, here is your 30-day cash flow forecast:",
        "forecast": {
            "currentCash": "₱" + f"{cash_now:,.0f}",
            "avgDailyIncome": "₱" + f"{avg_inc:,.0f}",
            "avgDailyExpenses": "₱" + f"{avg_exp:,.0f}",
            "projected30Days": "₱" + f"{projected:,.0f}",
            "trend": "Increasing" if projected >= cash_now else "Decreasing",
        },
        "note": (
            "At current pace, you may run out of cash within 30 days."
            if projected < 0 else
            "Your cash position looks stable based on current trends."
        ),
    }
