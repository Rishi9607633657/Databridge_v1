"""Custom maps for dashboard map / globe widgets.

Built-in maps (world, India states, US states) ship in frontend/vendor/maps. Admins can add their own GeoJSON
(districts, city wards, delivery zones, a mall floor plan…) here; each file is stored in <workspace>/maps/<name>.json
and appears in the widget editor's Map list. Every feature needs a `properties.name` (or the property chosen at upload)."""
import json
import re

from fastapi import APIRouter, Body, HTTPException, Request

from . import auth
from .settings import settings

router = APIRouter()
NAME_RE = re.compile(r"^[a-z0-9][a-z0-9_-]{0,48}$")
MAX_BYTES = 15 * 1024 * 1024


def _dir():
    d = settings.workspace / "maps"
    d.mkdir(parents=True, exist_ok=True)
    return d


def _admin(request: Request):
    u = getattr(request.state, "user", None) or {}
    if u.get("role") not in auth.ADMIN_ROLES:
        raise HTTPException(403, "Only admins can add or remove maps")
    return u


@router.get("/api/maps")
def list_maps():
    out = []
    for p in sorted(_dir().glob("*.json")):
        try:
            meta = json.loads(p.with_suffix(".meta").read_text()) if p.with_suffix(".meta").exists() else {}
        except ValueError:
            meta = {}
        out.append({"name": p.stem, "label": meta.get("label") or p.stem, "features": meta.get("features"), "size": p.stat().st_size})
    return {"maps": out}


@router.get("/api/maps/{name}")
def get_map(name: str):
    if not NAME_RE.match(name):
        raise HTTPException(404, "No such map")
    p = _dir() / f"{name}.json"
    if not p.exists():
        raise HTTPException(404, "No such map")
    return json.loads(p.read_text())


@router.post("/api/maps")
def add_map(request: Request, body: dict = Body(...)):
    """{name, label, geojson (object or text), name_property}: stored with each feature's properties.name set."""
    u = _admin(request)
    name = (body.get("name") or "").strip().lower().replace(" ", "-")
    if not NAME_RE.match(name) or name in ("world", "india", "usa"):
        raise HTTPException(400, "Use a short name: lowercase letters, digits, - or _ (not world, india or usa)")
    gj = body.get("geojson")
    if isinstance(gj, str):
        if len(gj) > MAX_BYTES:
            raise HTTPException(400, "The file is larger than 15 MB. Simplify it first (e.g. mapshaper.org).")
        try:
            gj = json.loads(gj)
        except ValueError as e:
            raise HTTPException(400, f"Not valid JSON: {e}")
    if not isinstance(gj, dict) or gj.get("type") != "FeatureCollection" or not isinstance(gj.get("features"), list):
        raise HTTPException(400, "Upload a GeoJSON FeatureCollection (TopoJSON and Shapefiles: convert at mapshaper.org first)")
    key = (body.get("name_property") or "").strip()
    feats = []
    for f in gj["features"]:
        if not isinstance(f, dict) or not f.get("geometry") or f["geometry"].get("type") not in ("Polygon", "MultiPolygon"):
            continue
        props = f.get("properties") or {}
        n = props.get(key) if key else (props.get("name") or props.get("NAME") or props.get("Name"))
        if n in (None, ""):
            continue
        props = {k: v for k, v in props.items() if isinstance(v, (str, int, float)) and len(str(v)) < 200}
        props["name"] = str(n)
        feats.append({"type": "Feature", "properties": props, "geometry": f["geometry"]})
    if not feats:
        raise HTTPException(400, "No polygon features with a name were found. Choose which property holds the area name.")
    text = json.dumps({"type": "FeatureCollection", "features": feats}, separators=(",", ":"))
    if len(text) > MAX_BYTES:
        raise HTTPException(400, "The map is larger than 15 MB. Simplify it first (e.g. mapshaper.org).")
    (_dir() / f"{name}.json").write_text(text)
    (_dir() / f"{name}.meta").write_text(json.dumps({"label": (body.get("label") or name)[:80], "features": len(feats), "by": u.get("username")}))
    auth.audit(u.get("username"), "map.add", name)
    return {"name": name, "features": len(feats), "properties": sorted({k for f in feats for k in f["properties"]})[:40]}


@router.delete("/api/maps/{name}")
def delete_map(name: str, request: Request):
    u = _admin(request)
    if not NAME_RE.match(name):
        raise HTTPException(404, "No such map")
    for ext in (".json", ".meta"):
        p = _dir() / f"{name}{ext}"
        if p.exists():
            p.unlink()
    auth.audit(u.get("username"), "map.delete", name)
    return {"ok": True}
