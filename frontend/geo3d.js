/* DataBridge geo & digital-twin dashboard widgets. Loaded after motion3d.js, before dashboards.js.

   map2d    2D map       areas coloured by value (choropleth), places as pulsing bubbles, or animated flow arcs
   map3d    3D map       areas raised and coloured by value, with 3D pillars / arcs for places
   globe3d  3D globe     the Earth (drawn from the map data, dot-matrix or solid), countries coloured by value,
                         glowing pillars on places and travelling arcs for flows
   twin3d   Digital twin Three.js scene: a building (floors × zones coloured by a measure, click a floor to isolate it)
                         or a campus (one lit building per site, height = value, colour = second measure)

   Places are found by: an area name on the chosen map (country / state / custom area), a city or town name
   (built-in list of ~5,000 places from Natural Earth), or latitude + longitude columns.
   Maps: world (India's official boundary), India states, US states, plus GeoJSON uploaded by admins (/api/maps). */
'use strict';

const DB_GEO_TYPES = {
  map2d: 'Map (2D) — areas, places, flows',
  map3d: '3D map — areas raised by value',
  globe3d: '3D globe (Earth)',
  twin3d: '3D digital twin — building / campus',
};
if (typeof DB_MOTION_TYPES === 'object') Object.assign(DB_MOTION_TYPES, DB_GEO_TYPES);
const DB_BUILTIN_MAPS = [['world', 'World — countries'], ['india', 'India — states & UTs'], ['usa', 'USA — states']];
const DB_MAP_COUNTRY = { india: 'IN', usa: 'US' };
const DB_CITY_ALIAS = {
  'gurugram': 'gurgaon', 'chhatrapati sambhajinagar': 'aurangabad', 'sambhajinagar': 'aurangabad', 'dharashiv': 'osmanabad', 'mysuru': 'mysore',
  'mangaluru': 'mangalore', 'belagavi': 'belgaum', 'kalaburagi': 'gulbarga', 'thiruvananthapuram': 'trivandrum', 'kochi': 'cochin', 'puducherry': 'pondicherry',
  'prayagraj': 'allahabad', 'vadodara': 'baroda', 'kozhikode': 'calicut', 'new york city': 'new york', 'nyc': 'new york', 'la': 'los angeles', 'sf': 'san francisco',
  'bengaluru': 'bangalore', 'kolkata': 'calcutta', 'chennai': 'madras', 'mumbai': 'bombay', 'pune': 'poona', 'varanasi': 'benares', 'odisha': 'orissa',
};
const DB_GEO = { maps: {}, places: null, three: null, custom: null };
/* rates, shares and prices are averaged when they colour a map or a building, never added up */
const dbAvgLike = (c) => /pct|percent|rate|ratio|margin|share|occupancy|avg|average|mean|score|rating|price|ticket|temp|utili[sz]ation/i.test(String(c || ''));
function dbGroupMixed(cols, rows, keys, y, cKey, agg) {
  const g = dbGroup(cols, rows, keys, [y, ...(cKey && !dbAvgLike(cKey) ? [cKey] : [])], agg);
  if (cKey && dbAvgLike(cKey)) {
    const m = new Map(dbGroup(cols, rows, keys, [cKey], 'avg').map((x) => [x.keys.join('\u0001'), x.vals[cKey]]));
    g.forEach((x) => { x.vals[cKey] = m.get(x.keys.join('\u0001')); });
  }
  return g;
}

/* ---------- loading ---------- */
function dbLoadScript(src) {
  return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error(`Could not load ${src}`)); document.head.append(s); });
}
function dbLoadThree() {
  DB_GEO.three = DB_GEO.three || (window.THREE ? Promise.resolve() : dbLoadScript('/static/vendor/three/three.min.js'));
  return DB_GEO.three;
}
async function dbCustomMaps() {
  if (!DB_GEO.custom) DB_GEO.custom = api('/api/maps').then((r) => r.maps || []).catch(() => []);
  return DB_GEO.custom;
}
const dbNorm = (s) => String(s ?? '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim();

/* GeoJSON for a map name, registered with ECharts, plus a name index and a centre point per area */
async function dbGeoMap(name) {
  name = name || 'world';
  if (!DB_GEO.maps[name]) {
    DB_GEO.maps[name] = (async () => {
      const gj = DB_BUILTIN_MAPS.some(([k]) => k === name) ? await fetch(`/static/vendor/maps/${name}.json`).then((r) => { if (!r.ok) throw new Error(`Map ${name} not found`); return r.json(); })
        : await api(`/api/maps/${encodeURIComponent(name)}`);
      const index = new Map();
      const centre = {};
      for (const f of gj.features) {
        const p = f.properties || {};
        for (const k of [p.name, p.iso2, p.iso3, ...(p.alt || [])]) if (k) { const n = dbNorm(k); if (n && !index.has(n)) index.set(n, p.name); }
        centre[p.name] = dbGeoCentre(f.geometry);
      }
      if (window.echarts && !echarts.getMap(`db-${name}`)) echarts.registerMap(`db-${name}`, gj);
      return { name, gj, index, centre };
    })();
    DB_GEO.maps[name].catch(() => { delete DB_GEO.maps[name]; });
  }
  const m = await DB_GEO.maps[name];
  if (window.echarts && !echarts.getMap(`db-${name}`)) echarts.registerMap(`db-${name}`, m.gj);
  return m;
}
function dbGeoCentre(g) {                                  // centre of the largest ring (area-weighted)
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
  let best = null, bestA = -1;
  for (const poly of polys) {
    const ring = poly[0];
    let a = 0, cx = 0, cy = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const f = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
      a += f; cx += (ring[j][0] + ring[i][0]) * f; cy += (ring[j][1] + ring[i][1]) * f;
    }
    if (Math.abs(a) > bestA) { bestA = Math.abs(a); best = a ? [cx / (3 * a), cy / (3 * a)] : ring[0]; }
  }
  return best;
}
async function dbPlaces() {
  if (!DB_GEO.places) {
    DB_GEO.places = fetch('/static/vendor/maps/places.json').then((r) => r.json()).then((rows) => {
      const idx = new Map();
      for (const r of rows) for (const n of [r[0], ...(r[6] || [])]) { const k = dbNorm(n); if (!idx.has(k)) idx.set(k, []); idx.get(k).push(r); }
      return idx;
    });
  }
  return DB_GEO.places;
}
/* [lon, lat] for a city name; `hint` is a state / country value from the same row, `country` the map's country */
function dbFindPlace(idx, name, hint, country) {
  const k = dbNorm(name);
  let c = idx.get(k) || idx.get(DB_CITY_ALIAS[k] || '') || idx.get(k.replace(/\b(city|nagar|district)\b/g, '').trim());
  if (!c) return null;
  const h = dbNorm(hint);
  if (h) { const m = c.filter((r) => dbNorm(r[2]) === h || dbNorm(r[1]) === h); if (m.length) c = m; }
  if (country) { const m = c.filter((r) => r[1] === country); if (m.length) c = m; }
  const r = c[0];                                          // list is sorted by population
  return [r[4], r[3]];
}

/* colour along a ramp, t in 0..1 */
function dbRamp(stops) {
  const rgb = stops.map((c) => { const h = c.replace('#', ''); return [0, 2, 4].map((o) => parseInt(h.slice(o, o + 2), 16)); });
  return (t) => {
    const f = Math.max(0, Math.min(0.9999, Number.isFinite(t) ? t : 0)) * (rgb.length - 1), k = Math.floor(f), r = f - k;
    return `rgb(${rgb[k].map((v, z) => Math.round(v + (rgb[k + 1][z] - v) * r)).join(',')})`;
  };
}
const dbHex = (c, fb) => (/^#[0-9a-f]{6}$/i.test(c || '') ? c : fb);

/* ---------- turn rows into located items ---------- */
async function dbGeoItems(w, cols, rows, mapName) {
  const y = (w.y || [])[0];
  const agg = w.agg || 'sum';
  const tc = w.time && cols.includes(w.time) ? w.time : null;
  const grain = w.grain || 'month';
  const latlon = w.lat && w.lon && cols.includes(w.lat) && cols.includes(w.lon);
  const map = await dbGeoMap(mapName);
  const src = tc ? rows.map((r) => r.map((v, i) => (cols[i] === tc ? dbTimeKey(v, grain) : v))) : rows;
  const measures = [y, ...(w.color && w.color !== y && cols.includes(w.color) ? [w.color] : [])].filter(Boolean);
  const unknown = new Set();
  let kind = w.geo || 'auto';
  if (latlon && (kind === 'auto' || kind === 'latlon')) kind = 'latlon';
  else if (kind === 'latlon') kind = 'auto';
  if (kind === 'auto' && w.x && cols.includes(w.x)) {                       // area names if most values are areas on this map
    const xi = cols.indexOf(w.x);
    const vals = [...new Set(rows.slice(0, 2000).map((r) => r[xi]).filter((v) => v != null))].slice(0, 200);
    kind = vals.length && vals.filter((v) => map.index.has(dbNorm(v))).length >= vals.length * 0.5 ? 'region' : 'place';
  }
  const places = kind === 'place' || (w.target && w.geoTarget !== 'region') ? await dbPlaces() : null;
  const country = DB_MAP_COUNTRY[mapName] || '';
  const hi = w.hint && cols.includes(w.hint) ? cols.indexOf(w.hint) : -1;
  const hintOf = new Map();
  if (hi >= 0 && w.x) { const xi = cols.indexOf(w.x); for (const r of rows) if (!hintOf.has(String(r[xi]))) hintOf.set(String(r[xi]), r[hi]); }
  const locate = (v, asKind) => {
    if (v == null) return null;
    if (asKind === 'region') { const n = map.index.get(dbNorm(v)); if (!n) { unknown.add(String(v)); return null; } return { area: n, at: map.centre[n] }; }
    const at = dbFindPlace(places, v, hintOf.get(String(v)), country);
    if (!at) { unknown.add(String(v)); return null; }
    return { at };
  };
  let items = [];
  if (kind === 'latlon') {
    const keys = [...(tc ? [tc] : []), w.lat, w.lon, ...(w.x && cols.includes(w.x) ? [w.x] : [])];
    items = dbGroupMixed(cols, src, keys, y, measures[1], agg).map((g) => {
      const o = tc ? 1 : 0;
      const lat = Number(g.keys[o]), lon = Number(g.keys[o + 1]);
      if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
      return { t: tc ? g.keys[0] : '', name: g.keys[o + 2] ?? `${lat.toFixed(2)}, ${lon.toFixed(2)}`, at: [lon, lat], v: g.vals[y], c: g.vals[measures[1]] };
    }).filter(Boolean);
  } else if (w.x && cols.includes(w.x)) {
    const keys = [...(tc ? [tc] : []), w.x, ...(w.target && cols.includes(w.target) ? [w.target] : [])];
    const tKind = w.geoTarget === 'region' || (w.geoTarget !== 'place' && kind === 'region') ? 'region' : 'place';
    items = dbGroupMixed(cols, src, keys, y, measures[1], agg).map((g) => {
      const o = tc ? 1 : 0;
      const a = locate(g.keys[o], kind);
      if (!a) return null;
      const it = { t: tc ? g.keys[0] : '', name: a.area || g.keys[o], area: a.area, at: a.at, v: g.vals[y], c: g.vals[measures[1]] };
      if (keys.length > o + 1 && w.target) {
        const b = locate(g.keys[o + 1], tKind);
        if (!b || !b.at || !a.at) return null;
        Object.assign(it, { to: b.at, toName: b.area || g.keys[o + 1] });
      }
      return it;
    }).filter(Boolean);
  }
  const frames = tc ? dbSortKeys(items.map((i) => i.t)) : [''];
  return { kind, items, frames, unknown: [...unknown], map, y, cKey: measures[1] || null };
}

/* ---------- render ---------- */
async function dbGeoRender(ctx, w, cols, rows, body) {
  if (w.type === 'twin3d') return dbTwinRender(ctx, w, cols, rows, body);
  const gl = w.type !== 'map2d';
  const holder = el('div', { class: `dash-canvas mo-holder${gl ? ' mo-3d' : ''}`, role: 'img', 'aria-label': `${DB_GEO_TYPES[w.type]}: ${w.title || ''}` });
  body.append(holder);
  const level = ctx.printing ? 'off' : dbMotionLevel(ctx.D);
  const anim = level !== 'off';
  const orbit = level === 'cinematic' || (level === 'subtle' && w.autoRotate !== false);
  const say = (t) => { holder.replaceWith(el('p', { class: 'muted dash-msg' }, t)); };
  let G;
  try {
    await dbLoadEcharts(gl);
    const mapName = w.type === 'globe3d' ? (w.map && w.map !== 'world' ? w.map : 'world') : (w.map || 'world');
    G = await dbGeoItems(w, cols, rows, mapName);
    if (w.type === 'globe3d' && mapName !== 'world') G.world = await dbGeoMap('world');
  } catch (e) { say(e.message); return; }
  if (!holder.isConnected) return;
  if (!G.y) return say('Pick the value (size / colour).');
  if (!G.items.length) return say(G.unknown.length ? `None of the places were found on this map (e.g. ${G.unknown.slice(0, 3).join(', ')}). Pick another map, or use latitude/longitude columns.` : 'Pick the location column (X axis) — an area, a city, or latitude + longitude columns in Map settings.');
  const T = ctx.theme();
  const P = ctx.pal();
  const dark = !!T.dark;
  const text = ctx.themeVar('--d-text', T.v.text || '#1b2333');
  const muted = ctx.themeVar('--d-muted', T.v.muted || '#667085');
  const fmt = (v) => dbFmt(v, w.format || 'compact', ctx.cur());
  const cfmt = (v) => dbFmt(v, String(G.cKey || '').match(/pct|percent|rate|share|margin/i) ? 'percent' : 'compact', ctx.cur());
  const nm = (c) => String(c || '').replace(/_/g, ' ');
  const accent = dbHex(P[0], '#7c83fd'), accent2 = dbHex(P[1], '#22d3ee');
  const ramp = [dark ? '#1e3a8a' : '#bfdbfe', accent2, accent, '#a855f7', '#f43f5e'];
  const rampFn = dbRamp(ramp);
  const inst = echarts.init(holder, null, { devicePixelRatio: ctx.printing ? 2 : undefined });
  const timers = [];
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => inst.resize()) : null;
  if (ro) ro.observe(holder);
  ctx.register(w.id, { destroy: () => { timers.forEach((t) => clearInterval(t)); if (ro) ro.disconnect(); if (gl && typeof dbDisposeGl === 'function') dbDisposeGl(inst, holder); else inst.dispose(); }, resize: () => inst.resize() });
  const tip = { confine: true, backgroundColor: dark ? 'rgba(12,16,38,.94)' : 'rgba(255,255,255,.97)', borderColor: accent, borderWidth: 1, textStyle: { color: text } };
  const base = { backgroundColor: 'transparent', textStyle: { color: text, fontFamily: ctx.font }, animation: anim, animationDuration: anim ? 1100 : 0, tooltip: tip };
  const vals = G.items.map((i) => i.v).filter(dbIsNum);
  const vMax = Math.max(1e-9, ...vals), vMin = Math.min(0, ...vals);
  const cvals = G.items.map((i) => i.c).filter(dbIsNum);
  const cMin = Math.min(...cvals), cMax = Math.max(...cvals);
  const colourOf = (it) => (G.cKey && dbIsNum(it.c) ? rampFn((it.c - cMin) / ((cMax - cMin) || 1)) : rampFn(0.25 + 0.75 * ((it.v || 0) - vMin) / ((vMax - vMin) || 1)));
  const isFlow = G.items.some((i) => i.to);
  const isArea = G.kind === 'region' && !isFlow;
  const frameItems = (f) => G.items.filter((i) => i.t === f);
  const lastFrame = G.frames[G.frames.length - 1];
  const legend = (label, lo, hi) => holder.parentElement.append(el('div', { class: `mo-legend${G.frames.length > 1 && w.type === 'map2d' ? ' top' : ''}` }, el('span', {}, label), el('i', { style: { background: `linear-gradient(90deg, ${ramp.join(',')})` } }), el('span', {}, `${lo} – ${hi}`)));
  if (G.unknown.length) holder.parentElement.append(el('div', { class: 'mo-note', title: G.unknown.join(', ') }, `${G.unknown.length} not on the map`));
  const bounds = () => {                                  // zoom to the data when it covers a small part of the map
    const pts = G.items.flatMap((i) => [i.at, i.to]).filter(Boolean);
    if (!pts.length || isArea) return undefined;
    let [x0, y0, x1, y1] = [180, 90, -180, -90];
    for (const [x, y] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const pad = Math.max(2, (x1 - x0) * 0.15, (y1 - y0) * 0.15);
    return (x1 - x0) < 200 ? [[x0 - pad, Math.min(85, y1 + pad)], [x1 + pad, Math.max(-60, y0 - pad)]] : undefined;
  };
  const mapId = `db-${G.map.name}`;

  /* ----- 2D map ----- */
  if (w.type === 'map2d') {
    const box = G.map.name === 'world' ? bounds() : undefined;
    const geoBase = { map: mapId, roam: true, boundingCoords: box, layoutCenter: ['50%', '52%'], layoutSize: '96%', scaleLimit: { min: 0.8, max: 12 } };
    const top = { ...geoBase, z: 2, itemStyle: { areaColor: dark ? 'rgba(124,131,253,.10)' : '#eef2ff', borderColor: dark ? `${accent}aa` : '#94a3b8', borderWidth: 0.7, shadowColor: dark ? `${accent}88` : 'rgba(30,41,59,.25)', shadowBlur: dark ? 12 : 6 },
      emphasis: { itemStyle: { areaColor: dark ? `${accent2}55` : '#c7d2fe' }, label: { show: true, color: text } }, label: { show: false }, select: { disabled: true }, silent: !isArea && false };
    const slab = { ...geoBase, z: 1, silent: true, layoutCenter: ['50.6%', '54%'], itemStyle: { areaColor: dark ? '#0b1030' : '#cbd5e1', borderColor: dark ? `${accent}55` : '#94a3b8', borderWidth: 1 }, label: { show: false }, emphasis: { disabled: true } };
    const seriesFor = (f) => {
      const its = frameItems(f);
      if (isArea) return [{ type: 'map', geoIndex: 0, data: its.map((i) => ({ name: i.area, value: i.v, c: i.c })) }];
      if (isFlow) {
        const wMax = Math.max(1e-9, ...its.map((i) => i.v || 0));
        const ends = new Map();
        its.forEach((i) => { ends.set(i.name, { at: i.at, v: (ends.get(i.name)?.v || 0) + (i.v || 0) }); ends.set(i.toName, { at: i.to, v: (ends.get(i.toName)?.v || 0) + (i.v || 0) }); });
        return [{ type: 'lines', coordinateSystem: 'geo', geoIndex: 0, zlevel: 1, effect: { show: anim, period: 4.5, trailLength: 0.35, symbol: 'arrow', symbolSize: 7, color: accent2 },
          lineStyle: { curveness: 0.28, opacity: 0.8 },
          data: its.map((i) => ({ coords: [i.at, i.to], name: `${i.name} → ${i.toName}`, value: i.v, lineStyle: { width: 1 + 4 * (i.v || 0) / wMax, color: colourOf(i) } })),
          tooltip: { formatter: (p) => `<b>${dbEsc(p.name)}</b><br>${nm(G.y)}: ${fmt(p.value)}` } },
        { type: anim ? 'effectScatter' : 'scatter', coordinateSystem: 'geo', geoIndex: 0, zlevel: 2, rippleEffect: { scale: 3, brushType: 'stroke' },
          data: [...ends].map(([n, e]) => ({ name: n, value: [...e.at, e.v] })), symbolSize: 7, itemStyle: { color: accent2 }, label: { show: ends.size <= 24, position: 'right', formatter: '{b}', color: text, fontSize: 10 }, labelLayout: { hideOverlap: true },
          tooltip: { formatter: (p) => `<b>${dbEsc(p.name)}</b><br>${nm(G.y)} (in + out): ${fmt(p.value[2])}` } }];
      }
      const sorted = its.slice().sort((a, b) => (b.v || 0) - (a.v || 0));
      const pulse = level === 'cinematic' ? 5 : 0;
      const size = (v) => 5 + 30 * Math.sqrt(Math.max(0, v || 0) / vMax);
      const pt = (i) => ({ name: i.name, value: [...i.at, i.v], c: i.c, itemStyle: { color: colourOf(i), shadowBlur: dark ? 14 : 0, shadowColor: colourOf(i) } });
      return [{ type: 'scatter', coordinateSystem: 'geo', geoIndex: 0, zlevel: 1, data: sorted.slice(pulse).map(pt), symbolSize: (v) => size(v[2]), itemStyle: { opacity: 0.85, borderColor: dark ? 'rgba(255,255,255,.5)' : '#fff', borderWidth: 0.6 },
        label: { show: true, formatter: (p) => (sorted.findIndex((s) => s.name === p.name) < 8 ? p.name : ''), position: 'right', color: text, fontSize: 10 }, labelLayout: { hideOverlap: true } },
      ...(pulse ? [{ type: 'effectScatter', coordinateSystem: 'geo', geoIndex: 0, zlevel: 2, data: sorted.slice(0, pulse).map(pt), symbolSize: (v) => size(v[2]), rippleEffect: { scale: 2.6, brushType: 'stroke', period: 3 },
        label: { show: true, formatter: '{b}', position: 'right', color: text, fontSize: 11, fontWeight: 600 }, labelLayout: { hideOverlap: true } }] : [])];
    };
    const tooltip = { ...tip, trigger: 'item', formatter: (p) => {
      if (p.seriesType === 'lines' || p.seriesType === 'effectScatter' && isFlow) return undefined;
      const d = p.data || {};
      const v = Array.isArray(d.value) ? d.value[2] : d.value;
      return v == null ? `<b>${dbEsc(p.name)}</b><br><span style="opacity:.7">no data</span>` : `<b>${dbEsc(p.name)}</b><br>${nm(G.y)}: ${fmt(v)}${G.cKey && dbIsNum(d.c) ? `<br>${nm(G.cKey)}: ${cfmt(d.c)}` : ''}`;
    } };
    const visualMap = isArea ? { type: 'continuous', min: vMin, max: vMax, left: 10, bottom: 10, calculable: true, itemHeight: 90, itemWidth: 10, formatter: (v) => fmt(v), textStyle: { color: muted, fontSize: 10 },
      inRange: { color: ramp }, seriesIndex: 0 } : undefined;
    const opt = { ...base, tooltip, geo: [top, slab], visualMap };
    if (G.frames.length > 1) {
      inst.setOption({ baseOption: { ...opt, timeline: dbGeoTimeline(G.frames, w, anim, muted, accent) },
        options: G.frames.map((f) => ({ series: seriesFor(f), title: { text: f, left: 8, top: 4, textStyle: { color: muted, fontSize: 20, fontWeight: 600, opacity: 0.7 } } })) });
    } else inst.setOption({ ...opt, series: seriesFor(lastFrame) });
    inst.on('georoam', (e) => {                            // keep the slab under the map while zooming / panning
      const o = inst.getOption().geo[0];
      inst.setOption({ geo: [{}, { zoom: o.zoom, center: o.center }] }, false);
    });
    if (!isArea && G.cKey && cvals.length) legend(nm(G.cKey), cfmt(cMin), cfmt(cMax));
    return;
  }

  /* ----- 3D map ----- */
  if (w.type === 'map3d') {
    const its = frameItems(lastFrame);
    const byArea = new Map(its.filter((i) => i.area).map((i) => [i.area, i]));
    const regions = isArea ? [...byArea.values()].map((i) => ({ name: i.area, height: 0.6 + 7 * Math.max(0, i.v || 0) / vMax, itemStyle: { color: colourOf(i), opacity: 1 },
      label: { show: false } })) : [];
    const geo3D = { map: mapId, regionHeight: 0.6, boxWidth: 110, boxHeight: 10, shading: 'lambert', environment: 'none', groundPlane: { show: false },
      itemStyle: { color: dark ? '#141a44' : '#e2e8f0', borderColor: dark ? `${accent}cc` : '#94a3b8', borderWidth: 0.8, opacity: 1 },
      emphasis: { itemStyle: { color: dark ? '#ffffff' : accent }, label: { show: true, textStyle: { color: text, backgroundColor: 'transparent', fontSize: 13 } } },
      label: { show: false, textStyle: { color: text, backgroundColor: 'transparent' } },
      light: { main: { intensity: 1.1, shadow: false, alpha: 45, beta: 20 }, ambient: { intensity: dark ? 0.45 : 0.55 } },
      viewControl: { autoRotate: orbit, autoRotateSpeed: 4, autoRotateAfterStill: 5, distance: G.map.name === 'world' ? 170 : isArea ? 175 : 160, alpha: isArea ? 58 : 50, beta: 4, minAlpha: 10, maxAlpha: 88, damping: 0.85, animation: anim, panMouseButton: 'right', rotateMouseButton: 'left' },
      postEffect: { enable: false }, temporalSuperSampling: { enable: true }, regions };
    const series = [];
    if (!isArea && !isFlow) {
      series.push({ type: 'bar3D', coordinateSystem: 'geo3D', shading: 'lambert', barSize: G.map.name === 'world' ? 1.6 : 1.1, minHeight: 1, bevelSize: 0.3, bevelSmoothness: 2,
        data: its.map((i) => ({ name: i.name, value: [...i.at, 2 + 26 * Math.max(0, i.v || 0) / vMax], raw: i.v, c: i.c, itemStyle: { color: colourOf(i) } })),
        label: { show: false }, emphasis: { label: { show: true, formatter: (p) => `${p.name}  ${fmt(p.data.raw)}`, textStyle: { color: text, backgroundColor: 'transparent', fontSize: 12 } } } });
    }
    if (isFlow) {
      series.push({ type: 'lines3D', coordinateSystem: 'geo3D', blendMode: dark ? 'lighter' : 'source-over', effect: { show: anim, period: 3, trailWidth: 3, trailLength: 0.25, trailOpacity: 1, trailColor: accent2 },
        lineStyle: { width: 1.5, color: accent, opacity: 0.35 }, data: its.map((i) => ({ coords: [i.at, i.to], name: `${i.name} → ${i.toName}`, value: i.v })) });
      series.push({ type: 'scatter3D', coordinateSystem: 'geo3D', symbolSize: 7, itemStyle: { color: accent2 }, data: its.flatMap((i) => [{ name: i.name, value: [...i.at, 0.6] }, { name: i.toName, value: [...i.to, 0.6] }]),
        label: { show: false }, emphasis: { label: { show: true, formatter: '{b}', textStyle: { color: text, backgroundColor: 'transparent' } } } });
    }
    inst.setOption({ ...base, tooltip: { ...tip, formatter: (p) => {
      const i = isArea ? byArea.get(p.name) : null;
      if (isArea) return i ? `<b>${dbEsc(p.name)}</b><br>${nm(G.y)}: ${fmt(i.v)}${G.cKey && dbIsNum(i.c) ? `<br>${nm(G.cKey)}: ${cfmt(i.c)}` : ''}` : `<b>${dbEsc(p.name)}</b><br><span style="opacity:.7">no data</span>`;
      if (p.seriesType === 'bar3D') return `<b>${dbEsc(p.name)}</b><br>${nm(G.y)}: ${fmt(p.data.raw)}${G.cKey && dbIsNum(p.data.c) ? `<br>${nm(G.cKey)}: ${cfmt(p.data.c)}` : ''}`;
      return p.seriesType === 'lines3D' ? `<b>${dbEsc(p.name)}</b><br>${fmt(p.value)}` : `<b>${dbEsc(p.name)}</b>`;
    } }, geo3D, series });
    if (isArea || G.cKey) legend(G.cKey ? nm(G.cKey) : nm(G.y), G.cKey ? cfmt(cMin) : fmt(vMin), G.cKey ? cfmt(cMax) : fmt(vMax));
    return;
  }

  /* ----- globe ----- */
  if (w.type === 'globe3d') {
    const world = G.world || G.map;
    const its = frameItems(lastFrame);
    const areaColour = new Map(isArea ? its.filter((i) => i.area).map((i) => [i.area, colourOf(i)]) : []);
    // passed as an image: a canvas given on the first setOption is sometimes never uploaded to the GPU
    const tex = dbGlobeTexture(world.gj, G.map.name === 'world' ? null : G.map.gj, areaColour, { dark, accent, accent2, style: w.globeStyle || 'dots' }).toDataURL('image/jpeg', 0.92);
    const byArea = new Map(its.filter((i) => i.area).map((i) => [i.area, i]));
    const series = [];
    const focus = (() => { const pts = its.map((i) => i.at).filter(Boolean); if (!pts.length) return [78, 22]; const s = pts.reduce((a, p) => [a[0] + p[0], a[1] + p[1]], [0, 0]); return [s[0] / pts.length, s[1] / pts.length]; })();
    if (!isFlow && !isArea) {
      series.push({ type: 'bar3D', coordinateSystem: 'globe', shading: 'lambert', barSize: 0.7, minHeight: 0.5, bevelSize: 0.4,
        data: its.map((i) => ({ name: i.name, value: [...i.at, 2 + 26 * Math.max(0, i.v || 0) / vMax], raw: i.v, c: i.c, itemStyle: { color: colourOf(i) } })),
        emphasis: { label: { show: true, formatter: (p) => `${p.name}  ${fmt(p.data.raw)}`, textStyle: { color: '#fff', backgroundColor: 'rgba(0,0,0,.55)', padding: 4, fontSize: 12 } } } });
    } else if (isFlow) {
      series.push({ type: 'lines3D', coordinateSystem: 'globe', blendMode: 'lighter', effect: { show: anim, period: 2.6, trailWidth: 2.5, trailLength: 0.2, trailOpacity: 1, trailColor: accent2 },
        lineStyle: { width: 1.2, color: accent, opacity: 0.45 }, data: its.map((i) => ({ coords: [i.at, i.to], name: `${i.name} → ${i.toName}`, value: i.v })) });
      series.push({ type: 'scatter3D', coordinateSystem: 'globe', symbolSize: 6, itemStyle: { color: '#fff' }, blendMode: 'lighter',
        data: its.flatMap((i) => [{ name: i.name, value: [...i.at, 0] }, { name: i.toName, value: [...i.to, 0] }]) });
    }
    inst.setOption({ ...base,
      tooltip: { ...tip, formatter: (p) => (p.seriesType === 'bar3D' ? `<b>${dbEsc(p.name)}</b><br>${nm(G.y)}: ${fmt(p.data.raw)}${G.cKey && dbIsNum(p.data.c) ? `<br>${nm(G.cKey)}: ${cfmt(p.data.c)}` : ''}`
        : p.seriesType === 'lines3D' ? `<b>${dbEsc(p.name)}</b><br>${fmt(p.value)}` : `<b>${dbEsc(p.name)}</b>`) },
      globe: { baseTexture: tex, shading: w.globeStyle === 'solid' ? 'lambert' : 'color', environment: 'none', globeRadius: 78, globeOuterRadius: 110,
        atmosphere: { show: true, offset: 4, color: accent, glowPower: 5, innerGlowPower: 1.2 },
        light: { main: { intensity: 1.2, alpha: 25, beta: 40 }, ambient: { intensity: 0.65 } },
        viewControl: { autoRotate: orbit, autoRotateSpeed: 5, autoRotateAfterStill: 4, distance: 175, targetCoord: focus, damping: 0.85, animation: anim },
        postEffect: { enable: false }, temporalSuperSampling: { enable: true } },
      series });
    if (isArea) {
      const lab = el('div', { class: 'mo-pick' });
      holder.parentElement.append(lab);
      const sorted = [...byArea.values()].sort((a, b) => (b.v || 0) - (a.v || 0)).slice(0, 5);
      setKids(lab, sorted.map((i) => el('div', {}, el('i', { style: { background: colourOf(i) } }), el('span', {}, i.area), el('b', {}, fmt(i.v)))));
      legend(G.cKey ? nm(G.cKey) : nm(G.y), G.cKey ? cfmt(cMin) : fmt(vMin), G.cKey ? cfmt(cMax) : fmt(vMax));
    } else if (G.cKey) legend(nm(G.cKey), cfmt(cMin), cfmt(cMax));
  }
}
function dbGeoTimeline(frames, w, anim, muted, accent) {
  return { axisType: 'category', data: frames, autoPlay: anim, playInterval: Number(w.speed) || 1500, loop: w.loop !== false, bottom: 2, left: 110, right: 40, height: 32,
    label: { color: muted, fontSize: 10 }, lineStyle: { color: `${muted}66` }, checkpointStyle: { color: accent, borderColor: accent }, controlStyle: { color: muted, borderColor: muted }, itemStyle: { color: `${muted}88` } };
}

/* Equirectangular Earth texture drawn from GeoJSON: dot-matrix ("dots") or filled ("solid") land, areas with data in their colour */
function dbGlobeTexture(world, overlay, colours, o) {
  const W = 4096, H = 2048;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const sea = g.createLinearGradient(0, 0, 0, H);
  sea.addColorStop(0, o.dark ? '#050818' : '#c7dcf5'); sea.addColorStop(0.5, o.dark ? '#0a1236' : '#dbeafe'); sea.addColorStop(1, o.dark ? '#050818' : '#c7dcf5');
  g.fillStyle = sea; g.fillRect(0, 0, W, H);
  const X = (lon) => (lon + 180) / 360 * W, Y = (lat) => (90 - lat) / 180 * H;
  const path = (ctx2, geom) => {
    ctx2.beginPath();
    const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
    for (const poly of polys) for (const ring of poly) ring.forEach(([lon, lat], i) => (i ? ctx2.lineTo(X(lon), Y(lat)) : ctx2.moveTo(X(lon), Y(lat))));
  };
  const layers = [world.features, ...(overlay ? [overlay.features] : [])];
  const land = o.dark ? '#1c2463' : '#94a3b8';
  if (o.style === 'solid') {
    for (const feats of layers) for (const f of feats) { path(g, f.geometry); g.fillStyle = colours.get(f.properties.name) || land; g.fill('evenodd'); g.strokeStyle = o.dark ? `${o.accent}99` : '#ffffff'; g.lineWidth = 1.2; g.stroke(); }
  } else {
    // paint each area in a unique id colour on a small mask, then draw a dot wherever there is land
    const mw = 1440, mh = 720, m = document.createElement('canvas'); m.width = mw; m.height = mh;
    const mg = m.getContext('2d'); mg.imageSmoothingEnabled = false;
    const ids = [];
    const mx = (lon) => (lon + 180) / 360 * mw, my = (lat) => (90 - lat) / 180 * mh;
    for (const feats of layers) for (const f of feats) {
      ids.push(f.properties.name);
      const id = ids.length;
      mg.fillStyle = `rgb(${id & 255},${(id >> 8) & 255},200)`;
      mg.beginPath();
      const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
      for (const poly of polys) for (const ring of poly) ring.forEach(([lon, lat], i) => (i ? mg.lineTo(mx(lon), my(lat)) : mg.moveTo(mx(lon), my(lat))));
      mg.fill('evenodd');
    }
    const px = mg.getImageData(0, 0, mw, mh).data;
    const step = 4;
    const r = (W / mw) * step * 0.36;
    for (let yy = step / 2; yy < mh; yy += step) {
      const lat = 90 - yy / mh * 180;
      const sx = step / Math.max(0.25, Math.cos(lat * Math.PI / 180));   // keep dots evenly spaced on the sphere
      for (let xx = (Math.floor(yy / step) % 2) * sx / 2; xx < mw; xx += sx) {
        const k = (Math.floor(yy) * mw + Math.floor(xx)) * 4;
        if (px[k + 2] !== 200) continue;
        const name = ids[px[k] + (px[k + 1] << 8) - 1];
        g.fillStyle = colours.get(name) || (o.dark ? '#3b4aa8' : '#64748b');
        g.beginPath(); g.arc(xx * W / mw, yy * H / mh, r, 0, Math.PI * 2); g.fill();
      }
    }
    g.globalAlpha = o.dark ? 0.35 : 0.5; g.strokeStyle = o.dark ? o.accent : '#475569'; g.lineWidth = 1.4;
    for (const feats of layers) for (const f of feats) { path(g, f.geometry); g.stroke(); }
    g.globalAlpha = 1;
  }
  // faint graticule
  g.strokeStyle = o.dark ? 'rgba(124,131,253,.10)' : 'rgba(30,41,59,.08)'; g.lineWidth = 1;
  for (let lon = -180; lon <= 180; lon += 30) { g.beginPath(); g.moveTo(X(lon), 0); g.lineTo(X(lon), H); g.stroke(); }
  for (let lat = -60; lat <= 60; lat += 30) { g.beginPath(); g.moveTo(0, Y(lat)); g.lineTo(W, Y(lat)); g.stroke(); }
  return cv;
}

/* ---------- digital twin (Three.js) ---------- */
async function dbTwinRender(ctx, w, cols, rows, body) {
  const holder = el('div', { class: 'dash-canvas mo-holder mo-3d mo-twin', role: 'img', 'aria-label': `${DB_GEO_TYPES.twin3d}: ${w.title || ''}` });
  body.append(holder);
  const say = (t) => { holder.replaceWith(el('p', { class: 'muted dash-msg' }, t)); };
  const y = (w.y || [])[0];
  const mode = w.twin || 'building';
  if (!w.x || !y) return say(mode === 'building' ? 'Pick the floor column (X axis) and the value. Add zones (rooms / areas) in Twin settings.' : 'Pick what each building is (X axis) and its height (value).');
  try { await dbLoadThree(); } catch (e) { say(e.message); return; }
  if (!holder.isConnected) return;
  const T = ctx.theme();
  const P = ctx.pal();
  const dark = !!T.dark;
  const level = ctx.printing ? 'off' : dbMotionLevel(ctx.D);
  const anim = level !== 'off';
  const orbit = level === 'cinematic' || (level === 'subtle' && w.autoRotate !== false);
  const fmt = (v) => dbFmt(v, w.format || 'compact', ctx.cur());
  const nm = (c) => String(c || '').replace(/_/g, ' ');
  const accent = dbHex(P[0], '#7c83fd'), accent2 = dbHex(P[1], '#22d3ee');
  const ramp = [dark ? '#1e3a8a' : '#93c5fd', accent2, '#facc15', '#fb923c', '#f43f5e'];
  const rampFn = dbRamp(ramp);
  const agg = w.agg || 'sum';
  const cKey = w.color && w.color !== y && cols.includes(w.color) ? w.color : null;
  const cfmt = (v) => dbFmt(v, String(cKey || '').match(/pct|percent|rate|share|margin|occupancy/i) ? 'percent' : 'compact', ctx.cur());

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: !!ctx.printing });
  } catch (e) { say('3D needs WebGL, which this browser has turned off.'); return; }
  const scene = new THREE.Scene();
  if (dark) scene.fog = new THREE.Fog(0x070a1f, 140, 320);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.5, 1200);
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  holder.append(renderer.domElement);
  const overlay = el('div', { class: 'tw-labels' });
  const tipEl = el('div', { class: 'tw-tip', hidden: true });
  holder.append(overlay, tipEl);
  scene.add(new THREE.HemisphereLight(dark ? 0x8fa0ff : 0xffffff, dark ? 0x0b0f2a : 0xcbd5e1, dark ? 0.9 : 1.1));
  const sun = new THREE.DirectionalLight(0xffffff, dark ? 1.1 : 1.4); sun.position.set(60, 120, 80); scene.add(sun);
  const rim = new THREE.DirectionalLight(new THREE.Color(accent2), dark ? 0.8 : 0.3); rim.position.set(-80, 40, -60); scene.add(rim);

  const pickables = [];
  const labels = [];
  const addLabel = (text, pos, cls = '') => { const d = el('div', { class: `tw-label ${cls}` }, text); overlay.append(d); labels.push({ d, pos }); return d; };
  const edgeMat = new THREE.LineBasicMaterial({ color: new THREE.Color(accent), transparent: true, opacity: dark ? 0.85 : 0.6 });
  const edges = (mesh) => { const l = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), edgeMat); mesh.add(l); return l; };
  const animTargets = [];                                  // {obj, prop, from, to} eased in on load
  let radius = 90, target = new THREE.Vector3(0, 10, 0);
  let floorsInfo = null;

  // ground: glowing grid
  const grid = new THREE.GridHelper(400, 80, new THREE.Color(accent), new THREE.Color(dark ? '#1b2356' : '#cbd5e1'));
  grid.material.transparent = true; grid.material.opacity = dark ? 0.35 : 0.5; scene.add(grid);

  if (mode === 'building') {
    const floorKey = w.x, zoneKey = w.series && cols.includes(w.series) ? w.series : null;
    const g = dbGroupMixed(cols, rows, zoneKey ? [floorKey, zoneKey] : [floorKey], y, cKey, agg);
    let floors = dbSortKeys(g.map((x) => x.keys[0]));
    const isGround = (f) => /^(g|gf|ground|lobby|l0|0|basement|b\d*)$/i.test(String(f).trim());
    floors.sort((a, b) => (isGround(b) - isGround(a)) || 0);
    if (w.topFirst) floors.reverse();
    floors = floors.slice(0, 40);
    const zones = zoneKey ? dbSortKeys(g.map((x) => x.keys[1])).slice(0, 24) : ['—'];
    const vals = g.map((x) => (cKey ? x.vals[cKey] : x.vals[y])).filter(dbIsNum);
    const lo = Math.min(...vals), hi = Math.max(...vals);
    const by = new Map(g.map((x) => [`${x.keys[0]}\u0001${zoneKey ? x.keys[1] : '—'}`, x]));
    const nc = Math.ceil(Math.sqrt(zones.length * 1.6)), nr = Math.ceil(zones.length / nc);
    const W = 36, D = 24, FH = 3.4, gap = 0.5;
    const cw = W / nc, cd = D / nr;
    floorsInfo = [];
    floors.forEach((f, fi) => {
      const grp = new THREE.Group();
      const baseY = fi * (FH + gap);
      grp.position.y = baseY;
      const slab = new THREE.Mesh(new THREE.BoxGeometry(W + 1.2, 0.35, D + 1.2), new THREE.MeshStandardMaterial({ color: dark ? 0x1a2152 : 0xe2e8f0, metalness: 0.3, roughness: 0.6, transparent: true, opacity: 0.95 }));
      slab.position.y = 0.17; grp.add(slab); edges(slab);
      const cells = [];
      zones.forEach((z, zi) => {
        const rec = by.get(`${f}\u0001${z}`);
        if (!rec) return;
        const v = cKey ? rec.vals[cKey] : rec.vals[y];
        const t = (v - lo) / ((hi - lo) || 1);
        const col = new THREE.Color(rampFn(t));
        const h = FH * (0.45 + 0.5 * (dbIsNum(v) ? t : 0));
        const m = new THREE.Mesh(new THREE.BoxGeometry(cw * 0.86, h, cd * 0.86),
          new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: dark ? 0.25 + 0.55 * t : 0.08, metalness: 0.1, roughness: 0.45, transparent: true, opacity: 0.92 }));
        m.position.set(-W / 2 + cw * (zi % nc + 0.5), 0.35 + h / 2, -D / 2 + cd * (Math.floor(zi / nc) + 0.5));
        m.userData = { tip: `<b>${dbEsc(nm(floorKey))} ${dbEsc(f)}</b>${zoneKey ? ` · ${dbEsc(z)}` : ''}<br>${nm(y)}: ${fmt(rec.vals[y])}${cKey ? `<br>${nm(cKey)}: ${cfmt(rec.vals[cKey])}` : ''}`, floor: fi };
        grp.add(m); pickables.push(m); cells.push(m);
      });
      const glass = new THREE.Mesh(new THREE.BoxGeometry(W + 1.2, FH, D + 1.2), new THREE.MeshPhysicalMaterial({ color: new THREE.Color(accent), transparent: true, opacity: dark ? 0.06 : 0.05, roughness: 0.1, metalness: 0.1, depthWrite: false }));
      glass.position.y = FH / 2 + 0.2; grp.add(glass);
      const ge = edges(glass); ge.material = new THREE.LineBasicMaterial({ color: new THREE.Color(accent), transparent: true, opacity: dark ? 0.35 : 0.25 });
      scene.add(grp);
      const total = g.filter((x) => x.keys[0] === f).reduce((s, x) => s + (x.vals[y] || 0), 0);
      const lab = addLabel(el('span', {}, el('b', {}, String(f)), ` ${fmt(total)}`), new THREE.Vector3(-W / 2 - 3, 0, D / 2 + 1), 'tw-floor');
      lab.dataset.floor = fi;
      floorsInfo.push({ grp, baseY, cells, slab, glass, lab });
      if (anim) { grp.position.y = 0; animTargets.push({ obj: grp.position, prop: 'y', from: 0, to: baseY + (level === 'cinematic' ? fi * 1.2 : 0), delay: fi * 70 }); }
      else grp.position.y = baseY;
    });
    // roof beacon
    const top = floors.length * (FH + gap) + (anim && level === 'cinematic' ? floors.length * 1.2 : 0);
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(accent2) }));
    beacon.position.set(0, top + 1.5, 0); beacon.userData.blink = true; scene.add(beacon);
    radius = Math.max(70, top * 1.9 + 30);
    target = new THREE.Vector3(0, top * 0.45, 0);
    holder.parentElement.append(el('div', { class: 'mo-legend' }, el('span', {}, nm(cKey || y)), el('i', { style: { background: `linear-gradient(90deg, ${ramp.join(',')})` } }),
      el('span', {}, `${cKey ? cfmt(lo) : fmt(lo)} – ${cKey ? cfmt(hi) : fmt(hi)}`)));
  } else {
    const g = dbGroupMixed(cols, rows, [w.x], y, cKey, agg).sort((a, b) => (b.vals[y] || 0) - (a.vals[y] || 0)).slice(0, Number(w.top) || 36);
    if (!g.length) return say('No rows match the current filters.');
    const vMax = Math.max(1e-9, ...g.map((x) => x.vals[y] || 0));
    const cvals = g.map((x) => x.vals[cKey]).filter(dbIsNum);
    const cLo = Math.min(...cvals), cHi = Math.max(...cvals);
    const n = Math.ceil(Math.sqrt(g.length)), sp = 16;
    const win = dbWindowTexture(dark);
    // plaza + roads
    const plaza = new THREE.Mesh(new THREE.PlaneGeometry(n * sp + 12, n * sp + 12), new THREE.MeshStandardMaterial({ color: dark ? 0x0c1130 : 0xf1f5f9, roughness: 0.9, transparent: true, opacity: dark ? 0.9 : 1 }));
    plaza.rotation.x = -Math.PI / 2; plaza.position.y = 0.02; scene.add(plaza); edges(plaza);
    g.forEach((x, i) => {
      const t = cKey && dbIsNum(x.vals[cKey]) ? (x.vals[cKey] - cLo) / ((cHi - cLo) || 1) : 1 - i / Math.max(1, g.length - 1);
      const col = new THREE.Color(rampFn(t));
      const h = 4 + 46 * Math.max(0, x.vals[y] || 0) / vMax;
      const fw = 7 + (i % 3), fd = 7 + ((i + 1) % 2) * 2;
      const tex = win.clone(); tex.needsUpdate = true; tex.repeat.set(Math.max(1, Math.round(fw / 2.2)), Math.max(1, Math.round(h / 2.6)));
      const mat = new THREE.MeshStandardMaterial({ color: col, emissive: new THREE.Color(dark ? '#ffffff' : '#000000'), emissiveMap: dark ? tex : null, emissiveIntensity: dark ? 0.35 : 0.0,
        metalness: 0.25, roughness: 0.4 });
      const m = new THREE.Mesh(new THREE.BoxGeometry(fw, h, fd), mat);
      const cx = (i % n - (n - 1) / 2) * sp, cz = (Math.floor(i / n) - (n - 1) / 2) * sp;
      m.position.set(cx, h / 2, cz);
      m.userData = { tip: `<b>${dbEsc(x.keys[0])}</b><br>${nm(y)}: ${fmt(x.vals[y])}${cKey ? `<br>${nm(cKey)}: ${cfmt(x.vals[cKey])}` : ''}` };
      scene.add(m); edges(m); pickables.push(m);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(fw * 0.5, 0.8, fd * 0.5), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.6 }));
      roof.position.y = h / 2 + 0.4; m.add(roof);
      if (i < 3) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(accent2) })); b.position.y = h / 2 + 1.6; b.userData.blink = true; m.add(b); }
      if (i < 12) addLabel(el('span', {}, el('b', {}, String(x.keys[0])), ` ${fmt(x.vals[y])}`), new THREE.Vector3(cx, h + 2.5, cz));
      if (anim) { m.scale.y = 0.001; m.position.y = 0; animTargets.push({ obj: m.scale, prop: 'y', from: 0.001, to: 1, delay: i * 45, then: () => {} }, { obj: m.position, prop: 'y', from: 0, to: h / 2, delay: i * 45 }); }
    });
    radius = n * sp * 1.6 + 60; target = new THREE.Vector3(0, 8, 0);
    if (cKey) holder.parentElement.append(el('div', { class: 'mo-legend' }, el('span', {}, nm(cKey)), el('i', { style: { background: `linear-gradient(90deg, ${ramp.join(',')})` } }), el('span', {}, `${cfmt(cLo)} – ${cfmt(cHi)}`)));
  }

  /* camera, orbit, zoom, picking */
  let theta = 0.8, phi = 1.05, r = radius, autoUntil = 0;
  const place = () => { camera.position.set(target.x + r * Math.sin(phi) * Math.sin(theta), target.y + r * Math.cos(phi), target.z + r * Math.sin(phi) * Math.cos(theta)); camera.lookAt(target); };
  const size = () => { const b = holder.getBoundingClientRect(); const wdt = Math.max(50, b.width), hgt = Math.max(50, b.height); renderer.setSize(wdt, hgt, false); renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%'; camera.aspect = wdt / hgt; camera.updateProjectionMatrix(); };
  size(); place();
  let drag = null, dirty = true;
  const cv = renderer.domElement;
  cv.style.touchAction = 'none';
  cv.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, t: theta, p: phi, moved: false }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', (e) => {
    if (drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      theta = drag.t - dx * 0.008; phi = Math.max(0.25, Math.min(1.45, drag.p - dy * 0.006)); autoUntil = performance.now() + 4000; place(); dirty = true; tipEl.hidden = true; return;
    }
    hover(e);
  });
  cv.addEventListener('pointerup', (e) => { if (drag && !drag.moved) click(e); drag = null; });
  cv.addEventListener('pointerleave', () => { tipEl.hidden = true; setHot(null); });
  cv.addEventListener('dblclick', () => { theta = 0.8; phi = 1.05; r = radius; isolate(null); place(); dirty = true; });
  const zoom = (k) => { r = Math.max(radius * 0.3, Math.min(radius * 2.2, r * k)); place(); dirty = true; };
  cv.addEventListener('wheel', (e) => { if (!(e.ctrlKey || e.metaKey || document.activeElement === holder)) return; e.preventDefault(); zoom(e.deltaY > 0 ? 1.1 : 0.9); }, { passive: false });
  holder.tabIndex = 0;
  holder.append(el('div', { class: 'tw-ctl' },
    el('button', { type: 'button', title: 'Zoom in', 'aria-label': 'Zoom in', onClick: () => zoom(0.85) }, '+'),
    el('button', { type: 'button', title: 'Zoom out', 'aria-label': 'Zoom out', onClick: () => zoom(1.18) }, '−'),
    el('button', { type: 'button', title: 'Reset view', 'aria-label': 'Reset view', onClick: () => { theta = 0.8; phi = 1.05; r = radius; isolate(null); place(); dirty = true; } }, '⟲')));
  const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
  const pick = (e) => { const b = cv.getBoundingClientRect(); mouse.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1); ray.setFromCamera(mouse, camera); const h = ray.intersectObjects(pickables, false).find((x) => x.object.visible && x.object.material.opacity > 0.3); return h ? h.object : null; };
  let hot = null;
  const setHot = (m) => {
    if (hot === m) return;
    if (hot) { hot.material.emissiveIntensity = hot.userData.ei; hot.scale.x = hot.scale.z = 1; }
    hot = m;
    if (hot) { hot.userData.ei = hot.material.emissiveIntensity; hot.material.emissiveIntensity = Math.max(0.8, hot.userData.ei + 0.5); hot.scale.x = hot.scale.z = 1.06; }
    dirty = true;
  };
  function hover(e) {
    const m = pick(e);
    setHot(m);
    if (!m) { tipEl.hidden = true; return; }
    tipEl.innerHTML = m.userData.tip;                     // data values are escaped with dbEsc where the tip is built
    const b = holder.getBoundingClientRect();
    tipEl.style.left = `${Math.min(b.width - 180, e.clientX - b.left + 14)}px`; tipEl.style.top = `${Math.max(4, e.clientY - b.top - 10)}px`;
    tipEl.hidden = false;
  }
  let isolated = null;
  function isolate(fi) {
    if (!floorsInfo) return;
    isolated = fi === isolated ? null : fi;
    floorsInfo.forEach((F, i) => {
      const on = isolated == null || i === isolated;
      F.cells.forEach((c) => { c.material.opacity = on ? 0.92 : 0.07; });
      F.slab.material.opacity = on ? 0.95 : 0.15;
      F.lab.classList.toggle('dim', !on);
    });
    if (isolated != null) target.y = floorsInfo[isolated].grp.position.y + 1; else target.y = (floorsInfo.at(-1).grp.position.y + 4) * 0.45;
    place(); dirty = true;
  }
  function click(e) { const m = pick(e); if (m && m.userData.floor != null) isolate(m.userData.floor); else if (!m) isolate(null); }
  overlay.addEventListener('click', (e) => { const f = e.target.closest('.tw-floor'); if (f) isolate(Number(f.dataset.floor)); });

  /* loop */
  const start = performance.now();
  let raf = 0, visible = true, alive = true;
  const v3 = new THREE.Vector3();
  const io = typeof IntersectionObserver === 'function' ? new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) loop(); }) : null;
  if (io) io.observe(holder);
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => { size(); dirty = true; }) : null;
  if (ro) ro.observe(holder);
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  function frame(now) {
    let moving = false;
    for (const a of animTargets) {
      const t = Math.min(1, Math.max(0, (now - start - (a.delay || 0)) / 1100));
      a.obj[a.prop] = a.from + (a.to - a.from) * ease(t);
      if (t < 1) moving = true;
    }
    if (orbit && now > autoUntil && !drag) { theta += 0.0016; place(); moving = true; }
    scene.traverse((o) => { if (o.userData.blink) { o.visible = anim ? Math.sin(now / 380) > -0.3 : true; moving = moving || anim; } });
    if (moving || dirty) {
      renderer.render(scene, camera);
      const b = holder.getBoundingClientRect();
      for (const L of labels) {
        const wp = L.pos.clone();
        if (L.d.classList.contains('tw-floor') && floorsInfo) wp.y = floorsInfo[Number(L.d.dataset.floor)].grp.position.y + 1.6;
        v3.copy(wp).project(camera);
        const off = v3.z > 1 || Math.abs(v3.x) > 1.05 || Math.abs(v3.y) > 1.05;
        L.d.style.display = off ? 'none' : '';
        if (!off) L.d.style.transform = `translate(${((v3.x + 1) / 2) * b.width}px, ${((1 - v3.y) / 2) * b.height}px) translate(-50%, -50%)`;
      }
      dirty = false;
    }
    return moving;
  }
  function loop() {
    if (!alive || raf) return;
    const tick = (now) => { raf = 0; if (!alive || !visible || document.hidden) return; frame(now); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
  }
  frame(performance.now() + (anim ? 0 : 1e6));
  if (anim || orbit) loop(); else { const idle = () => { if (alive && dirty) frame(performance.now() + 1e6); if (alive) requestAnimationFrame(idle); }; requestAnimationFrame(idle); }
  const onVis = () => { if (!document.hidden) loop(); };
  document.addEventListener('visibilitychange', onVis);
  ctx.register(w.id, {
    destroy: () => { alive = false; cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', onVis); if (io) io.disconnect(); if (ro) ro.disconnect();
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach((m) => { if (m.map) m.map.dispose(); if (m.emissiveMap) m.emissiveMap.dispose(); m.dispose(); }); });
      renderer.dispose(); try { renderer.forceContextLoss(); } catch { /* old three */ } },
    resize: () => { size(); dirty = true; },
  });
}
/* lit-window pattern for campus buildings */
function dbWindowTexture(dark) {
  const c = document.createElement('canvas'); c.width = 64; c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = dark ? '#000000' : '#ffffff'; g.fillRect(0, 0, 64, 64);
  for (let yy = 0; yy < 4; yy++) for (let xx = 0; xx < 4; xx++) {
    const on = Math.random() > 0.4;
    g.fillStyle = dark ? `rgba(255,255,255,${on ? 0.55 : 0.1})` : `rgba(255,255,255,${on ? 0.75 : 0.45})`;
    g.fillRect(xx * 16 + 4, yy * 16 + 4, 8, 7);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
/* ---------- widget editor ---------- */
function dbGeoFields(w, cols, kinds, changed, field, selectOf) {
  const all = cols.map((c) => [c, c]);
  const nums = cols.filter((_, i) => kinds[i] === 'num').map((c) => [c, c]);
  const cats = cols.filter((_, i) => kinds[i] === 'cat' || kinds[i] === 'text' || kinds[i] === 'id').map((c) => [c, c]);
  const dates = cols.filter((_, i) => kinds[i] === 'date').map((c) => [c, c]);
  const pick = (k, label, opts, none = '— none —', hint) => field(label, selectOf(opts.length ? opts : all, w[k], (v) => { w[k] = v || null; changed(); }, none), hint);
  const sw = (k, label, dflt) => el('label', { class: 'switch' }, el('input', { type: 'checkbox', checked: dflt ? w[k] !== false : !!w[k], onChange: (e) => { w[k] = e.target.checked; changed(); } }), label);
  const out = [el('h4', { class: 'mo-ed-h' }, w.type === 'twin3d' ? 'Twin settings' : 'Map settings')];
  if (w.type === 'twin3d') {
    out.push(field('Show as', selectOf([['building', 'A building — floors × zones'], ['campus', 'A campus — one building per item']], w.twin || 'building', (v) => { w.twin = v; changed(); })));
    if ((w.twin || 'building') === 'building') {
      out.push(el('p', { class: 'muted small', style: { margin: 0 } }, 'X axis = floor. Each zone is a block on its floor, coloured by the value (or the colour measure). Click a floor to isolate it.'),
        pick('series', 'Zones (rooms / areas on a floor)', cats), pick('color', 'Colour by (optional, e.g. occupancy %)', nums), sw('topFirst', 'Floor list is top floor first'));
    } else {
      out.push(el('p', { class: 'muted small', style: { margin: 0 } }, 'X axis = building / site / outlet. Height = value.'), pick('color', 'Colour by (optional second measure)', nums));
    }
    out.push(sw('autoRotate', 'Slowly orbit (stops while you drag)', true));
    return out;
  }
  const view = w.type === 'map' ? (w.view || 'flat') : ({ map2d: 'flat', map3d: '3d', globe3d: 'globe' })[w.type];
  const mapSel = selectOf([...DB_BUILTIN_MAPS], w.map || 'world', (v) => { w.map = v; changed(); });
  dbCustomMaps().then((list) => { for (const m of list) mapSel.append(el('option', { value: m.name, selected: w.map === m.name }, `${m.label} (uploaded)`)); });
  const isAdmin = typeof CURRENT_USER === 'object' && CURRENT_USER && ['admin', 'super_admin'].includes(CURRENT_USER.role);
  out.push(field(view === 'globe' ? 'Areas drawn on the globe' : 'Map', mapSel, view === 'globe' ? 'World colours countries; India / USA / uploaded maps add their areas on top.' : null),
    isAdmin ? btn('Manage maps…', () => dbManageMaps(), { cls: 'sm' }) : null,
    field('X axis holds', selectOf([['auto', 'Detect automatically'], ['region', 'Area names on the map (country / state…)'], ['place', 'City or town names'], ['latlon', 'Use latitude + longitude columns']], w.geo || 'auto', (v) => { w.geo = v; changed(); }),
      'Areas and cities match names, ISO codes and common old names (Bombay, Orissa, Gurgaon…).'));
  if (w.geo === 'latlon') out.push(el('div', { class: 'grid2' }, pick('lat', 'Latitude', nums), pick('lon', 'Longitude', nums)));
  if (w.geo === 'place' || w.geo === 'auto' || !w.geo) out.push(pick('hint', 'State or country column (finds the right city when names repeat)', cats));
  out.push(pick('target', 'Flows to (destination column, optional)', cats, '— none (no arcs) —'));
  if (w.target) out.push(field('Destination holds', selectOf([['auto', 'Same kind as X axis'], ['region', 'Area names'], ['place', 'City or town names']], w.geoTarget || 'auto', (v) => { w.geoTarget = v; changed(); })));
  out.push(pick('color', 'Colour by (optional second measure)', nums));
  if (w.type === 'map2d') out.push(pick('time', 'Play over (time column, optional)', dates.length ? dates : all), field('Time step', selectOf([['day', 'Day'], ['month', 'Month'], ['year', 'Year']], w.grain || 'month', (v) => { w.grain = v; changed(); })));
  if (w.type === 'map' && view === 'flat') {
    out.push(el('h4', { class: 'mo-ed-h' }, 'Motion'), field('Play over time', selectOf(dates, w.play, (v) => { w.play = v || null; changed(); }, '— off —'), dates.length ? 'Places and areas change step by step, with a play button.' : 'Needs a date column in the dataset.'),
      w.play ? field('Step', selectOf([['day', 'Day'], ['week', 'Week'], ['month', 'Month'], ['quarter', 'Quarter'], ['year', 'Year']], w.playGrain || 'month', (v) => { w.playGrain = v; changed(); })) : null);
  }
  if (view === 'globe') out.push(field('Earth style', selectOf([['dots', 'Dot matrix (holographic)'], ['solid', 'Solid land']], w.globeStyle || 'dots', (v) => { w.globeStyle = v; changed(); })));
  if (view !== 'flat') out.push(sw('autoRotate', 'Slowly orbit (stops while you drag)', true));
  return out;
}

/* Admin: upload / remove custom GeoJSON maps */
async function dbManageMaps() {
  await openDialog((close) => {
    const list = el('div', { class: 'mo-maps' });
    const draw = async () => {
      DB_GEO.custom = null;
      const maps = await dbCustomMaps();
      setKids(list, maps.length ? maps.map((m) => el('div', { class: 'row' }, el('b', { class: 'grow' }, m.label), el('span', { class: 'muted small' }, `${m.name} · ${m.features} areas`),
        btn('Remove', async () => { if (!(await confirmDialog(`Remove map “${m.label}”?`, 'Widgets that use it will show a message until you pick another map.', 'Remove'))) return; await api(`/api/maps/${m.name}`, { method: 'DELETE' }); delete DB_GEO.maps[m.name]; draw(); }, { cls: 'sm' })))
        : el('p', { class: 'muted' }, 'No uploaded maps yet.'));
    };
    const file = el('input', { type: 'file', accept: '.json,.geojson,application/geo+json' });
    const name = el('input', { class: 'field', placeholder: 'e.g. pune-wards' });
    const label = el('input', { class: 'field', placeholder: 'e.g. Pune — municipal wards' });
    const prop = el('select', { class: 'field' });
    let text = null;
    file.addEventListener('change', async () => {
      const f = file.files[0]; if (!f) return;
      text = await f.text();
      try {
        const gj = JSON.parse(text);
        const keys = Object.keys(((gj.features || [])[0] || {}).properties || {});
        setKids(prop, keys.map((k) => el('option', { value: k, selected: /^name$/i.test(k) }, `${k} — e.g. “${String(gj.features[0].properties[k]).slice(0, 30)}”`)));
        if (!name.value) name.value = f.name.replace(/\.(geo)?json$/i, '').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').slice(0, 40);
        if (!label.value) label.value = f.name.replace(/\.(geo)?json$/i, '');
      } catch (e) { toast(`That file is not valid JSON: ${e.message}`, 'error'); text = null; }
    });
    const add = btn('Add map', async () => {
      if (!text) return toast('Choose a GeoJSON file first', 'error');
      try {
        const r = await api('/api/maps', { method: 'POST', body: { name: name.value, label: label.value, geojson: text, name_property: prop.value } });
        toast(`Added “${label.value || r.name}” with ${r.features} areas`);
        file.value = ''; text = null; name.value = ''; label.value = ''; setKids(prop, []);
        draw();
      } catch (e) { toast(e.message, 'error'); }
    }, { cls: 'primary' });
    draw();
    return el('div', { class: 'dlg' }, el('h2', {}, 'Maps'),
      el('p', { class: 'muted', style: { margin: 0 } }, 'Add your own areas — districts, city wards, delivery zones, a floor plan. Upload a GeoJSON file with polygons (convert Shapefiles or KML at mapshaper.org). Built-in maps: World, India states & UTs, US states.'),
      list,
      el('h3', {}, 'Add a map'),
      el('label', { class: 'lbl' }, 'GeoJSON file', file),
      el('div', { class: 'grid2' }, el('label', { class: 'lbl' }, 'Short name', name), el('label', { class: 'lbl' }, 'Label', label)),
      el('label', { class: 'lbl' }, 'Which property is the area name', prop),
      el('div', { class: 'actions' }, btn('Close', () => close(null)), add));
  }, { wide: true });
}
