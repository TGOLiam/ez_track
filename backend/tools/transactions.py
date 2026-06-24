from datetime import datetime
from .. import database as db

def add_transaction(args, db_conn, ctx):
    if not args.get("type") or not args.get("desc") or not args.get("amt"):
        return {"error": "Missing required fields: type, desc, amt"}
    now = datetime.now()
    tx = {
        "profile_id": ctx["profileId"],
        "type": args["type"],
        "desc": args["desc"],
        "amt": args["amt"],
        "date": now.strftime("%Y-%m-%d"),
        "cat": args.get("cat", ""),
        "time": now.strftime("%I:%M %p"),
    }
    tx_id = db.add_transaction(db_conn, tx)
    return {"success": True, "message": f"Transaction added: {'Income' if args['type'] == 'inc' else 'Expense'} -- ₱{args['amt']} ({args['desc']})"}

def delete_transaction(args, db_conn, ctx):
    if not args.get("id"):
        return {"error": "Missing transaction id"}
    db.delete_transaction(db_conn, args["id"])
    return {"success": True, "message": f"Transaction #{args['id']} deleted."}
