"""Editor services: lint (live error checking) and format (Black / SQL)."""
import ast
import re

KERNEL_NAMES = {"spark", "sc", "dbutils", "display", "displayHTML", "F", "T", "BASE_PATH", "_sqldf", "NotebookExit",
                "NotebookRunError", "NotebookRunTimeout", "FileInfo", "get_ipython", "sqlContext", "params"}
MAGIC = re.compile(r"^\s*%(sql|md|python|py|run|sh|fs)\b")


def _python_source(cell_source: str):
    """Return lintable Python for a cell (magic cells -> None; %python strips the line; IPython lines -> pass)."""
    m = MAGIC.match(cell_source)
    if m and m.group(1) not in ("python", "py"):
        return None
    lines = cell_source.split("\n")
    if m:
        lines[0] = ""
    return "\n".join("pass" if re.match(r"^\s*[!%]", ln) else ln for ln in lines)


def lint(cells: list, known_names: list | None = None) -> dict:
    """cells: [{id, source}] in notebook order. Lints the whole notebook as one program so names defined in
    earlier cells count. Returns {cell_id: [{line, col, end, message, severity}]}."""
    try:
        from pyflakes import api as _api, messages as _msgs, reporter as _rep  # noqa: F401
        from pyflakes.checker import Checker
    except ImportError:
        Checker = None
    has_run = any(re.match(r"^\s*%run\b", c.get("source") or "") for c in cells)
    known = KERNEL_NAMES | set(known_names or [])
    out = {c["id"]: [] for c in cells}
    program, owners = [], []  # owners[i] = (cell_id, line_in_cell)
    for c in cells:
        src = _python_source(c.get("source") or "")
        if src is None:
            continue
        try:
            ast.parse(src)
        except SyntaxError as e:
            out[c["id"]].append({"line": max(0, (e.lineno or 1) - 1), "col": max(0, (e.offset or 1) - 1), "end": None,
                                 "message": f"SyntaxError: {e.msg}", "severity": "error"})
            continue  # keep the rest of the notebook lintable
        for i, ln in enumerate(src.split("\n")):
            program.append(ln)
            owners.append((c["id"], i))
    if Checker is None or not program:
        return out
    code = "\n".join(program)
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return out
    for msg in Checker(tree, filename="<notebook>").messages:
        name = type(msg).__name__
        text = msg.message % msg.message_args
        if name in ("UndefinedName", "UndefinedLocal") and (has_run or msg.message_args[0] in known):
            continue
        if name in ("UnusedImport", "UnusedVariable", "RedefinedWhileUnused", "ImportStarUsed", "ImportStarUsage"):
            sev = "warning"
        elif name.startswith("Undefined") or "Syntax" in name:
            sev = "error"
        else:
            sev = "warning"
        if name == "UnusedImport":
            continue  # imports are usually used in later cells
        idx = msg.lineno - 1
        if 0 <= idx < len(owners):
            cid, line = owners[idx]
            out[cid].append({"line": line, "col": getattr(msg, "col", 0), "end": None, "message": text, "severity": sev})
    return out


def format_code(source: str) -> dict:
    """Format one cell: Black for Python, sqlparse for %sql. Magic lines are preserved."""
    m = MAGIC.match(source)
    if m and m.group(1) == "sql":
        import sqlparse
        first, _, body = source.partition("\n")
        pretty = sqlparse.format(body, reindent=True, keyword_case="upper", indent_width=2)
        return {"source": f"{first.strip()}\n{pretty.strip()}", "changed": True}
    if m and m.group(1) not in ("python", "py"):
        return {"source": source, "changed": False, "message": f"%{m.group(1)} cells are not formatted"}
    try:
        import black
    except ImportError:
        return {"source": source, "changed": False, "message": "Install black: pip install black"}
    header = ""
    body = source
    if m:
        header, _, body = source.partition("\n")
        header += "\n"
    # protect IPython-only lines (!cmd, %magic) from Black
    lines = body.split("\n")
    marks = {}
    for i, ln in enumerate(lines):
        if re.match(r"^\s*[!%]", ln):
            key = f"__DB_MAGIC_{i}__ = 0"
            marks[key] = ln
            lines[i] = re.match(r"^\s*", ln).group(0) + key
    try:
        pretty = black.format_str("\n".join(lines), mode=black.Mode(line_length=120))
    except Exception as e:  # noqa: BLE001
        return {"source": source, "changed": False, "message": f"Cannot format: {str(e).splitlines()[0][:200]}"}
    for key, ln in marks.items():
        pretty = re.sub(rf"^\s*{re.escape(key)}$", ln, pretty, flags=re.M)
    pretty = header + pretty.rstrip("\n")
    return {"source": pretty, "changed": pretty != source}
