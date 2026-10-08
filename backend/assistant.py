"""Dora — DataBridge's AI assistant.

Works with any OpenAI-compatible chat endpoint. Free options:
  * Ollama (default, runs locally, data never leaves your machine)  DORA_BASE_URL=http://localhost:11434/v1
  * Groq free tier                                                   DORA_BASE_URL=https://api.groq.com/openai/v1
  * Google Gemini free tier                                          DORA_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
  * OpenRouter free models                                           DORA_BASE_URL=https://openrouter.ai/api/v1
"""
import asyncio
import json
import re

import httpx

from . import catalog
from .settings import env

BASE_URL = (env("DORA_BASE_URL", "http://localhost:11434/v1") or "").rstrip("/")
MODEL = env("DORA_MODEL", "qwen2.5-coder:7b")
API_KEY = env("DORA_API_KEY", "")
TEMPERATURE = float(env("DORA_TEMPERATURE", "0.2"))
IS_OLLAMA = ":11434" in BASE_URL or "ollama" in BASE_URL

SYSTEM = """You are Dora, the AI assistant inside DataBridge, a Databricks-like data platform.
Environment: PySpark 3.5, Spark SQL, Delta Lake 3.1, Hive metastore, Jupyter-style notebooks.
Notebook features: `%sql` cells (Spark SQL, last result in `_sqldf`), `%md`, `%run ./other_notebook`, `display(df)`,
`dbutils.widgets.text/get`, `dbutils.notebook.run(path, timeout, args)` / `exit(value)`, `dbutils.fs`.
The variables `spark`, `F` (pyspark.sql.functions) and `BASE_PATH` already exist.

Rules:
- Prefer the PySpark DataFrame API and Spark SQL. Never use pandas for large data unless asked.
- Use ONLY the tables and columns given in the context. If something you need is not in the context, say so briefly.
- Put code in fenced blocks: ```python for PySpark, ```sql for SQL. One complete, runnable block per answer when possible.
- When fixing an error: first one or two sentences on the cause, then the corrected cell.
- Be concise and practical. No filler."""

MODE_PROMPTS = {
    "fix": "The active cell failed. Explain the cause in 1-2 sentences, then give the full corrected cell.",
    "explain": "Explain what the active cell does, step by step, briefly. Mention any risks or bugs you notice.",
    "optimize": "Suggest how to make the active cell faster or more robust on Spark (partitioning, joins, caching, "
                "avoiding collect/UDFs, Delta best practices). Give the improved cell.",
    "comment": "Return the active cell with clear comments and docstrings added. Do not change its behaviour.",
    "generate": "Write code for the user's request as a new notebook cell.",
    "sql": "Write one Spark SQL query for the user's request. Reply with a short sentence and one ```sql block only.",
}


def _clip(text, n):
    text = text or ""
    return text if len(text) <= n else text[: n - 20] + "\n…(truncated)…"


async def _schemas(text_blobs, limit=6):
    """Find schema.table references and fetch their columns from the catalog (best-effort, bounded)."""
    try:
        dbs = {d["name"] for d in await asyncio.wait_for(catalog.databases(), 8)}
    except Exception:  # noqa: BLE001
        return "", []
    refs = []
    for blob in text_blobs:
        for db, tb in re.findall(r"\b([A-Za-z_]\w*)\.([A-Za-z_]\w*)\b", blob or ""):
            if db in dbs and (db, tb) not in refs:
                refs.append((db, tb))
    lines = []
    for db, tb in refs[:limit]:
        try:
            t = await asyncio.wait_for(catalog.table(db, tb), 8)
            cols = ", ".join(f"{c['name']} {c['type']}" for c in t["columns"][:60])
            lines.append(f"- {db}.{tb} ({t.get('provider') or 'table'}): {cols}")
        except Exception:  # noqa: BLE001
            continue
    return "\n".join(lines), sorted(dbs)


async def _table_names(dbs, limit=120):
    names = []
    for d in dbs[:30]:
        try:
            for t in await asyncio.wait_for(catalog.tables(d), 6):
                names.append(f"{d}.{t['name']}")
        except Exception:  # noqa: BLE001
            continue
        if len(names) >= limit:
            break
    return names[:limit]


async def build_messages(body: dict) -> list:
    mode = body.get("mode") or "chat"
    ctx = body.get("context") or {}
    cells = ctx.get("cells") or []
    active = ctx.get("active")
    active_cell = cells[active] if isinstance(active, int) and 0 <= active < len(cells) else None
    prompt = body.get("prompt") or ""
    sql_text = ctx.get("sql") or ""

    parts = []
    if ctx.get("path"):
        parts.append(f"Notebook: {ctx['path']}")
    if cells:
        outline, budget = [], 9000
        for i, c in enumerate(cells):
            src = (c.get("source") or "").strip()
            if not src:
                continue
            chunk = f"[cell {i + 1}{' (active)' if i == active else ''} · {c.get('type', 'code')}]\n{_clip(src, 1500)}"
            if budget - len(chunk) < 0:
                outline.append("…(more cells omitted)…")
                break
            budget -= len(chunk)
            outline.append(chunk)
        parts.append("Notebook cells:\n" + "\n\n".join(outline))
    if active_cell:
        parts.append(f"Active cell (cell {active + 1}):\n```\n{_clip(active_cell.get('source'), 6000)}\n```")
        if active_cell.get("error"):
            parts.append(f"Error from the active cell:\n{_clip(active_cell['error'], 4000)}")
    if sql_text:
        parts.append(f"Current SQL editor text:\n```sql\n{_clip(sql_text, 4000)}\n```")
    variables = ctx.get("variables") or []
    if variables:
        parts.append("Variables in memory: " + ", ".join(f"{v['name']} ({v['type']})" for v in variables[:60]))

    blobs = [prompt, sql_text] + [c.get("source") for c in cells]
    schema_text, dbs = await _schemas(blobs)
    if schema_text:
        parts.append("Table schemas:\n" + schema_text)
    if mode in ("generate", "sql", "chat") and dbs:
        names = await _table_names(dbs)
        if names:
            parts.append("Available tables: " + ", ".join(names))

    instruction = MODE_PROMPTS.get(mode, "")
    user = "\n\n".join(p for p in ["\n\n".join(parts), instruction, f"User request: {prompt}" if prompt else ""] if p)
    msgs = [{"role": "system", "content": SYSTEM}]
    for h in (body.get("history") or [])[-10:]:
        if h.get("role") in ("user", "assistant") and h.get("content"):
            msgs.append({"role": h["role"], "content": _clip(h["content"], 6000)})
    msgs.append({"role": "user", "content": user})
    return msgs


IS_OPENAI = "api.openai.com" in BASE_URL
REASONING_MODEL = re.compile(r"^(gpt-5|o\d)", re.I)


def _payload(messages):
    """Build the chat request. OpenAI GPT-5 / o-series reject max_tokens and non-default temperature."""
    p = {"model": MODEL, "messages": messages, "stream": True}
    max_out = int(env("DORA_MAX_TOKENS", "4096") or 4096)
    p["max_completion_tokens" if IS_OPENAI else "max_tokens"] = max_out
    if not (IS_OPENAI and REASONING_MODEL.match(MODEL)):
        p["temperature"] = TEMPERATURE
    return p


def _fix_params(payload, detail):
    """One automatic retry when a provider rejects a parameter (e.g. temperature or max_tokens)."""
    d = detail.lower()
    p = dict(payload)
    changed = False
    if "temperature" in d and "temperature" in p:
        p.pop("temperature")
        changed = True
    if "max_tokens" in d and "max_completion_tokens" in d and "max_tokens" in p:
        p["max_completion_tokens"] = p.pop("max_tokens")
        changed = True
    elif "max_completion_tokens" in d and "max_completion_tokens" in p and "max_tokens" not in d:
        p["max_tokens"] = p.pop("max_completion_tokens")
        changed = True
    return p if changed else None


def _setup_hint(err: str) -> str:
    if IS_OLLAMA:
        return (f"\n\n**Dora can't reach Ollama** at `{BASE_URL}` ({err}).\n\n"
                f"1. Install Ollama: `winget install Ollama.Ollama` (or https://ollama.com/download)\n"
                f"2. Download the model: `ollama pull {MODEL}`\n"
                f"3. Make sure Ollama is running (tray icon), then ask again.")
    return f"\n\n**Dora can't reach the AI service** at `{BASE_URL}` ({err}). Check DORA_BASE_URL, DORA_MODEL and DORA_API_KEY in .env."


async def stream_chat(body: dict):
    try:
        messages = await build_messages(body)
    except Exception as e:  # noqa: BLE001
        messages = [{"role": "system", "content": SYSTEM}, {"role": "user", "content": body.get("prompt") or ""}]
        yield f"_(context unavailable: {e})_\n\n"
    headers = {"Content-Type": "application/json"}
    if API_KEY:
        headers["Authorization"] = f"Bearer {API_KEY}"
    payload = _payload(messages)
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(300, connect=10)) as client:
            for attempt in (1, 2, 3):
                async with client.stream("POST", f"{BASE_URL}/chat/completions", json=payload, headers=headers) as r:
                    if r.status_code == 400 and attempt < 3:
                        detail = (await r.aread()).decode("utf-8", "replace")
                        fixed = _fix_params(payload, detail)
                        if fixed:
                            payload = fixed
                            continue
                        yield f"**Dora error 400:** {detail[:400]}"
                        return
                    async for chunk in _read_stream(r):
                        yield chunk
                    return
    except httpx.HTTPError as e:
        yield _setup_hint(type(e).__name__)


async def _read_stream(r):
    if r.status_code >= 400:
        detail = (await r.aread()).decode("utf-8", "replace")[:400]
        if r.status_code == 404 and IS_OLLAMA:
            yield f"**Model `{MODEL}` is not downloaded yet.** Run `ollama pull {MODEL}` and ask again."
        else:
            yield f"**Dora error {r.status_code}:** {detail}"
        return
    async for line in r.aiter_lines():
        if not line.startswith("data:"):
            continue
        data = line[5:].strip()
        if data == "[DONE]":
            break
        try:
            delta = json.loads(data)["choices"][0].get("delta", {}).get("content")
        except Exception:  # noqa: BLE001
            continue
        if delta:
            yield delta


async def complete(messages: list, max_tokens: int = 4000, temperature: float = 0.2) -> str:
    """One non-streaming chat completion (used by the dashboard builder). Raises RuntimeError on failure."""
    headers = {"Content-Type": "application/json"}
    if API_KEY:
        headers["Authorization"] = f"Bearer {API_KEY}"
    payload = _payload(messages)
    payload["stream"] = False
    key = "max_completion_tokens" if "max_completion_tokens" in payload else "max_tokens"
    payload[key] = max_tokens
    if "temperature" in payload:
        payload["temperature"] = temperature
    async with httpx.AsyncClient(timeout=httpx.Timeout(240, connect=10)) as client:
        for attempt in range(3):
            r = await client.post(f"{BASE_URL}/chat/completions", json=payload, headers=headers)
            if r.status_code == 400 and attempt < 2:
                fixed = _fix_params(payload, r.text)
                if fixed:
                    payload = fixed
                    continue
            if r.status_code >= 400:
                raise RuntimeError(f"AI service error {r.status_code}: {r.text[:300]}")
            data = r.json()
            return (data.get("choices") or [{}])[0].get("message", {}).get("content") or ""
    raise RuntimeError("AI service did not accept the request")


async def status() -> dict:
    info = {"name": "Dora", "base_url": BASE_URL, "model": MODEL, "provider": "ollama" if IS_OLLAMA else "openai-compatible",
            "ok": False, "message": ""}
    try:
        async with httpx.AsyncClient(timeout=4) as client:
            if IS_OLLAMA:
                root = BASE_URL[:-3] if BASE_URL.endswith("/v1") else BASE_URL
                tags = (await client.get(f"{root}/api/tags")).json().get("models", [])
                names = [m.get("name", "") for m in tags]
                info["models"] = names
                if any(n == MODEL or n.split(":")[0] == MODEL.split(":")[0] and MODEL.endswith(n.split(":")[-1]) for n in names):
                    info["ok"] = True
                else:
                    info["message"] = f"Model {MODEL} is not downloaded. Run: ollama pull {MODEL}"
            else:
                info["ok"] = bool(API_KEY)
                info["message"] = "" if API_KEY else "Set DORA_API_KEY in .env"
    except Exception as e:  # noqa: BLE001
        info["message"] = (f"Ollama is not running at {BASE_URL}. Install it (winget install Ollama.Ollama), "
                           f"then run: ollama pull {MODEL}") if IS_OLLAMA else f"Cannot reach {BASE_URL}: {e}"
    return info
