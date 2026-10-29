"""REST API for governance, notifications, budgets, alerts, lineage, data quality, ML, Ask data and the BI endpoint.
Mounted by backend/main.py. Role checks for these paths are in backend/auth.py (ADMIN_ONLY / ADMIN_WRITE)."""
from fastapi import APIRouter, Body, HTTPException, Request

from . import alerts, ask, auth, budgets, governance, lineage, ml, notify, odata, quality

router = APIRouter()


def _u(request: Request):
    return getattr(request.state, "user", None) or {}


def _name(request: Request):
    return _u(request).get("username", "")


# ---------------- governance ----------------
@router.get("/api/governance")
def gov_list():
    return governance.list_all()


@router.get("/api/governance/table")
def gov_table(fq: str):
    return governance.table_policies(fq)


@router.post("/api/governance/preview")
async def gov_preview(body: dict = Body(...)):
    """Show how a query is rewritten for a given person (admins testing their rules)."""
    who = body.get("user") or {}
    u = {"id": "preview", "username": who.get("username") or "someone", "email": who.get("email") or "",
         "role": who.get("role") or "viewer", "company": who.get("company") or ""}
    try:
        return {"sql": await governance.apply(body.get("query") or "", purpose="preview", u=u), "error": None}
    except HTTPException as e:
        return {"sql": None, "error": e.detail}


@router.post("/api/governance/{kind}")
def gov_add(request: Request, kind: str, body: dict = Body(...)):
    fn = {"grants": governance.add_grant, "masks": governance.add_mask, "filters": governance.add_filter}.get(kind)
    if not fn:
        raise HTTPException(404, "Unknown policy type")
    return fn(body, _name(request))


@router.delete("/api/governance/{kind}/{rid}")
def gov_delete(kind: str, rid: str):
    governance.delete(kind, rid)
    return {"ok": True}


# ---------------- notifications ----------------
@router.get("/api/notify/status")
def notify_status():
    return notify.configured()


@router.post("/api/notify/test")
async def notify_test(request: Request, body: dict = Body(...)):
    import asyncio
    dest = notify.clean_dest(body)
    return await asyncio.to_thread(notify.send, dest, "DataBridge test message",
                                   f"This is a test from DataBridge, sent by {_name(request)}. Notifications work.", "/#/home")


# ---------------- audit ----------------
@router.get("/api/audit/export")
def audit_export(user: str | None = None, q: str | None = None, since: float | None = None):
    import csv
    import io
    import time
    from fastapi.responses import Response
    rows = auth.list_audit(5000, user, q)
    if since:
        rows = [r for r in rows if r["time"] >= since]
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["time_utc", "user", "action", "target", "status", "ip"])
    for r in rows:
        w.writerow([time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(r["time"])), r["username"], r["action"], r["target"], r["status"], r["ip"]])
    return Response(buf.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=databridge-audit.csv"})


# ---------------- budgets & invoices ----------------
@router.get("/api/budgets")
def bud_list(month: str | None = None):
    return {"budgets": budgets.list_budgets(month), "notify": notify.configured()}


@router.post("/api/budgets")
def bud_create(request: Request, body: dict = Body(...)):
    return budgets.save(body, None, _name(request))


@router.post("/api/budgets/check")
async def bud_check():
    await budgets.check_once()
    return {"budgets": budgets.list_budgets()}


@router.put("/api/budgets/{bid}")
def bud_update(bid: str, body: dict = Body(...)):
    return budgets.save(body, bid)


@router.delete("/api/budgets/{bid}")
def bud_delete(bid: str):
    budgets.delete(bid)
    return {"ok": True}


@router.post("/api/budgets/{bid}/lift")
def bud_lift(bid: str):
    budgets.lift(bid)
    return {"ok": True}


@router.get("/api/invoices")
def inv_list(month: str | None = None, by: str = "company"):
    return budgets.invoice_customers(month, by)


@router.get("/api/invoices/view")
def inv_view(month: str, customer: str, by: str = "company"):
    from fastapi.responses import HTMLResponse
    return HTMLResponse(budgets.invoice_html(month, customer, by))


# ---------------- SQL alerts ----------------
def _alert_owner_guard(request, aid):
    a = alerts.get(aid)
    u = _u(request)
    if not auth.is_admin(u) and a["owner"] != u.get("username"):
        raise HTTPException(403, "Only the alert's owner or an admin can change it")
    return a


@router.get("/api/alerts")
def al_list():
    out = []
    for a in alerts.list_alerts():
        out.append({**a, "condition": alerts.condition_text(a)})
    return {"alerts": out, "notify": notify.configured()}


@router.post("/api/alerts/preview")
async def al_preview(request: Request, body: dict = Body(...)):
    q = (body.get("query") or "").strip().rstrip(";")
    if not q:
        raise HTTPException(400, "Write a query first")
    res = await alerts.run_query(q, _u(request) or None, 50)
    return res


@router.post("/api/alerts")
def al_create(request: Request, body: dict = Body(...)):
    return alerts.save(body, None, _name(request))


@router.get("/api/alerts/{aid}")
def al_get(aid: str):
    a = alerts.get(aid)
    return {**a, "condition": alerts.condition_text(a)}


@router.put("/api/alerts/{aid}")
def al_update(request: Request, aid: str, body: dict = Body(...)):
    _alert_owner_guard(request, aid)
    return alerts.save(body, aid)


@router.delete("/api/alerts/{aid}")
def al_delete(request: Request, aid: str):
    _alert_owner_guard(request, aid)
    alerts.delete(aid)
    return {"ok": True}


@router.post("/api/alerts/{aid}/check")
async def al_check(aid: str):
    a = await alerts.check(aid, manual=True)
    return {**a, "condition": alerts.condition_text(a)}


# ---------------- BI endpoint (OData v4 for Power BI / Excel, CSV query URL) ----------------
def _odata_base(request: Request):
    from .settings import env
    base = (env("PUBLIC_URL") or "").rstrip("/") or str(request.base_url).rstrip("/")
    return f"{base}/api/odata/"


def _odata_json(d):
    from fastapi.responses import JSONResponse
    return JSONResponse(d, headers={"OData-Version": "4.0"}, media_type="application/json;odata.metadata=minimal")


@router.get("/api/odata")
@router.get("/api/odata/")
async def od_root(request: Request):
    sets = [odata.set_name(s, t) for s, t in await odata.tables(_u(request))]
    return _odata_json(odata.service_doc(_odata_base(request), sets))


@router.get("/api/odata/$metadata")
async def od_meta(request: Request):
    from fastapi.responses import Response
    return Response(await odata.metadata(_u(request)), media_type="application/xml", headers={"OData-Version": "4.0"})


@router.get("/api/odata/{name}/$count")
async def od_count(request: Request, name: str):
    from fastapi.responses import PlainTextResponse
    return PlainTextResponse(str(await odata.entity_set(_odata_base(request), name, dict(request.query_params), count_only=True)))


@router.get("/api/odata/{name}")
async def od_set(request: Request, name: str):
    s, t = odata.parse_set(name)
    if not governance.can(_u(request), f"{s}.{t}"):
        raise HTTPException(403, f"You don't have permission to read {s}.{t}")
    return _odata_json(await odata.entity_set(_odata_base(request), name, dict(request.query_params)))


@router.get("/api/bi/query")
async def bi_query(sql: str, format: str = "csv", limit: int = 100000):
    from fastapi.responses import Response
    res = await odata.run_query(sql, max(1, min(limit, 1_000_000)))
    if format == "json":
        return {"columns": res["columns"], "rows": res["rows"], "truncated": res.get("truncated")}
    return Response(odata.to_csv(res), media_type="text/csv; charset=utf-8")


@router.get("/api/bi/info")
def bi_info(request: Request):
    return {"odata_url": _odata_base(request), "query_url": _odata_base(request).replace("/api/odata/", "/api/bi/query"),
            "page_size": odata.page_size()}


# ---------------- lineage ----------------
@router.post("/api/lineage/events")
def lin_event(body: dict = Body(...)):
    return lineage.record(body)


@router.get("/api/lineage/graph")
def lin_graph(fq: str | None = None, depth: int = 3):
    return lineage.graph(fq, max(1, min(depth, 8)))


@router.get("/api/lineage/impact")
def lin_impact(fq: str, column: str | None = None):
    return lineage.impact(fq, column)


# ---------------- data quality ----------------
@router.get("/api/quality/overview")
def dq_overview():
    return {"tables": quality.overview()}


@router.get("/api/quality/table")
def dq_table(object: str):
    return quality.table_info(object)


@router.put("/api/quality/table")
def dq_table_save(object: str, body: dict = Body(...)):
    return quality.save_settings(object, body)


@router.post("/api/quality/rules")
def dq_rule_add(request: Request, body: dict = Body(...)):
    return quality.add_rule(body, _name(request))


@router.put("/api/quality/rules/{rid}")
def dq_rule_update(rid: str, body: dict = Body(...)):
    return quality.update_rule(rid, body)


@router.delete("/api/quality/rules/{rid}")
def dq_rule_delete(rid: str):
    quality.delete_rule(rid)
    return {"ok": True}


@router.post("/api/quality/run")
async def dq_run(body: dict = Body(...)):
    return await quality.run_checks(body.get("object"), body.get("trigger") or "manual")


@router.get("/api/quality/runs/{rid}")
def dq_run_get(rid: str):
    return quality.get_run(rid)


# ---------------- machine learning (MLflow) ----------------
@router.get("/api/ml/status")
async def ml_status():
    return await ml.status()


@router.post("/api/ml/start")
async def ml_start():
    await ml.ensure_server()
    return await ml.status()


@router.get("/api/ml/experiments")
async def ml_experiments():
    return {"experiments": await ml.experiments()}


@router.get("/api/ml/experiments/{eid}/runs")
async def ml_runs(eid: str):
    return {"runs": await ml.runs(eid)}


@router.get("/api/ml/models")
async def ml_models():
    return {"models": await ml.models()}


@router.get("/api/ml/models/{name}/versions")
async def ml_versions(name: str):
    return {"versions": await ml.versions(name)}


@router.post("/api/ml/models/{name}/alias")
async def ml_alias(name: str, body: dict = Body(...)):
    return await ml.set_alias(name, body.get("alias"), body.get("version"))


@router.get("/api/ml/serving")
def ml_endpoints():
    return {"endpoints": ml.endpoints()}


@router.post("/api/ml/serving")
async def ml_endpoint_new(request: Request, body: dict = Body(...)):
    return await ml.create_endpoint(body, _name(request))


@router.post("/api/ml/serving/{name}/invocations")
async def ml_invoke(name: str, request: Request):
    from fastapi.responses import Response
    code, content, ctype = await ml.invoke(name, await request.body(), request.headers.get("content-type"))
    return Response(content, status_code=code, media_type=ctype)


@router.get("/api/ml/serving/{name}/log")
def ml_endpoint_log(name: str):
    from fastapi.responses import PlainTextResponse
    return PlainTextResponse(ml.endpoint_log(name))


@router.post("/api/ml/serving/{name}/{action}")
async def ml_endpoint_action(name: str, action: str, body: dict = Body(default={})):
    if action not in ("start", "stop", "update", "delete"):
        raise HTTPException(404, "Unknown action")
    return await ml.endpoint_action(name, action, body)


_MLFLOW_READ = ("/search", "/get", "get-artifact", "/list", "artifacts/list", "metrics/get-history", "get-history-bulk")


@router.api_route("/mlflow", methods=["GET"])
@router.api_route("/mlflow/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
async def mlflow_proxy(request: Request, path: str = ""):
    """The MLflow UI and its API, for signed-in DataBridge users (viewers: read-only)."""
    import httpx
    from fastapi.responses import RedirectResponse, Response
    from . import features
    h = request.headers.get("authorization", "")
    bearer = h[7:].strip() if h.lower().startswith("bearer ") else None
    user = auth.resolve(request.cookies.get(auth.COOKIE), bearer)
    if user is None:
        return RedirectResponse("/#/ml", status_code=302) if request.method == "GET" and "api" not in path else Response(status_code=401)
    if features.blocked(user, "/api/ml/status"):
        return Response("Machine learning is turned off for your account.", status_code=403)
    if request.method != "GET" and user.get("role") == "viewer" and not any(k in path for k in _MLFLOW_READ):
        return Response('{"message": "Your role is Viewer (read-only)."}', status_code=403, media_type="application/json")
    await ml.ensure_server()
    url = f"http://127.0.0.1:{ml.port()}/mlflow/{path}"
    fwd = {k: v for k, v in request.headers.items() if k.lower() in ("content-type", "accept", "accept-encoding")}
    async with httpx.AsyncClient(timeout=300) as c:
        r = await c.request(request.method, url, params=request.query_params, content=await request.body(), headers=fwd)
    keep = {k: v for k, v in r.headers.items() if k.lower() in ("content-type", "content-encoding", "cache-control", "content-disposition", "etag", "last-modified")}
    return Response(r.content, status_code=r.status_code, headers=keep)


# ---------------- Ask data ----------------
@router.post("/api/ask")
async def ask_q(request: Request, body: dict = Body(...)):
    return await ask.ask(body.get("question"), _u(request) or None, body.get("history"), body.get("scope"))


@router.get("/api/ask/suggestions")
async def ask_suggest(request: Request):
    return {"suggestions": await ask.suggestions(_u(request) or None), "recent": ask.recent(_u(request))}
