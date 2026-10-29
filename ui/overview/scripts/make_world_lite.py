"""Make src/data/geo/world-lite.json from DataBridge's built-in world map (frontend/vendor/maps/world.json).

The source is Natural Earth admin-0 (public domain) with India's point of view, so India's borders follow the
official Indian claim. This script only simplifies it (Douglas-Peucker, 0.1 degree precision) for the globe
texture and the 2D map. Run from ui/overview:  python scripts/make_world_lite.py"""
import json
import math
from pathlib import Path

SRC = Path(__file__).resolve().parents[3] / "frontend" / "vendor" / "maps" / "world.json"
OUT = Path(__file__).resolve().parents[1] / "src" / "data" / "geo" / "world-lite.json"
TOL = 0.15


def dp(pts, tol):
    if len(pts) < 3:
        return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1
    norm = math.hypot(dx, dy) or 1e-9
    best, idx = -1.0, 0
    for i in range(1, len(pts) - 1):
        x0, y0 = pts[i]
        d = abs(dy * x0 - dx * y0 + x2 * y1 - y2 * x1) / norm if (dx or dy) else math.hypot(x0 - x1, y0 - y1)
        if d > best:
            best, idx = d, i
    if best <= tol:
        return [pts[0], pts[-1]]
    return dp(pts[: idx + 1], tol)[:-1] + dp(pts[idx:], tol)


def area(ring):
    return abs(sum(ring[i][0] * ring[i - 1][1] - ring[i - 1][0] * ring[i][1] for i in range(len(ring)))) / 2


def _round(pts, nd):
    out = []
    for x, y in pts:
        p = [round(x, nd), round(y, nd)]
        if not out or out[-1] != p:
            out.append(p)
    return out


def ring_lite(ring, keep_small=False):
    raw = [(float(x), float(y)) for x, y in ring]
    out = _round(dp(raw, TOL), 1)
    if len(out) >= 4:
        return out
    if keep_small:                       # tiny islands / city states: keep the shape at finer precision
        out = _round(dp(raw, 0.01), 2)
        return out if len(out) >= 4 else None
    return None


def main():
    src = json.loads(SRC.read_text(encoding="utf-8"))
    feats = []
    for f in src["features"]:
        g = f.get("geometry") or {}
        polys = g.get("coordinates", [])
        if g.get("type") == "Polygon":
            polys = [polys]
        elif g.get("type") != "MultiPolygon":
            continue
        out = []
        biggest = max(range(len(polys)), key=lambda i: area(polys[i][0])) if polys else -1
        for i, poly in enumerate(polys):
            outer = ring_lite(poly[0], keep_small=i == biggest)
            if not outer or (i != biggest and area(outer) < 0.02):
                continue
            holes = [h for h in (ring_lite(r) for r in poly[1:]) if h and area(h) > 0.05]
            out.append([outer] + holes)
        if out:
            p = f.get("properties") or {}
            feats.append({"type": "Feature", "properties": {"name": p.get("name"), "iso2": p.get("iso2"), "cont": p.get("cont")},
                          "geometry": {"type": "MultiPolygon", "coordinates": out}})
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"type": "FeatureCollection", "features": feats}, separators=(",", ":")), encoding="utf-8")
    print(f"{len(feats)} countries, {OUT.stat().st_size // 1024} KB -> {OUT}")


if __name__ == "__main__":
    main()
