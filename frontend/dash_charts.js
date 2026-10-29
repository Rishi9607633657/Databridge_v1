/* DataBridge chart engine.
   - The chart catalogue: the curated set of chart types the picker offers, with icons and what each is for.
   - Migration of older widget types (race, wave, radial, flow, bar3d, terrain3d, bubble5d, city3d, map2d, map3d, globe3d)
     to "base type + options" (play over time, 2D/3D view, map view) — saved dashboards keep working.
   - ECharts rendering for 2D charts: clean theme-aware styling, animated sorting, play over time, morphing between
     chart types (charts are kept between redraws, so filters and edits animate instead of flashing).
   - The 2D ⇄ 3D switch: 3D bars, 3D ribbons, 3D landscape, 3D bubbles (ECharts-GL) and a 3D donut / 3D funnel (Three.js).
   Loaded after motion3d.js and geo3d.js, before dashboards.js. */
'use strict';

/* ---------------- catalogue ---------------- */
const DB_CHART_TYPES = { scatter: 'Bubbles', heatmap: 'Heatmap', sankey: 'Flow', map: 'Map', twin3d: 'Building / campus' };
const DB_CATALOG = [
  { group: 'Numbers', items: [{ type: 'kpi', name: 'KPI', hint: 'One number and how it changed' }] },
  { group: 'Compare', items: [
    { type: 'bar', name: 'Columns', hint: 'Compare a few categories', d3: true, play: true },
    { type: 'hbar', name: 'Ranking', hint: 'Top N with long names', d3: true, play: true },
    { type: 'rank', name: 'Top list', hint: 'Ranked rows with bars and the change vs before' }] },
  { group: 'Trend', items: [
    { type: 'line', name: 'Line', hint: 'Change over time', d3: true, play: true },
    { type: 'area', name: 'Area', hint: 'Volume over time', d3: true, play: true }] },
  { group: 'Share', items: [
    { type: 'pie', name: 'Donut', hint: 'Parts of a whole (up to 8)', d3: true, play: true },
    { type: 'funnel', name: 'Funnel', hint: 'Stages that drop off', d3: true },
    { type: 'catlist', name: 'Categories', hint: 'Each category with an icon, bar and share' }] },
  { group: 'Relationships', items: [
    { type: 'scatter', name: 'Bubbles', hint: 'Two measures, size and colour', d3: true, play: true },
    { type: 'heatmap', name: 'Heatmap', hint: 'Two categories, e.g. day × hour', d3: true },
    { type: 'sankey', name: 'Flow', hint: 'How much goes from A to B' }] },
  { group: 'Places', items: [
    { type: 'globe', name: 'Globe overview', hint: 'Regions, 3D globe and the top locations as buildings', d3: true },
    { type: 'map', name: 'Map', hint: 'Countries, states, cities — flat, 3D or globe', d3: true, play: true },
    { type: 'twin3d', name: 'Building', hint: 'Floors × zones, or a campus of sites' }] },
  { group: 'Other', items: [
    { type: 'table', name: 'Table', hint: 'Rows with heat colours' },
    { type: 'insights', name: 'Insights', hint: 'Findings written for you' },
    { type: 'panel', name: 'Tabs', hint: 'Several charts in one card' },
    { type: 'text', name: 'Text', hint: 'Notes and headings' }] },
];
const DB_CAT_BY_TYPE = Object.fromEntries(DB_CATALOG.flatMap((g) => g.items.map((i) => [i.type, i])));
const DB_3D_TYPES = new Set(['bar', 'hbar', 'line', 'area', 'pie', 'funnel', 'heatmap', 'scatter']);
const DB_PLAY_TYPES = new Set(['bar', 'hbar', 'pie', 'funnel', 'scatter', 'map', 'line', 'area']);
const DB_MAX_3D = 8;                                         // browsers keep ~16 WebGL contexts; leave room

const DB_ICO = {
  kpi: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M7 15l3.2-3.4 2.4 2.1L17 9"/>',
  bar: '<rect x="4" y="11" width="3.6" height="9" rx="1"/><rect x="10.2" y="5" width="3.6" height="15" rx="1"/><rect x="16.4" y="8" width="3.6" height="12" rx="1"/>',
  hbar: '<rect x="3" y="4" width="16" height="3.6" rx="1"/><rect x="3" y="10.2" width="11" height="3.6" rx="1"/><rect x="3" y="16.4" width="6.5" height="3.6" rx="1"/>',
  line: '<path d="M3 17l5-6 4 3.5L21 6"/><circle cx="21" cy="6" r="1.2"/>',
  area: '<path d="M3 19l5-7 4 3 9-9v13z" fill="currentColor" fill-opacity=".22"/><path d="M3 19l5-7 4 3 9-9"/>',
  pie: '<circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="3.6"/><path d="M12 3.8v4.6M19.6 15.2l-4.3-1.4"/>',
  funnel: '<path d="M3 5h18l-2.6 4H5.6zM6.6 11h10.8l-2.2 4H8.8zM9.6 17h4.8l-1.2 3h-2.4z"/>',
  scatter: '<circle cx="7" cy="15" r="2.6"/><circle cx="14" cy="9" r="3.6"/><circle cx="18.5" cy="16.5" r="1.8"/><path d="M3 21h18" opacity=".5"/>',
  heatmap: '<rect x="3.5" y="3.5" width="5" height="5" rx="1" fill="currentColor" fill-opacity=".85"/><rect x="9.5" y="3.5" width="5" height="5" rx="1" fill="currentColor" fill-opacity=".35"/><rect x="15.5" y="3.5" width="5" height="5" rx="1" fill="currentColor" fill-opacity=".6"/><rect x="3.5" y="9.5" width="5" height="5" rx="1" fill="currentColor" fill-opacity=".3"/><rect x="9.5" y="9.5" width="5" height="5" rx="1" fill="currentColor" fill-opacity=".95"/><rect x="15.5" y="9.5" width="5" height="5" rx="1" fill="currentColor" fill-opacity=".2"/><rect x="3.5" y="15.5" width="5" height="5" rx="1" fill="currentColor" fill-opacity=".55"/><rect x="9.5" y="15.5" width="5" height="5" rx="1" fill="currentColor" fill-opacity=".15"/><rect x="15.5" y="15.5" width="5" height="5" rx="1" fill="currentColor" fill-opacity=".7"/>',
  sankey: '<path d="M4 5v6M20 13v6M4 14v5M20 5v5"/><path d="M4 8c8 0 8 8 16 8M4 16.5c8 0 8-9 16-9" opacity=".7"/>',
  map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  twin3d: '<path d="M4 21V9l8-5 8 5v12"/><path d="M9.5 21v-5h5v5M8 11h.01M12 11h.01M16 11h.01M8 14h.01M16 14h.01"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/>',
  insights: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9.5 4v5"/>',
  text: '<path d="M5 6h14M5 11h14M5 16h9"/>',
  rank: '<path d="M4 6h.01M4 12h.01M4 18h.01"/><rect x="8" y="4.5" width="12" height="3" rx="1.5"/><rect x="8" y="10.5" width="8.5" height="3" rx="1.5"/><rect x="8" y="16.5" width="5" height="3" rx="1.5"/>',
  catlist: '<rect x="3" y="4" width="5" height="5" rx="1.5"/><rect x="3" y="15" width="5" height="5" rx="1.5"/><path d="M11 6.5h10M11 17.5h7"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5a13 13 0 0 1 0 17M12 3.5a13 13 0 0 0 0 17"/><path d="M17.5 19.5V16M20 19.5v-2.2" opacity=".85"/>',
  cube: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
  flat: '<rect x="4" y="4" width="16" height="16" rx="2"/>',
  dl: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  img: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-8 8"/>',
  code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
  ask: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>',
  pause: '<rect x="6.5" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="13.5" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/>',
  style: '<circle cx="12" cy="12" r="9"/><circle cx="8" cy="10" r="1.3" fill="currentColor"/><circle cx="12" cy="7.5" r="1.3" fill="currentColor"/><circle cx="16" cy="10" r="1.3" fill="currentColor"/><path d="M12 21a3 3 0 0 1 0-6h2a3 3 0 0 0 0-6"/>',
};
function dbIco(name, size = 18) {
  const s = el('span', { class: 'dbi', 'aria-hidden': 'true' });
  s.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${DB_ICO[name] || DB_ICO.bar}</svg>`;
  return s;
}

/* ---------------- colours & labels ---------------- */
function dbRgb(c) { const m = /^#?([0-9a-f]{6})$/i.exec(String(c || '').trim()); if (!m) return null; const n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function dbAlpha(c, a) { const r = dbRgb(c); return r ? `rgba(${r.join(',')},${a})` : c; }
function dbMixHex(a, b, t) {
  const x = dbRgb(a), y = dbRgb(b);
  if (!x || !y) return a;
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}
const DB_MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function dbNiceLabel(l) {
  const s = String(l ?? '');
  let m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):00$/.exec(s);
  if (m) return `${+m[3]} ${DB_MON[+m[2] - 1]} ${m[4]}:00`;
  m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) return `${+m[3]} ${DB_MON[+m[2] - 1]}`;
  m = /^(\d{4})-(\d{2})$/.exec(s);
  if (m) return `${DB_MON[+m[2] - 1]} ${m[1].slice(2)}`;
  m = /^(\d{4})-Q(\d)$/.exec(s);
  if (m) return `Q${m[2]} ${m[1].slice(2)}`;
  return s;
}
/* column name -> words people use: margin_pct -> Margin %, avg_ticket -> Avg ticket */
function dbHuman(c) {
  return String(c || '').replace(/_/g, ' ').replace(/\bpct\b|\bpercent\b/gi, '%').replace(/\bqty\b/gi, 'quantity').replace(/\bamt\b/gi, 'amount')
    .replace(/\s+%/g, ' %').replace(/\s+/g, ' ').trim().replace(/^./, (x) => x.toUpperCase());
}

/* ---------------- older widget types -> base type + options ---------------- */
const DB_LEGACY = {
  race: (w) => ({ type: 'hbar', play: w.time || null, playGrain: w.grain || 'month', playCum: w.cumulative !== false, playMs: w.speed, sort: 'value_desc', top: w.top || 10 }),
  wave: () => ({ type: 'line' }),
  radial: (w) => ({ type: 'pie', pieStyle: 'rings', top: w.top || 6 }),
  flow: () => ({ type: 'sankey' }),
  bar3d: () => ({ type: 'bar', dim: '3d' }),
  city3d: () => ({ type: 'twin3d', twin: 'campus' }),
  terrain3d: () => ({ type: 'heatmap', dim: '3d' }),
  bubble5d: (w) => ({ type: 'scatter', dim: '3d', play: w.time || null, playGrain: w.grain || 'month' }),
  map2d: (w) => ({ type: 'map', view: 'flat', play: w.time || null, playGrain: w.grain || 'month' }),
  map3d: () => ({ type: 'map', view: '3d' }),
  globe3d: () => ({ type: 'map', view: 'globe' }),
};
const DB_KPI_LEGACY = { tinted: 'clean', spark: 'clean', accent: 'clean', gradient: 'tiles' };
function dbNormalizeWidget(w) {
  if (!w || typeof w !== 'object') return w;
  const f = DB_LEGACY[w.type];
  if (f) Object.assign(w, f(w));
  if (DB_KPI_LEGACY[w.kpiStyle]) w.kpiStyle = DB_KPI_LEGACY[w.kpiStyle];
  (w.children || []).forEach(dbNormalizeWidget);
  return w;
}
function dbNormalizeDash(D) {
  if (!D) return D;
  (D.widgets || []).forEach(dbNormalizeWidget);
  if (DB_KPI_LEGACY[D.kpiStyle]) D.kpiStyle = DB_KPI_LEGACY[D.kpiStyle];
  return D;
}
/* effective 2D/3D for a widget (dashboard default, the widget's own choice, and the per-page 3D budget) */
function dbIs3d(w, D, pageWidgets) {
  if (!DB_3D_TYPES.has(w.type)) return false;
  const want = (w.dim || (D && D.dim) || '2d') === '3d';
  if (!want || !pageWidgets) return want;
  const rank = pageWidgets.filter((x) => DB_3D_TYPES.has(x.type) && (x.dim || (D && D.dim) || '2d') === '3d'
    || x.type === 'twin3d' || (x.type === 'map' && dbMapView(x, D) !== 'flat')).indexOf(w);
  return rank >= 0 && rank < DB_MAX_3D;
}
function dbMapView(w, D) { return w.view || ((D && D.dim) === '3d' ? '3d' : 'flat'); }

/* ---------------- picker ---------------- */
function dbChartPicker(cur, onPick, { compact = false } = {}) {
  return el('div', { class: `cpk${compact ? ' compact' : ''}` }, DB_CATALOG.map((g) => el('div', { class: 'cpk-group' },
    compact ? null : el('div', { class: 'cpk-h' }, g.group),
    el('div', { class: 'cpk-grid' }, g.items.map((it) => el('button', { type: 'button', class: `cpk-tile${it.type === cur ? ' on' : ''}`, title: it.hint, 'aria-pressed': String(it.type === cur),
      onClick: () => onPick(it.type) }, dbIco(it.type, compact ? 20 : 24), el('span', { class: 'cpk-name' }, it.name),
    compact ? null : el('span', { class: 'cpk-hint' }, it.hint),
    compact ? null : el('span', { class: 'cpk-tags' }, it.d3 ? el('i', {}, '3D') : null, it.play ? el('i', {}, 'Motion') : null)))))));
}
function dbChartPickerDialog(cur) {
  return openDialog((close) => el('div', { class: 'dlg cpk-dlg' },
    el('div', { class: 'row' }, el('h2', { class: 'grow' }, 'Add a chart'), btn('Close', () => close(null), { cls: 'sm' })),
    el('p', { class: 'muted', style: { margin: '0 0 6px' } }, 'Pick what the chart should show. Charts marked 3D switch between 2D and 3D; Motion charts can play over time.'),
    dbChartPicker(cur, (t) => close(t))), { wide: true });
}

/* ---------------- ECharts: one chart instance per widget, kept between redraws ---------------- */
const DB_EC_REPLACE = ['series', 'xAxis', 'yAxis', 'legend', 'title', 'graphic', 'dataZoom', 'visualMap', 'polar', 'angleAxis', 'radiusAxis', 'grid'];
function dbEcEntry(ctx, w, body, kind) {
  let e = ctx.park[w.id];
  if (e) delete ctx.park[w.id];
  if (e && (!e.ec || ctx.printing || e.dpr !== 1 || (e.inst && e.inst.isDisposed()))) { try { e.destroy(); } catch { /* gone */ } e = null; }
  if (e) {
    e.timers.forEach((t) => clearInterval(t)); e.timers = [];
    e.holder.querySelectorAll('.ec-over').forEach((n) => n.remove());
    e.sameKind = e.kind === kind; e.kind = kind; e.onSize = null;
  } else {
    e = { ec: true, reusable: true, kind, inst: null, holder: el('div', { class: 'dash-canvas ec-holder' }), ro: null, timers: [], dpr: ctx.printing ? 2 : 1, sameKind: false, onSize: null,
      destroy() { this.timers.forEach((t) => clearInterval(t)); if (this.ro) this.ro.disconnect(); if (this.inst && !this.inst.isDisposed()) this.inst.dispose(); this.dead = true; },
      /* charts whose layout depends on the card's shape (donut + legend side by side) re-place themselves when the card is resized */
      resize() {
        if (!this.inst || this.inst.isDisposed()) return;
        this.inst.resize();
        const W = this.holder.clientWidth, H = this.holder.clientHeight, key = `${W}x${H}`;
        if (this.onSize && W && H && key !== this.sizeKey) { this.sizeKey = key; try { this.inst.setOption(this.onSize(W, H)); } catch { /* keep the last layout */ } }
      },
      toBase64Image() { return this.inst ? this.inst.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: this.bg || '#ffffff' }) : ''; } };
  }
  e.holder.setAttribute('role', 'img');
  e.holder.setAttribute('aria-label', `${(DB_CAT_BY_TYPE[w.type] || {}).name || w.type}: ${w.title || ''}`);
  body.append(e.holder);
  ctx.register(w.id, e);
  return e;
}
/* build the option once the card is in the page (size known), then set it — merging when the chart kind is unchanged */
function dbEcMount(ctx, e, build) {
  queueMicrotask(() => {
    if (e.dead || !e.holder.isConnected) return;
    if (!e.inst) {
      e.inst = echarts.init(e.holder, null, { renderer: 'canvas', devicePixelRatio: ctx.printing ? 2 : undefined });
      e.ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => e.resize()) : null;
      if (e.ro) e.ro.observe(e.holder);
      e.fresh = true;
    }
    if (e.inst.getWidth() !== e.holder.clientWidth || e.inst.getHeight() !== e.holder.clientHeight) e.inst.resize();
    let opt;
    try { opt = build(e); } catch (err) { console.error(err); e.holder.replaceChildren(el('p', { class: 'muted dash-msg' }, `Check this chart's settings: ${err.message}`)); return; }
    if (!opt) return;
    e.bg = ctx.tv('--surface', '#ffffff');
    e.inst.setOption(opt, e.fresh || !e.sameKind ? { notMerge: true } : { replaceMerge: DB_EC_REPLACE });
    e.fresh = false;
    e.sizeKey = `${e.holder.clientWidth}x${e.holder.clientHeight}`;
    if (ctx.group) { e.inst.group = ctx.group; echarts.connect(ctx.group); }
    if (e.after) { const f = e.after; e.after = null; f(); }
  });
}
function dbEcStyle(ctx) {
  const T = ctx.T, dark = !!T.dark;
  const text = ctx.tv('--d-text', T.v.text || '#14213D'), muted = ctx.tv('--d-muted', T.v.muted || '#5B6B86');
  const grid = ctx.tv('--d-grid', T.v.grid || '#EEF1F6'), line = ctx.tv('--d-line', T.v.line || '#E1E6EF');
  const card = ctx.tv('--surface', dark ? '#151B33' : '#FFFFFF');
  const anim = ctx.level !== 'off' && !ctx.printing;
  const cine = anim && ctx.level === 'cinematic';
  const P = ctx.P.map((c) => (dbRgb(c) ? c : '#5B7CFA'));
  return { dark, text, muted, grid, line, card, anim, cine, P, accent: P[0],
    base: { backgroundColor: 'transparent', color: P, textStyle: { color: text, fontFamily: ctx.font },
      animation: anim, animationDuration: anim ? (cine ? 1100 : 700) : 0, animationEasing: 'cubicOut', animationDurationUpdate: anim ? 650 : 0, animationEasingUpdate: 'cubicInOut',
      tooltip: { confine: true, backgroundColor: dark ? 'rgba(17,22,44,.96)' : 'rgba(255,255,255,.98)', borderColor: line, borderWidth: 1, padding: [8, 12],
        textStyle: { color: text, fontSize: 12, fontFamily: ctx.font }, extraCssText: 'border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.18);' } } };
}
const dbFmtOf = (w, ctx) => (v) => dbFmt(v, w.format || 'compact', ctx.cur);
/* axis ticks: compact, without trailing zeros (8 L, 2.5 Cr, 40K) */
const dbAxisFmtOf = (w, ctx) => (v) => String(dbFmt(v, String(w.format || '').startsWith('currency') ? 'currency_compact' : w.format === 'percent' ? 'percent' : 'compact', ctx.cur))
  .replace(/(\d)\.0+(?=\D|$)/, '$1').replace(/(\.\d*?[1-9])0+(?=\D|$)/, '$1');
function dbEcMsg(body, text) { body.append(el('p', { class: 'muted dash-msg' }, text)); }

/* play over time: a small player in the chart corner (play/pause, scrubber, current step) */
function dbEcPlayer(ctx, e, w, frames, apply) {
  const n = frames.length;
  if (n < 2 || ctx.printing) { apply(n - 1, false); return; }
  const st = ctx.play[w.id] || (ctx.play[w.id] = { i: ctx.level === 'off' ? n - 1 : 0, on: ctx.level !== 'off' });
  if (st.i >= n) st.i = n - 1;
  const b = el('button', { type: 'button', class: 'ec-play-btn' });
  const range = el('input', { type: 'range', min: 0, max: n - 1, value: st.i, 'aria-label': 'Time step' });
  const lab = el('span', { class: 'ec-play-lab' });
  const big = el('div', { class: 'ec-over ec-frame', 'aria-hidden': 'true' });
  const ui = el('div', { class: 'ec-over ec-player' }, b, range, lab);
  ui.addEventListener('pointerdown', (ev) => ev.stopPropagation());
  e.holder.append(big, ui);
  let timer = null;
  const setBtn = () => { b.replaceChildren(dbIco(st.on ? 'pause' : 'play', 14)); b.setAttribute('aria-label', st.on ? 'Pause' : 'Play'); b.title = st.on ? 'Pause' : 'Play over time'; };
  const show = (i, anim = true) => { st.i = i; range.value = i; lab.textContent = dbNiceLabel(frames[i]); big.textContent = dbNiceLabel(frames[i]); apply(i, anim); };
  const stop = () => { st.on = false; clearInterval(timer); timer = null; setBtn(); };
  const ms = Number(w.playMs) || Math.round(Math.min(1400, Math.max(140, 14000 / n)));
  const start = () => {
    clearInterval(timer); st.on = true; setBtn();
    timer = setInterval(() => {
      if (e.dead) { clearInterval(timer); return; }
      if (st.i >= n - 1) { if (w.playLoop === false) { stop(); return; } show(0); } else show(st.i + 1);
    }, ms);
    e.timers.push(timer);
  };
  b.addEventListener('click', () => { if (st.on) stop(); else { if (st.i >= n - 1) show(0); start(); } });
  range.addEventListener('input', () => { stop(); show(Number(range.value)); });
  setBtn();
  show(st.i, false);
  if (st.on) start();
}

/* entry point for 2D charts. prep: {labels, actual, isTime, grain, sets:[{name,data,type,axis,src}], extras, frames, cols, rows} */
function dbEcRender(ctx, w, prep, body) {
  if (w.type === 'scatter') return dbEcScatter(ctx, w, prep, body);
  if (w.type === 'heatmap') return dbEcHeatmap(ctx, w, prep, body);
  if (w.type === 'sankey') return dbEcSankey(ctx, w, prep, body);
  if (w.type === 'pie') return w.pieStyle === 'rings' ? dbEcRings(ctx, w, prep, body) : dbEcPie(ctx, w, prep, body);
  if (w.type === 'funnel') return dbEcFunnel(ctx, w, prep, body);
  return dbEcCartesian(ctx, w, prep, body);
}

/* ---- bars, columns, lines, areas ---- */
function dbEcCartesian(ctx, w, prep, body) {
  const e = dbEcEntry(ctx, w, body, 'cart');
  dbEcMount(ctx, e, () => {
    const st = dbEcStyle(ctx);
    const fmt = dbFmtOf(w, ctx), afmt = dbAxisFmtOf(w, ctx);
    const hbar = w.type === 'hbar', isBar = w.type === 'bar' || hbar, area = w.type === 'area';
    const CS = ctx.CS || {};
    const compact = !!ctx.compact;
    const playBars = isBar && prep.frames && prep.frames.length > 1;
    const labels = prep.labels;
    const raw = labels.slice();
    const sel = ctx.cross && ctx.cross.column === w.x && !prep.isTime ? String(ctx.cross.value) : null;
    const baseSets = prep.sets.filter((s) => s.src !== 'layer');
    const single = prep.sets.length === 1;
    const radius = CS.bars === 'square' ? 0 : CS.bars === 'pill' ? 99 : compact ? 3 : 6;
    const sortAnim = isBar && single && !w.stacked && !prep.isTime && (w.sort === 'value_desc' || playBars);
    const reveal = !isBar && w.play && w.play === w.x && prep.isTime && st.anim && !ctx.printing;
    const showVals = isBar && single && !w.stacked && !compact && labels.length <= (hbar ? 16 : 12);
    const grad = (c) => (CS.fill === 'none' || CS.fill === 'solid' ? c : new echarts.graphic.LinearGradient(hbar ? 1 : 0, 0, 0, hbar ? 0 : 1,
      [{ offset: 0, color: dbMixHex(c, '#ffffff', st.dark ? 0.12 : 0.22) }, { offset: 1, color: c }]));
    const series = prep.sets.map((s, k) => {
      const t = s.type || (s.src === 'layer' && isBar ? 'line' : isBar ? 'bar' : 'line');
      const color = st.P[k % st.P.length];
      const yIdx = !hbar && s.axis === 'y1' ? 1 : 0;
      const data = s.data.map((v, i) => {
        const val = dbIsNum(v) ? v : null;
        if (t === 'bar' && w.colorBy === 'category' && single) return { value: val, itemStyle: { color: grad(st.P[i % st.P.length]), opacity: sel != null && raw[i] !== sel ? 0.28 : 1 } };
        if (sel != null && raw[i] !== sel) return { value: val, itemStyle: { opacity: 0.28 } };
        return val;
      });
      const common = { id: `s${k}`, name: s.name, yAxisIndex: yIdx, universalTransition: { enabled: !sortAnim }, emphasis: { focus: single ? 'none' : 'series' } };
      if (t === 'bar') {
        return { ...common, type: 'bar', data, stack: w.stacked ? 'all' : undefined, barMaxWidth: compact ? 20 : hbar ? 26 : 40, barCategoryGap: hbar ? '34%' : '38%',
          itemStyle: { color: grad(color), borderRadius: w.stacked ? 0 : hbar ? [0, radius, radius, 0] : [radius, radius, 0, 0] },
          label: showVals || playBars ? { show: true, position: hbar ? 'right' : 'top', distance: 5, color: st.muted, fontSize: 11, fontWeight: 600, formatter: (p) => fmt(p.value), valueAnimation: true } : { show: false },
          realtimeSort: sortAnim || undefined,
          animationDelay: st.cine && !playBars ? (i) => i * 28 : 0 };
      }
      return { ...common, type: 'line', data, smooth: CS.lines === 'straight' ? false : 0.32, connectNulls: true, sampling: data.length > 400 ? 'lttb' : undefined,
        showSymbol: !!CS.points && !compact && labels.length <= 31, symbol: 'circle', symbolSize: 6,
        lineStyle: { width: compact ? 2 : 2.6, color, shadowBlur: st.dark ? 12 : 0, shadowColor: dbAlpha(color, 0.6) }, itemStyle: { color, borderColor: st.card, borderWidth: 1.5 },
        stack: w.stacked && area ? 'all' : undefined,
        areaStyle: (area || (baseSets.length === 1 && s.src !== 'layer' && CS.fill !== 'none')) ? { opacity: 1, color: CS.fill === 'solid' ? dbAlpha(color, 0.18)
          : new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: dbAlpha(color, area ? 0.42 : 0.28) }, { offset: 1, color: dbAlpha(color, 0.02) }]) } : undefined,
        endLabel: single && !compact && !prep.extras ? { show: true, formatter: (p) => fmt(Array.isArray(p.value) ? p.value[1] : p.value), color: st.text, fontWeight: 700, fontSize: 11, distance: 6, valueAnimation: true } : undefined };
    });
    const X = prep.extras || {};
    const FC = '#8B5CF6';
    if (X.fc) {
      const li = prep.actual - 1;
      const lv = prep.sets[0].data[li];
      const at = (arr) => labels.map((_, i) => (i === li ? lv : i > li ? arr[i - li - 1] ?? null : null));
      const lo = at(X.fc.lower), hi = at(X.fc.upper);
      series.push({ id: 'fc_lo', name: '__lo', type: 'line', data: lo, stack: 'fcband', symbol: 'none', lineStyle: { opacity: 0 }, silent: true, tooltip: { show: false } });
      series.push({ id: 'fc_band', name: '__band', type: 'line', data: hi.map((u, i) => (u == null || lo[i] == null ? null : u - lo[i])), stack: 'fcband', symbol: 'none',
        lineStyle: { opacity: 0 }, areaStyle: { color: dbAlpha(FC, 0.15) }, silent: true, tooltip: { show: false } });
      series.push({ id: 'fc', name: `Forecast (${X.fc.method})`, type: 'line', data: at(X.fc.values), smooth: 0.3, symbol: 'circle', symbolSize: 5, lineStyle: { type: [6, 5], width: 2, color: FC }, itemStyle: { color: FC } });
    }
    if (X.trend) series.push({ id: 'trend', name: 'Trend', type: 'line', data: X.trend, symbol: 'none', lineStyle: { type: [5, 5], width: 1.5, color: st.muted }, itemStyle: { color: st.muted } });
    if (X.ma) series.push({ id: 'ma', name: `${X.ma.n}-step average`, type: 'line', data: X.ma.data, symbol: 'none', smooth: true, lineStyle: { width: 2, color: '#F59E0B' }, itemStyle: { color: '#F59E0B' } });
    if (X.anom && X.anom.length) {
      series.push({ id: 'anom', name: 'Anomaly', type: st.cine ? 'effectScatter' : 'scatter', data: X.anom.map((i) => [i, prep.sets[0].data[i]]), symbolSize: 11, z: 5,
        rippleEffect: { scale: 2.6, brushType: 'stroke' }, itemStyle: { color: '#EF4444', borderColor: '#fff', borderWidth: 2 } });
    }
    const names = series.map((s) => s.name).filter((n) => !String(n).startsWith('__'));
    const legendOn = !compact && (names.length > 1);
    const hasRight = !hbar && prep.sets.some((s) => s.axis === 'y1');
    const top = Number(w.top) || 10;
    const catAxis = { type: 'category', data: labels.map(dbNiceLabel), inverse: hbar, boundaryGap: isBar,
      max: playBars && hbar ? Math.min(top, labels.length) - 1 : undefined,
      axisLine: { show: !hbar, lineStyle: { color: st.grid } }, axisTick: { show: false },
      axisLabel: { color: hbar ? st.text : st.muted, fontSize: compact ? 10 : 11, fontWeight: hbar ? 500 : 400, hideOverlap: true, margin: 10,
        ...(hbar ? { width: compact ? 80 : 130, overflow: 'truncate' } : {}) },
      animationDuration: sortAnim ? 500 : undefined, animationDurationUpdate: sortAnim ? 500 : undefined };
    const valAxis = (right) => ({ type: 'value', position: right ? 'right' : undefined, splitNumber: compact ? 3 : 4,
      splitLine: { show: !!CS.grid && !right, lineStyle: { color: st.grid, type: [4, 4] } }, axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { color: st.muted, fontSize: compact ? 10 : 11, formatter: afmt } });
    const zoom = !compact && !isBar && labels.length > 45;
    const opt = {
      ...st.base,
      grid: { left: 4, right: hbar ? (showVals || playBars ? 62 : 18) : hasRight ? 6 : (single && !compact && !isBar && !prep.extras ? 62 : 16), top: legendOn ? 34 : showVals && !hbar ? 22 : 14,
        bottom: playBars || reveal ? 40 : zoom ? 18 : 4, containLabel: true },
      legend: legendOn ? { show: true, type: 'scroll', top: 0, right: 0, icon: 'roundRect', itemWidth: 10, itemHeight: 10, itemGap: 14, data: names,
        textStyle: { color: st.muted, fontSize: 11 }, pageIconColor: st.muted, pageTextStyle: { color: st.muted } } : { show: false },
      tooltip: { ...st.base.tooltip, trigger: 'axis', axisPointer: { type: isBar ? 'shadow' : 'line', shadowStyle: { color: dbAlpha(st.accent, 0.06) }, lineStyle: { color: dbAlpha(st.accent, 0.5), width: 1 } },
        formatter: (ps) => {
          const arr = (Array.isArray(ps) ? ps : [ps]).filter((p) => !String(p.seriesName).startsWith('__') && p.value != null && !(Array.isArray(p.value) && p.value[1] == null));
          if (!arr.length) return '';
          const head = dbEsc(arr[0].axisValueLabel || arr[0].name || '');
          return `<div style="font-weight:700;margin-bottom:4px">${head}</div>${arr.map((p) => `<div style="display:flex;gap:14px;justify-content:space-between;align-items:center"><span>${p.marker}${dbEsc(p.seriesName)}</span><b>${dbEsc(fmt(Array.isArray(p.value) ? p.value[1] : (typeof p.value === 'object' ? p.value.value : p.value)))}</b></div>`).join('')}`;
        } },
      xAxis: hbar ? valAxis(false) : catAxis,
      yAxis: hbar ? catAxis : hasRight ? [valAxis(false), valAxis(true)] : valAxis(false),
      dataZoom: zoom ? [{ type: 'inside', zoomOnMouseWheel: 'ctrl', moveOnMouseWheel: false, moveOnMouseMove: true }] : [],
      series,
    };
    if (playBars) {
      opt.animationDuration = 0;
      opt.animationDurationUpdate = Number(w.playMs) || 900;
      opt.animationEasing = 'linear'; opt.animationEasingUpdate = 'linear';
      opt.series[0].data = prep.frames[0].data;
    }
    if (reveal) opt.series.forEach((s) => { if (/^s\d+$/.test(s.id)) s.data = s.data.map(() => null); });
    e.inst.off('click');
    e.inst.on('click', (p) => {
      if (prep.isTime || !w.x || p.componentType !== 'series' || p.seriesType === 'scatter' || p.seriesType === 'effectScatter') return;
      const label = raw[p.dataIndex];
      if (label != null) ctx.pick(w.x, String(label));
    });
    e.after = () => {
      if (playBars) {
        dbEcPlayer(ctx, e, w, prep.frames.map((f) => f.label), (i) => { e.inst.setOption({ series: [{ id: 's0', data: prep.frames[i].data }] }); });
      } else if (reveal) {
        const n = prep.actual;
        dbEcPlayer(ctx, e, { ...w, playMs: w.playMs || Math.round(Math.min(600, Math.max(40, 9000 / n))) }, labels.slice(0, n), (i) => {
          e.inst.setOption({ series: prep.sets.map((s, k) => ({ id: `s${k}`, data: s.data.map((v, j) => (j <= i && dbIsNum(v) ? v : null)) })) });
        });
      }
    };
    return opt;
  });
}

/* ---- donut / pie / rose ---- */
function dbPieItems(w, prep) {
  const s = prep.sets[0];
  if (!s) return { items: [], total: 0 };
  const n = prep.actual || prep.labels.length;
  let items = prep.labels.slice(0, n).map((l, i) => ({ name: String(l), value: s.data[i] })).filter((d) => dbIsNum(d.value) && d.value > 0);
  if (w.sort !== 'label') items.sort((a, b) => b.value - a.value);
  const max = Math.max(2, Number(w.top) || 8);
  if (items.length > max) {
    const rest = items.slice(max - 1);
    items = items.slice(0, max - 1).concat([{ name: 'Other', value: rest.reduce((t, d) => t + d.value, 0), other: true }]);
  }
  return { items, total: items.reduce((t, d) => t + d.value, 0) };
}
function dbEcPie(ctx, w, prep, body) {
  const first = dbPieItems(w, prep);
  if (!first.items.length) { dbEcMsg(body, 'No positive values to show.'); return; }
  const e = dbEcEntry(ctx, w, body, 'pie');
  dbEcMount(ctx, e, () => {
    const st = dbEcStyle(ctx);
    const fmt = dbFmtOf(w, ctx);
    const style = w.pieStyle || 'donut';
    const frames = prep.frames && prep.frames.length > 1 ? prep.frames : null;
    const itemsOf = (data) => dbPieItems(w, { ...prep, sets: [{ data }] });
    const { items, total } = frames ? itemsOf(frames[0].data) : first;
    const W = e.holder.clientWidth, H = e.holder.clientHeight;
    const sel = ctx.cross && ctx.cross.column === w.x ? String(ctx.cross.value) : null;
    const colorOf = (d, i) => (d.other ? dbMixHex(st.muted, st.card, 0.35) : st.P[i % st.P.length]);
    const data = (list) => list.map((d, i) => ({ name: d.name, value: d.value, itemStyle: { color: colorOf(d, i), opacity: sel != null && d.name !== sel ? 0.3 : 1 } }));
    const pct = (v, tot) => (tot ? `${((v / tot) * 100).toFixed(1)}%` : '');
    const donut = style !== 'pie' && style !== 'rose';
    /* wide card: ring and legend sit together as one centred group (no empty middle); otherwise the ring is centred with outside labels */
    const LW = 176;
    const lay = (cw, ch) => {
      const g = Math.round(Math.max(28, Math.min(64, cw * 0.05)));
      const R = Math.min((ch / 2) * (style === 'pie' ? 0.74 : style === 'rose' ? 0.78 : 0.8), (cw - 32 - g - LW) / 2);
      if (!ctx.compact && cw > 360 && cw > ch * 1.25 && R >= 56) {
        const start = Math.max(16, (cw - (2 * R + g + LW)) / 2);
        return { wide: true, outside: false, cx: Math.round(start + R), legLeft: Math.round(start + 2 * R + g),
          radius: [Math.round(R * (style === 'pie' ? 0 : style === 'rose' ? 0.18 : 0.7)), Math.round(R)] };
      }
      const outside = !ctx.compact && items.length <= 6;
      return { wide: false, outside, cx: '50%', legLeft: 0,
        radius: style === 'pie' ? ['0%', ctx.compact ? '72%' : outside ? '62%' : '74%'] : style === 'rose' ? ['14%', outside ? '66%' : '78%'] : ctx.compact ? ['50%', '78%'] : outside ? ['46%', '66%'] : ['56%', '80%'] };
    };
    const totalSize = (cw, ch) => (ctx.compact ? 14 : Math.max(14, Math.min(24, Math.round(Math.min(cw, ch) / 11))));
    const L = lay(W, H);
    e.onSize = (cw, ch) => {
      const l = lay(cw, ch);
      return { legend: { show: l.wide, left: l.legLeft }, series: [{ id: 's0', center: [l.cx, '52%'], radius: l.radius, label: { show: l.outside } }],
        ...(donut ? { title: { left: l.cx, textStyle: { fontSize: totalSize(cw, ch) } } } : {}) };
    };
    const opt = {
      ...st.base,
      tooltip: { ...st.base.tooltip, trigger: 'item', formatter: (p) => `<b>${dbEsc(p.name)}</b><br>${dbEsc(fmt(p.value))} · ${p.percent}%` },
      legend: { show: L.wide, type: 'scroll', orient: 'vertical', left: L.legLeft, top: 'middle', icon: 'circle', itemWidth: 9, itemHeight: 9, itemGap: 10,
        formatter: (n) => { const d = items.find((x) => x.name === n); return `{n|${n.length > 18 ? `${n.slice(0, 17)}…` : n}}{v|${d ? pct(d.value, total) : ''}}`; },
        textStyle: { rich: { n: { color: st.text, fontSize: 12, width: 112 }, v: { color: st.muted, fontSize: 12, fontWeight: 600, align: 'right', width: 44 } } },
        pageIconColor: st.muted, pageTextStyle: { color: st.muted } },
      title: donut ? { text: dbFmt(total, w.format || 'compact', ctx.cur), subtext: 'Total', left: L.cx, top: '52%', textAlign: 'center', textVerticalAlign: 'middle', itemGap: 2,
        textStyle: { color: st.text, fontSize: totalSize(W, H), fontWeight: 700, fontFamily: ctx.font },
        subtextStyle: { color: st.muted, fontSize: 11 } } : { show: false },
      series: [{ id: 's0', type: 'pie', data: data(items), center: [L.cx, '52%'], radius: L.radius,
        roseType: style === 'rose' ? 'radius' : undefined, avoidLabelOverlap: true, minAngle: 2,
        itemStyle: { borderRadius: style === 'pie' ? 3 : 7, borderColor: st.card, borderWidth: 2 },
        label: { show: L.outside, formatter: '{b}\n{d}%', color: st.muted, fontSize: 11, lineHeight: 15, overflow: 'truncate', width: 90 },
        labelLine: { length: 8, length2: 8, lineStyle: { color: st.grid } },
        emphasis: { scale: true, scaleSize: 7, itemStyle: { shadowBlur: 18, shadowColor: 'rgba(0,0,0,.18)' } },
        animationType: 'scale', animationEasing: 'cubicOut', universalTransition: { enabled: true } }],
    };
    e.inst.off('click');
    e.inst.on('click', (p) => { if (w.x && p.name && p.name !== 'Other') ctx.pick(w.x, String(p.name)); });
    if (frames) {
      e.after = () => dbEcPlayer(ctx, e, w, frames.map((f) => f.label), (i) => {
        const r = itemsOf(frames[i].data);
        e.inst.setOption({ series: [{ id: 's0', data: data(r.items) }], title: donut ? { text: dbFmt(r.total, w.format || 'compact', ctx.cur) } : undefined });
      });
    }
    return opt;
  });
}
/* ---- radial rings (one ring per category) ---- */
function dbEcRings(ctx, w, prep, body) {
  const { items } = dbPieItems({ ...w, top: Math.min(Number(w.top) || 6, 8) }, prep);
  if (!items.length) { dbEcMsg(body, 'No positive values to show.'); return; }
  const e = dbEcEntry(ctx, w, body, 'polar');
  dbEcMount(ctx, e, () => {
    const st = dbEcStyle(ctx);
    const fmt = dbFmtOf(w, ctx);
    const list = items.slice().reverse();
    const max = Math.max(...list.map((d) => d.value)) * 1.12;
    e.inst.off('click');
    e.inst.on('click', (p) => { if (w.x && p.name && p.name !== 'Other') ctx.pick(w.x, String(p.name)); });
    const W = e.holder.clientWidth, H = e.holder.clientHeight;
    const color = (i) => st.P[(list.length - 1 - i) % st.P.length];
    const rich = { n: { color: st.text, fontSize: 12, width: 96, lineHeight: 22 }, v: { color: st.muted, fontSize: 12, fontWeight: 600, lineHeight: 22 } };
    list.forEach((_, i) => { rich[`c${i}`] = { color: color(i), fontSize: 13, width: 16, lineHeight: 22 }; });
    /* wide card: rings and their key sit together as one centred group */
    const lay = (cw, ch) => {
      const TW = 186, g = Math.round(Math.max(20, Math.min(56, cw * 0.04)));
      const R = Math.min((ch / 2) * 0.86, (cw - 24 - g - TW) / 2);
      if (!ctx.compact && cw > ch * 1.15 && cw > 300 && R >= 50) {
        const start = Math.max(12, (cw - (2 * R + g + TW)) / 2);
        return { side: true, cx: Math.round(start + R), tl: Math.round(start + 2 * R + g), radius: [Math.round(R * 0.21), Math.round(R)] };
      }
      return { side: false, cx: '50%', tl: 0, radius: ['18%', '84%'] };
    };
    const L = lay(W, H);
    e.onSize = (cw, ch) => {
      const l = lay(cw, ch);
      return { title: { show: l.side, left: l.tl }, polar: { radius: l.radius, center: [l.cx, '52%'] }, radiusAxis: { axisLabel: { show: !l.side } } };
    };
    return { ...st.base,
      tooltip: { ...st.base.tooltip, trigger: 'item', formatter: (p) => `<b>${dbEsc(p.name)}</b><br>${dbEsc(fmt(p.value))}` },
      title: { show: L.side, text: list.map((d, i) => `{c${i}|●}{n|${d.name.length > 14 ? `${d.name.slice(0, 13)}…` : d.name}}{v|${fmt(d.value)}}`).reverse().join('\n'), left: L.tl, top: 'middle', textStyle: { rich } },
      polar: { radius: L.radius, center: [L.cx, '52%'] }, angleAxis: { max, startAngle: 90, show: false },
      radiusAxis: { type: 'category', data: list.map((d) => d.name), axisLine: { show: false }, axisTick: { show: false }, z: 10, axisLabel: { show: !L.side, color: st.text, fontSize: 10, interval: 0, align: 'right', margin: 14 } },
      series: [{ id: 's0', type: 'bar', coordinateSystem: 'polar', roundCap: true, barWidth: '58%', showBackground: true,
        backgroundStyle: { color: st.dark ? 'rgba(255,255,255,.06)' : 'rgba(15,23,42,.05)' },
        data: list.map((d, i) => ({ name: d.name, value: d.value, itemStyle: { color: st.P[(list.length - 1 - i) % st.P.length], shadowBlur: st.dark ? 10 : 0, shadowColor: st.P[(list.length - 1 - i) % st.P.length] } })),
        label: { show: false }, universalTransition: { enabled: true } }] };
  });
}
/* ---- funnel ---- */
function dbEcFunnel(ctx, w, prep, body) {
  const s = prep.sets[0];
  const n = prep.actual || prep.labels.length;
  let items = prep.labels.slice(0, n).map((l, i) => ({ name: String(l), value: s ? s.data[i] : null })).filter((d) => dbIsNum(d.value));
  if (w.sort !== 'label') items.sort((a, b) => b.value - a.value);
  items = items.slice(0, Math.max(2, Number(w.top) || 8));
  if (!items.length) { dbEcMsg(body, 'No stages to show.'); return; }
  const e = dbEcEntry(ctx, w, body, 'funnel');
  dbEcMount(ctx, e, () => {
    const st = dbEcStyle(ctx);
    const fmt = dbFmtOf(w, ctx);
    const first = items[0].value || 1;
    const shade = (i) => dbMixHex(st.accent, st.dark ? '#000000' : '#ffffff', Math.min(0.62, (i / Math.max(1, items.length - 1)) * 0.62));
    e.inst.off('click');
    e.inst.on('click', (p) => { if (w.x && p.name) ctx.pick(w.x, String(p.name)); });
    return { ...st.base,
      tooltip: { ...st.base.tooltip, trigger: 'item', formatter: (p) => {
        const i = items.findIndex((d) => d.name === p.name);
        const prev = i > 0 ? items[i - 1].value : null;
        return `<b>${dbEsc(p.name)}</b><br>${dbEsc(fmt(p.value))} · ${((p.value / first) * 100).toFixed(1)}% of first${prev ? ` · ${((p.value / prev) * 100).toFixed(1)}% from previous` : ''}`;
      } },
      series: [{ id: 's0', type: 'funnel', left: '4%', right: ctx.compact ? '4%' : '30%', top: 8, bottom: 8, sort: w.sort === 'label' ? 'none' : 'descending', gap: 3, minSize: '16%',
        data: items.map((d, i) => ({ name: d.name, value: d.value, itemStyle: { color: shade(i) } })),
        itemStyle: { borderWidth: 0, borderRadius: 6 },
        label: ctx.compact ? { show: true, position: 'inside', color: '#fff', fontWeight: 600, fontSize: 11, formatter: (p) => fmt(p.value) }
          : { show: true, position: 'right', color: st.text, fontSize: 12, formatter: (p) => `{n|${p.name}}\n{v|${fmt(p.value)}}  {p|${((p.value / first) * 100).toFixed(0)}%}`,
            rich: { n: { color: st.muted, fontSize: 11, lineHeight: 16 }, v: { color: st.text, fontWeight: 700, fontSize: 13 }, p: { color: st.muted, fontSize: 11 } } },
        labelLine: { length: 14, lineStyle: { color: st.grid } },
        emphasis: { label: { fontWeight: 700 } }, universalTransition: { enabled: true } }] };
  });
}

/* ---- bubbles (scatter) ---- */
function dbScatterData(w, cols, rows) {
  const X = w.x, Y = (w.y || [])[0], Sz = w.size && cols.includes(w.size) ? w.size : null, C = w.color && cols.includes(w.color) ? w.color : null;
  const L = w.label && cols.includes(w.label) ? w.label : null, T = w.play && cols.includes(w.play) ? w.play : null;
  if (![X, Y].every((c) => c && cols.includes(c))) return { error: 'Pick a number for X and another for Y (the value).' };
  const isNumCol = (c) => { const i = cols.indexOf(c); const v = rows.slice(0, 300).map((r) => r[i]).filter((x) => x != null); return v.length > 0 && v.every(dbIsNum); };
  if (!isNumCol(X) || !isNumCol(Y)) return { error: 'Bubbles need numbers on both axes — pick numeric columns for X and the value.' };
  const catColor = C && !isNumCol(C);
  const grain = w.playGrain || 'month';
  const src = T ? dbBucketRows(cols, rows, T, grain).rows : rows;
  const measures = [X, Y, ...(Sz ? [Sz] : []), ...(C && !catColor ? [C] : [])].filter((v, i, a) => a.indexOf(v) === i);
  let pts;
  if (L) {
    const keys = [...(T ? [T] : []), L];
    const agg = w.agg && w.agg !== 'none' ? w.agg : 'sum';
    const aggX = w.aggX && w.aggX !== 'none' ? w.aggX : agg;                  // X can be averaged while Y and size add up
    pts = dbGroup(cols, src, keys, measures, agg).map((g) => ({ t: T ? g.keys[0] : '', name: g.keys[keys.length - 1], v: g.vals }));
    if (aggX !== agg) {
      const gx = new Map(dbGroup(cols, src, keys, [X], aggX).map((g) => [g.keys.join('\u0001'), g.vals[X]]));
      pts.forEach((p) => { const k = [...(T ? [p.t] : []), p.name].join('\u0001'); if (gx.has(k)) p.v = { ...p.v, [X]: gx.get(k) }; });
    }
    if (catColor) { const li = cols.indexOf(L), ci = cols.indexOf(C); const look = new Map(rows.map((r) => [String(r[li]), r[ci]])); pts.forEach((p) => { p.cat = String(look.get(p.name) ?? ''); }); }
  } else {
    const ix = Object.fromEntries([...measures, ...(T ? [T] : []), ...(catColor ? [C] : [])].map((c) => [c, cols.indexOf(c)]));
    pts = src.slice(0, 3000).map((r, i) => ({ t: T ? String(r[ix[T]]) : '', name: `#${i + 1}`, cat: catColor ? String(r[ix[C]] ?? '') : undefined, v: Object.fromEntries(measures.map((m) => [m, r[ix[m]]])) }));
  }
  pts = pts.filter((p) => dbIsNum(p.v[X]) && dbIsNum(p.v[Y]));
  return { X, Y, Sz, C, L, T, catColor, pts, frames: T ? dbSortKeys(pts.map((p) => p.t)) : null };
}
function dbEcScatter(ctx, w, prep, body) {
  const D = dbScatterData(w, prep.cols, prep.rows);
  if (D.error) { dbEcMsg(body, D.error); return; }
  if (!D.pts.length) { dbEcMsg(body, 'No rows match the current filters.'); return; }
  const e = dbEcEntry(ctx, w, body, 'scatter');
  dbEcMount(ctx, e, () => {
    const st = dbEcStyle(ctx);
    const cf = (v) => dbFmt(v, 'compact', ctx.cur);
    const sizes = D.Sz ? D.pts.map((p) => p.v[D.Sz]).filter(dbIsNum) : [];
    const sMin = Math.min(...sizes, 0), sMax = Math.max(...sizes, 1);
    const size = (v) => (D.Sz && dbIsNum(v) ? 7 + 34 * Math.sqrt(Math.max(0, (v - sMin) / ((sMax - sMin) || 1))) : 11);
    const cats = D.catColor ? dbSortKeys(D.pts.map((p) => p.cat)).slice(0, 12) : [''];
    const cvals = D.C && !D.catColor ? D.pts.map((p) => p.v[D.C]).filter(dbIsNum) : [];
    const frameOf = (f) => (D.frames ? D.pts.filter((p) => p.t === f) : D.pts);
    const seriesData = (list) => cats.map((c) => list.filter((p) => !D.catColor || p.cat === c || (!cats.includes(p.cat) && c === cats[cats.length - 1]))
      .map((p) => ({ name: p.name, value: [p.v[D.X], p.v[D.Y], D.Sz ? p.v[D.Sz] : null, D.C && !D.catColor ? p.v[D.C] : null] })));
    const initial = seriesData(frameOf(D.frames ? D.frames[0] : null));
    const many = D.pts.length > 40;
    const allX = D.pts.map((p) => p.v[D.X]), allY = D.pts.map((p) => p.v[D.Y]);
    const pad = (a) => { const lo = Math.min(...a), hi = Math.max(...a), d = (hi - lo) || Math.abs(hi) || 1; return [lo - d * 0.08, hi + d * 0.08]; };
    const [x0, x1] = pad(allX), [y0, y1] = pad(allY);
    const axis = (name, lo, hi) => ({ type: 'value', name: dbHuman(name), nameLocation: 'end', nameTextStyle: { color: st.muted, fontSize: 11 }, min: D.frames ? lo : undefined, max: D.frames ? hi : undefined, scale: true,
      splitLine: { lineStyle: { color: st.grid, type: [4, 4] } }, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: st.muted, fontSize: 11, formatter: cf } });
    return { ...st.base,
      grid: { left: 6, right: 24, top: D.catColor && !ctx.compact ? 52 : 30, bottom: 6, containLabel: true },
      legend: D.catColor && !ctx.compact ? { type: 'scroll', top: 0, left: 0, right: 0, icon: 'circle', padding: [0, 0, 6, 0], itemWidth: 9, itemHeight: 9, textStyle: { color: st.muted, fontSize: 11 }, data: cats,
        pageIconColor: st.muted, pageTextStyle: { color: st.muted } } : { show: false },
      visualMap: cvals.length ? { show: !ctx.compact, dimension: 3, min: Math.min(...cvals), max: Math.max(...cvals), right: 0, top: 0, orient: 'horizontal', itemWidth: 10, itemHeight: 90,
        text: [cf(Math.max(...cvals)), dbHuman(D.C)], textStyle: { color: st.muted, fontSize: 10 }, calculable: false, inRange: { color: [st.P[1] || '#22D3EE', st.accent, '#F43F5E'] } } : undefined,
      tooltip: { ...st.base.tooltip, trigger: 'item', formatter: (p) => `<b>${dbEsc(p.name)}</b><br>${dbEsc(dbHuman(D.X))}: ${dbEsc(cf(p.value[0]))}<br>${dbEsc(dbHuman(D.Y))}: ${dbEsc(cf(p.value[1]))}`
        + `${D.Sz ? `<br>${dbEsc(dbHuman(D.Sz))}: ${dbEsc(cf(p.value[2]))}` : ''}${D.C ? `<br>${dbEsc(dbHuman(D.C))}: ${dbEsc(D.catColor ? p.seriesName : cf(p.value[3]))}` : ''}` },
      xAxis: axis(D.X, x0, x1), yAxis: axis(D.Y, y0, y1),
      series: cats.map((c, i) => ({ id: `c${i}`, name: c || dbHuman(D.Y), type: 'scatter', data: initial[i], symbolSize: (v) => size(v[2]),
        itemStyle: { color: cvals.length ? undefined : st.P[i % st.P.length], opacity: many ? 0.72 : 0.88, borderColor: st.card, borderWidth: 1,
          shadowBlur: st.dark ? 10 : 0, shadowColor: dbAlpha(st.P[i % st.P.length], 0.6) },
        label: { show: !!D.L && !many && !ctx.compact, formatter: '{b}', position: 'top', color: st.muted, fontSize: 10 }, labelLayout: { hideOverlap: true },
        emphasis: { focus: 'series', label: { show: true, formatter: '{b}', color: st.text, fontWeight: 600 } }, universalTransition: { enabled: true } })),
    };
  });
  if (D.frames && D.frames.length > 1) {
    e.after = () => dbEcPlayer(ctx, e, w, D.frames, (i) => {
      const cats = D.catColor ? dbSortKeys(D.pts.map((p) => p.cat)).slice(0, 12) : [''];
      const list = D.pts.filter((p) => p.t === D.frames[i]);
      e.inst.setOption({ series: cats.map((c, k) => ({ id: `c${k}`, data: list.filter((p) => !D.catColor || p.cat === c || (!cats.includes(p.cat) && c === cats[cats.length - 1]))
        .map((p) => ({ name: p.name, value: [p.v[D.X], p.v[D.Y], D.Sz ? p.v[D.Sz] : null, D.C && !D.catColor ? p.v[D.C] : null] })) })) });
    });
  }
}

/* ---- heatmap: two categories -> value ---- */
function dbEcHeatmap(ctx, w, prep, body) {
  const cols = prep.cols, rows = prep.rows, y = (w.y || [])[0];
  if (!w.x || !w.series || !y || ![w.x, w.series, y].every((c) => cols.includes(c))) { dbEcMsg(body, 'Pick the columns (X axis), the rows (second category) and the value — e.g. weekday × hour → sales.'); return; }
  const src = [w.x, w.series].reduce((r, c) => { const i = cols.indexOf(c); const v = r.slice(0, 50).map((x) => x[i]).filter((x) => x != null); return v.length && v.every((x) => typeof x === 'string' && dbParseTime(x) != null) ? dbBucketRows(cols, r, c, w.grain || 'auto').rows : r; }, rows);
  const g = dbGroup(cols, src, [w.x, w.series], [y], w.agg && w.agg !== 'none' ? w.agg : 'sum');
  const xs = dbSortKeys(g.map((x) => x.keys[0])).slice(0, 60), ys = dbSortKeys(g.map((x) => x.keys[1])).slice(0, 40);
  if (!xs.length || !ys.length) { dbEcMsg(body, 'No rows match the current filters.'); return; }
  const e = dbEcEntry(ctx, w, body, 'heat');
  dbEcMount(ctx, e, () => {
    const st = dbEcStyle(ctx);
    const fmt = dbFmtOf(w, ctx);
    const data = g.filter((x) => xs.includes(x.keys[0]) && ys.includes(x.keys[1])).map((x) => [xs.indexOf(x.keys[0]), ys.indexOf(x.keys[1]), x.vals[y] ?? 0]);
    const vals = data.map((d) => d[2]);
    const W = e.holder.clientWidth, H = e.holder.clientHeight;
    const cell = Math.min(W / xs.length, H / ys.length);
    const sel = ctx.cross && ctx.cross.column === w.x ? String(ctx.cross.value) : null;
    e.inst.off('click');
    e.inst.on('click', (p) => { if (p.value) ctx.pick(w.x, String(xs[p.value[0]])); });
    const cat = (list, compactNames) => ({ type: 'category', data: list.map(dbNiceLabel), splitArea: { show: false }, axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { color: st.muted, fontSize: 11, hideOverlap: true, ...(compactNames ? { width: 90, overflow: 'truncate' } : {}) } });
    return { ...st.base,
      grid: { left: 4, right: 10, top: 8, bottom: ctx.compact ? 4 : 30, containLabel: true },
      tooltip: { ...st.base.tooltip, trigger: 'item', formatter: (p) => `<b>${dbEsc(dbNiceLabel(xs[p.value[0]]))} · ${dbEsc(dbNiceLabel(ys[p.value[1]]))}</b><br>${dbEsc(fmt(p.value[2]))}` },
      xAxis: cat(xs), yAxis: cat(ys, true),
      visualMap: { min: Math.min(...vals), max: Math.max(...vals, Math.min(...vals) + 1), calculable: false, orient: 'horizontal', left: 'center', bottom: 0, itemWidth: 10, itemHeight: 140,
        show: !ctx.compact, text: [fmt(Math.max(...vals)), fmt(Math.min(...vals))], textStyle: { color: st.muted, fontSize: 10 },
        inRange: { color: [dbMixHex(st.accent, st.card, 0.9), dbMixHex(st.accent, st.card, 0.55), st.accent, dbMixHex(st.accent, st.dark ? '#ffffff' : '#000000', 0.3)] } },
      series: [{ id: 's0', type: 'heatmap', data: data.map((d) => {
          const t = (d[2] - Math.min(...vals)) / ((Math.max(...vals) - Math.min(...vals)) || 1);
          return { value: d, label: { color: t > 0.5 ? '#ffffff' : st.text }, itemStyle: sel != null && xs[d[0]] !== sel ? { opacity: 0.3 } : undefined };
        }),
        itemStyle: { borderColor: st.card, borderWidth: cell > 18 ? 2 : 1, borderRadius: cell > 22 ? 4 : 1 },
        label: { show: !ctx.compact && cell >= 34 && data.length <= 120, fontSize: 10, fontWeight: 600, formatter: (p) => dbFmt(p.value[2], 'compact', ctx.cur) },
        emphasis: { itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0,0,0,.25)' } }, progressive: 0 }] };
  });
}

/* ---- flow (Sankey): from column -> to column ---- */
function dbEcSankey(ctx, w, prep, body) {
  const cols = prep.cols, rows = prep.rows, y = (w.y || [])[0];
  if (!w.x || !w.target || !y || ![w.x, w.target, y].every((c) => cols.includes(c))) { dbEcMsg(body, 'Pick where it comes from (X axis), where it goes (To) and the value.'); return; }
  const g = dbGroup(cols, rows, [w.x, w.target], [y], w.agg && w.agg !== 'none' ? w.agg : 'sum').filter((x) => (x.vals[y] || 0) > 0);
  const top = g.sort((a, b) => b.vals[y] - a.vals[y]).slice(0, 80);
  if (!top.length) { dbEcMsg(body, 'No flows to show.'); return; }
  const e = dbEcEntry(ctx, w, body, 'sankey');
  dbEcMount(ctx, e, () => {
    const st = dbEcStyle(ctx);
    const fmt = dbFmtOf(w, ctx);
    const L = (v) => `${v}`, R = (v) => `${v} `;                  // the same name on both sides stays two nodes
    const names = [...new Set(top.flatMap((x) => [L(x.keys[0]), R(x.keys[1])]))];
    e.inst.off('click');
    e.inst.on('click', (p) => { if (p.dataType === 'node' && names.indexOf(p.name) >= 0 && !p.name.endsWith(' ')) ctx.pick(w.x, p.name); });
    return { ...st.base,
      tooltip: { ...st.base.tooltip, trigger: 'item', formatter: (p) => (p.dataType === 'edge' ? `<b>${dbEsc(p.data.source)} → ${dbEsc(p.data.target.trim())}</b><br>${dbEsc(fmt(p.data.value))}` : `<b>${dbEsc(p.name.trim())}</b><br>${dbEsc(fmt(p.value))}`) },
      series: [{ id: 's0', type: 'sankey', left: 4, right: ctx.compact ? 60 : 110, top: 8, bottom: 8, nodeGap: 10, nodeWidth: 12, draggable: false, emphasis: { focus: 'adjacency' },
        data: names.map((n, i) => ({ name: n, itemStyle: { color: st.P[i % st.P.length], borderWidth: 0 } })),
        label: { color: st.text, fontSize: 11, formatter: (p) => p.name.trim() },
        links: top.map((x) => ({ source: L(x.keys[0]), target: R(x.keys[1]), value: x.vals[y] })),
        lineStyle: { color: 'gradient', opacity: st.dark ? 0.42 : 0.32, curveness: 0.5 } }] };
  });
}

/* ---------------- 3D ---------------- */
/* route a widget to its 3D view. mctx: context for motion3d.js / geo3d.js renderers. prep: as for 2D (for ribbons, donut, funnel) */
function dbRender3D(ctx, mctx, w, cols, rows, prep, body) {
  if (w.type === 'bar' || w.type === 'hbar') {
    let r = rows;
    if (w.x && prep && prep.isTime) r = dbBucketRows(cols, rows, w.x, prep.grain || 'month').rows;
    return dbMotionRender(mctx, { ...w, type: 'bar3d' }, cols, r, body);
  }
  if (w.type === 'heatmap') return dbMotionRender(mctx, { ...w, type: 'terrain3d' }, cols, rows, body);
  if (w.type === 'scatter') return dbMotionRender(mctx, { ...w, type: 'bubble5d', time: w.play, grain: w.playGrain || 'month' }, cols, rows, body);
  if (w.type === 'line' || w.type === 'area') return dbRibbon3D(ctx, w, prep, body);
  if (w.type === 'pie') return dbDonut3D(ctx, w, prep, body);
  if (w.type === 'funnel') return dbFunnel3D(ctx, w, prep, body);
  return null;
}
/* a 3D chart (ECharts-GL) that must give its WebGL context back when it goes away */
function dbDisposeGl(inst, holder) {
  const cs = [...holder.querySelectorAll('canvas')];
  try { inst.dispose(); } catch { /* gone */ }
  cs.forEach((c) => { try { const g = c.getContext('webgl'); const x = g && g.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); } catch { /* not webgl */ } });
}
/* line / area in 3D: one ribbon per series, standing along the time axis */
async function dbRibbon3D(ctx, w, prep, body) {
  const holder = el('div', { class: 'dash-canvas mo-holder mo-3d', role: 'img', 'aria-label': `3D ${w.type}: ${w.title || ''}` });
  body.append(holder);
  const base = prep.sets.filter((s) => s.src !== 'layer').slice(0, 8);
  const n = prep.actual || prep.labels.length;
  if (!base.length || !n) { holder.replaceWith(el('p', { class: 'muted dash-msg' }, 'No rows match the current filters.')); return; }
  try { await dbLoadEcharts(true); } catch (e) { holder.replaceWith(el('p', { class: 'muted dash-msg' }, e.message)); return; }
  if (!holder.isConnected) return;
  const st = dbEcStyle(ctx);
  const fmt = dbFmtOf(w, ctx);
  const inst = echarts.init(holder, null, { devicePixelRatio: ctx.printing ? 2 : undefined });
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => inst.resize()) : null;
  if (ro) ro.observe(holder);
  ctx.register(w.id, { destroy: () => { if (ro) ro.disconnect(); dbDisposeGl(inst, holder); }, resize: () => inst.resize() });
  const m = base.length;
  const labels = prep.labels.slice(0, n).map(dbNiceLabel);
  const orbit = st.cine || (ctx.level === 'subtle' && w.autoRotate !== false);
  const boxW = 120, boxD = Math.min(84, 16 + m * 18);
  const data = [], lines = [];
  base.forEach((s, k) => {
    const color = st.P[k % st.P.length];
    const pts = [];
    s.data.slice(0, n).forEach((v, i) => { if (dbIsNum(v)) { data.push({ value: [i, k, v], itemStyle: { color: w.type === 'area' ? dbMixHex(color, '#ffffff', 0.08) : color } }); pts.push([i, k, v]); } });
    lines.push({ type: 'line3D', data: pts, lineStyle: { width: 3, color: dbMixHex(color, '#ffffff', 0.45), opacity: 1 } });
  });
  inst.setOption({ ...st.base, tooltip: { ...st.base.tooltip, formatter: (p) => (Array.isArray(p.value) ? `<b>${dbEsc(labels[p.value[0]])}</b> · ${dbEsc(base[p.value[1]].name)}<br>${dbEsc(fmt(p.value[2]))}` : '') },
    xAxis3D: { type: 'category', data: labels, name: '', axisLabel: { textStyle: { color: st.muted }, interval: Math.max(0, Math.ceil(n / 6) - 1) } },
    yAxis3D: { type: 'category', data: base.map((s) => s.name), name: '', axisLabel: { textStyle: { color: st.muted } } },
    zAxis3D: { type: 'value', name: '', axisLabel: { textStyle: { color: st.muted }, formatter: dbAxisFmtOf(w, ctx) } },
    grid3D: { boxWidth: boxW, boxDepth: boxD, boxHeight: 58, environment: 'none', postEffect: { enable: false }, temporalSuperSampling: { enable: true },
      light: { main: { intensity: 1.15, shadow: false, alpha: 40, beta: 30 }, ambient: { intensity: st.dark ? 0.4 : 0.5 } },
      viewControl: { autoRotate: orbit, autoRotateSpeed: 5, autoRotateAfterStill: 4, distance: 175, alpha: 22, beta: 32, damping: 0.85, animation: st.anim },
      axisLine: { lineStyle: { color: st.grid } }, splitLine: { lineStyle: { color: st.grid } }, axisPointer: { lineStyle: { color: st.accent } }, axisTick: { show: false } },
    series: [{ type: 'bar3D', data, shading: 'lambert', barSize: [Math.max(0.3, (boxW / n) * 0.98), Math.max(2, (boxD / m) * 0.5)],
      emphasis: { label: { show: false }, itemStyle: { color: '#ffffff' } }, animationDurationUpdate: 700 }, ...lines] });
}

/* a small Three.js stage: renderer, lights, orbit (drag / zoom buttons / double-click reset), hover tooltip, HTML labels */
async function dbThreeStage(ctx, holder, opts) {
  try { await dbLoadThree(); } catch (e) { holder.replaceWith(el('p', { class: 'muted dash-msg' }, e.message)); return null; }
  if (!holder.isConnected) return null;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: !!ctx.printing }); }
  catch { holder.replaceWith(el('p', { class: 'muted dash-msg' }, '3D needs WebGL, which this browser has turned off.')); return null; }
  const st = dbEcStyle(ctx);
  const anim = st.anim;
  const orbit = st.cine || (ctx.level === 'subtle' && opts.autoRotate !== false);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.5, 1000);
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  holder.append(renderer.domElement);
  const overlay = el('div', { class: 'tw-labels' });
  const tipEl = el('div', { class: 'tw-tip', hidden: true });
  holder.append(overlay, tipEl);
  scene.add(new THREE.HemisphereLight(st.dark ? 0x9aa6ff : 0xffffff, st.dark ? 0x0b0f2a : 0xcbd5e1, st.dark ? 0.95 : 1.15));
  const sun = new THREE.DirectionalLight(0xffffff, st.dark ? 1.15 : 1.35); sun.position.set(30, 60, 40); scene.add(sun);
  const rim = new THREE.DirectionalLight(new THREE.Color(st.P[1] || '#22d3ee'), st.dark ? 0.7 : 0.25); rim.position.set(-40, 20, -30); scene.add(rim);
  const S = { scene, camera, renderer, st, anim, pickables: [], labels: [], tweens: [], hot: null, dirty: true, alive: true,
    radius: opts.radius || 40, target: new THREE.Vector3(...(opts.target || [0, 0, 0])), theta: opts.theta ?? 0.7, phi: opts.phi ?? 1.0 };
  let r = S.radius;
  const place = () => { camera.position.set(S.target.x + r * Math.sin(S.phi) * Math.sin(S.theta), S.target.y + r * Math.cos(S.phi), S.target.z + r * Math.sin(S.phi) * Math.cos(S.theta)); camera.lookAt(S.target); S.dirty = true; };
  const size = () => { const b = holder.getBoundingClientRect(); const wd = Math.max(40, b.width), ht = Math.max(40, b.height); renderer.setSize(wd, ht, false); renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%'; camera.aspect = wd / ht; camera.updateProjectionMatrix(); S.dirty = true; };
  size(); place();
  S.place = place;
  S.addLabel = (node, pos, cls = '') => { const d = el('div', { class: `tw-label ${cls}` }, node); overlay.append(d); S.labels.push({ d, pos }); return d; };
  let autoUntil = 0, drag = null;
  const cv = renderer.domElement;
  cv.style.touchAction = 'none';
  const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
  const pick = (ev) => { const b = cv.getBoundingClientRect(); mouse.set(((ev.clientX - b.left) / b.width) * 2 - 1, -((ev.clientY - b.top) / b.height) * 2 + 1); ray.setFromCamera(mouse, camera); const h = ray.intersectObjects(S.pickables, false)[0]; return h ? h.object : null; };
  const setHot = (m) => { if (S.hot === m) return; if (S.hot && opts.onHover) opts.onHover(S.hot, false); S.hot = m; if (m && opts.onHover) opts.onHover(m, true); S.dirty = true; };
  cv.addEventListener('pointerdown', (ev) => { ev.stopPropagation(); drag = { x: ev.clientX, y: ev.clientY, t: S.theta, p: S.phi, moved: false }; cv.setPointerCapture(ev.pointerId); });
  cv.addEventListener('pointermove', (ev) => {
    if (drag) {
      const dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      S.theta = drag.t - dx * 0.008; S.phi = Math.max(0.2, Math.min(1.5, drag.p - dy * 0.006)); autoUntil = performance.now() + 4000; place(); tipEl.hidden = true; return;
    }
    const m = pick(ev);
    setHot(m);
    if (!m || !m.userData.tip) { tipEl.hidden = true; return; }
    tipEl.innerHTML = m.userData.tip;                         // values are escaped with dbEsc where tips are built
    const b = holder.getBoundingClientRect();
    tipEl.style.left = `${Math.min(b.width - 190, ev.clientX - b.left + 14)}px`; tipEl.style.top = `${Math.max(4, ev.clientY - b.top - 10)}px`;
    tipEl.hidden = false;
  });
  cv.addEventListener('pointerup', (ev) => { if (drag && !drag.moved && opts.onClick) opts.onClick(pick(ev)); drag = null; });
  cv.addEventListener('pointerleave', () => { tipEl.hidden = true; setHot(null); });
  const reset = () => { S.theta = opts.theta ?? 0.7; S.phi = opts.phi ?? 1.0; r = S.radius; place(); };
  cv.addEventListener('dblclick', reset);
  const zoom = (k) => { r = Math.max(S.radius * 0.35, Math.min(S.radius * 2.2, r * k)); place(); };
  holder.append(el('div', { class: 'tw-ctl' },
    el('button', { type: 'button', title: 'Zoom in', 'aria-label': 'Zoom in', onClick: () => zoom(0.85) }, '+'),
    el('button', { type: 'button', title: 'Zoom out', 'aria-label': 'Zoom out', onClick: () => zoom(1.18) }, '−'),
    el('button', { type: 'button', title: 'Reset view', 'aria-label': 'Reset view', onClick: reset }, '⟲')));
  holder.querySelector('.tw-ctl').addEventListener('pointerdown', (ev) => ev.stopPropagation());
  const v3 = new THREE.Vector3();
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const start = performance.now();
  let raf = 0, visible = true;
  const frame = (now) => {
    let moving = false;
    for (const a of S.tweens) {
      const t = Math.min(1, Math.max(0, (now - start - (a.delay || 0)) / (a.ms || 1000)));
      a.set(a.from + (a.to - a.from) * ease(t));
      if (t < 1) moving = true;
    }
    if (opts.tick && opts.tick(now)) moving = true;
    if (orbit && now > autoUntil && !drag) { S.theta += 0.0018; place(); moving = true; }
    if (moving || S.dirty) {
      renderer.render(scene, camera);
      const b = holder.getBoundingClientRect();
      for (const L of S.labels) {
        v3.copy(typeof L.pos === 'function' ? L.pos() : L.pos).project(camera);
        const off = v3.z > 1 || Math.abs(v3.x) > 1.05 || Math.abs(v3.y) > 1.05;
        L.d.style.display = off ? 'none' : '';
        if (!off) L.d.style.transform = `translate(${((v3.x + 1) / 2) * b.width}px, ${((1 - v3.y) / 2) * b.height}px) translate(-50%, -50%)`;
      }
      S.dirty = false;
    }
  };
  const loop = () => {
    if (!S.alive || raf) return;
    const tick = (now) => { raf = 0; if (!S.alive || !visible || document.hidden) return; frame(now); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
  };
  const io = typeof IntersectionObserver === 'function' ? new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) loop(); }) : null;
  if (io) io.observe(holder);
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => { size(); loop(); }) : null;
  if (ro) ro.observe(holder);
  const onVis = () => { if (!document.hidden) loop(); };
  document.addEventListener('visibilitychange', onVis);
  S.start = () => { frame(performance.now() + (anim ? 0 : 1e6)); loop(); };
  S.kick = () => { S.dirty = true; loop(); };
  S.destroy = () => {
    S.alive = false; cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', onVis); if (io) io.disconnect(); if (ro) ro.disconnect();
    scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach((m2) => m2.dispose()); });
    renderer.dispose(); try { renderer.forceContextLoss(); } catch { /* old three */ }
  };
  ctx.register(opts.id, { destroy: S.destroy, resize: () => { size(); S.kick(); } });
  return S;
}
/* donut in 3D: slices as extruded rings, height follows the value, hover lifts a slice */
async function dbDonut3D(ctx, w, prep, body) {
  const { items, total } = dbPieItems(w, prep);
  if (!items.length) { dbEcMsg(body, 'No positive values to show.'); return; }
  const holder = el('div', { class: 'dash-canvas mo-holder mo-3d mo-twin', role: 'img', 'aria-label': `3D donut: ${w.title || ''}` });
  body.append(holder);
  const fmt = dbFmtOf(w, ctx);
  const R = 10, rIn = w.pieStyle === 'pie' ? 0.01 : 5.4;
  const maxV = Math.max(...items.map((d) => d.value));
  const S = await dbThreeStage(ctx, holder, { id: w.id, radius: 40, phi: 0.9, theta: 0.5, target: [0, 1.4, 0], autoRotate: w.autoRotate,
    onHover: (m, on) => { const u = m.userData; if (!u.dir) return; const k = on ? 1 : 0; m.position.set(u.dir[0] * (0.45 + k * 0.9), k * 0.5, u.dir[1] * (0.45 + k * 0.9)); m.material.emissiveIntensity = u.ei + (on ? 0.25 : 0); },
    onClick: (m) => { if (m && m.userData.name && !m.userData.other && w.x) ctx.pick(w.x, m.userData.name); } });
  if (!S) return;
  const { st } = S;
  let a0 = Math.PI / 2;
  items.forEach((d, i) => {
    const frac = d.value / total;
    const a1 = a0 - Math.min(frac, 0.9995) * Math.PI * 2;
    const shape = new THREE.Shape();
    shape.moveTo(Math.cos(a0) * R, Math.sin(a0) * R);
    shape.absarc(0, 0, R, a0, a1, true);
    shape.lineTo(Math.cos(a1) * rIn, Math.sin(a1) * rIn);
    shape.absarc(0, 0, rIn, a1, a0, false);
    shape.closePath();
    const depth = 1.3 + 2.6 * (d.value / maxV);
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.12, bevelSegments: 3, curveSegments: Math.max(6, Math.ceil(frac * 120)) });
    geo.rotateX(-Math.PI / 2);
    const color = new THREE.Color(d.other ? dbMixHex(st.muted, st.card, 0.3) : st.P[i % st.P.length]);
    const ei = st.dark ? 0.16 : 0.03;
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, metalness: 0.18, roughness: 0.36, emissive: color, emissiveIntensity: ei }));
    const mid = (a0 + a1) / 2;
    const dir = [Math.cos(mid), -Math.sin(mid)];
    mesh.position.set(dir[0] * 0.45, 0, dir[1] * 0.45);
    mesh.userData = { dir, ei, name: d.name, other: !!d.other, tip: `<b>${dbEsc(d.name)}</b><br>${dbEsc(fmt(d.value))} · ${(frac * 100).toFixed(1)}%` };
    S.scene.add(mesh); S.pickables.push(mesh);
    if (S.anim) { mesh.scale.y = 0.01; S.tweens.push({ set: (v) => { mesh.scale.y = v; }, from: 0.01, to: 1, delay: i * 90, ms: 900 }); }
    if (i < 7 && frac > 0.035) {
      const lr = R + 3.2;
      S.addLabel(el('span', {}, el('b', {}, d.name), ` ${(frac * 100).toFixed(0)}%`), new THREE.Vector3(Math.cos(mid) * lr, depth + 0.6, -Math.sin(mid) * lr));
    }
    a0 = a1;
  });
  if (rIn > 1) S.addLabel(el('span', { class: 'tw-center' }, el('b', {}, dbFmt(total, w.format || 'compact', ctx.cur)), el('small', {}, 'Total')), new THREE.Vector3(0, 0.4, 0), 'tw-plain');
  const floor = new THREE.Mesh(new THREE.RingGeometry(R + 0.8, R + 1.4, 96), new THREE.MeshBasicMaterial({ color: new THREE.Color(st.accent), transparent: true, opacity: st.dark ? 0.35 : 0.22, side: THREE.DoubleSide }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.02; S.scene.add(floor);
  S.start();
}
/* funnel in 3D: one frustum per stage, its radius follows the value */
async function dbFunnel3D(ctx, w, prep, body) {
  const s = prep.sets[0];
  const n0 = prep.actual || prep.labels.length;
  let items = prep.labels.slice(0, n0).map((l, i) => ({ name: String(l), value: s ? s.data[i] : null })).filter((d) => dbIsNum(d.value) && d.value > 0);
  if (w.sort !== 'label') items.sort((a, b) => b.value - a.value);
  items = items.slice(0, Math.max(2, Number(w.top) || 7));
  if (!items.length) { dbEcMsg(body, 'No stages to show.'); return; }
  const holder = el('div', { class: 'dash-canvas mo-holder mo-3d mo-twin', role: 'img', 'aria-label': `3D funnel: ${w.title || ''}` });
  body.append(holder);
  const fmt = dbFmtOf(w, ctx);
  const n = items.length, H = 2.6, gap = 0.45, Rmax = 8.5;
  const total = n * (H + gap);
  const S = await dbThreeStage(ctx, holder, { id: w.id, radius: 46, phi: 1.15, theta: 0.6, target: [3, total / 2, 0], autoRotate: w.autoRotate,
    onHover: (m, on) => { m.material.emissiveIntensity = m.userData.ei + (on ? 0.3 : 0); m.scale.set(on ? 1.05 : 1, 1, on ? 1.05 : 1); },
    onClick: (m) => { if (m && m.userData.name && w.x) ctx.pick(w.x, m.userData.name); } });
  if (!S) return;
  const { st } = S;
  const first = items[0].value;
  const rad = items.map((d) => Math.max(1.1, Rmax * Math.sqrt(d.value / first)));
  items.forEach((d, i) => {
    const rTop = rad[i], rBot = i < n - 1 ? rad[i + 1] : rad[i] * 0.72;
    const color = new THREE.Color(dbMixHex(st.accent, st.dark ? '#000000' : '#ffffff', Math.min(0.55, (i / Math.max(1, n - 1)) * 0.55)));
    const ei = st.dark ? 0.18 : 0.04;
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, H, 72, 1, false), new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.35, emissive: color, emissiveIntensity: ei, transparent: true, opacity: 0.94 }));
    const yC = total - (i + 0.5) * (H + gap);
    mesh.position.y = yC;
    mesh.userData = { ei, name: d.name, tip: `<b>${dbEsc(d.name)}</b><br>${dbEsc(fmt(d.value))} · ${((d.value / first) * 100).toFixed(1)}% of first${i ? ` · ${((d.value / items[i - 1].value) * 100).toFixed(1)}% from previous` : ''}` };
    S.scene.add(mesh); S.pickables.push(mesh);
    if (S.anim) { mesh.scale.y = 0.01; S.tweens.push({ set: (v) => { mesh.scale.y = v; }, from: 0.01, to: 1, delay: i * 110, ms: 800 }); }
    S.addLabel(el('span', {}, el('b', {}, d.name), ` ${fmt(d.value)}`, i ? el('small', {}, ` ${((d.value / first) * 100).toFixed(0)}%`) : null), new THREE.Vector3(rTop * 0.72 + 1.2, yC, rTop * 0.72 + 1.2));
  });
  S.start();
}
