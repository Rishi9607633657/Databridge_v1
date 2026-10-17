"""DataBridge AI Agent — an LLM that explores data and builds/maintains pipelines with DataBridge's own tools.

Loop: task -> model picks a tool -> DataBridge runs it -> result back to the model -> ... -> final answer.
Read-only tools run immediately. Write tools (create a table, run a sync) PAUSE the run until a person approves.
Every step is saved (audit trail) in .stratum/agent_runs/<id>.json.

Model: any OpenAI-compatible endpoint with tool calling. Uses AGENT_* settings, falling back to Dora's (DORA_*)."""
import asyncio
import fnmatch
import json
import re
import time
import uuid

import httpx
from fastapi import HTTPException

from . import catalog, connectors, fastsql
from .kernels import SqlError, run_sql
from .settings import DATA_ROOT, env

RUNS = DATA_ROOT / ".stratum" / "agent_runs"
MAX_STEPS = 30
READ_ONLY = re.compile(r"^\s*(select|with|show|describe|desc|explain)\b", re.I)
WRITE_WORDS = re.compile(r"\b(insert|merge|delete|update|drop|create|alter|truncate|overwrite|vacuum|restore)\b", re.I)


def _read_only(q):
    return bool(READ_ONLY.match(q or "")) and not WRITE_WORDS.search(re.sub(r"'[^']*'", "''", q or ""))
_TASKS = {}            # run id -> asyncio.Task
_LOCKS = {}

SYSTEM = """You are DataBridge Agent, a senior data engineer working inside DataBridge (Spark SQL 3.5, Delta Lake, medallion architecture).
Bronze = raw source schemas (src_*), Silver = typed, cleaned, deduplicated (silver_<domain>), Gold = business aggregates (gold_<domain>).

How to work:
- Explore before you write: list schemas/tables, describe, sample. Never guess column names.
- Test every SELECT with run_sql (small LIMIT) before create_table. Fix errors yourself and retry.
- Prefer explicit casts, trimmed strings, deduplication with ROW_NUMBER() over a business key ordered by a modified/updated time.
- After creating a table, run quality_check on its key columns and report row count, null keys and duplicates.
- create_table and run_sync need a person's approval; explain briefly why before calling them.
- Writes are only allowed into schemas matching: {allowed}.
- Be concise. Finish with a short summary: what you built, the checks, and anything the user should review."""


def _cfg():
    return {"base": (env("AGENT_BASE_URL") or env("DORA_BASE_URL", "http://localhost:11434/v1") or "").rstrip("/"),
            "model": env("AGENT_MODEL") or env("DORA_MODEL", "qwen2.5-coder:7b"),
            "key": env("AGENT_API_KEY") or env("DORA_API_KEY", "")}


def _allowed():
    return [x.strip() for x in (env("AGENT_WRITE_SCHEMAS", "silver_*,gold_*,sandbox_*") or "").split(",") if x.strip()]


# ---------------- storage ----------------
def _path(rid):
    if not re.fullmatch(r"[a-f0-9]{12}", rid or ""):
        raise HTTPException(400, "Bad run id")
    return RUNS / f"{rid}.json"


def _load(rid):
    p = _path(rid)
    if not p.exists():
        raise HTTPException(404, "Run not found")
    return json.loads(p.read_text(encoding="utf-8"))


def _save(run):
    RUNS.mkdir(parents=True, exist_ok=True)
    run["updated"] = time.time()
    p = _path(run["id"])
    tmp = p.with_suffix(".tmp")
    tmp.write_text(json.dumps(run, default=str), encoding="utf-8")
    tmp.replace(p)


def _public(run):
    r = {k: v for k, v in run.items() if k != "messages"}
    r["running"] = run["id"] in _TASKS and not _TASKS[run["id"]].done()
    return r


def list_runs(user=None):
    out = []
    if RUNS.exists():
        for p in sorted(RUNS.glob("*.json"), key=lambda x: x.stat().st_mtime, reverse=True)[:100]:
            try:
                r = json.loads(p.read_text(encoding="utf-8"))
            except ValueError:
                continue
            out.append({k: r.get(k) for k in ("id", "title", "task", "status", "user", "created", "updated")} | {"steps": len(r.get("steps") or [])})
    return out


def get_run(rid):
    return _public(_load(rid))


# ---------------- tools ----------------
def _trim_rows(res, n=40):
    rows = res.get("rows") or []
    return {"columns": res.get("columns"), "rows": rows[:n], "rows_returned": len(rows), "engine": res.get("engine")}


async def _sql(query, limit=200):
    return await fastsql.query(query, limit, lambda: run_sql(query, limit))


async def t_list_schemas():
    dbs = await catalog.databases()
    return [d.get("name") if isinstance(d, dict) else d for d in dbs]


async def t_list_tables(schema):
    ts = await catalog.tables(schema)
    return [{"name": t.get("name"), "format": t.get("provider") or t.get("format")} if isinstance(t, dict) else t for t in ts][:300]


async def t_describe_table(schema, table):
    t = await catalog.table(schema, table)
    return {"columns": [{"name": c.get("name"), "type": c.get("type")} for c in t.get("columns", []) if not str(c.get("name", "")).startswith("#")],
            "format": t.get("provider"), "location": t.get("location")}


async def t_sample_table(schema, table):
    return _trim_rows(await _sql(f"SELECT * FROM `{schema}`.`{table}` LIMIT 10", 10), 10)


async def t_run_sql(query):
    if not _read_only(query):
        return {"error": "run_sql is read-only (SELECT/WITH/SHOW/DESCRIBE). Use create_table to write."}
    return _trim_rows(await _sql(query, 200))


async def t_quality_check(table, key_columns):
    if not re.fullmatch(r"[A-Za-z_]\w*\.[A-Za-z_]\w*", table or ""):
        return {"error": "table must be schema.table"}
    keys = [k for k in key_columns or [] if re.fullmatch(r"[A-Za-z_]\w*", k)]
    if not keys:
        return {"error": "give at least one key column"}
    nulls = " + ".join(f"SUM(CASE WHEN `{k}` IS NULL THEN 1 ELSE 0 END)" for k in keys)
    full = " AND ".join(f"`{k}` IS NOT NULL" for k in keys)
    q = (f"SELECT COUNT(*) AS row_count, {nulls} AS null_keys, "
         f"SUM(CASE WHEN {full} THEN 1 ELSE 0 END) - COUNT(DISTINCT {', '.join(f'`{k}`' for k in keys)}) AS duplicate_keys "
         f"FROM {table}")
    return _trim_rows(await _sql(q, 1), 1)


async def t_list_connections():
    return [{"id": c["id"], "name": c["name"], "type": c["type"]} for c in connectors.list_connections()]


async def t_list_syncs():
    return [{"id": s["id"], "name": s["name"], "connection": (s.get("connection") or {}).get("name"), "target_schema": s["target_schema"],
             "tables": [x["table"] for x in s["streams"]], "schedule": s.get("schedule"), "last_run": s.get("last_run")} for s in connectors.list_syncs()]


async def t_recent_failures():
    out = []
    for r in connectors.runs(None, 60):
        if r.get("status") in ("failed", "partial"):
            out.append({"sync": r.get("sync_name"), "started": r.get("started"), "error": r.get("error"),
                        "tables": [{"table": s["table"], "status": s["status"], "error": s.get("error")} for s in r.get("streams", []) if s.get("status") == "failed"]})
    return out[:15]


async def w_create_table(target, select_sql):
    schema = target.split(".")[0]
    await run_sql(f"CREATE DATABASE IF NOT EXISTS `{schema}`", 1)
    t0 = time.time()
    await run_sql(f"CREATE OR REPLACE TABLE {target} USING DELTA AS {select_sql}", 1)
    cnt = await _sql(f"SELECT COUNT(*) AS n FROM {target}", 1)
    return {"created": target, "rows": (cnt.get("rows") or [[None]])[0][0], "seconds": round(time.time() - t0, 1)}


async def w_run_sync(sync_id):
    run = connectors.start_run(sync_id, "agent")
    for _ in range(600):                                   # wait up to 10 minutes for the sync to finish
        await asyncio.sleep(1)
        r = connectors.get_run(run["id"])
        if r.get("status") not in ("queued", "running"):
            return {"status": r["status"], "rows": r.get("rows"), "error": r.get("error"),
                    "tables": [{"table": s["table"], "status": s["status"], "rows": s.get("rows"), "error": s.get("error")} for s in r["streams"]]}
    return {"status": "still running", "run_id": run["id"]}


def _check_create(args):
    target, sel = args.get("target") or "", args.get("select_sql") or ""
    if not re.fullmatch(r"[A-Za-z_]\w*\.[A-Za-z_]\w*", target):
        return "target must be schema.table"
    if not _read_only(sel):
        return "select_sql must be a SELECT (or WITH ... SELECT)"
    if ";" in sel.strip().rstrip(";"):
        return "only one statement is allowed"
    schema = target.split(".")[0].lower()
    if not any(fnmatch.fnmatch(schema, p.lower()) for p in _allowed()):
        return f"writes are only allowed into schemas matching {', '.join(_allowed())}"
    return None


TOOLS = {
    "list_schemas": (t_list_schemas, "List all schemas (databases) in the catalog", {}, False),
    "list_tables": (t_list_tables, "List tables in a schema", {"schema": "string"}, False),
    "describe_table": (t_describe_table, "Columns and types of a table", {"schema": "string", "table": "string"}, False),
    "sample_table": (t_sample_table, "First 10 rows of a table", {"schema": "string", "table": "string"}, False),
    "run_sql": (t_run_sql, "Run a read-only Spark SQL query (SELECT / WITH / SHOW / DESCRIBE). Always use LIMIT for row-level queries.", {"query": "string"}, False),
    "quality_check": (t_quality_check, "Row count, null keys and duplicate keys of a table (schema.table)", {"table": "string", "key_columns": "array"}, False),
    "list_connections": (t_list_connections, "List Data Hub connections (sources)", {}, False),
    "list_syncs": (t_list_syncs, "List Data Hub syncs with schedule and last run", {}, False),
    "recent_failures": (t_recent_failures, "Recent failed sync runs with their error messages", {}, False),
    "create_table": (w_create_table, "Create or replace a Delta table (schema.table) from a tested SELECT. Needs approval.", {"target": "string", "select_sql": "string"}, True),
    "run_sync": (w_run_sync, "Run a Data Hub sync now and wait for the result. Needs approval.", {"sync_id": "string"}, True),
}


def _tool_defs():
    defs = []
    for name, (_, desc, props, _) in TOOLS.items():
        p = {k: ({"type": "array", "items": {"type": "string"}} if t == "array" else {"type": t}) for k, t in props.items()}
        defs.append({"type": "function", "function": {"name": name, "description": desc, "parameters": {"type": "object", "properties": p, "required": list(props)}}})
    return defs


# ---------------- model ----------------
def _wire(messages):
    """Messages in the strictest common OpenAI shape. Ollama's gpt-oss (harmony) template needs every tool
    result to carry the tool's name ("Tools should have a name!"); some servers reject null content."""
    names, out = {}, []
    for m in messages:
        m = dict(m)
        if m.get("role") == "assistant" and m.get("tool_calls"):
            calls = []
            for c in m["tool_calls"]:
                fn = c.get("function") or {}
                names[c.get("id")] = fn.get("name")
                calls.append({"id": c.get("id"), "type": "function",
                              "function": {"name": fn.get("name"), "arguments": fn.get("arguments") or "{}"}})
            m["tool_calls"] = calls
            m["content"] = m.get("content") or ""
        elif m.get("role") == "tool":
            m["name"] = m.get("name") or names.get(m.get("tool_call_id")) or "tool"
        if m.get("content") is None:
            m["content"] = ""
        out.append(m)
    return out


def _norm_calls(calls):
    """Ids and string arguments for every tool call (some local servers omit ids or send arguments as objects)."""
    out = []
    for c in calls or []:
        fn = c.get("function") or {}
        if not fn.get("name"):
            continue
        args = fn.get("arguments")
        if not isinstance(args, str):
            args = json.dumps(args or {})
        out.append({"id": c.get("id") or "call_" + uuid.uuid4().hex[:10], "type": "function",
                    "function": {"name": fn["name"], "arguments": args}})
    return out


async def _chat(messages):
    c = _cfg()
    if not c["base"]:
        raise HTTPException(503, "No AI model configured. Set Dora (AI) in Admin › Settings.")
    body = {"model": c["model"], "messages": _wire(messages), "tools": _tool_defs(), "tool_choice": "auto", "temperature": 0.1}
    headers = {"Authorization": f"Bearer {c['key']}"} if c["key"] else {}
    async with httpx.AsyncClient(timeout=httpx.Timeout(240, connect=10)) as cl:
        for attempt in range(3):
            r = await cl.post(f"{c['base']}/chat/completions", json=body, headers=headers)
            if r.status_code == 429 and attempt < 2:             # free tiers rate-limit: back off and retry
                await asyncio.sleep(6 * (attempt + 1))
                continue
            break
    if r.status_code >= 400:
        raise RuntimeError(f"AI model error {r.status_code}: {r.text[:400]}")
    msg = r.json()["choices"][0]["message"]
    msg["tool_calls"] = _norm_calls(msg.get("tool_calls"))
    if not msg["tool_calls"]:
        msg.pop("tool_calls")
    return msg


def _step(run, kind, **kw):
    run["steps"].append({"kind": kind, "at": time.time(), **kw})


async def _exec_tool(run, call):
    name = call["function"]["name"]
    try:
        args = json.loads(call["function"].get("arguments") or "{}") or {}
    except ValueError:
        args = {}
    fn = TOOLS.get(name)
    if not fn:
        return {"error": f"unknown tool {name}"}
    try:
        return await asyncio.wait_for(fn[0](**args), 900)
    except TypeError as e:
        return {"error": f"bad arguments: {e}"}
    except SqlError as e:
        return {"error": f"{e.ename}: {str(e.evalue)[:1200]}"}
    except HTTPException as e:
        return {"error": str(e.detail)[:1200]}
    except asyncio.TimeoutError:
        return {"error": "tool timed out after 15 minutes"}
    except Exception as e:  # noqa: BLE001 - give the error to the model so it can recover
        return {"error": str(e)[:1200]}


def _tool_msg(call_id, result, name=None):
    m = {"role": "tool", "tool_call_id": call_id, "content": json.dumps(result, default=str)[:14000]}
    if name:
        m["name"] = name
    return m


async def _loop(rid):
    lock = _LOCKS.setdefault(rid, asyncio.Lock())
    async with lock:
        run = _load(rid)
        try:
            run["status"] = "running"
            _save(run)
            while True:
                # finish any queued tool calls from the last model message (after an approval)
                queue = run.get("queue") or []
                while queue:
                    call = queue[0]
                    name = call["function"]["name"]
                    try:
                        args = json.loads(call["function"].get("arguments") or "{}") or {}
                    except ValueError:
                        args = {}
                    if TOOLS.get(name, (None, None, None, False))[3]:          # write tool: needs a person
                        problem = _check_create(args) if name == "create_table" else None
                        if problem:
                            res = {"error": problem}
                            _step(run, "tool", name=name, args=args, result=res, error=True)
                            run["messages"].append(_tool_msg(call["id"], res, name))
                            queue.pop(0)
                            continue
                        if not call.get("_approved"):
                            run["status"] = "waiting"
                            run["pending"] = {"call_id": call["id"], "name": name, "args": args}
                            _step(run, "approval", name=name, args=args)
                            run["queue"] = queue
                            _save(run)
                            return
                    t0 = time.time()
                    res = await _exec_tool(run, call)
                    _step(run, "tool", name=name, args=args, result=res, error=isinstance(res, dict) and "error" in res, ms=int((time.time() - t0) * 1000))
                    run["messages"].append(_tool_msg(call["id"], res, name))
                    queue.pop(0)
                    run["queue"] = queue
                    _save(run)
                if run.get("status") == "stopping":
                    run["status"] = "stopped"
                    _save(run)
                    return
                if sum(1 for s in run["steps"] if s["kind"] == "tool") >= MAX_STEPS:
                    _step(run, "final", text=f"Stopped after {MAX_STEPS} tool steps. Ask me to continue if needed.")
                    run["status"] = "done"
                    _save(run)
                    return
                msg = await _chat(run["messages"])
                run["messages"].append({"role": "assistant", **{k: v for k, v in msg.items() if k in ("content", "tool_calls")}})
                calls = msg.get("tool_calls") or []
                text = (msg.get("content") or "").strip()
                if not calls:
                    _step(run, "final", text=text or "Done.")
                    run["status"] = "done"
                    _save(run)
                    return
                if text:
                    _step(run, "thought", text=text)
                run["queue"] = calls
                _save(run)
                if _load(rid).get("status") == "stopping":
                    run["status"] = "stopped"
                    _save(run)
                    return
        except Exception as e:  # noqa: BLE001
            run = _load(rid) if _path(rid).exists() else run
            _step(run, "error", text=str(getattr(e, "detail", None) or e)[:1500])
            run["status"] = "failed"
            _save(run)
        finally:
            _TASKS.pop(rid, None)


def _start(rid):
    t = _TASKS.get(rid)
    if t and not t.done():
        return
    _TASKS[rid] = asyncio.create_task(_loop(rid))


def create_run(task, user=None):
    task = (task or "").strip()
    if not task:
        raise HTTPException(400, "Describe what the agent should do")
    rid = uuid.uuid4().hex[:12]
    run = {"id": rid, "title": task[:80], "task": task, "user": user, "created": time.time(), "status": "queued", "steps": [], "queue": [],
           "messages": [{"role": "system", "content": SYSTEM.format(allowed=", ".join(_allowed()))}, {"role": "user", "content": task}]}
    _step(run, "user", text=task)
    _save(run)
    _start(rid)
    return _public(run)


def approve(rid, ok, note=None, user=None):
    run = _load(rid)
    if run.get("status") != "waiting" or not run.get("pending"):
        raise HTTPException(409, "Nothing is waiting for approval")
    p = run["pending"]
    queue = run.get("queue") or []
    if queue and queue[0]["id"] == p["call_id"]:
        if ok:
            queue[0]["_approved"] = True
            _step(run, "decision", approved=True, by=user, name=p["name"])
        else:
            res = {"error": f"The user rejected this action.{(' Reason: ' + note.rstrip('.') + '.') if note else ''} Do not retry it unchanged."}
            _step(run, "decision", approved=False, by=user, name=p["name"], note=note)
            _step(run, "tool", name=p["name"], args=p["args"], result=res, error=True)
            run["messages"].append(_tool_msg(p["call_id"], res, p["name"]))
            queue.pop(0)
    run["queue"], run["pending"], run["status"] = queue, None, "running"
    _save(run)
    _start(rid)
    return _public(run)


def follow_up(rid, text, user=None):
    run = _load(rid)
    if rid in _TASKS and not _TASKS[rid].done():
        raise HTTPException(409, "The agent is still working")
    if run.get("status") == "waiting":
        raise HTTPException(409, "Approve or reject the pending action first")
    text = (text or "").strip()
    if not text:
        raise HTTPException(400, "Empty message")
    run["messages"].append({"role": "user", "content": text})
    _step(run, "user", text=text)
    run["status"] = "queued"
    _save(run)
    _start(rid)
    return _public(run)


def stop(rid):
    run = _load(rid)
    if run.get("status") == "waiting":
        run["status"], run["pending"], run["queue"] = "stopped", None, []
        _step(run, "final", text="Stopped by the user.")
    else:
        run["status"] = "stopping"
    _save(run)
    return _public(run)


def delete(rid):
    p = _path(rid)
    t = _TASKS.pop(rid, None)
    if t:
        t.cancel()
    p.unlink(missing_ok=True)
    return {"ok": True}


def mark_interrupted():
    if not RUNS.exists():
        return
    for p in RUNS.glob("*.json"):
        try:
            r = json.loads(p.read_text(encoding="utf-8"))
        except ValueError:
            continue
        if r.get("status") in ("running", "queued", "stopping"):
            r["status"] = "failed"
            r["steps"].append({"kind": "error", "at": time.time(), "text": "Interrupted: DataBridge was restarted. Send a message to continue."})
            p.write_text(json.dumps(r, default=str), encoding="utf-8")


def status():
    c = _cfg()
    return {"model": c["model"], "base": c["base"], "configured": bool(c["base"]), "write_schemas": _allowed(),
            "tools": [{"name": n, "description": d, "write": w} for n, (_, d, _, w) in TOOLS.items()]}
