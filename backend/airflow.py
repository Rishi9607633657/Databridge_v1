"""Workflows: thin client over the Airflow REST API (v2 = Airflow 3.x with JWT, v1 = Airflow 2.x with basic auth)."""
from collections import defaultdict
from urllib.parse import quote

import httpx
from fastapi import HTTPException

from .settings import settings


class AirflowClient:
    def __init__(self):
        self.base = settings.airflow_url
        self.v = settings.airflow_api
        self._token = None

    @property
    def enabled(self):
        return bool(self.base)

    def _creds(self):
        if not settings.airflow_user or not settings.airflow_password:
            raise HTTPException(503, "Airflow username/password not set. Set AIRFLOW_USER and AIRFLOW_PASSWORD "
                                     "(or AIRFLOW_PASSWORD_FILE pointing to an existing file) in .env, then restart.")
        return settings.airflow_user, settings.airflow_password

    async def _token_header(self, client):
        if self.v == "v1":
            return {}
        if not self._token:
            user, pwd = self._creds()
            url = f"{self.base}/auth/token"
            r = await client.post(url, json={"username": user, "password": pwd})
            if r.status_code in (400, 415, 422):  # some auth managers only accept form data
                r = await client.post(url, data={"username": user, "password": pwd})
            if r.status_code >= 400:
                raise HTTPException(502, f"Airflow login failed ({r.status_code}): {r.text[:300]}")
            self._token = r.json()["access_token"]
        return {"Authorization": f"Bearer {self._token}"}

    async def request(self, method, path, **kw):
        if not self.enabled:
            raise HTTPException(503, "AIRFLOW_URL is not set")
        extra = kw.pop("headers", {})
        auth = self._creds() if self.v == "v1" else None
        try:
            async with httpx.AsyncClient(timeout=30, auth=auth) as c:
                for attempt in range(2):
                    h = await self._token_header(c)
                    r = await c.request(method, f"{self.base}/api/{self.v}{path}", headers={**h, **extra}, **kw)
                    if self.v != "v1" and attempt == 0 and (r.status_code == 401 or (r.status_code == 403 and "jwt" in r.text.lower())):
                        self._token = None
                        continue
                    break
        except httpx.HTTPError as e:
            raise HTTPException(502, f"Cannot reach Airflow at {self.base}: {e}")
        if r.status_code >= 400:
            raise HTTPException(r.status_code, f"Airflow: {r.text[:500]}")
        return r

    async def json(self, method, path, **kw):
        return (await self.request(method, path, **kw)).json()


af = AirflowClient()


def _schedule(d):
    si = d.get("schedule_interval")
    if isinstance(si, dict):
        si = si.get("value")
    return d.get("timetable_summary") or si or d.get("timetable_description")


def _run(r):
    return {"run_id": r.get("dag_run_id"), "dag_id": r.get("dag_id"), "state": r.get("state"),
            "run_type": r.get("run_type"), "logical_date": r.get("logical_date") or r.get("execution_date"),
            "start_date": r.get("start_date"), "end_date": r.get("end_date"), "conf": r.get("conf")}


async def list_workflows():
    dags = (await af.json("GET", "/dags", params={"limit": 200}))["dags"]
    runs = (await af.json("GET", "/dags/~/dagRuns", params={"order_by": "-start_date", "limit": 300})).get("dag_runs", [])
    per = defaultdict(list)
    for r in runs:
        if len(per[r["dag_id"]]) < 8:
            per[r["dag_id"]].append(_run(r))
    return [{"dag_id": d["dag_id"], "description": d.get("description"), "is_paused": d.get("is_paused"),
             "schedule": _schedule(d), "owners": d.get("owners", []),
             "tags": [t["name"] if isinstance(t, dict) else t for t in d.get("tags", [])],
             "next_run": d.get("next_dagrun") or d.get("next_dagrun_logical_date"),
             "recent_runs": per.get(d["dag_id"], [])} for d in dags]


async def workflow(dag_id):
    d = quote(dag_id, safe="")
    dag = await af.json("GET", f"/dags/{d}")
    tasks = (await af.json("GET", f"/dags/{d}/tasks"))["tasks"]
    runs = (await af.json("GET", f"/dags/{d}/dagRuns", params={"order_by": "-start_date", "limit": 25})).get("dag_runs", [])
    return {"dag_id": dag_id, "description": dag.get("description"), "is_paused": dag.get("is_paused"),
            "schedule": _schedule(dag), "owners": dag.get("owners", []),
            "tasks": [{"task_id": t["task_id"], "downstream": t.get("downstream_task_ids", []),
                       "operator": t.get("operator_name") or (t.get("class_ref") or {}).get("class_name")} for t in tasks],
            "runs": [_run(r) for r in runs]}


async def trigger(dag_id, conf=None):
    body = {"conf": conf or {}}
    if af.v != "v1":
        body["logical_date"] = None
    return _run(await af.json("POST", f"/dags/{quote(dag_id, safe='')}/dagRuns", json=body))


async def set_paused(dag_id, paused: bool):
    await af.json("PATCH", f"/dags/{quote(dag_id, safe='')}", json={"is_paused": paused})
    return {"dag_id": dag_id, "is_paused": paused}


async def task_instances(dag_id, run_id):
    data = await af.json("GET", f"/dags/{quote(dag_id, safe='')}/dagRuns/{quote(run_id, safe='')}/taskInstances",
                         params={"limit": 500})
    return [{"task_id": t["task_id"], "state": t.get("state"), "start_date": t.get("start_date"),
             "end_date": t.get("end_date"), "duration": t.get("duration"), "try_number": t.get("try_number") or 1,
             "map_index": t.get("map_index", -1)} for t in data.get("task_instances", [])]


async def task_log(dag_id, run_id, task_id, try_number):
    path = (f"/dags/{quote(dag_id, safe='')}/dagRuns/{quote(run_id, safe='')}/taskInstances/"
            f"{quote(task_id, safe='')}/logs/{max(int(try_number), 1)}")
    r = await af.request("GET", path, params={"full_content": "true"},
                         headers={"Accept": "text/plain" if af.v == "v1" else "application/json"})
    if "json" not in r.headers.get("content-type", ""):
        return r.text
    content = r.json().get("content")
    if isinstance(content, list):
        lines = []
        for item in content:
            if isinstance(item, dict):
                ts = item.get("timestamp", "")
                lines.append(f"{ts} {item.get('event', '')}".strip())
            else:
                lines.append(str(item))
        return "\n".join(lines)
    return str(content)


async def clear_failed(dag_id, run_id):
    body = {"dag_run_id": run_id, "only_failed": True, "dry_run": False, "reset_dag_runs": True}
    return await af.json("POST", f"/dags/{quote(dag_id, safe='')}/clearTaskInstances", json=body)
