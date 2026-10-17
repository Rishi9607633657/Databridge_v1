"""Fast query engine for dashboards and the AI builder: DuckDB reading the Delta / Parquet table folders directly.

Why: every dashboard widget, filter and AI-profiling query used to queue on ONE Spark kernel (seconds each, serial).
DuckDB runs in-process, in parallel threads, and answers typical dashboard queries in milliseconds.

How: table names in the SQL (schema.table / table) are resolved to folders in the Spark warehouse
(<warehouse>/<schema>.db/<table>, default schema = <warehouse>/<table>). Delta tables are read with delta-rs
(`deltalake`, respects the Delta log), plain Parquet folders with read_parquet. Anything DuckDB can't do — unknown
table location (ADLS/external), Spark-only SQL — raises NotFast and the caller falls back to Spark.
Setting DASH_ENGINE = auto (default) | duckdb | spark."""
import datetime as _dt
import decimal
import math
import os
import re
import threading
import time
from pathlib import Path

from .settings import DATA_ROOT, env


class NotFast(Exception):
    """This query must run on Spark."""


_TBL = re.compile(r"\b(?:from|join)\s+((?:`[^`]+`|[A-Za-z_][\w]*)(?:\s*\.\s*(?:`[^`]+`|[A-Za-z_][\w]*))?)", re.I)
_DS_CACHE = {}           # path -> (stamp, dataset)
_lock = threading.Lock()
_avail = None


def mode():
    m = (env("DASH_ENGINE", "auto") or "auto").lower()
    return m if m in ("auto", "duckdb", "spark") else "auto"


def available():
    global _avail
    if _avail is None:
        try:
            import duckdb  # noqa: F401
            _avail = True
        except ImportError:
            _avail = False
    return _avail


def enabled():
    return mode() != "spark" and available()


def warehouse() -> Path:
    w = env("SPARK_WAREHOUSE")
    if w:
        return Path(w)
    root = Path(os.getenv("STRATUM_ROOT") or DATA_ROOT)
    return root / "workspace" / "spark-warehouse"


def _unq(x):
    return x.strip().strip("`").strip()


def _location(schema, table):
    wh = warehouse()
    schema, table = (schema or "default").lower(), table.lower()
    cands = [wh / table] if schema == "default" else []
    cands.append(wh / f"{schema}.db" / table)
    for p in cands:
        if p.is_dir():
            return p
    return None


def _stamp(p: Path):
    log = p / "_delta_log"
    try:
        if log.is_dir():
            names = [e.name for e in os.scandir(log) if e.name.endswith(".json")]
            return ("delta", max(names) if names else "", len(names))
        files = [e for e in os.scandir(p) if e.name.endswith(".parquet")]
        return ("parquet", len(files), max((e.stat().st_mtime for e in files), default=0))
    except OSError:
        return None


def _dataset(p: Path):
    """pyarrow dataset (Delta via delta-rs) or a read_parquet SQL fragment, cached until the table changes."""
    st = _stamp(p)
    if st is None:
        raise NotFast(f"cannot read {p}")
    with _lock:
        hit = _DS_CACHE.get(str(p))
        if hit and hit[0] == st:
            return hit[1]
    if st[0] == "delta":
        try:
            from deltalake import DeltaTable
        except ImportError:
            raise NotFast("deltalake not installed")
        try:
            ds = ("arrow", DeltaTable(str(p)).to_pyarrow_dataset())
        except Exception as e:  # noqa: BLE001 - e.g. Delta features delta-rs can't read yet
            raise NotFast(f"delta-rs: {e}")
    else:
        glob = (p.as_posix().rstrip("/") + "/**/*.parquet").replace("'", "''")
        ds = ("sql", f"read_parquet('{glob}', hive_partitioning = true, union_by_name = true)")
    with _lock:
        _DS_CACHE[str(p)] = (st, ds)
    return ds


def _to_duck_sql(sql):
    """Spark SQL -> DuckDB: backticks -> double quotes (outside string literals), common function names."""
    out, i, n = [], 0, len(sql)
    while i < n:
        ch = sql[i]
        if ch == "'":
            j = i + 1
            while j < n:
                if sql[j] == "\\":
                    j += 2
                    continue
                if sql[j] == "'":
                    if j + 1 < n and sql[j + 1] == "'":
                        j += 2
                        continue
                    break
                j += 1
            out.append(sql[i:j + 1])
            i = j + 1
        elif ch == "`":
            j = sql.find("`", i + 1)
            j = n if j < 0 else j
            out.append('"' + sql[i + 1:j].replace('"', '""') + '"')
            i = j + 1
        else:
            out.append(ch)
            i += 1
    s = "".join(out)
    s = re.sub(r"\bnvl\s*\(", "coalesce(", s, flags=re.I)
    s = re.sub(r"\bifnull\s*\(", "coalesce(", s, flags=re.I)
    s = re.sub(r"\bsize\s*\(", "len(", s, flags=re.I)
    s = re.sub(r"\bpercentile_approx\s*\(", "approx_quantile(", s, flags=re.I)
    s = re.sub(r"\bcollect_list\s*\(", "list(", s, flags=re.I)
    return s.rstrip().rstrip(";")


def _clean(v):
    if v is None:
        return None
    if isinstance(v, float):
        return None if math.isnan(v) or math.isinf(v) else v
    if isinstance(v, decimal.Decimal):
        f = float(v)
        return int(f) if f.is_integer() and abs(f) < 2**53 else f
    if isinstance(v, _dt.datetime):
        return v.isoformat(sep=" ")
    if isinstance(v, (_dt.date, _dt.time)):
        return v.isoformat()
    if isinstance(v, (bytes, bytearray)):
        return v.hex()
    if isinstance(v, (list, tuple)):
        return [_clean(x) for x in v]
    if isinstance(v, dict):
        return {str(k): _clean(x) for k, x in v.items()}
    return v


_SPARK_TYPES = {"varchar": "string", "integer": "int", "bigint": "bigint", "double": "double", "float": "float", "boolean": "boolean",
                "date": "date", "smallint": "smallint", "tinyint": "tinyint", "hugeint": "bigint", "real": "float"}


def _spark_type(t):
    t = str(t).lower()
    if t.startswith("timestamp"):
        return "timestamp"
    if t.startswith("decimal"):
        return t
    return _SPARK_TYPES.get(t, t)


def run(sql: str, limit: int | None = None):
    """Run Spark-flavoured SQL on DuckDB. Returns {columns, rows, truncated, elapsed, engine} or raises NotFast."""
    if not enabled():
        raise NotFast("DuckDB engine disabled")
    import duckdb
    t0 = time.time()
    refs = {}
    ctes = {x.lower() for x in re.findall(r"(?:\bwith|,)\s*([A-Za-z_]\w*)\s+as\s*\(", sql, re.I)}
    for m in _TBL.finditer(sql):
        raw = m.group(1)
        parts = [_unq(x) for x in raw.split(".")]
        if len(parts) == 1 and parts[0].lower() in ("select", "values", "lateral", "unnest", "range", "_src", "_q", "_c"):
            continue
        if len(parts) == 1 and parts[0].lower() in ctes:
            continue
        schema, table = (parts[0], parts[1]) if len(parts) == 2 else ("default", parts[0])
        loc = _location(schema, table)
        if loc is None:
            if re.match(r"^\(", sql[m.end(1):].lstrip()):
                continue
            raise NotFast(f"table {schema}.{table} is not a local warehouse table")
        refs[(schema.lower(), table.lower())] = loc
    is_describe = re.match(r"^\s*describe\s+(table\s+)?", sql, re.I)
    if not refs and not is_describe:
        raise NotFast("no warehouse tables in the query")
    con = duckdb.connect()
    try:
        con.execute("SET threads TO " + str(max(2, (os.cpu_count() or 4))))
        for k, ((schema, table), loc) in enumerate(refs.items()):
            kind, obj = _dataset(loc)
            con.execute(f'CREATE SCHEMA IF NOT EXISTS "{schema}"')
            if kind == "arrow":
                con.register(f"__ds{k}", obj)
                src = f"__ds{k}"
            else:
                src = obj
            con.execute(f'CREATE OR REPLACE VIEW "{schema}"."{table}" AS SELECT * FROM {src}')
            if schema == "default":
                con.execute(f'CREATE OR REPLACE VIEW main."{table}" AS SELECT * FROM "{schema}"."{table}"')
        if is_describe:
            target = re.sub(r"^\s*describe\s+(table\s+)?", "", sql, flags=re.I).strip().rstrip(";")
            parts = [_unq(x) for x in target.split(".")]
            schema, table = (parts[0], parts[1]) if len(parts) == 2 else ("default", parts[0])
            loc = _location(schema, table)
            if loc is None:
                raise NotFast("describe of a non-local table")
            kind, obj = _dataset(loc)
            if kind == "arrow":
                con.register("__d", obj)
                rel = con.sql("SELECT * FROM __d LIMIT 0")
            else:
                rel = con.sql(f"SELECT * FROM {obj} LIMIT 0")
            rows = [[c, _spark_type(t), None] for c, t in zip(rel.columns, rel.types)]
            return {"columns": ["col_name", "data_type", "comment"], "rows": rows, "truncated": False,
                    "elapsed": round(time.time() - t0, 3), "engine": "duckdb"}
        try:
            cur = con.execute(_to_duck_sql(sql))
        except duckdb.Error as e:
            raise NotFast(f"duckdb: {str(e).splitlines()[0][:200]}")
        cols = [d[0] for d in cur.description] if cur.description else []
        # unaliased expressions are named differently by DuckDB and Spark; widgets reference Spark's names,
        # so only accept names that are identical in both engines
        fixed = []
        for c in cols:
            if "(" not in c:
                fixed.append(c)
            elif c == "count_star()":
                fixed.append("count(1)")
            elif re.fullmatch(r"(sum|avg|min|max|count)\(([A-Za-z_]\w*)\)", c):
                fixed.append(c)
            else:
                raise NotFast(f"unaliased expression column {c!r} — Spark names it differently")
        cols = fixed
        lim = int(limit or 100000)
        rows = cur.fetchmany(lim + 1)
        truncated = len(rows) > lim
        rows = [[_clean(v) for v in r] for r in rows[:lim]]
        return {"columns": cols, "rows": rows, "truncated": truncated, "elapsed": round(time.time() - t0, 3), "engine": "duckdb"}
    finally:
        con.close()


async def query(sql, limit, spark_call):
    """Try DuckDB (in a worker thread, parallel); fall back to Spark (`spark_call()` coroutine factory)."""
    import asyncio
    import logging
    if enabled():
        try:
            return await asyncio.to_thread(run, sql, limit)
        except NotFast as e:
            logging.getLogger("databridge").info("fast SQL -> Spark (%s)", e)
            if mode() == "duckdb":
                from fastapi import HTTPException
                raise HTTPException(400, f"DuckDB engine can't run this query: {e}. Set Dashboard engine = auto to fall back to Spark.")
    res = await spark_call()
    return {**res, "engine": "spark"}
