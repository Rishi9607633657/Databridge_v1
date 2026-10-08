"""Jupyter kernel sessions: one kernel per notebook, plus a shared kernel for the SQL editor/catalog."""
import asyncio
import json
import os
import queue
import re
import time
import uuid

from jupyter_client.manager import AsyncKernelManager

from .settings import DATA_ROOT, ROOT, settings

ANSI = re.compile(r"\x1b\[[0-9;]*[A-Za-z]")
RESULT_MARK = "__STRATUM_RESULT__"
SQL_KEY = "__sql__"


class KernelSession:
    def __init__(self, key: str, label: str, extra_env: dict | None = None, kind: str = "notebook"):
        self.id = uuid.uuid4().hex[:12]
        self.extra_env = extra_env or {}
        self.kind = kind
        self.key = key
        self.label = label
        self.km = AsyncKernelManager(kernel_name=settings.kernel_name)
        self.kc = None
        self.lock = asyncio.Lock()
        self.ready = asyncio.Event()      # set once Spark start-up AND the notebook runtime have loaded
        self.generation = 0
        self.started_at = time.time()
        self.last_activity = time.time()
        self.busy = False
        self.init_status = "pending"
        self.init_message = ""

    async def start(self):
        self.ready.clear()                                   # also on restart; set when _init_spark finishes
        try:
            await self._start()
        except BaseException:
            self.ready.set()                                 # never leave user code waiting on a failed start
            raise

    async def _start(self):
        from . import auth
        env = {**os.environ, "STRATUM_ROOT": str(ROOT), "DATABRIDGE_DATA": str(DATA_ROOT), "DATABRIDGE_API_URL": f"http://127.0.0.1:{settings.port}",
               "DATABRIDGE_API_TOKEN": auth.INTERNAL_TOKEN,
               **self.extra_env}
        # every kernel (and the Spark driver JVM it starts) writes its console output to its own log file
        log_dir = DATA_ROOT / ".stratum" / "logs" / "kernels"
        log_dir.mkdir(parents=True, exist_ok=True)
        safe = re.sub(r"[^\w.-]+", "_", self.label or self.key)[:60]
        self.log_path = log_dir / f"{safe}__{self.id}.log"
        self._log_fh = open(self.log_path, "a", encoding="utf-8", errors="replace")
        self._log_fh.write(f"===== kernel {self.id} for {self.label} started {time.strftime('%Y-%m-%d %H:%M:%S')} =====\n")
        self._log_fh.flush()
        await self.km.start_kernel(cwd=str(settings.workspace), env=env, stdout=self._log_fh, stderr=self._log_fh)
        self.kc = self.km.client()
        self.kc.start_channels()
        await self.kc.wait_for_ready(timeout=120)
        self._shell_waiters = {}
        self._shell_task = asyncio.create_task(self._shell_reader())
        self._init_task = asyncio.create_task(self._init_spark())
        await asyncio.sleep(0)  # let init grab the lock before any user code

    async def _init_spark(self):
        try:
            await self._init_steps()
        finally:
            self.ready.set()                                 # Spark init AND runtime done: user cells may run now

    async def _init_steps(self):
        outputs = []

        async def collect(o):
            outputs.append(o)

        if settings.spark_auto_init and settings.spark_init_file.exists():
            self.init_status = "running"
            code = settings.spark_init_file.read_text(encoding="utf-8")
            status, _ = await self.execute(code, collect, silent=False, store_history=False, _init=True)
            text = "".join(o.get("text", "") for o in outputs if o["output_type"] == "stream" and o["name"] == "stdout")
            if status == "ok":
                self.init_status = "ready"
                self.init_message = text.strip()[-500:]
            else:
                err = next((o for o in outputs if o["output_type"] == "error"), {})
                self.init_status = "error"
                self.init_message = f"{err.get('ename', '')}: {err.get('evalue', '')}"
        else:
            self.init_status = "skipped"
        # Notebook runtime: %sql/%md/%run/%sh/%fs, display(), dbutils — loaded even if Spark failed
        if settings.runtime_file.exists():
            outputs.clear()
            status, _ = await self.execute(settings.runtime_file.read_text(encoding="utf-8"), collect,
                                           silent=False, store_history=False, _init=True)
            if status != "ok":
                err = next((o for o in outputs if o["output_type"] == "error"), {})
                self.init_message = (self.init_message + f"\nRuntime not loaded: {err.get('ename', '')}: "
                                                         f"{err.get('evalue', '')}").strip()

    async def execute(self, code, on_output=None, on_start=None, silent=False, store_history=True, _init=False):
        """Run code; stream outputs through on_output. Returns (status, execution_count)."""
        if not _init and not self.ready.is_set():          # user code waits until start-up has fully finished
            try:
                await asyncio.wait_for(self.ready.wait(), 600)
            except asyncio.TimeoutError:
                pass
        async with self.lock:
            gen = self.generation
            self.busy = True
            self.last_activity = time.time()
            if on_start:
                await on_start()
            status, count = "ok", None
            try:
                msg_id = self.kc.execute(code, silent=silent, store_history=store_history, allow_stdin=False)
                reply_fut = self._expect_reply(msg_id)
                while True:
                    if self.generation != gen:
                        return "aborted", count
                    try:
                        msg = await self.kc.get_iopub_msg(timeout=1)
                    except queue.Empty:
                        continue
                    if msg.get("parent_header", {}).get("msg_id") != msg_id:
                        continue
                    t, c = msg["msg_type"], msg["content"]
                    out = None
                    if t == "stream":
                        out = {"output_type": "stream", "name": c["name"], "text": c["text"]}
                    elif t in ("execute_result", "display_data"):
                        out = {"output_type": t, "data": c.get("data", {}), "metadata": dict(c.get("metadata") or {})}
                        did = (c.get("transient") or {}).get("display_id")
                        if did:
                            out["metadata"]["databridge_display_id"] = did
                        if t == "execute_result":
                            out["execution_count"] = c.get("execution_count")
                    elif t == "update_display_data":
                        out = {"output_type": "update_display_data", "display_id": (c.get("transient") or {}).get("display_id"),
                               "data": c.get("data", {}), "metadata": dict(c.get("metadata") or {})}
                    elif t == "error":
                        status = "error"
                        out = {"output_type": "error", "ename": c.get("ename", ""), "evalue": c.get("evalue", ""),
                               "traceback": [ANSI.sub("", line) for line in c.get("traceback", [])]}
                    elif t == "execute_input":
                        count = c.get("execution_count")
                    elif t == "clear_output":
                        out = {"output_type": "clear_output", "wait": c.get("wait", False)}
                    elif t == "status" and c.get("execution_state") == "idle":
                        break
                    if out is not None and on_output:
                        await on_output(out)
                await self._drain_shell(reply_fut, msg_id)
                return status, count
            finally:
                self.busy = False
                self.last_activity = time.time()

    async def _shell_reader(self):
        """Single reader for shell replies; routes each reply to whoever sent the request (execute, complete)."""
        while True:
            try:
                msg = await self.kc.get_shell_msg(timeout=1)
            except queue.Empty:
                continue
            except asyncio.CancelledError:
                return
            except Exception:  # noqa: BLE001  (channel closed during restart/shutdown)
                await asyncio.sleep(0.5)
                continue
            fut = self._shell_waiters.pop(msg.get("parent_header", {}).get("msg_id"), None)
            if fut and not fut.done():
                fut.set_result(msg)

    def _expect_reply(self, msg_id):
        fut = asyncio.get_running_loop().create_future()
        self._shell_waiters[msg_id] = fut
        return fut

    async def _drain_shell(self, fut, msg_id):
        try:
            await asyncio.wait_for(fut, 10)
        except asyncio.TimeoutError:
            self._shell_waiters.pop(msg_id, None)

    async def complete(self, code, cursor_pos, timeout=2.0):
        """Jupyter/Jedi completion with types + signatures. Returns quickly with no matches if the kernel is busy."""
        msg_id = self.kc.complete(code, cursor_pos)
        fut = self._expect_reply(msg_id)
        empty = {"matches": [], "items": [], "cursor_start": cursor_pos, "cursor_end": cursor_pos, "busy": True}
        try:
            reply = await asyncio.wait_for(fut, timeout)
        except asyncio.TimeoutError:
            self._shell_waiters.pop(msg_id, None)
            return empty
        c = reply.get("content", {})
        matches = c.get("matches", [])[:300]
        typed = (c.get("metadata") or {}).get("_jupyter_types_experimental") or []
        items = [{"text": t.get("text"), "type": t.get("type") or "", "signature": t.get("signature") or ""}
                 for t in typed[:300] if t.get("text")]
        if not items:
            items = [{"text": m, "type": "", "signature": ""} for m in matches]
        return {"matches": matches, "items": items, "cursor_start": c.get("cursor_start", cursor_pos),
                "cursor_end": c.get("cursor_end", cursor_pos), "busy": False}

    async def inspect(self, code, cursor_pos, detail_level=0, timeout=2.0):
        """Docstring / signature for the name at the cursor (Shift+Tab, hover)."""
        msg_id = self.kc.inspect(code, cursor_pos, detail_level)
        fut = self._expect_reply(msg_id)
        try:
            reply = await asyncio.wait_for(fut, timeout)
        except asyncio.TimeoutError:
            self._shell_waiters.pop(msg_id, None)
            return {"found": False, "busy": True, "text": ""}
        c = reply.get("content", {})
        text = ANSI.sub("", (c.get("data") or {}).get("text/plain", ""))
        return {"found": bool(c.get("found")), "busy": False, "text": text[:6000]}

    async def interrupt(self):
        await self.km.interrupt_kernel()

    async def restart(self):
        self.generation += 1
        if getattr(self, "_shell_task", None):
            self._shell_task.cancel()          # wait_for_ready reads the shell channel itself
        await self.km.restart_kernel(now=True)
        await self.kc.wait_for_ready(timeout=120)
        self._shell_waiters = {}
        self._shell_task = asyncio.create_task(self._shell_reader())
        self.started_at = time.time()
        self._init_task = asyncio.create_task(self._init_spark())
        await asyncio.sleep(0)

    async def shutdown(self):
        self.generation += 1
        if getattr(self, "_shell_task", None):
            self._shell_task.cancel()
        try:
            self.kc.stop_channels()
        finally:
            await self.km.shutdown_kernel(now=True)

    async def is_alive(self):
        return await self.km.is_alive()

    def info(self):
        return {"id": self.id, "key": self.key, "label": self.label, "kind": self.kind, "busy": self.busy,
                "started_at": self.started_at, "last_activity": self.last_activity,
                "init_status": self.init_status, "init_message": self.init_message}


class KernelRegistry:
    def __init__(self):
        self.by_id: dict[str, KernelSession] = {}
        self.by_key: dict[str, str] = {}
        self._start_lock = asyncio.Lock()

    async def get_or_start(self, key: str, label: str, extra_env: dict | None = None) -> KernelSession:
        async with self._start_lock:
            kid = self.by_key.get(key)
            if kid and kid in self.by_id and await self.by_id[kid].is_alive():
                return self.by_id[kid]
            ks = KernelSession(key, label, extra_env)
            await ks.start()
            self.by_id[ks.id] = ks
            self.by_key[key] = ks.id
            return ks

    async def start_session(self, key: str, label: str, extra_env: dict | None = None, kind: str = "job") -> KernelSession:
        """Always start a fresh, dedicated kernel (used by job tasks)."""
        ks = KernelSession(key, label, extra_env, kind)
        await ks.start()
        self.by_id[ks.id] = ks
        self.by_key[key] = ks.id
        return ks

    async def wait_ready(self, ks: KernelSession, timeout: float = 600):
        task = getattr(ks, "_init_task", None)
        if task:
            await asyncio.wait_for(asyncio.shield(task), timeout)

    def get(self, kid: str) -> KernelSession | None:
        return self.by_id.get(kid)

    def for_key(self, key: str) -> KernelSession | None:
        kid = self.by_key.get(key)
        return self.by_id.get(kid) if kid else None

    async def shutdown(self, kid: str):
        ks = self.by_id.pop(kid, None)
        if ks:
            self.by_key.pop(ks.key, None)
            await ks.shutdown()

    async def shutdown_all(self):
        for kid in list(self.by_id):
            await self.shutdown(kid)

    def list(self):
        return [ks.info() for ks in self.by_id.values()]


kernels = KernelRegistry()


class SqlError(Exception):
    def __init__(self, ename, evalue, traceback):
        super().__init__(f"{ename}: {evalue}")
        self.ename, self.evalue, self.traceback = ename, evalue, traceback


async def run_sql(query: str, limit: int | None = None, key: str = SQL_KEY, label: str = "SQL Editor") -> dict:
    """Run one or more ';'-separated Spark SQL statements in a shared kernel; return the last result."""
    limit = limit or settings.sql_row_limit
    ks = await kernels.get_or_start(key, label)
    code = f"""
if 'spark' not in globals():
    raise RuntimeError("No Spark session in this kernel. Check config/spark_init.py and that pyspark is installed.")
import json as __json, math as __math
def __clean(v):
    if isinstance(v, float) and (__math.isnan(v) or __math.isinf(v)):
        return None
    if type(v).__name__ == "Decimal":          # DECIMAL columns (money) -> numbers, not text
        f = float(v)
        return int(f) if f.is_integer() and abs(f) < 2**53 else f
    if isinstance(v, (list, tuple)):
        return [__clean(x) for x in v]
    if isinstance(v, dict):
        return {{str(k): __clean(x) for k, x in v.items()}}
    return v
__stmts = [s for s in {json.dumps(query)}.split(';') if s.strip()]
__df = None
for __s in __stmts:
    __df = spark.sql(__s)
if __df is not None:
    __rows = [__clean(list(r)) for r in __df.limit({int(limit)}).collect()]
    print({json.dumps(RESULT_MARK)} + __json.dumps({{"columns": list(__df.columns), "data": __rows}}, default=str))
else:
    print({json.dumps(RESULT_MARK)} + '{{"columns":[],"data":[]}}')
"""
    outs = []

    async def collect(o):
        outs.append(o)

    t0 = time.time()
    status, _ = await ks.execute(code, collect, store_history=False)
    elapsed = round(time.time() - t0, 2)
    if status != "ok":
        err = next((o for o in outs if o["output_type"] == "error"), None)
        if err:
            raise SqlError(err["ename"], err["evalue"], err["traceback"])
        raise SqlError("Aborted", "The SQL kernel was restarted or interrupted.", [])
    text = "".join(o.get("text", "") for o in outs if o["output_type"] == "stream" and o["name"] == "stdout")
    line = next((ln for ln in text.splitlines() if ln.startswith(RESULT_MARK)), None)
    if line is None:
        raise SqlError("NoResult", "The query produced no result payload.", [text[-2000:]])
    payload = json.loads(line[len(RESULT_MARK):])
    rows = payload.get("data", [])
    return {"columns": payload.get("columns", []), "rows": rows, "elapsed": elapsed,
            "truncated": len(rows) >= limit, "limit": limit}


def apply_output(outputs: list, o: dict) -> bool:
    """Merge one kernel output into a stored output list. Returns False if nothing should be appended."""
    if o["output_type"] == "update_display_data":
        did = o.get("display_id")
        for i, prev in enumerate(outputs):
            if (prev.get("metadata") or {}).get("databridge_display_id") == did:
                outputs[i] = {**prev, "data": o.get("data", {}),
                              "metadata": {**(o.get("metadata") or {}), "databridge_display_id": did}}
        return False
    return True
