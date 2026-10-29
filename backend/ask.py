"""Ask data: questions in plain English, answered with a SQL query over the catalog.

1. Pick the tables most likely to answer the question (names, columns and comments from the catalog — only tables the
   person may read).
2. The AI model configured for Dora writes one Spark SQL SELECT and suggests a chart.
3. DataBridge checks it is read-only, runs it as that person (Governance masks / row filters apply), and if the query
   fails, gives the error back to the model once to fix it.
The SQL is always shown, so answers can be checked, opened in the SQL editor, or turned into an alert."""
import asyncio
import json
import re
import time

from fastapi import HTTPException

from . import assistant, catalog, dash_ai, fastsql, governance
from .jobs import store
from .kernels import run_sql

ASK_KERNEL = "__ask__"
store.db.executescript("""
CREATE TABLE IF NOT EXISTS ask_log (id INTEGER PRIMARY KEY AUTOINCREMENT, time REAL, user TEXT, question TEXT, sql TEXT, ok INTEGER,
  rows INTEGER, error TEXT, elapsed REAL);
""")
store.db.commit()
_meta_cache = {}
STOP = set("the a an of in on for to by and or with from what which who how many much is are was were show me list give top per each all "
           "total sum average avg count number this last year month week day days today yesterday between than more less over under do does".split())

SYSTEM = """You answer business questions by writing ONE Spark SQL query for DataBridge (Spark 3.5, Delta Lake).
Return ONLY a JSON object, no markdown:
{"sql": "...", "answer": "one short sentence describing what the result shows", "chart": {"type": "bar|line|pie|number|table", "x": "column or null", "y": "numeric column or null"}}
Rules:
- Use ONLY the tables and columns listed. Write table names as schema.table. Quote odd column names with backticks.
- One SELECT (WITH … SELECT allowed). Never INSERT, UPDATE, DELETE, CREATE, DROP or MERGE.
- Give every computed column a short snake_case alias.
- Aggregate when the question asks for totals, trends or rankings; ORDER BY the main measure for rankings; LIMIT 1000 unless asked otherwise.
- Dates: use date_trunc('month', col) / CAST(col AS DATE); current_date() for "today".
- chart: "line" for trends over time (x = date column), "bar" for comparing categories, "pie" for shares of a few categories,
  "number" for a single value, "table" otherwise.
- If the question cannot be answered from these tables, return {"sql": null, "answer": "what is missing"}."""


def _tokens(text):
    return {w for w in re.findall(r"[a-z][a-z0-9]+", (text or "").lower()) if w not in STOP and len(w) > 2}


async def _table_meta(fq):
    hit = _meta_cache.get(fq)
    if hit and time.time() - hit[0] < 300:
        return hit[1]
    cols = await dash_ai._columns(fq)
    comments, tcomment = {}, ""
    try:
        db, tb = fq.split(".", 1)
        t = await asyncio.wait_for(catalog.table(db, tb), 6)
        comments = {c["name"]: c.get("comment") or "" for c in t.get("columns") or []}
        tcomment = (t.get("properties") or {}).get("comment", "")
    except Exception:  # noqa: BLE001
        pass
    meta = {"table": fq, "comment": tcomment, "columns": [{"name": c, "type": ty, "comment": comments.get(c, "")} for c, ty in cols]}
    _meta_cache[fq] = (time.time(), meta)
    return meta


async def visible_tables(user, scope=None):
    names = await dash_ai.list_tables()
    names = [n for n in names if governance.can(user, n)]
    if scope:
        sc = [s.lower() for s in scope]
        names = [n for n in names if n.lower() in sc or n.split(".")[0].lower() in sc]
    return names


async def pick(question, names, history, limit=6):
    q = _tokens(question + " " + " ".join(h.get("question", "") for h in (history or [])[-2:]))
    used = set()
    for h in (history or [])[-2:]:
        used |= {t for t in names if t.lower() in (h.get("sql") or "").lower()}
    scored = []
    for n in names:
        s = 0
        tn = _tokens(n.replace("_", " ").replace(".", " "))
        s += 5 * len(q & tn) + (6 if n in used else 0) + (3 if n.lower() in question.lower() else 0)
        try:
            meta = await asyncio.wait_for(_table_meta(n), 8) if len(names) <= 60 or s else None
        except Exception:  # noqa: BLE001
            meta = None
        if meta:
            ct = set()
            for c in meta["columns"]:
                ct |= _tokens(c["name"].replace("_", " ") + " " + c["comment"])
            s += 2 * len(q & ct) + len(q & _tokens(meta["comment"]))
        if n.startswith("gold."):
            s += 1
        scored.append((s, n))
    scored.sort(key=lambda x: (-x[0], x[1]))
    best = [n for s, n in scored if s > 0][:limit]
    return best or [n for _, n in scored[:3]]


def _context(metas):
    lines = []
    for m in metas:
        lines.append(f"TABLE {m['table']}" + (f" -- {m['comment']}" if m["comment"] else ""))
        for c in m["columns"][:80]:
            lines.append(f"  {c['name']} {c['type']}" + (f" -- {c['comment']}" if c["comment"] else ""))
    return "\n".join(lines)


def _json(text):
    t = (text or "").strip()
    m = re.search(r"```(?:json)?\s*(\{.*\})\s*```", t, re.S)
    if m:
        t = m.group(1)
    else:
        a, b = t.find("{"), t.rfind("}")
        t = t[a:b + 1] if a >= 0 and b > a else t
    try:
        return json.loads(t)
    except ValueError:
        sql = re.search(r"```sql\s*(.*?)```", text or "", re.S)
        return {"sql": sql.group(1).strip() if sql else None, "answer": "", "chart": {"type": "table"}}


def _check_sql(sql):
    s = (sql or "").strip().rstrip(";")
    if not s:
        raise ValueError("no SQL")
    if len(governance.split_statements(s)) != 1 or governance.refs(s)[1] or not re.match(r"^\s*(select|with)\b", governance._blank(s), re.I):
        raise ValueError("The model wrote something other than a single SELECT; it was not run.")
    if not re.search(r"\blimit\s+\d+\s*$", s, re.I):
        s += "\nLIMIT 1000"
    return s


async def _run(sql):
    return await fastsql.query(sql, 1000, lambda: asyncio.wait_for(run_sql(sql, 1000, key=ASK_KERNEL, label="Ask data"), 600))


async def ask(question, user, history=None, scope=None):
    question = (question or "").strip()
    if not question:
        raise HTTPException(400, "Type a question")
    t0 = time.time()
    names = await visible_tables(user, scope)
    if not names:
        raise HTTPException(400, "There are no tables you can query yet.")
    chosen = await pick(question, names, history)
    metas = [m for m in await asyncio.gather(*[_table_meta(n) for n in chosen], return_exceptions=True) if isinstance(m, dict)]
    msgs = [{"role": "system", "content": SYSTEM}, {"role": "user", "content": "Tables:\n" + _context(metas)}]
    for h in (history or [])[-3:]:
        if h.get("question") and h.get("sql"):
            msgs += [{"role": "user", "content": h["question"]}, {"role": "assistant", "content": json.dumps({"sql": h["sql"]})}]
    msgs.append({"role": "user", "content": question})
    try:
        plan = _json(await assistant.complete(msgs, max_tokens=1500, temperature=0.1))
    except RuntimeError as e:
        raise HTTPException(503, f"The AI model is not reachable ({e}). Set it up in Admin › Settings › Dora (AI assistant).")
    except Exception as e:  # noqa: BLE001
        raise HTTPException(503, f"The AI model is not reachable: {e}. Set it up in Admin › Settings › Dora (AI assistant).")
    if not plan.get("sql"):
        _log(user, question, None, False, 0, plan.get("answer") or "not answerable", t0)
        return {"question": question, "sql": None, "answer": plan.get("answer") or "These tables don't contain what's needed to answer that.",
                "tables": chosen, "columns": [], "rows": [], "chart": None, "elapsed": round(time.time() - t0, 2)}
    err = None
    for attempt in range(2):
        try:
            sql = _check_sql(plan.get("sql"))
            res = await _run(sql)
            _log(user, question, sql, True, len(res["rows"]), None, t0)
            return {"question": question, "sql": sql, "answer": plan.get("answer") or "", "chart": plan.get("chart") or {"type": "table"},
                    "tables": sorted(set(governance.refs(sql)[0])) or chosen, "columns": res["columns"], "rows": res["rows"], "truncated": res.get("truncated"),
                    "engine": res.get("engine"), "elapsed": round(time.time() - t0, 2), "fixed": attempt > 0}
        except HTTPException as e:
            if e.status_code == 403:
                raise
            err = str(e.detail)
        except Exception as e:  # noqa: BLE001
            err = str(getattr(e, "evalue", None) or e)
        if attempt == 0:
            msgs += [{"role": "assistant", "content": json.dumps({"sql": plan.get("sql")})},
                     {"role": "user", "content": f"That query failed: {err[:600]}\nReturn the corrected JSON."}]
            try:
                plan = _json(await assistant.complete(msgs, max_tokens=1500, temperature=0.0))
            except Exception:  # noqa: BLE001
                break
            if not plan.get("sql"):
                break
    _log(user, question, plan.get("sql"), False, 0, err, t0)
    return {"question": question, "sql": plan.get("sql"), "answer": plan.get("answer") or "", "error": err, "tables": chosen,
            "columns": [], "rows": [], "chart": None, "elapsed": round(time.time() - t0, 2)}


def _log(user, q, sql, ok, rows, err, t0):
    store.x("INSERT INTO ask_log (time, user, question, sql, ok, rows, error, elapsed) VALUES (?,?,?,?,?,?,?,?)",
            (time.time(), (user or {}).get("username") or "", q[:1000], sql, 1 if ok else 0, rows, (err or "")[:500], round(time.time() - t0, 2)))


def recent(user, limit=20):
    return store.q("SELECT time, question, ok FROM ask_log WHERE user=? ORDER BY id DESC LIMIT ?", ((user or {}).get("username") or "", limit))


async def suggestions(user):
    names = await visible_tables(user)
    out = []
    for n in names[:40]:
        try:
            m = await asyncio.wait_for(_table_meta(n), 5)
        except Exception:  # noqa: BLE001
            continue
        cols = m["columns"]
        num = next((c["name"] for c in cols if re.match(r"(double|float|decimal|int|bigint|long)", c["type"]) and not c["name"].endswith("id")), None)
        cat = next((c["name"] for c in cols if c["type"].startswith("string") and not c["name"].endswith("id")), None)
        date = next((c["name"] for c in cols if c["type"].startswith(("date", "timestamp"))), None)
        label = n.split(".")[1].replace("_", " ")
        nm = num.replace("_", " ") if num else ""
        if num and date:
            out.append(f"Monthly {nm} in {label}")
        if num and cat:
            out.append(f"Top 10 in {label} by {nm}" if cat.lower() in ("name", "title") else f"{nm.capitalize()} by {cat.replace('_', ' ')} in {label}")
        if len(out) >= 6:
            break
    return out[:6] or [f"How many rows are in {names[0]}?"] if names else []
