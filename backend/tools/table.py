def render_table(args, db_conn, ctx):
    columns = args.get("columns", [])
    rows = args.get("rows", [])
    if not columns or not rows:
        return {"error": "Missing columns or rows"}
    return {"columns": columns, "rows": rows}
