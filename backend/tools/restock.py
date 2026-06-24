def check_restock_needs(args, db_conn, ctx):
    items = ctx.get("inventory") or []
    needs = [i for i in items if i.get("min_threshold", 0) > 0 and i["qty"] < i["min_threshold"]]
    out = [i for i in items if i["qty"] <= 0 and i not in needs]
    if not needs and not out:
        return {"message": "All inventory items are adequately stocked. No restock needed right now."}
    result = []
    for i in needs:
        result.append({"name": i["name"], "current": f"{i['qty']} {i['unit']}", "min": i["min_threshold"], "need": f"{i['min_threshold'] - i['qty']} {i['unit']}"})
    for i in out:
        result.append({"name": i["name"], "current": "Out of stock", "min": i.get("min_threshold", 0), "need": f"{i.get('min_threshold', 0)} {i['unit']}"})
    return {
        "message": "Items needing restock:",
        "items": result,
        "tip": "Consider ordering before your peak sales days (Friday and Saturday) to avoid stockouts.",
    }
