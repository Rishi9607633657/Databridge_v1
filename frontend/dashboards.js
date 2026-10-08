/* DataBridge Dashboards — BI dashboards with datasets, filters, cross-filtering, drag/resize editor, Dora. */
'use strict';

const DB_PALETTE = ['#0A5CFF', '#12A7C7', '#F28C28', '#6B4FA0', '#1E8E3E', '#D4A22A', '#C2410C', '#2F5F9E', '#DB2777', '#0F766E'];
const DB_ROW_H = 84, DB_GAP = 14, DB_COLS = 12;
const DB_TYPES = { kpi: 'KPI card', bar: 'Bar chart', hbar: 'Horizontal bar', line: 'Line chart', area: 'Area chart', pie: 'Pie / donut', table: 'Table', text: 'Text' };
const DB_AGGS = { sum: 'Sum', avg: 'Average', count: 'Count', countd: 'Count distinct', min: 'Min', max: 'Max', none: 'None (raw)' };
DB_TYPES.insights = 'Smart insights';
DB_TYPES.panel = 'Multi-chart panel';
DB_TYPES.funnel = 'Funnel';
const DB_LOOKS = { clean: 'Clean', ocean: 'Ocean (light blue)', midnight: 'Midnight (dark)', aurora: 'Aurora (purple)' };
const DB_LOOK_PALETTE = { midnight: 'neon', aurora: 'aurora', ocean: 'vivid', clean: 'vivid' };
if (typeof DB_THEMES !== 'undefined') {
  DB_THEMES.neon = ['#3DD9EB', '#7C83FD', '#F7B32B', '#FF6B9A', '#2EE59D', '#A78BFA', '#FB923C', '#38BDF8', '#C4F042', '#F87171'];
  DB_THEMES.aurora = ['#7B3FE4', '#C056D8', '#E879A6', '#5B6CF0', '#22B8CF', '#9D4EDD', '#F59E0B', '#14B8A6', '#6366F1', '#EC4899'];
}
const DB_KPI_STYLES = { tinted: 'Tinted card + mini bars', gradient: 'Colour tiles', gauge: 'Gauge', spark: 'Number + sparkline' };
function gaugeSvg(ratio, color) {
  const a = Math.PI * (1 - ratio), x = 60 + 48 * Math.cos(a), y = 60 - 48 * Math.sin(a);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 120 66'); svg.setAttribute('class', 'kpi-gauge-svg'); svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `<path d="M12 60 A48 48 0 0 1 108 60" fill="none" stroke="var(--gauge-bg,#E6EAF2)" stroke-width="11" stroke-linecap="round"/>`
    + (ratio > 0.001 ? `<path d="M12 60 A48 48 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)}" fill="none" stroke="${color}" stroke-width="11" stroke-linecap="round"/>` : '');
  return svg;
}
function sparkLine(vals, color, area) {
  const W = 110, H = 40, mx = Math.max(...vals), mn = Math.min(...vals), span = mx - mn || 1;
  const pts = vals.map((v, i) => [(i / (vals.length - 1)) * W, H - 3 - ((v - mn) / span) * (H - 8)]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'kpi-sparkline'); svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = (area ? `<path d="${d} L${W} ${H} L0 ${H} Z" fill="${color}" opacity=".15"/>` : '') + `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`;
  return svg;
}
const DB_PERIODS = { all: 'All dates', last_7_days: 'Last 7 days', last_week: 'Last week (Mon–Sun)', last_14_days: 'Last 14 days',
  this_month: 'This month to date', last_month: 'Last month', last_30_days: 'Last 30 days', custom: 'Custom range' };
const dbIso = (d) => d.toISOString().slice(0, 10);
const dbAddDays = (iso, n) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return dbIso(d); };
const dbDays = (a, b) => Math.round((new Date(`${b}T00:00:00Z`) - new Date(`${a}T00:00:00Z`)) / 86400000) + 1;
const dbShortDate = (iso) => (iso ? new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' }) : '');
/* current + previous window for a period setting, anchored on a date (latest data date or today) */
function dbWindows(p, anchor) {
  if (!p || !p.preset || p.preset === 'all' || !anchor) return { cur: null, prev: null };
  const last = (n) => ({ cur: { from: dbAddDays(anchor, -(n - 1)), to: anchor } });
  let w;
  switch (p.preset) {
    case 'last_7_days': w = last(7); break;
    case 'last_14_days': w = last(14); break;
    case 'last_30_days': w = last(30); break;
    case 'last_week': {
      const dow = (new Date(`${anchor}T00:00:00Z`).getUTCDay() + 6) % 7;
      const thisMon = dbAddDays(anchor, -dow);
      w = { cur: { from: dbAddDays(thisMon, -7), to: dbAddDays(thisMon, -1) } };
      break;
    }
    case 'this_month': {
      const from = `${anchor.slice(0, 7)}-01`;
      const pm = new Date(`${from}T00:00:00Z`); pm.setUTCMonth(pm.getUTCMonth() - 1);
      const pFrom = dbIso(pm);
      const pEndOfMonth = dbAddDays(from, -1);
      const pTo = dbAddDays(pFrom, dbDays(from, anchor) - 1);
      return { cur: { from, to: anchor }, prev: p.compare === false ? null : { from: pFrom, to: pTo < pEndOfMonth ? pTo : pEndOfMonth } };
    }
    case 'last_month': {
      const thisFirst = `${anchor.slice(0, 7)}-01`;
      const to = dbAddDays(thisFirst, -1);
      const from = `${to.slice(0, 7)}-01`;
      const pTo = dbAddDays(from, -1);
      return { cur: { from, to }, prev: p.compare === false ? null : { from: `${pTo.slice(0, 7)}-01`, to: pTo } };
    }
    case 'custom':
      if (!p.from || !p.to) return { cur: null, prev: null };
      w = { cur: { from: p.from, to: p.to } };
      break;
    default: return { cur: null, prev: null };
  }
  const n = dbDays(w.cur.from, w.cur.to);
  w.prev = p.compare === false ? null : { from: dbAddDays(w.cur.from, -n), to: dbAddDays(w.cur.from, -1) };
  return w;
}
const dbUid = (p) => `${p}${Math.random().toString(36).slice(2, 8)}`;
const dbIsNum = (v) => typeof v === 'number' && Number.isFinite(v);

function dbFmt(v, fmt, cur = '₹') {
  if (v == null || v === '') return '—';
  if (typeof v !== 'number') return String(v);
  const nf = (o) => new Intl.NumberFormat('en-IN', o).format(v);
  switch (fmt) {
    case 'currency': return `${cur}${nf({ maximumFractionDigits: Math.abs(v) < 100 ? 2 : 0 })}`;
    case 'percent': return `${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(v * 100)}%`;
    case 'compact': {
      const a = Math.abs(v);
      if (a >= 1e7) return `${(v / 1e7).toFixed(2)} Cr`;
      if (a >= 1e5) return `${(v / 1e5).toFixed(2)} L`;
      if (a >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
      return nf({ maximumFractionDigits: 2 });
    }
    case 'integer': return nf({ maximumFractionDigits: 0 });
    case 'currency_compact': return `${v < 0 ? '−' : ''}${cur}${dbFmt(Math.abs(v), 'compact', cur)}`;
    default: return nf({ maximumFractionDigits: 2 });
  }
}

/* aggregate rows -> {labels, series:[{name, data}]} */
function dbAggregate(cols, rows, w) {
  const xi = cols.indexOf(w.x);
  const ys = (w.y || []).filter((c) => cols.includes(c));
  const si = w.series ? cols.indexOf(w.series) : -1;
  const agg = w.agg || 'sum';
  const reduce = (vals) => {
    const nums = vals.filter(dbIsNum);
    switch (agg) {
      case 'count': return vals.filter((v) => v != null).length;
      case 'countd': return new Set(vals.filter((v) => v != null)).size;
      case 'avg': return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
      case 'min': return nums.length ? Math.min(...nums) : null;
      case 'max': return nums.length ? Math.max(...nums) : null;
      case 'none': return vals[0] ?? null;
      default: return nums.reduce((a, b) => a + b, 0);
    }
  };
  if (xi < 0) {
    return { labels: [''], series: ys.map((y) => ({ name: y, data: [reduce(rows.map((r) => r[cols.indexOf(y)]))] })) };
  }
  const groups = new Map();
  const seriesKeys = new Set();
  for (const r of rows) {
    const k = r[xi] == null ? '(blank)' : String(r[xi]);
    if (!groups.has(k)) groups.set(k, new Map());
    const g = groups.get(k);
    if (si >= 0) {
      const sk = r[si] == null ? '(blank)' : String(r[si]);
      seriesKeys.add(sk);
      const y = ys[0];
      if (!g.has(sk)) g.set(sk, []);
      g.get(sk).push(r[cols.indexOf(y)]);
    } else {
      for (const y of ys) { if (!g.has(y)) g.set(y, []); g.get(y).push(r[cols.indexOf(y)]); }
    }
  }
  let labels = [...groups.keys()];
  const names = si >= 0 ? [...seriesKeys].sort() : ys;
  let series = names.map((n) => ({ name: n, data: labels.map((l) => (groups.get(l).has(n) ? reduce(groups.get(l).get(n)) : null)) }));
  const total = labels.map((_, i) => series.reduce((a, s) => a + (dbIsNum(s.data[i]) ? s.data[i] : 0), 0));
  let order = labels.map((_, i) => i);
  const looksDate = labels.every((l) => /^\d{4}-\d{2}(-\d{2})?/.test(l));
  if (w.sort === 'value_desc') order.sort((a, b) => total[b] - total[a]);
  else if (w.sort === 'value_asc') order.sort((a, b) => total[a] - total[b]);
  else order.sort((a, b) => (looksDate ? labels[a].localeCompare(labels[b]) : labels[a].localeCompare(labels[b], undefined, { numeric: true })));
  if (w.top > 0) order = order.slice(0, w.top);
  labels = order.map((i) => labels[i]);
  series = series.map((s) => ({ name: s.name, data: order.map((i) => s.data[i]) }));
  return { labels, series };
}

/* ======================= list ======================= */
async function viewDashboards(main) {
  const canEdit = !CURRENT_USER || CURRENT_USER.role !== 'viewer';
  main.append(el('div', { class: 'page-head' }, el('h1', { class: 'grow' }, 'Dashboards'),
    canEdit ? btn('Build with AI', () => dbAiDialog(), { ic: 'flow', title: 'Describe a dashboard in one prompt' }) : null,
    canEdit ? btn('New dashboard', () => dbNewDialog(), { cls: 'primary', ic: 'plus' }) : null));
  const panel = el('section', { class: 'panel' }, loading());
  main.append(panel);
  let list;
  try { list = await api('/api/dashboards'); } catch (e) { panel.replaceChildren(errBox(e)); return; }
  if (!list.length) {
    panel.replaceChildren(el('div', { class: 'empty' }, el('h2', {}, 'No dashboards yet'),
      el('p', {}, 'Build KPI cards and charts from your tables, add filters, and share them with your team.'),
      canEdit ? btn('New dashboard', () => dbNewDialog(), { cls: 'primary' }) : null));
    return;
  }
  panel.replaceChildren(el('table', { class: 't' }, el('thead', {}, el('tr', {}, ['Name', 'Widgets', 'Owner', 'Updated', ''].map((x) => el('th', {}, x)))),
    el('tbody', {}, list.map((d) => el('tr', { class: 'clickable', onClick: () => (location.hash = `#/dashboard/${d.id}`) },
      el('td', {}, el('b', {}, d.name), d.description ? el('div', { class: 'muted', style: { fontSize: '12.5px' } }, d.description) : null),
      el('td', { class: 'muted' }, `${d.widgets} widget${d.widgets === 1 ? '' : 's'} · ${d.datasets} dataset${d.datasets === 1 ? '' : 's'}`),
      el('td', { class: 'muted' }, d.owner || '—'), el('td', { class: 'muted' }, ago(d.updated)),
      el('td', { style: { textAlign: 'right' } }, canEdit ? btn('', async (e) => {
        e.stopPropagation();
        if (!(await confirmDialog(`Delete ${d.name}?`, 'The dashboard is removed for everyone. Tables are not touched.', 'Delete'))) return;
        await api(`/api/dashboards/${d.id}`, { method: 'DELETE' }); render();
      }, { cls: 'ghost icon sm', ic: 'trash', title: 'Delete dashboard' }) : null))))));
}

const DB_AI_EXAMPLES = [
  ['Sales overview', 'Sales dashboard for the owner: net sales, orders, average order value and discounts as KPI cards; daily sales trend with a 7-day forecast; sales by region and channel in one card with tabs; top 10 products; region and channel filters; details on a second page.'],
  ['Let AI decide', 'Look at the data and build the most useful dashboard: you decide the KPIs, charts, panels, filters and pages. Focus on what changed recently and where the problems are.'],
  ['Finance view', 'Finance view for the last 30 days vs the previous 30: revenue, refunds and discounts (lower is better), payment method share, refunds by store with a store filter on that chart.'],
];
const DB_W_LABEL = { kpi: 'KPI card', bar: 'Bar chart', hbar: 'Horizontal bar', line: 'Line / trend', area: 'Area chart', pie: 'Pie / donut', table: 'Table', panel: 'Multi-chart panel', insights: 'Smart insights', text: 'Text' };
/* Build with AI: 1) describe + choose data, 2) review the proposed datasets & visuals, 3) create. opts: {schema, tables} */
async function dbAiDialog(opts = {}) {
  let meta = { template: '', tables: [] };
  try { meta = await api('/api/dashboards/ai/template'); } catch { /* still usable */ }
  const schemas = [...new Set(meta.tables.map((t) => t.split('.')[0]))].sort();
  const chosen = new Set(opts.tables || []);
  let schema = opts.schema || (opts.tables && opts.tables[0] ? opts.tables[0].split('.')[0] : '');
  if (schema && !opts.tables) meta.tables.filter((t) => t.startsWith(`${schema}.`)).forEach((t) => chosen.add(t));
  await openDialog((close) => {
    const root = el('div', { class: 'dlg ai-dlg' });
    let prompt = opts.prompt || '', useAi = true, plan = null;
    const step1 = () => {
      const ta = el('textarea', { class: 'field ai-prompt', rows: 8, placeholder: 'What should the dashboard help you decide? Mention KPIs, charts, filters or pages you want — anything you leave out, AI decides.' }, prompt);
      ta.addEventListener('input', () => { prompt = ta.value; });
      const schemaSel = el('select', { class: 'field', 'aria-label': 'Schema' }, el('option', { value: '' }, 'All schemas'), schemas.map((s2) => el('option', { value: s2, selected: s2 === schema }, s2)));
      const list = el('div', { class: 'ai-tables' });
      const search = el('input', { class: 'field', type: 'search', placeholder: 'Search tables…' });
      const count = el('span', { class: 'muted small' });
      const drawTables = () => {
        const q = search.value.toLowerCase();
        const items = meta.tables.filter((t) => (!schema || t.startsWith(`${schema}.`)) && (!q || t.toLowerCase().includes(q))).slice(0, 300);
        count.textContent = chosen.size ? `${chosen.size} selected` : 'none selected — AI picks from your prompt';
        list.replaceChildren(...(items.length ? items.map((t) => el('label', { class: 'switch' },
          el('input', { type: 'checkbox', checked: chosen.has(t), onChange: (e) => { if (e.target.checked) chosen.add(t); else chosen.delete(t); drawTables(); } }),
          el('span', { class: 'mono' }, schema ? t.split('.').slice(1).join('.') : t)))
          : [el('p', { class: 'muted small' }, meta.tables.length ? 'No tables match.' : 'No tables found in the catalog — name them in your prompt (e.g. gold.sales).')]));
      };
      schemaSel.addEventListener('change', () => { schema = schemaSel.value; chosen.clear(); if (schema) meta.tables.filter((t) => t.startsWith(`${schema}.`)).forEach((t) => chosen.add(t)); drawTables(); });
      search.addEventListener('input', drawTables); drawTables();
      const ai = el('input', { type: 'checkbox', checked: useAi, onChange: (e) => { useAi = e.target.checked; } });
      const status = el('div', { class: 'ai-status', role: 'status', 'aria-live': 'polite' });
      const go = btn('Design dashboard', async () => {
        go.disabled = true;
        const steps = ['Reading the schema…', 'Profiling columns and values…', 'Finding relationships between tables…', 'Designing datasets…', 'Choosing KPIs and charts…', 'Checking every query…', 'Laying it out…'];
        let k = 0; status.className = 'ai-status busy'; status.textContent = steps[0];
        const timer = setInterval(() => { k = Math.min(k + 1, steps.length - 1); status.textContent = steps[k]; }, 2200);
        try {
          plan = await api('/api/dashboards/ai/plan', { method: 'POST', body: { prompt, tables: [...chosen], schema: chosen.size ? null : schema || null, use_ai: useAi } });
          plan.keep = new Set(plan.definition.widgets.map((w) => w.id));
          clearInterval(timer); step2();
        } catch (e) { clearInterval(timer); status.className = 'ai-status err'; status.textContent = e.message; go.disabled = false; }
      }, { cls: 'primary', ic: 'flow' });
      root.replaceChildren(
        el('div', { class: 'row' }, el('h2', { class: 'grow' }, 'Build a dashboard with AI'), el('span', { class: 'ai-steps' }, el('b', {}, '1 Describe'), ' › 2 Review › 3 Create'), btn('Close', () => close(null), { cls: 'sm' })),
        el('p', { class: 'muted' }, 'Pick a schema (or tables). AI reads every column, finds relationships, designs datasets, and proposes KPIs, charts and filters — you review before anything is created.'),
        el('div', { class: 'ai-grid' },
          el('div', { class: 'stack', style: { gap: '8px' } }, ta,
            el('div', { class: 'row', style: { gap: '6px', flexWrap: 'wrap' } },
              btn('Use the template', () => { ta.value = meta.template || ta.value; prompt = ta.value; ta.focus(); }, { cls: 'sm' }),
              ...DB_AI_EXAMPLES.map(([label, text]) => btn(label, () => { ta.value = text; prompt = text; }, { cls: 'sm ghost' })))),
          el('div', { class: 'stack', style: { gap: '8px' } }, el('b', {}, 'Data'), schemaSel, search, list, count)),
        el('label', { class: 'switch' }, ai, 'Use AI (Dora) — off uses the built-in designer, no AI key needed'),
        status, el('div', { class: 'actions' }, go));
      setTimeout(() => ta.focus(), 0);
    };
    const step2 = () => {
      const D = plan.definition;
      const nameIn = el('input', { class: 'field ai-name', value: plan.name, 'aria-label': 'Dashboard name' });
      const dsById = Object.fromEntries(D.datasets.map((d) => [d.id, d]));
      const describe = (w) => {
        if (w.type === 'panel') return `${(w.children || []).length} charts as ${w.panelMode === 'grid' ? 'a grid' : 'tabs'}: ${(w.children || []).map((c) => c.title).join(', ')}`;
        if (w.type === 'insights') return 'Automatic findings from this page';
        if (w.type === 'table') return `${(w.columns || []).length} columns`;
        const y = (w.y || []).join(', ');
        return `${w.agg && w.agg !== 'none' ? `${w.agg} of ` : ''}${y}${w.x ? ` by ${w.x}` : ''}${w.ml && w.ml.forecast ? ' · forecast' : ''}${(w.filterControls || []).length ? ` · filter: ${w.filterControls.join(', ')}` : ''}${(w.where || []).length ? ` · only ${w.where.map((c) => `${c.column} ${c.op} ${c.value}`).join(', ')}` : ''}`;
      };
      const counts = () => {
        const kept = D.widgets.filter((w) => plan.keep.has(w.id));
        return `${kept.filter((w) => w.type === 'kpi').length} KPI cards · ${kept.filter((w) => !['kpi', 'insights', 'table', 'text'].includes(w.type)).length} charts/panels · ${kept.filter((w) => w.type === 'table').length} tables`;
      };
      const summary = el('span', { class: 'muted' }, counts());
      const pages = D.pages.map((p) => el('section', { class: 'ai-page' }, el('h4', {}, p.name),
        el('div', { class: 'ai-widgets' }, D.widgets.filter((w) => w.page === p.id).map((w) => el('label', { class: `ai-w t-${w.type}` },
          el('input', { type: 'checkbox', checked: plan.keep.has(w.id), onChange: (e) => { if (e.target.checked) plan.keep.add(w.id); else plan.keep.delete(w.id); summary.textContent = counts(); } }),
          el('span', { class: 'ai-w-type' }, DB_W_LABEL[w.type] || w.type),
          el('span', { class: 'ai-w-main' }, el('b', {}, w.title), el('span', { class: 'muted' }, describe(w), w.dataset && dsById[w.dataset] ? ` · from “${dsById[w.dataset].name}”` : '')))))));
      const create = btn('Create dashboard', async () => {
        if (!plan.keep.size) { toast('Keep at least one widget', 'err'); return; }
        create.disabled = true;
        try {
          const def = { ...D, widgets: D.widgets.filter((w) => plan.keep.has(w.id)) };
          const res = await api('/api/dashboards/ai/create', { method: 'POST', body: { name: nameIn.value.trim() || plan.name, description: plan.description, definition: def } });
          sessionStorage.setItem(`db-ai-${res.id}`, JSON.stringify({ used_ai: plan.used_ai, widgets: res.widgets, pages: res.pages, tables: plan.tables, warnings: plan.warnings }));
          close(true); location.hash = `#/dashboard/${res.id}`;
        } catch (e) { toast(e.message, 'err'); create.disabled = false; }
      }, { cls: 'primary', ic: 'check' });
      root.replaceChildren(
        el('div', { class: 'row' }, el('h2', { class: 'grow' }, 'Review the proposed dashboard'), el('span', { class: 'ai-steps' }, '1 Describe › ', el('b', {}, '2 Review'), ' › 3 Create'), btn('Close', () => close(null), { cls: 'sm' })),
        el('div', { class: 'ai-review-head' }, el('label', { class: 'lbl', style: { flex: 1 } }, 'Name', nameIn),
          el('div', { class: 'ai-badges' }, el('span', { class: 'chip' }, plan.used_ai ? 'Designed by AI' : 'Built-in designer'), el('span', { class: 'chip' }, `${plan.tables.length} table${plan.tables.length === 1 ? '' : 's'}`))),
        plan.relationships.length ? el('div', { class: 'ai-rels' }, el('b', {}, 'Relationships found: '),
          plan.relationships.map((r) => el('span', { class: 'chip' }, `${r.from.split('.').pop()}.${r.on[0]} → ${r.to.split('.').pop()}.${r.on[1]}`))) : null,
        plan.warnings.length ? el('ul', { class: 'ai-warn' }, plan.warnings.map((x) => el('li', {}, x))) : null,
        el('h3', { class: 'ai-h' }, `Datasets (${D.datasets.length})`),
        el('div', { class: 'ai-ds' }, D.datasets.map((d) => el('div', { class: 'ai-ds-card' },
          el('div', { class: 'row' }, el('b', { class: 'grow' }, d.name), d.rows != null ? el('span', { class: 'chip' }, `${d.rows.toLocaleString()} rows`) : null,
            d.timeColumn && d.timeColumn !== '__none__' ? el('span', { class: 'chip teal' }, `time: ${d.timeColumn}`) : null),
          d.purpose ? el('p', { class: 'muted small' }, d.purpose) : null,
          el('details', {}, el('summary', {}, 'SQL'), el('pre', { class: 'code' }, d.sql))))),
        el('div', { class: 'row', style: { alignItems: 'baseline' } }, el('h3', { class: 'ai-h grow' }, 'Visuals'), summary),
        el('p', { class: 'muted small' }, 'Untick anything you don\'t want. You can change everything later in Edit.'),
        el('div', { class: 'ai-pages' }, pages),
        D.filters.length ? el('p', { class: 'small' }, el('b', {}, 'Dashboard filters: '), D.filters.map((f) => f.label).join(', ')) : null,
        el('div', { class: 'actions' }, btn('Back', () => step1(), { cls: 'ghost' }), btn('Design again', () => step1(), {}), create));
    };
    step1();
    return root;
  }, { wide: true });
}

async function dbNewDialog() {
  const v = await openDialog((close) => {
    const name = el('input', { class: 'field', placeholder: 'e.g. Sales overview' });
    const mode = el('select', { class: 'field' }, el('option', { value: 'table' }, 'Build automatically from a table'), el('option', { value: 'blank' }, 'Blank dashboard'));
    const table = el('input', { class: 'field mono', placeholder: 'schema.table, e.g. gold.sales_daily', list: 'db-tables' });
    const dl = el('datalist', { id: 'db-tables' });
    (async () => { try { const dbs = await api('/api/catalog/databases'); for (const d of dbs.slice(0, 30)) { (await api(`/api/catalog/databases/${encodeURIComponent(d.name)}/tables`)).forEach((t) => dl.append(el('option', { value: `${d.name}.${t.name}` }))); } } catch { /* catalog optional */ } })();
    const tableRow = el('label', { class: 'lbl' }, 'Table', table, dl);
    mode.addEventListener('change', () => { tableRow.hidden = mode.value !== 'table'; });
    const f = el('form', { method: 'dialog' }, el('h2', {}, 'New dashboard'), el('label', { class: 'lbl' }, 'Name', name), el('label', { class: 'lbl' }, 'Start', mode), tableRow,
      el('div', { class: 'actions' }, el('button', { type: 'button', class: 'btn', onClick: () => close(null) }, 'Cancel'), el('button', { type: 'submit', class: 'btn primary' }, 'Create')));
    f.addEventListener('submit', (e) => { e.preventDefault(); close({ name: name.value.trim(), mode: mode.value, table: table.value.trim() }); });
    setTimeout(() => name.focus(), 0);
    return f;
  });
  if (!v || !v.name) return;
  try {
    const def = { datasets: [], filters: [], widgets: [], refreshMinutes: 0, currency: '₹' };
    if (v.mode === 'table' && v.table) def.datasets.push({ id: 'ds1', name: v.table.split('.').pop(), sql: `SELECT *\nFROM ${v.table}\nLIMIT 5000` });
    const d = await api('/api/dashboards', { method: 'POST', body: { name: v.name, definition: def } });
    if (v.mode === 'table' && v.table) {
      toast('Reading the table to build your dashboard…');
      try {
        const res = await api(`/api/dashboards/${d.id}/preview`, { method: 'POST', body: { sql: def.datasets[0].sql } });
        Object.assign(def, dbAutoWidgets('ds1', res.columns, res.rows));
        def.datasets[0].timeColumn = def.timeColumn; delete def.timeColumn;
        def.filters = dbAutoFilters('ds1', res.columns, res.rows);
        await api(`/api/dashboards/${d.id}`, { method: 'PUT', body: { definition: def } });
      } catch (e) { toast(`Created an empty dashboard: ${e.message}`, 'err'); }
    }
    location.hash = `#/dashboard/${d.id}`;
  } catch (e) { toast(e.message, 'err'); }
}

function dbColumnKinds(cols, rows) {
  return cols.map((c, i) => {
    const vals = rows.slice(0, 200).map((r) => r[i]).filter((v) => v != null);
    if (vals.length && vals.every(dbIsNum)) return /(^|_)(id|key|code|year)$/i.test(c) ? 'id' : 'num';
    if (vals.length && vals.every((v) => /^\d{4}-\d{2}-\d{2}/.test(String(v)))) return 'date';
    const distinct = new Set(vals).size;
    return distinct > 0 && distinct <= 60 ? 'cat' : 'text';
  });
}
const dbCap = (t) => t.replace(/^./, (m) => m.toUpperCase());
function dbAutoWidgets(ds, cols, rows) {
  const kinds = dbColumnKinds(cols, rows);
  const nums = cols.filter((_, i) => kinds[i] === 'num');
  const cats = cols.filter((_, i) => kinds[i] === 'cat');
  const dates = cols.filter((_, i) => kinds[i] === 'date');
  const nice = (c) => dbCap(c.replace(/_/g, ' '));
  const pages = [{ id: 'p1', name: 'Overview' }, { id: 'p2', name: 'Details' }];
  const w = [{ id: dbUid('w'), page: 'p1', type: 'insights', title: 'Smart insights', layout: { x: 0, y: 0, w: 3, h: 4 } }];
  const kpis = [];
  nums.slice(0, 4).forEach((n) => kpis.push({ title: nice(n), y: [n], agg: 'sum', format: /amount|sales|revenue|price|value|total|cost|discount|refund/i.test(n) ? 'currency_compact' : 'compact',
    lowerBetter: /discount|refund|cost|return|void|cancel/i.test(n) }));
  if (nums.length) kpis.push({ title: `Average ${nums[0].replace(/_/g, ' ')}`, y: [nums[0]], agg: 'avg', format: 'compact' });
  kpis.push({ title: 'Records', y: [cols[0]], agg: 'count', format: 'integer' });
  kpis.slice(0, 6).forEach((k, i) => w.push({ id: dbUid('w'), page: 'p1', type: 'kpi', dataset: ds, ...k, layout: { x: 3 + (i % 3) * 3, y: Math.floor(i / 3) * 2, w: 3, h: 2 } }));
  let y = 4;
  if (dates.length && nums.length) w.push({ id: dbUid('w'), page: 'p1', type: 'line', title: `${nice(nums[0])} over time`, dataset: ds, x: dates[0], y: [nums[0]], agg: 'sum', format: 'compact', ml: { forecast: 7, anomalies: true }, layout: { x: 0, y, w: cats.length ? 8 : 12, h: 4 } });
  if (cats.length && nums.length) w.push({ id: dbUid('w'), page: 'p1', type: 'hbar', title: `${nice(nums[0])} by ${cats[0].replace(/_/g, ' ')}`, dataset: ds, x: cats[0], y: [nums[0]], agg: 'sum', sort: 'value_desc', top: 10, format: 'compact', layout: { x: dates.length ? 8 : 0, y, w: dates.length ? 4 : 6, h: 4 } });
  y += 4;
  cats.slice(1, 3).forEach((c, i) => nums.length && w.push({ id: dbUid('w'), page: 'p1', type: 'pie', title: `${nice(nums[0])} by ${c.replace(/_/g, ' ')}`, dataset: ds, x: c, y: [nums[0]], agg: 'sum', top: 8, format: 'compact', layout: { x: i * 4, y, w: 4, h: 4 } }));
  w.push({ id: dbUid('w'), page: 'p2', type: 'table', title: 'All records', dataset: ds, columns: cols.slice(0, 10), layout: { x: 0, y: 0, w: 12, h: 7 } });
  const period = dates.length ? { preset: 'last_7_days', compare: true, column: dates[0], anchor: 'data' } : { preset: 'all', compare: true, column: '', anchor: 'data' };
  return { widgets: w, pages, period, timeColumn: dates[0] || '__none__', theme: 'vivid' };
}
function dbAutoFilters(ds, cols, rows) {
  const kinds = dbColumnKinds(cols, rows);
  return cols.filter((_, i) => kinds[i] === 'cat').slice(0, 2).map((c) => ({ id: dbUid('f'), label: c.replace(/_/g, ' ').replace(/^./, (m) => m.toUpperCase()), type: 'select', dataset: ds, column: c }));
}

/* ======================= dashboard view / editor ======================= */
async function viewDashboard(main, r) {
  const did = r.rest[0];
  main.classList.add('flush');
  let dash;
  try { dash = await api(`/api/dashboards/${did}`); } catch (e) { main.append(errBox(e)); return () => main.classList.remove('flush'); }
  const canEdit = !CURRENT_USER || CURRENT_USER.role !== 'viewer';
  const S = { D: plClone(dash.definition), name: dash.name, edit: false, results: {}, errors: {}, fvals: {}, cross: null, charts: {},
    selected: null, dirty: false, refreshTimer: null, loading: new Set(), options: {} };
  S.D.datasets = S.D.datasets || []; S.D.filters = S.D.filters || []; S.D.widgets = S.D.widgets || [];
  if (!S.D.pages || !S.D.pages.length) S.D.pages = [{ id: 'p1', name: 'Overview' }];
  S.D.widgets.forEach((w) => { if (!w.page || !S.D.pages.some((p) => p.id === w.page)) w.page = S.D.pages[0].id; });
  S.facets = {};
  S.panelTab = {};
  S.wf = {};            // widget id -> spec (for its own filters)
  S.localVals = {};     // widget id -> {column: value} chosen in the chart's dropdowns
  S.D.period = S.D.period || { preset: 'all', compare: true, column: '', anchor: 'data' };
  S.page = S.D.pages.some((p) => p.id === r.params.get('page')) ? r.params.get('page') : S.D.pages[0].id;
  S.app = r.params.get('app') === '1';
  document.body.classList.toggle('dash-app', S.app);
  const cur = () => S.D.currency || '₹';
  const pal = () => DB_THEMES[S.D.theme && S.D.theme !== 'auto' ? S.D.theme : DB_LOOK_PALETTE[S.D.look || 'clean']] || DB_THEMES.vivid;
  const tcol = (dsId) => { const d = S.D.datasets.find((x) => x.id === dsId); return d && d.timeColumn && d.timeColumn !== '__none__' ? d.timeColumn : null; };
  const periodEnabled = () => S.D.datasets.some((d) => tcol(d.id));
  function autoTimeColumns() {
    for (const d of S.D.datasets) {
      const res = S.results[d.id];
      if (d.timeColumn || !res) continue;
      if (S.D.period.column && res.columns.includes(S.D.period.column)) { d.timeColumn = S.D.period.column; continue; }
      const kinds = dbColumnKinds(res.columns, res.rows);
      const c = res.columns.find((_, i) => kinds[i] === 'date');
      if (c) d.timeColumn = c;
    }
  }
  S.D.filters.forEach((f) => { if (f.default != null) S.fvals[f.id] = f.default; });

  const titleEl = el('h1', { class: 'dash-title' }, dash.name);
  const stamp = el('span', { class: 'muted dash-stamp' });
  const bar = el('div', { class: 'dash-bar' });
  const filterBar = el('div', { class: 'dash-filters' });
  const crossEl = el('div', { class: 'dash-cross' });
  const grid = el('div', { class: 'dash-grid' });
  const pagesBar = el('nav', { class: 'dash-pages', 'aria-label': 'Dashboard pages' });
  const periodEl = el('div', { class: 'dash-period' });
  const side = el('aside', { class: 'dash-side', hidden: true });
  main.append(el('div', { class: 'dash' }, el('div', { class: 'dash-head' }, el('div', { class: 'grow' },
    el('div', { class: 'crumbs' }, el('a', { href: '#/dashboards' }, 'Dashboards'), el('span', {}, '/')), el('div', { class: 'row', style: { gap: '12px' } }, titleEl, stamp)), bar),
  pagesBar, el('div', { class: 'dash-filters-row' }, periodEl, filterBar), crossEl, el('div', { class: 'dash-body' }, grid, side)));

  /* ---------- params + client filters ---------- */
  function params() {
    const p = {};
    for (const f of S.D.filters) {
      const v = S.fvals[f.id];
      if (f.type === 'date_range') { if (f.paramFrom) p[f.paramFrom] = v && v.from || null; if (f.paramTo) p[f.paramTo] = v && v.to || null; }
      else if (f.param) p[f.param] = Array.isArray(v) ? (v.length ? v : null) : (v === '' || v == null ? null : v);
    }
    return p;
  }
  function sqlUses(ds, name) { return name && new RegExp(`\\{\\{\\s*${name}\\s*\\}\\}`).test(ds.sql || ''); }
  function condOk(v, op, val) {
    const n = Number(v), m = Number(val);
    const num = dbIsNum(v) || (v !== '' && v != null && !Number.isNaN(n) && !Number.isNaN(m));
    switch (op) {
      case 'neq': return String(v) !== String(val);
      case 'in': return (Array.isArray(val) ? val : String(val).split(',')).map((x) => String(x).trim()).includes(String(v));
      case 'gt': return num ? n > m : String(v) > String(val);
      case 'gte': return num ? n >= m : String(v) >= String(val);
      case 'lt': return num ? n < m : String(v) < String(val);
      case 'lte': return num ? n <= m : String(v) <= String(val);
      case 'contains': return String(v ?? '').toLowerCase().includes(String(val).toLowerCase());
      default: return String(v) === String(val);
    }
  }
  function applyWidgetFilters(spec, wid, cols, rows) {
    for (const c of spec.where || []) {
      const i = cols.indexOf(c.column);
      if (i >= 0 && c.value !== '' && c.value != null) rows = rows.filter((r) => condOk(r[i], c.op || 'eq', c.value));
    }
    const lv = S.localVals[wid] || {};
    for (const [col, val] of Object.entries(lv)) {
      const i = cols.indexOf(col);
      if (i >= 0 && val !== '' && val != null) rows = rows.filter((r) => String(r[i]) === String(val));
    }
    return rows;
  }
  function anchorDate() {
    if (S.D.period.anchor === 'today') return dbIso(new Date());
    let max = null;
    for (const d of S.D.datasets) {
      const res = S.results[d.id], tc = tcol(d.id);
      const i = res && tc ? res.columns.indexOf(tc) : -1;
      if (i < 0) continue;
      for (const r of res.rows) { const t = dbParseTime(r[i]); if (t != null && (max == null || t > max)) max = t; }
    }
    return max == null ? null : dbDay(max);
  }
  function windows() { return periodEnabled() ? dbWindows(S.D.period, anchorDate()) : { cur: null, prev: null }; }
  function clientRows(dsId, res, exceptWidget, win = 'cur') {
    const ds = S.D.datasets.find((d) => d.id === dsId);
    let rows = res.rows;
    const W = windows();
    const tc = tcol(dsId);
    const pi = tc ? res.columns.indexOf(tc) : -1;
    const range = typeof win === 'object' && win ? win : win === 'prev' ? W.prev : W.cur;
    if (pi >= 0 && range) {
      rows = rows.filter((r) => { const t = dbParseTime(r[pi]); if (t == null) return false; const d = dbDay(t); return d >= range.from && d <= range.to; });
    } else if (win !== 'cur') return [];
    for (const f of S.D.filters) {
      const v = S.fvals[f.id];
      if (v == null || v === '' || (Array.isArray(v) && !v.length)) continue;
      const fcol = (f.columnMap && f.columnMap[dsId]) || f.column;
      if (!fcol || !res.columns.includes(fcol)) continue;
      if (f.type === 'date_range' ? (sqlUses(ds, f.paramFrom) || sqlUses(ds, f.paramTo)) : sqlUses(ds, f.param)) continue;
      const i = res.columns.indexOf(fcol);
      if (f.type === 'date_range') rows = rows.filter((r) => { const t = dbParseTime(r[i]); const d = t == null ? '' : dbDay(t); return (!v.from || d >= v.from) && (!v.to || d <= v.to); });
      else if (Array.isArray(v)) rows = rows.filter((r) => v.includes(String(r[i])));
      else if (f.type === 'text') rows = rows.filter((r) => String(r[i] ?? '').toLowerCase().includes(String(v).toLowerCase()));
      else rows = rows.filter((r) => String(r[i]) === String(v));
    }
    if (S.cross && S.cross.widget !== exceptWidget && res.columns.includes(S.cross.column)) {
      const i = res.columns.indexOf(S.cross.column);
      rows = rows.filter((r) => String(r[i]) === S.cross.value);
    }
    const fc = S.facets[exceptWidget];
    if (fc && res.columns.includes(fc.column)) { const fi = res.columns.indexOf(fc.column); rows = rows.filter((r) => String(r[fi]) === String(fc.value)); }
    const spec = S.wf[exceptWidget];
    if (spec) rows = applyWidgetFilters(spec, exceptWidget, res.columns, rows);
    return rows;
  }

  /* ---------- data loading ---------- */
  async function loadAll(force = false) {
    const used = [...new Set(S.D.widgets.flatMap((w) => [w.dataset, ...(w.layers || []).map((L) => L.dataset),
      ...(w.children || []).flatMap((c) => [c.dataset || w.dataset, ...(c.layers || []).map((L) => L.dataset)])]).filter(Boolean))];
    const p = params();
    S.loading = new Set(used);
    drawGrid();
    await Promise.all(used.map(async (id) => {
      try { S.results[id] = await api(`/api/dashboards/${did}/query`, { method: 'POST', body: { dataset: id, params: p, force } }); delete S.errors[id]; }
      catch (e) { S.errors[id] = e.message; delete S.results[id]; }
      S.loading.delete(id);
      drawGrid();
    }));
    autoTimeColumns(); drawPeriod(); drawGrid();
    const times = Object.values(S.results).map((x) => x.cachedAt).filter(Boolean);
    stamp.textContent = times.length ? `Data as of ${new Date(Math.min(...times) * 1000).toLocaleTimeString()}` : '';
  }
  function setAutoRefresh() {
    clearInterval(S.refreshTimer);
    const m = Number(S.D.refreshMinutes || 0);
    if (m > 0) S.refreshTimer = setInterval(() => { if (!S.edit) loadAll(true); }, m * 60000);
  }

  /* ---------- toolbar ---------- */
  function drawBar() {
    const refreshSel = el('select', { class: 'field dash-refresh', 'aria-label': 'Auto-refresh' },
      [[0, 'Auto-refresh off'], [1, 'Every minute'], [5, 'Every 5 min'], [15, 'Every 15 min'], [60, 'Every hour']].map(([v, t]) => el('option', { value: v, selected: Number(S.D.refreshMinutes || 0) === v }, t)));
    refreshSel.addEventListener('change', () => { S.D.refreshMinutes = Number(refreshSel.value); setAutoRefresh(); if (canEdit) save(true); });
    if (!S.edit) {
      setKids(bar, refreshSel,
        btn('Refresh', () => loadAll(true), { ic: 'restart' }),
        btn('Ask Dora', () => dbAskDora(), { ic: 'flow' }),
        btn(S.D.fitScreen ? 'Scroll page' : 'Fit to screen', () => { S.D.fitScreen = !S.D.fitScreen; if (canEdit) save(true); drawBar(); drawGrid(); }, { ic: 'fold', title: 'Fit every widget on one screen (no scrolling)' }),
        btn('Present', () => presentStory(), { cls: 'present-btn', ic: 'play', title: 'AI turns this page into slides and explains what is happening' }),
        btn('Export PDF', () => window.print(), { ic: 'download' }),
        btn(S.app ? 'Exit app view' : 'App view', () => { S.app = !S.app; document.body.classList.toggle('dash-app', S.app); history.replaceState(null, '', `#/dashboard/${did}${S.app ? '?app=1' : ''}`); setTimeout(() => Object.values(S.charts).forEach((c) => c.resize()), 50); drawBar(); }, { ic: 'fold', title: 'Full-screen view without DataBridge menus — good for sharing on a screen' }),
        canEdit ? btn('Edit', () => { S.edit = true; drawAll(); }, { cls: 'primary', ic: 'edit' }) : null);
    } else {
      const addMenu = el('select', { class: 'field dash-add', 'aria-label': 'Add widget' }, el('option', { value: '' }, '+ Add widget'),
        Object.entries(DB_TYPES).map(([k, t]) => el('option', { value: k }, t)));
      addMenu.addEventListener('change', () => { if (addMenu.value) addWidget(addMenu.value); addMenu.value = ''; });
      setKids(bar, addMenu, btn('Datasets', () => openSide('datasets'), { ic: 'db' }), btn('Filters', () => openSide('filters'), { ic: 'fold' }),
        btn('Settings', () => openSide('settings'), { ic: 'gear' }),
        btn('Tidy layout', () => { tidyLayout(); S.dirty = true; drawGrid(); toast('Gaps removed'); }, { ic: 'fold', title: 'Move widgets up to fill empty space' }),
        btn('Done', async () => { await save(); S.edit = false; S.selected = null; drawAll(); }, { cls: 'primary', ic: 'save' }));
    }
  }

  /* ---------- filters bar ---------- */
  async function options(f) {
    const key = `${f.dataset}|${f.column}`;
    if (!S.options[key]) {
      const res = S.results[f.dataset];
      if (res && res.columns.includes(f.column) && !res.truncated) {
        const i = res.columns.indexOf(f.column);
        S.options[key] = [...new Set(res.rows.map((r) => r[i]).filter((v) => v != null).map(String))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      } else {
        try { S.options[key] = (await api(`/api/dashboards/${did}/options`, { method: 'POST', body: { dataset: f.dataset, column: f.column } })).map(String); }
        catch { S.options[key] = []; }
      }
    }
    return S.options[key];
  }
  function drawFilters() {
    if (!S.D.filters.length) { filterBar.hidden = true; return; }
    filterBar.hidden = false;
    filterBar.replaceChildren(...S.D.filters.map((f) => {
      const box = el('label', { class: 'dash-filter' }, el('span', {}, f.label || f.column || f.param));
      const apply = () => { S.cross = null; drawCross(); const sqlParam = S.D.datasets.some((d) => sqlUses(d, f.param) || sqlUses(d, f.paramFrom) || sqlUses(d, f.paramTo)); if (sqlParam) loadAll(); else drawGrid(); };
      if (f.type === 'date_range') {
        const v = S.fvals[f.id] || {};
        const a = el('input', { type: 'date', class: 'field', value: v.from || '', 'aria-label': `${f.label} from` });
        const b = el('input', { type: 'date', class: 'field', value: v.to || '', 'aria-label': `${f.label} to` });
        const set = () => { S.fvals[f.id] = { from: a.value, to: b.value }; apply(); };
        a.addEventListener('change', set); b.addEventListener('change', set);
        box.append(el('span', { class: 'row', style: { gap: '6px' } }, a, el('span', { class: 'muted' }, 'to'), b));
      } else if (f.type === 'text') {
        const i = el('input', { class: 'field', value: S.fvals[f.id] || '', placeholder: 'Type and press Enter' });
        i.addEventListener('change', () => { S.fvals[f.id] = i.value.trim(); apply(); });
        box.append(i);
      } else {
        const multi = f.type === 'multiselect';
        const sel = el('select', { class: 'field', multiple: multi || null }, multi ? null : el('option', { value: '' }, 'All'));
        const cur = S.fvals[f.id];
        options(f).then((opts) => { sel.append(...opts.map((o) => el('option', { value: o, selected: multi ? (cur || []).includes(o) : cur === o }, o))); });
        sel.addEventListener('change', () => { S.fvals[f.id] = multi ? [...sel.selectedOptions].map((o) => o.value) : sel.value; apply(); });
        box.append(sel);
      }
      return box;
    }), btn('Clear filters', () => { S.fvals = {}; S.cross = null; drawFilters(); drawCross(); loadAll(); }, { cls: 'sm ghost' }));
  }
  function drawCross() {
    crossEl.hidden = !S.cross;
    if (S.cross) setKids(crossEl, el('span', { class: 'muted' }, 'Filtered by click:'),
      el('button', { type: 'button', class: 'chip dash-chip', onClick: () => { S.cross = null; drawCross(); drawGrid(); } }, `${S.cross.column} = ${S.cross.value}  ✕`));
  }

  /* ---------- grid + widgets ---------- */
  function placement(w) {
    const l = w.layout || (w.layout = { x: 0, y: 0, w: 6, h: 4 });
    return { gridColumn: `${l.x + 1} / span ${Math.min(l.w, DB_COLS - l.x)}`, gridRow: `${l.y + 1} / span ${l.h}` };
  }
  const pageWidgets = () => S.D.widgets.filter((w) => w.page === S.page);
  const dashRoot = () => main.querySelector('.dash');
  function themeVar(name, fallback) { const r = dashRoot(); const v = r ? getComputedStyle(r).getPropertyValue(name).trim() : ''; return v || fallback; }
  function applyLook() { const r = dashRoot(); if (!r) return; r.className = `dash look-${S.D.look || 'clean'}${S.D.fitScreen && !S.edit ? ' fit' : ''}`; }
  function drawPages() {
    const tabs = S.D.pages.map((p) => {
      const b = el('button', { type: 'button', class: 'dash-tab', 'aria-current': p.id === S.page ? 'page' : null,
        onClick: () => { if (S.page !== p.id) { S.page = p.id; S.cross = null; drawCross(); drawPages(); drawGrid(); } } }, p.name);
      if (S.edit) b.addEventListener('dblclick', async () => {
        const v = await formDialog({ title: 'Rename page', submit: 'Rename', fields: [{ name: 'name', label: 'Page name', value: p.name }] });
        if (v && v.name.trim()) { p.name = v.name.trim(); S.dirty = true; drawPages(); }
      });
      return b;
    });
    setKids(pagesBar, ...tabs,
      S.edit ? btn('Page', async () => {
        const v = await formDialog({ title: 'New page', submit: 'Add page', fields: [{ name: 'name', label: 'Page name', value: `Page ${S.D.pages.length + 1}` }] });
        if (!v || !v.name.trim()) return;
        const p = { id: dbUid('p'), name: v.name.trim() }; S.D.pages.push(p); S.page = p.id; S.dirty = true; drawPages(); drawGrid();
      }, { cls: 'sm ghost', ic: 'plus', title: 'Add a page' }) : null,
      S.edit && S.D.pages.length > 1 ? btn('Delete page', async () => {
        const p = S.D.pages.find((x) => x.id === S.page);
        const n = pageWidgets().length;
        if (!(await confirmDialog(`Delete page “${p.name}”?`, n ? `Its ${n} widget${n === 1 ? '' : 's'} will be removed too.` : 'The page is empty.', 'Delete'))) return;
        S.D.widgets = S.D.widgets.filter((w) => w.page !== p.id); S.D.pages = S.D.pages.filter((x) => x !== p); S.page = S.D.pages[0].id; S.dirty = true; drawPages(); drawGrid();
      }, { cls: 'sm ghost', ic: 'trash' }) : null,
      S.edit ? el('span', { class: 'muted dash-tab-hint' }, 'Double-click a tab to rename it') : null);
    pagesBar.hidden = S.D.pages.length < 2 && !S.edit;
  }
  function drawPeriod() {
    const p = S.D.period;
    if (!periodEnabled()) { periodEl.hidden = true; return; }
    periodEl.hidden = false;
    const sel = el('select', { class: 'field', 'aria-label': 'Period' }, Object.entries(DB_PERIODS).map(([k, t]) => el('option', { value: k, selected: p.preset === k }, t)));
    sel.addEventListener('change', () => { p.preset = sel.value; if (canEdit && S.edit) S.dirty = true; drawPeriod(); drawGrid(); });
    const cmp = el('label', { class: 'switch' }, el('input', { type: 'checkbox', checked: p.compare !== false, onChange: (e) => { p.compare = e.target.checked; drawPeriod(); drawGrid(); } }), 'Compare with previous period');
    const kids = [el('span', { class: 'dash-period-lbl' }, 'Period'), sel];
    if (p.preset === 'custom') {
      const a = el('input', { type: 'date', class: 'field', value: p.from || '', 'aria-label': 'From' });
      const b2 = el('input', { type: 'date', class: 'field', value: p.to || '', 'aria-label': 'To' });
      const set = () => { p.from = a.value; p.to = b2.value; drawPeriod(); drawGrid(); };
      a.addEventListener('change', set); b2.addEventListener('change', set);
      kids.push(a, el('span', { class: 'muted' }, 'to'), b2);
    }
    if (p.preset !== 'all') kids.push(cmp);
    const W = windows();
    if (W.cur) kids.push(el('span', { class: 'dash-period-range' }, `${dbShortDate(W.cur.from)} – ${dbShortDate(W.cur.to)}`,
      W.prev ? el('span', { class: 'muted' }, `  vs ${dbShortDate(W.prev.from)} – ${dbShortDate(W.prev.to)}`) : null));
    setKids(periodEl, ...kids);
  }
  function drawGrid() {
    Object.values(S.charts).forEach((c) => c.destroy());
    S.charts = {};
    grid.classList.toggle('editing', S.edit);
    const ws = pageWidgets();
    if (!ws.length) {
      grid.replaceChildren(el('div', { class: 'dash-empty' }, el('h2', {}, 'This dashboard is empty'),
        el('p', { class: 'muted' }, canEdit ? 'Add a dataset (your SQL), then add widgets — or ask Dora a question.' : 'An editor has not added widgets yet.'),
        canEdit ? el('div', { class: 'row', style: { gap: '8px', justifyContent: 'center' } },
          btn('Ask Dora', () => dbAskDora(), { cls: 'primary' }), btn('Edit dashboard', () => { S.edit = true; drawAll(); })) : null));
      return;
    }
    const rowsUsed = Math.max(...ws.map((w) => (w.layout ? w.layout.y + w.layout.h : 4)));
    applyLook();
    let rowH = DB_ROW_H;
    if (S.D.fitScreen && !S.edit) {                       // one screen, no scrolling: rows shrink to fit the window
      const mr = main.getBoundingClientRect(), gr = grid.getBoundingClientRect();
      const avail = Math.max(300, Math.min(window.innerHeight, mr.bottom) - (gr.top + (main.scrollTop || 0) - (mr.top < 0 ? 0 : 0)) - 22);
      const gap = rowsUsed * 1 > 0 ? 10 : DB_GAP;            // dense gap
      rowH = Math.max(24, Math.floor((avail - gap * (rowsUsed - 1)) / rowsUsed));
    }
    grid.classList.toggle('dense', rowH < 64);
    grid.classList.toggle('xdense', rowH < 46);
    grid.style.gridTemplateRows = `repeat(${rowsUsed + (S.edit ? 4 : 0)}, ${rowH}px)`;
    grid.replaceChildren(...ws.map(widgetEl));
  }
  function widgetEl(w) {
    S.wf[w.id] = w;
    const p = placement(w);
    const card = el('article', { class: `dash-w t-${w.type}${S.selected === w.id ? ' sel' : ''}`, style: p, 'data-id': w.id });
    const res = w.dataset ? S.results[w.dataset] : null;
    const err = w.dataset ? S.errors[w.dataset] : null;
    const menu = el('div', { class: 'dash-w-menu' },
      res && w.type !== 'text' ? el('button', { type: 'button', title: 'Download CSV', 'aria-label': 'Download CSV', onClick: () => csvOf(w) }, 'CSV') : null,
      S.charts && ['bar', 'hbar', 'line', 'area', 'pie'].includes(w.type) ? el('button', { type: 'button', title: 'Download image', 'aria-label': 'Download PNG', onClick: () => pngOf(w) }, 'PNG') : null,
      res && ['kpi', 'bar', 'hbar', 'line', 'area', 'pie'].includes(w.type) ? el('button', { type: 'button', class: 'dora-mini', title: 'Ask Dora about this', 'aria-label': 'Ask Dora about this widget', onClick: () => doraExplain('widget', w) }, 'Ask Dora') : null,
      w.dataset ? el('button', { type: 'button', title: 'View SQL', 'aria-label': 'View SQL', onClick: () => plJsonDialog(`${w.title || 'Widget'} — SQL`, (S.D.datasets.find((d) => d.id === w.dataset) || {}).sql || '') }, 'SQL') : null);
    const ctrls = (w.filterControls || []).length && res ? el('div', { class: 'w-filters' }, w.filterControls.filter((c) => res.columns.includes(c)).map((col) => {
      const i = res.columns.indexOf(col);
      const freq = new Map();
      for (const r of res.rows) { const k = r[i] == null ? null : String(r[i]); if (k != null) freq.set(k, (freq.get(k) || 0) + 1); }
      const vals = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 60).map((e) => e[0]).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      const cur = (S.localVals[w.id] || {})[col] || '';
      const sel = el('select', { class: 'w-filter', 'aria-label': `Filter ${w.title} by ${col}`, title: `Filter this chart by ${col}` },
        el('option', { value: '' }, `All ${col.replace(/_/g, ' ')}`), vals.map((v) => el('option', { value: v, selected: v === cur }, v)));
      sel.addEventListener('pointerdown', (e) => e.stopPropagation());
      sel.addEventListener('change', () => { S.localVals[w.id] = { ...(S.localVals[w.id] || {}), [col]: sel.value }; drawGrid(); });
      return sel;
    })) : null;
    const pinned = (w.where || []).filter((c) => c.column && c.value !== '' && c.value != null);
    const head = el('header', { class: 'dash-w-head' }, el('h3', {}, w.title || DB_TYPES[w.type]),
      pinned.length && w.type !== 'kpi' ? el('span', { class: 'w-pinned', title: pinned.map((c) => `${c.column} ${c.op || 'eq'} ${c.value}`).join(' and ') }, `${pinned.length} filter${pinned.length > 1 ? 's' : ''}`) : null,
      ctrls, menu);
    const body = el('div', { class: 'dash-w-body' });
    card.append(head, body);
    if (S.edit) {
      card.append(el('span', { class: 'dash-resize', title: 'Drag to resize', 'aria-hidden': 'true' }));
      card.addEventListener('pointerdown', (e) => startDrag(e, w, card));
    }
    if (w.type === 'text') { body.innerHTML = DOMPurify.sanitize(marked.parse(w.text || '_Write text in the editor._')); return card; }
    if (w.type === 'insights') { renderInsights(w, card, body); return card; }
    if (w.type === 'panel') { renderPanel(w, card, body); return card; }
    if (!w.dataset) { body.append(el('p', { class: 'muted dash-msg' }, S.edit ? 'Choose a dataset for this widget.' : 'No data source.')); return card; }
    if (err) { body.append(el('div', { class: 'error-box dash-msg' }, err)); return card; }
    if (!res) { body.append(el('div', { class: 'dash-skel' })); return card; }
    const rows = clientRows(w.dataset, res, w.id);
    try { renderWidget(w, res.columns, rows, body); }
    catch (e2) { body.replaceChildren(el('p', { class: 'muted dash-msg' }, `Check this widget's settings: ${e2.message}`)); }
    return card;
  }
  function renderWidget(w, cols, rows, body) {
    if (w.type === 'kpi') {
      const k = kpiValues(w);
      const card = body.parentElement;
      const tone = k.change == null || Math.abs(k.change) < 0.01 ? 'flat' : ((k.change > 0) !== !!w.lowerBetter ? 'good' : 'bad');
      const kstyle = w._panel ? 'tinted' : (w.kpiStyle || S.D.kpiStyle || 'tinted');
      card.classList.remove('good', 'bad', 'flat', 'kpi-gradient', 'kpi-gauge', 'kpi-spark-line'); card.classList.add(tone);
      if (w._panel) card.classList.add('t-kpi');
      const valueTxt = dbFmt(k.cur, w.format || 'compact', cur());
      const full = dbIsNum(k.cur) ? dbFmt(k.cur, String(w.format || '').startsWith('currency') ? 'currency' : 'number', cur()) : '';
      const badge = k.change != null ? el('span', { class: `kpi-badge ${tone}`, title: `Change vs ${k.label || 'previous period'}` }, `${k.change > 0 ? '▲ +' : '▼ '}${(k.change * 100).toFixed(1)}%`) : null;
      const prevLine = k.prev != null ? el('div', { class: 'kpi-prev', title: `Compared with ${k.label}` }, el('span', { class: 'kpi-prev-l' }, k.label), dbFmt(k.prev, w.format || 'compact', cur()))
        : el('div', { class: 'kpi-s' }, w.subtitle || `${DB_AGGS[w.agg || 'sum']} of ${(w.y || [])[0] || ''}`);
      if (kstyle === 'gradient') {
        const P = pal();
        const idx = Math.max(0, pageWidgets().filter((x) => x.type === 'kpi').indexOf(S.wf[w.id] || w));
        const c1 = P[idx % P.length], c2 = P[(idx + 1) % P.length];
        card.classList.add('kpi-gradient');
        card.style.background = `linear-gradient(135deg, ${c1} 0%, ${c2} 130%)`;
        const sp = k.spark.length > 1 ? sparkLine(k.spark, 'rgba(255,255,255,.9)') : null;
        body.append(el('div', { class: 'kpi-g' }, el('div', { class: 'kpi-v', title: full }, valueTxt), el('div', { class: 'kpi-g-foot' }, prevLine, badge), sp));
        return;
      }
      card.style.background = '';
      if (kstyle === 'gauge') {
        card.classList.add('kpi-gauge');
        const pct = String(w.format || '') === 'percent';
        const target = w.target != null && w.target !== '' && Number.isFinite(Number(w.target)) ? Number(w.target) : null;
        const max = target || (pct ? 1 : Math.max(dbIsNum(k.cur) ? k.cur : 0, dbIsNum(k.prev) ? k.prev : 0) * 1.25) || 1;
        const ratio = dbIsNum(k.cur) ? Math.max(0, Math.min(1, k.cur / max)) : 0;
        const color = tone === 'bad' ? '#E5484D' : tone === 'good' ? '#22A06B' : 'var(--lagoon)';
        body.append(el('div', { class: 'kpi-gauge-wrap' }, gaugeSvg(ratio, color),
          el('div', { class: 'kpi-gauge-v', title: full }, valueTxt),
          el('div', { class: 'kpi-gauge-scale' }, el('span', {}, '0'), el('span', {}, target ? `target ${dbFmt(target, w.format || 'compact', cur())}` : dbFmt(max, w.format || 'compact', cur())))),
        el('div', { class: 'kpi-gauge-foot' }, prevLine, badge));
        return;
      }
      if (kstyle === 'spark') {
        card.classList.add('kpi-spark-line');
        body.append(el('div', { class: 'kpi-wrap' }, el('div', { class: 'kpi-main' }, el('div', { class: 'kpi-v', title: full }, valueTxt), prevLine),
          el('div', { class: 'kpi-side' }, badge, k.spark.length > 1 ? sparkLine(k.spark, tone === 'bad' ? '#E5484D' : tone === 'good' ? '#22A06B' : '#0A5CFF', true) : null)));
        return;
      }
      const left = el('div', { class: 'kpi-main' }, el('div', { class: 'kpi-v', title: full }, valueTxt), prevLine);
      const right = el('div', { class: 'kpi-side' }, badge,
        k.spark.length > 1 ? el('div', { class: 'kpi-spark', 'aria-hidden': 'true' }, k.spark.map((v) => el('i', { style: `height:${Math.max(6, (v / Math.max(...k.spark, 1)) * 100)}%` }))) : null);
      body.append(el('div', { class: 'kpi-wrap' }, left, right));
      return;
    }
    if (w.type === 'table') {
      const show = (w.columns && w.columns.length ? w.columns : cols).filter((c) => cols.includes(c));
      const idx = show.map((c) => cols.indexOf(c));
      const numIdx = idx.filter((i) => rows.slice(0, 200).some((r) => dbIsNum(r[i])) && !/(^|_)(id|key|code|year)$/i.test(cols[i]));
      const heat = w.heat !== false, totals = w.totals !== false;
      const rng = Object.fromEntries(numIdx.map((i) => { const xs = rows.map((r) => r[i]).filter(dbIsNum); return [i, [Math.min(...xs), Math.max(...xs)]]; }));
      const P = pal();
      const tint = (i, v) => { if (!heat || !rng[i] || !dbIsNum(v)) return null; const [a, b] = rng[i]; const t = b > a ? (v - a) / (b - a) : 0.5;
        const c = P[numIdx.indexOf(i) % P.length]; return `background:${c}${Math.round(12 + t * 150).toString(16).padStart(2, '0')}`; };
      let sortI = null, dir = 1;
      const tb = el('tbody');
      const paint = () => {
        let rs = rows.slice();
        if (sortI != null) rs.sort((a, b) => { const x = a[idx[sortI]], y2 = b[idx[sortI]]; return (x > y2 ? 1 : x < y2 ? -1 : 0) * dir; });
        tb.replaceChildren(...rs.slice(0, 500).map((r) => el('tr', {}, idx.map((i) => el('td', { class: dbIsNum(r[i]) ? 'num' : '', style: tint(i, r[i]) },
          dbIsNum(r[i]) ? (numIdx.includes(i) ? dbFmt(r[i], w.format || 'compact', cur()) : String(r[i])) : r[i] == null ? '' : String(r[i]))))));
      };
      const thead = el('thead', {}, el('tr', {}, show.map((c, k2) => el('th', { class: numIdx.includes(idx[k2]) ? 'num' : '', onClick: () => { if (sortI === k2) dir = -dir; else { sortI = k2; dir = 1; } paint(); } }, c.replace(/_/g, ' ')))));
      const tfoot = totals && numIdx.length ? el('tfoot', {}, el('tr', {}, idx.map((i, k2) => el('td', { class: numIdx.includes(i) ? 'num' : '' },
        k2 === 0 && !numIdx.includes(i) ? 'Total' : numIdx.includes(i) ? dbFmt(rows.reduce((s2, r) => s2 + (dbIsNum(r[i]) ? r[i] : 0), 0), w.format || 'compact', cur()) : '')))) : null;
      paint();
      body.append(el('div', { class: `dash-table${heat ? ' heat' : ''}` }, el('table', { class: 't grid' }, thead, tb, tfoot)),
        el('div', { class: 'muted dash-foot' }, `${rows.length.toLocaleString('en-IN')} row${rows.length === 1 ? '' : 's'}${rows.length > 500 ? ' · first 500 shown' : ''}`));
      return;
    }
    renderChart(w, cols, rows, body);
  }
  /* ---------- multi-chart panel: several sub-charts in one card ---------- */
  const SUB_TYPES = { bar: 'Bar', hbar: 'Horizontal bar', line: 'Line', area: 'Area', pie: 'Pie / donut', kpi: 'KPI' };
  function childWidget(w, c, i) {
    const cw = { ...c, id: `${w.id}__${i}`, dataset: c.dataset || w.dataset, format: c.format || w.format || 'compact', _panel: w.id, _compact: true };
    if (c.facet) S.facets[cw.id] = c.facet; else delete S.facets[cw.id];
    S.wf[cw.id] = c;
    return cw;
  }
  function panelCols(w, n) {
    if (w.panelCols && w.panelCols !== 'auto') return Math.min(Number(w.panelCols), n);
    const width = (w.layout || {}).w || 6;
    const max = Math.max(1, Math.min(n, width >= 10 ? 4 : width >= 7 ? 3 : width >= 4 ? 2 : 1));
    const rows = Math.ceil(n / max);
    return Math.ceil(n / rows);                      // balanced: 4 -> 2x2, 5 -> 3+2, 6 -> 3x2
  }
  /* fill in a value (and X) column for sub-charts created before their data had loaded */
  function ensureChildDefaults(w, c) {
    const res = S.results[c.dataset || w.dataset];
    if (!res) return;
    const kinds = dbColumnKinds(res.columns, res.rows);
    if (!(c.y || []).filter((y) => res.columns.includes(y)).length) {
      const num = res.columns.find((_, k) => kinds[k] === 'num') || res.columns.find((_, k) => kinds[k] === 'id');
      if (num) { c.y = [num]; S.dirty = true; }
    }
    if (!c.x && c.type !== 'kpi') {
      const x = res.columns.find((_, k) => kinds[k] === 'cat') || res.columns.find((_, k) => kinds[k] === 'date');
      if (x) { c.x = x; S.dirty = true; }
    }
  }
  function drawChild(w, c, i, holder, compact = true) {
    ensureChildDefaults(w, c);
    const cw = childWidget(w, c, i);
    cw._compact = compact;
    const res = cw.dataset ? S.results[cw.dataset] : null;
    if (!cw.dataset) { holder.append(el('p', { class: 'muted dash-msg' }, 'No dataset')); return null; }
    if (S.errors[cw.dataset]) { holder.append(el('div', { class: 'error-box dash-msg' }, S.errors[cw.dataset])); return null; }
    if (!res) { holder.append(el('div', { class: 'dash-skel' })); return null; }
    try { renderWidget(cw, res.columns, clientRows(cw.dataset, res, cw.id), holder); }
    catch (e) { holder.replaceChildren(el('p', { class: 'muted dash-msg' }, `Check this sub-chart: ${e.message}`)); }
    return S.charts[cw.id] || null;
  }
  function renderPanel(w, card, body) {
    const kids = w.children || [];
    if (!kids.length) { body.append(el('p', { class: 'muted dash-msg' }, S.edit ? 'Add sub-charts in the panel settings →' : 'Empty panel.')); return; }
    body.classList.add('panel-body');
    if ((w.panelMode || 'grid') === 'tabs') { renderPanelTabs(w, body); return; }
    const cols = panelCols(w, kids.length);
    const gridEl = el('div', { class: 'panel-grid', style: `--cols:${cols};--rows:${Math.ceil(kids.length / cols)}` });
    body.append(gridEl);
    const charts = [];
    kids.forEach((c, i) => {
      const cellBody = el('div', { class: 'panel-cell-body' });
      gridEl.append(el('div', { class: `panel-cell sub-${c.type}` }, el('h4', { title: c.title || '' }, c.title || SUB_TYPES[c.type] || c.type), cellBody));
      const ch = drawChild(w, c, i, cellBody);
      if (ch) charts.push(ch);
    });
    if (w.syncHover !== false && charts.length > 1) syncHover(charts);
  }
  /* one chart at a time; hover (or click) a tab to switch */
  function renderPanelTabs(w, body) {
    const kids = w.children;
    let active = Math.min(S.panelTab[w.id] ?? 0, kids.length - 1);
    const bar = el('div', { class: 'panel-tabs', role: 'tablist', 'aria-label': `${w.title || 'Panel'} charts` });
    const stage = el('div', { class: 'panel-stage', role: 'tabpanel' });
    body.append(bar, stage);
    const tabs = [];
    const show = (i, focus) => {
      const old = S.charts[`${w.id}__${active}`];
      if (old) { old.destroy(); delete S.charts[`${w.id}__${active}`]; }
      active = i; S.panelTab[w.id] = i;
      tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
      if (focus) tabs[i].focus();
      stage.className = `panel-stage sub-${kids[i].type}`;
      const holder = el('div', { class: 'panel-cell-body' });
      stage.replaceChildren(holder);
      drawChild(w, kids[i], i, holder, false);     // full-size chart in tab mode
    };
    kids.forEach((c, i) => {
      const t = el('button', { type: 'button', role: 'tab', class: 'panel-tab', title: c.title || '' }, c.title || SUB_TYPES[c.type] || `Chart ${i + 1}`);
      let timer = null;
      t.addEventListener('click', () => { clearTimeout(timer); if (active !== i) show(i); });
      t.addEventListener('mouseenter', () => { if (S.edit) return; timer = setTimeout(() => { if (active !== i) show(i); }, 180); });
      t.addEventListener('mouseleave', () => clearTimeout(timer));
      t.addEventListener('keydown', (e) => {
        const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (d) { e.preventDefault(); show((i + d + kids.length) % kids.length, true); }
      });
      tabs.push(t); bar.append(t);
    });
    show(active);
  }
  /* hovering a label in one sub-chart highlights the same label in the others */
  function syncHover(charts) {
    const clear = (except) => charts.forEach((c) => { if (c === except) return; c.setActiveElements([]); c.tooltip.setActiveElements([], { x: 0, y: 0 }); c.update('none'); });
    charts.forEach((ch) => {
      const canvas = ch.canvas;
      canvas.addEventListener('mousemove', (evt) => {
        const els = ch.getElementsAtEventForMode(evt, 'index', { intersect: false }, false);
        if (!els.length) return;
        const label = ch.data.labels[els[0].index];
        charts.forEach((o) => {
          if (o === ch) return;
          const j = o.data.labels.indexOf(label);
          if (j < 0) { o.setActiveElements([]); o.tooltip.setActiveElements([], { x: 0, y: 0 }); o.update('none'); return; }
          const act = o.data.datasets.map((d, di) => ({ datasetIndex: di, index: j })).filter((a) => o.data.datasets[a.datasetIndex].data[j] != null && !String(o.data.datasets[a.datasetIndex].label).startsWith('__'));
          if (!act.length) return;
          const meta = o.getDatasetMeta(act[0].datasetIndex).data[j];
          o.setActiveElements(act);
          o.tooltip.setActiveElements(act, { x: meta ? meta.x : 0, y: meta ? meta.y : 0 });
          o.update('none');
        });
      });
      canvas.addEventListener('mouseleave', () => clear(ch));
    });
  }
  function toSubChart(w) {
    return { type: ['bar', 'hbar', 'line', 'area', 'pie', 'kpi'].includes(w.type) ? w.type : 'bar', title: w.title, dataset: w.dataset, x: w.x, y: (w.y || []).slice(), agg: w.agg,
      grain: w.grain, sort: w.sort, top: w.top, format: w.format, ml: w.ml, lowerBetter: w.lowerBetter, compare: w.compare, target: w.target, colorBy: w.colorBy };
  }
  function smallMultiples(w, column, n) {
    const res = S.results[w.dataset];
    if (!res || !res.columns.includes(column)) { toast('Load the data first', 'err'); return; }
    const i = res.columns.indexOf(column);
    const yi = res.columns.indexOf((w.y || [])[0]);
    const totals = new Map();
    for (const r of res.rows) { const k = r[i] == null ? null : String(r[i]); if (k == null) continue; totals.set(k, (totals.get(k) || 0) + (yi >= 0 && dbIsNum(r[yi]) ? r[yi] : 1)); }
    const values = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map((e) => e[0]);
    if (!values.length) { toast('That column has no values', 'err'); return; }
    const base = toSubChart(w);
    Object.assign(w, { type: 'panel', title: `${w.title} by ${column.replace(/_/g, ' ')}`, children: values.map((v) => ({ ...base, title: v, facet: { column, value: v } })),
      panelCols: 'auto', syncHover: true, layers: undefined });
    if (w.layout.w < 8 && values.length > 2) w.layout.w = Math.min(12, 8);
    const cols = panelCols(w, values.length);
    w.layout.h = Math.max(w.layout.h, Math.ceil(values.length / cols) * 3);
    resolveCollisions(w);
    S.dirty = true; drawGrid(); openSide('widget');
  }
  const COMBINABLE = ['bar', 'hbar', 'line', 'area'];
  const PANELABLE = ['bar', 'hbar', 'line', 'area', 'pie', 'kpi', 'panel'];
  function gradientFill(color) {
    return (ctx) => {
      const { chart } = ctx;
      if (!chart.chartArea) return `${color}33`;
      const g = chart.ctx.createLinearGradient(0, chart.chartArea.top, 0, chart.chartArea.bottom);
      g.addColorStop(0, `${color}66`); g.addColorStop(1, `${color}05`);
      return g;
    };
  }
  /* aggregate a widget/layer spec; buckets date/timestamp X columns by grain */
  function seriesFor(spec, dsId, rows, cols) {
    let r = rows, grain = null, isTime = false;
    if (spec.x) {
      const i = cols.indexOf(spec.x);
      const sample = rows.slice(0, 60).map((x) => x[i]).filter((v) => v != null);
      const timeLike = spec.x === tcol(dsId) || (sample.length && sample.every((v) => typeof v === 'string' && dbParseTime(v) != null));
      if (timeLike) { const b = dbBucketRows(cols, rows, spec.x, spec.grain); if (b.grain) { r = b.rows; grain = b.grain; isTime = true; } }
    }
    const agg = dbAggregate(cols, r, isTime ? { ...spec, sort: 'label', top: 0 } : spec);
    return { ...agg, isTime, grain };
  }
  function chartData(w, rows, cols) {
    const base = seriesFor(w, w.dataset, rows, cols);
    const labels = base.labels.slice();
    const countName = (w.agg === 'count' || w.agg === 'countd') && base.series.length === 1 && !w.series ? (w.title || 'Count').replace(/\s+(over time|by .*)$/i, '') : null;
    const sets = base.series.map((s) => ({ name: countName || s.name, map: new Map(base.labels.map((l, i) => [l, s.data[i]])), src: 'base' }));
    for (const L of w.layers || []) {
      const res = S.results[L.dataset];
      if (!res) continue;
      const lr = seriesFor({ ...L, grain: L.grain || (base.isTime ? base.grain : undefined) }, L.dataset, clientRows(L.dataset, res, w.id), res.columns);
      lr.series.forEach((s) => sets.push({ name: L.title ? (lr.series.length > 1 ? `${L.title} · ${s.name}` : L.title) : s.name,
        map: new Map(lr.labels.map((l, i) => [l, s.data[i]])), type: L.type, axis: L.axis || 'auto', src: 'layer', layer: L }));
      lr.labels.forEach((l) => { if (!labels.includes(l)) labels.push(l); });
    }
    if (base.isTime) labels.sort();
    return { base, labels, sets };
  }
  function renderChart(w, cols, rows, body) {
    const P = pal();
    const { base, labels, sets } = chartData(w, rows, cols);
    if (!sets.length) { body.append(el('p', { class: 'muted dash-msg' }, S.edit ? 'Pick a value column for this chart.' : 'This chart has no value column yet.')); return; }
    if (!labels.length) { body.append(el('p', { class: 'muted dash-msg' }, 'No rows match the current filters.')); return; }
    if (w.type === 'funnel') { renderFunnel(w, labels, sets[0], body); return; }
    const isPie = w.type === 'pie', hbar = w.type === 'hbar';
    const baseType = isPie ? 'doughnut' : hbar ? 'bar' : w.type === 'area' ? 'line' : w.type;
    const maxOf = (s) => Math.max(0, ...[...s.map.values()].filter(dbIsNum).map(Math.abs));
    const baseMax = Math.max(1, ...sets.filter((s) => s.src === 'base').map(maxOf));
    sets.forEach((s) => { s.axisId = s.src !== 'layer' ? 'y' : s.axis === 'right' ? 'y1' : s.axis === 'left' ? 'y' : (maxOf(s) > baseMax * 6 || maxOf(s) * 6 < baseMax ? 'y1' : 'y'); });
    const hasRight = !hbar && sets.some((s) => s.axisId === 'y1');
    const ml = w.ml || {};
    const mlOK = base.isTime && !isPie && !hbar;
    const y0 = labels.map((l) => { const v = sets[0].map.get(l); return dbIsNum(v) ? v : null; });
    const fc = mlOK && ml.forecast > 0 ? dbForecast(y0.map((v) => v ?? 0), Number(ml.forecast), dbSeasonFor(base.grain, y0.length)) : null;
    const fut = fc ? dbNextLabels(labels[labels.length - 1], base.grain, Number(ml.forecast)) : [];
    const all = labels.concat(fut);
    const pad = (a) => a.concat(fut.map(() => null));
    const single = sets.length === 1;
    const datasets = sets.map((s, k) => {
      const color = P[k % P.length];
      const data = pad(labels.map((l) => (s.map.has(l) ? s.map.get(l) : null)));
      if (isPie) return { label: s.name, data, backgroundColor: labels.map((_, i) => P[i % P.length]), borderColor: getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() || '#fff', borderWidth: 2, hoverOffset: 8 };
      const t = s.type || (s.src === 'layer' && baseType === 'bar' ? 'line' : baseType);
      const perBar = t === 'bar' && single && !w.series && w.colorBy !== 'single' && !base.isTime;   // categories only, not dates
      return { type: t, label: s.name, data, yAxisID: hbar ? undefined : s.axisId,
        borderColor: color, backgroundColor: perBar ? labels.map((_, i) => P[i % P.length]) : t === 'line' ? gradientFill(color) : color,
        borderWidth: t === 'line' ? 2.5 : 0, fill: t === 'line' && (w.type === 'area' || single), tension: 0.35, spanGaps: true,
        pointRadius: w._compact || labels.length > 40 ? 0 : 3, pointHoverRadius: 5, pointBackgroundColor: color, borderRadius: t === 'bar' ? (w._compact ? 3 : 6) : 0,
        maxBarThickness: 46, stack: w.stacked && t === 'bar' ? 'all' : undefined, order: t === 'line' ? 1 : 2 };
    });
    if (mlOK) {
      const ys = y0.map((v) => v ?? 0);
      if (ml.trend) { const lr = dbLinReg(ys); datasets.push({ type: 'line', label: 'Trend', data: all.map((_, i) => lr.intercept + lr.slope * i), borderColor: '#64748B', borderDash: [6, 5], borderWidth: 1.5, pointRadius: 0, fill: false, yAxisID: 'y', order: 0 }); }
      if (Number(ml.movingAvg) > 1) datasets.push({ type: 'line', label: `${ml.movingAvg}-${base.grain} average`, data: pad(dbMovingAvg(ys, Number(ml.movingAvg))), borderColor: '#F59E0B', borderWidth: 2, pointRadius: 0, fill: false, yAxisID: 'y', order: 0 });
      if (fc) {
        const li = labels.length - 1, lv = y0[li];
        const at = (arr) => all.map((_, i) => (i === li ? lv : i > li ? arr[i - li - 1] : null));
        datasets.push({ type: 'line', label: '__band_hi', data: at(fc.upper), borderWidth: 0, pointRadius: 0, fill: false, yAxisID: 'y', order: 0 });
        datasets.push({ type: 'line', label: '__band_lo', data: at(fc.lower), borderWidth: 0, pointRadius: 0, backgroundColor: 'rgba(139,92,246,0.16)', fill: '-1', yAxisID: 'y', order: 0 });
        datasets.push({ type: 'line', label: `Forecast (${fc.method})`, data: at(fc.values), borderColor: '#8B5CF6', borderDash: [5, 4], borderWidth: 2.5, pointRadius: 2.5, pointBackgroundColor: '#8B5CF6', fill: false, yAxisID: 'y', order: 0 });
      }
      if (ml.anomalies) {
        const an = dbAnomalies(ys, 3.5, dbSeasonFor(base.grain, ys.length));
        if (an.length) datasets.push({ type: 'line', label: 'Anomaly', data: all.map((_, i) => (an.some((a) => a.i === i) ? y0[i] : null)), showLine: false, pointRadius: 7, pointHoverRadius: 9, pointBackgroundColor: '#EF4444', pointBorderColor: '#fff', pointBorderWidth: 2, borderColor: '#EF4444', yAxisID: 'y', order: -1 });
      }
    }
    const canvas = el('canvas', { role: 'img', 'aria-label': `${DB_TYPES[w.type]}: ${w.title || ''}` });
    body.append(el('div', { class: 'dash-canvas' }, canvas));
    const fmt = (v) => dbFmt(v, w.format || 'compact', cur());
    const hidden = (lbl) => String(lbl).startsWith('__band');
    S.charts[w.id] = new Chart(canvas, {
      type: baseType,
      data: { labels: all, datasets: isPie ? datasets.slice(0, 1) : datasets },
      options: {
        responsive: true, maintainAspectRatio: false, animation: { duration: 350 }, color: themeVar('--d-muted', Chart.defaults.color),
        indexAxis: hbar ? 'y' : 'x', cutout: isPie ? '58%' : undefined,
        interaction: isPie ? undefined : { mode: 'index', intersect: false },
        plugins: {
          legend: { display: isPie ? !w._compact || labels.length <= 6 : datasets.length > 1 && !w._compact, position: isPie ? 'right' : 'bottom',
            labels: { boxWidth: 12, usePointStyle: true, font: { family: 'IBM Plex Sans' }, filter: (it) => !hidden(it.text) } },
          tooltip: { filter: (it) => !hidden(it.dataset.label) && it.raw != null,
            callbacks: { label: (c) => `${c.dataset.label}: ${fmt(c.raw)}`, footer: (items) => (fut.includes(items[0] && items[0].label) ? 'Forecast — 80% range shaded' : '') } },
        },
        scales: isPie ? {} : {
          [hbar ? 'x' : 'y']: { beginAtZero: true, stacked: !!w.stacked, ticks: { callback: (v) => fmt(v), maxTicksLimit: w._compact ? 4 : undefined, font: { size: w._compact ? 10 : 12 } }, grid: { color: themeVar('--d-grid', getComputedStyle(document.documentElement).getPropertyValue('--chart-grid').trim() || '#EEF1F6') } },
          ...(hasRight ? { y1: { position: 'right', beginAtZero: true, grid: { display: false }, ticks: { callback: (v) => fmt(v) } } } : {}),
          [hbar ? 'y' : 'x']: { stacked: !!w.stacked, grid: { display: false }, ticks: { autoSkip: true, maxRotation: 0, maxTicksLimit: w._compact ? (hbar ? 8 : 4) : undefined, font: { size: w._compact ? 10 : 12 } } },
        },
        onClick: (evt, els) => {
          if (S.edit || !els.length || !w.x || base.isTime) return;
          const label = all[els[0].index];
          S.cross = S.cross && S.cross.value === label && S.cross.column === w.x ? null : { column: w.x, value: label, widget: w.id };
          setTimeout(() => { drawCross(); drawGrid(); }, 0);
        },
        onHover: (evt, els) => { evt.native.target.style.cursor = els.length && !S.edit && w.x && !base.isTime ? 'pointer' : 'default'; },
      },
    });
  }
  function renderFunnel(w, labels, set, body) {
    let stages = labels.map((l) => [l, set.map.get(l)]).filter(([, v]) => dbIsNum(v));
    if (w.sort !== 'label') stages.sort((a, b) => b[1] - a[1]);
    stages = stages.slice(0, w.top || 8);
    const P = pal(), top = Math.max(...stages.map((s2) => s2[1]), 1);
    const fmt = (v) => dbFmt(v, w.format || 'compact', cur());
    const canvas = el('canvas', { role: 'img', 'aria-label': `Funnel: ${w.title || ''}` });
    body.append(el('div', { class: 'dash-canvas' }, canvas));
    S.charts[w.id] = new Chart(canvas, {
      type: 'bar',
      data: { labels: stages.map((s2) => s2[0]), datasets: [{ label: w.title || 'Funnel', data: stages.map(([, v]) => [-(v / top) * 50, (v / top) * 50]), raw: stages.map((s2) => s2[1]),
        backgroundColor: stages.map((_, i) => P[i % P.length]), borderRadius: 6, borderSkipped: false, barPercentage: 0.92, categoryPercentage: 1 }] },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, animation: { duration: 350 }, color: themeVar('--d-muted', Chart.defaults.color),
        layout: { padding: { right: 8 } },
        scales: { x: { display: false, min: -52, max: 52 }, y: { grid: { display: false }, ticks: { color: themeVar('--d-text', Chart.defaults.color), font: { weight: '600' } } } },
        plugins: { legend: { display: false },
          tooltip: { callbacks: { label: (c) => { const v = stages[c.dataIndex][1], prev = c.dataIndex ? stages[c.dataIndex - 1][1] : null;
            return `${fmt(v)} · ${((v / stages[0][1]) * 100).toFixed(1)}% of first${prev ? ` · ${((v / prev) * 100).toFixed(1)}% from previous` : ''}`; } } } } },
      plugins: [{ id: 'funnelLabels', afterDatasetsDraw(ch) {
        const { ctx } = ch; const meta = ch.getDatasetMeta(0);
        ctx.save(); ctx.font = '700 12px IBM Plex Sans, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff';
        meta.data.forEach((bar, i) => { const v = stages[i][1]; const pctTxt = i ? ` · ${((v / stages[0][1]) * 100).toFixed(0)}%` : '';
          ctx.fillText(`${fmt(v)}${pctTxt}`, (bar.x + bar.base) / 2, bar.y); });
        ctx.restore(); } }],
    });
  }
  function kpiValues(w) {
    const res = S.results[w.dataset];
    if (!res) return { cur: null, prev: null, change: null, spark: [], label: '' };
    const y = (w.y || [])[0] || res.columns[0];
    const one = (rows) => { const a = dbAggregate(res.columns, rows, { x: null, y: [y], agg: w.agg || 'sum' }); return a.series[0] ? a.series[0].data[0] : null; };
    const curRows = clientRows(w.dataset, res, w.id, 'cur');
    const W = windows();
    const tc = tcol(w.dataset);
    const hasTime = !!(W.cur && tc && res.columns.includes(tc));
    const mode = w.compare || 'period';
    let pv = null, label = '', prevRows = null;
    if (mode === 'target' && w.target !== '' && w.target != null && Number.isFinite(Number(w.target))) { pv = Number(w.target); label = 'target'; }
    else if (mode === 'year' && hasTime) {
      const shift = (iso) => `${Number(iso.slice(0, 4)) - 1}${iso.slice(4)}`;
      prevRows = clientRows(w.dataset, res, w.id, { from: shift(W.cur.from), to: shift(W.cur.to) });
      pv = prevRows.length ? one(prevRows) : null; label = 'last year';
    } else if (mode === 'period' && hasTime && W.prev) {
      prevRows = clientRows(w.dataset, res, w.id, 'prev'); pv = prevRows.length ? one(prevRows) : null; label = 'prev';
    }
    const cv = one(curRows);
    const change = dbIsNum(cv) && dbIsNum(pv) && pv !== 0 ? (cv - pv) / Math.abs(pv) : null;
    let spark = [];
    if (tc && res.columns.includes(tc)) {
      const b = dbBucketRows(res.columns, curRows, tc, 'day');
      const a = dbAggregate(res.columns, b.rows, { x: tc, y: [y], agg: w.agg === 'count' || w.agg === 'countd' ? 'count' : w.agg === 'avg' ? 'avg' : 'sum' });
      spark = (a.series[0] ? a.series[0].data : []).slice(-14).map((v) => (dbIsNum(v) ? Math.max(0, v) : 0));
    }
    return { cur: cv, prev: pv, change, spark, curRows, prevRows, label };
  }
  /* rule-based insights from the numbers on this dashboard (no AI key needed) */
  function expandedWidgets(pageId) {
    return S.D.widgets.filter((w) => !pageId || w.page === pageId).flatMap((w) => (w.type === 'panel' ? (w.children || []).map((c, i) => {
      const cw = childWidget(w, c, i); cw.title = `${w.title} · ${c.title || i + 1}`; return cw; }) : [w]));
  }
  /* data-specific insights for one page: weekday-aware bad/good days, losing streaks, category movers */
  function pageDataInsights(pageId) {
    const out = [];
    const ws = S.D.widgets.filter((w) => w.page === pageId);
    const seen = new Set();
    const metricOf = (w) => ({ col: (w.y || [])[0], title: (w.title || '').replace(/\s+(over time|trend|by .*)$/i, '').replace(/^Avg\s+/i, 'Average ') || (w.y || [])[0], w });
    const specs = [];
    for (const w of ws.flatMap((x) => (x.type === 'panel' ? (x.children || []).map((c) => ({ ...c, dataset: c.dataset || x.dataset, format: c.format || x.format })) : [x]))) {
      if (!w.dataset || !(w.y || []).length || !S.results[w.dataset]) continue;
      const key = `${w.dataset}|${w.y[0]}`;
      if (seen.has(key)) continue;
      seen.add(key); specs.push(metricOf(w));
    }
    const W = windows();
    for (const [mi, m] of specs.slice(0, 3).entries()) {
      const w = m.w, res = S.results[w.dataset], tc = tcol(w.dataset);
      const fmt = (v) => dbFmt(v, w.format && w.format !== 'integer' ? w.format : 'compact', cur());
      const lowerBetter = !!w.lowerBetter || /discount|refund|cost|return|void|cancel/i.test(m.col);
      const name = dbCap(String(m.title || m.col).replace(/_/g, ' '));
      const yi = res.columns.indexOf(m.col);
      if (yi < 0) continue;
      const AGG = w.agg || 'sum';
      const valOf = (r) => (AGG === 'count' || AGG === 'countd' ? 1 : r[yi]);
      const ok = (r) => (AGG === 'count' || AGG === 'countd' ? r[yi] != null : dbIsNum(r[yi]));
      const reduceAll = (sumv, n) => (AGG === 'avg' ? (n ? sumv / n : 0) : sumv);
      if (tc && res.columns.includes(tc)) {
        // full history by day (for weekday norms), current window for what to report
        const ti = res.columns.indexOf(tc);
        const acc = new Map();
        for (const r of applyWidgetFilters(w, '', res.columns, res.rows)) {
          const t = dbParseTime(r[ti]); if (t == null || !ok(r)) continue;
          const d = dbDay(t); const a = acc.get(d) || [0, 0]; a[0] += valOf(r); a[1] += 1; acc.set(d, a);
        }
        const all = new Map([...acc.entries()].map(([d, [sv, n]]) => [d, reduceAll(sv, n)]));
        const days = [...all.keys()].sort();
        const inWin = days.filter((d) => !W.cur || (d >= W.cur.from && d <= W.cur.to));
        if (inWin.length >= 3) {
          const dow = (d) => new Date(`${d}T00:00:00Z`).getUTCDay();
          const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
          const norm = Array.from({ length: 7 }, (_, k) => med(days.filter((d) => dow(d) === k && !inWin.includes(d)).map((d) => all.get(d))) ||
                                                        med(days.filter((d) => dow(d) === k).map((d) => all.get(d))));
          let worst = null, best = null;
          for (const d of inWin) {
            const n = norm[dow(d)]; if (!n) continue;
            const dev = (all.get(d) - n) / Math.abs(n);
            if (!worst || dev < worst.dev) worst = { d, dev, n };
            if (!best || dev > best.dev) best = { d, dev, n };
          }
          const nice = (d) => new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
          const bad = lowerBetter ? best : worst, good = lowerBetter ? worst : best;
          if (bad && Math.abs(bad.dev) >= 0.2) out.push({ tag: 'Bad day', score: Math.min(1, 0.55 + Math.abs(bad.dev)), good: false,
            title: `${name} ${lowerBetter ? 'spiked' : 'dropped'} on ${nice(bad.d)}`,
            text: `${name} was ${fmt(all.get(bad.d))} on ${nice(bad.d)} — ${Math.abs(bad.dev * 100).toFixed(0)}% ${bad.dev < 0 ? 'below' : 'above'} a typical ${DOW[dow(bad.d)]} (${fmt(bad.n)}).` });
          if (good && Math.abs(good.dev) >= 0.25) out.push({ tag: 'Best day', score: Math.min(0.9, 0.4 + Math.abs(good.dev) / 2), good: true,
            title: `${name}: best day ${nice(good.d)}`,
            text: `${nice(good.d)} reached ${fmt(all.get(good.d))}, ${Math.abs(good.dev * 100).toFixed(0)}% ${good.dev > 0 ? 'above' : 'below'} a typical ${DOW[dow(good.d)]}.` });
          let streak = 1;
          for (let k = inWin.length - 1; k > 0; k--) { if (all.get(inWin[k]) < all.get(inWin[k - 1])) streak++; else break; }
          const first = all.get(inWin[inWin.length - streak]), last = all.get(inWin[inWin.length - 1]);
          if (streak >= 3 && !lowerBetter && first && (first - last) / Math.abs(first) >= 0.05) out.push({ tag: 'Streak', score: 0.6 + streak * 0.05, good: false,
            title: `${name} has fallen ${streak} days in a row`,
            text: `From ${fmt(all.get(inWin[inWin.length - streak]))} on ${nice(inWin[inWin.length - streak])} to ${fmt(all.get(inWin[inWin.length - 1]))} on ${nice(inWin[inWin.length - 1])}.` });
        }
      }
      // category movers: which product category / region / channel drove the change
      if (mi === 0 && W.cur && W.prev && tc && res.columns.includes(tc)) {
        const cats = new Set(ws.flatMap((x) => [x.x, x.series, ...(x.children || []).map((c) => c.x)]).filter((c) => c && c !== tc && res.columns.includes(c)));
        const kinds = dbColumnKinds(res.columns, res.rows);
        res.columns.forEach((c, i) => { if (kinds[i] === 'cat' && cats.size < 3) cats.add(c); });
        const cur2 = applyWidgetFilters(w, '', res.columns, clientRows(w.dataset, res, '__ins__', 'cur'));
        const prev2 = applyWidgetFilters(w, '', res.columns, clientRows(w.dataset, res, '__ins__', 'prev'));
        const tot = (rows) => { let sv = 0, n = 0; for (const r of rows) if (ok(r)) { sv += valOf(r); n++; } return reduceAll(sv, n); };
        const totalDelta = tot(cur2) - tot(prev2);
        for (const c of [...cats].slice(0, 2)) {
          const ci = res.columns.indexOf(c);
          const sum = (rows) => { const m2 = new Map(); for (const r of rows) { if (!ok(r)) continue; const k = r[ci] == null ? '(blank)' : String(r[ci]); const a = m2.get(k) || [0, 0]; a[0] += valOf(r); a[1]++; m2.set(k, a); }
            return new Map([...m2.entries()].map(([k, [sv, n]]) => [k, reduceAll(sv, n)])); };
          const a = sum(cur2), b = sum(prev2);
          const moves = [...new Set([...a.keys(), ...b.keys()])].map((k) => ({ k, d: (a.get(k) || 0) - (b.get(k) || 0), base: b.get(k) || 0 }));
          if (!moves.length) continue;
          const down = moves.reduce((x, y) => (y.d < x.d ? y : x)), up = moves.reduce((x, y) => (y.d > x.d ? y : x));
          const label = c.replace(/_/g, ' ');
          const pick = (mv, isDown) => {
            if (!mv || mv.d === 0) return;
            const rel = mv.base ? Math.abs(mv.d / mv.base) : 1;
            const shareOf = totalDelta ? Math.abs(mv.d / totalDelta) : 0;
            if (rel < 0.05 && !(shareOf >= 0.3 && Math.sign(totalDelta) === Math.sign(mv.d))) return;   // not meaningful
            const pct = mv.base ? ` (${mv.d > 0 ? '+' : '−'}${Math.abs(mv.d / mv.base * 100).toFixed(0)}%)` : '';
            const share = totalDelta && Math.sign(totalDelta) === Math.sign(mv.d) && Math.abs(mv.d / totalDelta) <= 1 ? `, ${Math.abs(mv.d / totalDelta * 100).toFixed(0)}% of the total change` : '';
            const isGood = (mv.d > 0) !== lowerBetter;
            out.push({ tag: isDown ? 'Decline' : 'Growth', score: 0.5 + Math.min(0.45, Math.abs(mv.d) / (Math.abs(totalDelta) + Math.abs(mv.d) || 1)), good: isGood,
              title: `${dbCap(label)} “${mv.k}” ${mv.d < 0 ? 'fell' : 'grew'} the most`,
              text: `${name} for ${label} “${mv.k}” ${mv.d < 0 ? 'fell' : 'rose'} by ${fmt(Math.abs(mv.d))}${pct} vs the previous period${share}.` });
          };
          pick(down.d < 0 ? down : null, true);
          pick(up.d > 0 && up.k !== down.k ? up : null, false);
        }
      }
    }
    return out;
  }
  function buildInsights(pageId) {
    const out = [];
    const fmt = (w, v) => dbFmt(v, w.format || 'compact', cur());
    for (const w of expandedWidgets(pageId).filter((x) => x.type === 'kpi' && x.dataset && S.results[x.dataset])) {
      const k = kpiValues(w);
      if (k.change == null || Math.abs(k.change) < 0.05) continue;     // only meaningful moves
      const up = k.change > 0;
      const good = up !== !!w.lowerBetter;
      const vs = k.label === 'target' ? 'its target' : k.label === 'last year' ? 'the same period last year' : 'the previous period';
      out.push({ tag: k.label === 'target' ? 'Target' : 'Change', score: Math.min(1, Math.abs(k.change) * 3), good, title: w.title || 'Metric',
        text: `${w.title || 'This metric'} is ${up ? 'up' : 'down'} ${Math.abs(k.change * 100).toFixed(2)}% against ${vs} (${fmt(w, k.prev)} → ${fmt(w, k.cur)}).` });
    }
    for (const w of expandedWidgets(pageId).filter((x) => ['bar', 'hbar', 'line', 'area', 'pie'].includes(x.type) && x.dataset && S.results[x.dataset])) {
      const res = S.results[w.dataset];
      const { base, labels, sets } = chartData(w, clientRows(w.dataset, res, w.id), res.columns);
      if (!labels.length) continue;
      const series = sets.map((st) => ({ name: st.name, data: labels.map((l) => (dbIsNum(st.map.get(l)) ? st.map.get(l) : null)) }));
      dbChartInsights({ title: w.title || DB_TYPES[w.type], labels, series, isTime: base.isTime, grain: base.grain, fmt: (v) => fmt(w, v), lowerBetter: w.lowerBetter })
        .forEach((it) => out.push(it));
    }
    pageDataInsights(pageId).forEach((it) => out.push(it));
    // keep the most useful, drop near-duplicates (same title) and low-value noise
    const seenT = new Set();
    const perTag = {};
    return out.filter((x) => !(x.tag === 'Volatility' || (x.tag === 'Correlation' && x.score < 0.6)))
      .map((x) => ({ ...x, score: x.score + (x.good ? 0 : 0.12) }))                  // problems first
      .sort((x, y) => y.score - x.score)
      .filter((x) => (seenT.has(x.title) ? false : seenT.add(x.title)))
      .filter((x) => { perTag[x.tag] = (perTag[x.tag] || 0) + 1; return perTag[x.tag] <= 3; });
  }
  function renderInsights(w, card, body) {
    const loadingAny = S.D.widgets.some((x) => x.dataset && !S.results[x.dataset] && !S.errors[x.dataset]);
    const list = buildInsights(w.page);
    const head = card.querySelector('.dash-w-head h3');
    if (head && list.length) head.append(el('span', { class: 'ins-count' }, String(list.length)));
    const expanded = !!w._all;
    const shown = expanded ? list : list.slice(0, 6);
    const items = shown.map((it) => el('div', { class: `ins-item ${it.good ? 'good' : 'bad'}${it.anomaly ? ' anomaly' : ''}` },
      el('div', { class: 'ins-title' }, el('span', { class: `ins-tag t-${(it.tag || 'Change').toLowerCase()}` }, it.tag || 'Change'), it.title), el('p', {}, it.text)));
    body.classList.add('ins-body');
    body.append(...(items.length ? items : [el('p', { class: 'muted dash-msg' }, loadingAny ? 'Reading your numbers…'
      : 'No notable patterns in the current data. Try a longer period, or add charts over time.')]),
    el('div', { class: 'ins-actions' },
      list.length > 6 ? btn(expanded ? 'Show fewer' : `View all ${list.length}`, () => { w._all = !expanded; drawGrid(); }, { cls: 'sm ghost' }) : null,
      btn('Ask Dora for a summary', () => doraExplain('dashboard', null, list), { cls: 'sm' })));
  }
  function widgetSummary(w) {
    const res = S.results[w.dataset];
    if (!res) return '';
    if (w.type === 'kpi') { const k = kpiValues(w); return `KPI "${w.title}": current ${k.cur}, previous ${k.prev}, change ${k.change == null ? 'n/a' : (k.change * 100).toFixed(2) + '%'}${w.lowerBetter ? ' (lower is better)' : ''}`; }
    const a = dbAggregate(res.columns, clientRows(w.dataset, res, w.id), w);
    const lines = a.labels.slice(0, 40).map((l, i) => `${l}: ${a.series.map((s) => `${s.name}=${s.data[i] == null ? '' : Math.round(s.data[i] * 100) / 100}`).join(', ')}`);
    return `Chart "${w.title}" (${DB_TYPES[w.type]}, ${DB_AGGS[w.agg || 'sum']} of ${(w.y || []).join(', ')} by ${w.x || '-'}):\n${lines.join('\n')}`;
  }
  /* ---------- Present with AI: slides + narration for the current page ---------- */
  function chartStats(w) {
    const res = S.results[w.dataset];
    if (!res || !w.x) return null;
    const a = dbAggregate(res.columns, clientRows(w.dataset, res, w.id), w);
    const s0 = a.series[0];
    if (!s0) return null;
    const pairs = a.labels.map((l, i) => [String(l), s0.data[i]]).filter(([, v]) => dbIsNum(v));
    if (!pairs.length) return null;
    const f = (v) => dbFmt(v, w.format || 'compact', cur());
    const isTime = pairs.slice(0, 5).every(([l]) => dbParseTime(l) != null);
    const total = pairs.reduce((t, [, v]) => t + v, 0);
    if (isTime) {
      const sorted = pairs.slice().sort((x, y) => (dbParseTime(x[0]) - dbParseTime(y[0])));
      const first = sorted[0][1], last = sorted[sorted.length - 1][1];
      const peak = sorted.reduce((m, p) => (p[1] > m[1] ? p : m)), low = sorted.reduce((m, p) => (p[1] < m[1] ? p : m));
      return { time: true, first, last, first_fmt: f(first), last_fmt: f(last), trend: first ? (last - first) / Math.abs(first) : null,
        peak: [peak[0].slice(0, 10), f(peak[1])], low: [low[0].slice(0, 10), f(low[1])], points: sorted.length, total_fmt: f(total) };
    }
    const sorted = pairs.slice().sort((x, y) => y[1] - x[1]);
    return { time: false, top: [sorted[0][0], f(sorted[0][1])], bottom: sorted.length > 1 ? [sorted.at(-1)[0], f(sorted.at(-1)[1])] : null,
      top_share: total ? sorted[0][1] / total : null, total_fmt: f(total), count: sorted.length };
  }
  function widgetImage(w) {
    const c = grid.querySelector(`.dash-w[data-id="${w.id}"] canvas`);
    if (!c || !c.width) return null;
    try {   // paint on the card colour so dark/transparent charts stay readable
      const out = document.createElement('canvas'); out.width = c.width; out.height = c.height;
      const ctx = out.getContext('2d'); ctx.fillStyle = getComputedStyle(c.closest('.dash-w')).backgroundColor || '#fff';
      ctx.fillRect(0, 0, out.width, out.height); ctx.drawImage(c, 0, 0); return out.toDataURL('image/png');
    } catch { return null; }
  }
  async function presentStory() {
    const ws = pageWidgets().filter((w) => w.type !== 'text');
    const kpis = ws.filter((w) => w.type === 'kpi' && S.results[w.dataset]);
    const charts = ws.filter((w) => !['kpi', 'insights', 'text'].includes(w.type) && (w.dataset || w.type === 'panel'));
    const W = windows();
    const period = W.cur ? `${W.cur.from} – ${W.cur.to}${W.prev ? ` vs ${W.prev.from} – ${W.prev.to}` : ''}` : 'All dates';
    const facts = [
      ...kpis.map((w) => { const k = kpiValues(w); return { id: w.id, type: 'kpi', title: w.title, value: dbFmt(k.cur, w.format || 'compact', cur()),
        previous: k.prev != null ? dbFmt(k.prev, w.format || 'compact', cur()) : null, change: k.change, compare: k.label || 'previous period', lowerBetter: !!w.lowerBetter }; }),
      ...charts.map((w) => {
        const src = w.type === 'panel' ? { ...(w.children || [])[0], dataset: ((w.children || [])[0] || {}).dataset || w.dataset, id: w.id } : w;
        return { id: w.id, type: w.type, title: w.title, metric: (w.title || '').replace(/\s+(over time|trend|by .*)$/i, ''), dimension: (src.x || '').replace(/_/g, ' '),
          stats: src && src.x ? chartStats(src) : null, summary: src && src.dataset ? widgetSummary(src) : '' };
      }),
    ];
    const insights = buildInsights(S.page).slice(0, 10).map((i) => ({ tag: i.tag, title: i.title, text: i.text, good: !!i.good }));
    const imgs = Object.fromEntries(charts.map((w) => [w.id, widgetImage(w)]));
    const shade = el('div', { class: 'story', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Dashboard presentation' },
      el('div', { class: 'story-loading' }, el('div', { class: 'story-spin' }), el('b', {}, 'Preparing your presentation…'), el('span', {}, 'Reading the KPIs, charts and insights on this page')));
    document.body.append(shade);
    let st;
    try { st = await api(`/api/dashboards/${did}/story`, { method: 'POST', body: { name: S.name, period, currency: cur(), facts, insights } }); }
    catch (e) { shade.remove(); toast(e.message, 'err'); return; }
    // ---- slides
    const slides = [];
    slides.push({ kind: 'title', speak: `Hi everyone. Let me walk you through ${st.title}. ${st.summary}`,
      node: el('div', { class: 'ss ss-title' }, el('div', { class: 'ss-kicker' }, 'DataBridge · AI presentation'), el('h1', {}, st.title),
        el('div', { class: 'ss-sub' }, st.subtitle || period), el('p', { class: 'ss-summary' }, st.summary)) });
    if (kpis.length) {
      slides.push({ kind: 'kpi', speak: `Let's start with the big picture. ${st.kpi.narration}`,
        node: el('div', { class: 'ss' }, el('h2', {}, st.kpi.headline),
          el('div', { class: 'ss-kpis' }, facts.filter((f) => f.type === 'kpi').map((f) => {
            const good = f.change != null && (f.change > 0) !== f.lowerBetter, flat = f.change == null || Math.abs(f.change) < 0.005;
            return el('div', { class: `ss-kpi ${flat ? 'flat' : good ? 'good' : 'bad'}` }, el('span', {}, f.title), el('b', {}, f.value),
              f.change != null ? el('em', {}, flat ? `no change vs ${f.compare}` : `${f.change > 0 ? '▲' : '▼'} ${(Math.abs(f.change) * 100).toFixed(1)}% vs ${f.compare}`) : el('em', {}, ' '));
          })), el('p', { class: 'ss-narr' }, st.kpi.narration)) });
    }
    for (const s of st.slides) {
      const w = charts.find((x) => x.id === s.id);
      if (!w) continue;
      const img = imgs[w.id];
      slides.push({ kind: 'chart', speak: `${['Now', 'Next', 'Moving on', 'Here'][slides.length % 4]}, ${s.narration.charAt(0).toLowerCase()}${s.narration.slice(1)} ${s.action ? `My suggestion: ${s.action}` : ''}`,
        node: el('div', { class: 'ss ss-chart' }, el('div', { class: 'ss-visual' }, el('div', { class: 'ss-vtitle' }, w.title),
            img ? el('img', { src: img, alt: w.title }) : el('div', { class: 'ss-noimg' }, 'Chart preview unavailable')),
          el('div', { class: 'ss-text' }, el('h2', {}, s.headline), el('p', { class: 'ss-narr' }, s.narration),
            s.bullets && s.bullets.length ? el('ul', {}, s.bullets.map((b2) => el('li', {}, b2))) : null,
            s.action ? el('div', { class: 'ss-action' }, el('b', {}, 'Suggested action'), el('span', {}, s.action)) : null)) });
    }
    if (insights.length) {
      slides.push({ kind: 'insights', speak: `A few things stood out. ${insights.slice(0, 3).map((x) => x.text).join(' ')}`,
        node: el('div', { class: 'ss' }, el('h2', {}, 'Key insights'), el('div', { class: 'ss-ins' }, insights.slice(0, 6).map((i) =>
          el('div', { class: `ss-in ${i.good ? 'good' : 'bad'}` }, el('span', { class: 'ss-tag' }, i.tag), el('b', {}, i.title), el('span', {}, i.text))))) });
    }
    const sent = (t) => String(t || '').trim().replace(/[.\s]+$/, '');
    slides.push({ kind: 'closing', speak: `So, what should we do next? ${st.closing.bullets.map((b2, k) => `${['First', 'Second', 'And finally'][k] || 'Also'}, ${sent(b2).charAt(0).toLowerCase()}${sent(b2).slice(1)}.`).join(' ')} Thanks for listening.`,
      node: el('div', { class: 'ss ss-closing' }, el('h2', {}, st.closing.headline), el('ol', {}, st.closing.bullets.map((b2) => el('li', {}, b2))),
        el('div', { class: 'ss-foot' }, st.used_ai ? 'Narrated by AI from the numbers on this dashboard — check before sharing.' : 'Narrated by the built-in presenter from this dashboard’s numbers.')) });
    // ---- deck UI
    let i = 0, speaking = false, auto = false;
    const voices = () => window.speechSynthesis ? speechSynthesis.getVoices() : [];
    const PREF = [/Neerja.*Natural/i, /Aria.*Natural/i, /Jenny.*Natural/i, /Sonia.*Natural/i, /Natural.*(Female|en-IN)/i, /Google UK English Female/i, /Google US English/i, /Samantha/i, /Veena/i, /Zira/i, /female/i];
    const pickVoice = () => { const v = voices().filter((x) => /^en/i.test(x.lang)); for (const re of PREF) { const m = v.find((x) => re.test(x.name)); if (m) return m; } return v.find((x) => /en-IN/i.test(x.lang)) || v[0]; };
    if (window.speechSynthesis) speechSynthesis.getVoices();
    const stage = el('div', { class: 'story-stage' }, slides.map((s, k) => el('section', { class: `story-slide k-${s.kind}`, 'aria-hidden': 'true', 'data-n': k + 1 }, s.node,
      el('div', { class: 'ss-page' }, `${k + 1} / ${slides.length}`))));
    const counter = el('span', { class: 'story-count' });
    const dots = el('div', { class: 'story-dots' }, slides.map((_, k) => el('button', { type: 'button', 'aria-label': `Slide ${k + 1}`, onClick: () => go(k) })));
    const notes = el('div', { class: 'story-notes', 'aria-live': 'polite' });
    const speakBtn = btn('Read aloud', () => toggleSpeak(), { cls: 'sm', ic: 'play' });
    const autoBtn = btn('Auto-play', () => { auto = !auto; autoBtn.classList.toggle('on', auto); if (auto && !speaking) toggleSpeak(); }, { cls: 'sm' });
    function stopSpeak() { if (window.speechSynthesis) speechSynthesis.cancel(); speaking = false; speakBtn.classList.remove('on'); }
    function speak() {
      if (!window.speechSynthesis) { toast('Read aloud is not supported in this browser', 'err'); return; }
      speechSynthesis.cancel();
      const v = pickVoice(), natural = v && /Natural|Neural/i.test(v.name);
      const parts = slides[i].speak.replace(/\s+/g, ' ').match(/[^.!?]+[.!?]*/g) || [slides[i].speak];
      speaking = true; speakBtn.classList.add('on');
      const slideNo = i;
      const say = (k) => {
        if (!speaking || slideNo !== i) return;
        if (k >= parts.length) { if (auto && i < slides.length - 1) { setTimeout(() => { if (speaking) { go(i + 1); speak(); } }, 700); } else { speaking = false; speakBtn.classList.remove('on'); } return; }
        const u = new SpeechSynthesisUtterance(parts[k].trim());
        if (v) u.voice = v; u.lang = v ? v.lang : 'en-IN';
        u.rate = natural ? 0.98 : 0.92; u.pitch = natural ? 1 : 1.08;
        u.onend = () => setTimeout(() => say(k + 1), 260);           // short human pause between sentences
        speechSynthesis.speak(u);
      };
      say(0);
    }
    function toggleSpeak() { if (speaking) stopSpeak(); else speak(); }
    function go(k) {
      i = Math.max(0, Math.min(slides.length - 1, k));
      stage.querySelectorAll('.story-slide').forEach((n, j) => { n.classList.toggle('on', j === i); n.setAttribute('aria-hidden', String(j !== i)); });
      dots.querySelectorAll('button').forEach((d, j) => d.classList.toggle('on', j === i));
      counter.textContent = `${i + 1} / ${slides.length}`;
      notes.textContent = slides[i].speak;
      if (speaking && !auto) speak();
    }
    const close = () => { stopSpeak(); document.removeEventListener('keydown', keys, true); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); shade.remove(); };
    const keys = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(i + 1); }
      else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(i - 1); }
      else if (e.key.toLowerCase() === 'f') { e.preventDefault(); if (document.fullscreenElement) document.exitFullscreen(); else shade.requestFullscreen().catch(() => {}); }
    };
    document.addEventListener('keydown', keys, true);
    shade.replaceChildren(
      el('div', { class: 'story-top' }, el('b', {}, st.title), el('span', { class: 'story-badge' }, st.used_ai ? '✦ AI narrated' : 'Built-in narration'),
        st.note ? el('span', { class: 'muted small story-note' }, st.note) : null, el('span', { class: 'grow' }),
        speakBtn, autoBtn,
        btn('Full screen', () => (document.fullscreenElement ? document.exitFullscreen() : shade.requestFullscreen().catch(() => {})), { cls: 'sm', title: 'F' }),
        btn('Save as PDF', () => { stopSpeak(); document.body.classList.add('story-printing'); setTimeout(() => { window.print(); document.body.classList.remove('story-printing'); }, 100); }, { cls: 'sm', ic: 'download' }),
        btn('Close', close, { cls: 'sm', ic: 'x', title: 'Esc' })),
      stage,
      el('div', { class: 'story-bottom' }, btn('', () => go(i - 1), { cls: 'icon', ic: 'back', title: 'Previous (←)' }), dots, counter,
        btn('', () => go(i + 1), { cls: 'icon story-next', ic: 'back', title: 'Next (→ or Space)' }), el('details', { class: 'story-notes-wrap' }, el('summary', {}, 'Speaker notes'), notes)));
    go(0);
  }
  function doraExplain(kind, w, insightList) {
    const W = windows();
    const periodTxt = W.cur ? `Current period ${W.cur.from} to ${W.cur.to}${W.prev ? `, previous ${W.prev.from} to ${W.prev.to}` : ''}.` : 'All dates.';
    let prompt;
    if (kind === 'dashboard') {
      const kpis = S.D.widgets.filter((x) => x.type === 'kpi' && x.page === S.page && S.results[x.dataset]).map(widgetSummary).join('\n');
      prompt = `You are reviewing the business dashboard "${S.name}". ${periodTxt}\nKPIs:\n${kpis}\nDetected insights:\n${(insightList || []).map((i) => '- ' + i.text).join('\n')}\n\nWrite: 1) a 2-sentence summary, 2) the 3 most important insights, 3) 3 practical recommendations. Use only these numbers. No code.`;
    } else {
      prompt = `Explain this dashboard widget for a business user. ${periodTxt}\n${widgetSummary(w)}\n\nGive: the main takeaway, any notable highs/lows or anomalies, and 2 practical recommendations. Use only these numbers. No code.`;
    }
    openDialog((close) => {
      const out = el('div', { class: 'md dora-explain' }, el('span', { class: 'dora-typing' }, 'Dora is reading the numbers…'));
      doraStream({ mode: 'chat', prompt, context: {} }, (t) => { out.innerHTML = DOMPurify.sanitize(marked.parse(t)); })
        .catch((e) => { out.replaceChildren(el('div', { class: 'error-box' }, `${e.message} — check Dora in Admin › Settings.`)); });
      return el('div', { class: 'dlg' }, el('div', { class: 'row' }, el('h2', { class: 'grow' }, kind === 'dashboard' ? 'Dora’s summary' : `Dora on “${w.title}”`),
        btn('Close', () => close(null), { cls: 'sm' })), out);
    }, { wide: true });
  }
  function csvOf(w) {
    const res = S.results[w.dataset];
    const rows = clientRows(w.dataset, res, w.id);
    download(`${(w.title || 'widget').replace(/[^\w-]+/g, '_')}.csv`, toCsv({ columns: res.columns, rows }));
  }
  function pngOf(w) {
    const c = S.charts[w.id];
    if (!c) return;
    const a = document.createElement('a');
    a.href = c.toBase64Image('image/png', 1); a.download = `${(w.title || 'chart').replace(/[^\w-]+/g, '_')}.png`; a.click();
  }

  /* ---------- drag & resize (edit mode) ---------- */
  /* ---------- layout: no overlaps ---------- */
  const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  function resolveCollisions(moved) {
    const ws = pageWidgets();
    const queue = moved ? [moved] : [...ws];
    let guard = 0;
    while (queue.length && guard++ < 500) {
      const m = queue.shift();
      for (const o of ws.sort((a, b) => a.layout.y - b.layout.y)) {
        if (o === m || !overlap(m.layout, o.layout)) continue;
        o.layout.y = m.layout.y + m.layout.h;           // push the other widget below
        queue.push(o);
      }
    }
  }
  function tidyLayout() {                                // pull everything up, keeping the order
    const ws = pageWidgets().sort((a, b) => a.layout.y - b.layout.y || a.layout.x - b.layout.x);
    const placed = [];
    for (const w of ws) {
      let y = 0;
      while (placed.some((p) => overlap({ ...w.layout, y }, p.layout))) y += 1;
      w.layout.y = y;
      placed.push(w);
    }
  }
  function startDrag(e, w, card) {
    if (e.button !== 0 || e.target.closest('button, a, input, select, textarea')) return;
    const resize = e.target.classList.contains('dash-resize');
    select(w.id);
    const rect = grid.getBoundingClientRect();
    const colW = (rect.width - DB_GAP * (DB_COLS - 1)) / DB_COLS + DB_GAP;
    const rowH = DB_ROW_H + DB_GAP;
    const start = { ...w.layout }, sx = e.clientX, sy = e.clientY;
    card.setPointerCapture(e.pointerId);
    card.classList.add('dragging');
    let target = null;
    const move = (ev) => {
      const dx = Math.round((ev.clientX - sx) / colW), dy = Math.round((ev.clientY - sy) / rowH);
      if (resize) { w.layout.w = Math.max(2, Math.min(DB_COLS - start.x, start.w + dx)); w.layout.h = Math.max(2, start.h + dy); }
      else { w.layout.x = Math.max(0, Math.min(DB_COLS - start.w, start.x + dx)); w.layout.y = Math.max(0, start.y + dy); }
      Object.assign(card.style, placement(w));
      const sc = grid.closest('main');                         // auto-scroll near the edges while dragging
      if (sc) { const r = sc.getBoundingClientRect(); if (ev.clientY < r.top + 70) sc.scrollTop -= 24; else if (ev.clientY > r.bottom - 70) sc.scrollTop += 24; }
      if (!resize && PANELABLE.includes(w.type) && w.type !== 'panel') {
        const hit = document.elementsFromPoint(ev.clientX, ev.clientY).find((n) => n.classList && n.classList.contains('dash-w') && n !== card);
        const tw = hit && S.D.widgets.find((x) => x.id === hit.dataset.id);
        const ok = tw && PANELABLE.includes(tw.type) ? hit : null;
        if (ok !== target) { if (target) target.classList.remove('drop-target'); target = ok; if (target) target.classList.add('drop-target'); card.classList.toggle('will-combine', !!target); }
      }
    };
    const up = async () => {
      card.removeEventListener('pointermove', move); card.removeEventListener('pointerup', up);
      card.classList.remove('dragging', 'will-combine');
      if (target) {
        target.classList.remove('drop-target');
        const tw = S.D.widgets.find((x) => x.id === target.dataset.id);
        w.layout = { ...start };
        const canOverlay = COMBINABLE.includes(w.type) && COMBINABLE.includes(tw.type);
        const choice = tw.type === 'panel' ? 'panel' : await openDialog((close) => el('div', { class: 'dlg' },
          el('h2', {}, `Put “${w.title}” together with “${tw.title}”`),
          el('div', { class: 'combine-choices' },
            canOverlay ? el('button', { type: 'button', class: 'combine-opt', onClick: () => close('overlay') }, el('b', {}, 'Overlay in one chart'),
              el('span', {}, 'Same axes; hover shows every series together. A second axis is added when scales differ.')) : null,
            el('button', { type: 'button', class: 'combine-opt', onClick: () => close('tabs') }, el('b', {}, 'Tabs in one card'),
              el('span', {}, 'One chart at a time — hover a tab to switch. Cleanest when space is tight.')),
            el('button', { type: 'button', class: 'combine-opt', onClick: () => close('panel') }, el('b', {}, 'Side by side in one card'),
              el('span', {}, 'A multi-chart panel: each keeps its own chart type; hovering one highlights the same point in the others.'))),
          el('div', { class: 'actions' }, btn('Cancel', () => close(null)))));
        if (choice === 'panel' || choice === 'tabs') {
          if (tw.type === 'panel') tw.children = [...(tw.children || []), toSubChart(w)];
          else {
            Object.assign(tw, { children: [toSubChart(tw), toSubChart(w)], panelCols: 'auto', syncHover: true, title: tw.title, type: 'panel', layers: undefined,
              panelMode: choice === 'tabs' ? 'tabs' : 'grid' });
            tw.layout.w = Math.max(tw.layout.w, 6);
            tw.layout.h = Math.max(tw.layout.h, 4);
          }
          S.D.widgets = S.D.widgets.filter((x) => x !== w);
          const n = tw.children.length, c2 = panelCols(tw, n);
          if ((tw.panelMode || 'grid') === 'grid') tw.layout.h = Math.max(tw.layout.h, Math.ceil(n / c2) * 3);
          resolveCollisions(tw);
          S.dirty = true; drawGrid(); select(tw.id); toast('Added as a sub-chart — hover to compare');
          return;
        }
        const ok = choice === 'overlay';
        if (ok) {
          tw.layers = tw.layers || [];
          tw.layers.push({ id: dbUid('l'), title: w.title, dataset: w.dataset, x: w.x, y: (w.y || []).slice(0, 1), agg: w.agg, grain: w.grain,
            type: w.type === 'bar' || w.type === 'hbar' ? 'bar' : 'line', axis: 'auto', format: w.format }, ...(w.layers || []));
          S.D.widgets = S.D.widgets.filter((x) => x !== w);
          S.dirty = true; drawGrid(); select(tw.id); toast('Charts combined — hover to compare them');
        } else drawGrid();
        return;
      }
      if (JSON.stringify(start) !== JSON.stringify(w.layout)) { resolveCollisions(w); S.dirty = true; drawGrid(); }
    };
    card.addEventListener('pointermove', move); card.addEventListener('pointerup', up);
  }
  function select(id) {
    S.selected = id;
    grid.querySelectorAll('.dash-w').forEach((c) => c.classList.toggle('sel', c.dataset.id === id));
    openSide('widget');
  }
  function addWidget(type) {
    const bottom = pageWidgets().reduce((m, w) => Math.max(m, w.layout.y + w.layout.h), 0);
    const ds = S.D.datasets[0];
    const res = ds ? S.results[ds.id] : null;
    const kinds = res ? dbColumnKinds(res.columns, res.rows) : [];
    const num = res ? res.columns.find((_, i) => kinds[i] === 'num') : null;
    const cat = res ? res.columns.find((_, i) => kinds[i] === 'cat' || kinds[i] === 'date') : null;
    const w = { id: dbUid('w'), page: S.page, type, title: DB_TYPES[type], dataset: type === 'text' || type === 'insights' ? null : ds ? ds.id : null,
      x: cat || null, y: num ? [num] : [], agg: type === 'kpi' ? 'sum' : 'sum', format: 'compact', text: type === 'text' ? '### Notes\nWrite **markdown** here.' : undefined,
      layout: { x: 0, y: bottom, w: type === 'kpi' ? 3 : type === 'table' ? 12 : 6, h: type === 'kpi' ? 2 : type === 'text' ? 2 : 4 } };
    if (type === 'panel') {
      Object.assign(w, { panelMode: 'tabs', title: 'Charts', layout: { ...w.layout, w: 6, h: 4 },
        children: [{ type: 'bar', title: 'By category', dataset: w.dataset, x: cat || null, y: num ? [num] : [], agg: 'sum', format: 'compact' },
          { type: 'line', title: 'Over time', dataset: w.dataset, x: res ? res.columns.find((_, i) => kinds[i] === 'date') || null : null, y: num ? [num] : [], agg: 'sum', format: 'compact' }] });
    }
    S.D.widgets.push(w); S.dirty = true;
    if (w.dataset && !S.results[w.dataset]) loadAll(); else drawGrid();
    select(w.id);
  }

  /* ---------- side panel (edit) ---------- */
  function openSide(kind) {
    S.side = kind;
    side.hidden = false;
    const close = btn('', () => { side.hidden = true; S.side = null; }, { cls: 'ghost icon sm', ic: 'x', title: 'Close panel' });
    if (kind === 'widget') return sideWidget(close);
    if (kind === 'datasets') return sideDatasets(close);
    if (kind === 'filters') return sideFilters(close);
    return sideSettings(close);
  }
  const field = (label, input, hint) => el('label', { class: 'lbl' }, label, input, hint ? el('span', { class: 'pl-hint' }, hint) : null);
  const selectOf = (opts, value, onchange, allowEmpty) => {
    const s = el('select', { class: 'field' }, allowEmpty ? el('option', { value: '' }, allowEmpty) : null, opts.map(([v, t]) => el('option', { value: v, selected: String(value ?? '') === String(v) }, t)));
    s.addEventListener('change', () => onchange(s.value));
    return s;
  };
  function sideWidget(close) {
    const w = S.D.widgets.find((x) => x.id === S.selected);
    if (!w) { side.hidden = true; return; }
    const changed = (reload) => { S.dirty = true; if (reload && w.dataset && !S.results[w.dataset]) loadAll(); else drawGrid(); };
    const res = w.dataset ? S.results[w.dataset] : null;
    const cols = res ? res.columns : [];
    const kinds = res ? dbColumnKinds(cols, res.rows) : [];
    const title = el('input', { class: 'field', value: w.title || '' });
    title.addEventListener('input', () => { w.title = title.value; S.dirty = true; const h3 = grid.querySelector(`[data-id="${w.id}"] h3`); if (h3) h3.textContent = w.title; });
    const parts = [el('div', { class: 'row' }, el('h3', { class: 'grow' }, 'Widget'), btn('', () => {
      S.D.widgets = S.D.widgets.filter((x) => x !== w); S.selected = null; S.dirty = true; side.hidden = true; drawGrid();
    }, { cls: 'ghost icon sm', ic: 'trash', title: 'Delete widget' }), close),
    field('Title', title),
    field('Type', selectOf(Object.entries(DB_TYPES), w.type, (v) => { w.type = v; changed(); openSide('widget'); }))];
    if (w.type === 'panel') {
      w.children = w.children || [];
      parts.push(field('Show sub-charts as', selectOf([['tabs', 'Tabs — one chart at a time (hover a tab to switch)'], ['grid', 'Grid — all charts side by side']], w.panelMode || 'grid', (v) => { w.panelMode = v; changed(); openSide('widget'); })));
      if ((w.panelMode || 'grid') === 'grid') parts.push(el('div', { class: 'grid2' },
        field('Columns', selectOf([['auto', 'Automatic'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4']], w.panelCols || 'auto', (v) => { w.panelCols = v; changed(); })),
        el('label', { class: 'switch', style: { alignSelf: 'end', marginBottom: '8px' } }, el('input', { type: 'checkbox', checked: w.syncHover !== false, onChange: (e) => { w.syncHover = e.target.checked; changed(); } }), 'Synced hover')));
      parts.push(el('div', { class: 'pl-sec' }, `Sub-charts (${w.children.length})`));
      w.children.forEach((c, i) => {
        const cres = S.results[c.dataset || w.dataset];
        const ccols = cres ? cres.columns : [];
        const ckinds = cres ? dbColumnKinds(ccols, cres.rows) : [];
        const nums = ccols.filter((_, k) => ckinds[k] === 'num' || ckinds[k] === 'id');
        const ttl = el('input', { class: 'field', value: c.title || '' }); ttl.addEventListener('input', () => { c.title = ttl.value; S.dirty = true; });
        ttl.addEventListener('change', () => changed());
        parts.push(el('div', { class: 'sub-edit' },
          el('div', { class: 'row', style: { gap: '4px' } }, el('b', { class: 'grow' }, `${i + 1}.`),
            i > 0 ? btn('', () => { [w.children[i - 1], w.children[i]] = [w.children[i], w.children[i - 1]]; changed(); openSide('widget'); }, { cls: 'ghost icon sm', ic: 'up', title: 'Move up' }) : null,
            i < w.children.length - 1 ? btn('', () => { [w.children[i + 1], w.children[i]] = [w.children[i], w.children[i + 1]]; changed(); openSide('widget'); }, { cls: 'ghost icon sm', ic: 'down', title: 'Move down' }) : null,
            btn('', () => {
              const bottom = pageWidgets().reduce((m, x) => Math.max(m, x.layout.y + x.layout.h), 0);
              S.D.widgets.push({ ...c, id: dbUid('w'), page: S.page, dataset: c.dataset || w.dataset, facet: undefined, layout: { x: 0, y: bottom, w: c.type === 'kpi' ? 3 : 6, h: c.type === 'kpi' ? 2 : 4 } });
              w.children.splice(i, 1); changed(); openSide('widget');
            }, { cls: 'ghost icon sm', ic: 'fold', title: 'Move out into its own widget' }),
            btn('', () => { w.children.splice(i, 1); changed(); openSide('widget'); }, { cls: 'ghost icon sm', ic: 'trash', title: 'Remove sub-chart' })),
          field('Title', ttl),
          el('div', { class: 'grid2' },
            field('Type', selectOf(Object.entries(SUB_TYPES), c.type, (v) => { c.type = v; changed(); })),
            field('Dataset', selectOf(S.D.datasets.map((d) => [d.id, d.name]), c.dataset || w.dataset, (v) => { c.dataset = v; changed(true); setTimeout(() => openSide('widget'), 400); }))),
          c.type !== 'kpi' ? field(c.type === 'pie' ? 'Slices' : 'X axis', selectOf(ccols.map((x) => [x, x]), c.x, (v) => { c.x = v || null; changed(); }, '— none —')) : null,
          el('div', { class: 'grid2' },
            field('Value', selectOf((nums.length ? nums : ccols).map((x) => [x, x]), (c.y || [])[0], (v) => { c.y = [v]; changed(); })),
            field('Aggregate', selectOf(Object.entries(DB_AGGS), c.agg || 'sum', (v) => { c.agg = v; changed(); }))),
          c.facet ? el('div', { class: 'pl-hint' }, `Only rows where ${c.facet.column} = ${c.facet.value}`) : null));
      });
      parts.push(el('div', { class: 'row', style: { gap: '6px' } }, btn('Add sub-chart', () => {
        const ds = w.children[0] ? (w.children[0].dataset || w.dataset) : (S.D.datasets[0] || {}).id;
        const r0 = S.results[ds];
        const k0 = r0 ? dbColumnKinds(r0.columns, r0.rows) : [];
        w.children.push({ type: 'bar', title: `Chart ${w.children.length + 1}`, dataset: ds, x: r0 ? r0.columns.find((_, k) => k0[k] === 'cat' || k0[k] === 'date') : null,
          y: r0 ? [r0.columns.find((_, k) => k0[k] === 'num') || r0.columns[0]] : [], agg: 'sum', format: 'compact' });
        const pc = panelCols(w, w.children.length);
        if ((w.panelMode || 'grid') === 'grid') w.layout.h = Math.max(w.layout.h, Math.ceil(w.children.length / pc) * 3);
        S.panelTab[w.id] = w.children.length - 1;      // show the new one
        resolveCollisions(w);
        changed(true); openSide('widget');
      }, { cls: 'sm', ic: 'plus' })));
      parts.push(el('p', { class: 'pl-hint' }, 'Tip: in Edit mode, drag any chart or KPI onto this panel to add it as a sub-chart.'));
    } else if (w.type === 'text') {
      const t = el('textarea', { class: 'field', rows: 8 }, w.text || '');
      t.addEventListener('input', () => { w.text = t.value; changed(); });
      parts.push(field('Text (markdown)', t));
    } else {
      parts.push(field('Dataset', selectOf(S.D.datasets.map((d) => [d.id, d.name]), w.dataset, (v) => { w.dataset = v || null; changed(true); setTimeout(() => openSide('widget'), 400); }, '— choose —')));
      if (!res) parts.push(el('p', { class: 'muted small' }, w.dataset ? 'Loading columns…' : 'Add a dataset first (Datasets button).'));
      else if (w.type === 'table') {
        parts.push(el('div', { class: 'lbl' }, 'Columns', el('div', { class: 'dash-checks' }, cols.map((c) => el('label', { class: 'switch' },
          el('input', { type: 'checkbox', checked: !w.columns || !w.columns.length || w.columns.includes(c), onChange: (e) => {
            const curCols = w.columns && w.columns.length ? w.columns.slice() : cols.slice();
            w.columns = e.target.checked ? cols.filter((x) => curCols.includes(x) || x === c) : curCols.filter((x) => x !== c); changed();
          } }), c)))));
        parts.push(field('Number format', selectOf([['number', '1,23,456.78'], ['integer', '1,23,457'], ['currency', `${cur()}1,23,457`], ['compact', '1.23 L'], ['percent', '12.3%']], w.format || 'number', (v) => { w.format = v; changed(); })));
        parts.push(el('label', { class: 'switch' }, el('input', { type: 'checkbox', checked: w.heat !== false, onChange: (e) => { w.heat = e.target.checked; changed(); } }), 'Colour scale on numbers (heat table)'),
          el('label', { class: 'switch' }, el('input', { type: 'checkbox', checked: w.totals !== false, onChange: (e) => { w.totals = e.target.checked; changed(); } }), 'Totals row'));
      } else {
        const numCols = cols.filter((_, i) => kinds[i] === 'num' || kinds[i] === 'id');
        if (w.type !== 'kpi') parts.push(field(w.type === 'pie' ? 'Slices (category)' : 'X axis (group by)', selectOf(cols.map((c) => [c, c]), w.x, (v) => { w.x = v || null; changed(); }, '— none —')));
        parts.push(el('div', { class: 'lbl' }, w.type === 'kpi' || w.type === 'pie' ? 'Value' : 'Values',
          el('div', { class: 'dash-checks' }, (numCols.length ? numCols : cols).map((c) => el('label', { class: 'switch' },
            el('input', { type: w.type === 'kpi' || w.type === 'pie' || w.series ? 'radio' : 'checkbox', name: `y-${w.id}`, checked: (w.y || []).includes(c), onChange: (e) => {
              w.y = (w.type === 'kpi' || w.type === 'pie' || w.series) ? [c] : e.target.checked ? [...new Set([...(w.y || []), c])] : (w.y || []).filter((x) => x !== c); changed();
            } }), c)))));
        parts.push(el('div', { class: 'grid2' },
          field('Aggregate', selectOf(Object.entries(DB_AGGS), w.agg || 'sum', (v) => { w.agg = v; changed(); })),
          field('Number format', selectOf([['compact', '1.23 L'], ['currency_compact', `${cur()}1.23 L`], ['number', '1,23,456.78'], ['integer', '1,23,457'], ['currency', `${cur()}1,23,457`], ['percent', '12.3%']], w.format || 'compact', (v) => { w.format = v; changed(); }))));
        if (w.type === 'kpi') {
          const sub = el('input', { class: 'field', value: w.subtitle || '', placeholder: 'e.g. Net sales, this month' });
          sub.addEventListener('input', () => { w.subtitle = sub.value; changed(); });
          parts.push(field('Subtitle', sub));
          parts.push(el('label', { class: 'switch' }, el('input', { type: 'checkbox', checked: !!w.lowerBetter, onChange: (e) => { w.lowerBetter = e.target.checked; changed(); } }), 'Lower is better (e.g. discounts, refunds)'));
          parts.push(field('This card looks like', selectOf([['', 'Dashboard default'], ...Object.entries(DB_KPI_STYLES)], w.kpiStyle || '', (v) => { w.kpiStyle = v || undefined; changed(); }),
            'Gauge uses the target if set, otherwise the previous period × 1.25 as its maximum.'));
          const tgt = el('input', { class: 'field', type: 'number', value: w.target ?? '', placeholder: 'e.g. 2500000' });
          tgt.addEventListener('change', () => { w.target = tgt.value === '' ? null : Number(tgt.value); changed(); });
          parts.push(el('div', { class: 'grid2' },
            field('Compare with', selectOf([['period', 'Previous period'], ['year', 'Same period last year'], ['target', 'A target'], ['none', 'Nothing']], w.compare || 'period', (v) => { w.compare = v; changed(); openSide('widget'); })),
            (w.compare === 'target') ? field('Target value', tgt) : el('span')));
        } else {
          if (w.type !== 'pie') parts.push(field('Split into series by', selectOf(cols.filter((_, i) => kinds[i] === 'cat').map((c) => [c, c]), w.series, (v) => { w.series = v || null; if (w.series) w.y = (w.y || []).slice(0, 1); changed(); openSide('widget'); }, '— none —')));
          parts.push(el('div', { class: 'grid2' },
            field('Sort', selectOf([['label', 'By label'], ['value_desc', 'Largest first'], ['value_asc', 'Smallest first']], w.sort || 'label', (v) => { w.sort = v; changed(); })),
            field('Show top', (() => { const i = el('input', { class: 'field', type: 'number', min: 0, value: w.top || '' , placeholder: 'all' }); i.addEventListener('change', () => { w.top = Number(i.value) || 0; changed(); }); return i; })())));
          if (['bar', 'hbar', 'area'].includes(w.type)) parts.push(el('label', { class: 'switch' }, el('input', { type: 'checkbox', checked: !!w.stacked, onChange: (e) => { w.stacked = e.target.checked; changed(); } }), 'Stack series'));
          if (['bar', 'hbar'].includes(w.type)) parts.push(field('Colours', selectOf([['category', 'A different colour for each bar'], ['single', 'One colour']], w.colorBy || 'category', (v) => { w.colorBy = v; changed(); })));
          const facetCols = cols.filter((c, i) => kinds[i] === 'cat' && c !== w.x);
          if (facetCols.length && !(w.layers || []).length) {
            const fsel = selectOf(facetCols.map((c) => [c, c]), facetCols[0], () => {});
            const nIn = el('input', { class: 'field', type: 'number', min: 2, max: 12, value: 4 });
            parts.push(el('div', { class: 'pl-sec' }, 'Small multiples'),
              el('div', { class: 'grid2' }, field('One sub-chart per', fsel), field('How many (top)', nIn)),
              btn('Split into sub-charts', () => smallMultiples(w, fsel.value, Math.max(2, Math.min(12, Number(nIn.value) || 4))), { cls: 'sm' }));
          }
          if (w.x) parts.push(field('Time grouping (date / timestamp X axis)', selectOf(Object.entries(DB_GRAINS), w.grain || 'auto', (v) => { w.grain = v; changed(); })));
          if ((w.layers || []).length) {
            parts.push(el('div', { class: 'pl-sec' }, 'Combined series'), ...w.layers.map((L) => el('div', { class: 'dash-layer' },
              el('b', {}, L.title || (L.y || [])[0]),
              el('div', { class: 'grid2' },
                selectOf([['line', 'Line'], ['bar', 'Bars']], L.type || 'line', (v) => { L.type = v; changed(); }),
                selectOf([['auto', 'Axis: automatic'], ['left', 'Left axis'], ['right', 'Right axis']], L.axis || 'auto', (v) => { L.axis = v; changed(); })),
              el('div', { class: 'row', style: { gap: '6px' } },
                btn('Separate', () => {
                  w.layers = w.layers.filter((x) => x !== L);
                  const bottom = pageWidgets().reduce((m, x) => Math.max(m, x.layout.y + x.layout.h), 0);
                  S.D.widgets.push({ id: dbUid('w'), page: S.page, type: L.type === 'bar' ? 'bar' : 'line', title: L.title, dataset: L.dataset, x: L.x, y: L.y, agg: L.agg, grain: L.grain, format: L.format || w.format, layout: { x: 0, y: bottom, w: 6, h: 4 } });
                  changed(); openSide('widget');
                }, { cls: 'sm' }),
                btn('Remove', () => { w.layers = w.layers.filter((x) => x !== L); changed(); openSide('widget'); }, { cls: 'sm ghost' })))));
          }
          if (['line', 'area', 'bar'].includes(w.type)) {
            w.ml = w.ml || {};
            const num = (key, ph) => { const i = el('input', { class: 'field', type: 'number', min: 0, max: 365, value: w.ml[key] || '', placeholder: ph }); i.addEventListener('change', () => { w.ml[key] = Number(i.value) || 0; changed(); }); return i; };
            parts.push(el('div', { class: 'pl-sec' }, 'Analytics (machine learning)'),
              el('div', { class: 'grid2' }, field('Forecast ahead (steps)', num('forecast', 'off')), field('Moving average (steps)', num('movingAvg', 'off'))),
              el('label', { class: 'switch' }, el('input', { type: 'checkbox', checked: !!w.ml.trend, onChange: (e) => { w.ml.trend = e.target.checked; changed(); } }), 'Trend line (linear regression)'),
              el('label', { class: 'switch' }, el('input', { type: 'checkbox', checked: !!w.ml.anomalies, onChange: (e) => { w.ml.anomalies = e.target.checked; changed(); } }), 'Highlight anomalies'),
              el('p', { class: 'pl-hint' }, 'Works when the X axis is a date or timestamp. The forecast uses Holt-Winters when there is enough history for seasonality (e.g. weekly patterns in daily data), otherwise Holt’s trend method, and shades an 80% range.'));
          }
        }
      }
    }
    if (w.dataset && res && !['text', 'insights', 'panel'].includes(w.type)) {
      w.where = w.where || [];
      const OPS = [['eq', '='], ['neq', '≠'], ['in', 'in (a,b)'], ['gt', '>'], ['gte', '≥'], ['lt', '<'], ['lte', '≤'], ['contains', 'contains']];
      parts.push(el('div', { class: 'pl-sec' }, 'This chart’s own filters'),
        ...w.where.map((c, i) => {
          const val = el('input', { class: 'field', value: c.value ?? '', placeholder: 'value' });
          val.addEventListener('change', () => { c.value = val.value; changed(); });
          return el('div', { class: 'w-cond' },
            selectOf(cols.map((x) => [x, x]), c.column, (v) => { c.column = v; changed(); }),
            selectOf(OPS, c.op || 'eq', (v) => { c.op = v; changed(); }), val,
            btn('', () => { w.where.splice(i, 1); changed(); openSide('widget'); }, { cls: 'ghost icon sm', ic: 'x', title: 'Remove condition' }));
        }),
        btn('Add condition', () => { w.where.push({ column: cols.find((_, i) => kinds[i] === 'cat') || cols[0], op: 'eq', value: '' }); openSide('widget'); }, { cls: 'sm', ic: 'plus' }),
        el('div', { class: 'lbl' }, 'Dropdown filters on the chart (max 2)', el('div', { class: 'dash-checks' }, cols.filter((_, i) => kinds[i] === 'cat').map((c) => el('label', { class: 'switch' },
          el('input', { type: 'checkbox', checked: (w.filterControls || []).includes(c), onChange: (e) => {
            const cur2 = (w.filterControls || []).filter((x) => x !== c);
            w.filterControls = e.target.checked ? [...cur2, c].slice(-2) : cur2; changed(); openSide('widget');
          } }), c)))));
    }
    parts.push(el('p', { class: 'pl-hint' }, 'Drag the widget to move it; drag its bottom-right corner to resize.'));
    side.replaceChildren(...parts);
  }
  function sideDatasets(close) {
    const list = el('div', { class: 'stack', style: { gap: '14px' } });
    const KIND = { num: 'Number', cat: 'Category', date: 'Date', text: 'Text', id: 'ID' };
    const draw = (focusId) => list.replaceChildren(...S.D.datasets.map((d) => {
      const dres = S.results[d.id];
      const err = S.errors[d.id];
      const name = el('input', { class: 'field ds-name', value: d.name, 'aria-label': 'Dataset name' });
      name.addEventListener('input', () => { d.name = name.value; S.dirty = true; });
      const sql = el('textarea', { class: 'field mono ds-sql', rows: 7, spellcheck: 'false', 'aria-label': 'SQL' }, d.sql || '');
      const status = el('span', { class: `ds-status ${err ? 'err' : dres ? 'ok' : 'idle'}` },
        err ? 'Error' : dres ? `${dres.columns.length} columns · ${dres.rows.length.toLocaleString('en-IN')} rows` : 'Not run yet');
      sql.addEventListener('input', () => { d.sql = sql.value; S.dirty = true; status.className = 'ds-status idle'; status.textContent = 'Changed — run it'; });
      const out = el('div', { class: 'dash-preview' });
      const run = async () => {
        out.replaceChildren(loading('Running…'));
        try {
          const res = await api(`/api/dashboards/${did}/preview`, { method: 'POST', body: { sql: d.sql, params: params() } });
          S.results[d.id] = { ...res, cachedAt: Date.now() / 1000 };
          delete S.errors[d.id];
          if (!d.timeColumn || (d.timeColumn !== '__none__' && !res.columns.includes(d.timeColumn))) {
            const kinds = dbColumnKinds(res.columns, res.rows);
            d.timeColumn = res.columns.find((_, i) => kinds[i] === 'date') || '__none__';
          }
          S.options = {}; S.dirty = true;
          draw(d.id); drawPeriod(); drawGrid();        // columns everywhere refresh immediately
        } catch (e) { S.errors[d.id] = e.message; out.replaceChildren(el('div', { class: 'error-box' }, e.message)); status.className = 'ds-status err'; status.textContent = 'Error'; }
      };
      const kinds = dres ? dbColumnKinds(dres.columns, dres.rows) : [];
      const tsel = dres ? selectOf(dres.columns.map((c, i) => [c, `${c}${kinds[i] === 'date' ? '  (date)' : ''}`]), d.timeColumn === '__none__' ? '' : d.timeColumn,
        (v) => { d.timeColumn = v || '__none__'; S.dirty = true; drawPeriod(); drawGrid(); }, '— none —') : el('p', { class: 'muted small' }, 'Run the query first — then pick it here.');
      const card = el('section', { class: 'ds-card', 'data-ds': d.id },
        el('div', { class: 'ds-head' }, name, status, btn('', () => {
          if (S.D.widgets.some((w) => w.dataset === d.id || (w.children || []).some((c) => c.dataset === d.id))) { toast('Widgets use this dataset — change them first', 'err'); return; }
          S.D.datasets = S.D.datasets.filter((x) => x !== d); S.dirty = true; draw();
        }, { cls: 'ghost icon sm', ic: 'trash', title: 'Delete dataset' })),
        el('div', { class: 'ds-step' }, el('span', { class: 'ds-num' }, '1'), el('b', {}, 'Write the SQL')), sql,
        el('p', { class: 'pl-hint' }, 'Tip: use {{name}} for filter values, e.g. WHERE region = {{region}}. Keep it under 5,000 rows — aggregate (GROUP BY) for big tables.'),
        el('div', { class: 'ds-step' }, el('span', { class: 'ds-num' }, '2'), el('b', {}, 'Run it'), btn('Run & use', run, { cls: 'sm primary', ic: 'play' })),
        dres ? el('div', { class: 'ds-cols' }, dres.columns.map((c, i) => el('span', { class: `ds-col k-${kinds[i]}`, title: KIND[kinds[i]] || '' }, c))) : null,
        out,
        el('div', { class: 'ds-step' }, el('span', { class: 'ds-num' }, '3'), el('b', {}, 'Date / time column')), tsel,
        el('p', { class: 'pl-hint' }, 'Powers the period picker, comparisons, KPI mini-bars and time charts. Each dataset can use a different column.'));
      if (dres && !out.childNodes.length) {
        out.append(el('details', { class: 'ds-sample' }, el('summary', {}, 'Show first rows'),
          el('div', { class: 'dash-table small-t' }, el('table', { class: 't grid' }, el('thead', {}, el('tr', {}, dres.columns.map((c) => el('th', {}, c)))),
            el('tbody', {}, dres.rows.slice(0, 5).map((r) => el('tr', {}, r.map((v) => el('td', {}, v == null ? '' : String(v))))))))));
      }
      if (focusId === d.id) setTimeout(() => card.scrollIntoView({ block: 'nearest' }), 0);
      if (focusId === `new:${d.id}`) setTimeout(() => { card.scrollIntoView({ block: 'nearest' }); sql.focus(); sql.select(); }, 0);
      return card;
    }));
    draw();
    side.replaceChildren(el('div', { class: 'row' }, el('h3', { class: 'grow' }, 'Datasets'), close),
      el('p', { class: 'muted small' }, 'A dataset is one SQL query. Charts and KPI cards are built from its columns.'),
      list, btn('Add dataset', () => {
        const d = { id: dbUid('ds'), name: `Dataset ${S.D.datasets.length + 1}`, sql: 'SELECT *\nFROM schema.table\nLIMIT 5000' };
        S.D.datasets.push(d); S.dirty = true; draw(`new:${d.id}`);
      }, { cls: 'sm', ic: 'plus' }));
  }
  function sideFilters(close) {
    const list = el('div', { class: 'stack', style: { gap: '14px' } });
    const draw = () => list.replaceChildren(...S.D.filters.map((f) => {
      const upd = () => { S.dirty = true; drawFilters(); };
      const lab = el('input', { class: 'field', value: f.label || '' }); lab.addEventListener('input', () => { f.label = lab.value; upd(); });
      const res = f.dataset ? S.results[f.dataset] : null;
      const items = [el('div', { class: 'row' }, field('Label', lab), btn('', () => { S.D.filters = S.D.filters.filter((x) => x !== f); delete S.fvals[f.id]; upd(); draw(); }, { cls: 'ghost icon sm', ic: 'trash', title: 'Delete filter' })),
        el('div', { class: 'grid2' },
          field('Type', selectOf([['select', 'Dropdown'], ['multiselect', 'Multi-select'], ['date_range', 'Date range'], ['text', 'Text search']], f.type || 'select', (v) => { f.type = v; upd(); draw(); })),
          field('Dataset (for values)', selectOf(S.D.datasets.map((d) => [d.id, d.name]), f.dataset, (v) => { f.dataset = v; upd(); draw(); }, '—'))),
        field('Column', res ? selectOf(res.columns.map((c) => [c, c]), f.column, (v) => { f.column = v; S.options = {}; upd(); }, '—') : (() => { const i = el('input', { class: 'field mono', value: f.column || '' }); i.addEventListener('change', () => { f.column = i.value.trim(); S.options = {}; upd(); }); return i; })(),
          'Filters rows on this column in every widget whose dataset has it.')];
      const others = S.D.datasets.filter((d) => S.results[d.id]);
      if (others.length > 1) items.push(el('div', { class: 'lbl' }, 'Column in each dataset', el('div', { class: 'dash-checks' }, others.map((d) => el('div', { class: 'row', style: { gap: '6px' } },
        el('span', { class: 'grow', style: { fontWeight: 500 } }, d.name),
        selectOf(S.results[d.id].columns.map((c) => [c, c]), (f.columnMap || {})[d.id] || (S.results[d.id].columns.includes(f.column) ? f.column : ''), (v) => { f.columnMap = { ...(f.columnMap || {}), [d.id]: v }; S.options = {}; upd(); }, '— not filtered —'))))));
      if (f.type === 'date_range') {
        const a = el('input', { class: 'field mono', value: f.paramFrom || '', placeholder: 'from' }); a.addEventListener('change', () => { f.paramFrom = a.value.trim(); upd(); });
        const b = el('input', { class: 'field mono', value: f.paramTo || '', placeholder: 'to' }); b.addEventListener('change', () => { f.paramTo = b.value.trim(); upd(); });
        items.push(el('div', { class: 'grid2' }, field('SQL param (start)', a), field('SQL param (end)', b)));
      } else {
        const pi = el('input', { class: 'field mono', value: f.param || '', placeholder: 'optional, e.g. region' }); pi.addEventListener('change', () => { f.param = pi.value.trim(); upd(); });
        items.push(field('SQL param', pi, 'If a dataset’s SQL contains {{param}}, the value goes into the query instead.'));
      }
      return el('div', { class: 'dash-ds' }, items);
    }));
    draw();
    side.replaceChildren(el('div', { class: 'row' }, el('h3', { class: 'grow' }, 'Filters'), close), list,
      btn('Add filter', () => { S.D.filters.push({ id: dbUid('f'), label: 'New filter', type: 'select', dataset: S.D.datasets[0] && S.D.datasets[0].id }); S.dirty = true; draw(); drawFilters(); }, { cls: 'sm', ic: 'plus' }));
  }
  function sideSettings(close) {
    const name = el('input', { class: 'field', value: S.name }); name.addEventListener('input', () => { S.name = name.value; titleEl.textContent = S.name; S.dirty = true; });
    const desc = el('input', { class: 'field', value: dash.description || '' }); desc.addEventListener('input', () => { dash.description = desc.value; S.dirty = true; });
    const curIn = el('input', { class: 'field', value: cur(), maxlength: 4 }); curIn.addEventListener('change', () => { S.D.currency = curIn.value || '₹'; S.dirty = true; drawGrid(); });
    const allCols = [...new Set(Object.values(S.results).flatMap((x) => x.columns))];
    side.replaceChildren(el('div', { class: 'row' }, el('h3', { class: 'grow' }, 'Dashboard settings'), close),
      field('Name', name), field('Description', desc), field('Currency symbol', curIn),
      field('Dashboard style', selectOf(Object.entries(DB_LOOKS), S.D.look || 'clean', (v) => { S.D.look = v; S.D.theme = 'auto'; S.dirty = true; drawGrid(); openSide('settings'); }),
        'Background, cards, title bar and chart colours together.'),
      field('KPI cards look like', selectOf(Object.entries(DB_KPI_STYLES), S.D.kpiStyle || 'tinted', (v) => { S.D.kpiStyle = v; S.dirty = true; drawGrid(); })),
      el('label', { class: 'switch' }, el('input', { type: 'checkbox', checked: !!S.D.fitScreen, onChange: (e) => { S.D.fitScreen = e.target.checked; S.dirty = true; drawBar(); } }), 'Fit to screen in view mode (one page, no scrolling)'),
      field('Chart colours', selectOf([['auto', 'Match the style'], ['vivid', 'Vivid'], ['ocean', 'Ocean'], ['sunset', 'Sunset'], ['forest', 'Forest'], ['neon', 'Neon'], ['aurora', 'Aurora'], ['mono', 'Single blue']], S.D.theme || 'auto', (v) => { S.D.theme = v; S.dirty = true; drawGrid(); })),
      el('div', { class: 'pl-sec' }, 'Period comparison'),
      el('p', { class: 'pl-hint' }, `Each dataset uses its own date / time column (set in Datasets). ${allCols.length} columns available.`),
      field('Periods end on', selectOf([['data', 'Latest date in the data'], ['today', 'Today']], S.D.period.anchor || 'data', (v) => { S.D.period.anchor = v; S.dirty = true; drawPeriod(); drawGrid(); })),
      el('p', { class: 'pl-hint' }, 'Tip: make each dataset return enough history for both periods (e.g. the last 60 days, aggregated by day).'));
  }

  async function save(quiet = false) {
    try {
      dash = await api(`/api/dashboards/${did}`, { method: 'PUT', body: { name: S.name, description: dash.description, definition: S.D } });
      S.dirty = false; if (!quiet) toast('Dashboard saved');
    } catch (e) { toast(e.message, 'err'); }
  }

  /* ---------- Ask Dora ---------- */
  async function dbAskDora() {
    let lastSql = null, lastRes = null;
    await openDialog((close) => {
      const q = el('input', { class: 'field', placeholder: 'e.g. Top 10 sites by net sales in the last 30 days' });
      const out = el('div', { class: 'dora-sql-out', hidden: true });
      const preview = el('div', { class: 'dash-dora-preview' });
      const addBtn = btn('Add to dashboard', async () => {
        const dsId = dbUid('ds');
        S.D.datasets.push({ id: dsId, name: q.value.trim().slice(0, 60) || 'Dora query', sql: lastSql });
        const kinds = dbColumnKinds(lastRes.columns, lastRes.rows);
        const num = lastRes.columns.find((_, i) => kinds[i] === 'num');
        const xcol = lastRes.columns.find((_, i) => kinds[i] === 'date') || lastRes.columns.find((_, i) => kinds[i] === 'cat' || kinds[i] === 'text');
        const type = lastRes.rows.length === 1 && num ? 'kpi' : kinds[lastRes.columns.indexOf(xcol)] === 'date' ? 'line' : xcol && num ? 'bar' : 'table';
        const bottom = pageWidgets().reduce((m, w) => Math.max(m, w.layout.y + w.layout.h), 0);
        S.D.widgets.push({ id: dbUid('w'), page: S.page, type, title: q.value.trim() || 'Dora', dataset: dsId, x: xcol || null, y: num ? [num] : [], agg: 'sum',
          sort: type === 'bar' ? 'value_desc' : 'label', format: 'compact', layout: { x: 0, y: bottom, w: type === 'kpi' ? 3 : type === 'table' ? 12 : 6, h: type === 'kpi' ? 2 : 4 } });
        S.results[dsId] = lastRes;
        await save(true); toast('Added to the dashboard'); close(true); drawGrid();
      }, { cls: 'primary' });
      addBtn.hidden = true;
      const go = async () => {
        const question = q.value.trim();
        if (!question) return;
        out.hidden = false; addBtn.hidden = true; preview.replaceChildren();
        out.replaceChildren(el('span', { class: 'dora-typing' }, 'Dora is writing SQL…'));
        let text = '';
        try { text = await doraStream({ mode: 'sql', prompt: question, context: { sql: S.D.datasets.map((d) => d.sql).join(';\n') } }, (t) => { text = t; doraRender(out, t, { buttons: [] }); }); }
        catch (e) { out.replaceChildren(el('div', { class: 'error-box' }, e.message)); return; }
        doraRender(out, text, { buttons: [] });
        const m = /```sql\s*([\s\S]*?)```/i.exec(text);
        if (!m) { preview.replaceChildren(el('p', { class: 'muted' }, 'Dora did not return SQL. Try rephrasing, or check Dora’s settings in Admin.')); return; }
        lastSql = m[1].trim().replace(/;\s*$/, '');
        preview.replaceChildren(loading('Running the query…'));
        try {
          lastRes = await api(`/api/dashboards/${did}/preview`, { method: 'POST', body: { sql: lastSql, params: params() } });
          const box = el('div', { class: 'dash-w t-preview' }, el('div', { class: 'dash-w-body' }));
          preview.replaceChildren(el('div', { class: 'muted small' }, `${lastRes.rows.length} rows`), box);
          const kinds = dbColumnKinds(lastRes.columns, lastRes.rows);
          const num = lastRes.columns.find((_, i) => kinds[i] === 'num');
          const xcol = lastRes.columns.find((_, i) => kinds[i] === 'date') || lastRes.columns.find((_, i) => kinds[i] === 'cat' || kinds[i] === 'text');
          const tmp = { id: '__p', type: lastRes.rows.length === 1 && num ? 'kpi' : xcol && num ? 'bar' : 'table', x: xcol, y: num ? [num] : [], agg: 'sum', sort: 'value_desc', format: 'compact', dataset: '__p' };
          renderWidget(tmp, lastRes.columns, lastRes.rows, box.firstChild);
          addBtn.hidden = !canEdit;
        } catch (e) { preview.replaceChildren(el('div', { class: 'error-box' }, `The SQL failed: ${e.message}`)); }
      };
      q.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
      setTimeout(() => q.focus(), 0);
      return el('div', { class: 'dlg' }, el('div', { class: 'row' }, el('h2', { class: 'grow' }, 'Ask Dora about your data'), btn('Close', () => close(null), { cls: 'sm' })),
        el('div', { class: 'row' }, q, btn('Ask', go, { cls: 'primary' })), out, preview, el('div', { class: 'actions' }, addBtn));
    }, { wide: true });
  }

  function drawAll() { drawBar(); drawPages(); drawPeriod(); drawFilters(); drawCross(); drawGrid(); if (!S.edit) side.hidden = true; }
  drawAll();
  setAutoRefresh();
  const aiNote = sessionStorage.getItem(`db-ai-${did}`);
  if (aiNote) {
    sessionStorage.removeItem(`db-ai-${did}`);
    const n = JSON.parse(aiNote);
    const box = el('div', { class: 'ai-note' },
      el('b', {}, n.used_ai ? 'Built with AI' : 'Built with the built-in designer'),
      el('span', {}, ` · ${n.widgets} widgets on ${n.pages.length} page${n.pages.length > 1 ? 's' : ''} from ${n.tables.join(', ')}. Click Edit to change anything.`),
      n.warnings.length ? el('ul', {}, n.warnings.map((x) => el('li', {}, x))) : null,
      btn('', () => box.remove(), { cls: 'ghost icon sm', ic: 'x', title: 'Dismiss' }));
    crossEl.before(box);
  }
  await loadAll();
  const onTheme = () => drawGrid();
  let fitT;
  const onResize = () => { if (!S.D.fitScreen || S.edit) return; clearTimeout(fitT); fitT = setTimeout(drawGrid, 150); };
  window.addEventListener('resize', onResize);
  window.addEventListener('db-theme', onTheme);
  const unload = (e) => { if (S.dirty) { e.preventDefault(); e.returnValue = ''; } };
  window.addEventListener('beforeunload', unload);
  return () => {
    clearInterval(S.refreshTimer); window.removeEventListener('beforeunload', unload); window.removeEventListener('db-theme', onTheme); window.removeEventListener('resize', onResize);
    document.body.classList.remove('dash-app');
    Object.values(S.charts).forEach((c) => c.destroy());
    main.classList.remove('flush');
    if (S.dirty && canEdit) api(`/api/dashboards/${did}`, { method: 'PUT', body: { name: S.name, description: dash.description, definition: S.D } }).catch(() => {});
  };
}
