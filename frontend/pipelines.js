/* DataBridge Pipelines — ADF-style editor, monitor and linked services. Loaded before app.js. */
'use strict';

const PL_COLORS = { Succeeded: '#1E8E3E', Failed: '#CF222E', InProgress: '#0891B2', Queued: '#8A92A3', Cancelled: '#6B6F76', Skipped: '#B6BDCA' };
const PL_COND = { Succeeded: '#1E8E3E', Failed: '#CF222E', Completed: '#0A5CFF', Skipped: '#8A92A3' };
const PL_TYPES = {
  Copy: { label: 'Copy data', group: 'Move & transform', ic: '⇄' },
  Notebook: { label: 'Notebook', group: 'Move & transform', ic: '📓' },
  SqlScript: { label: 'SQL script', group: 'Move & transform', ic: 'SQL' },
  Web: { label: 'Web', group: 'General', ic: '🌐' },
  Lookup: { label: 'Lookup', group: 'General', ic: '🔍' },
  SetVariable: { label: 'Set variable', group: 'General', ic: 'x=' },
  AppendVariable: { label: 'Append variable', group: 'General', ic: 'x+' },
  ExecutePipeline: { label: 'Execute pipeline', group: 'General', ic: '▶' },
  Wait: { label: 'Wait', group: 'General', ic: '⏱' },
  Fail: { label: 'Fail', group: 'General', ic: '✖' },
  IfCondition: { label: 'If condition', group: 'Iteration & conditionals', ic: '◇' },
  ForEach: { label: 'ForEach', group: 'Iteration & conditionals', ic: '↻' },
};
const PL_DEFAULTS = {
  Copy: { source: { type: 'rest' }, sink: { table: '', mode: 'append', format: 'delta' }, incremental: {} },
  Notebook: { notebookPath: '', baseParameters: {} }, SqlScript: { query: '' },
  Web: { url: '', method: 'GET', headers: {} }, Lookup: { source: { type: 'spark_sql', query: '' }, firstRowOnly: true },
  SetVariable: { variableName: '', value: '' }, AppendVariable: { variableName: '', value: '' },
  ExecutePipeline: { pipeline: '', parameters: {}, waitOnCompletion: true }, Wait: { waitTimeInSeconds: 10 },
  Fail: { message: '', errorCode: '' }, IfCondition: { expression: '', ifTrueActivities: [], ifFalseActivities: [] },
  ForEach: { items: '', isSequential: false, batchCount: 4, activities: [] },
};
const plClone = (x) => JSON.parse(JSON.stringify(x));
function plStateEl(s) {
  return el('span', { class: 'state' }, el('span', { class: 'dot', style: { background: PL_COLORS[s] || 'var(--line-strong)' } }), s || 'Not run');
}
function plSecs(s) { if (s == null) return '—'; s = Math.round(s); return s < 60 ? `${s}s` : s < 3600 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`; }
function plJsonDialog(title, obj) {
  return openDialog((close) => el('div', { class: 'dlg' }, el('div', { class: 'row' }, el('h2', { class: 'grow' }, title),
    btn('Copy', () => navigator.clipboard.writeText(JSON.stringify(obj, null, 2)).then(() => toast('Copied')), { cls: 'sm' }), btn('Close', () => close(null), { cls: 'sm' })),
  el('pre', { class: 'code', style: { maxHeight: '62vh', overflow: 'auto' } }, typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2))), { wide: true });
}

/* ======================= list page (tabs) ======================= */
/* Pipelines live in Workflows now; old links redirect. */
function viewPipelines(main, r) {
  location.replace(`#/workflows?tab=pipelines&sub=${r.params.get('tab') || 'pipelines'}`);
}

async function plListTab(main) {
  const panel = el('section', { class: 'panel' }, loading());
  main.append(panel);
  const load = async () => {
    let list;
    try { list = await api('/api/pipelines'); } catch (e) { panel.replaceChildren(errBox(e)); return; }
    if (!list.length) {
      panel.replaceChildren(el('div', { class: 'empty' }, el('h2', {}, 'No pipelines yet'),
        el('p', {}, 'Build ADF-style pipelines: copy data from APIs and databases, run notebooks and SQL, branch and loop.'),
        btn('New pipeline', () => plNewDialog(), { cls: 'primary' })));
      return;
    }
    const tb = el('tbody', {}, list.map((p) => {
      const trig = (p.published && p.published.triggers || []).filter((t) => t.enabled !== false);
      return el('tr', { class: 'clickable', onClick: () => (location.hash = `#/pipeline/${p.id}`) },
        el('td', {}, el('div', { style: { fontWeight: 600 } }, p.name), p.description ? el('div', { class: 'muted', style: { fontSize: '12px' } }, p.description) : null),
        el('td', {}, p.published ? el('span', { class: 'chip teal' }, `Published v${p.version}`) : el('span', { class: 'chip' }, 'Draft only')),
        el('td', { class: 'muted', style: { fontSize: '12.5px' } }, trig.length ? trig.map((t) => t.type === 'schedule' ? `⏰ ${t.cron}` : `⧗ every ${t.frequencyMinutes}m`).join(' · ') : 'Manual'),
        el('td', {}, el('div', { class: 'bars' }, [...p.recent_runs].reverse().map((x) => el('a', { href: `#/prun/${x.id}`, title: `#${x.run_number} ${x.state}`,
          onClick: (e) => e.stopPropagation(), style: { width: '9px', height: '20px', borderRadius: '2px', display: 'inline-block', background: PL_COLORS[x.state] || '#ccc' } })))),
        el('td', { style: { textAlign: 'right', whiteSpace: 'nowrap' } },
          btn('Trigger', async (e) => { e.stopPropagation(); await plTriggerDialog(p); }, { cls: 'sm', ic: 'play', disabled: !p.published })));
    }));
    panel.replaceChildren(el('table', { class: 't' }, el('thead', {}, el('tr', {}, ['Name', 'Status', 'Triggers', 'Last 10 runs', ''].map((h) => el('th', {}, h)))), tb));
  };
  await load();
  const t = setInterval(load, 5000);
  return () => clearInterval(t);
}

async function plTriggerDialog(p, debug = false) {
  const defn = debug ? p.draft : p.published;
  const defaults = Object.fromEntries(Object.entries(defn.parameters || {}).map(([k, v]) => [k, v.default ?? null]));
  const v = await formDialog({ title: `${debug ? 'Debug' : 'Trigger'} ${p.name}`, submit: debug ? 'Debug run' : 'Run now',
    fields: [{ name: 'params', label: 'Parameters (JSON)', type: 'textarea', value: JSON.stringify(defaults, null, 2), required: false }] });
  if (!v) return null;
  let params;
  try { params = v.params ? JSON.parse(v.params) : {}; } catch { toast('Parameters must be valid JSON', 'err'); return null; }
  try {
    const run = await api(`/api/pipelines/${p.id}/runs`, { method: 'POST', body: { parameters: params, debug } });
    location.hash = `#/prun/${run.id}`;
    return run;
  } catch (e) { toast(e.message, 'err'); return null; }
}

const PL_TEMPLATES = {
  blank: { label: 'Blank pipeline', def: { parameters: {}, variables: {}, activities: [], triggers: [] } },
  rest: { label: 'Incremental REST API → Bronze (Delta)', def: { parameters: { runDate: { type: 'string', default: '' } }, variables: {}, triggers: [], activities: [
    { name: 'CopyFromApi', type: 'Copy', ui: { x: 40, y: 60 }, typeProperties: { source: { type: 'rest', linkedService: '', url: '/orders', recordsPath: 'data', pageParam: 'page', maxPages: 20 },
      sink: { table: 'bronze.api_orders', mode: 'merge', keys: 'order_id', format: 'delta' }, incremental: { column: 'updated_at', initialValue: '2026-01-01T00:00:00' } } },
    { name: 'NotifyOnFailure', type: 'Web', ui: { x: 340, y: 160 }, dependsOn: [{ activity: 'CopyFromApi', conditions: ['Failed'] }],
      typeProperties: { url: 'https://example.com/webhook', method: 'POST', body: { pipeline: '@pipeline().Pipeline', error: "@activity('CopyFromApi').error" } } }] } },
  medallion: { label: 'Bronze → Silver per site (ForEach + notebook)', def: { parameters: { sites: { type: 'array', default: ['site_a', 'site_b'] } }, variables: {}, triggers: [], activities: [
    { name: 'CopyPostgres', type: 'Copy', ui: { x: 40, y: 60 }, typeProperties: { source: { type: 'postgresql', linkedService: '', query: 'SELECT * FROM public.orders' },
      sink: { table: 'bronze.orders', mode: 'append', format: 'delta' }, incremental: { column: 'updated_at', initialValue: '2026-01-01' } } },
    { name: 'SilverPerSite', type: 'ForEach', ui: { x: 340, y: 60 }, dependsOn: [{ activity: 'CopyPostgres', conditions: ['Succeeded'] }],
      typeProperties: { items: '@pipeline().parameters.sites', isSequential: false, batchCount: 4, activities: [
        { name: 'SilverNotebook', type: 'Notebook', ui: { x: 40, y: 60 }, typeProperties: { notebookPath: '', baseParameters: { site: '@item()' } } }] } }] } },
};
async function plNewDialog() {
  const v = await openDialog((close) => {
    const name = el('input', { class: 'field', placeholder: 'e.g. toast_orders_ingest' });
    const tpl = el('select', { class: 'field' }, Object.entries(PL_TEMPLATES).map(([k, t]) => el('option', { value: k }, t.label)));
    const f = el('form', { method: 'dialog' }, el('h2', {}, 'New pipeline'), el('label', { class: 'lbl' }, 'Name', name),
      el('label', { class: 'lbl' }, 'Start from', tpl),
      el('div', { class: 'actions' }, el('button', { type: 'button', class: 'btn', onClick: () => close(null) }, 'Cancel'), el('button', { type: 'submit', class: 'btn primary' }, 'Create')));
    f.addEventListener('submit', (e) => { e.preventDefault(); close({ name: name.value.trim(), tpl: tpl.value }); });
    setTimeout(() => name.focus(), 0);
    return f;
  });
  if (!v || !v.name) return;
  try {
    const p = await api('/api/pipelines', { method: 'POST', body: { name: v.name, definition: plClone(PL_TEMPLATES[v.tpl].def) } });
    location.hash = `#/pipeline/${p.id}`;
  } catch (e) { toast(e.message, 'err'); }
}

async function plRunsTab(main) {
  const panel = el('section', { class: 'panel' }, loading());
  main.append(panel);
  const load = async () => {
    let runs;
    try { runs = await api('/api/pipeline-runs?limit=100'); } catch (e) { panel.replaceChildren(errBox(e)); return; }
    if (!runs.length) { panel.replaceChildren(el('div', { class: 'empty' }, el('p', {}, 'No pipeline runs yet.'))); return; }
    panel.replaceChildren(el('div', { class: 'tbl-wrap' }, el('table', { class: 't' },
      el('thead', {}, el('tr', {}, ['Pipeline', 'Run', 'Status', 'Trigger', 'Started', 'Duration', 'Message'].map((h) => el('th', {}, h)))),
      el('tbody', {}, runs.map((x) => el('tr', { class: 'clickable', onClick: () => (location.hash = `#/prun/${x.id}`) },
        el('td', { style: { fontWeight: 600 } }, x.pipeline_name || '—', x.debug ? el('span', { class: 'chip', style: { marginLeft: '6px' } }, 'debug') : null),
        el('td', {}, `#${x.run_number}`), el('td', {}, plStateEl(x.state)),
        el('td', { class: 'muted' }, x.trigger_info && x.trigger_info.windowStartTime ? `${x.trigger} (${x.trigger_info.windowStartTime.slice(0, 16)})` : x.trigger),
        el('td', { class: 'muted' }, fmtTime(x.start * 1000)), el('td', { class: 'muted' }, plSecs(x.duration)),
        el('td', { class: 'muted', style: { maxWidth: '360px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, title: x.message || '' }, x.message || '')))))));
  };
  await load();
  const t = setInterval(load, 4000);
  return () => clearInterval(t);
}

/* ======================= linked services ======================= */
const PL_LS_FIELDS = {
  postgresql: [['host', 'Host'], ['port', 'Port', '5432'], ['database', 'Database'], ['user', 'User'], ['password', 'Password', '', 'password'], ['sslmode', 'SSL mode', 'prefer']],
  rest: [['baseUrl', 'Base URL', 'https://api.example.com'], ['headerName', 'Auth header name', 'x-api-key'], ['headerValue', 'Auth header value', '', 'password'], ['token', 'Bearer token (optional)', '', 'password']],
  adls: [['account', 'Storage account'], ['container', 'Container'], ['accountKey', 'Account key', '', 'password']],
};
async function plLinkedTab(main) {
  const panel = el('section', { class: 'panel' }, loading());
  main.append(panel);
  let list;
  try { list = await api('/api/linked-services'); } catch (e) { panel.replaceChildren(errBox(e)); return; }
  if (!list.length) { panel.replaceChildren(el('div', { class: 'empty' }, el('h2', {}, 'No linked services'), el('p', {}, 'Save connections to PostgreSQL, REST APIs and ADLS once, then use them in any pipeline.'), btn('New linked service', () => plLinkedDialog(null, () => render()), { cls: 'primary' }))); return; }
  panel.replaceChildren(el('table', { class: 't' }, el('thead', {}, el('tr', {}, ['Name', 'Type', 'Target', ''].map((h) => el('th', {}, h)))),
    el('tbody', {}, list.map((l) => el('tr', { class: 'clickable', onClick: () => plLinkedDialog(l, () => render()) },
      el('td', { style: { fontWeight: 600 } }, l.name), el('td', {}, el('span', { class: 'chip' }, l.type)),
      el('td', { class: 'mono muted', style: { fontSize: '12px' } }, l.config.baseUrl || (l.config.host ? `${l.config.host}/${l.config.database || ''}` : `${l.config.account || ''}/${l.config.container || ''}`)),
      el('td', { style: { textAlign: 'right' } }, btn('', async (e) => {
        e.stopPropagation();
        if (!(await confirmDialog(`Delete ${l.name}?`, 'Pipelines that use it will fail until you pick another.'))) return;
        await api(`/api/linked-services/${l.id}`, { method: 'DELETE' }); render();
      }, { cls: 'ghost icon sm', ic: 'trash', title: 'Delete' })))))));
}
function plLinkedDialog(ls, after) {
  return openDialog((close) => {
    const type = el('select', { class: 'field', disabled: !!ls }, Object.keys(PL_LS_FIELDS).map((t) => el('option', { value: t, selected: ls && ls.type === t }, t)));
    const name = el('input', { class: 'field', value: ls ? ls.name : '', placeholder: 'e.g. toast_api' });
    const fieldsBox = el('div', { class: 'stack', style: { gap: '10px' } });
    let inputs = {};
    const draw = () => {
      inputs = {};
      fieldsBox.replaceChildren(...PL_LS_FIELDS[type.value].map(([k, label, ph, kind]) => {
        const i = el('input', { class: 'field', type: kind === 'password' ? 'password' : 'text', placeholder: ph || '', value: ls ? (ls.config[k] ?? '') : '' });
        inputs[k] = i;
        return el('label', { class: 'lbl' }, label, i);
      }));
    };
    type.addEventListener('change', draw); draw();
    const result = el('div', { class: 'muted', style: { fontSize: '12.5px' } });
    const cfg = () => Object.fromEntries(Object.entries(inputs).map(([k, i]) => [k, i.value.trim()]));
    const f = el('form', { method: 'dialog' }, el('h2', {}, ls ? `Edit ${ls.name}` : 'New linked service'),
      el('div', { class: 'grid2' }, el('label', { class: 'lbl' }, 'Name', name), el('label', { class: 'lbl' }, 'Type', type)), fieldsBox, result,
      el('div', { class: 'actions' },
        el('button', { type: 'button', class: 'btn', onClick: async () => {
          result.textContent = 'Testing…';
          const r = await api('/api/linked-services/test', { method: 'POST', body: { id: ls && ls.id, type: type.value, config: cfg() } });
          result.textContent = `${r.ok ? '✓' : '✗'} ${r.message}`; result.style.color = r.ok ? '#1E6B3A' : '#B42318';
        } }, 'Test connection'),
        el('span', { class: 'grow' }),
        el('button', { type: 'button', class: 'btn', onClick: () => close(null) }, 'Cancel'),
        el('button', { type: 'submit', class: 'btn primary' }, 'Save')));
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await api(ls ? `/api/linked-services/${ls.id}` : '/api/linked-services', { method: ls ? 'PUT' : 'POST', body: { name: name.value.trim(), type: type.value, config: cfg() } });
        toast('Linked service saved'); close(true); after && after();
      } catch (err) { toast(err.message, 'err'); }
    });
    return f;
  });
}

/* ======================= canvas (shared by editor + monitor) ======================= */
const NODE_W = 200, NODE_H = 64;
function plAutoLayout(acts) {
  const names = acts.map((a) => a.name);
  const depth = {};
  const d = (a, seen = new Set()) => {
    if (depth[a.name] != null) return depth[a.name];
    if (seen.has(a.name)) return 0;
    seen.add(a.name);
    const parents = (a.dependsOn || []).map((x) => acts.find((y) => y.name === x.activity)).filter(Boolean);
    depth[a.name] = parents.length ? Math.max(...parents.map((p) => d(p, seen) + 1)) : 0;
    return depth[a.name];
  };
  const rows = {};
  acts.forEach((a) => {
    if (a.ui && a.ui.x != null) return;
    const c = d(a);
    rows[c] = (rows[c] || 0) + 1;
    a.ui = { x: 40 + c * (NODE_W + 90), y: 40 + (rows[c] - 1) * (NODE_H + 50) };
  });
  return names;
}
function plCanvas({ acts, readOnly = false, statusOf = () => null, selected = null, onSelect = () => {}, onChange = () => {}, onOpen = null }) {
  plAutoLayout(acts);
  const H = readOnly ? 82 : NODE_H;
  const wrap = el('div', { class: 'pl-canvas', tabIndex: 0 });
  const inner = el('div', { class: 'pl-canvas-inner' });
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.classList.add('pl-edges');
  inner.append(svg);
  wrap.append(inner);
  let temp = null;
  const size = () => {
    const w = Math.max(900, ...acts.map((a) => a.ui.x + NODE_W + 120));
    const h = Math.max(readOnly ? 160 : 420, ...acts.map((a) => a.ui.y + H + (readOnly ? 30 : 120)));
    inner.style.width = `${w}px`; inner.style.height = `${h}px`;
    svg.setAttribute('width', w); svg.setAttribute('height', h);
  };
  function drawEdges() {
    svg.replaceChildren();
    const defs = document.createElementNS(svgNS, 'defs');
    Object.entries(PL_COND).forEach(([k, c]) => {
      const m = document.createElementNS(svgNS, 'marker');
      m.setAttribute('id', `arr-${k}`); m.setAttribute('viewBox', '0 0 10 10'); m.setAttribute('refX', '9'); m.setAttribute('refY', '5');
      m.setAttribute('markerWidth', '7'); m.setAttribute('markerHeight', '7'); m.setAttribute('orient', 'auto-start-reverse');
      const pth = document.createElementNS(svgNS, 'path'); pth.setAttribute('d', 'M0,0 L10,5 L0,10 z'); pth.setAttribute('fill', c);
      m.append(pth); defs.append(m);
    });
    svg.append(defs);
    for (const a of acts) for (const dep of a.dependsOn || []) {
      const s = acts.find((x) => x.name === dep.activity);
      if (!s) continue;
      const cond = (dep.conditions || ['Succeeded'])[0];
      const x1 = s.ui.x + NODE_W, y1 = s.ui.y + H / 2, x2 = a.ui.x - 2, y2 = a.ui.y + H / 2, mx = (x1 + x2) / 2;
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', `M${x1} ${y1} C${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`);
      path.setAttribute('fill', 'none'); path.setAttribute('stroke', PL_COND[cond]); path.setAttribute('stroke-width', selected === `${s.name}->${a.name}` ? '3.5' : '2');
      path.setAttribute('marker-end', `url(#arr-${cond})`);
      path.classList.add('pl-edge');
      const title = document.createElementNS(svgNS, 'title'); title.textContent = `${s.name} → ${a.name} on ${cond}`; path.append(title);
      if (!readOnly) path.addEventListener('mousedown', (e) => { e.stopPropagation(); onSelect(`${s.name}->${a.name}`); });
      svg.append(path);
    }
    if (temp) {
      const p = document.createElementNS(svgNS, 'path');
      p.setAttribute('d', `M${temp.x1} ${temp.y1} L${temp.x2} ${temp.y2}`); p.setAttribute('stroke', '#0A5CFF'); p.setAttribute('stroke-dasharray', '5 4'); p.setAttribute('fill', 'none'); p.setAttribute('stroke-width', '2');
      svg.append(p);
    }
  }
  function drawNodes() {
    inner.querySelectorAll('.pl-node').forEach((n) => n.remove());
    for (const a of acts) {
      const t = PL_TYPES[a.type] || { label: a.type, ic: '?' };
      const st = statusOf(a.name);
      const node = el('div', { class: `pl-node${selected === a.name ? ' sel' : ''}`, style: { left: `${a.ui.x}px`, top: `${a.ui.y}px`, width: `${NODE_W}px`, height: `${H}px`,
        borderLeftColor: st ? PL_COLORS[st.state] || '#ccc' : '#0A5CFF' }, 'data-name': a.name },
      el('div', { class: 'pl-node-head' }, el('span', { class: 'pl-node-ic' }, t.ic), el('span', { class: 'pl-node-type' }, t.label)),
      el('div', { class: 'pl-node-name', title: a.name }, a.name),
      st ? el('div', { class: 'pl-node-st' }, plStateEl(st.state), st.duration != null ? el('span', { class: 'muted' }, ` ${plSecs(st.duration)}`) : null) : null,
      onOpen && (a.type === 'ForEach' || a.type === 'IfCondition') ? el('div', { class: 'pl-node-open' },
        a.type === 'ForEach' ? el('button', { type: 'button', onClick: (e) => { e.stopPropagation(); onOpen(a, 'activities'); } }, `Activities (${(a.typeProperties.activities || []).length}) ▸`)
          : [el('button', { type: 'button', onClick: (e) => { e.stopPropagation(); onOpen(a, 'ifTrueActivities'); } }, `True (${(a.typeProperties.ifTrueActivities || []).length}) ▸`),
            el('button', { type: 'button', onClick: (e) => { e.stopPropagation(); onOpen(a, 'ifFalseActivities'); } }, `False (${(a.typeProperties.ifFalseActivities || []).length}) ▸`)]) : null,
      readOnly ? null : el('span', { class: 'pl-port', title: 'Drag to another activity to connect' }));
      node.addEventListener('mousedown', (e) => {
        if (e.target.closest('button')) return;
        onSelect(a.name);
        if (readOnly) return;
        if (e.target.classList.contains('pl-port')) {           // start connection
          e.preventDefault();
          const box = inner.getBoundingClientRect();
          temp = { from: a, x1: a.ui.x + NODE_W, y1: a.ui.y + NODE_H / 2, x2: a.ui.x + NODE_W, y2: a.ui.y + NODE_H / 2 };
          const mv = (ev) => { temp.x2 = ev.clientX - box.left; temp.y2 = ev.clientY - box.top; drawEdges(); };
          const up = (ev) => {
            document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up);
            const target = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('.pl-node');
            const tname = target && target.dataset.name;
            temp = null;
            if (tname && tname !== a.name) {
              const t2 = acts.find((x) => x.name === tname);
              t2.dependsOn = t2.dependsOn || [];
              if (!t2.dependsOn.some((d) => d.activity === a.name)) { t2.dependsOn.push({ activity: a.name, conditions: ['Succeeded'] }); onChange(); onSelect(`${a.name}->${tname}`); }
            }
            drawEdges();
          };
          document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up);
          return;
        }
        const sx = e.clientX, sy = e.clientY, ox = a.ui.x, oy = a.ui.y;              // drag node
        let moved = false;
        const mv = (ev) => {
          a.ui.x = Math.max(0, Math.round((ox + ev.clientX - sx) / 10) * 10); a.ui.y = Math.max(0, Math.round((oy + ev.clientY - sy) / 10) * 10);
          node.style.left = `${a.ui.x}px`; node.style.top = `${a.ui.y}px`; moved = true; drawEdges(); size();
        };
        const up = () => { document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); if (moved) onChange(); };
        document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up);
      });
      inner.append(node);
    }
  }
  wrap.addEventListener('mousedown', (e) => { if (e.target === wrap || e.target === inner || e.target === svg) onSelect(null); });
  const redraw = () => { size(); drawEdges(); drawNodes(); };
  redraw();
  return { el: wrap, redraw, setSelected(s) { selected = s; redraw(); } };
}

/* ======================= editor ======================= */
async function viewPipeline(main, r) {
  const pid = r.rest[0];
  main.classList.add('flush');
  main.append(loading());
  let P, notebooks = [], linked = [], pipes = [];
  try { [P, notebooks, linked, pipes] = await Promise.all([api(`/api/pipelines/${pid}`), api('/api/jobs/notebooks'), api('/api/linked-services'), api('/api/pipelines')]); }
  catch (e) { main.replaceChildren(errBox(e)); return () => main.classList.remove('flush'); }
  main.replaceChildren();
  const defn = plClone(P.draft);
  defn.parameters = defn.parameters || {}; defn.variables = defn.variables || {}; defn.triggers = defn.triggers || []; defn.activities = defn.activities || [];
  let name = P.name, dirty = false, selected = null;
  const stack = [{ label: 'Pipeline', list: defn.activities }];
  const cur = () => stack[stack.length - 1].list;

  const saveState = el('span', { class: 'muted', style: { fontSize: '12px' } }, P.published ? `Published v${P.version}` : 'Not published');
  const setDirty = () => { dirty = true; saveState.textContent = 'Unsaved changes'; };
  const crumbs = el('div', { class: 'pl-crumbs' });
  const palette = el('aside', { class: 'pl-palette' });
  const canvasBox = el('div', { class: 'pl-canvas-box' });
  const props = el('aside', { class: 'pl-props' });
  const nameIn = el('input', { class: 'pl-name', value: name, 'aria-label': 'Pipeline name', onInput: (e) => { name = e.target.value; setDirty(); } });
  main.append(el('div', { class: 'pl-editor' },
    el('div', { class: 'pl-top' }, el('a', { href: '#/workflows?tab=pipelines', class: 'muted', style: { fontSize: '13px' } }, 'Workflows › Pipelines ›'), nameIn, saveState, el('span', { class: 'grow' }),
      btn('Save', () => save(), { ic: 'save' }), btn('Validate', () => validateNow(), { ic: 'fold' }),
      btn('Debug', async () => { await save(true); const p2 = await api(`/api/pipelines/${pid}`); plTriggerDialog(p2, true); }, { ic: 'play' }),
      btn('Publish', async () => { await save(true); try { P = await api(`/api/pipelines/${pid}/publish`, { method: 'POST' }); saveState.textContent = `Published v${P.version}`; toast(`Published v${P.version}`); } catch (e) { toast(e.message, 'err'); } }, { cls: 'primary', ic: 'flow' }),
      btn('Trigger now', async () => { const p2 = await api(`/api/pipelines/${pid}`); if (!p2.published) { toast('Publish first', 'err'); return; } plTriggerDialog(p2); }, { ic: 'play' }),
      el('a', { class: 'btn', href: `#/workflows?tab=pipelines&sub=runs` }, 'Monitor')),
    crumbs, el('div', { class: 'pl-body' }, palette, canvasBox, props)));

  async function save(quiet = false) {
    try {
      P = await api(`/api/pipelines/${pid}`, { method: 'PUT', body: { name: name.trim(), description: P.description, definition: defn } });
      dirty = false; saveState.textContent = P.published ? `Saved · published v${P.version}` : 'Saved (not published)';
      if (!quiet) toast('Draft saved');
    } catch (e) { toast(e.message, 'err'); throw e; }
  }
  async function validateNow() {
    const res = await api(`/api/pipelines/${pid}/validate`, { method: 'POST', body: { definition: defn } });
    if (!res.errors.length) toast('✓ Pipeline is valid');
    else plJsonDialog(`${res.errors.length} problem(s)`, res.errors.join('\n'));
  }

  // palette
  const groups = {};
  Object.entries(PL_TYPES).forEach(([k, t]) => { (groups[t.group] = groups[t.group] || []).push([k, t]); });
  palette.append(el('div', { class: 'pl-pal-title' }, 'Activities'), ...Object.entries(groups).map(([g, items]) => el('div', {},
    el('div', { class: 'pl-pal-group' }, g), items.map(([k, t]) => el('button', { type: 'button', class: 'pl-pal-item', draggable: 'true',
      onClick: () => addActivity(k), onDragstart: (e) => e.dataTransfer.setData('text/pl-type', k) }, el('span', { class: 'pl-node-ic' }, t.ic), t.label)))));
  canvasBox.addEventListener('dragover', (e) => e.preventDefault());
  canvasBox.addEventListener('drop', (e) => {
    const k = e.dataTransfer.getData('text/pl-type');
    if (!k) return;
    const box = canvasBox.querySelector('.pl-canvas-inner').getBoundingClientRect();
    addActivity(k, Math.max(0, e.clientX - box.left - NODE_W / 2), Math.max(0, e.clientY - box.top - NODE_H / 2));
  });
  function uniqueName(base) { const all = new Set(); const walk = (l) => l.forEach((a) => { all.add(a.name); Object.values(a.typeProperties || {}).forEach((v) => Array.isArray(v) && v[0] && v[0].type && walk(v)); }); walk(defn.activities); let i = 1; while (all.has(`${base}${i}`)) i++; return `${base}${i}`; }
  function addActivity(type, x, y) {
    const list = cur();
    const a = { name: uniqueName(type), type, dependsOn: [], policy: { timeoutSeconds: 0, retry: 0, retryIntervalInSeconds: 30 }, typeProperties: plClone(PL_DEFAULTS[type]),
      ui: { x: x ?? 40 + (list.length % 4) * (NODE_W + 60), y: y ?? 40 + Math.floor(list.length / 4) * (NODE_H + 60) } };
    list.push(a); setDirty(); selected = a.name; drawAll();
  }
  let canvas;
  function drawCrumbs() {
    setKids(crumbs, ...stack.map((s, i) => [i ? el('span', { class: 'muted' }, ' › ') : null,
      i === stack.length - 1 ? el('b', {}, s.label) : el('a', { href: '#', onClick: (e) => { e.preventDefault(); stack.splice(i + 1); selected = null; drawAll(); } }, s.label)]).flat(),
    el('span', { class: 'grow' }), el('span', { class: 'muted', style: { fontSize: '12px' } }, 'Drag the ● port to connect · click an arrow to change its condition · Delete removes the selection'));
  }
  function drawAll() {
    drawCrumbs();
    canvas = plCanvas({ acts: cur(), selected, onSelect: (s) => { selected = s; canvas.setSelected(s); drawProps(); }, onChange: setDirty,
      onOpen: (a, key) => { stack.push({ label: `${a.name}${key === 'activities' ? '' : key === 'ifTrueActivities' ? ' (True)' : ' (False)'}`, list: a.typeProperties[key] }); selected = null; drawAll(); } });
    canvasBox.replaceChildren(canvas.el);
    drawProps();
  }
  const onKey = (e) => {
    if (!(e.key === 'Delete' || e.key === 'Backspace') || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || !selected) return;
    const list = cur();
    if (selected.includes('->')) {
      const [s, t] = selected.split('->');
      const a = list.find((x) => x.name === t);
      if (a) a.dependsOn = (a.dependsOn || []).filter((d) => d.activity !== s);
    } else {
      const i = list.findIndex((x) => x.name === selected);
      if (i >= 0) list.splice(i, 1);
      list.forEach((a) => { a.dependsOn = (a.dependsOn || []).filter((d) => d.activity !== selected); });
    }
    selected = null; setDirty(); drawAll(); e.preventDefault();
  };
  document.addEventListener('keydown', onKey);

  /* ---- properties panel ---- */
  const lbl = (text, input, hint) => el('label', { class: 'lbl' }, text, input, hint ? el('span', { class: 'pl-hint' }, hint) : null);
  const txt = (obj, key, { mono = true, area = false, ph = '' } = {}) => {
    const i = el(area ? 'textarea' : 'input', { class: `field${mono ? ' mono' : ''}`, placeholder: ph, rows: area ? 5 : null }, area ? (obj[key] ?? '') : null);
    if (!area) i.value = obj[key] ?? '';
    i.addEventListener('input', () => { obj[key] = i.value; setDirty(); });
    return i;
  };
  const num = (obj, key) => { const i = el('input', { class: 'field', type: 'number', value: obj[key] ?? '' }); i.addEventListener('input', () => { obj[key] = i.value === '' ? null : Number(i.value); setDirty(); }); return i; };
  const chk = (obj, key, label) => { const i = el('input', { type: 'checkbox', checked: !!obj[key] }); i.addEventListener('change', () => { obj[key] = i.checked; setDirty(); }); return el('label', { class: 'switch' }, i, label); };
  const sel = (obj, key, options, onchange) => {
    const s = el('select', { class: 'field' }, options.map(([v, t]) => el('option', { value: v, selected: String(obj[key] ?? '') === String(v) }, t)));
    s.addEventListener('change', () => { obj[key] = s.value; setDirty(); onchange && onchange(); });
    return s;
  };
  const kv = (obj, key) => {
    obj[key] = obj[key] || {};
    const box = el('div', { class: 'pl-kv' });
    const draw = () => box.replaceChildren(...Object.entries(obj[key]).map(([k, v]) => {
      const ki = el('input', { class: 'field mono', value: k, placeholder: 'name' });
      const vi = el('input', { class: 'field mono', value: typeof v === 'string' ? v : JSON.stringify(v), placeholder: 'value or @expression' });
      const upd = () => { const o = {}; box.querySelectorAll('.pl-kv-row').forEach((row) => { const [a, b] = row.querySelectorAll('input'); if (a.value) o[a.value] = b.value; }); obj[key] = o; setDirty(); };
      ki.addEventListener('change', upd); vi.addEventListener('input', upd);
      return el('div', { class: 'pl-kv-row' }, ki, vi, btn('', () => { delete obj[key][k]; setDirty(); draw(); }, { cls: 'ghost icon sm', ic: 'x', title: 'Remove' }));
    }), btn('Add', () => { let n = 1; while (obj[key][`param${n}`] !== undefined) n++; obj[key][`param${n}`] = ''; setDirty(); draw(); }, { cls: 'sm', ic: 'plus' }));
    draw();
    return box;
  };
  const lsSel = (obj, type) => sel(obj, 'linkedService', [['', '— choose —'], ...linked.filter((l) => l.type === type).map((l) => [l.name, l.name])]);

  function sourceFields(src, allowRest = true) {
    const box = el('div', { class: 'stack', style: { gap: '10px' } });
    const draw = () => {
      const t = src.type;
      const f = [lbl('Source type', sel(src, 'type', [...(allowRest ? [['rest', 'REST API']] : []), ['postgresql', 'PostgreSQL (linked service)'], ['spark_sql', 'Spark SQL query'], ['table', 'Catalog table'], ...(allowRest ? [['file', 'Files (ADLS / path)']] : [])], draw))];
      if (t === 'rest') f.push(lbl('Linked service', lsSel(src, 'rest')), lbl('Relative URL', txt(src, 'url', { ph: '/orders?updated_since=@{pipeline().parameters.since}' })),
        lbl('Records path', txt(src, 'recordsPath', { ph: 'data.orders' }), 'Dot path to the array of records in the JSON response'),
        el('div', { class: 'grid2' }, lbl('Page parameter', txt(src, 'pageParam', { ph: 'page' })), lbl('Max pages', num(src, 'maxPages'))));
      if (t === 'postgresql') f.push(lbl('Linked service', lsSel(src, 'postgresql')), lbl('Query', txt(src, 'query', { area: true, ph: 'SELECT * FROM public.orders' })));
      if (t === 'spark_sql') f.push(lbl('Query', txt(src, 'query', { area: true, ph: 'SELECT * FROM bronze.orders' })));
      if (t === 'table') f.push(lbl('Table', txt(src, 'table', { ph: 'bronze.orders' })));
      if (t === 'file') f.push(lbl('Linked service (ADLS, optional)', lsSel(src, 'adls')), lbl('Path', txt(src, 'path', { ph: 'landing/toast/@{formatDateTime(utcNow(),\'yyyy/MM/dd\')}/' })),
        lbl('Format', sel(src, 'format', [['parquet', 'Parquet'], ['csv', 'CSV'], ['json', 'JSON'], ['delta', 'Delta']])));
      box.replaceChildren(...f);
    };
    draw();
    return box;
  }

  function drawProps() {
    const list = cur();
    if (selected && selected.includes('->')) {                       // dependency arrow
      const [s, t] = selected.split('->');
      const a = list.find((x) => x.name === t);
      const dep = a && (a.dependsOn || []).find((d) => d.activity === s);
      if (!dep) { selected = null; return drawProps(); }
      props.replaceChildren(el('h3', {}, 'Dependency'), el('p', { class: 'muted' }, `${s} → ${t}`),
        el('div', { class: 'stack', style: { gap: '6px' } }, Object.entries(PL_COND).map(([c, col]) => el('label', { class: 'pl-cond' },
          el('input', { type: 'radio', name: 'cond', checked: (dep.conditions || ['Succeeded'])[0] === c, onChange: () => { dep.conditions = [c]; setDirty(); canvas.redraw(); } }),
          el('span', { class: 'dot', style: { background: col } }), `On ${c.toLowerCase()}`))),
        el('p', { class: 'pl-hint' }, 'Succeeded / Failed / Completed (either) / Skipped — like Azure Data Factory. A failure that has an on-Failed or on-Completed path is treated as handled.'),
        btn('Remove dependency', () => { a.dependsOn = a.dependsOn.filter((d) => d !== dep); selected = null; setDirty(); drawAll(); }, { cls: 'danger sm', ic: 'trash' }));
      return;
    }
    const a = selected && list.find((x) => x.name === selected);
    if (!a) return drawPipelineProps();
    const tp = a.typeProperties = a.typeProperties || {};
    const t = PL_TYPES[a.type] || { label: a.type };
    const nameI = el('input', { class: 'field', value: a.name });
    nameI.addEventListener('change', () => {
      const nn = nameI.value.trim();
      if (!nn || list.some((x) => x !== a && x.name === nn)) { toast('Names must be unique', 'err'); nameI.value = a.name; return; }
      list.forEach((x) => (x.dependsOn || []).forEach((d) => { if (d.activity === a.name) d.activity = nn; }));
      a.name = nn; selected = nn; setDirty(); canvas.redraw();
    });
    const f = [el('div', { class: 'row' }, el('span', { class: 'pl-node-ic' }, t.ic), el('h3', { class: 'grow' }, t.label),
      btn('', () => { onKey({ key: 'Delete', target: document.body, preventDefault() {} }); }, { cls: 'ghost icon sm', ic: 'trash', title: 'Delete activity' })),
    lbl('Name', nameI), lbl('Description', txt(a, 'description', { mono: false }))];
    const T = a.type;
    if (T === 'Notebook') f.push(lbl('Notebook', sel(tp, 'notebookPath', [['', '— choose —'], ...notebooks.map((n) => [n, n])])), lbl('Base parameters', kv(tp, 'baseParameters'), 'Become dbutils.widgets in the notebook. Values can be @expressions, e.g. @item()'));
    if (T === 'SqlScript') f.push(lbl('SQL', txt(tp, 'query', { area: true, ph: 'MERGE INTO silver.orders …' })));
    if (T === 'Web') f.push(lbl('URL', txt(tp, 'url', { ph: 'https://… or /path with a linked service' })), lbl('Linked service (optional)', lsSel(tp, 'rest')),
      lbl('Method', sel(tp, 'method', [['GET', 'GET'], ['POST', 'POST'], ['PUT', 'PUT'], ['DELETE', 'DELETE']])), lbl('Headers', kv(tp, 'headers')),
      lbl('Body (JSON, may contain @expressions)', (() => { const i = el('textarea', { class: 'field mono', rows: 5 }, tp.body ? JSON.stringify(tp.body, null, 2) : ''); i.addEventListener('change', () => { try { tp.body = i.value.trim() ? JSON.parse(i.value) : null; setDirty(); } catch { toast('Body must be valid JSON', 'err'); } }); return i; })()));
    if (T === 'Lookup') { tp.source = tp.source || { type: 'spark_sql' }; f.push(el('div', { class: 'pl-sec' }, 'Source'), sourceFields(tp.source, false), chk(tp, 'firstRowOnly', 'First row only')); }
    if (T === 'SetVariable' || T === 'AppendVariable') f.push(lbl('Variable', sel(tp, 'variableName', [['', '— choose —'], ...Object.keys(defn.variables).map((v) => [v, v])])), lbl('Value', txt(tp, 'value', { ph: "@activity('Lookup1').output.firstRow.max_ts" })));
    if (T === 'ExecutePipeline') f.push(lbl('Pipeline', sel(tp, 'pipeline', [['', '— choose —'], ...pipes.filter((p) => p.id !== pid).map((p) => [p.name, p.name])])), lbl('Parameters', kv(tp, 'parameters')), chk(tp, 'waitOnCompletion', 'Wait on completion'));
    if (T === 'Wait') f.push(lbl('Wait time (seconds)', num(tp, 'waitTimeInSeconds')));
    if (T === 'Fail') f.push(lbl('Message', txt(tp, 'message')), lbl('Error code', txt(tp, 'errorCode')));
    if (T === 'IfCondition') f.push(lbl('Expression', txt(tp, 'expression', { ph: "@greater(activity('Lookup1').output.firstRow.n, 0)" })),
      el('div', { class: 'row' }, btn(`Edit True (${tp.ifTrueActivities.length})`, () => { stack.push({ label: `${a.name} (True)`, list: tp.ifTrueActivities }); selected = null; drawAll(); }, { cls: 'sm' }),
        btn(`Edit False (${tp.ifFalseActivities.length})`, () => { stack.push({ label: `${a.name} (False)`, list: tp.ifFalseActivities }); selected = null; drawAll(); }, { cls: 'sm' })));
    if (T === 'ForEach') f.push(lbl('Items', txt(tp, 'items', { ph: "@pipeline().parameters.sites   or   @activity('Lookup1').output.value" })),
      chk(tp, 'isSequential', 'Sequential'), lbl('Batch count (parallel)', num(tp, 'batchCount')),
      btn(`Edit activities (${tp.activities.length})`, () => { stack.push({ label: a.name, list: tp.activities }); selected = null; drawAll(); }, { cls: 'sm' }));
    if (T === 'Copy') {
      tp.source = tp.source || { type: 'rest' }; tp.sink = tp.sink || { mode: 'append', format: 'delta' }; tp.incremental = tp.incremental || {};
      const keysBox = el('div');
      const drawKeys = () => keysBox.replaceChildren(tp.sink.mode === 'merge' ? lbl('Merge keys', txt(tp.sink, 'keys', { ph: 'order_id  or  tenant_id, order_id' })) : '');
      f.push(el('div', { class: 'pl-sec' }, 'Source'), sourceFields(tp.source),
        el('div', { class: 'pl-sec' }, 'Sink (Delta table)'), lbl('Table', txt(tp.sink, 'table', { ph: 'bronze.toast_orders' })),
        el('div', { class: 'grid2' }, lbl('Write mode', sel(tp.sink, 'mode', [['append', 'Append'], ['overwrite', 'Overwrite'], ['merge', 'Upsert (MERGE)']], drawKeys)),
          lbl('Format', sel(tp.sink, 'format', [['delta', 'Delta'], ['parquet', 'Parquet']]))), keysBox,
        el('div', { class: 'pl-sec' }, 'Incremental load (optional)'),
        el('div', { class: 'grid2' }, lbl('Watermark column', txt(tp.incremental, 'column', { ph: 'updated_at' })), lbl('Initial value', txt(tp.incremental, 'initialValue', { ph: '2026-01-01' }))),
        el('p', { class: 'pl-hint' }, 'Only rows with watermark column > last saved value are copied; the new maximum is saved after each successful run.'));
      drawKeys();
    }
    a.policy = a.policy || {};
    f.push(el('div', { class: 'pl-sec' }, 'Policy'), el('div', { class: 'grid3' }, lbl('Timeout (s)', num(a.policy, 'timeoutSeconds')), lbl('Retries', num(a.policy, 'retry')), lbl('Retry interval (s)', num(a.policy, 'retryIntervalInSeconds'))));
    props.replaceChildren(...f);
  }

  function drawPipelineProps() {
    const paramBox = el('div', { class: 'stack', style: { gap: '6px' } });
    const drawParams = (obj, box, what) => box.replaceChildren(...Object.entries(obj).map(([k, v]) => {
      const n = el('input', { class: 'field mono', value: k });
      const ty = el('select', { class: 'field' }, ['string', 'int', 'bool', 'array', 'object'].map((x) => el('option', { value: x, selected: v.type === x }, x)));
      const d = el('input', { class: 'field mono', value: v.default == null ? '' : (typeof v.default === 'string' ? v.default : JSON.stringify(v.default)), placeholder: 'default' });
      const upd = () => {
        let dv = d.value;
        if (ty.value !== 'string' && dv !== '') { try { dv = JSON.parse(dv); } catch { /* keep text */ } }
        delete obj[k]; obj[n.value || k] = { type: ty.value, default: dv === '' ? null : dv }; setDirty();
      };
      n.addEventListener('change', () => { upd(); drawParams(obj, box, what); }); ty.addEventListener('change', upd); d.addEventListener('change', upd);
      return el('div', { class: 'pl-param' }, n, ty, d, btn('', () => { delete obj[k]; setDirty(); drawParams(obj, box, what); }, { cls: 'ghost icon sm', ic: 'x', title: 'Remove' }));
    }), btn(`Add ${what}`, () => { let i = 1; while (obj[`${what}${i}`]) i++; obj[`${what}${i}`] = { type: 'string', default: null }; setDirty(); drawParams(obj, box, what); }, { cls: 'sm', ic: 'plus' }));
    const varBox = el('div', { class: 'stack', style: { gap: '6px' } });
    drawParams(defn.parameters, paramBox, 'param'); drawParams(defn.variables, varBox, 'var');
    const trigBox = el('div', { class: 'stack', style: { gap: '10px' } });
    const drawTrig = () => trigBox.replaceChildren(...defn.triggers.map((t, i) => {
      const rows = [el('div', { class: 'row' }, el('b', { class: 'grow' }, `${t.type === 'schedule' ? '⏰ Schedule' : '⧗ Tumbling window'} · ${t.name}`), chk(t, 'enabled', 'Enabled'),
        btn('', () => { defn.triggers.splice(i, 1); setDirty(); drawTrig(); }, { cls: 'ghost icon sm', ic: 'trash', title: 'Remove trigger' }))];
      if (t.type === 'schedule') rows.push(el('div', { class: 'grid2' }, lbl('Cron', txt(t, 'cron', { ph: '0 2 * * *' })), lbl('Timezone', txt(t, 'timezone', { mono: false, ph: 'Asia/Kolkata' }))));
      else rows.push(el('div', { class: 'grid2' }, lbl('Every (minutes)', num(t, 'frequencyMinutes')), lbl('Max concurrency', num(t, 'maxConcurrency'))),
        el('div', { class: 'grid2' }, lbl('Start time (UTC)', txt(t, 'startTime', { ph: '2026-09-27T00:00:00Z' })), lbl('End time (optional)', txt(t, 'endTime', { ph: '' }))),
        el('p', { class: 'pl-hint' }, "Each run gets @trigger().outputs.windowStartTime / windowEndTime. Past windows are back-filled automatically."));
      rows.push(lbl('Parameters (JSON)', (() => { const x = el('textarea', { class: 'field mono', rows: 2 }, JSON.stringify(t.parameters || {})); x.addEventListener('change', () => { try { t.parameters = JSON.parse(x.value || '{}'); setDirty(); } catch { toast('Trigger parameters must be JSON', 'err'); } }); return x; })()));
      return el('div', { class: 'pl-trig' }, rows);
    }), el('div', { class: 'row' },
      btn('Add schedule', () => { defn.triggers.push({ type: 'schedule', name: `schedule${defn.triggers.length + 1}`, cron: '0 2 * * *', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, enabled: true, parameters: {} }); setDirty(); drawTrig(); }, { cls: 'sm', ic: 'plus' }),
      btn('Add tumbling window', () => { defn.triggers.push({ type: 'tumbling', name: `window${defn.triggers.length + 1}`, frequencyMinutes: 60, maxConcurrency: 1, startTime: new Date().toISOString().slice(0, 13) + ':00:00Z', enabled: true, parameters: {} }); setDirty(); drawTrig(); }, { cls: 'sm', ic: 'plus' })));
    drawTrig();
    props.replaceChildren(el('h3', {}, stack.length > 1 ? `Inside ${stack[stack.length - 1].label}` : 'Pipeline'),
      stack.length > 1 ? el('p', { class: 'pl-hint' }, 'Activities here run for each item / branch. Use @item() inside a ForEach.') : null,
      el('div', { class: 'pl-sec' }, 'Parameters'), paramBox, el('div', { class: 'pl-sec' }, 'Variables'), varBox,
      el('div', { class: 'pl-sec' }, 'Triggers (active after Publish)'), trigBox,
      el('div', { class: 'pl-sec' }, 'Expression cheat sheet'),
      el('pre', { class: 'pl-cheat' }, "@pipeline().parameters.site\n@pipeline().RunId   @pipeline().TriggerTime\n@variables('name')\n@activity('Lookup1').output.firstRow.col\n@activity('Copy1').output.rowsWritten\n@item()            (inside ForEach)\n@trigger().outputs.windowStartTime\n@formatDateTime(utcNow(),'yyyy-MM-dd')\n@addDays(utcNow(), -1, 'yyyy-MM-dd')\n@concat('a', 'b')   @equals(a, b)   @if(c, a, b)\ntext with @{pipeline().parameters.site} inside"));
  }

  drawAll();
  const unload = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
  window.addEventListener('beforeunload', unload);
  return () => {
    document.removeEventListener('keydown', onKey); window.removeEventListener('beforeunload', unload);
    main.classList.remove('flush');
    if (dirty) api(`/api/pipelines/${pid}`, { method: 'PUT', body: { name: name.trim(), description: P.description, definition: defn } }).catch(() => {});
  };
}

/* ======================= run monitor ======================= */
async function viewPipelineRun(main, r) {
  const rid = r.rest[0];
  let run;
  main.append(loading());
  try { run = await api(`/api/pipeline-runs/${rid}`); } catch (e) { main.replaceChildren(errBox(e)); return; }
  main.replaceChildren();
  const head = el('div', { class: 'page-head' });
  const canvasPanel = el('section', { class: 'panel', style: { marginBottom: '16px' } });
  const gantt = el('section', { class: 'panel', style: { marginBottom: '16px' } });
  const table = el('section', { class: 'panel' });
  main.append(head, canvasPanel, gantt, table);
  const active = () => ['Queued', 'InProgress'].includes(run.state);
  function draw() {
    setKids(head, el('div', { class: 'grow' },
      el('div', { class: 'crumbs' }, el('a', { href: '#/workflows?tab=pipelines&sub=runs' }, 'Monitor'), el('span', {}, '›'), el('a', { href: `#/pipeline/${run.pipeline_id}` }, run.pipeline_name)),
      el('div', { class: 'row', style: { marginTop: '4px' } }, el('h1', {}, `Run #${run.run_number}`), plStateEl(run.state), run.debug ? el('span', { class: 'chip' }, 'debug') : null),
      el('div', { class: 'muted', style: { fontSize: '13px', marginTop: '4px' } },
        `${run.trigger}${run.trigger_info.name && run.trigger_info.name !== run.trigger ? ` (${run.trigger_info.name})` : ''} · started ${fmtTime(run.start * 1000)} · ${active() ? 'running for' : 'took'} ${plSecs(run.duration)}`
        + (run.trigger_info.windowStartTime ? ` · window ${run.trigger_info.windowStartTime} → ${run.trigger_info.windowEndTime}` : '')),
      Object.keys(run.params || {}).length ? el('div', { class: 'row', style: { gap: '6px', marginTop: '8px', flexWrap: 'wrap' } },
        Object.entries(run.params).map(([k, v]) => el('span', { class: 'chip mono', style: { fontWeight: 500 } }, `${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`))) : null,
      run.message ? el('div', { class: run.state === 'Failed' ? 'error-box' : 'muted', style: { marginTop: '10px', fontSize: '13px' } }, run.message) : null),
    active() ? btn('Cancel', async () => { await api(`/api/pipeline-runs/${rid}/cancel`, { method: 'POST' }); toast('Cancelling…'); }, { cls: 'danger', ic: 'stop' }) : null,
    !active() && run.state !== 'Succeeded' ? btn('Rerun from failed', async () => { const x = await api(`/api/pipeline-runs/${rid}/rerun`, { method: 'POST', body: { fromFailed: true } }); location.hash = `#/prun/${x.id}`; }, { ic: 'restart' }) : null,
    !active() ? btn('Rerun', async () => { const x = await api(`/api/pipeline-runs/${rid}/rerun`, { method: 'POST', body: {} }); location.hash = `#/prun/${x.id}`; }, { cls: 'primary', ic: 'play' }) : null);

    const top = {};
    run.activities.filter((a) => !a.path).forEach((a) => { top[a.name] = a; });
    const acts = plClone(run.definition.activities || []);
    setKids(canvasPanel, el('div', { class: 'panel-head' }, el('h2', {}, 'Pipeline')),
      plCanvas({ acts, readOnly: true, statusOf: (n) => top[n] ? { state: top[n].state, duration: top[n].duration } : null }).el);

    const withTimes = run.activities.filter((a) => a.start);
    const t0 = Math.min(...withTimes.map((a) => a.start), run.start);
    const t1 = Math.max(...withTimes.map((a) => a.end || Date.now() / 1000), run.end || Date.now() / 1000);
    const span = Math.max(1, t1 - t0);
    setKids(gantt, el('div', { class: 'panel-head' }, el('h2', {}, 'Timeline'), el('span', { class: 'muted', style: { fontSize: '12px' } }, plSecs(span))),
      el('div', { class: 'gantt' }, withTimes.map((a) => el('div', { class: 'gantt-row' },
        el('div', { class: 'gantt-label mono', title: a.path + a.name }, a.path + a.name),
        el('div', { class: 'gantt-track' }, el('span', { class: 'gantt-bar', title: `${a.state} · ${plSecs(a.duration)}`,
          style: { left: `${((a.start - t0) / span) * 100}%`, width: `${Math.max(0.6, (((a.end || Date.now() / 1000) - a.start) / span) * 100)}%`, background: PL_COLORS[a.state] || '#ccc' } }))))));

    const rows = run.activities.map((a) => el('tr', {},
      el('td', { class: 'mono', style: { paddingLeft: `${16 + (a.path.split('/').length - 1) * 14}px`, fontSize: '12.5px' } }, a.path ? el('span', { class: 'muted' }, a.path) : null, a.name),
      el('td', { class: 'muted' }, (PL_TYPES[a.type] || {}).label || a.type), el('td', {}, plStateEl(a.state)),
      el('td', { class: 'muted' }, a.start ? new Date(a.start * 1000).toLocaleTimeString() : '—'), el('td', { class: 'muted' }, plSecs(a.duration)),
      el('td', { class: 'muted' }, a.attempt > 1 ? `#${a.attempt}` : ''),
      el('td', { style: { whiteSpace: 'nowrap' } },
        a.input ? btn('Input', () => plJsonDialog(`${a.name} · input`, a.input), { cls: 'sm ghost' }) : null,
        a.output ? btn('Output', () => plJsonDialog(`${a.name} · output`, a.output), { cls: 'sm ghost' }) : null,
        a.output && a.output.runPageUrl ? el('a', { class: 'btn sm ghost', href: a.output.runPageUrl }, 'Open run') : null,
        a.error ? btn(a.state === 'Succeeded' ? 'Note' : 'Error', () => plJsonDialog(`${a.name} · error`, a.error), { cls: `sm ${a.state === 'Failed' ? 'danger' : 'ghost'}` }) : null)));
    setKids(table, el('div', { class: 'panel-head' }, el('h2', {}, 'Activity runs')),
      el('div', { class: 'tbl-wrap' }, el('table', { class: 't' }, el('thead', {}, el('tr', {}, ['Activity', 'Type', 'Status', 'Start', 'Duration', 'Attempt', ''].map((h) => el('th', {}, h)))), el('tbody', {}, rows))));
  }
  draw();
  const t = setInterval(async () => { if (!active()) return; try { run = await api(`/api/pipeline-runs/${rid}`); draw(); } catch { /* ignore */ } }, 2000);
  return () => clearInterval(t);
}
