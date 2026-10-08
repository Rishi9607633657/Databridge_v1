"""Delta Lake maintenance: details, history & time travel, OPTIMIZE / Z-ORDER, VACUUM (dry run first),
RESTORE, data-skipping statistics, liquid clustering and table properties. Uses standard Delta Lake SQL."""
import json
import re
from datetime import datetime

from fastapi import HTTPException

from .catalog import q
from .kernels import SqlError, run_sql

IDENT = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")
PROPS = {   # editable table properties: name -> (label, kind)
    "delta.logRetentionDuration": ("How long table history is kept", "interval"),
    "delta.deletedFileRetentionDuration": ("How long removed files are kept (VACUUM safety window)", "interval"),
    "delta.enableChangeDataFeed": ("Change data feed (row-level change history)", "bool"),
    "delta.checkpointInterval": ("Checkpoint every N commits", "int"),
    "delta.dataSkippingNumIndexedCols": ("Columns with data-skipping statistics", "int"),
    "delta.appendOnly": ("Append-only (blocks UPDATE/DELETE)", "bool"),
}


def _fq(db, name):
    if not IDENT.match(db or "") or not IDENT.match(name or ""):
        raise HTTPException(400, "Invalid table name")
    return f"{q(db)}.{q(name)}"


def _col(c):
    if not IDENT.match(str(c)):
        raise HTTPException(400, f"Invalid column name: {c}")
    return q(c)


def _int(v, lo, hi, what):
    try:
        n = int(v)
    except (TypeError, ValueError):
        raise HTTPException(400, f"{what} must be a whole number")
    if not lo <= n <= hi:
        raise HTTPException(400, f"{what} must be between {lo} and {hi}")
    return n


def _ts(v):
    s = str(v or "").strip()
    try:
        datetime.fromisoformat(s.replace("Z", ""))
    except ValueError:
        raise HTTPException(400, "Timestamp must look like 2026-09-30 14:00:00")
    return s


def _where(pred):
    """OPTIMIZE ... WHERE accepts partition predicates only; keep it to simple comparisons."""
    p = str(pred or "").strip()
    if not p:
        return ""
    if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*\s*(=|>=|<=|>|<|!=)\s*('[^';]*'|-?\d+(\.\d+)?)(\s+(AND|and)\s+[A-Za-z_][A-Za-z0-9_]*\s*(=|>=|<=|>|<|!=)\s*('[^';]*'|-?\d+(\.\d+)?))*", p):
        raise HTTPException(400, "Partition filter must be simple comparisons like  date >= '2026-09-01' AND region = 'West'")
    return f" WHERE {p}"


def build_sql(fq, body):
    a = body.get("action")
    if a == "optimize":
        cols = [_col(c) for c in (body.get("zorder") or [])][:4]
        return f"OPTIMIZE {fq}{_where(body.get('where'))}" + (f" ZORDER BY ({', '.join(cols)})" if cols else "")
    if a in ("vacuum", "vacuum_dry"):
        hours = _int(body.get("hours", 168), 0, 24 * 365 * 5, "Retention hours")
        return f"VACUUM {fq} RETAIN {hours} HOURS" + (" DRY RUN" if a == "vacuum_dry" else "")
    if a == "restore":
        if body.get("version") is not None and body.get("version") != "":
            return f"RESTORE TABLE {fq} TO VERSION AS OF {_int(body['version'], 0, 10**9, 'Version')}"
        return f"RESTORE TABLE {fq} TO TIMESTAMP AS OF '{_ts(body.get('timestamp'))}'"
    if a == "stats":
        return f"ANALYZE TABLE {fq} COMPUTE DELTA STATISTICS"
    if a == "cluster":
        cols = [_col(c) for c in (body.get("columns") or [])][:4]
        return f"ALTER TABLE {fq} CLUSTER BY ({', '.join(cols)})" if cols else f"ALTER TABLE {fq} CLUSTER BY NONE"
    if a == "props":
        sets = []
        for k, v in (body.get("properties") or {}).items():
            if k not in PROPS:
                raise HTTPException(400, f"Property {k} cannot be changed here")
            kind = PROPS[k][1]
            if kind == "bool":
                v = "true" if str(v).lower() in ("true", "1", "yes", "on") else "false"
            elif kind == "int":
                v = str(_int(v, 1, 100000, PROPS[k][0]))
            else:
                if not re.fullmatch(r"interval\s+\d+\s+(hours?|days?|weeks?)", str(v).strip(), re.I):
                    raise HTTPException(400, f"{PROPS[k][0]}: use a value like 'interval 30 days'")
                v = str(v).strip()
            sets.append(f"'{k}' = '{v}'")
        if not sets:
            raise HTTPException(400, "No properties to change")
        return f"ALTER TABLE {fq} SET TBLPROPERTIES ({', '.join(sets)})"
    if a == "convert":
        return f"CONVERT TO DELTA {fq}"
    raise HTTPException(400, f"Unknown action: {a}")


async def _run(sql, limit=1000):
    try:
        return await run_sql(sql, limit)
    except SqlError as e:
        lines = [ln.strip() for ln in str(e.evalue).splitlines() if ln.strip() and not ln.strip().startswith(("==", "-"))]
        msg = (lines[0] if lines else str(e.evalue).strip())[:600]          # first real line (ParseException starts with a blank one)
        parse = "Parse" in str(e.ename) or "PARSE_SYNTAX" in msg
        hint = ""
        if "retentionDurationCheck" in msg or "retention" in msg.lower() and "safe" in msg.lower():
            hint = " Delta blocks retention below 168 hours unless spark.databricks.delta.retentionDurationCheck.enabled is false — keep 168+ unless you are sure no job reads old versions."
        elif "CLUSTER BY" in sql and (parse or "not supported" in msg.lower()):
            hint = " Changing liquid clustering on an existing table needs a newer Delta Lake (3.2+) — or create the table with CLUSTER BY."
        elif "COMPUTE DELTA STATISTICS" in sql and parse:
            hint = " Your Delta Lake version doesn't support recomputing statistics (newer versions do). Running OPTIMIZE also rewrites files with fresh statistics."
        elif "is not a Delta table" in msg or "DELTA_" in msg and "not a Delta" in msg:
            hint = " This table is not in Delta format — use Convert to Delta first."
        raise HTTPException(400, f"{e.ename}: {msg}{hint}")


async def _supports(sql):
    """True if Spark/Delta can parse and plan this command — checked with EXPLAIN, so nothing runs."""
    try:
        await run_sql(f"EXPLAIN {sql}", 5)
        return True, ""
    except SqlError as e:
        txt = str(e.evalue)
        if "Parse" in str(e.ename) or "PARSE_SYNTAX" in txt or "Syntax error" in txt:
            return False, "not supported by this Delta Lake version"
        return True, ""                                    # it parsed; any other error is about this table, not the syntax


async def capabilities(fq, cols):
    first = next((c for c in cols if IDENT.match(c)), None)
    stats, _ = await _supports(f"ANALYZE TABLE {fq} COMPUTE DELTA STATISTICS")
    alter, _ = await _supports(f"ALTER TABLE {fq} CLUSTER BY ({q(first)})") if first else (False, "")
    return {"stats": stats, "alterCluster": alter}


async def detail(db, name):
    fq = _fq(db, name)
    res = await _run(f"DESCRIBE DETAIL {fq}", 1)
    row = dict(zip(res["columns"], res["rows"][0])) if res["rows"] else {}
    for k in ("properties",):
        if isinstance(row.get(k), str):
            try:
                row[k] = json.loads(row[k])
            except ValueError:
                pass
    files, size = row.get("numFiles") or 0, row.get("sizeInBytes") or 0
    advice = []
    if files and size / max(files, 1) < 32 * 1024 * 1024 and files >= 50:
        advice.append(f"{files:,} files averaging {size / max(files, 1) / 1024 / 1024:.1f} MB — many small files slow queries. Run OPTIMIZE.")
    try:
        cols_res = await run_sql(f"SELECT * FROM {fq} LIMIT 0", 0)
        cols = cols_res["columns"]
    except SqlError:
        cols = []
    caps = await capabilities(fq, cols)
    return {"detail": row, "advice": advice, "capabilities": caps, "editable": {k: {"label": v[0], "kind": v[1]} for k, v in PROPS.items()}}


async def history(db, name, limit=100):
    fq = _fq(db, name)
    res = await _run(f"DESCRIBE HISTORY {fq} LIMIT {int(limit)}", limit)
    out = []
    for r in res["rows"]:
        d = dict(zip(res["columns"], r))
        for k in ("operationMetrics", "operationParameters"):
            if isinstance(d.get(k), str):
                try:
                    d[k] = json.loads(d[k])
                except ValueError:
                    pass
        out.append({k: d.get(k) for k in ("version", "timestamp", "userName", "operation", "operationParameters", "operationMetrics", "isBlindAppend", "readVersion")})
    return out


async def version_rows(db, name, version, limit=1000):
    fq = _fq(db, name)
    v = _int(version, 0, 10**9, "Version")
    return await _run(f"SELECT * FROM {fq} VERSION AS OF {v} LIMIT {int(limit)}", limit)


async def compare(db, name, version):
    """How the current table differs from an older version (row counts)."""
    fq = _fq(db, name)
    v = _int(version, 0, 10**9, "Version")
    sql = (f"SELECT (SELECT COUNT(*) FROM {fq}) AS rows_now, (SELECT COUNT(*) FROM {fq} VERSION AS OF {v}) AS rows_then, "
           f"(SELECT COUNT(*) FROM (SELECT * FROM {fq} EXCEPT ALL SELECT * FROM {fq} VERSION AS OF {v})) AS rows_added, "
           f"(SELECT COUNT(*) FROM (SELECT * FROM {fq} VERSION AS OF {v} EXCEPT ALL SELECT * FROM {fq})) AS rows_removed")
    res = await _run(sql, 1)
    return dict(zip(res["columns"], res["rows"][0])) if res["rows"] else {}


async def action(db, name, body):
    fq = _fq(db, name)
    sql = build_sql(fq, body)
    if body.get("preview_sql"):
        return {"sql": sql}
    res = await _run(sql, 5000)
    return {"sql": sql, "columns": res["columns"], "rows": res["rows"], "elapsed": res.get("elapsed")}
