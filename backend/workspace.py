"""Workspace files: folders and Jupyter notebooks (.ipynb) stored on disk."""
import hashlib
import shutil
import time
from pathlib import Path

import nbformat
from fastapi import HTTPException

from .settings import DATA_ROOT as PROJECT_ROOT, settings

ROOT = settings.workspace


def resolve(rel: str) -> Path:
    rel = (rel or "").strip().lstrip("/\\")
    p = (ROOT / rel).resolve()
    if p != ROOT and ROOT not in p.parents:
        raise HTTPException(400, "Path is outside the workspace")
    return p


def relpath(p: Path) -> str:
    return p.relative_to(ROOT).as_posix()


def _entry(p: Path) -> dict:
    st = p.stat()
    kind = "dir" if p.is_dir() else ("notebook" if p.suffix == ".ipynb" else "file")
    return {"name": p.name, "path": relpath(p), "type": kind, "modified": st.st_mtime,
            "size": st.st_size if p.is_file() else None}


def list_dir(rel: str) -> dict:
    p = resolve(rel)
    if not p.is_dir():
        raise HTTPException(404, "Folder not found")
    items = [_entry(c) for c in p.iterdir() if not c.name.startswith(".")]
    items.sort(key=lambda e: (e["type"] != "dir", e["name"].lower()))
    return {"path": relpath(p) if p != ROOT else "", "items": items}


def recent(limit: int = 10) -> list:
    nbs = [p for p in ROOT.rglob("*.ipynb") if ".ipynb_checkpoints" not in p.parts]
    nbs.sort(key=lambda p: p.stat().st_mtime, reverse=True)
    return [_entry(p) for p in nbs[:limit]]


def _check_name(name: str):
    if not name or any(ch in name for ch in '/\\:*?"<>|') or name.startswith("."):
        raise HTTPException(400, "Invalid name")


def create_folder(parent: str, name: str) -> dict:
    _check_name(name)
    p = resolve(parent) / name
    if p.exists():
        raise HTTPException(409, "Already exists")
    p.mkdir(parents=True)
    return _entry(p)


def create_notebook(parent: str, name: str, language: str = "python") -> dict:
    _check_name(name)
    if not name.endswith(".ipynb"):
        name += ".ipynb"
    p = resolve(parent) / name
    if p.exists():
        raise HTTPException(409, "Already exists")
    nb = nbformat.v4.new_notebook()
    nb.metadata["kernelspec"] = {"name": settings.kernel_name, "display_name": "Python 3 (PySpark)", "language": "python"}
    nb.metadata["language_info"] = {"name": "python"}
    nb.cells = [nbformat.v4.new_markdown_cell(f"# {Path(name).stem}"),
                nbformat.v4.new_code_cell("spark.range(5).show()" if language == "python" else "")]
    nbformat.write(nb, p)
    return _entry(p)


def read_notebook(rel: str) -> dict:
    p = resolve(rel)
    if not p.is_file() or p.suffix != ".ipynb":
        raise HTTPException(404, "Notebook not found")
    nb = nbformat.read(p, as_version=4)
    return {"path": relpath(p), "name": p.name, "modified": p.stat().st_mtime, "content": nb}


REV_DIR = PROJECT_ROOT / ".stratum" / "revisions"
MAX_REVISIONS = 60
AUTOSAVE_REVISION_EVERY = 300  # seconds


def _rev_dir(rel: str):
    return REV_DIR / hashlib.sha1(rel.encode("utf-8")).hexdigest()[:16]


def _snapshot(p, rel, force=False):
    d = _rev_dir(rel)
    d.mkdir(parents=True, exist_ok=True)
    revs = sorted(d.glob("*.ipynb"))
    data = p.read_bytes()
    if revs:
        last = revs[-1]
        if last.read_bytes() == data:
            return
        if not force and time.time() - last.stat().st_mtime < AUTOSAVE_REVISION_EVERY:
            return
    (d / f"{int(time.time() * 1000)}.ipynb").write_bytes(data)
    (d / "path.txt").write_text(rel, encoding="utf-8")
    for old in sorted(d.glob("*.ipynb"))[:-MAX_REVISIONS]:
        old.unlink()


def list_revisions(rel: str) -> list:
    p = resolve(rel)
    out = []
    for f in sorted(_rev_dir(relpath(p)).glob("*.ipynb"), reverse=True):
        try:
            nb = nbformat.read(f, as_version=4)
            cells = len(nb.cells)
        except Exception:  # noqa: BLE001
            cells = None
        out.append({"id": f.stem, "time": int(f.stem) / 1000, "size": f.stat().st_size, "cells": cells})
    return out


def read_revision(rel: str, rev: str) -> dict:
    p = resolve(rel)
    f = _rev_dir(relpath(p)) / f"{int(rev)}.ipynb"
    if not f.exists():
        raise HTTPException(404, "Revision not found")
    return {"id": rev, "time": int(rev) / 1000, "content": nbformat.read(f, as_version=4)}


def restore_revision(rel: str, rev: str) -> dict:
    p = resolve(rel)
    f = _rev_dir(relpath(p)) / f"{int(rev)}.ipynb"
    if not f.exists():
        raise HTTPException(404, "Revision not found")
    if p.exists():
        _snapshot(p, relpath(p), force=True)   # keep the current version before restoring
    shutil.copyfile(f, p)
    return {"path": relpath(p), "restored": rev}


def save_notebook(rel: str, content: dict, manual: bool = False) -> dict:
    p = resolve(rel)
    if p.suffix != ".ipynb":
        raise HTTPException(400, "Not a notebook")
    try:
        nb = nbformat.from_dict(content)
        nbformat.validate(nb)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(400, f"Invalid notebook: {e}")
    nbformat.write(nb, p)
    try:
        _snapshot(p, relpath(p), force=manual)
    except Exception:  # noqa: BLE001  (history is best-effort)
        pass
    return {"path": relpath(p), "modified": p.stat().st_mtime, "saved_at": time.time()}


def rename(rel: str, new_name: str) -> dict:
    _check_name(new_name)
    p = resolve(rel)
    if not p.exists():
        raise HTTPException(404, "Not found")
    if p.suffix == ".ipynb" and not new_name.endswith(".ipynb"):
        new_name += ".ipynb"
    target = p.with_name(new_name)
    if target.exists():
        raise HTTPException(409, "Already exists")
    p.rename(target)
    return _entry(target)


def delete(rel: str):
    p = resolve(rel)
    if p == ROOT:
        raise HTTPException(400, "Cannot delete the workspace root")
    if p.is_dir():
        shutil.rmtree(p)
    elif p.exists():
        p.unlink()
    else:
        raise HTTPException(404, "Not found")


def search(term: str, limit: int = 20) -> list:
    term = term.lower()
    hits = [p for p in ROOT.rglob("*") if term in p.name.lower() and not any(
        part.startswith(".") for part in p.relative_to(ROOT).parts)]
    hits.sort(key=lambda p: (p.suffix != ".ipynb", len(p.name)))
    return [_entry(p) for p in hits[:limit]]
