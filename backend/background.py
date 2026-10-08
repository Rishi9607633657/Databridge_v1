"""Background execution: notebook cells and SQL queries keep running on the server when the user
switches pages. The UI re-attaches (snapshot + live updates) when it comes back, and finished cell
outputs are written into the .ipynb even if no browser is watching."""
import asyncio
import json
import time
import uuid
from collections import OrderedDict

import nbformat

from .kernels import KernelSession, SqlError, apply_output, run_sql
from .workspace import resolve


class NotebookRuns:
    """Cell execution state for one notebook kernel, independent of any browser connection."""

    def __init__(self, ks: KernelSession, path: str):
        self.ks = ks
        self.path = path
        self.cells: dict[str, dict] = {}
        self.subscribers: set = set()
        self.batch_abort = False
        self.state = {"widgets": [], "variables": []}

    # ---- fan-out to connected browsers ----
    async def broadcast(self, msg):
        for send in list(self.subscribers):
            try:
                await send(msg)
            except Exception:  # noqa: BLE001  (browser went away)
                self.subscribers.discard(send)

    def snapshot(self):
        return {cid: {"status": s["status"], "outputs": s["outputs"], "execution_count": s["execution_count"],
                      "result": s.get("result"), "started": s.get("started"), "finished": s.get("finished"),
                      "duration": s.get("duration")} for cid, s in self.cells.items()}

    # ---- execution ----
    def _state(self, cell_id):
        st = {"status": "queued", "outputs": [], "execution_count": None, "result": None,
              "clear_pending": False, "updated": time.time()}
        self.cells[cell_id] = st
        return st

    async def queue(self, cell_id):
        self._state(cell_id)
        await self.broadcast({"type": "queued", "cell_id": cell_id})

    async def run(self, cell_id, code):
        st = self.cells.get(cell_id) or self._state(cell_id)

        async def on_start():
            st["status"] = "running"
            st["started"] = time.time()
            await self.broadcast({"type": "running", "cell_id": cell_id, "started": st["started"]})

        async def on_output(o):
            outs = st["outputs"]
            if o["output_type"] == "clear_output":
                if o.get("wait"):
                    st["clear_pending"] = True
                else:
                    outs.clear()
            elif not apply_output(outs, o):
                pass
            else:
                if st["clear_pending"]:
                    outs.clear()
                    st["clear_pending"] = False
                if (o["output_type"] == "stream" and outs and outs[-1]["output_type"] == "stream"
                        and outs[-1]["name"] == o["name"]):
                    outs[-1] = {**outs[-1], "text": outs[-1]["text"] + o["text"]}
                else:
                    outs.append(o)
            await self.broadcast({"type": "output", "cell_id": cell_id, "output": o})

        try:
            status, count = await self.ks.execute(code, on_output, on_start)
        except Exception as e:  # noqa: BLE001
            status, count = "error", None
            st["outputs"].append({"output_type": "error", "ename": "Error", "evalue": str(e), "traceback": []})
        finished = time.time()
        duration = finished - st["started"] if st.get("started") else None
        st.update(status="done", result=status, execution_count=count or st["execution_count"], updated=finished,
                  finished=finished, duration=duration)
        await self.broadcast({"type": "done", "cell_id": cell_id, "status": status, "execution_count": count,
                              "finished": finished, "duration": duration})
        self._persist(cell_id)
        await self.refresh_state()
        return status

    # ---- kernel introspection: widgets bar + variable explorer ----
    async def _silent(self, code, marker):
        outs = []

        async def collect(o):
            outs.append(o)
        await self.ks.execute(code, collect, store_history=False)
        text = "".join(o.get("text", "") for o in outs if o["output_type"] == "stream" and o["name"] == "stdout")
        line = next((ln for ln in text.splitlines() if ln.startswith(marker)), None)
        return json.loads(line[len(marker):]) if line else None

    async def refresh_state(self):
        try:
            st = await self._silent("try:\n    print('__DBSTATE__' + _db_state_json())\nexcept NameError:\n    pass", "__DBSTATE__")
        except Exception:  # noqa: BLE001
            st = None
        if st is not None:
            self.state = st
            await self.broadcast({"type": "state", **st})

    async def set_widget(self, name, value):
        await self._silent(f"dbutils.widgets._set({json.dumps(str(name))}, {json.dumps(str(value))})", "__none__")
        await self.refresh_state()

    async def preview(self, name):
        try:
            return await self._silent(f"print('__DBPREV__' + _db_preview_json({json.dumps(str(name))}))", "__DBPREV__")
        except Exception as e:  # noqa: BLE001
            return {"text": f"Preview failed: {e}"}

    async def run_one(self, cell_id, code):
        await self.queue(cell_id)
        return await self.run(cell_id, code)

    async def run_many(self, items):
        """Run cells in order (Run all). Stops at the first error; remaining cells are marked skipped."""
        self.batch_abort = False
        for it in items:
            await self.queue(it["cell_id"])
        for i, it in enumerate(items):
            status = "aborted" if self.batch_abort else await self.run(it["cell_id"], it.get("code", ""))
            if status != "ok":
                for rest in items[i + 1:]:
                    st = self.cells.get(rest["cell_id"])
                    if st and st["status"] == "queued":
                        st.update(status="done", result="skipped")
                        await self.broadcast({"type": "done", "cell_id": rest["cell_id"], "status": "skipped",
                                              "execution_count": None})
                break

    def _persist(self, cell_id):
        """Write the finished cell's outputs into the notebook file (keeps results when nobody is watching)."""
        st = self.cells.get(cell_id)
        if not st:
            return
        try:
            p = resolve(self.path)
            nb = nbformat.read(p, as_version=4)
            for c in nb.cells:
                if c.get("id") == cell_id and c.cell_type == "code":
                    c.outputs = [nbformat.from_dict(o) for o in st["outputs"] if o.get("output_type") != "clear_output"]
                    c.execution_count = st["execution_count"]
                    nbformat.write(nb, p)
                    return
        except Exception:  # noqa: BLE001  (file moved/invalid - UI save will still persist)
            pass


_runs: dict[str, NotebookRuns] = {}


def runs_for(ks: KernelSession) -> NotebookRuns:
    r = _runs.get(ks.id)
    if r is None or r.ks is not ks:
        path = ks.key[3:] if ks.key.startswith("nb:") else ks.label
        r = _runs[ks.id] = NotebookRuns(ks, path)
    return r


def drop_runs(kid: str):
    _runs.pop(kid, None)


# ---------------- background SQL queries ----------------
_queries: "OrderedDict[str, dict]" = OrderedDict()
MAX_QUERIES = 30


def _summary(q):
    return {k: q[k] for k in ("id", "query", "state", "started", "finished", "limit")} | {
        "rows": len(q["result"]["rows"]) if q.get("result") else None}


def submit_query(query: str, limit: int | None):
    qid = uuid.uuid4().hex[:12]
    rec = {"id": qid, "query": query, "limit": limit, "state": "running", "started": time.time(),
           "finished": None, "result": None, "error": None}
    _queries[qid] = rec
    while len(_queries) > MAX_QUERIES:
        _queries.popitem(last=False)

    async def work():
        try:
            rec["result"] = await run_sql(query, limit)
            rec["state"] = "done"
        except SqlError as e:
            rec["state"] = "error"
            rec["error"] = {"detail": f"{e.ename}: {e.evalue}", "traceback": e.traceback}
        except Exception as e:  # noqa: BLE001
            rec["state"] = "error"
            rec["error"] = {"detail": str(e), "traceback": []}
        rec["finished"] = time.time()

    asyncio.create_task(work())
    return _summary(rec)


def get_query(qid):
    return _queries.get(qid)


def list_queries():
    return [_summary(q) for q in reversed(_queries.values())]
