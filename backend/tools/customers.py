from .. import database as db

def add_customer(args, db_conn, ctx):
    if not args.get("name") or not args.get("contact"):
        return {"error": "Missing required fields: name, contact"}
    db.add_customer(db_conn, {
        "profile_id": ctx["profileId"],
        "name": args["name"],
        "contact": args["contact"],
    })
    return {"success": True, "message": f"Customer added: {args['name']}"}
