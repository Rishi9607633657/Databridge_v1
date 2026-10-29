"""Single sign-on with Microsoft Entra ID (Azure AD), Google, or any OpenID Connect provider (Okta, Keycloak, Auth0).

Authorization-code flow with PKCE. The ID token comes straight from the provider's token endpoint over TLS, so its
issuer is trusted from the TLS connection (OpenID Connect Core 3.1.3.7); we still check issuer, audience, expiry and
nonce. People are matched to DataBridge users by e-mail; new people are created with the default role when
"Create accounts on first sign-in" is on, and only for the allowed e-mail domains."""
import base64
import hashlib
import json
import re
import secrets
import time
import uuid
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException

from . import auth
from .jobs import store
from .settings import env

_disc = {}           # issuer url -> (time, discovery document)
_pending = {}        # state -> {pid, verifier, nonce, next, exp}


def providers():
    out = []
    if env("SSO_MICROSOFT_CLIENT_ID"):
        out.append({"id": "microsoft", "label": "Microsoft"})
    if env("SSO_GOOGLE_CLIENT_ID"):
        out.append({"id": "google", "label": "Google"})
    if env("SSO_OIDC_CLIENT_ID") and env("SSO_OIDC_ISSUER"):
        out.append({"id": "oidc", "label": env("SSO_OIDC_NAME", "Single sign-on") or "Single sign-on"})
    return out


def _cfg(pid):
    if pid == "microsoft":
        tenant = env("SSO_MICROSOFT_TENANT", "organizations") or "organizations"
        return {"issuer": f"https://login.microsoftonline.com/{tenant}/v2.0", "client_id": env("SSO_MICROSOFT_CLIENT_ID"),
                "secret": env("SSO_MICROSOFT_CLIENT_SECRET", ""), "multi": tenant in ("organizations", "common", "consumers")}
    if pid == "google":
        return {"issuer": "https://accounts.google.com", "client_id": env("SSO_GOOGLE_CLIENT_ID"), "secret": env("SSO_GOOGLE_CLIENT_SECRET", ""), "multi": False}
    if pid == "oidc":
        return {"issuer": (env("SSO_OIDC_ISSUER") or "").rstrip("/"), "client_id": env("SSO_OIDC_CLIENT_ID"),
                "secret": env("SSO_OIDC_CLIENT_SECRET", ""), "multi": False}
    raise HTTPException(404, "Unknown sign-in provider")


async def _discovery(issuer):
    hit = _disc.get(issuer)
    if hit and time.time() - hit[0] < 3600:
        return hit[1]
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.get(f"{issuer}/.well-known/openid-configuration")
    if r.status_code != 200:
        raise HTTPException(502, f"Could not read the sign-in provider's configuration ({r.status_code})")
    d = r.json()
    _disc[issuer] = (time.time(), d)
    return d


def redirect_uri(pid, base_url):
    base = (env("PUBLIC_URL") or "").rstrip("/") or base_url.rstrip("/")
    return f"{base}/api/auth/sso/{pid}/callback"


def _b64(b):
    return base64.urlsafe_b64encode(b).decode().rstrip("=")


async def start(pid, base_url, nxt=""):
    c = _cfg(pid)
    if not c["client_id"]:
        raise HTTPException(404, "This sign-in provider is not set up")
    d = await _discovery(c["issuer"])
    now = time.time()
    for k in [k for k, v in _pending.items() if v["exp"] < now]:
        _pending.pop(k, None)
    state, nonce, verifier = secrets.token_urlsafe(24), secrets.token_urlsafe(24), secrets.token_urlsafe(48)
    _pending[state] = {"pid": pid, "verifier": verifier, "nonce": nonce, "next": nxt if re.fullmatch(r"#/[\w/?=&%.-]*", nxt or "") else "",
                       "exp": now + 600}
    q = {"client_id": c["client_id"], "response_type": "code", "redirect_uri": redirect_uri(pid, base_url), "scope": "openid email profile",
         "state": state, "nonce": nonce, "code_challenge": _b64(hashlib.sha256(verifier.encode()).digest()),
         "code_challenge_method": "S256", "prompt": "select_account"}
    return d["authorization_endpoint"] + "?" + urlencode(q), state


def _claims(id_token):
    try:
        payload = id_token.split(".")[1]
        return json.loads(base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4)))
    except Exception:  # noqa: BLE001
        raise HTTPException(400, "The sign-in provider sent an unreadable ID token")


async def finish(pid, code, state, cookie_state, base_url, ip="", agent=""):
    p = _pending.pop(state or "", None)
    if not p or p["pid"] != pid or not cookie_state or not secrets.compare_digest(cookie_state, state):
        raise HTTPException(400, "The sign-in link expired or was opened in another browser. Try again.")
    c = _cfg(pid)
    d = await _discovery(c["issuer"])
    form = {"grant_type": "authorization_code", "code": code, "redirect_uri": redirect_uri(pid, base_url), "client_id": c["client_id"],
            "code_verifier": p["verifier"]}
    if c["secret"]:
        form["client_secret"] = c["secret"]
    async with httpx.AsyncClient(timeout=20) as cl:
        r = await cl.post(d["token_endpoint"], data=form, headers={"Accept": "application/json"})
    if r.status_code != 200:
        raise HTTPException(400, f"The sign-in provider refused the code: {r.text[:200]}")
    tok = r.json()
    cl_ = _claims(tok.get("id_token") or "")
    iss = cl_.get("iss", "")
    if c["multi"]:
        if not re.fullmatch(r"https://login\.microsoftonline\.com/[0-9a-f-]{36}/v2\.0", iss):
            raise HTTPException(400, "Unexpected token issuer")
        allowed_t = [t.strip().lower() for t in (env("SSO_MICROSOFT_ALLOWED_TENANTS") or "").split(",") if t.strip()]
        if allowed_t and (cl_.get("tid") or "").lower() not in allowed_t:
            raise HTTPException(403, "Your organisation is not allowed to sign in here")
    elif iss.rstrip("/") != d.get("issuer", c["issuer"]).rstrip("/"):
        raise HTTPException(400, "Unexpected token issuer")
    aud = cl_.get("aud")
    if (aud if isinstance(aud, list) else [aud]).count(c["client_id"]) == 0:
        raise HTTPException(400, "The token was issued for another application")
    if float(cl_.get("exp") or 0) < time.time() - 60:
        raise HTTPException(400, "The sign-in token has expired. Try again.")
    if cl_.get("nonce") != p["nonce"]:
        raise HTTPException(400, "Sign-in check failed (nonce). Try again.")
    email = (cl_.get("email") or cl_.get("preferred_username") or cl_.get("upn") or "").strip().lower()
    if pid == "google" and not cl_.get("email_verified"):
        raise HTTPException(403, "Your Google e-mail address is not verified")
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[a-z]{2,}", email):
        raise HTTPException(403, "The sign-in provider did not share an e-mail address")
    domains = [x.strip().lower().lstrip("@") for x in (env("SSO_ALLOWED_DOMAINS") or "").split(",") if x.strip()]
    if domains and email.split("@")[1] not in domains:
        raise HTTPException(403, f"Accounts from {email.split('@')[1]} can't sign in here")
    u = store.one("SELECT * FROM users WHERE lower(email)=? OR lower(username)=?", (email, email))
    if not u:
        if (env("SSO_AUTO_CREATE", "true") or "true").lower() != "true":
            raise HTTPException(403, f"There is no DataBridge account for {email}. Ask an admin to add you.")
        scoped = bool(domains) or (pid == "microsoft" and (not c["multi"] or env("SSO_MICROSOFT_ALLOWED_TENANTS")))
        if not scoped and (env("SSO_AUTO_CREATE_ANY_DOMAIN", "false") or "false").lower() != "true":
            raise HTTPException(403, f"There is no DataBridge account for {email}. (An admin can allow automatic accounts by setting the "
                                     "allowed e-mail domains in Admin › Settings › Single sign-on.)")
        role = (env("SSO_DEFAULT_ROLE", "viewer") or "viewer").lower()
        role = role if role in ("viewer", "editor") else "viewer"
        approval = (env("SSO_APPROVAL", "false") or "false").lower() == "true"
        uid = uuid.uuid4().hex[:10]
        store.x("INSERT INTO users (id, username, name, email, password_hash, role, active, created, must_change, company, pending) "
                "VALUES (?,?,?,?,?,?,?,?,0,?,?)",
                (uid, email, cl_.get("name") or email, email, auth.hash_password(secrets.token_urlsafe(32)), role, 0 if approval else 1, time.time(),
                 "", 1 if approval else 0))
        auth.audit(email, f"signup.sso.{pid}", "", 200, ip)
        u = store.one("SELECT * FROM users WHERE id=?", (uid,))
    if u["pending"]:
        raise HTTPException(403, "Your account is waiting for an admin to approve it.")
    if not u["active"]:
        raise HTTPException(403, "Your DataBridge account is disabled. Ask an admin.")
    token = auth.new_session(u, ip, agent, method=f"sso.{pid}")
    return token, p["next"]
