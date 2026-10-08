"""DataBridge API server — serves the UI and the REST/WebSocket API."""
import asyncio
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Body, FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from . import admin, airflow, assistant, auth, background, catalog, compute, dag_studio, dash_ai, dash_story, dashboards, delta_ops, editor, git_ops, jobs, logs, pipelines, workspace
from .kernels import SQL_KEY, SqlError, kernels, run_sql
from .settings import settings

FRONTEND = Path(__file__).resolve().parent.parent / "frontend"


@asynccontextmanager
async def lifespan(_app):
    logs.setup()
    jobs.manager.startup()
    pipelines.engine.startup()
    reaper = asyncio.create_task(admin.idle_reaper())
    yield
    reaper.cancel()
    await pipelines.engine.shutdown()
    await jobs.manager.shutdown()
    await kernels.shutdown_all()


app = FastAPI(title="DataBridge", lifespan=lifespan)

NO_AUDIT = ("/api/auth/", "/api/editor/", "/api/sql/queries")


@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    path = request.url.path
    if not path.startswith("/api/"):
        return await call_next(request)
    h = request.headers.get("authorization", "")
    bearer = h[7:].strip() if h.lower().startswith("bearer ") else None
    user = auth.resolve(request.cookies.get(auth.COOKIE), bearer)
    ok, code, msg = auth.allowed(user, request.method, path)
    if not ok:
        return JSONResponse({"detail": msg}, status_code=code)
    request.state.user = user
    resp = await call_next(request)
    if (request.method not in ("GET", "HEAD", "OPTIONS") and user and user["id"] != "__service__"
            and not path.startswith(NO_AUDIT) and not path.endswith(("/query", "/options", "/preview")) and auth.AUTH_ENABLED):
        target = path + (f"?{request.url.query}" if request.url.query else "")
        auth.audit(user["username"], auth.describe(request.method, path), target, resp.status_code,
                   request.client.host if request.client else "")
    return resp


def _user(request: Request):
    return getattr(request.state, "user", None)


def _set_cookie(resp, request, token):
    resp.set_cookie(auth.COOKIE, token, max_age=auth.SESSION_HOURS * 3600, httponly=True, samesite="lax",
                    secure=request.url.scheme == "https", path="/")


@app.get("/api/auth/me")
def auth_me(request: Request):
    return {"auth_enabled": auth.AUTH_ENABLED, "needs_setup": auth.AUTH_ENABLED and auth.user_count() == 0,
            "user": _user(request) or auth.resolve(request.cookies.get(auth.COOKIE))}


@app.post("/api/auth/setup")
def auth_setup(request: Request, body: dict = Body(...)):
    if auth.user_count() > 0:
        raise HTTPException(409, "Setup is already done — sign in instead")
    auth.create_user({**body, "role": "admin"}, must_change=False)
    token, user = auth.login(body.get("username"), body.get("password"), request.client.host if request.client else "",
                             request.headers.get("user-agent", ""))
    auth.audit(user["username"], "setup.first_admin", user["username"])
    resp = JSONResponse({"user": user})
    _set_cookie(resp, request, token)
    return resp


@app.post("/api/auth/login")
def auth_login(request: Request, body: dict = Body(...)):
    token, user = auth.login(body.get("username"), body.get("password"), request.client.host if request.client else "",
                             request.headers.get("user-agent", ""))
    resp = JSONResponse({"user": user})
    _set_cookie(resp, request, token)
    return resp


@app.post("/api/auth/logout")
def auth_logout(request: Request):
    auth.logout(request.cookies.get(auth.COOKIE))
    resp = JSONResponse({"ok": True})
    resp.delete_cookie(auth.COOKIE, path="/")
    return resp


@app.post("/api/auth/password")
def auth_password(request: Request, body: dict = Body(...)):
    auth.change_own_password(_user(request), body.get("current"), body.get("new"))
    auth.audit(_user(request)["username"], "password.change", "")
    return {"ok": True}


@app.get("/api/auth/tokens")
def auth_tokens(request: Request):
    return auth.list_tokens(_user(request))


@app.post("/api/auth/tokens")
def auth_token_create(request: Request, body: dict = Body(...)):
    t = auth.create_token(_user(request), body.get("name"), int(body.get("days") or 90))
    auth.audit(_user(request)["username"], "token.create", t["name"])
    return t


@app.delete("/api/auth/tokens/{tid}")
def auth_token_revoke(request: Request, tid: str):
    auth.revoke_token(_user(request), tid)
    auth.audit(_user(request)["username"], "token.revoke", tid)
    return {"ok": True}


@app.get("/api/users")
def users_list():
    return auth.list_users()


@app.post("/api/users")
def users_create(body: dict = Body(...)):
    return auth.create_user(body, must_change=True)


@app.put("/api/users/{uid}")
def users_update(request: Request, uid: str, body: dict = Body(...)):
    return auth.update_user(uid, body, _user(request))


@app.delete("/api/users/{uid}")
def users_delete(request: Request, uid: str):
    return {"deleted": auth.delete_user(uid, _user(request))}


@app.get("/api/audit")
def audit_list(limit: int = 500, user: str | None = None, q: str | None = None):
    return auth.list_audit(limit, user, q)


@app.exception_handler(SqlError)
async def sql_error(_req, e: SqlError):
    return JSONResponse(status_code=400, content={"detail": f"{e.ename}: {e.evalue}", "traceback": e.traceback})


# ---------------- status ----------------
@app.get("/api/status")
def status():
    return {"workspace": str(settings.workspace), "catalog_backend": settings.catalog_backend,
            "metastore": bool(settings.metastore_dsn), "airflow": bool(settings.airflow_url),
            "airflow_api": settings.airflow_api, "kubernetes": settings.k8s_enabled,
            "spark_namespace": settings.spark_namespace,
            "spark_auto_init": settings.spark_auto_init}


@app.get("/api/search")
async def search(q: str):
    q = q.strip()
    if len(q) < 2:
        return {"notebooks": [], "tables": []}
    tables = []
    try:
        tables = await catalog.search(q)
    except Exception:  # noqa: BLE001
        pass
    return {"notebooks": workspace.search(q), "tables": tables}


# ---------------- workspace ----------------
class NewItem(BaseModel):
    parent: str = ""
    name: str
    kind: str = "notebook"


class RenameItem(BaseModel):
    path: str
    name: str


# ---------------- Workspace: Shared · Users/<you> · Repos/<you> (Git folders) ----------------
ROOT_DIRS = ("Shared", "Users", "Repos")


def _who(request: Request):
    u = getattr(request.state, "user", None) or {}
    return (u.get("username") or "local"), (u.get("role") or "admin")


def _ws_guard(request: Request, path: str):
    """Users/<x> and Repos/<x> are private to x (admins see everything)."""
    name, role = _who(request)
    parts = [p for p in (path or "").replace("\\", "/").split("/") if p]
    if len(parts) >= 2 and parts[0] in ("Users", "Repos") and parts[1] != name and role != "admin":
        raise HTTPException(403, "This folder belongs to another user")


def _ensure_roots(name: str):
    for d in ("Shared", f"Users/{name}", f"Repos/{name}"):
        (workspace.ROOT / d).mkdir(parents=True, exist_ok=True)


@app.get("/api/workspace")
def ws_list(request: Request, path: str = ""):
    name, role = _who(request)
    _ensure_roots(name)
    _ws_guard(request, path)
    data = workspace.list_dir(path)
    clean = path.strip("/")
    if clean in ("Users", "Repos") and role != "admin":
        data["items"] = [i for i in data["items"] if i["name"] == name]
    if not clean:                                            # root: the three special folders first
        order = {d: i for i, d in enumerate(ROOT_DIRS)}
        data["items"].sort(key=lambda i: (order.get(i["name"], 9) if i["type"] == "dir" else 10, i["name"].lower()))
        for i in data["items"]:
            if i["name"] in ROOT_DIRS and i["type"] == "dir":
                i["special"] = i["name"]
    for i in data["items"]:
        if i["type"] == "dir" and (workspace.resolve(i["path"]) / ".git").exists():
            g = git_ops.locate(i["path"])
            i["git"] = {"branch": g["branch"]} if g else None
    data["repo"] = git_ops.locate(path) if clean else None
    data["me"] = name
    return data


@app.get("/api/workspace/recent")
def ws_recent(request: Request):
    name, role = _who(request)
    items = workspace.recent()
    if role != "admin":
        items = [i for i in items if not (i["path"].split("/")[0] in ("Users", "Repos") and len(i["path"].split("/")) > 1 and i["path"].split("/")[1] != name)]
    return items


@app.post("/api/workspace")
def ws_create(request: Request, item: NewItem):
    _ws_guard(request, item.parent + "/x")
    if item.kind == "folder":
        return workspace.create_folder(item.parent, item.name)
    return workspace.create_notebook(item.parent, item.name)


@app.post("/api/workspace/rename")
def ws_rename(request: Request, item: RenameItem):
    _ws_guard(request, item.path)
    name, _ = _who(request)
    if item.path.strip("/") in ROOT_DIRS or item.path.strip("/") in (f"Users/{name}", f"Repos/{name}"):
        raise HTTPException(400, "This folder can't be renamed")
    return workspace.rename(item.path, item.name)


@app.delete("/api/workspace")
def ws_delete(request: Request, path: str):
    _ws_guard(request, path)
    p = path.strip("/")
    if p in ROOT_DIRS or (len(p.split("/")) == 2 and p.split("/")[0] in ("Users", "Repos")):
        raise HTTPException(400, "This folder can't be deleted")
    workspace.delete(path)
    return {"ok": True}


@app.get("/api/notebook")
def nb_read(request: Request, path: str):
    _ws_guard(request, path)
    out = workspace.read_notebook(path)
    try:
        out["git"] = git_ops.locate(path)
    except Exception:  # noqa: BLE001
        out["git"] = None
    return out


@app.put("/api/notebook")
def nb_save(request: Request, path: str, content: dict = Body(...), manual: bool = False):
    _ws_guard(request, path)
    return workspace.save_notebook(path, content, manual)


@app.get("/api/notebook/revisions")
def nb_revisions(request: Request, path: str):
    _ws_guard(request, path)
    return workspace.list_revisions(path)


@app.get("/api/notebook/revisions/{rev}")
def nb_revision(request: Request, rev: str, path: str):
    _ws_guard(request, path)
    return workspace.read_revision(path, rev)


@app.post("/api/notebook/revisions/{rev}/restore")
def nb_restore(request: Request, rev: str, path: str):
    _ws_guard(request, path)
    return workspace.restore_revision(path, rev)


# ---------------- Git folders ----------------
def _repo_guard(request: Request, path: str):
    _ws_guard(request, path)
    return _who(request)[0]


@app.get("/api/git/credentials")
def git_creds(request: Request):
    return {**git_ops.creds_public(_who(request)[0]), "git_installed": git_ops.git_available()}


@app.put("/api/git/credentials")
def git_creds_save(request: Request, body: dict = Body(...)):
    return git_ops.save_creds(_who(request)[0], body)


@app.post("/api/git/clone")
def git_clone(request: Request, body: dict = Body(...)):
    return git_ops.clone(_who(request)[0], body.get("url"), body.get("name"), body.get("branch") or None)


@app.get("/api/git/repo")
def git_repo(request: Request, path: str):
    return git_ops.info(path, _repo_guard(request, path))


@app.get("/api/git/locate")
def git_locate(request: Request, path: str):
    _ws_guard(request, path)
    return git_ops.locate(path) or {}


@app.post("/api/git/checkout")
def git_checkout(request: Request, body: dict = Body(...)):
    return git_ops.checkout(body.get("path", ""), _repo_guard(request, body.get("path", "")), body.get("branch"), bool(body.get("create")), body.get("base"))


@app.post("/api/git/fetch")
def git_fetch(request: Request, body: dict = Body(...)):
    return git_ops.fetch(body.get("path", ""), _repo_guard(request, body.get("path", "")))


@app.post("/api/git/pull")
def git_pull(request: Request, body: dict = Body(...)):
    return git_ops.pull(body.get("path", ""), _repo_guard(request, body.get("path", "")))


@app.post("/api/git/commit")
def git_commit(request: Request, body: dict = Body(...)):
    return git_ops.commit(body.get("path", ""), _repo_guard(request, body.get("path", "")), body.get("message"), body.get("files") or [], bool(body.get("push")))


@app.post("/api/git/push")
def git_push(request: Request, body: dict = Body(...)):
    return git_ops.push_(body.get("path", ""), _repo_guard(request, body.get("path", "")))


@app.post("/api/git/discard")
def git_discard(request: Request, body: dict = Body(...)):
    return git_ops.discard(body.get("path", ""), _repo_guard(request, body.get("path", "")), body.get("files") or [])


@app.post("/api/git/branch/delete")
def git_branch_delete(request: Request, body: dict = Body(...)):
    return git_ops.delete_branch(body.get("path", ""), _repo_guard(request, body.get("path", "")), body.get("branch"), bool(body.get("remote")))


@app.get("/api/git/history")
def git_history(request: Request, path: str):
    return git_ops.history(path, _repo_guard(request, path))


@app.get("/api/git/diff")
def git_diff(request: Request, path: str, file: str):
    return git_ops.diff(path, _repo_guard(request, path), file)


# ---------------- kernels ----------------
@app.get("/api/kernels")
def k_list():
    return kernels.list()


@app.post("/api/kernels")
async def k_start(path: str = Body(..., embed=True)):
    workspace.resolve(path)
    ks = await kernels.get_or_start(f"nb:{path}", path, {"DATABRIDGE_NOTEBOOK_PATH": path})
    return ks.info()


def _kernel(kid):
    ks = kernels.get(kid)
    if not ks:
        raise HTTPException(404, "Kernel not found")
    return ks


@app.get("/api/kernels/{kid}")
def k_info(kid: str):
    return _kernel(kid).info()


@app.post("/api/kernels/{kid}/interrupt")
async def k_interrupt(kid: str):
    ks = _kernel(kid)
    background.runs_for(ks).batch_abort = True
    await ks.interrupt()
    return {"ok": True}


@app.post("/api/kernels/{kid}/restart")
async def k_restart(kid: str):
    ks = _kernel(kid)
    await ks.restart()
    return ks.info()


@app.delete("/api/kernels/{kid}")
async def k_shutdown(kid: str):
    await kernels.shutdown(kid)
    background.drop_runs(kid)
    return {"ok": True}


@app.websocket("/ws/kernels/{kid}")
async def k_socket(ws: WebSocket, kid: str):
    """Attach a browser to a notebook kernel. Execution runs on the server and survives page switches:
    on (re)connect the browser gets a snapshot of running/finished cells, then live updates."""
    await ws.accept()
    ws_user = auth.resolve(ws.cookies.get(auth.COOKIE))
    if ws_user is None:
        await ws.send_json({"type": "error", "message": "Sign in required"})
        await ws.close(code=4401)
        return
    ks = kernels.get(kid)
    if not ks:
        await ws.send_json({"type": "error", "message": "Kernel not found"})
        await ws.close()
        return
    runs = background.runs_for(ks)
    send_lock = asyncio.Lock()

    async def send(msg):
        async with send_lock:
            await ws.send_json(msg)

    runs.subscribers.add(send)
    try:
        await send({"type": "snapshot", "cells": runs.snapshot()})
        await send({"type": "state", **runs.state})
        asyncio.create_task(runs.refresh_state())
        while True:
            msg = await ws.receive_json()
            action = msg.get("action")
            if ws_user["role"] == "viewer" and action not in auth.WS_VIEWER_OK:
                await send({"type": "error", "message": "Your role is Viewer (read-only) — you can't run code."})
                continue
            if action == "execute":
                asyncio.create_task(runs.run_one(msg["cell_id"], msg.get("code", "")))
            elif action == "execute_many":
                asyncio.create_task(runs.run_many(msg.get("cells", [])))
            elif action == "interrupt":
                runs.batch_abort = True
                await ks.interrupt()
            elif action == "status":
                await send({"type": "status", "kernel": ks.info()})
            elif action == "set_widget":
                asyncio.create_task(runs.set_widget(msg.get("name"), msg.get("value", "")))
            elif action == "refresh_state":
                asyncio.create_task(runs.refresh_state())
            elif action in ("complete", "preview", "inspect"):
                async def reply(m=msg):
                    try:
                        if m["action"] == "complete":
                            data = await ks.complete(m.get("code", ""), int(m.get("cursor", 0)))
                        elif m["action"] == "inspect":
                            data = await ks.inspect(m.get("code", ""), int(m.get("cursor", 0)), int(m.get("detail", 0)))
                        else:
                            data = await runs.preview(m.get("name", ""))
                    except Exception as e:  # noqa: BLE001
                        data = {"error": str(e)}
                    await send({"type": m["action"], "req": m.get("req"), "data": data})
                asyncio.create_task(reply())
    except WebSocketDisconnect:
        pass
    finally:
        runs.subscribers.discard(send)


# ---------------- Logs centre ----------------
def _not_viewer(request: Request):
    u = getattr(request.state, "user", None)
    if u and u.get("role") == "viewer":
        raise HTTPException(403, "Logs are available to editors and admins")


@app.get("/api/logs/sources")
def logs_sources(request: Request):
    _not_viewer(request)
    return logs.sources(kernels, jobs.store)


@app.get("/api/logs/read")
def logs_read(request: Request, source: str, lines: int = 800, q: str = "", level: str = ""):
    _not_viewer(request)
    return logs.read(source, jobs.store, max(50, min(lines, 5000)), q, level)


# ---------------- Airflow DAG studio ----------------
@app.get("/api/airflow-studio/files")
def dagst_files():
    return dag_studio.list_files()


@app.get("/api/airflow-studio/templates")
def dagst_templates():
    return [{"id": k, "name": v[0], "code": v[1]} for k, v in dag_studio.TEMPLATES.items()]


@app.get("/api/airflow-studio/files/{name}")
def dagst_read(name: str):
    return dag_studio.read(name)


@app.put("/api/airflow-studio/files/{name}")
def dagst_save(name: str, body: dict = Body(...)):
    return dag_studio.save(name, body.get("code") or "", body.get("deploy", True) is not False, body.get("message") or "")


@app.delete("/api/airflow-studio/files/{name}")
def dagst_delete(name: str):
    return dag_studio.delete(name)


@app.post("/api/airflow-studio/validate")
def dagst_validate(body: dict = Body(...)):
    return dag_studio.validate(body.get("code") or "")


@app.get("/api/airflow-studio/embed-check")
async def dagst_embed():
    return await dag_studio.embed_check()


@app.get("/api/airflow-studio/status/{name}")
async def dagst_status(name: str):
    return await dag_studio.status(name)


# ---------------- Dashboards ----------------
@app.get("/api/dashboards")
def dash_list():
    return dashboards.list_dashboards()


@app.post("/api/dashboards")
def dash_create(request: Request, body: dict = Body(...)):
    u = getattr(request.state, "user", None) or {}
    return dashboards.create_dashboard(body, u.get("username", ""))


@app.get("/api/dashboards/ai/template")
async def dash_ai_template():
    return {"template": dash_ai.TEMPLATE, "tables": await dash_ai.list_tables()}


@app.post("/api/dashboards/{did}/story")
async def dash_story_ep(did: str, body: dict = Body(...)):
    """Slides + narration for one dashboard page (facts computed in the browser)."""
    return await dash_story.story(body)


@app.post("/api/dashboards/ai/plan")
async def dash_ai_plan(body: dict = Body(...)):
    """Design a dashboard for review (nothing is saved). body: {prompt, tables?, schema?, use_ai?}"""
    return await dash_ai.plan(body.get("prompt"), body.get("tables") or [], body.get("use_ai", True) is not False, body.get("schema") or None)


@app.post("/api/dashboards/ai/create")
def dash_ai_create(request: Request, body: dict = Body(...)):
    """Save a reviewed plan. body: {name, description, definition}"""
    defn = body.get("definition") or {}
    if not defn.get("widgets"):
        raise HTTPException(400, "Keep at least one widget.")
    dash_ai.compact(defn)
    u = getattr(request.state, "user", None) or {}
    d = dashboards.create_dashboard({"name": (body.get("name") or "AI dashboard").strip() or "AI dashboard",
                                     "description": body.get("description") or "", "definition": defn}, u.get("username", ""))
    return {"id": d["id"], "name": d["name"], "widgets": len(defn["widgets"]), "pages": [p["name"] for p in defn["pages"]]}


@app.post("/api/dashboards/ai/build")
async def dash_ai_build(request: Request, body: dict = Body(...)):
    """One step: plan and save (kept for scripts)."""
    out = await dash_ai.plan(body.get("prompt"), body.get("tables") or [], body.get("use_ai", True) is not False, body.get("schema") or None)
    u = getattr(request.state, "user", None) or {}
    d = dashboards.create_dashboard({"name": (body.get("name") or out["name"]).strip() or "AI dashboard",
                                     "description": out["description"], "definition": out["definition"]}, u.get("username", ""))
    return {"id": d["id"], "name": d["name"], "warnings": out["warnings"], "used_ai": out["used_ai"], "tables": out["tables"],
            "widgets": len(out["definition"]["widgets"]), "pages": [p["name"] for p in out["definition"]["pages"]]}


@app.get("/api/dashboards/{did}")
def dash_get(did: str):
    return dashboards.get_dashboard(did)


@app.put("/api/dashboards/{did}")
def dash_save(did: str, body: dict = Body(...)):
    return dashboards.save_dashboard(did, body)


@app.delete("/api/dashboards/{did}")
def dash_delete(did: str):
    dashboards.delete_dashboard(did)
    return {"ok": True}


@app.post("/api/dashboards/{did}/query")
async def dash_query(did: str, body: dict = Body(...)):
    """body: {dataset, params, force} — or {sql, params} to preview unsaved SQL (editors only)."""
    return await dashboards.query(did, body.get("dataset"), body.get("params") or {}, bool(body.get("force")))


@app.post("/api/dashboards/{did}/preview")
async def dash_preview(did: str, body: dict = Body(...)):
    return await dashboards.query(did, None, body.get("params") or {}, True, body.get("sql") or "")


@app.post("/api/dashboards/{did}/options")
async def dash_options(did: str, body: dict = Body(...)):
    return await dashboards.filter_options(did, body.get("dataset"), body.get("column"))


# ---------------- Admin: health, settings, kernel manager ----------------
@app.get("/api/admin/health")
async def adm_health(deep: bool = False):
    return await admin.health(deep)


@app.get("/api/admin/settings")
def adm_settings():
    return admin.get_settings()


@app.put("/api/admin/settings")
def adm_save_settings(body: dict = Body(...)):
    return admin.save_settings(body.get("values") or {})


@app.post("/api/admin/apply")
async def adm_apply():
    """Reload .env into this server and stop kernels so they restart with the new settings."""
    from dotenv import load_dotenv
    load_dotenv(admin.ENV_PATH, override=True)
    stopped = await admin.stop_kernels(idle_only=False)
    return {"reloaded": True, "stopped": stopped}


@app.get("/api/admin/kernels")
def adm_kernels():
    return admin.kernel_stats()


@app.post("/api/admin/kernels/stop")
async def adm_stop(body: dict = Body(default={})):
    idle = bool(body.get("idleOnly"))
    return {"stopped": await admin.stop_kernels(idle_only=idle, idle_minutes=int(body.get("idleMinutes") or 10))}


@app.post("/api/admin/kill-orphans")
def adm_kill():
    return {"killed": admin.kill_orphans()}


# ---------------- Pipelines (ADF-style) ----------------
@app.get("/api/linked-services")
def ls_list():
    return pipelines.list_linked()


@app.post("/api/linked-services")
def ls_create(body: dict = Body(...)):
    return pipelines.save_linked(body)


@app.put("/api/linked-services/{ls_id}")
def ls_update(ls_id: str, body: dict = Body(...)):
    return pipelines.save_linked(body, ls_id)


@app.delete("/api/linked-services/{ls_id}")
def ls_delete(ls_id: str):
    pipelines.delete_linked(ls_id)
    return {"ok": True}


@app.post("/api/linked-services/test")
async def ls_test(body: dict = Body(...)):
    return await pipelines.test_linked(body)


@app.get("/api/pipelines")
def pl_list():
    return pipelines.list_pipelines()


@app.post("/api/pipelines")
def pl_create(body: dict = Body(...)):
    return pipelines.create_pipeline(body)


@app.get("/api/pipeline-runs")
def pl_all_runs(limit: int = 50):
    return pipelines.list_runs(None, limit)


@app.get("/api/pipeline-runs/{rid}")
def pl_run(rid: str):
    return pipelines.get_run(rid)


@app.post("/api/pipeline-runs/{rid}/cancel")
async def pl_cancel(rid: str):
    return await pipelines.engine.cancel(rid)


@app.post("/api/pipeline-runs/{rid}/rerun")
async def pl_rerun(rid: str, body: dict = Body(default={})):
    return pipelines.engine.rerun(rid, bool(body.get("fromFailed")))


@app.get("/api/pipelines/{pid}")
def pl_get(pid: str):
    return pipelines.get_pipeline(pid)


@app.put("/api/pipelines/{pid}")
def pl_save(pid: str, body: dict = Body(...)):
    return pipelines.save_draft(pid, body)


@app.delete("/api/pipelines/{pid}")
def pl_delete(pid: str):
    pipelines.delete_pipeline(pid)
    return {"ok": True}


@app.post("/api/pipelines/{pid}/validate")
def pl_validate(pid: str, body: dict = Body(default={})):
    defn = body.get("definition") or pipelines.get_pipeline(pid)["draft"]
    return {"errors": pipelines.validate(defn)}


@app.post("/api/pipelines/{pid}/publish")
def pl_publish(pid: str):
    return pipelines.publish(pid)


@app.post("/api/pipelines/{pid}/runs")
async def pl_trigger(pid: str, body: dict = Body(default={})):
    """Manual / API trigger. body: {"parameters": {...}, "debug": false}"""
    return pipelines.engine.start(pid, body.get("parameters") or {}, debug=bool(body.get("debug")),
                                  trigger={"type": "Debug" if body.get("debug") else "Manual",
                                           "name": "Debug" if body.get("debug") else "Manual",
                                           "time": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat()})


@app.get("/api/pipelines/{pid}/runs")
def pl_runs(pid: str, limit: int = 50):
    return pipelines.list_runs(pid, limit)


# ---------------- Dora (AI assistant) ----------------
@app.get("/api/dora/status")
async def dora_status():
    return await assistant.status()


@app.post("/api/dora/chat")
async def dora_chat(body: dict = Body(...)):
    return StreamingResponse(assistant.stream_chat(body), media_type="text/plain; charset=utf-8",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


# ---------------- editor services ----------------
@app.post("/api/editor/lint")
def ed_lint(body: dict = Body(...)):
    return editor.lint(body.get("cells") or [], body.get("names") or [])


@app.post("/api/editor/format")
def ed_format(body: dict = Body(...)):
    return editor.format_code(body.get("source") or "")


# ---------------- SQL ----------------
class SqlBody(BaseModel):
    query: str
    limit: int | None = None


@app.post("/api/sql")
async def sql(body: SqlBody):
    return await run_sql(body.query, body.limit)


@app.post("/api/sql/submit")
async def sql_submit(body: SqlBody):
    return background.submit_query(body.query, body.limit)


@app.get("/api/sql/queries")
async def sql_queries():
    return background.list_queries()


@app.get("/api/sql/queries/{qid}")
async def sql_query(qid: str):
    q = background.get_query(qid)
    if not q:
        raise HTTPException(404, "Query not found (DataBridge was restarted)")
    return q


@app.post("/api/sql/cancel")
async def sql_cancel():
    ks = kernels.for_key(SQL_KEY)
    if ks:
        await ks.interrupt()
    return {"ok": True}


# ---------------- catalog ----------------
@app.get("/api/catalog/databases")
async def cat_dbs():
    return await catalog.databases()


@app.post("/api/catalog/databases")
async def cat_create_db(name: str = Body(...), comment: str | None = Body(None), location: str | None = Body(None)):
    return await catalog.create_schema(name, comment, location)


@app.get("/api/catalog/databases/{db}/tables")
async def cat_tables(db: str):
    return await catalog.tables(db)


@app.get("/api/catalog/databases/{db}/tables/{name}")
async def cat_table(db: str, name: str):
    return await catalog.table(db, name)


@app.get("/api/catalog/databases/{db}/tables/{name}/sample")
async def cat_sample(db: str, name: str, limit: int = 100):
    return await catalog.sample(db, name, limit)


@app.get("/api/catalog/databases/{db}/tables/{name}/delta/detail")
async def delta_detail(db: str, name: str):
    return await delta_ops.detail(db, name)


@app.get("/api/catalog/databases/{db}/tables/{name}/delta/history")
async def delta_history(db: str, name: str, limit: int = 100):
    return await delta_ops.history(db, name, max(1, min(limit, 500)))


@app.get("/api/catalog/databases/{db}/tables/{name}/delta/version/{version}")
async def delta_version(db: str, name: str, version: int, limit: int = 1000):
    return await delta_ops.version_rows(db, name, version, max(1, min(limit, 5000)))


@app.get("/api/catalog/databases/{db}/tables/{name}/delta/compare/{version}")
async def delta_compare(db: str, name: str, version: int):
    return await delta_ops.compare(db, name, version)


@app.post("/api/catalog/databases/{db}/tables/{name}/delta/action")
async def delta_action(db: str, name: str, body: dict = Body(...)):
    """OPTIMIZE / VACUUM / RESTORE / statistics / clustering / properties / convert. {preview_sql: true} returns the SQL only."""
    return await delta_ops.action(db, name, body)


@app.get("/api/catalog/databases/{db}/tables/{name}/history")
async def cat_history(db: str, name: str):
    return await catalog.history(db, name)


@app.get("/api/catalog/databases/{db}/tables/{name}/ddl")
async def cat_ddl(db: str, name: str):
    return await catalog.ddl(db, name)


@app.delete("/api/catalog/databases/{db}/tables/{name}")
async def cat_drop(db: str, name: str):
    return await catalog.drop_table(db, name)


# ---------------- workflows ----------------
@app.get("/api/workflows")
async def wf_list():
    return await airflow.list_workflows()


@app.get("/api/workflows/{dag_id}")
async def wf_get(dag_id: str):
    return await airflow.workflow(dag_id)


@app.post("/api/workflows/{dag_id}/trigger")
async def wf_trigger(dag_id: str, conf: dict = Body(default={}, embed=True)):
    return await airflow.trigger(dag_id, conf)


@app.post("/api/workflows/{dag_id}/pause")
async def wf_pause(dag_id: str, paused: bool = Body(..., embed=True)):
    return await airflow.set_paused(dag_id, paused)


@app.get("/api/workflows/{dag_id}/runs/{run_id}/tasks")
async def wf_tis(dag_id: str, run_id: str):
    return await airflow.task_instances(dag_id, run_id)


@app.get("/api/workflows/{dag_id}/runs/{run_id}/tasks/{task_id}/log", response_class=PlainTextResponse)
async def wf_log(dag_id: str, run_id: str, task_id: str, try_number: int = 1):
    return await airflow.task_log(dag_id, run_id, task_id, try_number)


@app.post("/api/workflows/{dag_id}/runs/{run_id}/clear-failed")
async def wf_clear(dag_id: str, run_id: str):
    return await airflow.clear_failed(dag_id, run_id)


# ---------------- jobs (Databricks-style) ----------------
@app.get("/api/jobs")
async def jb_list(runs: int = 10):
    return jobs.manager.list_jobs(runs)


@app.post("/api/jobs")
async def jb_create(body: dict = Body(...)):
    return jobs.manager.create_job(body)


@app.get("/api/jobs/cron-preview")
async def jb_cron(expr: str, tz: str = "UTC"):
    return {"next": jobs.cron_preview(expr, tz)}


@app.get("/api/jobs/notebooks")
async def jb_notebooks():
    return jobs.all_notebooks()


@app.get("/api/jobs/{job_id}")
async def jb_get(job_id: str):
    return jobs.manager.get_job(job_id)


@app.put("/api/jobs/{job_id}")
async def jb_update(job_id: str, body: dict = Body(...)):
    return jobs.manager.update_job(job_id, body)


@app.delete("/api/jobs/{job_id}")
async def jb_delete(job_id: str):
    jobs.manager.delete_job(job_id)
    return {"ok": True}


@app.post("/api/jobs/{job_id}/pause")
async def jb_pause(job_id: str, paused: bool = Body(..., embed=True)):
    return jobs.manager.set_paused(job_id, paused)


@app.post("/api/jobs/{job_id}/run")
async def jb_run(job_id: str, parameters: dict = Body(default={}, embed=True)):
    return jobs.manager.trigger(job_id, parameters)


@app.get("/api/jobs/{job_id}/runs")
async def jb_runs(job_id: str, limit: int = 10):
    return jobs.manager.list_runs(job_id, limit)


@app.post("/api/notebook-runs")
async def nr_start(body: dict = Body(...)):
    return jobs.manager.run_notebook(body.get("path", ""), body.get("arguments") or {},
                                     body.get("timeout_seconds") or 0, body.get("parent"), body.get("cluster"))


@app.get("/api/notebook-runs")
async def nr_list(limit: int = 50):
    return jobs.manager.list_notebook_runs(limit)


@app.get("/api/runs/{run_id}")
async def rn_get(run_id: str):
    return jobs.manager.get_run(run_id)


@app.get("/api/runs/{run_id}/tasks/{task_run_id}")
async def rn_task(run_id: str, task_run_id: str):
    return jobs.manager.get_task_run(task_run_id)


@app.post("/api/runs/{run_id}/tasks/{task_run_id}/clone")
async def rn_clone(run_id: str, task_run_id: str):
    return jobs.manager.clone_task_run(task_run_id)


@app.post("/api/runs/{run_id}/cancel")
async def rn_cancel(run_id: str):
    return await jobs.manager.cancel(run_id)


@app.post("/api/runs/{run_id}/repair")
async def rn_repair(run_id: str):
    return jobs.manager.repair(run_id)


# ---------------- compute ----------------
@app.get("/api/compute/spark-apps")
def cp_apps():
    return compute.spark_apps()


@app.get("/api/compute/spark-apps/{name}/log", response_class=PlainTextResponse)
def cp_log(name: str, tail: int = 500):
    return compute.driver_log(name, tail)


@app.delete("/api/compute/spark-apps/{name}")
def cp_delete(name: str):
    return compute.delete_app(name)


# ---------------- UI ----------------
app.mount("/static", StaticFiles(directory=FRONTEND), name="static")


@app.get("/")
def index():
    return FileResponse(FRONTEND / "index.html")


def run():
    import uvicorn
    admin.startup_report()
    uvicorn.run("backend.main:app", host=settings.host, port=settings.port)


if __name__ == "__main__":
    run()
