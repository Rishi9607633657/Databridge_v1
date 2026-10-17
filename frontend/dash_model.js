/* Data model for dashboards: ERD diagram, relationship editor, business context, metric definitions and reconciliation checks.
   Used by "Build with AI" (step 2) and by the "Data model" button on every dashboard. Loaded before dashboards.js. */
'use strict';

const DBM_ROLE = { pk: ['PK', 'Primary key (one row per value)'], fk: ['FK', 'Foreign key (joins to another table)'], date: ['DT', 'Date / time'],
  measure: ['#', 'Measure (number)'], dim: ['Ab', 'Category'], attr: ['·', 'Attribute'] };
const DBM_ORDER = { pk: 0, fk: 1, date: 2, measure: 3, dim: 4, attr: 5 };
const DBM_STATUS = { pass: ['✓', 'Pass'], warn: ['!', 'Warning'], fail: ['✕', 'Fail'], error: ['?', 'Could not run'] };

function dbmSvg(tag, attrs = {}, ...kids) {
  const n = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null && v !== false) n.setAttribute(k, v);
  kids.flat().forEach((k) => { if (k != null) n.append(k instanceof Node ? k : document.createTextNode(String(k))); });
  return n;
}
const dbmShort = (t) => String(t).split('.').pop();
const dbmRows = (n) => (n == null ? '' : n >= 1e6 ? `${(n / 1e6).toFixed(1)}M rows` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K rows` : `${n} rows`);

/* ERD: facts in the middle, lookup tables on both sides, crow's-foot lines from FK to PK. Boxes can be dragged. */
function dbErd(erd, opts = {}) {
  const W = 236, HEAD = 40, ROW = 21, MAXC = opts.maxCols || 9, GAPX = 110, GAPY = 28, PAD = 24;
  const tables = (erd.tables || []).map((t) => {
    const cols = [...t.columns].sort((a, b) => DBM_ORDER[a.role] - DBM_ORDER[b.role]);
    const shown = cols.slice(0, MAXC);
    return { ...t, shown, more: cols.length - shown.length, h: HEAD + shown.length * ROW + (cols.length > MAXC ? ROW : 0) + 8 };
  });
  const rels = erd.relationships || [];
  const facts = tables.filter((t) => t.kind === 'fact'), dims = tables.filter((t) => t.kind !== 'fact');
  const pos = {};
  if (facts.length && dims.length) {
    const left = [], right = [];
    dims.forEach((d, i) => (i % 2 ? right : left).push(d));
    const colH = (arr) => arr.reduce((s, t) => s + t.h + GAPY, -GAPY);
    const H = Math.max(colH(left), colH(facts), colH(right));
    const place = (arr, x) => { let y = PAD + (H - colH(arr)) / 2; arr.forEach((t) => { pos[t.table] = { x, y }; y += t.h + GAPY; }); };
    place(left, PAD); place(facts, PAD + W + GAPX); place(right, PAD + 2 * (W + GAPX));
  } else {
    const per = Math.min(3, tables.length) || 1;
    let rowY = PAD;
    for (let i = 0; i < tables.length; i += per) {
      const row = tables.slice(i, i + per);
      row.forEach((t, k) => { pos[t.table] = { x: PAD + k * (W + GAPX), y: rowY }; });
      rowY += Math.max(...row.map((t) => t.h)) + GAPY;
    }
  }
  if (opts.positions) Object.assign(pos, opts.positions);
  const size = () => {
    let w = 0, h = 0;
    tables.forEach((t) => { const p = pos[t.table]; w = Math.max(w, p.x + W + PAD); h = Math.max(h, p.y + t.h + PAD); });
    return { w: Math.max(w, 300), h: Math.max(h, 160) };
  };
  const svg = dbmSvg('svg', { class: 'erd', role: 'img', 'aria-label': `Entity relationship diagram: ${tables.length} tables, ${rels.length} relationships` });
  const linesG = dbmSvg('g', { class: 'erd-lines' });
  const boxesG = dbmSvg('g', { class: 'erd-boxes' });
  svg.append(dbmSvg('defs', {}), linesG, boxesG);
  const byName = Object.fromEntries(tables.map((t) => [t.table, t]));
  const rowY = (t, col) => {
    const i = t.shown.findIndex((c) => c.name === col);
    return pos[t.table].y + (i < 0 ? HEAD / 2 : HEAD + i * ROW + ROW / 2);
  };
  function drawLines() {
    linesG.replaceChildren();
    rels.forEach((r) => {
      const a = byName[r.from], b = byName[r.to];
      if (!a || !b) return;
      const pa = pos[a.table], pb = pos[b.table];
      const aRight = pa.x + W / 2 < pb.x + W / 2;
      const x1 = aRight ? pa.x + W : pa.x, x2 = aRight ? pb.x : pb.x + W;
      const y1 = rowY(a, r.on[0]), y2 = rowY(b, r.on[1]);
      const dx = Math.max(40, Math.abs(x2 - x1) / 2) * (aRight ? 1 : -1);
      const path = `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
      const s = aRight ? 1 : -1;
      const cls = `erd-rel${r.source === 'user' ? ' user' : ''}${r.status ? ` st-${r.status}` : ''}`;
      const g = dbmSvg('g', { class: cls },
        dbmSvg('title', {}, `${dbmShort(r.from)}.${r.on[0]} → ${dbmShort(r.to)}.${r.on[1]} (many to one)${r.source === 'user' ? ' · added by you' : ' · detected'}`),
        dbmSvg('path', { d: path, class: 'erd-line' }),
        // crow's foot (many) at the fact end, bar (one) at the lookup end
        dbmSvg('path', { d: `M${x1},${y1 - 7} L${x1 + 12 * s},${y1} L${x1},${y1 + 7} M${x1},${y1} L${x1 + 12 * s},${y1}`, class: 'erd-mark' }),
        dbmSvg('path', { d: `M${x2 - 9 * s},${y2 - 7} L${x2 - 9 * s},${y2 + 7}`, class: 'erd-mark' }));
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      const label = `${r.on[0]}${r.on[0] === r.on[1] ? '' : ` = ${r.on[1]}`}`;
      g.append(dbmSvg('rect', { x: mx - label.length * 3.4 - 8, y: my - 10, width: label.length * 6.8 + 16, height: 20, rx: 10, class: 'erd-lbl-bg' }),
        dbmSvg('text', { x: mx, y: my + 4, 'text-anchor': 'middle', class: 'erd-lbl' }, label));
      linesG.append(g);
    });
  }
  function drawBox(t) {
    const p = pos[t.table];
    const g = dbmSvg('g', { class: `erd-box k-${t.kind}`, transform: `translate(${p.x},${p.y})`, tabindex: 0, 'aria-label': `${t.table}, ${t.kind}, ${dbmRows(t.rows)}` });
    g.append(dbmSvg('rect', { width: W, height: t.h, rx: 12, class: 'erd-card' }),
      dbmSvg('path', { d: `M0,12 a12,12 0 0 1 12,-12 h${W - 24} a12,12 0 0 1 12,12 v${HEAD - 12} h-${W} z`, class: 'erd-head' }),
      dbmSvg('text', { x: 12, y: 18, class: 'erd-title' }, dbmShort(t.table)),
      dbmSvg('text', { x: 12, y: 33, class: 'erd-sub' }, `${t.table.split('.')[0]} · ${dbmRows(t.rows)}`),
      dbmSvg('text', { x: W - 12, y: 18, 'text-anchor': 'end', class: 'erd-kind' }, t.kind === 'fact' ? 'FACT' : 'LOOKUP'));
    t.shown.forEach((c, i) => {
      const y = HEAD + i * ROW;
      g.append(dbmSvg('g', { class: `erd-col r-${c.role}` },
        dbmSvg('title', {}, `${c.name} · ${c.type} · ${DBM_ROLE[c.role][1]}${c.distinct ? ` · ~${c.distinct.toLocaleString()} distinct` : ''}`),
        dbmSvg('rect', { x: 8, y: y + 3, width: 24, height: 15, rx: 4, class: 'erd-tag' }),
        dbmSvg('text', { x: 20, y: y + 14, 'text-anchor': 'middle', class: 'erd-tag-t' }, DBM_ROLE[c.role][0]),
        dbmSvg('text', { x: 40, y: y + 15, class: 'erd-cname' }, c.name.length > 22 ? `${c.name.slice(0, 21)}…` : c.name),
        dbmSvg('text', { x: W - 10, y: y + 15, 'text-anchor': 'end', class: 'erd-ctype' }, String(c.type || '').replace(/^(decimal)\(.*/, '$1').slice(0, 10))));
    });
    if (t.more > 0) g.append(dbmSvg('text', { x: 40, y: HEAD + t.shown.length * ROW + 15, class: 'erd-more' }, `+ ${t.more} more column${t.more === 1 ? '' : 's'}`));
    // drag to rearrange
    g.addEventListener('pointerdown', (e) => {
      const svgRect = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal, k = vb.width / svgRect.width;
      const sx = e.clientX, sy = e.clientY, ox = p.x, oy = p.y;
      g.setPointerCapture(e.pointerId);
      g.classList.add('drag');
      const move = (ev) => { p.x = Math.max(0, ox + (ev.clientX - sx) * k); p.y = Math.max(0, oy + (ev.clientY - sy) * k); g.setAttribute('transform', `translate(${p.x},${p.y})`); drawLines(); };
      const up = () => { g.removeEventListener('pointermove', move); g.classList.remove('drag'); const s2 = size(); svg.setAttribute('viewBox', `0 0 ${s2.w} ${s2.h}`); if (opts.onMove) opts.onMove({ ...pos }); };
      g.addEventListener('pointermove', move);
      g.addEventListener('pointerup', up, { once: true });
    });
    return g;
  }
  tables.forEach((t) => boxesG.append(drawBox(t)));
  drawLines();
  const s = size();
  svg.setAttribute('viewBox', `0 0 ${s.w} ${s.h}`);
  svg.style.width = opts.fit ? '100%' : `${s.w}px`;
  if (opts.fit) svg.style.maxHeight = `${opts.maxHeight || 520}px`;
  const legend = el('div', { class: 'erd-legend' }, Object.entries(DBM_ROLE).map(([k, [t, d]]) => el('span', { class: `erd-key r-${k}` }, el('i', {}, t), d)),
    el('span', { class: 'erd-key' }, el('b', { class: 'erd-cf' }, '>—|'), 'many → one'), el('span', { class: 'muted' }, 'Drag tables to rearrange'));
  return el('div', { class: 'erd-wrap' }, tables.length ? el('div', { class: 'erd-scroll' }, svg) : el('p', { class: 'muted' }, 'No tables.'), legend);
}

/* checks list */
function dbChecks(checks, opts = {}) {
  if (!checks || !checks.length) return el('p', { class: 'muted small' }, opts.empty || 'No checks yet. Add a relationship or a rule to check the numbers.');
  const order = { fail: 0, error: 1, warn: 2, pass: 3 };
  return el('ul', { class: 'dbm-checks' }, [...checks].sort((a, b) => order[a.status] - order[b.status]).map((c) => el('li', { class: `dbm-check st-${c.status}` },
    el('span', { class: 'dbm-ic', title: DBM_STATUS[c.status][1], 'aria-label': DBM_STATUS[c.status][1] }, DBM_STATUS[c.status][0]),
    el('div', { class: 'grow' }, el('b', {}, c.name), el('div', { class: 'muted small' }, c.detail || ''),
      c.sql ? el('details', {}, el('summary', {}, 'SQL'), el('pre', { class: 'code' }, c.sql)) : null))));
}
function dbChecksSummary(sum) {
  if (!sum) return null;
  return el('span', { class: 'dbm-sum' }, ['pass', 'warn', 'fail', 'error'].filter((k) => sum[k]).map((k) => el('span', { class: `dbm-pill st-${k}` }, `${sum[k]} ${DBM_STATUS[k][1].toLowerCase()}`)));
}

/* relationship editor: list + add form (pick table/column on each side) */
function dbRelEditor(model, onChange) {
  const box = el('div', { class: 'dbm-rels' });
  const cols = Object.fromEntries((model.profiles || []).map((p) => [p.table, p.columns.map((c) => c.name)]));
  const tables = Object.keys(cols);
  const draw = () => {
    const tSel = (v) => el('select', { class: 'field' }, tables.map((t) => el('option', { value: t, selected: t === v }, dbmShort(t))));
    const cSel = (t, v) => el('select', { class: 'field' }, (cols[t] || []).map((c) => el('option', { value: c, selected: c === v }, c)));
    const fT = tSel(tables[0]), tT = tSel(tables[1] || tables[0]);
    let fC = cSel(fT.value), tC = cSel(tT.value);
    const fWrap = el('span', {}, fC), tWrap = el('span', {}, tC);
    fT.addEventListener('change', () => { fC = cSel(fT.value); fWrap.replaceChildren(fC); });
    tT.addEventListener('change', () => { tC = cSel(tT.value); tWrap.replaceChildren(tC); });
    const visible = model.relationships.filter((r) => !r.removed);
    box.replaceChildren(
      visible.length ? el('ul', { class: 'dbm-rel-list' }, visible.map((r) => el('li', {},
        el('span', { class: 'mono' }, `${dbmShort(r.from)}.${r.on[0]}`), el('span', { class: 'muted' }, ' many → one '), el('span', { class: 'mono' }, `${dbmShort(r.to)}.${r.on[1]}`),
        el('span', { class: `chip ${r.source === 'user' ? 'teal' : ''}` }, r.source === 'user' ? 'yours' : 'detected'),
        btn('', () => {
          if (r.source === 'user') model.relationships = model.relationships.filter((x) => x !== r);
          else r.removed = true;
          draw(); onChange();
        }, { cls: 'ghost icon sm', ic: 'x', title: 'Remove this relationship' }))))
        : el('p', { class: 'muted small' }, 'No relationships. Add one if tables share a key.'),
      tables.length > 1 ? el('div', { class: 'dbm-rel-add' }, el('span', { class: 'muted small' }, 'Add join:'), fT, fWrap, el('span', {}, '→'), tT, tWrap,
        btn('Add', () => {
          if (fT.value === tT.value) { toast('Pick two different tables', 'err'); return; }
          model.relationships = model.relationships.filter((x) => !(x.from === fT.value && x.to === tT.value));
          model.relationships.push({ from: fT.value, to: tT.value, on: [fC.value, tC.value], source: 'user' });
          draw(); onChange();
        }, { cls: 'sm', ic: 'plus' })) : null);
  };
  draw();
  return box;
}

/* metric definitions: name + formula */
function dbMetricsEditor(model) {
  const box = el('div', { class: 'dbm-metrics' });
  const draw = () => {
    box.replaceChildren(...model.metrics.map((m, i) => el('div', { class: 'dbm-metric' },
      el('input', { class: 'field', value: m.name, placeholder: 'Metric, e.g. Net revenue', 'aria-label': 'Metric name', onInput: (e) => { m.name = e.target.value; } }),
      el('input', { class: 'field mono', value: m.definition, placeholder: 'Formula, e.g. SUM(net_sales) - SUM(discount)', 'aria-label': 'Metric formula', onInput: (e) => { m.definition = e.target.value; } }),
      btn('', () => { model.metrics.splice(i, 1); draw(); }, { cls: 'ghost icon sm', ic: 'x', title: 'Remove' }))),
    btn('Add metric', () => { model.metrics.push({ name: '', definition: '' }); draw(); }, { cls: 'sm ghost', ic: 'plus' }));
  };
  draw();
  return box;
}

/* reconciliation rules: SQL returning one number vs another SQL or a number */
function dbRulesEditor(model) {
  const box = el('div', { class: 'dbm-rules' });
  const draw = () => {
    box.replaceChildren(...model.rules.map((r, i) => el('div', { class: 'dbm-rule' },
      el('div', { class: 'row', style: { gap: '6px' } },
        el('input', { class: 'field', value: r.name, placeholder: 'Check name, e.g. Sales match the POS export', onInput: (e) => { r.name = e.target.value; } }),
        el('label', { class: 'dbm-tol' }, 'tolerance %', el('input', { class: 'field', type: 'number', min: 0, max: 100, step: '0.1', value: r.tolerance ?? 0, onInput: (e) => { r.tolerance = Number(e.target.value || 0); } })),
        btn('', () => { model.rules.splice(i, 1); draw(); }, { cls: 'ghost icon sm', ic: 'x', title: 'Remove' })),
      el('textarea', { class: 'field mono', rows: 2, placeholder: 'SELECT SUM(net_sales) AS v FROM gold.sales WHERE sale_date = current_date() - 1', onInput: (e) => { r.left = e.target.value; } }, r.left || ''),
      el('textarea', { class: 'field mono', rows: 2, placeholder: 'Should equal: another SELECT returning one number, or a number (e.g. 125000)', onInput: (e) => { r.right = e.target.value; } }, r.right || ''))),
    btn('Add check', () => { model.rules.push({ name: '', left: '', right: '', tolerance: 0 }); draw(); }, { cls: 'sm ghost', ic: 'plus' }));
  };
  draw();
  return box;
}

/* ---------- "Data model" for a saved dashboard: diagram, tables used, checks ---------- */
async function dbModelDialog(did, dash) {
  await openDialog((close) => {
    const root = el('div', { class: 'dlg dbm-dlg' });
    let tab = 'erd', data = null;
    const body = el('div', { class: 'dbm-body' });
    const tabs = el('div', { class: 'tabs', role: 'tablist' });
    const drawTabs = () => setKids(tabs, [['erd', 'Diagram (ERD)'], ['tables', 'Tables used'], ['checks', 'Reconciliation']].map(([k, l]) =>
      el('button', { type: 'button', role: 'tab', 'aria-selected': String(tab === k), onClick: () => { tab = k; drawTabs(); draw(); } }, l)));
    const draw = () => {
      if (!data) { body.replaceChildren(loading('Reading the tables and checking the numbers…')); return; }
      if (tab === 'erd') body.replaceChildren(dbErd(data.erd, { fit: true, maxHeight: 560 }));
      else if (tab === 'tables') {
        const ds = (dash.definition.datasets || []);
        body.replaceChildren(el('table', { class: 't dbm-tables' }, el('thead', {}, el('tr', {}, ['Table', 'Kind', 'Rows', 'Columns', 'Used by datasets'].map((h) => el('th', {}, h)))),
          el('tbody', {}, data.erd.tables.map((t) => el('tr', {}, el('td', { class: 'mono' }, t.table), el('td', {}, t.kind === 'fact' ? 'Fact' : 'Lookup'),
            el('td', {}, (t.rows ?? 0).toLocaleString()), el('td', {}, t.columns.length),
            el('td', {}, ds.filter((d) => new RegExp(`\\b${t.table.replace('.', '\\.')}\\b`, 'i').test(d.sql || '')).map((d) => d.name).join(', ') || '—'))))),
        el('h4', {}, 'Datasets'),
        el('div', { class: 'ai-ds' }, ds.map((d) => el('div', { class: 'ai-ds-card' }, el('b', {}, d.name), d.purpose ? el('p', { class: 'muted small' }, d.purpose) : null,
          el('details', {}, el('summary', {}, 'SQL'), el('pre', { class: 'code' }, d.sql))))));
      } else body.replaceChildren(el('div', { class: 'row' }, el('p', { class: 'muted small grow' }, 'Checks that the numbers on this dashboard add up to the source tables.'), dbChecksSummary(data.summary),
        btn('Run again', () => load(), { cls: 'sm', ic: 'refresh' })), dbChecks(data.checks));
    };
    async function load() {
      data = null; draw();
      try { data = await api(`/api/dashboards/${did}/reconcile`, { method: 'POST' }); }
      catch (e) { body.replaceChildren(errBox(e)); return; }
      draw();
    }
    root.append(el('div', { class: 'row' }, el('h2', { class: 'grow' }, 'Data model'), btn('Close', () => close(null), { cls: 'sm' })),
      el('p', { class: 'muted small' }, `How “${dash.name}” is built: the tables it reads, how they join, and whether its totals reconcile with the source.`),
      tabs, body);
    drawTabs(); load();
    return root;
  }, { wide: true });
}
