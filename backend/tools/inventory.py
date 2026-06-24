from .. import database as db

def add_inventory_item(args, db_conn, ctx):
    if not args.get("name") or args.get("qty") is None or not args.get("unit"):
        return {"error": "Missing required fields: name, qty, unit"}
    item = {
        "profile_id": ctx["profileId"],
        "name": args["name"],
        "qty": int(args["qty"]) if args["qty"] else 0,
        "unit": args["unit"],
        "min_threshold": int(args.get("min_threshold") or 0),
    }
    db.add_inventory_item(db_conn, item)
    return {"success": True, "message": f"Item added: {args['name']} ({args['qty']} {args['unit']})"}

def set_stock_threshold(args, db_conn, ctx):
    if not args.get("item_id") or args.get("min_threshold") is None:
        return {"error": "Missing required fields: item_id, min_threshold"}
    db.set_stock_threshold(db_conn, args["item_id"], int(args["min_threshold"]))
    return {"success": True, "message": f"Threshold set to {args['min_threshold']} for item #{args['item_id']}"}

def update_inventory_item(args, db_conn, ctx):
    if not args.get("item_id"):
        return {"error": "Missing item_id"}
    fields = {}
    if args.get("name") is not None:
        fields["name"] = args["name"]
    if args.get("qty") is not None:
        fields["qty"] = int(args["qty"])
    if args.get("unit") is not None:
        fields["unit"] = args["unit"]
    if not fields:
        return {"error": "No fields to update"}
    db.update_inventory_item(db_conn, args["item_id"], fields)
    return {"success": True, "message": f"Item #{args['item_id']} updated."}

def remove_inventory_item(args, db_conn, ctx):
    if not args.get("item_id"):
        return {"error": "Missing item_id"}
    db.delete_inventory_item(db_conn, args["item_id"])
    return {"success": True, "message": f"Item #{args['item_id']} removed."}
