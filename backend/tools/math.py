import ast
import operator

_OPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}

def _eval(node):
    if isinstance(node, ast.Constant):
        return node.value
    if isinstance(node, ast.BinOp):
        return _OPS[type(node.op)](_eval(node.left), _eval(node.right))
    if isinstance(node, ast.UnaryOp):
        return _OPS[type(node.op)](_eval(node.operand))
    raise ValueError(f"Unsupported: {type(node).__name__}")

def calculate(args, db_conn, ctx):
    expr = args.get("expression", "").strip()
    if not expr:
        return {"error": "No expression provided"}
    try:
        result = _eval(ast.parse(expr, mode="eval").body)
        return {"expression": expr, "result": result}
    except Exception as e:
        return {"error": str(e)}
