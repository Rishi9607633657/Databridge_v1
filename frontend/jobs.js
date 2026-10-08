/* DataBridge Jobs UI — Databricks-style jobs, runs matrix, live run output. Loaded before app.js;
   uses helpers (el, api, btn, icon, stateEl, renderOutput, layoutDag, ...) defined there. */
'use strict';

const ACTIVE_RUN = new Set(['QUEUED', 'RUNNING']);
const pad2 = (n) => String(n).padStart(2, '0');
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function cronText(expr, tz) {
  if (!expr) return 'Manual';
  const suffix = tz ? ` (${tz})` : '';
  const presets = { '* * * * *': 'Every minute', '*/5 * * * *': 'Every 5 minutes', '*/15 * * * *': 'Every 15 minutes',
    '*/30 * * * *': 'Every 30 minutes', '0 * * * *': 'Every hour' };
  if (presets[expr]) return presets[expr] + suffix;
  let m = expr.match(/^(\d+) (\d+) \* \* \*$/);
  if (m) return `Daily at ${pad2(m[2])}:${pad2(m[1])}${suffix}`;
  m = expr.match(/^(\d+) (\d+) \* \* 1-5$/);
  if (m) return `Weekdays at ${pad2(m[2])}:${pad2(m[1])}${suffix}`;
  m = expr.match(/^(\d+) (\d+) \* \* ([0-6](?:,[0-6])*)$/);
  if (m) return `${m[3].split(',').map((d) => DAYS[+d]).join(', ')} at ${pad2(m[2])}:${pad2(m[1])}${suffix}`;
  m = expr.match(/^(\d+) (\d+) (\d+) \* \*$/);
  if (m) return `Monthly on day ${m[3]} at ${pad2(m[2])}:${pad2(m[1])}${suffix}`;
  return expr + suffix;
}
function secs(s) {
  if (s == null) return '—';
  s = Math.round(s);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}
const tsTime = (t) => (t ? fmtTime(t * 1000) : '—');
function parseKv(text) {
  const out = {};
  for (const line of (text || '').split('\n')) {
    const i = line.indexOf('=');
    if (i > 0) out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return out;
}
const kvText = (obj) => Object.entries(obj || {}).map(([k, v]) => `${k}=${v}`).join('\n');
function stateLabel(s) { const t = (s || 'pending').replace(/_/g, ' ').toLowerCase(); return t.charAt(0).toUpperCase() + t.slice(1); }

function runSquares(runs, size = 12) {
  const list = [...runs].reverse();
  if (!list.length) return el('span', { class: 'muted', style: { fontSize: '12px' } }, 'No runs yet');
  return el('div', { class: 'bars' }, list.map((r) => el('a', {
    href: `#/run/${r.id}`, title: `Run #${r.run_number} · ${stateLabel(r.state)} · ${tsTime(r.start)} · ${secs(r.duration)}`,
    'aria-label': `Run ${r.run_number} ${stateLabel(r.state)}`, onClick: (e) => e.stopPropagation(),
    style: { width: `${size - 3}px`, height: `${size + 8}px`, borderRadius: '2px', display: 'inline-block',
      background: STATE_COLORS[r.state] || 'var(--line-strong)' } })));
}

function jobPauseSwitch(job, after) {
  if (!job.schedule) return el('span', { class: 'muted', style: { fontSize: '13px' } }, 'Manual');
  const cb = el('input', { type: 'checkbox', checked: !job.paused, 'aria-label': `${job.name} schedule active` });
  const lbl = el('span', { class: 'muted' }, cb.checked ? 'Active' : 'Paused');
  cb.addEventListener('change', async () => {
    try { await api(`/api/jobs/${job.id}/pause`, { method: 'POST', body: { paused: !cb.checked } }); lbl.textContent = cb.checked ? 'Active' : 'Paused'; after && after(); }
    catch (e) { cb.checked = !cb.checked; toast(e.message, 'err'); }
  });
  return el('label', { class: 'switch', onClick: (e) => e.stopPropagation() }, cb, lbl);
}

async function runJob(job, withParams = false) {
  let parameters = {};
  if (withParams) {
    const v = await formDialog({ title: `Run ${job.name} with parameters`, submit: 'Run now',
      fields: [{ name: 'p', label: 'Parameters (key=value per line). Read them in notebooks with dbutils.widgets.get("key")',
        type: 'textarea', value: kvText(job.parameters), required: false }] });
    if (!v) return null;
    parameters = parseKv(v.p);
  }
  try {
    const run = await api(`/api/jobs/${job.id}/run`, { method: 'POST', body: { parameters } });
    toast(`Started run #${run.run_number} of ${job.name}`);
    return run;
  } catch (e) { toast(e.message, 'err'); return null; }
}

/* ---------- task graph (shared by editor, job page and run page) ---------- */
function taskGraph(tasks, { stateOf = () => null, onSelect = null, selected = null } = {}) {
  const graphTasks = tasks.map((t) => ({ task_id: t.task_key, downstream: tasks.filter((o) => (o.depends_on || []).includes(t.task_key)).map((o) => o.task_key) }));
  if (!graphTasks.length) return el('div', { class: 'empty' }, el('p', {}, 'No tasks yet.'));
  const L = layoutDag(graphTasks);
  const g = el('div', { class: 'graph' });
  const inner = el('div', { style: { position: 'relative', width: `${L.width}px`, height: `${L.height}px` } });
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', L.width); svg.setAttribute('height', L.height);
  for (const t of graphTasks) for (const d of t.downstream) {
    const a = L.pos[t.task_id], b = L.pos[d];
    if (!a || !b) continue;
    const x1 = a.x + L.W, y1 = a.y + L.H / 2, x2 = b.x, y2 = b.y + L.H / 2, mx = (x1 + x2) / 2;
    for (const dAttr of [`M${x1} ${y1} C${mx} ${y1}, ${mx} ${y2}, ${x2 - 6} ${y2}`, `M${x2 - 8} ${y2 - 4} L${x2} ${y2} L${x2 - 8} ${y2 + 4}`]) {
      const p = document.createElementNS(svgNS, 'path');
      p.setAttribute('d', dAttr); p.setAttribute('fill', 'none'); p.setAttribute('stroke', '#A7B0C2'); p.setAttribute('stroke-width', '1.5');
      svg.append(p);
    }
  }
  inner.append(svg);
  for (const t of tasks) {
    const p = L.pos[t.task_key];
    const st = stateOf(t.task_key);
    const color = st && st.state ? STATE_COLORS[st.state] || 'var(--line-strong)' : 'var(--line-strong)';
    const sel = selected === t.task_key;
    inner.append(el('button', { type: 'button', class: 'node', 'aria-pressed': sel ? 'true' : 'false',
      style: { left: `${p.x}px`, top: `${p.y}px`, borderColor: sel ? 'var(--lagoon)' : st && st.state ? color : null,
        boxShadow: `${sel ? '0 0 0 2px var(--lagoon-tint),' : ''} inset 0 -3px 0 ${st && st.state ? color : 'transparent'}` },
      onClick: () => onSelect && onSelect(t.task_key) },
    el('span', { class: 'tid' }, t.task_key),
    el('span', { class: 'st' }, st && st.state ? el('span', { class: 'dot', style: { background: color, marginRight: 0 } }) : null,
      st && st.state ? `${stateLabel(st.state)}${st.sub ? ' · ' + st.sub : ''}` : (t.notebook_path || '').split('/').pop().replace(/\.ipynb$/, ''))));
  }
  g.append(inner);
  return g;
}

/* ================= Workflows page: Jobs · Notebook runs · Airflow (DAGs/studio/UI) · Pipelines ================= */
async function viewWorkflows(main, r) {
  let tab = r.params.get('tab') || 'jobs';
  let sub = r.params.get('sub') || '';
  if (tab === 'dag-studio') { tab = 'airflow'; sub = 'studio'; }          // older links
  if (tab === 'airflow-ui') { tab = 'airflow'; sub = 'ui'; }
  const SUBS = {
    airflow: [['dags', 'DAGs'], ['studio', 'DAG studio'], ['ui', 'Airflow UI']],
    pipelines: [['pipelines', 'Pipelines'], ['runs', 'Monitor'], ['linked', 'Linked services']],
  };
  if (SUBS[tab] && !SUBS[tab].some(([k]) => k === sub)) sub = SUBS[tab][0][0];
  const go = (t, s2) => { location.hash = t === 'jobs' ? '#/workflows' : `#/workflows?tab=${t}${s2 ? `&sub=${s2}` : ''}`; };
  const tabs = el('div', { class: 'tabs', role: 'tablist', style: { marginTop: 0 } },
    [['jobs', 'Jobs'], ['notebook-runs', 'Notebook runs'], ['airflow', 'Airflow'], ['pipelines', 'Pipelines']].map(([k, label]) => el('button', { type: 'button', role: 'tab',
      'aria-selected': String(tab === k), onClick: () => go(k) }, label)));
  const subTabs = SUBS[tab] ? el('div', { class: 'subtabs', role: 'tablist', 'aria-label': `${tab} views` },
    SUBS[tab].map(([k, label]) => el('button', { type: 'button', role: 'tab', 'aria-selected': String(sub === k), onClick: () => go(tab, k) }, label))) : null;
  const action = tab === 'jobs' ? btn('Create job', () => (location.hash = '#/jobedit/new'), { cls: 'primary', ic: 'plus' })
    : tab === 'pipelines' && sub === 'pipelines' ? btn('New pipeline', () => plNewDialog(), { cls: 'primary', ic: 'plus' })
    : tab === 'pipelines' && sub === 'linked' ? btn('New linked service', () => plLinkedDialog(null, () => render()), { cls: 'primary', ic: 'plus' }) : null;
  main.append(el('div', { class: 'page-head', style: { marginBottom: '4px' } }, el('h1', { class: 'grow' }, 'Workflows'), action), tabs, subTabs);
  const body = el('div');
  main.append(body);
  if (tab === 'airflow') return sub === 'studio' ? dagStudioTab(body) : sub === 'ui' ? airflowUiTab(body) : airflowTab(body);
  if (tab === 'pipelines') return sub === 'runs' ? plRunsTab(body) : sub === 'linked' ? plLinkedTab(body) : plListTab(body);
  return tab === 'notebook-runs' ? notebookRunsTab(body) : jobsTab(body);
}

async function jobsTab(main) {
  const filter = el('input', { class: 'field', type: 'search', placeholder: 'Filter jobs', 'aria-label': 'Filter jobs', style: { maxWidth: '320px' } });
  const panel = el('section', { class: 'panel' }, loading());
  main.append(el('div', { class: 'row', style: { marginBottom: '14px' } }, filter), panel);
  let jobs = [];
  const draw = () => {
    const f = filter.value.trim().toLowerCase();
    const list = jobs.filter((j) => !f || j.name.toLowerCase().includes(f));
    if (!jobs.length) {
      panel.replaceChildren(el('div', { class: 'empty' }, icon('flow', 32), el('h2', {}, 'No jobs yet'),
        el('p', {}, 'A job runs one or more notebooks on a Spark cluster — on a schedule or on demand, with retries.'),
        btn('Create job', () => (location.hash = '#/jobedit/new'), { cls: 'primary' })));
      return;
    }
    const tb = el('tbody');
    for (const j of list) {
      const last = j.recent_runs[0];
      tb.append(el('tr', { class: 'clickable', onClick: () => (location.hash = `#/job/${j.id}`) },
        el('td', {}, el('div', { style: { fontWeight: 600 } }, j.name), j.description ? el('div', { class: 'muted', style: { fontSize: '12px' } }, j.description) : null),
        el('td', {}, el('div', {}, cronText(j.schedule)), j.schedule && !j.paused && j.next_run ? el('div', { class: 'muted', style: { fontSize: '12px' } }, `Next: ${fmtTime(j.next_run)}`) : null),
        el('td', { class: 'muted' }, `${j.tasks.length} task${j.tasks.length === 1 ? '' : 's'}`),
        el('td', {}, last ? stateEl(last.state) : el('span', { class: 'muted' }, '—'), last ? el('div', { class: 'muted', style: { fontSize: '12px' } }, `#${last.run_number} · ${ago(last.start)}`) : null),
        el('td', {}, runSquares(j.recent_runs)),
        el('td', {}, jobPauseSwitch(j, load)),
        el('td', { style: { textAlign: 'right', whiteSpace: 'nowrap' } },
          btn('Run now', async (e) => { e.stopPropagation(); if (await runJob(j)) load(); }, { cls: 'sm', ic: 'play' }))));
    }
    panel.replaceChildren(el('div', { class: 'tbl-wrap' }, el('table', { class: 't' },
      el('thead', {}, el('tr', {}, ['Name', 'Schedule', 'Tasks', 'Last run', 'Last 10 runs', 'Trigger', ''].map((h) => el('th', {}, h)))), tb)));
  };
  const load = async () => { try { jobs = await api('/api/jobs?runs=10'); draw(); } catch (e) { panel.replaceChildren(errBox(e)); } };
  filter.addEventListener('input', draw);
  await load();
  const t = setInterval(load, 5000);
  return () => clearInterval(t);
}

/* ================= Notebook runs (dbutils.notebook.run) ================= */
async function notebookRunsTab(main) {
  const panel = el('section', { class: 'panel' }, loading());
  main.append(el('p', { class: 'muted', style: { margin: '0 0 14px' } },
    'Runs started from notebooks with dbutils.notebook.run() — each runs in its own Spark session.'), panel);
  const load = async () => {
    let runs;
    try { runs = await api('/api/notebook-runs?limit=50'); } catch (e) { panel.replaceChildren(errBox(e)); return; }
    if (!runs.length) {
      panel.replaceChildren(el('div', { class: 'empty' }, el('h2', {}, 'No notebook runs yet'),
        el('p', {}, 'Call dbutils.notebook.run("./child", 600, {"site": "A"}) from a notebook.')));
      return;
    }
    const rows = runs.map((r) => {
      const ts = r.task ? r.task.state : null;
      const state = ts === 'TIMEDOUT' ? 'TIMEDOUT' : (r.state === 'RUNNING' && (!ts || ts === 'PENDING') ? 'PENDING' : r.state);
      return { run_id: r.id, run_number: r.run_number, path: r.path, start: r.start, end: r.end, duration: r.duration, state,
        error_code: { FAILED: 'RUN_EXECUTION_ERROR', TIMEDOUT: 'RUN_TIMEOUT', CANCELED: 'RUN_CANCELED' }[state],
        error: r.task ? r.task.error : null, parameters: r.parameters, current_cell: r.task ? r.task.current_cell : null };
    });
    const tbl = renderWorkflowsTable(rows);
    tbl.querySelector('.wf-title').textContent = 'Notebook Workflows';
    tbl.querySelector('.wf-scroll').style.maxHeight = 'none';
    panel.replaceChildren(tbl);
    panel.style.border = '0'; panel.style.background = 'transparent';
  };
  await load();
  const t = setInterval(load, 3000);
  return () => clearInterval(t);
}

/* ================= Job editor ================= */
const TZ_LIST = (() => {
  const local = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  let all = ['UTC', 'Asia/Kolkata', 'Europe/London', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Asia/Singapore', 'Australia/Sydney'];
  try { if (Intl.supportedValuesOf) all = Intl.supportedValuesOf('timeZone'); } catch { /* keep default list */ }
  return { local, all: [...new Set(['UTC', local, ...all])] };
})();

async function viewJobEdit(main, r) {
  const id = r.rest[0];
  const isNew = !id || id === 'new';
  main.append(loading());
  let job, notebooks;
  try {
    [job, notebooks] = await Promise.all([isNew ? null : api(`/api/jobs/${id}`), api('/api/jobs/notebooks')]);
  } catch (e) { main.replaceChildren(errBox(e)); return; }
  main.replaceChildren();
  const pre = r.params.get('notebook');
  job = job || {
    name: pre ? pre.split('/').pop().replace(/\.ipynb$/, '') : '', description: '', schedule: null, timezone: TZ_LIST.local,
    paused: false, max_concurrent: 1, parameters: {},
    cluster: { master: 'local[*]', driver_memory: '2g', executor_memory: '2g', executor_cores: 2, autoscale: true, min_executors: 1, max_executors: 4, spark_conf: {} },
    tasks: [{ task_key: pre ? pre.split('/').pop().replace(/\.ipynb$/, '').replace(/[^A-Za-z0-9_]/g, '_') : 'task_1', notebook_path: pre || '', depends_on: [], parameters: {}, max_retries: 1, retry_delay_sec: 30, timeout_sec: 0 }],
  };

  /* ---- header ---- */
  main.append(el('div', { class: 'page-head' },
    el('div', { class: 'grow' }, el('div', { class: 'crumbs' }, el('a', { href: '#/workflows' }, 'Workflows'), el('span', {}, '/'),
      !isNew ? el('a', { href: `#/job/${id}` }, job.name) : null),
    el('h1', { style: { marginTop: '4px' } }, isNew ? 'Create job' : `Edit ${job.name}`)),
    btn('Cancel', () => (location.hash = isNew ? '#/workflows' : `#/job/${id}`)),
    btn(isNew ? 'Create job' : 'Save changes', () => save(), { cls: 'primary', ic: 'save' })));

  const f = (label, input, hint) => el('label', { class: 'lbl' }, label, input, hint ? el('span', { style: { fontWeight: 400 } }, hint) : null);
  const num = (value, min = 0) => el('input', { class: 'field', type: 'number', min, value: value ?? '' });

  /* ---- details ---- */
  const nameIn = el('input', { class: 'field', value: job.name, placeholder: 'e.g. medallion_nightly' });
  const descIn = el('input', { class: 'field', value: job.description || '', placeholder: 'What does this job do?' });
  main.append(el('section', { class: 'panel form-panel' }, el('h2', {}, 'Details'),
    el('div', { class: 'grid2' }, f('Job name', nameIn), f('Description', descIn))));

  /* ---- tasks ---- */
  const tasksWrap = el('div', { class: 'task-cards' });
  const graphWrap = el('div', { class: 'panel', style: { marginTop: '12px' } });
  const cards = [];
  const keys = () => cards.map((c) => c.key.value.trim()).filter(Boolean);
  function refresh() {
    const ks = keys();
    for (const c of cards) {
      const me = c.key.value.trim();
      const checked = new Set([...c.deps.querySelectorAll('input:checked')].map((i) => i.value).concat(c.pendingDeps || []));
      c.pendingDeps = null;
      const others = ks.filter((k) => k !== me);
      setKids(c.deps, ...(others.length ? others.map((k) => el('label', { class: 'dep-chip' },
        el('input', { type: 'checkbox', value: k, checked: checked.has(k), onChange: refresh }), k))
        : [el('span', { class: 'muted', style: { fontSize: '12px' } }, 'No other tasks — this task runs first')]));
    }
    const model = cards.map((c) => ({ task_key: c.key.value.trim() || '(unnamed)', notebook_path: c.nb.value,
      depends_on: [...c.deps.querySelectorAll('input:checked')].map((i) => i.value) }));
    graphWrap.replaceChildren(el('div', { class: 'panel-head' }, el('h3', {}, 'Task graph')), taskGraph(model));
  }
  function addCard(t) {
    const c = {};
    c.key = el('input', { class: 'field mono', value: t.task_key, placeholder: 'task_key', onInput: refresh });
    c.nb = el('select', { class: 'field', onChange: refresh }, el('option', { value: '' }, '— choose a notebook —'),
      notebooks.map((n) => el('option', { value: n, selected: n === t.notebook_path }, n)));
    c.deps = el('div', { class: 'dep-list' });
    c.pendingDeps = t.depends_on || [];
    c.params = el('textarea', { class: 'field', rows: 3, placeholder: 'site=ALL\nrun_date=2026-09-27' }, kvText(t.parameters));
    c.retries = num(t.max_retries);
    c.delay = num(t.retry_delay_sec);
    c.timeout = num(t.timeout_sec);
    c.root = el('div', { class: 'panel task-card' },
      el('div', { class: 'row' }, el('h3', { class: 'grow' }, 'Task'),
        btn('', () => { cards.splice(cards.indexOf(c), 1); c.root.remove(); refresh(); }, { cls: 'ghost icon sm', ic: 'trash', title: 'Remove task' })),
      el('div', { class: 'grid2' }, f('Task key', c.key), f('Notebook', c.nb)),
      el('div', { class: 'lbl' }, 'Depends on', c.deps),
      el('div', { class: 'grid3' }, f('Retries on failure', c.retries), f('Retry delay (seconds)', c.delay), f('Timeout (seconds, 0 = none)', c.timeout)),
      f('Task parameters', c.params, 'key=value per line · read with dbutils.widgets.get("key")'));
    cards.push(c);
    tasksWrap.append(c.root);
  }
  job.tasks.forEach(addCard);
  main.append(el('section', { class: 'form-section' },
    el('div', { class: 'row', style: { margin: '24px 0 12px' } }, el('h2', { class: 'grow' }, 'Tasks'),
      btn('Add task', () => {
        const ks = keys();
        addCard({ task_key: `task_${cards.length + 1}`, notebook_path: '', depends_on: ks.length ? [ks[ks.length - 1]] : [], parameters: {}, max_retries: 1, retry_delay_sec: 30, timeout_sec: 0 });
        refresh();
      }, { ic: 'plus' })),
    tasksWrap, graphWrap));

  /* ---- cluster ---- */
  const cl = job.cluster || {};
  const presets = ['local[*]', 'local[4]', 'local[2]'];
  const masterSel = el('select', { class: 'field' },
    el('option', { value: 'local[*]' }, 'Local — all cores (local[*])'), el('option', { value: 'local[4]' }, 'Local — 4 cores'),
    el('option', { value: 'local[2]' }, 'Local — 2 cores'), el('option', { value: '__custom' }, 'Custom master URL (Kubernetes, standalone, YARN)'));
  const masterIn = el('input', { class: 'field mono', placeholder: 'k8s://https://<aks-api-server>:443', value: presets.includes(cl.master) ? '' : cl.master || '' });
  masterSel.value = !cl.master || presets.includes(cl.master) ? cl.master || 'local[*]' : '__custom';
  const mem = (v) => { const s = el('select', { class: 'field' }, ['1g', '2g', '4g', '8g', '16g', '32g'].map((m) => el('option', { value: m, selected: m === v }, m))); return s; };
  const drvMem = mem(cl.driver_memory || '2g');
  const exMem = mem(cl.executor_memory || '2g');
  const exCores = num(cl.executor_cores ?? 2, 1);
  const autoscale = el('input', { type: 'checkbox', checked: cl.autoscale !== false });
  const minEx = num(cl.min_executors ?? 1, 0);
  const maxEx = num(cl.max_executors ?? 4, 1);
  const fixedEx = num(cl.num_executors ?? 2, 1);
  const sparkConf = el('textarea', { class: 'field', rows: 4, placeholder: 'spark.sql.shuffle.partitions=64\nspark.kubernetes.container.image=<acr>.azurecr.io/spark:3.5' }, kvText(cl.spark_conf));
  const scaleRow = el('div', { class: 'grid3' });
  const drawScale = () => scaleRow.replaceChildren(...(autoscale.checked
    ? [f('Min executors', minEx), f('Max executors', maxEx), el('div')] : [f('Executors', fixedEx), el('div'), el('div')]));
  autoscale.addEventListener('change', drawScale);
  const customRow = el('div');
  const drawMaster = () => customRow.replaceChildren(masterSel.value === '__custom' ? f('Master URL', masterIn, 'Kubernetes client mode needs DataBridge to run inside the cluster so executors can reach the driver.') : '');
  masterSel.addEventListener('change', drawMaster);
  drawScale(); drawMaster();
  main.append(el('section', { class: 'panel form-panel', style: { marginTop: '24px' } }, el('h2', {}, 'Job cluster'),
    el('p', { class: 'muted', style: { margin: 0 } }, 'Each task gets a fresh Spark session with these settings, created from config/spark_init.py.'),
    el('div', { class: 'grid2' }, f('Cluster', masterSel), customRow),
    el('div', { class: 'grid3' }, f('Driver memory', drvMem), f('Executor memory', exMem), f('Cores per executor', exCores)),
    el('label', { class: 'switch' }, autoscale, 'Enable autoscaling (dynamic allocation)'), scaleRow,
    f('Spark config', sparkConf, 'key=value per line')));

  /* ---- schedule ---- */
  const schedOn = el('input', { type: 'checkbox', checked: !!job.schedule });
  const cronIn = el('input', { class: 'field mono', value: job.schedule || '0 2 * * *', placeholder: 'minute hour day month weekday' });
  const tzSel = el('select', { class: 'field' }, TZ_LIST.all.map((z) => el('option', { value: z, selected: z === (job.timezone || TZ_LIST.local) }, z)));
  const preview = el('div', { class: 'muted', style: { fontSize: '12.5px' } });
  const pausedIn = el('input', { type: 'checkbox', checked: !!job.paused });
  const maxConc = num(job.max_concurrent || 1, 1);
  const jobParams = el('textarea', { class: 'field', rows: 3, placeholder: 'env=prod' }, kvText(job.parameters));
  const presetBtns = [['Every 15 min', '*/15 * * * *'], ['Hourly', '0 * * * *'], ['Daily 02:00', '0 2 * * *'], ['Weekdays 06:00', '0 6 * * 1-5'], ['Monthly 1st 03:00', '0 3 1 * *']]
    .map(([label, expr]) => btn(label, () => { cronIn.value = expr; updPreview(); }, { cls: 'sm' }));
  let pt = null;
  const updPreview = () => {
    clearTimeout(pt);
    pt = setTimeout(async () => {
      if (!schedOn.checked) { preview.textContent = ''; return; }
      try {
        const res = await api(`/api/jobs/cron-preview?expr=${enc(cronIn.value.trim())}&tz=${enc(tzSel.value)}`);
        preview.textContent = `${cronText(cronIn.value.trim(), tzSel.value)} — next runs: ${res.next.slice(0, 3).map((d) => fmtTime(d)).join(' · ')}`;
        preview.style.color = '';
      } catch (e) { preview.textContent = e.message; preview.style.color = 'var(--fail)'; }
    }, 250);
  };
  const schedBody = el('div', { class: 'stack', style: { gap: '12px' } });
  const drawSched = () => { schedBody.hidden = !schedOn.checked; updPreview(); };
  cronIn.addEventListener('input', updPreview); tzSel.addEventListener('change', updPreview); schedOn.addEventListener('change', drawSched);
  schedBody.append(el('div', { class: 'row', style: { flexWrap: 'wrap', gap: '6px' } }, presetBtns),
    el('div', { class: 'grid2' }, f('Cron expression', cronIn, 'minute hour day-of-month month day-of-week'), f('Timezone', tzSel)),
    preview, el('label', { class: 'switch' }, pausedIn, 'Create schedule paused'));
  drawSched();
  main.append(el('section', { class: 'panel form-panel', style: { marginTop: '24px' } }, el('h2', {}, 'Schedule & run settings'),
    el('label', { class: 'switch' }, schedOn, 'Run on a schedule'), schedBody,
    el('div', { class: 'grid2' }, f('Max concurrent runs', maxConc), f('Job parameters (override task parameters)', jobParams, 'key=value per line'))));

  refresh();

  async function save() {
    const body = {
      name: nameIn.value.trim(), description: descIn.value.trim(),
      schedule: schedOn.checked ? cronIn.value.trim() : null, timezone: tzSel.value, paused: pausedIn.checked,
      max_concurrent: Number(maxConc.value) || 1, parameters: parseKv(jobParams.value),
      cluster: {
        master: masterSel.value === '__custom' ? masterIn.value.trim() : masterSel.value,
        driver_memory: drvMem.value, executor_memory: exMem.value, executor_cores: Number(exCores.value) || 1,
        autoscale: autoscale.checked, min_executors: Number(minEx.value) || 0, max_executors: Number(maxEx.value) || 1,
        num_executors: Number(fixedEx.value) || 1, spark_conf: parseKv(sparkConf.value),
      },
      tasks: cards.map((c) => ({ task_key: c.key.value.trim(), notebook_path: c.nb.value,
        depends_on: [...c.deps.querySelectorAll('input:checked')].map((i) => i.value), parameters: parseKv(c.params.value),
        max_retries: Number(c.retries.value) || 0, retry_delay_sec: Number(c.delay.value) || 0, timeout_sec: Number(c.timeout.value) || 0 })),
    };
    try {
      const saved = await api(isNew ? '/api/jobs' : `/api/jobs/${id}`, { method: isNew ? 'POST' : 'PUT', body });
      toast(isNew ? 'Job created' : 'Job saved');
      location.hash = `#/job/${saved.id}`;
    } catch (e) { toast(e.message, 'err'); }
  }
}

/* ================= Job page ================= */
async function viewJob(main, r) {
  const id = r.rest[0];
  let tab = r.params.get('tab') || 'runs';
  main.append(loading());
  let job;
  try { job = await api(`/api/jobs/${id}`); } catch (e) { main.replaceChildren(errBox(e)); return; }
  main.replaceChildren();
  const head = el('div', { class: 'page-head' });
  const tabBar = el('div', { class: 'tabs', role: 'tablist' });
  const pane = el('div');
  main.append(head, tabBar, pane);
  let runs = [];

  const del = async () => {
    if (!(await confirmDialog(`Delete job ${job.name}?`, 'The job and its run history are deleted. Notebooks are kept.'))) return;
    try { await api(`/api/jobs/${id}`, { method: 'DELETE' }); toast('Job deleted'); location.hash = '#/workflows'; } catch (e) { toast(e.message, 'err'); }
  };
  const c = job.cluster || {};
  head.append(el('div', { class: 'grow' }, el('div', { class: 'crumbs' }, el('a', { href: '#/workflows' }, 'Workflows'), el('span', {}, '/')),
    el('h1', { style: { marginTop: '4px' } }, job.name),
    el('div', { class: 'muted', style: { fontSize: '13px', marginTop: '4px' } },
      [cronText(job.schedule, job.schedule ? job.timezone : null), job.schedule && !job.paused && job.next_run ? `next ${fmtTime(job.next_run)}` : null,
        `cluster ${c.master || 'local[*]'}`, `${job.tasks.length} task${job.tasks.length === 1 ? '' : 's'}`].filter(Boolean).join(' · ')),
    job.description ? el('div', { style: { fontSize: '13px', marginTop: '4px' } }, job.description) : null),
  jobPauseSwitch(job),
  btn('', del, { cls: 'ghost icon', ic: 'trash', title: 'Delete job' }),
  btn('Edit', () => (location.hash = `#/jobedit/${id}`), { ic: 'edit' }),
  btn('Run with parameters', async () => { const run = await runJob(job, true); if (run) location.hash = `#/run/${run.id}`; }),
  btn('Run now', async () => { const run = await runJob(job); if (run) location.hash = `#/run/${run.id}`; }, { cls: 'primary', ic: 'play' }));

  const tabsDef = [['runs', 'Runs'], ['tasks', 'Tasks']];
  const drawTabs = () => setKids(tabBar, ...tabsDef.map(([k, label]) => el('button', { type: 'button', role: 'tab', 'aria-selected': String(tab === k),
    onClick: () => { tab = k; history.replaceState(null, '', `#/job/${id}?tab=${k}`); drawTabs(); draw(); } }, label)));

  function drawRuns() {
    if (!runs.length) {
      setKids(pane, el('section', { class: 'panel' }, el('div', { class: 'empty' }, el('p', {}, 'This job has not run yet.'),
        btn('Run now', async () => { const run = await runJob(job); if (run) location.hash = `#/run/${run.id}`; }, { cls: 'primary' }))));
      return;
    }
    const cols = [...runs].reverse();
    const matrix = el('table', { class: 't matrix' },
      el('thead', {}, el('tr', {}, el('th', {}, 'Task'), cols.map((rn) => el('th', { style: { textAlign: 'center' } },
        el('a', { href: `#/run/${rn.id}`, title: `${stateLabel(rn.state)} · ${tsTime(rn.start)}` }, `#${rn.run_number}`),
        el('div', { class: 'muted', style: { fontWeight: 400, fontSize: '11px' } }, secs(rn.duration)),
        el('div', { style: { height: '4px', borderRadius: '2px', marginTop: '4px', background: STATE_COLORS[rn.state] || 'var(--line-strong)' } }))))),
      el('tbody', {}, job.tasks.map((t) => el('tr', {}, el('td', { class: 'mono', style: { fontSize: '12.5px' } }, t.task_key),
        cols.map((rn) => {
          const ts = rn.task_states[t.task_key];
          return el('td', { style: { textAlign: 'center' } }, ts
            ? el('a', { href: `#/run/${rn.id}?task=${enc(t.task_key)}`, class: 'cell-square',
              title: `${t.task_key} · ${stateLabel(ts.state)}${ts.attempts > 1 ? ` · ${ts.attempts} attempts` : ''}`,
              style: { background: STATE_COLORS[ts.state] || 'var(--line-strong)' } }, ts.attempts > 1 ? String(ts.attempts) : '')
            : el('span', { class: 'muted' }, '·'));
        })))));
    const tb = el('tbody');
    for (const rn of runs) tb.append(el('tr', { class: 'clickable', onClick: () => (location.hash = `#/run/${rn.id}`) },
      el('td', { style: { fontWeight: 600 } }, `#${rn.run_number}`), el('td', {}, stateEl(rn.state)),
      el('td', { class: 'muted' }, tsTime(rn.start)), el('td', { class: 'muted' }, secs(rn.duration)),
      el('td', { class: 'muted' }, rn.trigger === 'schedule' ? 'Scheduled' : rn.trigger === 'manual' ? 'Manual' : rn.trigger),
      el('td', { class: 'mono muted', style: { fontSize: '11.5px', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
        Object.keys(rn.parameters || {}).length ? kvText(rn.parameters).replace(/\n/g, ', ') : '—'),
      el('td', { class: 'muted', style: { fontSize: '12px', maxWidth: '280px' } }, rn.message || '')));
    setKids(pane, 
      el('section', { class: 'panel', style: { marginBottom: '20px' } }, el('div', { class: 'panel-head' }, el('h2', { class: 'grow' }, 'Last 10 runs'),
        el('span', { class: 'muted', style: { fontSize: '12px' } }, 'Each square is a task run — click to open its output')),
      el('div', { class: 'tbl-wrap' }, matrix)),
      el('section', { class: 'panel' }, el('div', { class: 'tbl-wrap' }, el('table', { class: 't' },
        el('thead', {}, el('tr', {}, ['Run', 'Status', 'Started', 'Duration', 'Trigger', 'Parameters', 'Message'].map((h) => el('th', {}, h)))), tb))));
  }
  function drawTasks() {
    const tb = el('tbody', {}, job.tasks.map((t) => el('tr', {},
      el('td', { class: 'mono' }, t.task_key), el('td', {}, el('a', { href: `#/notebook?path=${enc(t.notebook_path)}` }, t.notebook_path)),
      el('td', { class: 'muted' }, t.depends_on.join(', ') || '—'), el('td', { class: 'muted' }, `${t.max_retries} × every ${t.retry_delay_sec}s`),
      el('td', { class: 'muted' }, t.timeout_sec ? secs(t.timeout_sec) : 'none'))));
    setKids(pane, el('section', { class: 'panel', style: { marginBottom: '20px' } }, el('div', { class: 'panel-head' }, el('h2', {}, 'Task graph')), taskGraph(job.tasks)),
      el('section', { class: 'panel' }, el('table', { class: 't' }, el('thead', {}, el('tr', {}, ['Task', 'Notebook', 'Depends on', 'Retries', 'Timeout'].map((h) => el('th', {}, h)))), tb)));
  }
  const draw = () => (tab === 'tasks' ? drawTasks() : drawRuns());
  const load = async () => { try { runs = await api(`/api/jobs/${id}/runs?limit=10`); if (tab === 'runs') drawRuns(); } catch (e) { setKids(pane, errBox(e)); } };
  drawTabs();
  pane.append(loading());
  await load();
  if (tab === 'tasks') drawTasks();
  const t = setInterval(() => { if (tab === 'runs') load(); }, 4000);
  return () => clearInterval(t);
}

/* ================= Run page (live) ================= */
function cellStatusBadge(c) {
  const map = { running: ['Running', 'var(--run)'], success: ['Succeeded', 'var(--ok)'], failed: ['Failed', 'var(--fail)'],
    not_run: ['Not run', 'var(--skip)'], skipped: ['Empty', 'var(--skip)'], canceled: ['Canceled', '#6B6F76'], pending: ['Pending', 'var(--wait)'] };
  const [label, color] = map[c.status] || ['', 'var(--line-strong)'];
  return el('span', { class: 'state', style: { fontSize: '12px' } },
    c.status === 'running' ? el('span', { class: 'spinner', style: { width: '12px', height: '12px' } }) : el('span', { class: 'dot', style: { background: color } }),
    label, c.duration != null && c.status !== 'running' ? el('span', { class: 'muted' }, `· ${secs(c.duration)}`) : null);
}
function cellDur(s) {
  if (s == null) return '';
  return s < 60 ? `${s.toFixed(3)}s` : secs(s);
}
function cellIcon(status) {
  if (status === 'running') return el('span', { class: 'spinner', style: { width: '13px', height: '13px' } });
  const map = { success: ['ok', '<path d="M5 12.5l4.5 4.5L19 7.5"/>'], failed: ['fail', '<path d="M6 6l12 12M18 6L6 18"/>'],
    canceled: ['cancel', '<path d="M6 12h12"/>'] };
  const m = map[status];
  if (!m) return el('span', { class: 'dot', style: { background: 'var(--line-strong)' } });
  const i = el('span', { class: `wf-ic wf-${m[0]}`, 'aria-hidden': 'true' });
  i.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${m[1]}</svg>`;
  return i;
}
function renderRunCells(cells, { hideCode = false } = {}) {
  const wrap = el('div', { class: `run-cells${hideCode ? ' hide-code' : ''}` });
  let n = 0;
  cells.forEach((c, i) => {
    if (c.cell_type === 'markdown') {
      wrap.append(el('div', { class: 'run-cell md-cell' }, el('div', { class: 'md', html: DOMPurify.sanitize(marked.parse(c.source || '')) })));
      return;
    }
    n += 1;
    const label = { running: 'Running', pending: 'Pending', not_run: 'Not run', skipped: 'Empty', canceled: 'Canceled', failed: 'Failed' }[c.status];
    wrap.append(el('div', { class: `run-cell st-${c.status}`, id: `cell-${i}` },
      el('div', { class: 'run-cell-head' },
        el('span', { class: 'rc-left' }, cellIcon(c.status), c.status === 'running' ? 'running…' : cellDur(c.duration)),
        el('span', { class: 'rc-num' }, String(n)),
        el('span', { class: 'rc-right muted', style: { fontSize: '12px' } }, label && c.status !== 'running' ? label : '')),
      (() => {
        const info = c.status === 'failed' ? edErrorLine({ outputs: c.outputs, source: c.source }) : null;
        if (!info) return el('pre', { class: 'run-src mono' }, c.source);
        return el('pre', { class: 'run-src mono' }, c.source.split('\n').map((ln, li) => el('div', { class: li === info.line ? 'src-err-line' : '' }, ln || ' ',
          li === info.line ? el('div', { class: 'src-err-msg' }, `▲ ${info.ename}: ${String(info.evalue).split('\n')[0]}`) : null)));
      })(),
      c.outputs && c.outputs.length ? el('div', { class: 'outputs run-out' }, c.outputs.map((o) => renderOutput(o))) : null));
  });
  return wrap;
}

async function exportRunHtml(title, cellsEl) {
  const clone = cellsEl.cloneNode(true);
  const srcCanvases = cellsEl.querySelectorAll('canvas');
  clone.querySelectorAll('canvas').forEach((cv, i) => {
    try { const img = document.createElement('img'); img.src = srcCanvases[i].toDataURL('image/png'); img.style.maxWidth = '100%'; cv.replaceWith(img); } catch { /* ignore */ }
  });
  let css = '';
  try { css = await (await fetch('/static/styles.css')).text(); } catch { /* ignore */ }
  const esc = (t) => t.replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]));
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${css}
body{background:#F5F7FB;padding:24px;font-family:"IBM Plex Sans",system-ui,sans-serif}</style></head>
<body><h1 style="font-family:Montserrat,sans-serif">${esc(title)}</h1><p style="color:#56607A">Exported from DataBridge on ${new Date().toLocaleString()}</p>${clone.outerHTML}</body></html>`;
  download(`${title.replace(/[^\w.-]+/g, '_')}.html`, html, 'text/html');
}

async function viewRun(main, r) {
  const runId = r.rest[0];
  let selTask = r.params.get('task');
  let selAttemptId = null;
  let run = null, detail = null, detailKey = '', tab = 'output', followLog = true, hideCode = false;
  main.append(loading());
  try { run = await api(`/api/runs/${runId}`); } catch (e) { main.replaceChildren(errBox(e)); return; }
  main.replaceChildren();
  const head = el('div', { class: 'page-head' });
  const graphPanel = el('section', { class: 'panel', style: { marginBottom: '20px' } });
  const taskPanel = el('section', { class: 'panel' });
  main.append(head, graphPanel, taskPanel);
  const isAdhoc = () => run.job_id === '__notebook_runs__';

  function pickDefaultTask() {
    if (selTask && run.tasks.some((t) => t.task_key === selTask)) return;
    const pri = ['RUNNING', 'FAILED', 'TIMEDOUT', 'WAITING_FOR_RETRY', 'PENDING'];
    const found = pri.map((s) => run.tasks.find((t) => t.latest.state === s)).find(Boolean);
    selTask = (found || run.tasks[0] || {}).task_key || null;
  }
  const job = () => run.job || { name: 'Deleted job', tasks: [] };

  function drawHead() {
    const active = ACTIVE_RUN.has(run.state);
    const adhoc = run.job_id === '__notebook_runs__';
    const nbName = adhoc ? run.job.name.split('/').pop().replace(/\.ipynb$/, '') : '';
    setKids(head, el('div', { class: 'grow' },
      adhoc ? el('div', { class: 'crumbs' }, el('a', { href: '#/workflows?tab=notebook-runs' }, 'Runs'), el('span', {}, '›'))
        : el('div', { class: 'crumbs' }, el('a', { href: '#/workflows' }, 'Workflows'), el('span', {}, '/'),
          run.job ? el('a', { href: `#/job/${run.job_id}` }, run.job.name) : 'Deleted job', el('span', {}, '/')),
      el('div', { class: 'row', style: { marginTop: '4px' } },
        adhoc ? el('span', { class: 'run-title-ic' }, icon('flow', 22)) : null,
        el('h1', {}, adhoc ? `${nbName} · run #${run.run_number}` : `Run #${run.run_number}`), stateEl(run.state)),
      adhoc ? el('div', { class: 'mono', style: { fontSize: '13px', marginTop: '4px' } },
        el('a', { href: `#/notebook?path=${enc(run.job.name)}` }, run.job.name), run.parent ? el('span', { class: 'muted' }, `  ← called from ${run.parent}`) : null) : null,
      el('div', { class: 'muted', style: { fontSize: '13px', marginTop: '4px' } },
        `${run.trigger === 'schedule' ? 'Scheduled' : run.trigger === 'notebook_run' ? 'dbutils.notebook.run' : 'Manual'} · started ${tsTime(run.start)} · ${active ? 'running for' : 'took'} ${secs(run.duration)} · cluster ${(run.cluster || {}).master || 'local[*]'}`),
      Object.keys(run.parameters || {}).length ? el('div', { class: 'row', style: { gap: '6px', marginTop: '8px', flexWrap: 'wrap' } },
        Object.entries(run.parameters).map(([k, v]) => el('span', { class: 'chip mono', style: { fontWeight: 500 } }, `${k}=${v}`))) : null,
      run.message ? el('div', { class: run.state === 'FAILED' ? 'error-box' : 'muted', style: { marginTop: '10px', fontSize: '13px' } }, run.message) : null),
    active ? btn('Cancel run', async () => {
      if (!(await confirmDialog('Cancel this run?', 'Running cells are interrupted and remaining tasks are skipped.', 'Cancel run'))) return;
      try { await api(`/api/runs/${runId}/cancel`, { method: 'POST' }); toast('Cancel requested'); poll(); } catch (e) { toast(e.message, 'err'); }
    }, { cls: 'danger', ic: 'stop' }) : null,
    !active && ['FAILED', 'CANCELED'].includes(run.state) ? btn('Repair run', async () => {
      try { await api(`/api/runs/${runId}/repair`, { method: 'POST' }); toast('Re-running failed and skipped tasks'); selAttemptId = null; poll(); } catch (e) { toast(e.message, 'err'); }
    }, { ic: 'restart', title: 'Re-run only the tasks that did not succeed' }) : null,
    run.job && !active ? btn('Run again', async () => {
      try {
        const nr = adhoc
          ? await api('/api/notebook-runs', { method: 'POST', body: { path: run.job.name, arguments: run.parameters, timeout_seconds: run.job.tasks[0].timeout_sec, parent: run.parent } })
          : await runJob(run.job);
        if (nr) location.hash = `#/run/${nr.id}`;
      } catch (e) { toast(e.message, 'err'); }
    }, { cls: 'primary', ic: 'play' }) : null);
  }

  function drawGraph() {
    graphPanel.hidden = isAdhoc();
    if (isAdhoc()) return;
    const byKey = Object.fromEntries(run.tasks.map((t) => [t.task_key, t]));
    const jt = job().tasks.length ? job().tasks : run.tasks.map((t) => ({ task_key: t.task_key, depends_on: [] }));
    setKids(graphPanel, el('div', { class: 'panel-head' }, el('h2', { class: 'grow' }, 'Tasks'),
      el('span', { class: 'muted', style: { fontSize: '12px' } }, 'Select a task to see its notebook output and log')),
    taskGraph(jt, {
      selected: selTask,
      stateOf: (k) => {
        const t = byKey[k];
        if (!t) return ACTIVE_RUN.has(run.state) ? { state: 'PENDING' } : null;
        const a = t.latest;
        return { state: a.state, sub: `${secs(a.duration)}${t.attempts.length > 1 ? ` · try ${a.attempt}` : ''}` };
      },
      onSelect: (k) => { selTask = k; selAttemptId = null; detailKey = ''; history.replaceState(null, '', `#/run/${runId}?task=${enc(k)}`); drawGraph(); loadDetail(); },
    }));
  }

  async function loadDetail() {
    const t = run.tasks.find((x) => x.task_key === selTask);
    if (!t) {
      setKids(taskPanel, el('div', { class: 'empty' }, el('p', {}, selTask ? `Task ${selTask} has not started yet.` : 'No tasks have started yet.')));
      return;
    }
    const attempt = t.attempts.find((a) => a.id === selAttemptId) || t.latest;
    try { detail = await api(`/api/runs/${runId}/tasks/${attempt.id}`); } catch (e) { setKids(taskPanel, errBox(e)); return; }
    const key = JSON.stringify([detail.id, detail.state, detail.cells, detail.log.length, detail.error, tab, t.attempts.length, hideCode]);
    if (key === detailKey) return;
    detailKey = key;
    drawDetail(t, attempt);
  }

  function drawDetail(t, attempt) {
    const d = detail;
    const running = d.state === 'RUNNING';
    const runningCell = d.cells.findIndex((c) => c.status === 'running');
    const failedCell = d.cells.findIndex((c) => c.status === 'failed');
    const attemptBtns = t.attempts.length > 1 ? el('div', { class: 'row', style: { gap: '6px', flexWrap: 'wrap' } }, t.attempts.map((a) =>
      el('button', { type: 'button', class: `btn sm ${a.id === attempt.id ? 'primary' : ''}`,
        onClick: () => { selAttemptId = a.id; detailKey = ''; loadDetail(); } },
      el('span', { class: 'dot', style: { background: STATE_COLORS[a.state] || 'var(--line-strong)' } }), `Attempt ${a.attempt} · ${stateLabel(a.state)}`))) : null;
    const tabsEl = el('div', { class: 'tabs', role: 'tablist', style: { margin: '0 18px' } }, [['output', 'Output'], ['log', 'Log']].map(([k, label]) =>
      el('button', { type: 'button', role: 'tab', 'aria-selected': String(tab === k), onClick: () => { tab = k; detailKey = ''; loadDetail(); } }, label)));
    let body;
    if (tab === 'log') {
      const pre = el('pre', { class: 'log run-log' }, d.log || '(no log yet)');
      pre.addEventListener('scroll', () => { followLog = pre.scrollTop + pre.clientHeight >= pre.scrollHeight - 30; });
      body = el('div', { style: { padding: '0 18px 18px' } }, pre);
      requestAnimationFrame(() => { if (followLog) pre.scrollTop = pre.scrollHeight; });
    } else if (!d.cells.length) {
      body = el('div', { class: 'empty' }, el('p', {}, d.state === 'WAITING_FOR_RETRY' ? 'Waiting to retry…' : d.state === 'PENDING' ? 'Starting…' : d.error || 'No output.'));
    } else {
      const cellsEl = renderRunCells(d.cells, { hideCode });
      body = el('div', {},
        el('div', { class: 'run-out-bar' }, el('h3', {}, 'Output'),
          btn(hideCode ? 'Show code' : 'Hide code', () => { hideCode = !hideCode; cellsEl.classList.toggle('hide-code', hideCode); detailKey = ''; loadDetail(); }, { cls: 'sm', ic: 'edit' }),
          btn('Export as HTML', () => exportRunHtml(`${t.task_key} - run ${run.run_number}`, cellsEl), { cls: 'sm', ic: 'download' }),
          btn('Clone into new notebook', async () => {
            try {
              const res = await api(`/api/runs/${runId}/tasks/${d.id}/clone`, { method: 'POST' });
              toast(`Created ${res.path}`);
              location.hash = `#/notebook?path=${enc(res.path)}`;
            } catch (e) { toast(e.message, 'err'); }
          }, { cls: 'sm', ic: 'nb' })),
        el('div', { style: { padding: '0 18px 18px' } }, cellsEl));
    }
    setKids(taskPanel, 
      el('div', { class: 'panel-head', style: { flexWrap: 'wrap' } },
        el('div', { class: 'grow' }, el('div', { class: 'row' }, el('h2', { class: 'mono' }, t.task_key), stateEl(d.state)),
          el('div', { class: 'muted', style: { fontSize: '12.5px', marginTop: '4px' } },
            el('a', { href: `#/notebook?path=${enc(d.notebook_path)}` }, d.notebook_path), ` · attempt ${d.attempt} · ${secs(d.duration)}`,
            d.start ? ` · started ${tsTime(d.start)}` : '')),
        runningCell >= 0 ? btn(`Go to running cell (Cmd ${runningCell + 1})`, () => { tab = 'output'; document.getElementById(`cell-${runningCell}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, { cls: 'sm' }) : null,
        !running && failedCell >= 0 ? btn(`Go to failed cell (Cmd ${failedCell + 1})`, () => document.getElementById(`cell-${failedCell}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), { cls: 'sm danger' }) : null,
        btn('Download log', () => download(`${t.task_key}_attempt${d.attempt}.log`, d.log || '', 'text/plain'), { cls: 'sm', ic: 'download' })),
      attemptBtns ? el('div', { style: { padding: '12px 18px 0' } }, attemptBtns) : null,
      d.error ? el('div', { style: { padding: '12px 18px 0' } }, el('div', { class: 'error-box' }, d.error)) : null,
      d.result ? el('div', { style: { padding: '12px 18px 0' } }, el('div', { class: 'chip teal mono' }, `Notebook exit value: ${d.result}`)) : null,
      tabsEl, body);
  }

  async function poll() {
    try { run = await api(`/api/runs/${runId}`); } catch { return; }
    pickDefaultTask();
    drawHead(); drawGraph(); await loadDetail();
  }
  pickDefaultTask();
  drawHead(); drawGraph(); await loadDetail();
  const t = setInterval(() => {
    const t0 = run.tasks.find((x) => x.task_key === selTask);
    const liveTask = t0 && ['RUNNING', 'PENDING', 'WAITING_FOR_RETRY'].includes((t0.latest || {}).state);
    if (ACTIVE_RUN.has(run.state) || liveTask) poll();
  }, 1500);
  return () => clearInterval(t);
}
