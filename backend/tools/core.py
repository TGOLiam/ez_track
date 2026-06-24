from .. import database as db

def list_transactions(args, db_conn, ctx):
    txs = (ctx.get("recentTransactions") or [])[:args.get("limit", 10)]
    if not txs:
        return {"message": "No transactions found."}
    return {
        "message": "Here are your recent transactions:",
        "transactions": [
            {
                "id": t["id"],
                "type": "Income" if t["type"] == "inc" else "Expense",
                "description": t["desc"],
                "amount": "₱" + str(t["amt"]),
                "date": t["date"],
                "category": t.get("cat") or "—",
            }
            for t in txs
        ],
    }

def list_inventory(args, db_conn, ctx):
    items = ctx.get("inventory") or []
    if not items:
        return {"message": "No inventory items found."}
    return {
        "message": "Here is your current inventory:",
        "items": [
            {
                "id": i["id"],
                "name": i["name"],
                "quantity": str(i["qty"]) + " " + i["unit"],
                "min_threshold": i.get("min_threshold") or 0,
                "status": "Out of stock" if i["qty"] <= 0 else ("Low stock" if i.get("min_threshold") and i["qty"] < i["min_threshold"] else "OK"),
            }
            for i in items
        ],
    }

def get_insight_card(args, db_conn, ctx):
    txs = ctx.get("recentTransactions") or []
    exp_txs = [t for t in txs if t["type"] == "exp"]
    inc_txs = [t for t in txs if t["type"] == "inc"]
    total_exp = sum(t["amt"] for t in exp_txs)
    total_inc = sum(t["amt"] for t in inc_txs)
    cats = {}
    for t in exp_txs:
        if t.get("cat"):
            cats[t["cat"]] = cats.get(t["cat"], 0) + t["amt"]
    top_cat = max(cats, key=cats.get) if cats else None
    top_amt = cats.get(top_cat, 0) if top_cat else 0

    if not total_exp and not total_inc:
        return {"message": "Wala pang transactions ngayong linggo. Mag-log na para makita ang insight!"}

    if top_cat:
        insight = f"Ang pinakamalaking gastos mo ngayong linggo ay {top_cat} -- ₱{top_amt:,.0f}"
        prev_exp = ctx.get("prevExpenses") or total_exp * 1.1
        if total_exp < prev_exp:
            insight += f". Mas mababa ito vs last week (₱{prev_exp:,.0f}). Maganda ang trend!"
        else:
            insight += f". Medyo mas mataas ito vs last week (₱{prev_exp:,.0f})."
    else:
        if total_inc >= total_exp:
            insight = f"Kumita ka ng ₱{total_inc:,.0f} at gumastos ng ₱{total_exp:,.0f} ngayong linggo. Net: +₱{(total_inc - total_exp):,.0f}. Keep it up!"
        else:
            insight = f"Gumastos ka ng ₱{total_exp:,.0f} vs kita na ₱{total_inc:,.0f} ngayong linggo. Time to check your spending."
    return {"message": insight}

def check_overspending(args, db_conn, ctx):
    total_inc = ctx.get("weeklyIncome") or 0
    total_exp = ctx.get("weeklyExpenses") or 0
    if total_exp > total_inc:
        return {
            "alert": True,
            "message": f"Overspending Alert! Ang gastos mo (₱{total_exp:,.0f}) ay lumampas sa kita mo (₱{total_inc:,.0f}) ngayong linggo.",
            "overspendAmount": total_exp - total_inc,
        }
    return {
        "alert": False,
        "message": f"Good news! Ang kita mo (₱{total_inc:,.0f}) ay mas mataas sa gastos mo (₱{total_exp:,.0f}) ngayong linggo.",
    }
