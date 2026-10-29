/* 2D world map (SVG): the "Map" view and the fallback when WebGL is not available.
   Same markers and callouts as the globe; India shown with its official borders (Natural Earth, India view). */
import { useEffect, useMemo, useState } from 'react';
import { loadWorld, MAP_BOTTOM, MAP_TOP, project, type World } from '../3d/geo';
import type { SceneCallout, SceneMarker } from '../3d/GlobeScene';
import { Flag } from '../misc/Flag';

const W = 1000;
const H = Math.round((W * (MAP_TOP - MAP_BOTTOM)) / 360);

export function FlatMap({ markers, callouts, countries, note }: { markers: SceneMarker[]; callouts: SceneCallout[]; countries: string[]; note?: string }) {
  const [world, setWorld] = useState<World | null>(null);
  useEffect(() => {
    let alive = true;
    loadWorld().then((w) => alive && setWorld(w));
    return () => {
      alive = false;
    };
  }, []);
  const active = useMemo(() => new Set(countries), [countries]);
  const paths = useMemo(() => {
    if (!world) return [];
    return world.features
      .filter((f) => f.properties.name !== 'Antarctica')
      .map((f) => {
        let d = '';
        for (const poly of f.geometry.coordinates) {
          for (const ring of poly) {
            ring.forEach(([lo, la], k) => {
              const [x, y] = project(lo, Math.max(MAP_BOTTOM, Math.min(MAP_TOP, la)), W, H);
              d += `${k ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
            });
            d += 'Z';
          }
        }
        return { d, on: active.has(f.properties.iso2 || ''), name: f.properties.name };
      });
  }, [world, active]);
  const top = useMemo(() => callouts.filter((c) => !c.dim).sort((a, b) => a.priority - b.priority).slice(0, 4), [callouts]);
  return (
    <div className="flatmap">
      <div className="fm-inner">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="World map with location markers">
        <rect width={W} height={H} rx="18" className="fm-sea" />
        {paths.map((p, i) => (
          <path key={i} d={p.d} className={p.on ? 'fm-land on' : 'fm-land'} fillRule="evenodd" />
        ))}
        {markers.map((m) => {
          const [x, y] = project(m.lon, m.lat, W, H);
          const r = 3 + m.size * 260;
          return (
            <g key={m.id} opacity={m.dim ? 0.3 : 1}>
              <circle cx={x} cy={y} r={r * 2.4} fill={m.color} opacity="0.18" className="fm-pulse" />
              <circle cx={x} cy={y} r={r} fill={m.color} stroke="#fff" strokeWidth="1.5">
                <title>{m.label}</title>
              </circle>
            </g>
          );
        })}
      </svg>
      {top.map((c) => {
        const [x, y] = project(c.lon, c.lat, W, H);
        return (
          <button key={c.id} type="button" className="g-callout fm-call" data-side={x > W * 0.6 ? 'l' : 'r'} style={{ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` }} onClick={c.onClick} aria-label={`${c.label}: ${c.line1}, ${c.line2}. Filter to this region`}>
            <Flag code={c.flag} size={22} />
            <span>
              <strong>{c.label}</strong>
              <small>{c.line1}</small>
              <b>{c.line2}</b>
            </span>
          </button>
        );
      })}
      </div>
      {note && <p className="fm-note">{note}</p>}
    </div>
  );
}
