"""Git folders (like Databricks Repos): clone, branches, pull/fetch, changes + diffs, commit & push, history.
Repos live under workspace/Repos/<user>/<name>. Tokens are sent per command as an HTTP header — never stored in
the repo's remote URL or git config. Notebooks are committed without outputs via a local clean filter."""
import base64
import difflib
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

from fastapi import HTTPException

from .settings import DATA_ROOT
from .workspace import ROOT, relpath, resolve

CRED_FILE = DATA_ROOT / ".stratum" / "git_credentials.json"
KEY_FILE = DATA_ROOT / ".stratum" / "secret.key"
NAME_RE = re.compile(r"^[A-Za-z0-9._-]{1,100}$")
BRANCH_RE = re.compile(r"^(?!/)(?!.*\.\.)(?!.*//)[A-Za-z0-9._/-]{1,200}(?<!/)(?<!\.lock)$")
URL_RE = re.compile(r"^(https://[^\s'\"]+|file://[^\s'\"]+|[A-Za-z]:[\\/][^\s'\"]+|/[^\s'\"]+)$")


def git_available():
    return shutil.which("git") is not None


# ---------------------------------------------------------------- credentials (per user, encrypted at rest)
def _fernet():
    try:
        from cryptography.fernet import Fernet
    except ImportError:
        return None
    KEY_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not KEY_FILE.exists():
        KEY_FILE.write_bytes(Fernet.generate_key())
    return Fernet(KEY_FILE.read_bytes())


def _load_creds():
    try:
        return json.loads(CRED_FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def get_creds(user):
    c = _load_creds().get(user) or {}
    tok = c.get("token") or ""
    if tok:
        f = _fernet()
        try:
            tok = f.decrypt(tok.encode()).decode() if f else base64.b64decode(tok).decode()
        except Exception:  # noqa: BLE001
            tok = ""
    return {**c, "token": tok}


def creds_public(user):
    c = get_creds(user)
    t = c.get("token") or ""
    return {"provider": c.get("provider", ""), "username": c.get("username", ""), "email": c.get("email", ""),
            "token_set": bool(t), "token_hint": f"…{t[-4:]}" if len(t) >= 8 else ("set" if t else "")}


def save_creds(user, body):
    all_ = _load_creds()
    cur = all_.get(user) or {}
    out = {"provider": str(body.get("provider") or cur.get("provider") or "")[:40],
           "username": str(body.get("username") or "")[:200], "email": str(body.get("email") or "")[:200]}
    tok = body.get("token")
    if tok:
        f = _fernet()
        out["token"] = f.encrypt(tok.encode()).decode() if f else base64.b64encode(tok.encode()).decode()
    elif body.get("clear_token"):
        out["token"] = ""
    else:
        out["token"] = cur.get("token", "")
    all_[user] = out
    CRED_FILE.parent.mkdir(parents=True, exist_ok=True)
    CRED_FILE.write_text(json.dumps(all_, indent=1), encoding="utf-8")
    try:
        os.chmod(CRED_FILE, 0o600)
    except OSError:
        pass
    return creds_public(user)


# ---------------------------------------------------------------- running git
def _auth_cfg(user, url_hint=""):
    c = get_creds(user)
    if not c.get("token"):
        return []
    who = c.get("username") or ("x-access-token" if "github" in url_hint else "git")
    b64 = base64.b64encode(f"{who}:{c['token']}".encode()).decode()
    return ["-c", f"http.extraHeader=Authorization: Basic {b64}"]


def _clean(text, user):
    tok = get_creds(user).get("token") or ""
    text = re.sub(r"Authorization: Basic \S+", "Authorization: ***", text)
    text = re.sub(r"https://[^/\s:@]+:[^/\s@]+@", "https://***@", text)
    return text.replace(tok, "***") if tok else text


def git(args, cwd, user, check=True, timeout=180, auth=False, url_hint=""):
    if not git_available():
        raise HTTPException(500, "Git is not installed on this machine. Install Git for Windows (git-scm.com) and restart DataBridge.")
    cmd = ["git", "-c", "credential.helper=", "-c", "core.quotepath=off", "-c", "color.ui=false"] + (_auth_cfg(user, url_hint) if auth else []) + list(args)
    env = {**os.environ, "GIT_TERMINAL_PROMPT": "0", "GIT_ASKPASS": "echo", "LC_ALL": "C"}
    try:
        r = subprocess.run(cmd, cwd=str(cwd), capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=timeout, env=env)
    except subprocess.TimeoutExpired:
        raise HTTPException(504, f"git {args[0]} timed out")
    out = _clean((r.stdout or "") + (r.stderr or ""), user)
    if check and r.returncode != 0:
        low = out.lower()
        hint = ""
        if "authentication failed" in low or "could not read username" in low or "403" in low or "401" in low:
            hint = " — check your Git credentials (Workspace › Git credentials): username and a personal access token with repo access."
        elif "non-fast-forward" in low or "fetch first" in low or "rejected" in low:
            hint = " — the remote has newer commits. Pull first, then push."
        elif "conflict" in low:
            hint = " — there are merge conflicts. Resolve them in the files (look for <<<<<<<), then commit."
        raise HTTPException(400, f"git {args[0]} failed{hint}\n{out.strip()[-1500:]}")
    return out


# ---------------------------------------------------------------- locating repos
def repo_root(rel):
    p = resolve(rel)
    p = p if p.is_dir() else p.parent
    while True:
        if (p / ".git").exists():
            return p
        if p == ROOT or ROOT not in p.parents:
            return None
        p = p.parent


def locate(rel):
    try:
        r = repo_root(rel)
    except HTTPException:
        return None
    if not r:
        return None
    return {"root": relpath(r), "name": r.name, "branch": _head_branch(r)}


def _head_branch(r):
    try:
        head = (r / ".git" / "HEAD").read_text(encoding="utf-8").strip()
    except OSError:
        return ""
    return head[16:] if head.startswith("ref: refs/heads/") else head[:8]


def _repo(rel):
    r = repo_root(rel)
    if not r:
        raise HTTPException(404, "Not a Git folder")
    return r


def _install_nb_filter(r):
    """Local-only filter: notebooks are committed without outputs; working files keep them."""
    py = sys.executable.replace("\\", "/")
    script = (Path(__file__).parent / "nbstrip.py").as_posix()
    subprocess.run(["git", "config", "filter.databridge-nb.clean", f'"{py}" "{script}" %f'], cwd=str(r), capture_output=True)
    subprocess.run(["git", "config", "filter.databridge-nb.smudge", "cat"], cwd=str(r), capture_output=True)
    info = r / ".git" / "info"
    info.mkdir(parents=True, exist_ok=True)
    attrs = info / "attributes"
    line = "*.ipynb filter=databridge-nb"
    old = attrs.read_text(encoding="utf-8") if attrs.exists() else ""
    if line not in old:
        attrs.write_text(old + ("\n" if old and not old.endswith("\n") else "") + line + "\n", encoding="utf-8")


def _identity(r, user):
    c = get_creds(user)
    subprocess.run(["git", "config", "user.name", c.get("username") or user], cwd=str(r), capture_output=True)
    subprocess.run(["git", "config", "user.email", c.get("email") or f"{user}@databridge.local"], cwd=str(r), capture_output=True)


# ---------------------------------------------------------------- operations
def clone(user, url, name=None, branch=None):
    url = (url or "").strip()
    if not URL_RE.match(url):
        raise HTTPException(400, "Use an HTTPS repository URL, e.g. https://github.com/org/repo.git")
    if re.match(r"^https://[^/]*@", url):
        raise HTTPException(400, "Don't put credentials in the URL — save a token under Git credentials instead.")
    name = (name or re.sub(r"\.git$", "", url.rstrip("/").split("/")[-1])).strip()
    if not NAME_RE.match(name):
        raise HTTPException(400, "Folder name may use letters, numbers, . _ -")
    if branch and not BRANCH_RE.match(branch):
        raise HTTPException(400, "Invalid branch name")
    base = ROOT / "Repos" / user
    base.mkdir(parents=True, exist_ok=True)
    dest = base / name
    if dest.exists():
        raise HTTPException(409, f"Repos/{user}/{name} already exists")
    args = ["clone", "--origin", "origin"] + (["--branch", branch] if branch else []) + ["--", url, str(dest)]
    try:
        git(args, base, user, auth=url.startswith("https://"), url_hint=url, timeout=900)
    except HTTPException:
        shutil.rmtree(dest, ignore_errors=True)
        raise
    _install_nb_filter(dest)
    _identity(dest, user)
    return {"path": relpath(dest), **(locate(relpath(dest)) or {})}


def _remote_url(r, user):
    u = git(["remote", "get-url", "origin"], r, user, check=False).strip()
    return re.sub(r"https://[^@/]+@", "https://", u)


def info(rel, user):
    r = _repo(rel)
    _install_nb_filter(r)
    branch = git(["rev-parse", "--abbrev-ref", "HEAD"], r, user, check=False).strip()
    local = [b for b in git(["branch", "--format=%(refname:short)"], r, user, check=False).split("\n") if b.strip()]
    remote = [b.strip() for b in git(["branch", "-r", "--format=%(refname:short)"], r, user, check=False).split("\n")
              if b.strip() and not b.strip().endswith("/HEAD") and b.strip() != "origin"]
    ahead = behind = None
    ab = git(["rev-list", "--left-right", "--count", "HEAD...@{upstream}"], r, user, check=False).split()
    if len(ab) == 2 and all(x.isdigit() for x in ab):
        ahead, behind = int(ab[0]), int(ab[1])
    return {"root": relpath(r), "name": r.name, "branch": branch, "local": local,
            "remote": [b for b in remote if b.split("/", 1)[-1] not in local], "ahead": ahead, "behind": behind,
            "url": _remote_url(r, user), "changes": status(r, user), "has_upstream": ahead is not None}


def _settle_notebooks(r, user):
    """Git flags a filtered file as modified when its size changed (outputs) without re-checking content.
    For notebooks whose code equals HEAD, re-stamp the index entry (same blob, nothing staged) to clear it."""
    out = git(["status", "--porcelain=v1", "-z", "--untracked-files=no"], r, user, check=False)
    cands = [e[3:] for e in out.split("\0") if len(e) > 3 and e[:2] in (" M", "M ", "MM") and e[3:].endswith(".ipynb")]
    for f in cands:
        same = subprocess.run(["git", "-c", "core.quotepath=off", "diff", "--quiet", "HEAD", "--", f], cwd=str(r), capture_output=True)
        if same.returncode == 0:
            subprocess.run(["git", "add", "--", f], cwd=str(r), capture_output=True)


def status(r, user):
    _settle_notebooks(r, user)
    out = git(["status", "--porcelain=v1", "-z", "--untracked-files=all"], r, user, check=False)
    items, parts, i = [], out.split("\0"), 0
    labels = {"M": "modified", "A": "added", "D": "deleted", "R": "renamed", "C": "copied", "U": "conflict", "?": "new"}
    while i < len(parts):
        e = parts[i]
        if len(e) < 4:
            i += 1
            continue
        xy, path = e[:2], e[3:]
        code = "?" if xy == "??" else ("U" if "U" in xy or xy in ("AA", "DD") else (xy[1] if xy[1] != " " else xy[0]))
        if xy[0] in "RC":
            i += 1                                         # rename: next entry is the old path
        items.append({"path": path, "status": labels.get(code, code), "code": code})
        i += 1
    return items


def _safe_files(r, files):
    out = []
    for f in files or []:
        p = (r / f).resolve()
        if r not in p.parents:
            raise HTTPException(400, f"File outside the repo: {f}")
        out.append(Path(f).as_posix())
    return out


def checkout(rel, user, branch, create=False, base=None):
    r = _repo(rel)
    _settle_notebooks(r, user)
    if not BRANCH_RE.match(branch or ""):
        raise HTTPException(400, "Invalid branch name")
    if create:
        args = ["checkout", "-b", branch] + ([base] if base and BRANCH_RE.match(base) else [])
    else:
        local = [b for b in git(["branch", "--format=%(refname:short)"], r, user, check=False).split("\n") if b.strip()]
        name = branch.split("/", 1)[1] if branch.startswith("origin/") else branch
        args = ["checkout", name] if name in local else ["checkout", "-b", name, "--track", f"origin/{name}"]
    git(args, r, user)
    return info(rel, user)


def fetch(rel, user):
    r = _repo(rel)
    git(["fetch", "--prune", "origin"], r, user, auth=True, url_hint=_remote_url(r, user))
    return info(rel, user)


def pull(rel, user):
    r = _repo(rel)
    _settle_notebooks(r, user)
    out = git(["pull", "--no-rebase", "--no-edit", "origin", git(["rev-parse", "--abbrev-ref", "HEAD"], r, user).strip()], r, user, auth=True, url_hint=_remote_url(r, user))
    return {**info(rel, user), "log": out.strip()[-800:]}


def commit(rel, user, message, files, push=False):
    r = _repo(rel)
    message = (message or "").strip()
    if not message:
        raise HTTPException(400, "Write a commit message")
    files = _safe_files(r, files)
    if not files:
        raise HTTPException(400, "Select at least one changed file")
    _identity(r, user)
    git(["add", "-A", "--"] + files, r, user)
    out = git(["commit", "-m", message, "--"] + files, r, user)
    res = {"commit": out.strip().split("\n")[0]}
    if push:
        res["push"] = push_(rel, user)["log"]
    return {**info(rel, user), **res}


def push_(rel, user):
    r = _repo(rel)
    out = git(["push", "-u", "origin", "HEAD"], r, user, auth=True, url_hint=_remote_url(r, user))
    return {**info(rel, user), "log": out.strip()[-800:]}


def discard(rel, user, files):
    r = _repo(rel)
    files = _safe_files(r, files)
    st = {c["path"]: c["code"] for c in status(r, user)}
    tracked = [f for f in files if st.get(f) not in ("?", "A")]
    new = [f for f in files if st.get(f) in ("?", "A")]
    if tracked:
        git(["checkout", "HEAD", "--"] + tracked, r, user)
    for f in new:
        git(["rm", "--cached", "-q", "--ignore-unmatch", "--", f], r, user, check=False)
        (r / f).unlink(missing_ok=True)
    return info(rel, user)


def delete_branch(rel, user, branch, remote=False):
    r = _repo(rel)
    if not BRANCH_RE.match(branch or ""):
        raise HTTPException(400, "Invalid branch name")
    if branch == git(["rev-parse", "--abbrev-ref", "HEAD"], r, user).strip():
        raise HTTPException(400, "Switch to another branch before deleting this one")
    git(["branch", "-D", branch], r, user)
    if remote:
        git(["push", "origin", "--delete", branch], r, user, auth=True, url_hint=_remote_url(r, user))
    return info(rel, user)


def history(rel, user, limit=50):
    r = _repo(rel)
    out = git(["log", f"-n{int(limit)}", "--date=iso", "--pretty=format:%H%x1f%an%x1f%ad%x1f%s"], r, user, check=False)
    return [dict(zip(("hash", "author", "date", "message"), ln.split("\x1f"))) for ln in out.split("\n") if ln.count("\x1f") == 3]


def _nb_source(text):
    try:
        nb = json.loads(text)
    except ValueError:
        return text.splitlines()
    lines = []
    for i, c in enumerate(nb.get("cells", [])):
        src = c.get("source", "")
        src = "".join(src) if isinstance(src, list) else src
        lines.append(f"# ── cell {i + 1} ({c.get('cell_type', 'code')}) ──")
        lines.extend(src.splitlines())
    return lines


def diff(rel, user, file):
    r = _repo(rel)
    file = _safe_files(r, [file])[0]
    st = {c["path"]: c["code"] for c in status(r, user)}
    code = st.get(file)
    old = "" if code in ("?", "A") else git(["show", f"HEAD:{file}"], r, user, check=False)
    p = r / file
    new = p.read_text(encoding="utf-8", errors="replace") if p.exists() else ""
    if file.endswith(".ipynb"):
        a, b = _nb_source(old) if old else [], _nb_source(new) if new else []
    else:
        a, b = old.splitlines(), new.splitlines()
    lines = list(difflib.unified_diff(a, b, f"a/{file}", f"b/{file}", lineterm="", n=3))
    return {"file": file, "status": code, "notebook": file.endswith(".ipynb"), "diff": "\n".join(lines[:4000]),
            "added": sum(1 for ln in lines if ln.startswith("+") and not ln.startswith("+++")),
            "removed": sum(1 for ln in lines if ln.startswith("-") and not ln.startswith("---"))}
