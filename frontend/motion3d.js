/* DataBridge motion & 3D dashboard widgets (ECharts + ECharts-GL, loaded only when a dashboard uses them).

   2D motion   race      Bar race: categories re-rank as the time column plays
               wave      Glowing animated trend with a live pulse on the latest point
               radial    Animated radial rings, one per category
               flow      Flow (Sankey) between two columns
   3D          bar3d     3D bars: category × series × value, slowly orbiting
               city3d    3D city / digital twin: one lit tower per item, height = value, colour = a second measure
               terrain3d 3D landscape: value surface over two dimensions (e.g. weekday × hour)
   5D          bubble5d  X, Y, Z position + colour + size, played over time (the 5 dimensions, with time as motion)

   Loaded before dashboards.js. dashboards.js calls dbMotionRender(ctx, w, cols, rows, body) for these types,
   dbMotionFields(...) in the widget editor, and dbCountUp(el, value, format) for KPI cards when motion is on. */
'use strict';

const DB_MOTION_TYPES = {
  race: 'Bar race (motion)', wave: 'Animated trend (motion)', radial: 'Radial rings (motion)', flow: 'Flow / Sankey (motion)',
  bar3d: '3D bars', city3d: '3D city / digital twin', terrain3d: '3D landscape', bubble5d: '5D bubbles (X·Y·Z·colour·size + time)',
};
const DB_MOTION_LEVELS = { off: 'Off — static', subtle: 'Subtle — numbers count up, charts animate in', cinematic: 'Cinematic — plus card entrance, live pulses, orbiting 3D' };

let DB_EC_PROMISE = null;
let DB_ECGL_PROMISE = null;
function dbLoadEcharts(gl) {
  const add = (src) => new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = () => rej(new Error(`Could not load ${src}`));
    document.head.append(s);
  });
  DB_EC_PROMISE = DB_EC_PROMISE || (window.echarts ? Promise.resolve() : add('/static/vendor/echarts/echarts.min.js'));
  if (!gl) return DB_EC_PROMISE;
  DB_ECGL_PROMISE = DB_ECGL_PROMISE || DB_EC_PROMISE.then(() => add('/static/vendor/echarts/echarts-gl.min.js'));
  return DB_ECGL_PROMISE;
}

const dbEsc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const dbReducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const dbMotionLevel = (D) => (dbReducedMotion() ? 'off' : (D && D.motion) || 'subtle');

/* Count a KPI number up from 0 (or from its previous value) */
function dbCountUp(node, value, format, ms = 900) {
  if (!dbIsNum(value) || dbReducedMotion()) return;
  const start = performance.now();
  const from = Number(node.dataset.dbFrom || 0);
  node.dataset.dbFrom = String(value);
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const step = (now) => {
    const t = Math.min(1, (now - start) / ms);
    node.textContent = format(from + (value - from) * ease(t));
    if (t < 1 && node.isConnected) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------- data helpers ---------- */
function dbReduce(vals, agg) {
  const nums = vals.filter(dbIsNum);
  switch (agg) {
    case 'count': return vals.filter((v) => v != null).length;
    case 'countd': return new Set(vals.filter((v) => v != null)).size;
    case 'avg': return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
    case 'min': return nums.length ? Math.min(...nums) : null;
    case 'max': return nums.length ? Math.max(...nums) : null;
    default: return nums.reduce((a, b) => a + b, 0);
  }
}
/* group rows by key columns; returns [{keys:[...], vals:{measure: value}}] */
function dbGroup(cols, rows, keys, measures, agg) {
  const ki = keys.map((k) => cols.indexOf(k));
  const mi = measures.map((m) => cols.indexOf(m));
  const map = new Map();
  for (const r of rows) {
    const kv = ki.map((i) => (i < 0 ? '' : r[i] == null ? '(blank)' : String(r[i])));
    const id = kv.join('\u0001');
    let g = map.get(id);
    if (!g) { g = { keys: kv, raw: measures.map(() => []) }; map.set(id, g); }
    mi.forEach((i, j) => g.raw[j].push(i < 0 ? 1 : r[i]));
  }
  return [...map.values()].map((g) => ({ keys: g.keys, vals: Object.fromEntries(measures.map((m, j) => [m, dbReduce(g.raw[j], m === '__count' ? 'count' : agg)])) }));
}
const dbTimeKey = (v, grain) => {
  const s = String(v ?? '');
  if (!/^\d{4}-\d{2}/.test(s)) return s;
  if (grain === 'year') return s.slice(0, 4);
  if (grain === 'month') return s.slice(0, 7);
  return s.slice(0, 10);
};
const DB_ORDERS = [['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']];
function dbSortKeys(arr) {
  const u = [...new Set(arr)];
  for (const order of DB_ORDERS) {                         // weekdays and month names in calendar order
    const pos = (v) => order.indexOf(String(v).slice(0, 3).toLowerCase());
    if (u.length && u.every((v) => pos(v) >= 0)) return u.sort((a, b) => pos(a) - pos(b));
  }
  return u.sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
}

/* ---------- render ---------- */
async function dbMotionRender(ctx, w, cols, rows, body) {
  if (typeof DB_GEO_TYPES === 'object' && DB_GEO_TYPES[w.type]) return dbGeoRender(ctx, w, cols, rows, body);   // maps, globe, digital twin (geo3d.js)
  const is3d = ['bar3d', 'city3d', 'terrain3d', 'bubble5d'].includes(w.type);
  const holder = el('div', { class: `dash-canvas mo-holder${is3d ? ' mo-3d' : ''}`, role: 'img', 'aria-label': `${DB_MOTION_TYPES[w.type]}: ${w.title || ''}` });
  body.append(holder);
  const level = ctx.printing ? 'off' : dbMotionLevel(ctx.D);
  try { await dbLoadEcharts(is3d); } catch (e) { holder.replaceWith(el('p', { class: 'muted dash-msg' }, e.message)); return; }
  if (!holder.isConnected) return;
  const T = ctx.theme();
  const P = ctx.pal();
  const text = ctx.themeVar('--d-text', T.v.text || '#1b2333');
  const muted = ctx.themeVar('--d-muted', T.v.muted || '#667085');
  const grid = ctx.themeVar('--d-grid', T.v.grid || '#e5e7eb');
  const dark = !!T.dark;
  const fmt = (v) => dbFmt(v, w.format || 'compact', ctx.cur());
  const inst = echarts.init(holder, null, { renderer: is3d ? 'canvas' : 'canvas', devicePixelRatio: ctx.printing ? 2 : undefined });
  const timers = [];
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => inst.resize()) : null;
  if (ro) ro.observe(holder);
  ctx.register(w.id, { destroy: () => { timers.forEach((t) => clearInterval(t)); if (ro) ro.disconnect(); if (is3d && typeof dbDisposeGl === 'function') dbDisposeGl(inst, holder); else inst.dispose(); }, resize: () => inst.resize() });
  const anim = level !== 'off';
  const orbit = level === 'cinematic' || (level === 'subtle' && w.autoRotate !== false);
  const base = { backgroundColor: 'transparent', textStyle: { color: text, fontFamily: ctx.font }, animation: anim, animationDuration: anim ? 1100 : 0,
    animationEasing: 'cubicOut', color: P, tooltip: { confine: true, backgroundColor: dark ? 'rgba(15,18,40,.92)' : 'rgba(255,255,255,.96)', borderColor: grid, textStyle: { color: text } } };
  const y = (w.y || [])[0];
  const agg = w.agg || 'sum';
  const msg = (t) => { inst.dispose(); holder.replaceWith(el('p', { class: 'muted dash-msg' }, t)); };
  const gl3d = (extra = {}) => ({
    boxWidth: 110, boxDepth: 80, boxHeight: 60,
    viewControl: { autoRotate: orbit, autoRotateSpeed: 6, autoRotateAfterStill: 4, distance: 205, alpha: 26, beta: 38, damping: 0.85, animation: anim },
    light: { main: { intensity: 1.15, shadow: true, shadowQuality: 'medium', alpha: 40, beta: 30 }, ambient: { intensity: dark ? 0.35 : 0.45 } },
    environment: 'none', postEffect: { enable: false },
    temporalSuperSampling: { enable: true },
    axisLine: { lineStyle: { color: grid } }, axisPointer: { lineStyle: { color: P[0] } }, splitLine: { lineStyle: { color: grid } },
    axisLabel: { textStyle: { color: muted } }, axisTick: { show: false }, ...extra });

  if (w.type === 'race') {
    if (!w.x || !y) return msg('Pick the category (X axis) and the value.');
    const tc = w.time || ctx.timeColumn;
    if (!tc || !cols.includes(tc)) return msg('Pick the time column to play over (Motion settings).');
    const grain = w.grain || 'month';
    const g = dbGroup(cols, rows.map((r) => r.map((v, i) => (cols[i] === tc ? dbTimeKey(v, grain) : v))), [tc, w.x], [y], agg);
    const frames = dbSortKeys(g.map((x) => x.keys[0]));
    const cats = dbSortKeys(g.map((x) => x.keys[1]));
    const cumulative = w.cumulative !== false;
    const running = new Map(cats.map((c) => [c, 0]));
    const byFrame = frames.map((f) => {
      const cur = new Map(cats.map((c) => [c, cumulative ? running.get(c) : 0]));
      for (const x of g) if (x.keys[0] === f) cur.set(x.keys[1], (cumulative ? running.get(x.keys[1]) : 0) + (x.vals[y] || 0));
      if (cumulative) cur.forEach((v, k) => running.set(k, v));
      return cats.map((c) => cur.get(c));
    });
    const top = Number(w.top) || 10;
    const colorOf = Object.fromEntries(cats.map((c, i) => [c, P[i % P.length]]));
    const label = el('div', { class: 'mo-frame' });
    holder.parentElement.append(label);
    let i = 0;
    const show = () => {
      label.textContent = frames[i] || '';
      inst.setOption({
        ...base, animationDuration: 0, animationDurationUpdate: anim ? Number(w.speed) || 1100 : 0, animationEasing: 'linear', animationEasingUpdate: 'linear',
        grid: { left: 8, right: 70, top: 10, bottom: 34, containLabel: true },
        xAxis: { type: 'value', max: 'dataMax', axisLabel: { color: muted, formatter: fmt, showMaxLabel: false }, splitLine: { lineStyle: { color: grid } } },
        yAxis: { type: 'category', data: cats, inverse: true, max: Math.min(top, cats.length) - 1, animationDuration: 300, animationDurationUpdate: 300,
          axisLabel: { color: text, fontWeight: 600 }, axisLine: { show: false }, axisTick: { show: false } },
        series: [{ type: 'bar', realtimeSort: true, data: byFrame[i].map((v, k) => ({ value: v, itemStyle: { color: colorOf[cats[k]], borderRadius: [0, 6, 6, 0] } })),
          label: { show: true, position: 'right', valueAnimation: true, color: text, formatter: (p) => fmt(p.value) }, barMaxWidth: 28 }],
        tooltip: { ...base.tooltip, valueFormatter: fmt },
      });
    };
    show();
    if (anim && frames.length > 1) {
      timers.push(setInterval(() => { i = (i + 1) % frames.length; if (i === 0 && w.loop === false) return; show(); }, Number(w.speed) || 1100));
    } else { i = frames.length - 1; show(); }
    return;
  }

  if (w.type === 'wave') {
    const ys = (w.y || []).filter((c) => cols.includes(c));
    if (!w.x || !ys.length) return msg('Pick the X axis and at least one value.');
    const g = dbGroup(cols, rows.map((r) => r.map((v, i) => (cols[i] === w.x ? dbTimeKey(v, w.grain || 'day') : v))), [w.x], ys, agg);
    const labels = dbSortKeys(g.map((x) => x.keys[0]));
    const by = new Map(g.map((x) => [x.keys[0], x.vals]));
    const series = ys.flatMap((c, k) => {
      const col = P[k % P.length];
      const data = labels.map((l) => (by.get(l) || {})[c] ?? null);
      return [{ name: c.replace(/_/g, ' '), type: 'line', smooth: 0.35, symbol: 'none', data, lineStyle: { width: 3, color: col, shadowBlur: dark ? 14 : 6, shadowColor: col },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: `${col}66` }, { offset: 1, color: `${col}00` }]) },
        animationDuration: anim ? 1800 : 0 },
      ...(level === 'cinematic' ? [{ type: 'effectScatter', data: [[labels[labels.length - 1], data[data.length - 1]]], symbolSize: 9, rippleEffect: { scale: 4, brushType: 'stroke' },
        itemStyle: { color: col }, tooltip: { show: false }, z: 5 }] : [])];
    });
    inst.setOption({ ...base, legend: { show: ys.length > 1, bottom: 0, textStyle: { color: muted } },
      grid: { left: 8, right: 16, top: 16, bottom: ys.length > 1 ? 30 : 8, containLabel: true },
      xAxis: { type: 'category', data: labels, boundaryGap: false, axisLabel: { color: muted }, axisLine: { lineStyle: { color: grid } } },
      yAxis: { type: 'value', axisLabel: { color: muted, formatter: fmt }, splitLine: { lineStyle: { color: grid, type: 'dashed' } } },
      tooltip: { ...base.tooltip, trigger: 'axis', valueFormatter: fmt }, series });
    return;
  }

  if (w.type === 'radial') {
    if (!w.x || !y) return msg('Pick the category and the value.');
    const g = dbGroup(cols, rows, [w.x], [y], agg).sort((a, b) => (b.vals[y] || 0) - (a.vals[y] || 0)).slice(0, Number(w.top) || 6);
    const max = Math.max(1, ...g.map((x) => x.vals[y] || 0)) * 1.15;
    inst.setOption({ ...base,
      polar: { radius: ['18%', '86%'] }, angleAxis: { max, startAngle: 90, show: false },
      radiusAxis: { type: 'category', data: g.map((x) => x.keys[0]), axisLabel: { color: text, fontSize: 11, interval: 0, align: 'right', margin: 10 }, axisLine: { show: false }, axisTick: { show: false }, z: 10 },
      tooltip: { ...base.tooltip, valueFormatter: fmt },
      series: [{ type: 'bar', coordinateSystem: 'polar', roundCap: true, barWidth: '55%', showBackground: true, backgroundStyle: { color: dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.05)' },
        data: g.map((x, i) => ({ value: x.vals[y], itemStyle: { color: P[i % P.length], shadowBlur: dark ? 12 : 0, shadowColor: P[i % P.length] } })),
        label: { show: true, position: 'end', color: muted, formatter: (p) => fmt(p.value), fontSize: 11 }, animationDuration: anim ? 1600 : 0 }] });
    return;
  }

  if (w.type === 'flow') {
    if (!w.x || !w.target || !y) return msg('Pick the source column (X axis), the target column and the value.');
    const g = dbGroup(cols, rows, [w.x, w.target], [y], agg).filter((x) => x.keys[0] !== x.keys[1] && (x.vals[y] || 0) > 0);
    const top = g.sort((a, b) => b.vals[y] - a.vals[y]).slice(0, 60);
    const names = [...new Set(top.flatMap((x) => [`${x.keys[0]}`, `→ ${x.keys[1]}`]))];
    inst.setOption({ ...base, tooltip: { ...base.tooltip, trigger: 'item', valueFormatter: fmt },
      series: [{ type: 'sankey', left: 8, right: 90, top: 10, bottom: 10, nodeGap: 10, emphasis: { focus: 'adjacency' }, draggable: false,
        data: names.map((n, i) => ({ name: n, itemStyle: { color: P[i % P.length] } })), label: { color: text, fontSize: 11 },
        links: top.map((x) => ({ source: `${x.keys[0]}`, target: `→ ${x.keys[1]}`, value: x.vals[y] })),
        lineStyle: { color: 'gradient', opacity: dark ? 0.45 : 0.35, curveness: 0.5 }, animationDuration: anim ? 1400 : 0 }] });
    return;
  }

  if (w.type === 'bar3d') {
    if (!w.x || !y) return msg('Pick the category (X axis) and the value.');
    const keys = w.series ? [w.x, w.series] : [w.x];
    const g = dbGroup(cols, rows, keys, [y], agg);
    const xs = dbSortKeys(g.map((x) => x.keys[0])).slice(0, 40);
    const zs = w.series ? dbSortKeys(g.map((x) => x.keys[1])).slice(0, 20) : [w.title || y];
    const data = g.filter((x) => xs.includes(x.keys[0]) && (!w.series || zs.includes(x.keys[1])))
      .map((x) => ({ value: [xs.indexOf(x.keys[0]), w.series ? zs.indexOf(x.keys[1]) : 0, x.vals[y] || 0] }));
    const max = Math.max(1, ...data.map((d) => d.value[2]));
    inst.setOption({ ...base, tooltip: { ...base.tooltip, formatter: (p) => `${dbEsc(xs[p.value[0]])}${w.series ? ` · ${dbEsc(zs[p.value[1]])}` : ''}<br><b>${fmt(p.value[2])}</b>` },
      visualMap: { show: false, min: 0, max, inRange: { color: [P[1] || '#38bdf8', P[0], P[2] || '#f59e0b'] } },
      xAxis3D: { type: 'category', data: xs, name: '', axisLabel: { textStyle: { color: muted }, interval: xs.length > 12 ? 'auto' : 0 } },
      yAxis3D: { type: 'category', data: zs, name: '', axisLabel: { textStyle: { color: muted } } },
      zAxis3D: { type: 'value', name: '', axisLabel: { textStyle: { color: muted }, formatter: fmt } },
      grid3D: gl3d({ boxDepth: w.series ? 80 : 18 }),
      series: [{ type: 'bar3D', data, shading: 'realistic', realisticMaterial: { roughness: 0.4, metalness: dark ? 0.3 : 0.1 }, bevelSize: 0.3, bevelSmoothness: 4,
        barSize: w.series ? undefined : 9, emphasis: { label: { show: true, formatter: (p) => fmt(p.value[2]), textStyle: { color: text, fontSize: 13 } } },
        animationDurationUpdate: 800, animationEasingUpdate: 'cubicOut' }] });
    return;
  }

  if (w.type === 'city3d') {
    if (!w.x || !y) return msg('Pick what each tower is (X axis) and its height (value).');
    const ms = [y, ...(w.color && w.color !== y && cols.includes(w.color) ? [w.color] : [])];
    const g = dbGroup(cols, rows, [w.x], ms, agg).sort((a, b) => (b.vals[y] || 0) - (a.vals[y] || 0)).slice(0, Number(w.top) || 64);
    if (!g.length) return msg('No rows match the current filters.');
    const n = Math.ceil(Math.sqrt(g.length));
    const cv = ms[1] || y;
    const cvals = g.map((x) => x.vals[cv] || 0);
    const cmin = Math.min(...cvals), cmax = Math.max(...cvals);
    const ramp = [P[1] || '#22d3ee', P[0], '#a855f7', '#f43f5e'];
    const mix = (t) => {                                   // colour along the ramp for 0..1
      const f = Math.max(0, Math.min(0.9999, t)) * (ramp.length - 1), k = Math.floor(f), r = f - k;
      const h = (c) => [1, 3, 5].map((o) => parseInt(c.slice(o, o + 2), 16));
      const [a1, b1] = [h(ramp[k]), h(ramp[k + 1])];
      return `rgb(${a1.map((v, z) => Math.round(v + (b1[z] - v) * r)).join(',')})`;
    };
    const data = g.map((x, i) => ({ name: x.keys[0], value: [i % n, Math.floor(i / n), x.vals[y] || 0], c: x.vals[cv] || 0,
      itemStyle: { color: mix(ms[1] ? ((x.vals[cv] || 0) - cmin) / ((cmax - cmin) || 1) : 1 - i / Math.max(1, g.length - 1)) } }));
    const hidden = { type: 'value', name: '', axisLine: { show: true, lineStyle: { opacity: 0 } }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: true, formatter: () => '' }, axisPointer: { show: false } };
    inst.setOption({ ...base,
      tooltip: { ...base.tooltip, formatter: (p) => `<b>${dbEsc(p.name)}</b><br>${y.replace(/_/g, ' ')}: ${fmt(p.value[2])}${ms[1] ? `<br>${cv.replace(/_/g, ' ')}: ${dbFmt(p.data.c, String(cv).includes('pct') || (cmax <= 1 && cmin >= 0) ? 'percent' : 'compact', ctx.cur())}` : ''}` },
      xAxis3D: { ...hidden, min: -0.8, max: n - 0.2 }, yAxis3D: { ...hidden, min: -0.8, max: n - 0.2 }, zAxis3D: { ...hidden },
      grid3D: gl3d({ boxWidth: 100, boxDepth: 100, boxHeight: 55, axisLine: { show: true, lineStyle: { opacity: 0 } }, axisPointer: { show: false }, splitLine: { show: false }, splitArea: { show: false },
        viewControl: { autoRotate: orbit, autoRotateSpeed: 5, distance: 165, alpha: 34, beta: 40, damping: 0.85, animation: anim } }),
      series: [{ type: 'bar3D', data, shading: 'realistic', barSize: 70 / n,
        realisticMaterial: { roughness: 0.3, metalness: dark ? 0.35 : 0.1 }, bevelSize: 0.25, bevelSmoothness: 3,
        label: { show: g.length <= 12, distance: 2, formatter: (p) => p.name, textStyle: { color: text, fontSize: 11, backgroundColor: 'transparent' } },
        emphasis: { label: { show: true, formatter: (p) => `${p.name}\n${fmt(p.value[2])}`, textStyle: { color: text, fontSize: 13 } }, itemStyle: { color: '#ffffff' } } }] });
    if (ms[1]) {                                           // small colour legend
      holder.parentElement.append(el('div', { class: 'mo-legend' }, el('span', {}, cv.replace(/_/g, ' ')),
        el('i', { style: { background: `linear-gradient(90deg, ${ramp.join(',')})` } }),
        el('span', {}, `${dbFmt(cmin, cmax <= 1 ? 'percent' : 'compact', ctx.cur())} – ${dbFmt(cmax, cmax <= 1 ? 'percent' : 'compact', ctx.cur())}`)));
    }
    if (level === 'cinematic' && data.length > 1) {          // a pulse travels across the city: highlight each tower in turn
      let k = 0;
      timers.push(setInterval(() => { inst.dispatchAction({ type: 'downplay', seriesIndex: 0 }); inst.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex: k }); k = (k + 1) % Math.min(8, data.length); }, 1800));
    }
    return;
  }

  if (w.type === 'terrain3d') {
    if (!w.x || !w.series || !y) return msg('Pick the X axis, the second dimension (series) and the value — e.g. weekday × hour → sales.');
    const g = dbGroup(cols, rows, [w.x, w.series], [y], agg);
    const xs = dbSortKeys(g.map((x) => x.keys[0])).slice(0, 60);
    const zs = dbSortKeys(g.map((x) => x.keys[1])).slice(0, 60);
    if (xs.length < 2 || zs.length < 2) return msg('A landscape needs at least 2 values on each dimension.');
    const map = new Map(g.map((x) => [`${x.keys[0]}\u0001${x.keys[1]}`, x.vals[y] || 0]));
    const data = [];
    zs.forEach((b, j) => xs.forEach((a, i) => data.push([i, j, map.get(`${a}\u0001${b}`) || 0])));
    const max = Math.max(1, ...data.map((d) => d[2]));
    inst.setOption({ ...base, tooltip: { ...base.tooltip, formatter: (p) => `${dbEsc(xs[p.value[0]])} · ${dbEsc(zs[p.value[1]])}<br><b>${fmt(p.value[2])}</b>` },
      visualMap: { show: false, min: 0, max, inRange: { color: ['#1e3a8a', P[1] || '#22d3ee', P[0], '#facc15', '#f43f5e'] } },
      xAxis3D: { type: 'value', min: 0, max: xs.length - 1, interval: Math.max(1, Math.ceil(xs.length / 8)), name: w.x, nameTextStyle: { color: muted }, axisLabel: { textStyle: { color: muted }, formatter: (v) => xs[v] ?? '' } },
      yAxis3D: { type: 'value', min: 0, max: zs.length - 1, interval: Math.max(1, Math.ceil(zs.length / 8)), name: w.series, nameTextStyle: { color: muted }, axisLabel: { textStyle: { color: muted }, formatter: (v) => zs[v] ?? '' } },
      zAxis3D: { type: 'value', name: '', axisLabel: { textStyle: { color: muted }, formatter: fmt } },
      grid3D: gl3d({ boxDepth: 100, boxWidth: 100 }),
      series: [{ type: 'surface', data, shading: 'realistic', realisticMaterial: { roughness: 0.5 }, wireframe: { show: true, lineStyle: { color: dark ? 'rgba(255,255,255,.25)' : 'rgba(0,0,0,.15)', width: 1 } } }] });
    return;
  }

  if (w.type === 'bubble5d') {
    const X = w.x, Y = y, Z = w.z, C = w.color, Sz = w.size, L = w.label, tc = w.time;
    if (![X, Y, Z].every((c) => c && cols.includes(c))) return msg('Pick three numbers for X, Y and Z (Motion settings), then optional colour, size and time.');
    const isNumCol = (c) => { const i = cols.indexOf(c); const v = rows.slice(0, 200).map((r) => r[i]).filter((x) => x != null); return v.length > 0 && v.every(dbIsNum); };
    const hasC = !!(C && cols.includes(C));
    const catColor = hasC && !isNumCol(C);
    const measures = [X, Y, Z, ...(hasC && !catColor ? [C] : []), ...(Sz && cols.includes(Sz) ? [Sz] : [])].filter((v, i, a) => a.indexOf(v) === i);
    const keys = [...(tc && cols.includes(tc) ? [tc] : []), ...(L && cols.includes(L) ? [L] : [])];
    const grain = w.grain || 'month';
    const ci = hasC ? cols.indexOf(C) : -1;
    let pts;
    if (L && cols.includes(L)) {                          // one bubble per label (per time step), measures aggregated
      const src = rows.map((r) => r.map((v, i) => (cols[i] === tc ? dbTimeKey(v, grain) : v)));
      pts = dbGroup(cols, src, keys, measures, agg).map((x) => ({ t: tc ? x.keys[0] : '', name: x.keys[keys.length - 1], v: x.vals }));
      if (catColor) {
        const li = cols.indexOf(L);
        const look = new Map(rows.map((r) => [String(r[li]), r[ci]]));
        pts.forEach((p) => { p.cat = String(look.get(p.name) ?? ''); });
      }
    } else {                                              // raw rows (first 4,000)
      const ix = Object.fromEntries([...measures, ...keys].map((c) => [c, cols.indexOf(c)]));
      pts = rows.slice(0, 4000).map((r, i) => ({ t: tc ? dbTimeKey(r[ix[tc]], grain) : '', name: `#${i + 1}`, cat: catColor ? String(r[ci] ?? '') : undefined,
        v: Object.fromEntries(measures.map((m) => [m, r[ix[m]]])) }));
    }
    const frames = tc ? dbSortKeys(pts.map((p) => p.t)) : [''];
    const sizes = Sz ? pts.map((p) => p.v[Sz]).filter(dbIsNum) : [];
    const sMin = Math.min(...sizes, 0), sMax = Math.max(...sizes, 1);
    const cats = catColor ? dbSortKeys(pts.map((p) => p.cat)) : [];
    const cvals = !catColor && C ? pts.map((p) => p.v[C]).filter(dbIsNum) : [];
    const frameData = (f) => pts.filter((p) => p.t === f && [X, Y, Z].every((c) => dbIsNum(p.v[c]))).map((p) => ({
      name: p.name, value: [p.v[X], p.v[Y], p.v[Z], catColor ? cats.indexOf(p.cat) : (C ? p.v[C] : 0), Sz ? p.v[Sz] : 1] }));
    const sizeOf = (v) => (Sz && dbIsNum(v[4]) ? 6 + 26 * ((v[4] - sMin) / ((sMax - sMin) || 1)) : 10);
    const nm = (c) => (c || '').replace(/_/g, ' ');
    const baseOpt = {
      ...base,
      tooltip: { ...base.tooltip, formatter: (p) => `<b>${dbEsc(p.name)}</b><br>${nm(X)}: ${dbFmt(p.value[0], 'compact', ctx.cur())}<br>${nm(Y)}: ${dbFmt(p.value[1], 'compact', ctx.cur())}<br>${nm(Z)}: ${dbFmt(p.value[2], 'compact', ctx.cur())}`
        + `${C ? `<br>${nm(C)}: ${catColor ? dbEsc(cats[p.value[3]]) : dbFmt(p.value[3], 'compact', ctx.cur())}` : ''}${Sz ? `<br>${nm(Sz)}: ${dbFmt(p.value[4], 'compact', ctx.cur())}` : ''}` },
      visualMap: C ? (catColor ? { type: 'piecewise', dimension: 3, categories: undefined, pieces: cats.map((c, i) => ({ value: i, label: c, color: P[i % P.length] })),
        right: 4, bottom: 4, textStyle: { color: muted, fontSize: 10 }, itemWidth: 10, itemHeight: 10 }
        : { dimension: 3, min: Math.min(...cvals), max: Math.max(...cvals, Math.min(...cvals) + 1), right: 4, bottom: 4, itemHeight: 70, text: [nm(C), ''], textStyle: { color: muted, fontSize: 10 }, calculable: true,
          inRange: { color: [P[1] || '#22d3ee', P[0], '#a855f7', '#f43f5e'] } }) : undefined,
      xAxis3D: { type: 'value', name: nm(X), scale: true, nameTextStyle: { color: muted }, axisLabel: { textStyle: { color: muted }, formatter: (v) => dbFmt(v, 'compact', ctx.cur()) } },
      yAxis3D: { type: 'value', name: nm(Y), scale: true, nameTextStyle: { color: muted }, axisLabel: { textStyle: { color: muted }, formatter: (v) => dbFmt(v, 'compact', ctx.cur()) } },
      zAxis3D: { type: 'value', name: nm(Z), scale: true, nameTextStyle: { color: muted }, axisLabel: { textStyle: { color: muted }, formatter: (v) => dbFmt(v, 'compact', ctx.cur()) } },
      grid3D: gl3d({ boxDepth: 100, boxWidth: 100, boxHeight: 90, top: frames.length > 1 ? 50 : 20, bottom: 0, viewControl: { autoRotate: orbit, autoRotateSpeed: 6, autoRotateAfterStill: 4, distance: 225, alpha: 22, beta: 36, damping: 0.85, animation: anim } }),
    };
    const seriesFor = (f) => [{ type: 'scatter3D', data: frameData(f), symbolSize: (v) => sizeOf(v), itemStyle: { opacity: 0.9, borderWidth: 0.5, borderColor: dark ? 'rgba(255,255,255,.6)' : 'rgba(0,0,0,.25)' },
      emphasis: { label: { show: true, formatter: (p) => p.name, textStyle: { color: text, fontSize: 12 } } }, animationDurationUpdate: 900 }];
    if (frames.length > 1) {
      inst.setOption({ baseOption: { ...baseOpt,
        timeline: { axisType: 'category', data: frames, autoPlay: anim, playInterval: Number(w.speed) || 1400, loop: w.loop !== false, top: 2, left: 124, right: 80, height: 36,
          label: { color: muted, fontSize: 10 }, lineStyle: { color: grid }, checkpointStyle: { color: P[0], borderColor: P[0] }, controlStyle: { color: muted, borderColor: muted },
          itemStyle: { color: grid } } },
      options: frames.map((f) => ({ series: seriesFor(f), title: { text: f, left: 6, top: 4, textStyle: { color: muted, fontSize: 22, fontWeight: 600, opacity: 0.6 } } })) });
    } else {
      inst.setOption({ ...baseOpt, series: seriesFor(frames[0]) });
    }
    return;
  }
}

/* ---------- widget editor: the extra fields for motion / 3D types ---------- */
function dbMotionFields(w, cols, kinds, changed, field, selectOf) {
  if (!DB_MOTION_TYPES[w.type]) return [];
  if (typeof DB_GEO_TYPES === 'object' && DB_GEO_TYPES[w.type]) return dbGeoFields(w, cols, kinds, changed, field, selectOf);
  const all = cols.map((c) => [c, c]);
  const nums = cols.filter((_, i) => kinds[i] === 'num').map((c) => [c, c]);
  const cats = cols.filter((_, i) => kinds[i] === 'cat' || kinds[i] === 'text' || kinds[i] === 'id').map((c) => [c, c]);
  const dates = cols.filter((_, i) => kinds[i] === 'date').map((c) => [c, c]);
  const num = (k, label, hint) => { const inp = el('input', { class: 'field', type: 'number', value: w[k] ?? '', placeholder: hint || '' }); inp.addEventListener('change', () => { w[k] = inp.value === '' ? undefined : Number(inp.value); changed(); }); return field(label, inp); };
  const pick = (k, label, opts, none = '— none —') => field(label, selectOf(opts.length ? opts : all, w[k], (v) => { w[k] = v || null; changed(); }, none));
  const grain = () => field('Time step', selectOf([['day', 'Day'], ['month', 'Month'], ['year', 'Year']], w.grain || (w.type === 'wave' ? 'day' : 'month'), (v) => { w.grain = v; changed(); }));
  const out = [el('h4', { class: 'mo-ed-h' }, w.type === 'bubble5d' ? '5D mapping' : ['bar3d', 'city3d', 'terrain3d'].includes(w.type) ? '3D settings' : 'Motion settings')];
  if (w.type === 'race') out.push(pick('time', 'Play over (time column)', dates.length ? dates : all), grain(), num('top', 'Bars shown', '10'), num('speed', 'Milliseconds per step', '1100'),
    el('label', { class: 'switch' }, el('input', { type: 'checkbox', checked: w.cumulative !== false, onChange: (e) => { w.cumulative = e.target.checked; changed(); } }), 'Running total (cumulative)'));
  if (w.type === 'wave') out.push(grain());
  if (w.type === 'radial' || w.type === 'city3d') out.push(num('top', w.type === 'city3d' ? 'Towers (max)' : 'Rings', w.type === 'city3d' ? '64' : '6'));
  if (w.type === 'flow') out.push(pick('target', 'Flows to (target column)', cats));
  if (w.type === 'bar3d' || w.type === 'terrain3d') out.push(pick('series', w.type === 'terrain3d' ? 'Second dimension (depth)' : 'Depth (second category, optional)', cats.concat(dates)));
  if (w.type === 'city3d') out.push(pick('color', 'Tower colour by (second measure, optional)', nums));
  if (w.type === 'bubble5d') {
    out.push(el('p', { class: 'muted small', style: { margin: 0 } }, 'Each bubble is one item (Label). X axis above = position X; Value = Y. Add Z, colour and size — and a time column to play it.'),
      pick('z', 'Z (depth, a number)', nums), pick('color', 'Colour (number or category)', all), pick('size', 'Size (a number)', nums), pick('label', 'Label — one bubble per', cats),
      pick('time', 'Play over (time column, optional)', dates.length ? dates : all), grain(), num('speed', 'Milliseconds per step', '1400'));
  }
  if (['bar3d', 'city3d', 'terrain3d', 'bubble5d'].includes(w.type)) out.push(el('label', { class: 'switch' }, el('input', { type: 'checkbox', checked: w.autoRotate !== false, onChange: (e) => { w.autoRotate = e.target.checked; changed(); } }), 'Slowly orbit (stops while you drag)'));
  return out;
}
