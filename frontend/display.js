/* DataBridge result viewer for display() / %sql: Table · Chart · EDA.
   All helpers use the "dt" prefix so they never clash with dashboard code. Loaded before app.js. */
'use strict';

const DB_TABLE_MIME = 'application/vnd.databridge.table+json';
const DB_SERIES_COLORS = ['#0A5CFF', '#12B5CB', '#F59E0B', '#E11D74', '#22C55E', '#8B5CF6', '#F97316', '#0EA5A4', '#84CC16', '#EF4444'];
const DT_NUM_TYPE = /^(tinyint|smallint|int|integer|bigint|long|short|float|double|real|decimal.*|number)$/i;
const DT_DATE_TYPE = /^(date|timestamp.*)$/i;
const DT_DATE_RE = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;
const DT_ROLE = { measure: 'Measure', dimension: 'Dimension', date: 'Date', id: 'ID', text: 'Text' };

function dtNum(v) { return typeof v === 'number' && Number.isFinite(v); }
function dtFmt(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return Number.isInteger(v) ? v.toLocaleString() : v.toLocaleString(undefined, { maximumFractionDigits: 6 });
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}
function dtShort(v) {
  if (!dtNum(v)) return dtFmt(v) ?? '—';
  const a = Math.abs(v);
  if (a >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  if (a >= 1e4) return `${(v / 1e3).toFixed(1)}K`;
  return Number.isInteger(v) ? v.toLocaleString() : v.toLocaleString(undefined, { maximumFractionDigits: 3 });
}
function dtCss(name, fallback) { const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim(); return v || fallback; }
function dtQuantile(sorted, q) {
  if (!sorted.length) return null;
  const pos = (sorted.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}
function dtPearson(a, b) {
  const n = a.length; if (n < 3) return null;
  const ma = a.reduce((s, v) => s + v, 0) / n, mb = b.reduce((s, v) => s + v, 0) / n;
  let sab = 0, saa = 0, sbb = 0;
  for (let i = 0; i < n; i++) { sab += (a[i] - ma) * (b[i] - mb); saa += (a[i] - ma) ** 2; sbb += (b[i] - mb) ** 2; }
  return saa && sbb ? sab / Math.sqrt(saa * sbb) : null;
}

/* ---------- column profiling: type, role (measure/dimension/date/id), stats ---------- */
function dtProfile(payload) {
  const n = payload.rows.length;
  return payload.columns.map((name, i) => {
    const type = String(payload.types[i] || '');
    const vals = payload.rows.map((r) => r[i]);
    const present = vals.filter((v) => v !== null && v !== undefined && v !== '');
    const missing = n - present.length;
    const counts = new Map();
    for (const v of present) { const k = typeof v === 'object' ? JSON.stringify(v) : String(v); counts.set(k, (counts.get(k) || 0) + 1); }
    const distinct = counts.size;
    const isNum = DT_NUM_TYPE.test(type) || (present.length > 0 && present.every(dtNum));
    const isDate = !isNum && (DT_DATE_TYPE.test(type) || (present.length > 0 && present.slice(0, 200).every((v) => DT_DATE_RE.test(String(v)))));
    const isBool = /^bool/i.test(type) || (present.length > 0 && present.every((v) => typeof v === 'boolean'));
    let role;
    if (isDate) role = 'date';
    else if (isNum) {
      const idName = /(^|_)(id|key|code|no|number|pk)$/i.test(name);
      const metric = /amount|price|qty|quantity|total|value|sales|cost|discount|fee|tax|profit|revenue|score|balance|rate|pct|percent|margin|spend|weight|count/i.test(name);
      role = idName || (!metric && distinct === present.length && present.length > 20 && present.every(Number.isInteger)) ? 'id'
        : distinct <= 12 && present.every(Number.isInteger) && present.length > distinct * 3 ? 'dimension' : 'measure';
    } else if (isBool) role = 'dimension';
    else {
      const avgLen = present.reduce((s, v) => s + String(v).length, 0) / (present.length || 1);
      role = distinct === present.length && present.length > 20 && avgLen > 6 ? 'id' : (distinct <= Math.max(50, n * 0.5) && avgLen <= 60 ? 'dimension' : 'text');
    }
    const p = { name, i, type: type || (isNum ? 'number' : isDate ? 'date' : 'string'), kind: isNum ? 'num' : isDate ? 'date' : isBool ? 'bool' : 'text',
      role, n, missing, missingPct: n ? missing / n : 0, distinct, top: [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8) };
    if (isNum) {
      const xs = present.filter(dtNum).sort((a, b) => a - b);
      const mean = xs.reduce((s, v) => s + v, 0) / (xs.length || 1);
      const sd = Math.sqrt(xs.reduce((s, v) => s + (v - mean) ** 2, 0) / Math.max(1, xs.length - 1));
      Object.assign(p, { min: xs[0], max: xs[xs.length - 1], mean, sd, median: dtQuantile(xs, 0.5), q1: dtQuantile(xs, 0.25), q3: dtQuantile(xs, 0.75),
        zeros: xs.filter((v) => v === 0).length, sum: xs.reduce((s, v) => s + v, 0), sorted: xs });
      const iqr = p.q3 - p.q1;
      p.outliers = xs.filter((v) => v < p.q1 - 1.5 * iqr || v > p.q3 + 1.5 * iqr).length;
      p.skew = sd ? xs.reduce((s, v) => s + ((v - mean) / sd) ** 3, 0) / xs.length : 0;
    }
    if (isDate) {
      const ds = present.map(String).sort();
      Object.assign(p, { min: ds[0], max: ds[ds.length - 1] });
    }
    return p;
  });
}
function dtBins(xs, k) {
  if (!xs.length) return { labels: [], counts: [], edges: [] };
  const lo = xs[0], hi = xs[xs.length - 1];
  const bins = Math.max(1, Math.min(k || Math.ceil(Math.log2(xs.length) + 1), 60));
  const w = (hi - lo) / bins || 1;
  const counts = new Array(bins).fill(0);
  for (const v of xs) counts[Math.min(bins - 1, Math.floor((v - lo) / w))]++;
  const edges = counts.map((_, i) => [lo + i * w, lo + (i + 1) * w]);
  return { labels: edges.map(([a, b]) => `${dtShort(a)}–${dtShort(b)}`), counts, edges };
}

/* ---------- table filters: "> 100", "10..20", "=x", "!=x", "a,b", "contains" ---------- */
function dtFilterFn(expr, kind) {
  const e = String(expr || '').trim();
  if (!e) return null;
  const num = (s) => Number(String(s).trim());
  const cmp = (a, b) => (kind === 'num' ? a - b : String(a).localeCompare(String(b)));
  let m;
  if ((m = /^(.+?)\.\.(.+)$/.exec(e))) {
    const a = kind === 'num' ? num(m[1]) : m[1].trim(), b = kind === 'num' ? num(m[2]) : m[2].trim();
    return (v) => v != null && cmp(v, a) >= 0 && cmp(v, b) <= 0;
  }
  if ((m = /^(>=|<=|!=|=|>|<)\s*(.*)$/.exec(e))) {
    const op = m[1], raw = m[2].trim();
    if (raw.toLowerCase() === 'null') return op === '!=' ? (v) => v != null : (v) => v == null;
    const b = kind === 'num' ? num(raw) : raw;
    return {
      '>': (v) => v != null && cmp(v, b) > 0, '<': (v) => v != null && cmp(v, b) < 0, '>=': (v) => v != null && cmp(v, b) >= 0,
      '<=': (v) => v != null && cmp(v, b) <= 0, '=': (v) => v != null && String(v) === String(b), '!=': (v) => v == null || String(v) !== String(b),
    }[op];
  }
  if (e.includes(',')) { const set = new Set(e.split(',').map((x) => x.trim().toLowerCase())); return (v) => v != null && set.has(String(v).toLowerCase()); }
  const low = e.toLowerCase();
  if (low === 'null') return (v) => v == null;
  return (v) => v != null && dtFmt(v).toLowerCase().includes(low);
}

/* ---------- Databricks-style column filters: Values (checkbox list) or Condition ---------- */
const DT_OPS = {
  num: [['eq', 'equals'], ['neq', 'does not equal'], ['gt', 'greater than'], ['gte', 'greater or equal'], ['lt', 'less than'], ['lte', 'less or equal'], ['between', 'between'], ['null', 'is empty'], ['notnull', 'is not empty']],
  date: [['eq', 'on'], ['lt', 'before'], ['gt', 'after'], ['between', 'between'], ['null', 'is empty'], ['notnull', 'is not empty']],
  text: [['contains', 'contains'], ['notcontains', 'does not contain'], ['eq', 'equals'], ['neq', 'does not equal'], ['starts', 'starts with'], ['ends', 'ends with'], ['null', 'is empty'], ['notnull', 'is not empty']],
};
function dtCondFn(f, kind) {
  const K = kind === 'num' ? 'num' : kind === 'date' ? 'date' : 'text';
  if (f.mode === 'values') { const set = new Set(f.vals); return (v) => set.has(v == null ? '(empty)' : String(v)); }
  const A = K === 'num' ? Number(f.a) : String(f.a ?? ''), B = K === 'num' ? Number(f.b) : String(f.b ?? '');
  const val = (v) => (K === 'num' ? Number(v) : K === 'date' ? String(v).slice(0, 10) : String(v).toLowerCase());
  const a = K === 'text' ? String(A).toLowerCase() : A, b = K === 'text' ? String(B).toLowerCase() : B;
  const has = (v) => v !== null && v !== undefined && v !== '';
  switch (f.op) {
    case 'null': return (v) => !has(v);
    case 'notnull': return (v) => has(v);
    case 'eq': return (v) => has(v) && val(v) === a;
    case 'neq': return (v) => !has(v) || val(v) !== a;
    case 'gt': return (v) => has(v) && val(v) > a;
    case 'gte': return (v) => has(v) && val(v) >= a;
    case 'lt': return (v) => has(v) && val(v) < a;
    case 'lte': return (v) => has(v) && val(v) <= a;
    case 'between': return (v) => has(v) && val(v) >= a && val(v) <= b;
    case 'notcontains': return (v) => !has(v) || !val(v).includes(a);
    case 'starts': return (v) => has(v) && val(v).startsWith(a);
    case 'ends': return (v) => has(v) && val(v).endsWith(a);
    default: return (v) => has(v) && val(v).includes(a);
  }
}
function dtFilterLabel(p, f) {
  if (f.mode === 'values') return `${p.name}: ${f.vals.slice(0, 3).join(', ')}${f.vals.length > 3 ? ` +${f.vals.length - 3}` : ''}`;
  const ops = Object.fromEntries(DT_OPS[p.kind === 'num' ? 'num' : p.kind === 'date' ? 'date' : 'text']);
  return `${p.name} ${ops[f.op] || f.op}${['null', 'notnull'].includes(f.op) ? '' : ` ${f.a}${f.op === 'between' ? ` – ${f.b}` : ''}`}`;
}

/* ---------- multi-select dropdown (checkbox list in a popover) ---------- */
function dtMulti(options, selected, onChange, label) {
  const chosen = new Set(selected);
  const wrapEl = el('div', { class: 'dt-multi' });
  const text = () => (!chosen.size ? '— none —' : chosen.size <= 2 ? [...chosen].join(', ') : `${chosen.size} selected`);
  const b = el('button', { type: 'button', class: 'dt-multi-btn', 'aria-haspopup': 'listbox', 'aria-label': label, title: [...chosen].join(', ') }, el('span', { class: 'dt-multi-t' }, text()), el('span', { class: 'dt-multi-car', 'aria-hidden': 'true' }, '▾'));
  wrapEl.append(b);
  let pop = null;
  const close = () => { if (pop) { pop.remove(); pop = null; document.removeEventListener('pointerdown', outside, true); onChange([...chosen]); } };
  const outside = (e) => { if (pop && !wrapEl.contains(e.target)) close(); };
  b.addEventListener('click', () => {
    if (pop) { close(); return; }
    pop = el('div', { class: 'dt-multi-pop', role: 'listbox', 'aria-multiselectable': 'true' },
      el('div', { class: 'dt-pop-sel' }, el('button', { type: 'button', onClick: () => { options.forEach((o) => chosen.add(o)); pop.querySelectorAll('input').forEach((i) => { i.checked = true; }); b.firstChild.textContent = text(); } }, 'Select all'),
        el('button', { type: 'button', onClick: () => { chosen.clear(); pop.querySelectorAll('input').forEach((i) => { i.checked = false; }); b.firstChild.textContent = text(); } }, 'Clear')),
      options.length ? options.map((o) => el('label', { class: 'dt-pop-item' }, el('input', { type: 'checkbox', checked: chosen.has(o), onChange: (e) => { if (e.target.checked) chosen.add(o); else chosen.delete(o); b.firstChild.textContent = text(); } }), el('span', { class: 'dt-pop-v' }, o)))
        : el('p', { class: 'muted small' }, 'No numeric columns'));
    pop.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); b.focus(); } });
    wrapEl.append(pop);
    setTimeout(() => document.addEventListener('pointerdown', outside, true), 0);
  });
  return wrapEl;
}

/* ---------- default chart for a result ---------- */
function dtDefaultChart(prof) {
  const meas = prof.filter((p) => p.role === 'measure');
  const dims = prof.filter((p) => p.role === 'dimension');
  const date = prof.find((p) => p.role === 'date');
  if (date && meas.length) return { type: 'line', x: date.name, ys: [meas[0].name], agg: 'sum', by: '', bins: 0 };
  if (dims.length && meas.length) return { type: 'bar', x: dims[0].name, ys: [meas[0].name], agg: 'sum', by: '', bins: 0 };
  if (meas.length >= 2) return { type: 'scatter', x: meas[0].name, ys: [meas[1].name], agg: 'none', by: '', bins: 0 };
  if (meas.length) return { type: 'hist', x: meas[0].name, ys: [], agg: 'count', by: '', bins: 0 };
  if (dims.length) return { type: 'count', x: dims[0].name, ys: [], agg: 'count', by: '', bins: 0 };
  return { type: 'count', x: prof[0] ? prof[0].name : '', ys: [], agg: 'count', by: '', bins: 0 };
}
const DT_CHARTS = {
  hist: { label: 'Histogram', group: 'One column', needs: 'x' },
  box: { label: 'Box plot', group: 'One column', needs: 'x' },
  count: { label: 'Count of values', group: 'One column', needs: 'x' },
  pie: { label: 'Pie (share)', group: 'One column', needs: 'x' },
  bar: { label: 'Bar', group: 'Two columns', needs: 'xy' },
  line: { label: 'Line', group: 'Two columns', needs: 'xy' },
  area: { label: 'Area', group: 'Two columns', needs: 'xy' },
  scatter: { label: 'Scatter (with trend)', group: 'Two columns', needs: 'xy' },
  boxby: { label: 'Box plot by group', group: 'Two columns', needs: 'xy' },
  heat: { label: 'Heatmap (count)', group: 'Two columns', needs: 'xy' },
};

function dtChartEl(holder, config, store) {
  const canvas = el('canvas', { role: 'img', 'aria-label': config.aria || 'chart' });
  holder.replaceChildren(canvas);
  if (store.chart) { store.chart.destroy(); store.chart = null; }
  Chart.defaults.font.family = '"IBM Plex Sans", system-ui, sans-serif';
  Chart.defaults.color = dtCss('--muted', '#56607A');
  Chart.defaults.borderColor = dtCss('--line', '#E1E6EF');
  store.chart = new Chart(canvas, config);
  return store.chart;
}
const dtAxis = (title, extra = {}) => ({ title: { display: !!title, text: title, font: { weight: '600' } }, grid: { color: dtCss('--chart-grid', '#EEF1F6') }, ...extra });

/* Build a Chart.js config for the chosen analysis. Returns {config, note} or {error}. */
function dtBuildChart(payload, prof, cfg) {
  const P = (name) => prof.find((p) => p.name === name);
  const X = P(cfg.x);
  if (!X) return { error: 'Choose a column for X.' };
  const col = (p) => payload.rows.map((r) => r[p.i]);
  const C = DB_SERIES_COLORS;
  const type = cfg.type;
  if (type === 'hist') {
    if (X.kind !== 'num') return { error: `${X.name} is not numeric — use “Count of values” for categories.` };
    const h = dtBins(X.sorted, cfg.bins);
    return { note: `mean ${dtShort(X.mean)} · median ${dtShort(X.median)} · std ${dtShort(X.sd)} · skew ${X.skew.toFixed(2)}`,
      config: { type: 'bar', data: { labels: h.labels, datasets: [{ label: `Rows`, data: h.counts, backgroundColor: C[0] + 'CC', barPercentage: 1, categoryPercentage: 1, borderColor: C[0], borderWidth: 1 }] },
        options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { display: false } },
          scales: { x: dtAxis(X.name, { ticks: { maxRotation: 45, autoSkip: true } }), y: dtAxis('Number of rows', { beginAtZero: true }) } } } };
  }
  if (type === 'count' || type === 'pie') {
    const top = X.top.slice(0, type === 'pie' ? 8 : 30);
    const other = X.n - X.missing - top.reduce((s, [, c]) => s + c, 0);
    const labels = top.map(([k]) => k).concat(other > 0 ? ['(other)'] : []).concat(X.missing ? ['(missing)'] : []);
    const data = top.map(([, c]) => c).concat(other > 0 ? [other] : []).concat(X.missing ? [X.missing] : []);
    if (type === 'pie') return { config: { type: 'doughnut', data: { labels, datasets: [{ data, backgroundColor: labels.map((_, i) => C[i % C.length]), borderColor: dtCss('--surface', '#fff'), borderWidth: 2 }] },
      options: { responsive: true, maintainAspectRatio: false, animation: false, cutout: '55%', plugins: { legend: { position: 'right' },
        tooltip: { callbacks: { label: (c) => `${c.label}: ${c.raw} (${((c.raw / X.n) * 100).toFixed(1)}%)` } } } } } };
    return { note: `${X.distinct} distinct values${X.distinct > 30 ? ' — top 30 shown' : ''}`,
      config: { type: 'bar', data: { labels, datasets: [{ label: 'Rows', data, backgroundColor: labels.map((_, i) => C[i % C.length]) }] },
        options: { indexAxis: labels.length > 8 ? 'y' : 'x', responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { display: false } },
          scales: labels.length > 8 ? { x: dtAxis('Number of rows', { beginAtZero: true }), y: dtAxis(X.name) } : { x: dtAxis(X.name), y: dtAxis('Number of rows', { beginAtZero: true }) } } } };
  }
  if (type === 'box' || type === 'boxby') {
    const Y = type === 'box' ? X : P(cfg.ys[0]);
    if (!Y || Y.kind !== 'num') return { error: 'Box plots need a numeric column (Y).' };
    let groups = [[Y.name, Y.sorted]];
    if (type === 'boxby') {
      const m = new Map();
      payload.rows.forEach((r) => { const g = dtFmt(r[X.i]) ?? '(missing)'; const v = r[Y.i]; if (dtNum(v)) { if (!m.has(g)) m.set(g, []); m.get(g).push(v); } });
      groups = [...m.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 20).map(([g, xs]) => [g, xs.sort((a, b) => a - b)]);
    }
    const st = groups.map(([g, xs]) => { const q1 = dtQuantile(xs, 0.25), q3 = dtQuantile(xs, 0.75), iqr = q3 - q1;
      const inside = xs.filter((v) => v >= q1 - 1.5 * iqr && v <= q3 + 1.5 * iqr);
      return { g, q1, q3, med: dtQuantile(xs, 0.5), lo: inside[0], hi: inside[inside.length - 1], out: xs.filter((v) => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr), n: xs.length }; });
    const labels = st.map((s) => s.g);
    return { note: type === 'box' ? `median ${dtShort(Y.median)} · IQR ${dtShort(Y.q1)}–${dtShort(Y.q3)} · ${Y.outliers} outlier${Y.outliers === 1 ? '' : 's'}` : `${labels.length} groups`,
      config: { type: 'bar', data: { labels, datasets: [
        { label: 'Whisker', data: st.map((s) => [s.lo, s.hi]), backgroundColor: dtCss('--muted', '#56607A'), barThickness: 2, grouped: false, order: 3 },
        { label: 'Middle 50% (Q1–Q3)', data: st.map((s) => [s.q1, s.q3]), backgroundColor: C[0] + '55', borderColor: C[0], borderWidth: 1.5, barPercentage: 0.5, grouped: false, order: 2 },
        { label: 'Median', type: 'scatter', data: st.map((s, i) => ({ x: labels[i], y: s.med })), pointStyle: 'line', pointRadius: Math.max(14, Math.min(60, 420 / Math.max(1, st.length))), borderWidth: 3, borderColor: '#E11D74', order: 1 },
        { label: 'Outliers', type: 'scatter', data: st.flatMap((s, i) => s.out.slice(0, 200).map((v) => ({ x: labels[i], y: v }))), pointRadius: 3, backgroundColor: '#F59E0B', order: 0 },
      ] },
      options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { position: 'bottom' },
        tooltip: { callbacks: { label: (c) => { const s = st[c.dataIndex]; if (!s) return ''; return c.dataset.label === 'Outliers' ? `outlier ${dtShort(c.raw.y)}`
          : `n=${s.n} · min ${dtShort(s.lo)} · Q1 ${dtShort(s.q1)} · median ${dtShort(s.med)} · Q3 ${dtShort(s.q3)} · max ${dtShort(s.hi)}`; } } } },
        scales: { x: dtAxis(type === 'boxby' ? X.name : ''), y: dtAxis(Y.name) } } } };
  }
  if (type === 'scatter') {
    const Y = P(cfg.ys[0]);
    if (!Y || X.kind !== 'num' || Y.kind !== 'num') return { error: 'Scatter needs two numeric columns (X and Y).' };
    const G = cfg.by ? P(cfg.by) : null;
    const pts = payload.rows.filter((r) => dtNum(r[X.i]) && dtNum(r[Y.i]));
    const r = dtPearson(pts.map((p) => p[X.i]), pts.map((p) => p[Y.i]));
    const xs = pts.map((p) => p[X.i]), ys = pts.map((p) => p[Y.i]);
    const mx = xs.reduce((s, v) => s + v, 0) / (xs.length || 1), my = ys.reduce((s, v) => s + v, 0) / (ys.length || 1);
    const slope = xs.reduce((s, v, i) => s + (v - mx) * (ys[i] - my), 0) / (xs.reduce((s, v) => s + (v - mx) ** 2, 0) || 1);
    const groups = G ? [...new Set(pts.map((p) => dtFmt(p[G.i]) ?? '(missing)'))].slice(0, 10) : [''];
    const ds = groups.map((g, k) => ({ label: G ? g : `${Y.name} vs ${X.name}`, data: pts.filter((p) => !G || (dtFmt(p[G.i]) ?? '(missing)') === g).slice(0, 5000).map((p) => ({ x: p[X.i], y: p[Y.i] })),
      backgroundColor: C[k % C.length] + 'AA', pointRadius: pts.length > 1500 ? 2 : 4 }));
    ds.push({ label: 'Trend', type: 'line', data: [{ x: X.min, y: my + slope * (X.min - mx) }, { x: X.max, y: my + slope * (X.max - mx) }], borderColor: '#64748B', borderDash: [6, 5], borderWidth: 2, pointRadius: 0 });
    const strength = r == null ? '' : Math.abs(r) >= 0.7 ? 'strong' : Math.abs(r) >= 0.4 ? 'moderate' : Math.abs(r) >= 0.2 ? 'weak' : 'no clear';
    return { note: r == null ? '' : `correlation r = ${r.toFixed(3)} — ${strength}${r > 0 && Math.abs(r) >= 0.2 ? ' positive' : r < 0 && Math.abs(r) >= 0.2 ? ' negative' : ''} relationship`,
      config: { type: 'scatter', data: { datasets: ds }, options: { responsive: true, maintainAspectRatio: false, animation: false,
        plugins: { legend: { display: !!G, position: 'bottom' } }, scales: { x: dtAxis(X.name, { type: 'linear' }), y: dtAxis(Y.name) } } } };
  }
  if (type === 'heat') {
    const Y = P(cfg.ys[0]);
    if (!Y) return { error: 'Choose a second column (Y).' };
    const xv = X.top.slice(0, 15).map(([k]) => k), yv = Y.top.slice(0, 15).map(([k]) => k);
    const m = new Map();
    payload.rows.forEach((r) => { const a = dtFmt(r[X.i]), b = dtFmt(r[Y.i]); if (xv.includes(a) && yv.includes(b)) m.set(`${a}|${b}`, (m.get(`${a}|${b}`) || 0) + 1); });
    const max = Math.max(1, ...m.values());
    return { note: 'Darker = more rows. Top 15 values of each column.', heat: { xv, yv, m, max, xName: X.name, yName: Y.name } };
  }
  // bar / line / area: X against one or more Y (aggregated), optional colour-by group
  const Ys = cfg.ys.map(P).filter((p) => p && p.kind === 'num');
  const agg = cfg.agg || 'sum';
  if (!Ys.length && agg !== 'count') return { error: 'Pick at least one numeric Y column (or Aggregate = Count).' };
  const G = cfg.by ? P(cfg.by) : null;
  const keyOf = (v) => (X.kind === 'date' ? String(v ?? '').slice(0, 10) : dtFmt(v) ?? '(missing)');
  const reducer = { sum: (a) => a.reduce((s, v) => s + v, 0), avg: (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : null), count: (a) => a.length,
    min: (a) => (a.length ? Math.min(...a) : null), max: (a) => (a.length ? Math.max(...a) : null), median: (a) => dtQuantile(a.slice().sort((x, y) => x - y), 0.5), none: (a) => (a.length ? a[0] : null) }[agg];
  const groups = new Map();
  for (const r of payload.rows) {
    const k = keyOf(r[X.i]);
    const sk = G ? dtFmt(r[G.i]) ?? '(missing)' : '';
    if (!groups.has(k)) groups.set(k, new Map());
    const g = groups.get(k);
    const series = G ? [[sk, Ys[0]]] : (Ys.length ? Ys.map((y) => [y.name, y]) : [['count', null]]);
    for (const [name, y] of series) { if (!g.has(name)) g.set(name, []); const v = y ? r[y.i] : 1; if (agg === 'count' ? v != null : dtNum(v)) g.get(name).push(agg === 'count' ? 1 : v); }
  }
  let labels = [...groups.keys()];
  if (X.kind === 'num') labels.sort((a, b) => Number(String(a).replace(/,/g, '')) - Number(String(b).replace(/,/g, '')));
  else if (X.kind === 'date' || type !== 'bar') labels.sort();
  const names = G ? [...new Set(payload.rows.map((r) => dtFmt(r[G.i]) ?? '(missing)'))].slice(0, 10) : (Ys.length ? Ys.map((y) => y.name) : ['count']);
  if (type === 'bar' && !G && labels.length > 1 && X.kind !== 'date' && X.kind !== 'num') {
    const tot = (l) => [...groups.get(l).values()].reduce((s, a) => s + (reducer(a) || 0), 0);
    labels.sort((a, b) => tot(b) - tot(a));
  }
  if (labels.length > 200 && type === 'bar') labels = labels.slice(0, 200);
  const t = type === 'area' ? 'line' : type;
  const single = names.length === 1;
  const ds = names.map((nm, k) => ({ label: agg === 'none' || agg === 'count' ? nm : `${agg}(${nm})`, data: labels.map((l) => { const a = (groups.get(l).get(nm)) || []; return a.length ? reducer(a) : null; }),
    backgroundColor: t === 'bar' && single && X.kind !== 'date' ? labels.map((_, i) => C[i % C.length]) : (type === 'area' ? C[k % C.length] + '33' : C[k % C.length]),
    borderColor: C[k % C.length], borderWidth: t === 'line' ? 2 : 0, fill: type === 'area', tension: 0.25, spanGaps: true, pointRadius: labels.length > 80 ? 0 : 3, maxBarThickness: 56, borderRadius: t === 'bar' ? 4 : 0 }));
  return { note: `${labels.length} ${X.name} value${labels.length === 1 ? '' : 's'}${agg !== 'none' ? ` · ${agg}` : ''}`,
    config: { type: t, data: { labels, datasets: ds }, options: { responsive: true, maintainAspectRatio: false, animation: false, interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: ds.length > 1, position: 'bottom' } },
      scales: { x: dtAxis(X.name, { ticks: { maxRotation: 45, autoSkip: true } }), y: dtAxis(Ys.length === 1 ? (agg === 'none' ? Ys[0].name : `${agg} of ${Ys[0].name}`) : (agg === 'count' ? 'Number of rows' : ''), { beginAtZero: type !== 'line' }) } } } };
}

function dtHeatmap(h) {
  const tbl = el('table', { class: 'dt-heat' }, el('thead', {}, el('tr', {}, el('th', {}, `${h.yName} ↓ / ${h.xName} →`), h.xv.map((x) => el('th', { title: x }, x)))),
    el('tbody', {}, h.yv.map((y) => el('tr', {}, el('th', { title: y }, y), h.xv.map((x) => { const c = h.m.get(`${x}|${y}`) || 0; const a = c / h.max;
      return el('td', { style: `background:rgba(10,92,255,${(0.08 + a * 0.85).toFixed(2)});color:${a > 0.55 ? '#fff' : 'inherit'}`, title: `${x} × ${y}: ${c}` }, c || ''); })))));
  return el('div', { class: 'dt-heat-wrap' }, tbl);
}

/* ================= the viewer ================= */
function renderTableOutput(payload, meta = {}, onChange = null) {
  const state = meta.databridge || (meta.databridge = {});
  const prof = dtProfile(payload);
  state.view = ['table', 'chart', 'eda'].includes(state.view) ? state.view : 'table';
  if (!state.chart || !payload.columns.includes(state.chart.x) || !DT_CHARTS[state.chart.type]) state.chart = dtDefaultChart(prof);
  state.widths = state.widths || {};
  const save = () => { if (onChange) onChange(); };
  const store = { chart: null };
  const T = { sortCol: null, sortDir: 1, filters: {}, search: '', limit: 200 };

  const wrap = el('div', { class: 'dbt' });
  const body = el('div', { class: 'dbt-body' });
  const tabs = el('div', { class: 'dbt-tabs', role: 'tablist' });
  const info = el('span', { class: 'muted dt-info' });
  const slot = el('div', { class: 'dbt-slot' });          // per-view controls in the tab bar (e.g. table search)
  const bar = el('div', { class: 'dbt-bar' }, tabs, slot, el('span', { class: 'grow' }), info,
    btn('', () => download('display_result.csv', toCsv({ columns: payload.columns, rows: filteredRows().map(([, r]) => r) })), { cls: 'ghost icon sm', ic: 'download', title: 'Download CSV (current filters)' }),
    meta.__full ? null : btn('', () => openFull(), { cls: 'ghost icon sm', ic: 'ext', title: 'Expand to full screen' }));
  function openFull() {
    const shade = el('div', { class: 'dt-full', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Result viewer' });
    const inner = renderTableOutput(payload, Object.assign(meta, { __full: true }), onChange);
    delete meta.__full;
    const close = () => { shade.remove(); document.removeEventListener('keydown', esc, true); drawTabs(); draw(); };
    const esc = (e) => { if (e.key === 'Escape' && !document.querySelector('.dt-full .dt-pop')) { e.stopPropagation(); close(); } };
    shade.append(el('div', { class: 'dt-full-box' }, el('div', { class: 'dt-full-head' }, el('b', {}, 'Result viewer'), el('span', { class: 'muted small' }, 'Esc to close'), el('span', { class: 'grow' }),
      btn('Close', close, { cls: 'sm', ic: 'x' })), inner));
    document.body.append(shade);
    document.addEventListener('keydown', esc, true);
  }
  wrap.append(bar, body);
  const rowsInfo = (shown) => { info.textContent = `${shown != null && shown !== payload.rows.length ? `${shown.toLocaleString()} of ` : ''}${payload.rows.length.toLocaleString()} row${payload.rows.length === 1 ? '' : 's'}${payload.truncated ? ` (first ${payload.limit.toLocaleString()})` : ''}`; };

  function drawTabs() {
    tabs.replaceChildren(...[['table', 'Table'], ['chart', 'Chart'], ['eda', 'EDA']].map(([k, label]) => el('button', {
      type: 'button', role: 'tab', 'aria-selected': String(state.view === k),
      onClick: () => { state.view = k; save(); drawTabs(); draw(); } }, label)));
  }

  /* ---------- table ---------- */
  function filteredRows() {
    const fns = Object.entries(T.filters).filter(([, f]) => f).map(([ci, f]) => [Number(ci), dtCondFn(f, prof[ci].kind)]);
    const q = T.search.toLowerCase();
    let rows = payload.rows.map((r, i) => [i, r]).filter(([, r]) => fns.every(([ci, f]) => f(r[ci])) && (!q || r.some((v) => v != null && dtFmt(v).toLowerCase().includes(q))));
    if (T.sortCol !== null) {
      const ci = T.sortCol, num = prof[ci].kind === 'num';
      rows.sort((a, b) => { const x = a[1][ci], y = b[1][ci]; if (x == null) return 1; if (y == null) return -1; return (num ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true })) * T.sortDir; });
    }
    return rows;
  }
  function autoWidth(p) {
    const sample = payload.rows.slice(0, 300).map((r) => (dtFmt(r[p.i]) || 'null').length);
    const longest = Math.max(p.name.length + 4, ...sample.length ? [Math.max(...sample)] : [4]);
    return Math.round(Math.min(380, Math.max(p.kind === 'num' ? 80 : 90, longest * 8.2 + 26)));
  }
  function drawTable() {
    const searchIn = el('input', { class: 'dt-search', type: 'search', placeholder: 'Search all columns…', value: T.search, 'aria-label': 'Search rows' });
    let st;
    searchIn.addEventListener('input', () => { clearTimeout(st); st = setTimeout(() => { T.search = searchIn.value; T.limit = 200; drawRows(); drawChips(); }, 200); });
    const chips = el('div', { class: 'dt-chips-bar' });
    const tools = el('div', { class: 'dt-tools' }, chips);
    slot.replaceChildren(searchIn);
    function drawChips() {
      const active = Object.entries(T.filters).filter(([, f]) => f);
      tools.hidden = !active.length;
      chips.replaceChildren(...active.map(([ci, f]) => el('span', { class: 'dt-fchip' },
        el('button', { type: 'button', class: 'dt-fchip-t', title: 'Edit filter', onClick: (e) => openFilter(prof[ci], e.currentTarget) }, dtFilterLabel(prof[ci], f)),
        el('button', { type: 'button', class: 'dt-fchip-x', 'aria-label': `Remove filter on ${prof[ci].name}`, onClick: () => { delete T.filters[ci]; T.limit = 200; drawTable(); } }, '×'))),
      ...(active.length > 1 || (active.length && T.search) ? [btn('Clear all', () => { T.filters = {}; T.search = ''; drawTable(); }, { cls: 'sm ghost' })] : []));
    }
    const cols = el('colgroup', {}, el('col', { style: 'width:46px' }), prof.map((p) => el('col', { style: `width:${state.widths[p.name] || autoWidth(p)}px` })));
    const head = el('tr', {}, el('th', { class: 'idx' }, '#'), prof.map((p) => {
      const on = !!T.filters[p.i];
      const funnel = el('button', { type: 'button', class: `dt-funnel-btn${on ? ' on' : ''}`, title: on ? 'Edit filter' : `Filter ${p.name}`, 'aria-label': `Filter ${p.name}` });
      funnel.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18l-7 8v6l-4 2v-8z"/></svg>';
      funnel.addEventListener('click', (e) => { e.stopPropagation(); openFilter(p, funnel); });
      const th = el('th', { class: `dt-th k-${p.kind}${on ? ' filtered' : ''}`, title: `${p.name} · ${p.type} · ${DT_ROLE[p.role]} — click to sort` },
        el('span', { class: 'dt-th-in' },
          el('span', { class: `dt-type k-${p.kind}`, 'aria-hidden': 'true' }, p.kind === 'num' ? '123' : p.kind === 'date' ? 'DATE' : p.kind === 'bool' ? 'T/F' : 'Abc'),
          el('span', { class: 'dt-colname' }, p.name), T.sortCol === p.i ? el('span', { class: 'dt-sort' }, T.sortDir > 0 ? '▲' : '▼') : null, funnel),
        el('span', { class: 'dt-resize', title: 'Drag to resize · double-click to fit' }));
      th.addEventListener('click', (e) => { if (e.target.closest('.dt-resize, .dt-funnel-btn')) return; if (T.sortCol === p.i) T.sortDir = -T.sortDir; else { T.sortCol = p.i; T.sortDir = 1; } drawTable(); });
      const handle = th.querySelector('.dt-resize');
      handle.addEventListener('pointerdown', (e) => {
        e.preventDefault(); e.stopPropagation(); handle.setPointerCapture(e.pointerId);
        const colEl = cols.children[p.i + 1], start = e.clientX, w0 = th.getBoundingClientRect().width;
        const move = (ev) => { const w = Math.max(60, Math.round(w0 + ev.clientX - start)); colEl.style.width = `${w}px`; state.widths[p.name] = w; };
        const up = () => { handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', up); save(); };
        handle.addEventListener('pointermove', move); handle.addEventListener('pointerup', up);
      });
      handle.addEventListener('dblclick', (e) => { e.stopPropagation(); delete state.widths[p.name]; cols.children[p.i + 1].style.width = `${autoWidth(p)}px`; save(); });
      return th;
    }));
    /* the filter panel */
    function openFilter(p, anchor) {
      wrap.querySelectorAll('.dt-pop').forEach((x) => x.remove());
      const cur = T.filters[p.i];
      const kind = p.kind === 'num' ? 'num' : p.kind === 'date' ? 'date' : 'text';
      const canValues = p.distinct <= 500;
      let mode = cur ? cur.mode : (canValues && (p.role === 'dimension' || p.kind === 'bool' || p.kind === 'text') ? 'values' : 'cond');   // dates & numbers: conditions
      const pop = el('div', { class: 'dt-pop', role: 'dialog', 'aria-label': `Filter ${p.name}` });
      const counts = new Map();
      for (const r of payload.rows) { const k = r[p.i] == null || r[p.i] === '' ? '(empty)' : String(r[p.i]); counts.set(k, (counts.get(k) || 0) + 1); }
      const allVals = [...counts.entries()].sort((a, b) => (kind === 'num' ? Number(a[0]) - Number(b[0]) : a[0].localeCompare(b[0], undefined, { numeric: true })));
      const chosen = new Set(cur && cur.mode === 'values' ? cur.vals : allVals.map(([k]) => k));
      const bodyEl = el('div', { class: 'dt-pop-body' });
      const tabsEl = el('div', { class: 'dt-pop-tabs', role: 'tablist' });
      const drawTabsP = () => tabsEl.replaceChildren(...[canValues ? ['values', 'Values'] : null, ['cond', 'Condition']].filter(Boolean).map(([k, l]) =>
        el('button', { type: 'button', role: 'tab', 'aria-selected': String(mode === k), onClick: () => { mode = k; drawTabsP(); drawBody(); } }, l)));
      let condOp = cur && cur.mode === 'cond' ? cur.op : (kind === 'text' ? 'contains' : kind === 'num' ? 'gt' : 'gt');
      let ia, ib;
      function drawBody() {
        if (mode === 'values') {
          const q = el('input', { class: 'dt-pop-search', type: 'search', placeholder: `Search ${allVals.length.toLocaleString()} values…`, 'aria-label': 'Search values' });
          const list = el('div', { class: 'dt-pop-list' });
          const drawList = () => {
            const f = q.value.toLowerCase();
            const items = allVals.filter(([k]) => !f || k.toLowerCase().includes(f)).slice(0, 400);
            list.replaceChildren(...items.map(([k, c]) => el('label', { class: 'dt-pop-item' },
              el('input', { type: 'checkbox', checked: chosen.has(k), onChange: (e) => { if (e.target.checked) chosen.add(k); else chosen.delete(k); } }),
              el('span', { class: `dt-pop-v${k === '(empty)' ? ' muted' : ''}` }, k), el('span', { class: 'dt-pop-c' }, c.toLocaleString()))));
          };
          q.addEventListener('input', drawList); drawList();
          bodyEl.replaceChildren(q, el('div', { class: 'dt-pop-sel' },
            el('button', { type: 'button', onClick: () => { allVals.forEach(([k]) => { if (!q.value || k.toLowerCase().includes(q.value.toLowerCase())) chosen.add(k); }); drawList(); } }, 'Select all'),
            el('button', { type: 'button', onClick: () => { allVals.forEach(([k]) => { if (!q.value || k.toLowerCase().includes(q.value.toLowerCase())) chosen.delete(k); }); drawList(); } }, 'Clear')), list);
          setTimeout(() => q.focus(), 0);
        } else {
          const opSel = el('select', { class: 'dt-pop-op', 'aria-label': 'Condition' }, DT_OPS[kind].map(([k, l]) => el('option', { value: k, selected: k === condOp }, l)));
          const itype = kind === 'num' ? 'number' : kind === 'date' ? 'date' : 'text';
          ia = el('input', { class: 'dt-pop-in', type: itype, value: cur && cur.mode === 'cond' ? cur.a ?? '' : '', placeholder: kind === 'num' ? dtShort(p.min) : 'value', 'aria-label': 'Value' });
          ib = el('input', { class: 'dt-pop-in', type: itype, value: cur && cur.mode === 'cond' ? cur.b ?? '' : '', placeholder: kind === 'num' ? dtShort(p.max) : 'to', 'aria-label': 'Second value' });
          const inputs = el('div', { class: 'dt-pop-ins' });
          const drawInputs = () => inputs.replaceChildren(...(['null', 'notnull'].includes(condOp) ? [] : condOp === 'between' ? [ia, el('span', { class: 'muted' }, 'and'), ib] : [ia]));
          opSel.addEventListener('change', () => { condOp = opSel.value; drawInputs(); });
          drawInputs();
          [ia, ib].forEach((x) => x.addEventListener('keydown', (e) => { if (e.key === 'Enter') apply(); }));
          bodyEl.replaceChildren(opSel, inputs, kind === 'num' ? el('p', { class: 'muted small' }, `Range in data: ${dtShort(p.min)} – ${dtShort(p.max)}`) : kind === 'date' ? el('p', { class: 'muted small' }, `Range in data: ${p.min} – ${p.max}`) : null);
          setTimeout(() => ia.focus(), 0);
        }
      }
      function apply() {
        if (mode === 'values') {
          if (chosen.size === allVals.length || !chosen.size) delete T.filters[p.i];
          else T.filters[p.i] = { mode: 'values', vals: [...chosen] };
        } else {
          const a = ia ? ia.value : '', b = ib ? ib.value : '';
          if (!['null', 'notnull'].includes(condOp) && a === '') { ia.focus(); return; }
          T.filters[p.i] = { mode: 'cond', op: condOp, a, b };
        }
        close(); T.limit = 200; drawTable();
      }
      function close() { pop.remove(); document.removeEventListener('pointerdown', outside, true); document.removeEventListener('keydown', esc, true); }
      const outside = (e) => { if (!pop.contains(e.target) && !e.target.closest('.dt-funnel-btn, .dt-fchip-t')) close(); };
      const esc = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
      pop.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); anchor.focus && anchor.focus(); } });
      pop.append(el('div', { class: 'dt-pop-head' }, el('span', { class: `dt-type k-${p.kind}` }, p.kind === 'num' ? '123' : p.kind === 'date' ? 'DATE' : 'Abc'), el('b', {}, p.name),
        el('span', { class: 'muted small' }, `${p.distinct.toLocaleString()} distinct`)), tabsEl, bodyEl,
      el('div', { class: 'dt-pop-foot' }, cur ? btn('Remove filter', () => { delete T.filters[p.i]; close(); drawTable(); }, { cls: 'sm ghost' }) : el('span'),
        el('span', { class: 'grow' }), btn('Cancel', close, { cls: 'sm' }), btn('Apply', apply, { cls: 'sm primary' })));
      drawTabsP(); drawBody();
      wrap.append(pop);
      const wr = wrap.getBoundingClientRect(), ar = anchor.getBoundingClientRect();
      const left = Math.max(8, Math.min(ar.left - wr.left - 120, wr.width - 300));
      pop.style.left = `${left}px`; pop.style.top = `${ar.bottom - wr.top + 6}px`;
      setTimeout(() => { document.addEventListener('pointerdown', outside, true); document.addEventListener('keydown', esc, true); }, 0);
    }
    const tbody = el('tbody');
    const more = el('div', { class: 'dt-more' });
    const table = el('table', { class: 'dt-table' }, cols, el('thead', {}, head), tbody);
    function drawRows() {
      const rows = filteredRows();
      rowsInfo(rows.length);
      const frag = document.createDocumentFragment();
      rows.slice(0, T.limit).forEach(([i, r], n) => {
        const tr = document.createElement('tr');
        const td0 = document.createElement('td'); td0.className = 'idx'; td0.textContent = n + 1; tr.append(td0);
        prof.forEach((p) => {
          const td = document.createElement('td');
          const v0 = r[p.i];
          const t = p.role === 'id' && v0 != null ? String(v0) : dtFmt(v0);      // IDs/codes without thousands separators
          td.className = `k-${p.kind}${t === null ? ' null' : ''}`;
          td.textContent = t === null ? 'null' : t;
          if (t && t.length > 30) td.title = t;
          tr.append(td);
        });
        frag.append(tr);
      });
      tbody.replaceChildren(frag);
      if (!rows.length) tbody.append(el('tr', {}, el('td', { colspan: prof.length + 1, class: 'dt-empty' }, 'No rows match the filters.')));
      more.replaceChildren(...(rows.length > T.limit ? [btn(`Show ${Math.min(500, rows.length - T.limit)} more of ${(rows.length - T.limit).toLocaleString()}`, () => { T.limit += 500; drawRows(); }, { cls: 'sm' })] : []));
    }
    body.replaceChildren(tools, el('div', { class: 'dt-scroll' }, table), more);
    drawRows();
    drawChips();
  }

  /* ---------- chart ---------- */
  function drawChart() {
    rowsInfo(null);
    const cfg = state.chart;
    const meta2 = DT_CHARTS[cfg.type];
    const field = (label, node) => el('label', { class: 'dt-field' }, el('span', {}, label), node);
    const sel = (options, value, onchange, label, empty) => {
      const grouped = options.some((o) => o[2]);
      const opts = grouped
        ? ['measure', 'dimension', 'date', 'id', 'text'].map((r) => { const g = options.filter((o) => o[2] === r); return g.length ? el('optgroup', { label: `${DT_ROLE[r]}s` }, g.map(([v, t]) => el('option', { value: v, selected: v === value }, t))) : null; })
        : options.map(([v, t]) => el('option', { value: v, selected: v === value }, t));
      const s = el('select', { 'aria-label': label, title: value || '' }, empty ? el('option', { value: '' }, empty) : null, opts);
      s.addEventListener('change', () => { onchange(s.value); save(); drawChart(); });
      return s;
    };
    const colOpt = (filter) => prof.filter(filter || (() => true)).map((p) => [p.name, p.name, p.role]);
    const typeSel = el('select', { 'aria-label': 'Chart type' }, ['One column', 'Two columns'].map((g) => el('optgroup', { label: g === 'One column' ? 'Univariate (one column)' : 'Bivariate (two columns)' },
      Object.entries(DT_CHARTS).filter(([, v]) => v.group === g).map(([k, v]) => el('option', { value: k, selected: k === cfg.type }, v.label)))));
    typeSel.addEventListener('change', () => {
      cfg.type = typeSel.value;
      const P = (n) => prof.find((p) => p.name === n);
      if (['hist', 'box'].includes(cfg.type) && (!P(cfg.x) || P(cfg.x).kind !== 'num')) cfg.x = (prof.find((p) => p.role === 'measure') || prof[0]).name;
      if (['bar', 'line', 'area', 'boxby', 'scatter', 'heat'].includes(cfg.type) && !cfg.ys.length) {
        const m = prof.find((p) => p.role === 'measure' && p.name !== cfg.x); if (m) cfg.ys = [m.name];
      }
      if (cfg.type === 'scatter' && P(cfg.x) && P(cfg.x).kind !== 'num') cfg.x = (prof.find((p) => p.role === 'measure') || prof[0]).name;
      if (['line', 'area'].includes(cfg.type)) { const d = prof.find((p) => p.role === 'date'); if (d && P(cfg.x) && P(cfg.x).role !== 'date') cfg.x = d.name; }
      if (['bar', 'boxby', 'pie', 'count'].includes(cfg.type) && P(cfg.x) && ['measure', 'id'].includes(P(cfg.x).role)) {
        const dim = prof.find((p) => p.role === 'dimension') || prof.find((p) => p.role === 'date'); if (dim) cfg.x = dim.name;
      }
      if (cfg.ys.includes(cfg.x)) cfg.ys = cfg.ys.filter((y) => y !== cfg.x);
      if (['bar', 'line', 'area'].includes(cfg.type) && !cfg.ys.length) { const m = prof.find((p) => p.role === 'measure' && p.name !== cfg.x); if (m) cfg.ys = [m.name]; }
      if (['bar', 'line', 'area'].includes(cfg.type) && (cfg.agg === 'none' || !cfg.agg)) cfg.agg = 'sum';
      save(); drawChart();
    });
    const numCols = prof.filter((p) => p.kind === 'num');
    const parts = [field('Analysis', typeSel), field(meta2.needs === 'x' ? 'Column' : 'X axis', sel(colOpt(['hist', 'box'].includes(cfg.type) ? (p) => p.kind === 'num' : null), cfg.x, (v) => { cfg.x = v; }, 'X axis'))];
    if (cfg.type === 'hist') parts.push(field('Bins', sel([[0, 'Auto'], [5, '5'], [10, '10'], [20, '20'], [30, '30'], [50, '50']].map(([v, t]) => [String(v), t]), String(cfg.bins || 0), (v) => { cfg.bins = Number(v); }, 'Bins')));
    if (['scatter', 'boxby', 'heat'].includes(cfg.type)) parts.push(field('Y axis', sel(colOpt(cfg.type === 'heat' ? null : (p) => p.kind === 'num'), cfg.ys[0], (v) => { cfg.ys = [v]; }, 'Y axis', '— choose —')));
    if (['bar', 'line', 'area'].includes(cfg.type)) {
      parts.push(field('Aggregate', sel([['sum', 'Sum'], ['avg', 'Average'], ['median', 'Median'], ['count', 'Count rows'], ['min', 'Min'], ['max', 'Max'], ['none', 'None (first value)']], cfg.agg || 'sum', (v) => { cfg.agg = v; }, 'Aggregate')));
      parts.push(field('Y values', dtMulti(numCols.map((p) => p.name), cfg.ys, (vals) => { cfg.ys = vals; save(); drawChart(); }, 'Y values')));
    }
    if (['bar', 'line', 'area', 'scatter'].includes(cfg.type)) parts.push(field('Colour by', sel(colOpt((p) => p.role === 'dimension'), cfg.by || '', (v) => { cfg.by = v; }, 'Colour by', '— none —')));
    const controls = el('div', { class: 'dbt-controls' }, ...parts);
    const note = el('div', { class: 'dt-note' });
    const box = el('div', { class: 'dbt-canvas' });
    body.replaceChildren(controls, note, box);
    if (typeof Chart === 'undefined') { box.append(el('p', { class: 'muted' }, 'Chart library failed to load.')); return; }
    let built;
    try { built = dtBuildChart(payload, prof, cfg); } catch (e) { built = { error: `Could not draw this chart: ${e.message}` }; }
    if (built.error) { box.replaceChildren(el('p', { class: 'muted dt-msg' }, built.error)); return; }
    note.textContent = built.note || '';
    if (built.heat) { box.classList.add('auto'); box.replaceChildren(dtHeatmap(built.heat)); return; }
    box.classList.remove('auto');
    dtChartEl(box, built.config, store);
  }

  /* ---------- EDA ---------- */
  function spark(p) {
    const W = 120, H = 30;
    let vals = [];
    if (p.kind === 'num' && p.sorted && p.sorted.length) vals = dtBins(p.sorted, 14).counts;
    else vals = p.top.slice(0, 8).map(([, c]) => c);
    const mx = Math.max(1, ...vals);
    const bw = vals.length ? W / vals.length : W;
    const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">${vals.map((v, i) => `<rect x="${(i * bw + 0.5).toFixed(1)}" y="${(H - (v / mx) * H).toFixed(1)}" width="${Math.max(1, bw - 1.5).toFixed(1)}" height="${((v / mx) * H).toFixed(1)}" rx="1" fill="${p.kind === 'num' ? '#0A5CFF' : '#12B5CB'}"/>`).join('')}</svg>`;
    const d = el('span', { class: 'dt-spark' }); d.innerHTML = svg; return d;
  }
  function drawEda() {
    rowsInfo(null);
    const n = payload.rows.length;
    const cells = n * prof.length;
    const missingCells = prof.reduce((s, p) => s + p.missing, 0);
    const keys = new Set(payload.rows.map((r) => JSON.stringify(r)));
    const dup = n - keys.size;
    const count = (role) => prof.filter((p) => p.role === role).length;
    const cards = el('div', { class: 'eda-cards' },
      [['Rows', n.toLocaleString()], ['Columns', prof.length], ['Measures', count('measure')], ['Dimensions', count('dimension')], ['Dates', count('date')], ['IDs / text', count('id') + count('text')],
        ['Missing cells', `${cells ? ((missingCells / cells) * 100).toFixed(1) : 0}%`], ['Duplicate rows', dup.toLocaleString()]]
        .map(([k, v]) => el('div', { class: 'eda-card' }, el('b', {}, String(v)), el('span', {}, k))));
    const detail = el('div', { class: 'eda-detail' });
    // data-quality alerts
    const alerts = [];
    if (dup) alerts.push(['warn', `${dup.toLocaleString()} duplicate row${dup === 1 ? '' : 's'}`, 'Exact copies of another row — check joins or loads.']);
    for (const p of prof) {
      if (p.missingPct >= 0.2) alerts.push(['warn', `${p.name}: ${(p.missingPct * 100).toFixed(0)}% missing`, 'Consider filling, filtering or excluding it.']);
      else if (p.missing) alerts.push(['info', `${p.name}: ${p.missing.toLocaleString()} missing`, `${(p.missingPct * 100).toFixed(1)}% of rows are empty.`]);
      if (p.distinct === 1 && n > 1) alerts.push(['warn', `${p.name} is constant`, `Every row is “${p.top[0] ? p.top[0][0] : ''}” — it adds no information.`]);
      if (p.role === 'measure' && p.outliers && p.outliers / Math.max(1, n - p.missing) >= 0.05) alerts.push(['info', `${p.name}: ${p.outliers} outliers`, 'Values far outside the typical range (1.5×IQR).']);
      if (p.role === 'measure' && Math.abs(p.skew || 0) > 1) alerts.push(['info', `${p.name} is skewed`, `${p.skew > 0 ? 'A few very large values pull the average up' : 'A few very small values pull the average down'} — the median (${dtShort(p.median)}) is more typical than the mean (${dtShort(p.mean)}).`]);
      if (p.role === 'dimension' && p.top[0] && p.top[0][1] / Math.max(1, n - p.missing) >= 0.8 && p.distinct > 1) alerts.push(['info', `${p.name} is imbalanced`, `“${p.top[0][0]}” is ${((p.top[0][1] / (n - p.missing)) * 100).toFixed(0)}% of rows.`]);
      if (p.role === 'dimension' && p.distinct > 50) alerts.push(['info', `${p.name} has many categories (${p.distinct})`, 'Charts will show only the most common values.']);
    }
    const alertBox = alerts.length ? el('div', { class: 'eda-alerts' }, alerts.slice(0, 12).map(([lv, t, d]) => el('div', { class: `eda-alert ${lv}` }, el('b', {}, t), el('span', {}, d))))
      : el('div', { class: 'eda-alerts' }, el('div', { class: 'eda-alert ok' }, el('b', {}, 'No data-quality issues found'), el('span', {}, 'No missing values, duplicates, constant or heavily skewed columns.')));
    const colSearch = el('input', { class: 'dt-search', type: 'search', placeholder: `Search ${prof.length} columns…`, 'aria-label': 'Search columns' });
    const profileCsv = () => download('profile.csv', toCsv({ columns: ['column', 'type', 'role', 'missing', 'missing_pct', 'distinct', 'min', 'mean', 'median', 'max', 'std', 'top_value', 'top_count'],
      rows: prof.map((p) => [p.name, p.type, DT_ROLE[p.role], p.missing, +(p.missingPct * 100).toFixed(2), p.distinct, p.min ?? '', p.mean ?? '', p.median ?? '', p.max ?? '', p.sd ?? '', p.top[0] ? p.top[0][0] : '', p.top[0] ? p.top[0][1] : '']) }));
    const statsOf = (p) => (p.role === 'id' ? `${p.distinct === p.n - p.missing ? 'all unique' : `${(p.n - p.missing - p.distinct).toLocaleString()} repeated`}${p.kind === 'num' ? ` · ${p.min}–${p.max}` : ''}`
      : p.kind === 'num' ? `min ${dtShort(p.min)} · mean ${dtShort(p.mean)} · max ${dtShort(p.max)}`
      : p.kind === 'date' ? `${p.min || '—'} → ${p.max || '—'}` : p.top[0] ? `top: ${p.top[0][0].slice(0, 24)} (${p.top[0][1]})` : '—');
    const table = el('table', { class: 'dt-table eda-cols' },
      el('thead', {}, el('tr', {}, ['Column', 'Kind', 'Missing', 'Distinct', 'Summary', 'Distribution'].map((h) => el('th', {}, h)))),
      el('tbody', {}, prof.map((p) => {
        const tr = el('tr', { class: 'eda-row', tabindex: '0', title: 'Click for full analysis' },
          el('td', { title: p.type }, el('b', {}, p.name)), el('td', { title: `${p.type} · ${DT_ROLE[p.role]}` }, el('span', { class: `eda-role r-${p.role}` }, DT_ROLE[p.role])),
          el('td', { class: 'k-num' }, p.missing ? el('span', { class: p.missingPct > 0.2 ? 'eda-warn' : '' }, `${(p.missingPct * 100).toFixed(1)}%`) : '0'),
          el('td', { class: 'k-num' }, p.distinct.toLocaleString()), el('td', {}, statsOf(p)), el('td', {}, spark(p)));
        const openIt = () => {
          if (tr.classList.contains('sel')) { tr.classList.remove('sel'); detail.replaceChildren(); return; }     // click again = deselect
          table.querySelectorAll('.eda-row').forEach((x) => x.classList.toggle('sel', x === tr)); univariate(p);
        };
        tr.addEventListener('click', openIt); tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') openIt(); });
        return tr;
      })));
    // bivariate picker
    const useful = prof.filter((p) => p.role !== 'id' && p.role !== 'text');
    const firstM = useful.find((p) => p.role === 'measure');
    const pairA = (useful.find((p) => p.role === 'dimension') || useful.find((p) => p.role === 'date') || useful[0] || prof[0]);
    const pairB = (firstM && firstM !== pairA ? firstM : useful.find((p) => p !== pairA)) || prof.find((p) => p !== pairA) || prof[0];
    const optList = (sel) => ['measure', 'dimension', 'date', 'id', 'text'].map((role) => {
      const items = prof.filter((p) => p.role === role);
      return items.length ? el('optgroup', { label: `${DT_ROLE[role]}s` }, items.map((p) => el('option', { value: p.name, selected: p === sel }, p.name))) : null;
    });
    const aSel = el('select', { 'aria-label': 'First column' }, optList(pairA));
    const bSel = el('select', { 'aria-label': 'Second column' }, optList(pairB));
    const biBox = el('div', { class: 'eda-bi' });
    const runBi = () => bivariate(prof.find((p) => p.name === aSel.value), prof.find((p) => p.name === bSel.value), biBox);
    aSel.addEventListener('change', runBi); bSel.addEventListener('change', runBi);
    const nums = prof.filter((p) => p.kind === 'num' && p.role !== 'id').slice(0, 14);
    const corrBox = el('div', { class: 'eda-corr' });
    let method = 'pearson';
    const drawCorr = () => corrBox.replaceChildren(nums.length >= 2 ? correlation(nums, method)
      : el('p', { class: 'muted' }, `Needs at least two numeric columns that are not IDs — this result has ${nums.length ? `only “${nums[0].name}”` : 'none'}.`));
    const methodSel = el('div', { class: 'seg' }, [['pearson', 'Pearson (linear)'], ['spearman', 'Spearman (rank)']].map(([k, l]) =>
      el('button', { type: 'button', class: 'seg-btn', 'aria-pressed': String(method === k), onClick: (e) => { method = k; e.currentTarget.parentElement.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === e.currentTarget))); drawCorr(); } }, l)));
    drawCorr();
    const corr = el('div', {}, nums.length >= 2 ? methodSel : null, corrBox);
    const warnN = alerts.filter((a) => a[0] === 'warn').length;
    const panes = {
      overview: () => [cards,
        el('div', { class: 'eda-sec' }, el('div', { class: 'eda-sec-h' }, el('h3', {}, 'What stands out'), el('span', { class: 'grow' }),
          alerts.length > 3 ? el('button', { type: 'button', class: 'linkish', onClick: () => go('quality') }, `All ${alerts.length} notes →`) : null),
          alerts.length ? el('div', { class: 'eda-alerts' }, alerts.slice(0, 3).map(([lv, t, d]) => el('div', { class: `eda-alert ${lv}` }, el('b', {}, t), el('span', {}, d))))
            : el('div', { class: 'eda-alerts' }, el('div', { class: 'eda-alert ok' }, el('b', {}, 'No data-quality issues found'), el('span', {}, 'No missing values, duplicates, constant or heavily skewed columns.')))),
        el('div', { class: 'eda-sec' }, el('div', { class: 'eda-sec-h' }, el('h3', {}, 'Columns by role')),
          el('div', { class: 'eda-roles' }, ['measure', 'dimension', 'date', 'id', 'text'].filter((r) => prof.some((p) => p.role === r)).map((r) =>
            el('div', { class: 'eda-role-group' }, el('span', { class: `eda-role r-${r}` }, `${DT_ROLE[r]}s`),
              el('span', { class: 'eda-role-cols' }, prof.filter((p) => p.role === r).map((p) => el('button', { type: 'button', class: 'linkish', onClick: () => { go('columns'); const tr = [...table.querySelectorAll('.eda-row')][p.i]; if (tr && !tr.classList.contains('sel')) tr.click(); } }, p.name)))))))],
      columns: () => [el('div', { class: 'eda-sec-h' }, el('span', { class: 'muted small' }, 'Click a column for its distribution and statistics (click again to close).'), el('span', { class: 'grow' }),
        colSearch, btn('Download profile', profileCsv, { cls: 'sm', ic: 'download' })), el('div', { class: 'dt-scroll eda-cols-wrap' }, table), detail],
      relationships: () => [el('div', { class: 'eda-sec' }, el('div', { class: 'eda-sec-h' }, el('h3', {}, 'Two columns'), el('span', { class: 'muted small' }, 'Pick any two — the right chart is chosen for you.')),
          el('div', { class: 'eda-pick' }, aSel, el('span', { class: 'muted' }, 'vs'), bSel), biBox),
        el('div', { class: 'eda-sec' }, el('div', { class: 'eda-sec-h' }, el('h3', {}, 'Correlation matrix'), el('span', { class: 'muted small' }, 'Numeric columns — how strongly they move together.')), corr)],
      quality: () => [alertBox],
    };
    const tabsBar = el('div', { class: 'eda-tabs', role: 'tablist' });
    const paneBox = el('div', { class: 'eda-pane' });
    let biDone = false;
    function go(k) {
      state.edaTab = k; save();
      tabsBar.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.k === k)));
      paneBox.replaceChildren(...panes[k]().filter(Boolean));
      if (k === 'relationships' && !biDone && prof.length > 1) { biDone = true; runBi(); }
      body.scrollTop = 0;
    }
    [['overview', 'Overview'], ['columns', `Columns (${prof.length})`], ['relationships', 'Relationships'], ['quality', `Data quality${alerts.length ? ` (${alerts.length})` : ''}`]].forEach(([k, l]) =>
      tabsBar.append(el('button', { type: 'button', role: 'tab', 'data-k': k, class: k === 'quality' && warnN ? 'warn' : '', onClick: () => go(k) }, l)));
    body.replaceChildren(el('div', { class: 'eda' }, tabsBar, paneBox));
    go(['overview', 'columns', 'relationships', 'quality'].includes(state.edaTab) ? state.edaTab : 'overview');
    colSearch.addEventListener('input', () => { const f = colSearch.value.toLowerCase();
      table.querySelectorAll('.eda-row').forEach((tr, i) => { tr.hidden = !!f && !prof[i].name.toLowerCase().includes(f) && !DT_ROLE[prof[i].role].toLowerCase().includes(f); }); });
    function univariate(p) {
      const stats = p.kind === 'num'
        ? [['Count', (p.n - p.missing).toLocaleString()], ['Missing', `${p.missing} (${(p.missingPct * 100).toFixed(1)}%)`], ['Distinct', p.distinct], ['Mean', dtShort(p.mean)], ['Std dev', dtShort(p.sd)],
          ['Min', dtShort(p.min)], ['Q1 (25%)', dtShort(p.q1)], ['Median', dtShort(p.median)], ['Q3 (75%)', dtShort(p.q3)], ['Max', dtShort(p.max)], ['Sum', dtShort(p.sum)], ['Zeros', p.zeros],
          ['Outliers (1.5×IQR)', p.outliers], ['Skewness', p.skew.toFixed(2) + (Math.abs(p.skew) > 1 ? (p.skew > 0 ? ' (long right tail)' : ' (long left tail)') : ' (roughly symmetric)')]]
        : [['Count', (p.n - p.missing).toLocaleString()], ['Missing', `${p.missing} (${(p.missingPct * 100).toFixed(1)}%)`], ['Distinct', p.distinct],
          ...(p.kind === 'date' ? [['Earliest', p.min], ['Latest', p.max]] : []), ...p.top.slice(0, 6).map(([k, c]) => [`“${k.slice(0, 30)}”`, `${c} (${((c / p.n) * 100).toFixed(1)}%)`])];
      const c1 = el('div', { class: `eda-chart${p.kind === 'num' ? '' : ' span2'}` }), c2 = el('div', { class: 'eda-chart' });
      detail.replaceChildren(el('div', { class: 'eda-uni' }, el('div', { class: 'eda-uni-head' }, el('h3', {}, p.name), el('span', { class: `eda-role r-${p.role}` }, DT_ROLE[p.role]), el('span', { class: 'muted' }, p.type),
        btn('', () => { detail.replaceChildren(); table.querySelectorAll('.eda-row').forEach((x) => x.classList.remove('sel')); }, { cls: 'ghost icon sm', ic: 'x', title: 'Close' })),
      el('div', { class: 'eda-uni-body' }, el('dl', { class: 'eda-stats' }, stats.flatMap(([k, v]) => [el('dt', {}, k), el('dd', {}, String(v))])), c1, p.kind === 'num' ? c2 : null)));
      const s1 = { chart: null }, s2 = { chart: null };
      if (p.kind === 'num') {
        dtChartEl(c1, dtBuildChart(payload, prof, { type: 'hist', x: p.name, ys: [], bins: 0 }).config, s1);
        dtChartEl(c2, dtBuildChart(payload, prof, { type: 'box', x: p.name, ys: [] }).config, s2);
      } else if (p.kind === 'date') {
        const r = dtBuildChart(payload, prof, { type: 'line', x: p.name, ys: [], agg: 'count' });
        if (r.config) dtChartEl(c1, r.config, s1);
      } else dtChartEl(c1, dtBuildChart(payload, prof, { type: 'count', x: p.name, ys: [] }).config, s1);
      // bring the details into view inside the viewer (not the page), header stays visible
      requestAnimationFrame(() => {
        const sc = body, top = detail.offsetTop - sc.offsetTop;
        if (top < sc.scrollTop || top + 80 > sc.scrollTop + sc.clientHeight) sc.scrollTo({ top: Math.max(0, top - 12), behavior: 'smooth' });
      });

    }
    function bivariate(a, b, holder) {
      if (!a || !b) return;
      if (a === b) { holder.replaceChildren(el('p', { class: 'muted' }, 'Pick two different columns.')); return; }
      const idc = [a, b].find((p) => p.role === 'id' || p.role === 'text');
      if (idc) { holder.replaceChildren(el('p', { class: 'muted' }, `“${idc.name}” is an ${idc.role === 'id' ? 'identifier (every row has its own value)' : 'free-text column'}, so it can't show a relationship. Pick a measure, dimension or date.`)); return; }
      const num = (p) => p.kind === 'num' && p.role !== 'id';
      let cfg2, why;
      if (num(a) && num(b)) { cfg2 = { type: 'scatter', x: a.name, ys: [b.name] }; why = 'Two measures → scatter plot with a trend line and correlation.'; }
      else if (a.kind === 'date' && num(b)) { cfg2 = { type: 'line', x: a.name, ys: [b.name], agg: 'sum' }; why = `Date + measure → ${b.name} over time.`; }
      else if (b.kind === 'date' && num(a)) { cfg2 = { type: 'line', x: b.name, ys: [a.name], agg: 'sum' }; why = `Date + measure → ${a.name} over time.`; }
      else if (num(b)) { cfg2 = { type: 'boxby', x: a.name, ys: [b.name] }; why = `Category + measure → how ${b.name} is spread within each ${a.name}.`; }
      else if (num(a)) { cfg2 = { type: 'boxby', x: b.name, ys: [a.name] }; why = `Category + measure → how ${a.name} is spread within each ${b.name}.`; }
      else { cfg2 = { type: 'heat', x: a.name, ys: [b.name] }; why = 'Two categories → how often each combination occurs.'; }
      const r = dtBuildChart(payload, prof, cfg2);
      const cbox = el('div', { class: 'eda-chart wide' });
      holder.replaceChildren(el('p', { class: 'muted small' }, why, r.note ? el('b', {}, `  ${r.note}`) : null), cbox,
        btn('Open in Chart tab', () => { state.chart = { ...state.chart, ...cfg2, by: '', bins: 0, agg: cfg2.agg || state.chart.agg }; state.view = 'chart'; save(); drawTabs(); draw(); }, { cls: 'sm' }));
      if (r.error) cbox.replaceChildren(el('p', { class: 'muted' }, r.error));
      else if (r.heat) cbox.replaceChildren(dtHeatmap(r.heat));
      else dtChartEl(cbox, r.config, { chart: null });
    }
    function correlation(cols, how) {
      const pairs = new Map();
      const rows = payload.rows;
      const rank = (xs) => { const idx = xs.map((v, i) => [v, i]).sort((x, y) => x[0] - y[0]); const r = new Array(xs.length);
        for (let i = 0; i < idx.length;) { let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++; for (let k = i; k <= j; k++) r[idx[k][1]] = (i + j) / 2 + 1; i = j + 1; } return r; };
      for (const a of cols) for (const b of cols) {
        if (pairs.has(`${b.name}|${a.name}`)) { pairs.set(`${a.name}|${b.name}`, pairs.get(`${b.name}|${a.name}`)); continue; }
        const ok = rows.filter((r) => dtNum(r[a.i]) && dtNum(r[b.i]));
        let xa = ok.map((r) => r[a.i]), xb = ok.map((r) => r[b.i]);
        if (how === 'spearman') { xa = rank(xa); xb = rank(xb); }
        pairs.set(`${a.name}|${b.name}`, a === b ? 1 : dtPearson(xa, xb));
      }
      const color = (r) => (r == null ? 'transparent' : r >= 0 ? `rgba(10,92,255,${(Math.abs(r) * 0.85).toFixed(2)})` : `rgba(225,29,116,${(Math.abs(r) * 0.85).toFixed(2)})`);
      return el('div', { class: 'dt-heat-wrap' }, el('table', { class: 'dt-heat corr' },
        el('thead', {}, el('tr', {}, el('th', {}), cols.map((c) => el('th', { title: c.name }, c.name)))),
        el('tbody', {}, cols.map((a) => el('tr', {}, el('th', { title: a.name }, a.name), cols.map((b) => { const r = pairs.get(`${a.name}|${b.name}`);
          return el('td', { style: `background:${color(r)};color:${r != null && Math.abs(r) > 0.55 ? '#fff' : 'inherit'}`, title: `${a.name} × ${b.name}: r = ${r == null ? 'n/a' : r.toFixed(3)}` }, r == null ? '' : r.toFixed(2)); }))))),
        el('p', { class: 'muted small' }, 'Blue = move together, pink = move opposite. |r| ≥ 0.7 strong, 0.4–0.7 moderate, < 0.2 none.'));
    }
  }

  const draw = () => {
    if (store.chart) { store.chart.destroy(); store.chart = null; }
    slot.replaceChildren();
    if (state.view === 'chart') drawChart(); else if (state.view === 'eda') drawEda(); else drawTable();
  };
  drawTabs(); draw();
  return wrap;
}

/* ---------- live cards for dbutils.notebook.run() and %run ---------- */
const DB_RUN_MIME = 'application/vnd.databridge.run+json';
function dbSecs(s) {
  if (s == null) return '—';
  s = Math.max(0, Math.round(s));
  return s < 60 ? `${s}s` : s < 3600 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}
function renderRunCard(p) {
  if (p.kind === 'workflows') return renderWorkflowsTable(p.rows || []);
  const st = p.task_state === 'TIMEDOUT' ? 'TIMEDOUT' : (p.state || 'QUEUED');
  const active = st === 'RUNNING' || st === 'QUEUED';
  const color = (typeof STATE_COLORS !== 'undefined' && STATE_COLORS[st]) || 'var(--wait)';
  const label = st.replace(/_/g, ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase());
  const isInline = p.kind === 'inline_run';
  const meta = [];
  if (!isInline) meta.push(`Run #${p.run_number}`);
  if (isInline && p.cells) meta.push(active && p.current_cell ? `cell ${p.current_cell} of ${p.cells}` : `${p.done ?? p.cells} of ${p.cells} cells`);
  if (!isInline && p.current_cell != null && active) meta.push(`running cell ${p.current_cell + 1}`);
  if (!isInline && p.task_state === 'PENDING') meta.push('starting Spark session…');
  meta.push(`${active ? 'running for' : 'took'} ${dbSecs(p.duration)}`);
  if (p.timeout) meta.push(`timeout ${dbSecs(p.timeout)}`);
  const pct = isInline && p.cells ? Math.round(((p.done || 0) / p.cells) * 100) : null;
  const args = Object.entries(p.arguments || {});
  return el('div', { class: `run-card st-${st.toLowerCase()}` },
    el('div', { class: 'row', style: { gap: '10px' } },
      active ? el('span', { class: 'spinner', style: { width: '14px', height: '14px' } }) : el('span', { class: 'dot', style: { background: color } }),
      el('span', { class: 'run-card-kind' }, isInline ? '%run' : 'Notebook run'),
      isInline ? el('span', { class: 'mono', style: { fontWeight: 600 } }, p.title.replace(/^%run /, ''))
        : el('a', { class: 'mono', style: { fontWeight: 600 }, href: `#/notebook?path=${encodeURIComponent(p.title)}` }, p.title),
      el('span', { class: 'grow' }),
      el('span', { class: 'state', style: { fontSize: '12.5px' } }, label),
      !isInline && p.run_id ? el('a', { class: 'btn sm', href: `#/run/${p.run_id}` }, 'View run →') : null),
    el('div', { class: 'muted', style: { fontSize: '12px', marginTop: '6px' } }, meta.join(' · ')),
    pct !== null && active ? el('div', { class: 'run-card-bar' }, el('span', { style: { width: `${pct}%` } })) : null,
    args.length ? el('div', { class: 'row', style: { gap: '6px', flexWrap: 'wrap', marginTop: '8px' } },
      args.map(([k, v]) => el('span', { class: 'chip mono', style: { fontWeight: 500, fontSize: '11px' } }, `${k}=${v}`))) : null,
    p.error ? el('div', { class: 'error-box', style: { marginTop: '8px', fontSize: '12.5px' } }, p.error) : null,
    p.result ? el('div', { class: 'chip teal mono', style: { marginTop: '8px' } }, `exit value: ${p.result}`) : null);
}

/* ---------- "Notebook Workflows" table (all dbutils.notebook.run calls from one cell) ---------- */
const DB_WF_STATUS = {
  SUCCESS: ['Succeeded', 'ok'], FAILED: ['Failed', 'fail'], TIMEDOUT: ['Timed out', 'fail'], CANCELED: ['Canceled', 'cancel'],
  RUNNING: ['Running', 'run'], PENDING: ['Pending', 'wait'], QUEUED: ['Pending', 'wait'],
};
function dbWfIcon(kind) {
  if (kind === 'run') return el('span', { class: 'spinner', style: { width: '14px', height: '14px' } });
  const paths = { ok: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/>', fail: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
    cancel: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>', wait: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' };
  const s = el('span', { class: `wf-ic wf-${kind}`, 'aria-hidden': 'true' });
  s.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[kind]}</svg>`;
  return s;
}
function dbWfTime(t) {
  return t ? new Date(t * 1000).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
}
function renderWorkflowsTable(rows) {
  let asc = true;
  const box = el('div', { class: 'wf' }, el('div', { class: 'wf-title' }, 'Notebook Workflows'));
  const tableWrap = el('div', { class: 'wf-scroll' });
  box.append(tableWrap);
  const draw = () => {
    const list = [...rows].sort((a, b) => ((a.start || 0) - (b.start || 0)) * (asc ? 1 : -1));
    const head = el('tr', {},
      el('th', { class: 'wf-sort', title: 'Sort by start time', onClick: () => { asc = !asc; draw(); } }, `Start time ${asc ? '↑' : '↓'}`),
      ['End time', 'Notebook path', 'Duration', 'Status', 'Error code', 'Run parameters'].map((h) => el('th', {}, h)));
    const body = list.map((r) => {
      const [label, kind] = DB_WF_STATUS[r.state] || [r.state, 'wait'];
      const params = Object.entries(r.parameters || {}).map(([k, v]) => `${k}: ${v}`).join(', ');
      return el('tr', {},
        el('td', {}, el('a', { href: `#/run/${r.run_id}`, title: `Open run #${r.run_number}` }, dbWfTime(r.start))),
        el('td', {}, r.end ? el('a', { href: `#/run/${r.run_id}` }, dbWfTime(r.end)) : el('span', { class: 'muted' }, '—')),
        el('td', { class: 'wf-path' }, el('a', { href: `#/notebook?path=${encodeURIComponent(r.path)}`, title: `/Workspace/${r.path}` }, `/Workspace/${r.path}`)),
        el('td', {}, dbSecs(r.duration)),
        el('td', {}, el('span', { class: 'wf-status' }, dbWfIcon(kind), label,
          kind === 'run' && r.current_cell != null ? el('span', { class: 'muted' }, ` · cell ${r.current_cell + 1}`) : null)),
        el('td', { class: 'wf-err', title: r.error || '' }, r.error_code || ''),
        el('td', { class: 'wf-params', title: params }, params));
    });
    tableWrap.replaceChildren(el('table', { class: 'wf-table' }, el('thead', {}, head), el('tbody', {}, body)));
  };
  draw();
  return box;
}

/* ---------- Spark job progress card (like Databricks "Spark Jobs") ---------- */
const DB_SPARK_MIME = 'application/vnd.databridge.sparkjobs+json';
const dbSparkOpen = new Map();               // remember expanded state across live updates
function renderSparkJobs(p, meta = {}) {
  const key = (meta && meta.databridge_display_id) || `${p.app}-${(p.jobs[0] || {}).id}`;
  const st = dbSparkOpen.get(key) || { open: false, jobs: new Set() };
  dbSparkOpen.set(key, st);
  const jobs = p.jobs || [];
  const stages = jobs.reduce((n, j) => n + j.stages.filter((s) => s.status !== 'skipped').length, 0);
  const tasks = jobs.reduce((n, j) => n + j.tasks, 0), done = jobs.reduce((n, j) => n + j.done, 0);
  const failed = jobs.some((j) => j.status === 'FAILED');
  const running = !p.done && jobs.some((j) => j.status === 'RUNNING');
  const state = failed ? 'failed' : running ? 'running' : 'succeeded';
  const ui = p.ui ? p.ui.replace(/\/$/, '') : '';
  const link = (href, text, title) => (ui ? el('a', { class: 'sj-link', href: `${ui}${href}`, target: '_blank', rel: 'noopener', title, onClick: (e) => e.stopPropagation() }, text) : null);
  const bar = (d, t, f, a) => el('span', { class: 'sj-bar', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': t, 'aria-valuenow': d, title: `${d}/${t} tasks${a ? ` · ${a} running` : ''}${f ? ` · ${f} failed` : ''}` },
    el('i', { class: 'sj-done', style: `width:${t ? (d / t) * 100 : 0}%` }), a ? el('i', { class: 'sj-active', style: `width:${t ? (a / t) * 100 : 0}%` }) : null);
  const box = el('div', { class: `sj sj-${state}` });
  const draw = () => {
    const head = el('button', { type: 'button', class: 'sj-head', 'aria-expanded': String(st.open), onClick: () => { st.open = !st.open; draw(); } },
      el('span', { class: 'sj-caret', 'aria-hidden': 'true' }, st.open ? '▾' : '▸'),
      el('b', {}, `(${jobs.length}) Spark Job${jobs.length === 1 ? '' : 's'}`),
      el('span', { class: `sj-state ${state}` }, state === 'running' ? 'Running' : state === 'failed' ? 'Failed' : 'Succeeded'),
      el('span', { class: 'sj-sum' }, `${stages} stage${stages === 1 ? '' : 's'} · ${done.toLocaleString()}/${tasks.toLocaleString()} tasks · ${p.elapsed}s`),
      running ? bar(done, tasks, 0, jobs.reduce((n, j) => n + j.stages.reduce((m, s) => m + s.active, 0), 0)) : null,
      el('span', { class: 'grow' }), link('/jobs/', 'Spark UI ↗', 'Open the Spark UI for this application'));
    const kids = [head];
    if (st.open) {
      kids.push(el('div', { class: 'sj-jobs' }, jobs.map((j) => {
        const jopen = st.jobs.has(j.id);
        const live = j.stages.filter((s) => s.status !== 'skipped');
        const skipped = j.stages.length - live.length;
        const row = el('button', { type: 'button', class: 'sj-job', 'aria-expanded': String(jopen), onClick: () => { if (jopen) st.jobs.delete(j.id); else st.jobs.add(j.id); draw(); } },
          el('span', { class: 'sj-caret' }, jopen ? '▾' : '▸'), el('span', { class: 'sj-jid' }, `Job ${j.id}`),
          el('span', { class: `sj-state ${j.status === 'FAILED' ? 'failed' : j.status === 'RUNNING' ? 'running' : 'succeeded'}` }, j.status.toLowerCase()),
          bar(j.done, j.tasks, live.reduce((n, s) => n + s.failed, 0), live.reduce((n, s) => n + s.active, 0)),
          el('span', { class: 'sj-cnt' }, `${j.done}/${j.tasks} tasks · ${live.length} stage${live.length === 1 ? '' : 's'}${skipped ? ` (${skipped} skipped)` : ''}`),
          el('span', { class: 'sj-name', title: j.name }, j.name), link(`/jobs/job/?id=${j.id}`, 'View', `Job ${j.id} in the Spark UI`));
        return el('div', { class: 'sj-jobwrap' }, row, jopen ? el('table', { class: 'sj-stages' },
          el('thead', {}, el('tr', {}, ['Stage', 'Status', 'Tasks', '', 'Running', 'Failed', 'Description', ''].map((h) => el('th', {}, h)))),
          el('tbody', {}, j.stages.map((s) => el('tr', { class: `st-${s.status}` },
            el('td', {}, `${s.id}${s.attempt ? ` (retry ${s.attempt})` : ''}`), el('td', {}, el('span', { class: `sj-state ${s.status}` }, s.status)),
            el('td', { class: 'num' }, s.status === 'skipped' ? '—' : `${s.done}/${s.tasks}`), el('td', {}, s.status === 'skipped' ? '' : bar(s.done, s.tasks, s.failed, s.active)),
            el('td', { class: 'num' }, s.active || ''), el('td', { class: `num${s.failed ? ' bad' : ''}` }, s.failed || ''),
            el('td', { class: 'sj-name', title: s.name }, s.name), el('td', {}, s.status === 'skipped' ? '' : link(`/stages/stage/?id=${s.id}&attempt=${s.attempt || 0}`, 'View', `Stage ${s.id} in the Spark UI`)))))) : null);
      })));
      if (!ui) kids.push(el('p', { class: 'muted small sj-note' }, 'Spark UI address not available (spark.ui.enabled may be off).'));
    }
    box.replaceChildren(...kids);
  };
  draw();
  return box;
}
