from .. import database as db

def set_financial_goal(args, db_conn, ctx):
    if not args.get("name") or not args.get("target_amt") or not args.get("deadline"):
        return {"error": "Missing required fields: name, target_amt, deadline"}
    db.add_goal(db_conn, {
        "profile_id": ctx["profileId"],
        "name": args["name"],
        "target_amt": args["target_amt"],
        "deadline": args["deadline"],
    })
    return {"success": True, "message": f"Goal set: {args['name']} (₱{args['target_amt']:,.0f} by {args['deadline']})"}

def check_goal_progress(args, db_conn, ctx):
    goals = ctx.get("goals") or []
    if not goals:
        return {"message": "No goals set yet. Try setting one!"}
    total_net = (ctx.get("weeklyIncome") or 0) - (ctx.get("weeklyExpenses") or 0)
    return {
        "message": "Here is your goal progress:",
        "goals": [
            {
                "name": g["name"],
                "target": "₱" + f"{g['target_amt']:,.0f}",
                "deadline": g["deadline"],
                "currentNet": "₱" + f"{total_net:,.0f}",
                "progress": f"{min(100, round((total_net / g['target_amt']) * 100))}%" if g["target_amt"] > 0 else "0%",
                "remaining": "₱" + f"{max(0, g['target_amt'] - total_net):,.0f}",
            }
            for g in goals
        ],
    }
