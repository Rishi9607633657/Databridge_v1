/* DataBridge lineage: graph of tables, notebooks, jobs, dashboards and alerts, and impact analysis for a table/column.
   Shown in Catalog › table › Lineage and Governance › Lineage. */
'use strict';

const LIN_KIND = {
  table: { label: 'Table', ic: 'table' }, path: { label: 'Files', ic: 'folder' }, notebook: { label: 'Notebook', ic: 'nb' },
  job: { label: 'Job', ic: 'flow' }, query: { label: 'SQL', ic: 'term' }, dashboard: { label: 'Dashboard', ic: 'chart' },
  alert: { label: 'Alert', ic: 'bell' }, quality: { label: 'Quality rules', ic: 'check' },
};

function linHref(n) {
  if (n.kind === 'table') { const [db, t] = n.name.split('.'); return `#/catalog?db=${enc(db)}&table=${enc(t)}`; }
  if (n.kind === 'notebook') return `#/notebook?path=${enc(n.name)}`;
  if (n.kind === 'dashboard') return `#/dashboard/${n.name}`;
  if (n.kind === 'alert') return `#/alert/${n.name}`;
  if (n.kind === 'quality') { const [db, t] = n.name.split('.'); return `#/catalog?db=${enc(db)}&table=${enc(t)}&tab=quality`; }
  if (n.kind === 'job') return '#/workflows';
  return null;
}

function linLevels(g) {
  if (g.center) return g.nodes;
  // overview: longest path from sources gives each node a column
  const lvl = Object.fromEntries(g.nodes.map((n) => [n.id, 0]));
  for (let i = 0; i < 12; i++) {
    let changed = false;
    for (const e of g.edges) if (lvl[e.dst] < lvl[e.src] + 1 && lvl[e.src] < 30) { lvl[e.dst] = lvl[e.src] + 1; changed = true; }
    if (!changed) break;
  }
  return g.nodes.map((n) => ({ ...n, level: lvl[n.id] }));
}

function linGraph(g, { onPick } = {}) {
  const nodes = linLevels(g);
  if (!nodes.length) return el('div', { class: 'empty' }, icon('graph', 32), el('h2', {}, 'No lineage yet'),
    el('p', {}, 'Lineage appears when notebooks, jobs or SQL read and write tables (spark.sql, saveAsTable, insertInto, writeTo, Delta merge). Run a notebook that builds a table, then come back.'));
  const W = 210, H = 44, GX = 90, GY = 18, PAD = 20;
  const levels = [...new Set(nodes.map((n) => n.level))].sort((a, b) => a - b);
  const cols = Object.fromEntries(levels.map((l) => [l, nodes.filter((n) => n.level === l).sort((a, b) => (a.kind === b.kind ? a.label.localeCompare(b.label) : a.kind.localeCompare(b.kind)))]));
  const pos = {};
  levels.forEach((l, ci) => cols[l].forEach((n, ri) => { pos[n.id] = { x: PAD + ci * (W + GX), y: PAD + ri * (H + GY) }; }));
  const width = PAD * 2 + levels.length * W + (levels.length - 1) * GX;
  const height = PAD * 2 + Math.max(...levels.map((l) => cols[l].length)) * (H + GY) - GY;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', width); svg.setAttribute('height', height); svg.setAttribute('class', 'lin-svg');
  svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', `Lineage graph with ${nodes.length} items`);
  const defs = document.createElementNS(NS, 'defs');
  defs.innerHTML = '<marker id="lin-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker>';
  svg.append(defs);
  for (const e of g.edges) {
    const a = pos[e.src], b = pos[e.dst];
    if (!a || !b) continue;
    const x1 = a.x + W, y1 = a.y + H / 2, x2 = b.x, y2 = b.y + H / 2;
    const back = x2 <= x1;
    const p = document.createElementNS(NS, 'path');
    const dx = Math.max(40, Math.abs(x2 - x1) / 2);
    p.setAttribute('d', back ? `M${x1} ${y1} C${x1 + 60} ${y1} ${x2 - 60} ${y2} ${x2} ${y2}` : `M${x1} ${y1} C${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}`);
    p.setAttribute('class', `lin-edge k-${e.kind}`);
    p.setAttribute('marker-end', 'url(#lin-arrow)');
    const t = document.createElementNS(NS, 'title');
    t.textContent = `${e.kind === 'flows' ? 'Data flows' : e.kind === 'writes' ? 'Writes' : 'Reads'}${e.via && e.kind === 'flows' ? ` · via ${e.via.replace(/^[a-z]+:/, '')}` : ''}${e.count ? ` · seen ${e.count}×` : ''}${e.last_seen ? ` · last ${new Date(e.last_seen * 1000).toLocaleString()}` : ''}`;
    p.append(t);
    svg.append(p);
  }
  const wrap = el('div', { class: 'lin-wrap' }, svg);
  const layer = el('div', { class: 'lin-nodes', style: { width: `${width}px`, height: `${height}px` } });
  for (const n of nodes) {
    const k = LIN_KIND[n.kind] || { label: n.kind, ic: 'db' };
    const href = linHref(n);
    const isCenter = n.id === g.center;
    const node = el(href ? 'a' : 'div', { class: `lin-node k-${n.kind}${isCenter ? ' center' : ''}`, href: href || undefined,
      style: { left: `${pos[n.id].x}px`, top: `${pos[n.id].y}px`, width: `${W}px`, height: `${H}px` }, title: `${k.label}: ${n.label}`,
      onClick: onPick && n.kind === 'table' ? (ev) => { ev.preventDefault(); onPick(n); } : undefined },
    icon(k.ic, 15), el('span', { class: 'lin-txt' }, el('span', { class: 'lin-kind' }, k.label), el('span', { class: 'lin-name' }, n.label)));
    layer.append(node);
  }
  wrap.append(layer);
  return wrap;
}

async function linImpactPanel(fq, columns) {
  const colSel = el('select', { class: 'field', style: { width: '220px' }, 'aria-label': 'Column' },
    el('option', { value: '' }, 'Whole table'), (columns || []).map((c) => el('option', { value: c.name }, c.name)));
  const out = el('div', {});
  const run = async () => {
    setKids(out, loading('Looking downstream…'));
    try {
      const r = await api(`/api/lineage/impact?fq=${enc(fq)}${colSel.value ? `&column=${enc(colSel.value)}` : ''}`);
      if (!r.total) { setKids(out, el('p', { class: 'muted' }, 'Nothing downstream uses this table yet — changing it breaks nothing that DataBridge knows about.')); return; }
      const groups = Object.entries(r.downstream);
      setKids(out, el('p', { class: 'small', style: { margin: '0 0 8px' } }, r.column
        ? (r.column_hits ? el('b', {}, `${r.column_hits} of ${r.total} downstream items mention “${r.column}”. Check them before you rename or drop it.`)
          : `None of the ${r.total} downstream items mention “${r.column}” in their code or SQL.`)
        : `${r.total} item${r.total === 1 ? '' : 's'} depend on ${fq}.`),
      groups.map(([kind, items]) => el('div', { class: 'imp-grp' }, el('h4', {}, `${(LIN_KIND[kind] || { label: kind }).label}s (${items.length})`),
        el('ul', {}, items.map((n) => el('li', { class: n.mentions ? 'hit' : '' },
          linHref(n) ? el('a', { href: linHref(n) }, n.label) : n.label,
          n.mentions ? el('div', { class: 'imp-lines' }, n.mentions.map((m) => el('code', {}, m))) : null))))));
    } catch (e) { setKids(out, errBox(e)); }
  };
  colSel.addEventListener('change', run);
  run();
  return el('section', { class: 'panel' }, el('div', { class: 'panel-head' }, el('h3', { class: 'grow' }, 'Impact analysis'), colSel),
    el('div', { style: { padding: '12px 18px' } }, out));
}

window.CAT_EXTRA_TABS = window.CAT_EXTRA_TABS || [];
window.CAT_EXTRA_TABS.push({ label: 'Lineage', async render(pane, db, tbl, t) {
  const fq = `${db}.${tbl}`;
  const depth = el('select', { class: 'field', style: { width: '150px' }, 'aria-label': 'Depth' }, [1, 2, 3, 5].map((d) => el('option', { value: d, selected: d === 3 }, `${d} step${d > 1 ? 's' : ''} each way`)));
  const box = el('div', {}, loading());
  const draw = async () => {
    setKids(box, loading());
    try { setKids(box, linGraph(await api(`/api/lineage/graph?fq=${enc(fq)}&depth=${depth.value}`))); } catch (e) { setKids(box, errBox(e)); }
  };
  depth.addEventListener('change', draw);
  setKids(pane, el('section', { class: 'panel', style: { marginBottom: '16px' } }, el('div', { class: 'panel-head' },
    el('h3', { class: 'grow' }, 'Lineage'), el('span', { class: 'muted small' }, 'Upstream on the left, downstream on the right'), depth), box),
  await linImpactPanel(fq, t.columns));
  draw();
} });

window.GOV_TABS = window.GOV_TABS || [];
window.GOV_TABS.push({ key: 'lineage', label: 'Lineage', async render(pane) {
  const box = el('div', {}, loading());
  setKids(pane, el('section', { class: 'panel' }, el('div', { class: 'panel-head' }, el('h2', { class: 'grow' }, 'All lineage'),
    el('span', { class: 'muted small' }, 'Click a table to see its own lineage and impact')), box));
  try { setKids(box, linGraph(await api('/api/lineage/graph'))); } catch (e) { setKids(box, errBox(e)); }
} });
