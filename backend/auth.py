"""DataBridge authentication & authorisation.

Roles:  admin  — everything (users, settings, linked services, audit)
        editor — build and run notebooks, SQL, jobs, pipelines, dashboards
        viewer — read-only (browse, view results and runs); cannot run code or change anything
Sessions: HttpOnly cookie. Scripts: personal access tokens (Authorization: Bearer dbt_…).
Kernels call the API with an internal per-process token (DATABRIDGE_API_TOKEN)."""
import hashlib
import hmac
import os
import re
import secrets
import time
import uuid

from fastapi import HTTPException

from .jobs import store
from .settings import env

AUTH_ENABLED = (env("AUTH_ENABLED", "true") or "true").lower() != "false"
SESSION_HOURS = int(env("SESSION_HOURS", "12") or 12)
COOKIE = "databridge_session"
INTERNAL_TOKEN = secrets.token_urlsafe(32)   # new every server start; given to kernels only
ROLES = ("super_admin", "admin", "editor", "viewer")
ADMIN_ROLES = ("super_admin", "admin")


def is_admin(u):
    return bool(u) and u.get("role") in ADMIN_ROLES
ITERATIONS = 240_000

store.db.executescript("""
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE COLLATE NOCASE, name TEXT, email TEXT,
  password_hash TEXT, role TEXT, active INTEGER DEFAULT 1, created REAL, last_login REAL, must_change INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id TEXT, created REAL, expires REAL, ip TEXT, agent TEXT);
CREATE TABLE IF NOT EXISTS api_tokens (id TEXT PRIMARY KEY, user_id TEXT, name TEXT, token_hash TEXT UNIQUE, prefix TEXT,
  created REAL, expires REAL, last_used REAL);
CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY AUTOINCREMENT, time REAL, username TEXT, action TEXT, target TEXT,
  status INTEGER, ip TEXT);
CREATE INDEX IF NOT EXISTS audit_time ON audit(time);
CREATE TABLE IF NOT EXISTS login_fail (username TEXT PRIMARY KEY, count INTEGER, until REAL);
""")
for _col in ("company TEXT", "pending INTEGER DEFAULT 0"):          # sign-up (added later): company, waiting for approval
    try:
        store.db.execute(f"ALTER TABLE users ADD COLUMN {_col}")
    except Exception:  # noqa: BLE001 - column exists
        pass
store.db.commit()


def _now():
    return time.time()


def _sha(s):
    return hashlib.sha256(s.encode()).hexdigest()


# ------------------------------------------------------------------ passwords
def hash_password(pw: str) -> str:
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", pw.encode(), salt, ITERATIONS)
    return f"pbkdf2_sha256${ITERATIONS}${salt.hex()}${dk.hex()}"


def verify_password(pw: str, stored: str) -> bool:
    try:
        _, it, salt, h = stored.split("$")
        dk = hashlib.pbkdf2_hmac("sha256", pw.encode(), bytes.fromhex(salt), int(it))
        return hmac.compare_digest(dk.hex(), h)
    except Exception:  # noqa: BLE001
        return False


def _check_password(pw):
    if len(pw or "") < 8:
        raise HTTPException(400, "Password must be at least 8 characters")
    if not (re.search(r"[A-Za-z]", pw) and re.search(r"\d", pw)):
        raise HTTPException(400, "Password must contain letters and numbers")


# ------------------------------------------------------------------ users
def _public(u):
    if not u:
        return None
    keys = u.keys() if hasattr(u, "keys") else u
    return {k: u[k] for k in ("id", "username", "name", "email", "role", "active", "created", "last_login", "must_change", "company", "pending") if k in keys}


def user_count():
    return store.one("SELECT COUNT(*) AS n FROM users")["n"]


def list_users():
    return [_public(u) for u in store.q("SELECT * FROM users ORDER BY username COLLATE NOCASE")]


def create_user(body, must_change=True, actor=None):
    if body.get("role") == "super_admin" and actor is not None and actor.get("role") != "super_admin":
        raise HTTPException(403, "Only a super admin can create another super admin")
    username = (body.get("username") or "").strip()
    if not re.fullmatch(r"[A-Za-z0-9._@-]{3,64}", username):
        raise HTTPException(400, "Username: 3-64 letters, digits, . _ @ -")
    role = body.get("role") or "viewer"
    if role not in ROLES:
        raise HTTPException(400, f"Role must be one of {', '.join(ROLES)}")
    _check_password(body.get("password"))
    uid = uuid.uuid4().hex[:10]
    try:
        store.x("INSERT INTO users (id, username, name, email, password_hash, role, active, created, must_change) VALUES (?,?,?,?,?,?,1,?,?)",
                (uid, username, body.get("name") or username, body.get("email") or "", hash_password(body["password"]), role, _now(),
                 1 if must_change else 0))
    except Exception:
        raise HTTPException(409, f"User {username!r} already exists")
    return _public(store.one("SELECT * FROM users WHERE id=?", (uid,)))


# ------------------------------------------------------------------ self sign-up
_EMAIL = re.compile(r"^[^@\s]{1,64}@[^@\s]{1,190}\.[A-Za-z]{2,}$")
_signup_hits = {}


def signup_settings():
    on = lambda k, d: (env(k, d) or d).lower() not in ("false", "0", "no", "off")  # noqa: E731
    role = (env("SIGNUP_ROLE", "viewer") or "viewer").lower()
    return {"enabled": AUTH_ENABLED and on("SIGNUP_ENABLED", "true"), "approval": on("SIGNUP_APPROVAL", "true"),
            "role": role if role in ("viewer", "editor") else "viewer"}


def signup(body, ip=""):
    """Create an account from the sign-in page. With approval on (default) it waits until an admin approves it."""
    st = signup_settings()
    if not st["enabled"]:
        raise HTTPException(403, "Sign-up is turned off on this DataBridge. Ask an admin for an account.")
    if body.get("website"):                          # hidden field: only bots fill it in
        return {"pending": True, "username": ""}
    now = _now()
    hits = [t for t in _signup_hits.get(ip, []) if now - t < 3600]
    if len(hits) >= 5:
        raise HTTPException(429, "Too many sign-ups from this network. Try again in an hour.")
    _signup_hits[ip] = hits + [now]
    email = (body.get("email") or "").strip().lower()
    if not _EMAIL.match(email):
        raise HTTPException(400, "Enter a valid work email")
    name = (body.get("name") or "").strip()[:120]
    if not name:
        raise HTTPException(400, "Enter your name")
    company = (body.get("company") or "").strip()[:120]
    username = email
    _check_password(body.get("password"))
    if store.one("SELECT id FROM users WHERE username=? OR lower(email)=?", (username, email)):
        raise HTTPException(409, "An account with this email already exists — sign in instead")
    uid = uuid.uuid4().hex[:10]
    store.x("INSERT INTO users (id, username, name, email, password_hash, role, active, created, must_change, company, pending) "
            "VALUES (?,?,?,?,?,?,?,?,0,?,?)",
            (uid, username, name, email, hash_password(body["password"]), st["role"], 0 if st["approval"] else 1, now, company,
             1 if st["approval"] else 0))
    audit(username, "signup", company or "", 200, ip)
    return {"pending": st["approval"], "username": username}


def update_user(uid, body, actor):
    u = store.one("SELECT * FROM users WHERE id=?", (uid,))
    if not u:
        raise HTTPException(404, "User not found")
    fields = {}
    for k in ("name", "email"):
        if k in body:
            fields[k] = body[k] or ""
    if "role" in body:
        if body["role"] not in ROLES:
            raise HTTPException(400, "Invalid role")
        if (body["role"] == "super_admin" or u["role"] == "super_admin") and body["role"] != u["role"] and (actor or {}).get("role") != "super_admin":
            raise HTTPException(403, "Only a super admin can grant or remove super admin")
        fields["role"] = body["role"]
    if u["role"] == "super_admin" and (actor or {}).get("role") != "super_admin" and set(body) - {"name", "email"}:
        raise HTTPException(403, "Only a super admin can change a super admin account")
    if "active" in body:
        fields["active"] = 1 if body["active"] else 0
        if body["active"]:
            fields["pending"] = 0                   # approving a sign-up
    if body.get("password"):
        _check_password(body["password"])
        fields["password_hash"] = hash_password(body["password"])
        fields["must_change"] = 1
    if u["role"] == "super_admin" and (fields.get("role", "super_admin") != "super_admin" or fields.get("active", 1) == 0) and _supers() <= 1:
        raise HTTPException(409, "You can't remove the last super admin")
    demoting = fields.get("role", u["role"]) not in ADMIN_ROLES or fields.get("active", u["active"]) == 0
    if u["role"] in ADMIN_ROLES and demoting and _admins() <= 1:
        raise HTTPException(409, "You can't remove the last active admin")
    if fields:
        store.update("users", uid, **fields)
    if "password_hash" in fields or fields.get("active") == 0:
        store.x("DELETE FROM sessions WHERE user_id=?", (uid,))
    return _public(store.one("SELECT * FROM users WHERE id=?", (uid,)))


def delete_user(uid, actor):
    u = store.one("SELECT * FROM users WHERE id=?", (uid,))
    if not u:
        raise HTTPException(404, "User not found")
    if u["id"] == actor["id"]:
        raise HTTPException(409, "You can't delete yourself")
    if u["role"] == "super_admin" and (actor or {}).get("role") != "super_admin":
        raise HTTPException(403, "Only a super admin can delete a super admin")
    if u["role"] == "super_admin" and _supers() <= 1:
        raise HTTPException(409, "You can't delete the last super admin")
    if u["role"] in ADMIN_ROLES and _admins() <= 1:
        raise HTTPException(409, "You can't delete the last admin")
    for t in ("sessions", "api_tokens"):
        store.x(f"DELETE FROM {t} WHERE user_id=?", (uid,))
    store.x("DELETE FROM users WHERE id=?", (uid,))
    return u["username"]


def _admins():
    return store.one("SELECT COUNT(*) AS n FROM users WHERE role IN ('admin','super_admin') AND active=1")["n"]


def _supers():
    return store.one("SELECT COUNT(*) AS n FROM users WHERE role='super_admin' AND active=1")["n"]


def ensure_super_admin():
    """Existing installs: promote the oldest active admin to super_admin if none exists."""
    if _supers() == 0:
        u = store.one("SELECT id FROM users WHERE role='admin' AND active=1 ORDER BY created LIMIT 1")
        if u:
            store.update("users", u["id"], role="super_admin")


ensure_super_admin()


def change_own_password(user, current, new):
    u = store.one("SELECT * FROM users WHERE id=?", (user["id"],))
    if not verify_password(current or "", u["password_hash"]):
        raise HTTPException(400, "Current password is wrong")
    _check_password(new)
    store.update("users", u["id"], password_hash=hash_password(new), must_change=0)


# ------------------------------------------------------------------ sessions
def login(username, password, ip="", agent=""):
    username = (username or "").strip()
    lf = store.one("SELECT * FROM login_fail WHERE username=?", (username.lower(),))
    if lf and lf["until"] and lf["until"] > _now():
        raise HTTPException(429, f"Too many failed attempts. Try again in {int((lf['until'] - _now()) / 60) + 1} minute(s).")
    u = store.one("SELECT * FROM users WHERE username=?", (username,))
    if u and u["pending"] and verify_password(password or "", u["password_hash"]):
        raise HTTPException(403, "Your account is waiting for an admin to approve it. You can sign in once it is approved.")
    if not u or not u["active"] or not verify_password(password or "", u["password_hash"]):
        n = (lf["count"] if lf else 0) + 1
        store.x("INSERT INTO login_fail (username, count, until) VALUES (?,?,?) ON CONFLICT(username) DO UPDATE SET count=excluded.count, until=excluded.until",
                (username.lower(), n, _now() + 300 if n >= 5 else None))
        audit(username or "?", "login.failed", "", 401, ip)
        raise HTTPException(401, "Wrong username or password")
    store.x("DELETE FROM login_fail WHERE username=?", (username.lower(),))
    token = secrets.token_urlsafe(32)
    store.x("INSERT INTO sessions (token_hash, user_id, created, expires, ip, agent) VALUES (?,?,?,?,?,?)",
            (_sha(token), u["id"], _now(), _now() + SESSION_HOURS * 3600, ip, (agent or "")[:200]))
    store.update("users", u["id"], last_login=_now())
    store.x("DELETE FROM sessions WHERE expires < ?", (_now(),))
    audit(u["username"], "login", "", 200, ip)
    return token, _public(u)


def logout(token):
    if token:
        store.x("DELETE FROM sessions WHERE token_hash=?", (_sha(token),))


SERVICE_USER = {"id": "__service__", "username": "system", "name": "DataBridge (kernels)", "role": "admin", "active": 1}
LOCAL_ADMIN = {"id": "__local__", "username": "local", "name": "Local (auth off)", "role": "super_admin", "active": 1}


def resolve(cookie_token=None, bearer=None):
    """Return the user for a session cookie or bearer token, else None."""
    if not AUTH_ENABLED:
        return LOCAL_ADMIN
    if bearer:
        if hmac.compare_digest(bearer, INTERNAL_TOKEN):
            return SERVICE_USER
        t = store.one("SELECT * FROM api_tokens WHERE token_hash=?", (_sha(bearer),))
        if t and (not t["expires"] or t["expires"] > _now()):
            u = store.one("SELECT * FROM users WHERE id=? AND active=1", (t["user_id"],))
            if u:
                if not t["last_used"] or _now() - t["last_used"] > 60:
                    store.update("api_tokens", t["id"], last_used=_now())
                return {**_public(u), "via": "token"}
        return None
    if cookie_token:
        s = store.one("SELECT * FROM sessions WHERE token_hash=?", (_sha(cookie_token),))
        if s and s["expires"] > _now():
            u = store.one("SELECT * FROM users WHERE id=? AND active=1", (s["user_id"],))
            return _public(u)
    return None


# ------------------------------------------------------------------ API tokens
def create_token(user, name, days):
    if user["id"].startswith("__"):
        raise HTTPException(400, "Sign in as a real user to create tokens")
    raw = "dbt_" + secrets.token_urlsafe(32)
    tid = uuid.uuid4().hex[:10]
    store.x("INSERT INTO api_tokens (id, user_id, name, token_hash, prefix, created, expires) VALUES (?,?,?,?,?,?,?)",
            (tid, user["id"], (name or "token")[:80], _sha(raw), raw[:10], _now(), _now() + int(days) * 86400 if int(days or 0) > 0 else None))
    return {"id": tid, "token": raw, "name": name}


def list_tokens(user):
    return store.q("SELECT id, name, prefix, created, expires, last_used FROM api_tokens WHERE user_id=? ORDER BY created DESC", (user["id"],))


def revoke_token(user, tid):
    store.x("DELETE FROM api_tokens WHERE id=? AND (user_id=? OR ?='admin')", (tid, user["id"], "admin" if user["role"] in ADMIN_ROLES else user["role"]))


# ------------------------------------------------------------------ authorisation policy
PUBLIC = (re.compile(r"^/api/auth/(me|login|setup|signup|logout)$"), re.compile(r"^/api/datahub/hooks/[A-Za-z0-9_-]{20,}$"))
ADMIN_ONLY = re.compile(r"^/api/(admin/|users|audit|markets/install|clusters-usage)")
ADMIN_WRITE = re.compile(r"^/api/(linked-services|clusters)")        # editors may read/use, only admins change connections
VIEWER_POST_OK = re.compile(r"^/api/(auth/(password|tokens)|dora/chat|linked-services/test$|dashboards/[^/]+/(query|options|story|reconcile|version)$|tts$)")


SUPER_ONLY = re.compile(r"^/api/(features|super)(/|$)")


def allowed(user, method, path):
    """(ok, http_status, message)"""
    if any(p.match(path) for p in PUBLIC):
        return True, 200, ""
    if user is None:
        return False, 401, "Sign in required"
    role = user["role"]
    if SUPER_ONLY.match(path) and not (method == "GET" and path == "/api/features/me"):
        return (True, 200, "") if role == "super_admin" else (False, 403, "Super admins only")
    if role in ADMIN_ROLES:
        return True, 200, ""
    if ADMIN_ONLY.match(path) and not path.startswith("/api/admin/health"):
        return False, 403, "Admins only"
    if method in ("GET", "HEAD"):
        return True, 200, ""
    if ADMIN_WRITE.match(path) and not path.endswith("/test"):
        return False, 403, "Only admins can change linked services"
    if role == "viewer" and not VIEWER_POST_OK.match(path):
        return False, 403, "Your role is Viewer (read-only). Ask an admin for Editor access."
    return True, 200, ""


WS_VIEWER_OK = {"status", "refresh_state", "complete", "inspect", "preview"}


# ------------------------------------------------------------------ audit
def audit(username, action, target="", status=200, ip=""):
    store.x("INSERT INTO audit (time, username, action, target, status, ip) VALUES (?,?,?,?,?,?)",
            (_now(), username, action, (target or "")[:300], status, ip or ""))


def list_audit(limit=500, username=None, q=None):
    sql, args = "SELECT * FROM audit WHERE 1=1", []
    if username:
        sql += " AND username = ?"
        args.append(username)
    if q:
        sql += " AND (action LIKE ? OR target LIKE ?)"
        args += [f"%{q}%", f"%{q}%"]
    sql += " ORDER BY id DESC LIMIT ?"
    args.append(min(int(limit), 5000))
    return store.q(sql, tuple(args))


def describe(method, path):
    """Readable audit action for an API write."""
    rules = [(r"^/api/notebook$", {"PUT": "notebook.save", "DELETE": "notebook.delete"}), (r"^/api/pipelines/[^/]+/publish$", "pipeline.publish"),
             (r"^/api/pipelines/[^/]+/runs$", "pipeline.run"), (r"^/api/pipelines", {"POST": "pipeline.create", "PUT": "pipeline.save", "DELETE": "pipeline.delete"}),
             (r"^/api/jobs/[^/]+/run$", "job.run"), (r"^/api/jobs", {"POST": "job.create", "PUT": "job.update", "DELETE": "job.delete"}),
             (r"^/api/admin/settings$", "settings.save"), (r"^/api/admin/", "admin.action"), (r"^/api/users", {"POST": "user.create", "PUT": "user.update", "DELETE": "user.delete"}),
             (r"^/api/linked-services", {"POST": "linked_service.create", "PUT": "linked_service.update", "DELETE": "linked_service.delete"}),
             (r"^/api/dashboards/[^/]+/(query|options|preview|story)$", "dashboard.query"),
             (r"^/api/airflow-studio/files", {"PUT": "dag.deploy", "DELETE": "dag.delete"}),
             (r"^/api/catalog/databases/[^/]+/tables/[^/]+/delta/action$", "table.maintenance"),
             (r"^/api/dashboards", {"POST": "dashboard.create", "PUT": "dashboard.save", "DELETE": "dashboard.delete"}),
             (r"^/api/sql", "sql.run"), (r"^/api/kernels", "kernel." + method.lower()), (r"^/api/workspace", "workspace." + method.lower()),
             (r"^/api/dora", "dora.chat"), (r"^/api/notebook-runs", "notebook.run"), (r"^/api/runs/", "run.action"), (r"^/api/pipeline-runs/", "pipeline_run.action")]
    for pat, act in rules:
        if re.match(pat, path):
            return act.get(method, f"{method.lower()} {path}") if isinstance(act, dict) else act
    return f"{method.lower()} {path}"
