/* DataBridge Machine learning: MLflow experiments, registered models, serving endpoints, and the full MLflow UI. */
'use strict';

const ML_SNIPPET = `import mlflow
from sklearn.ensemble import RandomForestRegressor

mlflow.autolog()                       # logs params, metrics and the model
df = spark.table("sales.orders").toPandas()
X, y = df[["customer_id"]], df["amount"]
with mlflow.start_run():
    model = RandomForestRegressor(n_estimators=100).fit(X, y)
    mlflow.sklearn.log_model(model, name="model", registered_model_name="order_amount")`;

const mlState = (s) => {
  const m = { READY: ['good', 'Ready'], STARTING: ['warn', 'Starting…'], FAILED: ['bad', 'Failed'], STOPPED: ['', 'Stopped'],
    FINISHED: ['good', 'Finished'], RUNNING: ['warn', 'Running'], KILLED: ['', 'Stopped'] }[s] || ['', s];
  return el('span', { class: `chip ${m[0]}` }, m[1]);
};

async function viewMl(main, r) {
  const tab = r.params.get('tab') || 'experiments';
  const canEdit = CURRENT_USER && CURRENT_USER.role !== 'viewer';
  main.append(el('div', { class: 'page-head' }, el('div', { class: 'grow' }, el('h1', {}, 'Machine learning'),
    el('p', { class: 'muted small', style: { margin: '2px 0 0' } }, 'Track experiments, register models and serve them as REST endpoints — MLflow, built in.')),
  btn('Open MLflow', () => window.open('/mlflow/', '_blank', 'noopener'), { ic: 'ext' })));
  const tabs = [['experiments', 'Experiments'], ['models', 'Models'], ['serving', 'Serving'], ['mlflow', 'MLflow UI']];
  main.append(el('div', { class: 'tabs', role: 'tablist' }, tabs.map(([k, l]) => el('button', { type: 'button', role: 'tab', 'aria-selected': String(k === tab),
    onClick: () => (location.hash = `#/ml?tab=${k}`) }, l))));
  const pane = el('div', {}, loading('Starting MLflow…'));
  main.append(pane);
  let st;
  try { st = await api('/api/ml/status'); } catch (e) { setKids(pane, errBox(e)); return; }
  if (!st.installed) {
    setKids(pane, el('div', { class: 'empty' }, icon('flask', 32), el('h2', {}, 'MLflow is not installed'),
      el('p', {}, 'Run  pip install mlflow  on the DataBridge machine (the Docker image already has it), then restart DataBridge.')));
    return;
  }
  if (!st.running) { try { await api('/api/ml/start', { method: 'POST' }); } catch (e) { setKids(pane, errBox(e)); return; } }

  if (tab === 'mlflow') {
    setKids(pane, el('iframe', { class: 'ml-frame', src: '/mlflow/#/experiments', title: 'MLflow' }));
    return null;
  }
  if (tab === 'experiments') {
    const exp = r.params.get('exp');
    if (exp) return mlRuns(pane, exp);
    const d = await api('/api/ml/experiments');
    const list = d.experiments.filter((e) => e.name !== 'Default' || d.experiments.length === 1);
    setKids(pane, el('section', { class: 'panel', style: { marginBottom: '16px' } }, el('div', { class: 'panel-head' }, el('h2', { class: 'grow' }, `Experiments (${list.length})`)),
      list.length ? el('table', { class: 't' }, el('thead', {}, el('tr', {}, ['Experiment', 'Last run', 'Created'].map((h) => el('th', {}, h)))),
        el('tbody', {}, list.map((e) => el('tr', { class: 'clickable', onClick: () => (location.hash = `#/ml?tab=experiments&exp=${e.id}`) },
          el('td', {}, el('b', {}, e.name)), el('td', { class: 'muted' }, e.updated ? ago(e.updated * 1000) : '—'), el('td', { class: 'muted' }, fmtTime(e.created * 1000))))))
        : el('div', { class: 'empty' }, el('p', {}, 'No experiments yet. Runs you log from a notebook go to an experiment named after the notebook.'))),
    el('section', { class: 'panel al-card' }, el('h3', {}, 'Log a model from a notebook'),
      el('p', { class: 'muted small', style: { margin: 0 } }, 'MLflow is already connected in every notebook and job — no tracking URI to set.'),
      el('pre', { class: 'code' }, ML_SNIPPET)));
  } else if (tab === 'models') {
    const d = await api('/api/ml/models');
    const serve = async (m) => {
      const v = await formDialog({ title: `Serve ${m.name}`, intro: 'Starts a REST endpoint for this model inside DataBridge.', fields: [
        { name: 'name', label: 'Endpoint name', value: m.name.toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, 60) },
        { name: 'ref', label: 'Version or alias', value: Object.keys(m.aliases)[0] || (m.latest[0] || {}).version || '1' }] });
      if (!v) return;
      try { await api('/api/ml/serving', { method: 'POST', body: { ...v, model: m.name } }); toast('Endpoint starting'); location.hash = '#/ml?tab=serving'; } catch (e) { toast(e.message, 'err'); }
    };
    const alias = async (m) => {
      const v = await formDialog({ title: `Set an alias on ${m.name}`, fields: [{ name: 'alias', label: 'Alias', value: 'champion' }, { name: 'version', label: 'Version', value: (m.latest[0] || {}).version || '1' }] });
      if (!v) return;
      try { await api(`/api/ml/models/${enc(m.name)}/alias`, { method: 'POST', body: v }); toast('Alias set'); render(); } catch (e) { toast(e.message, 'err'); }
    };
    setKids(pane, el('section', { class: 'panel' }, el('div', { class: 'panel-head' }, el('h2', { class: 'grow' }, `Registered models (${d.models.length})`)),
      d.models.length ? el('table', { class: 't' }, el('thead', {}, el('tr', {}, ['Model', 'Latest version', 'Aliases', 'Updated', ''].map((h) => el('th', {}, h)))),
        el('tbody', {}, d.models.map((m) => el('tr', {}, el('td', {}, el('b', {}, m.name), m.description ? el('div', { class: 'muted small' }, m.description) : null),
          el('td', {}, m.latest.map((v) => `v${v.version}`).join(', ') || '—'),
          el('td', {}, Object.entries(m.aliases).map(([a, v]) => el('span', { class: 'chip teal', style: { marginRight: '4px' } }, `@${a} → v${v}`))),
          el('td', { class: 'muted' }, ago(m.updated * 1000)),
          el('td', { style: { textAlign: 'right', whiteSpace: 'nowrap' } },
            btn('Versions', () => window.open(`/mlflow/#/models/${enc(m.name)}`, '_blank', 'noopener'), { cls: 'sm' }),
            canEdit ? btn('Alias', () => alias(m), { cls: 'sm' }) : null, canEdit ? btn('Serve', () => serve(m), { cls: 'sm primary', ic: 'play' }) : null)))))
        : el('div', { class: 'empty' }, el('p', {}, 'No registered models yet. Use registered_model_name=… when you log a model, or register it in the MLflow UI.'))));
  } else if (tab === 'serving') {
    return mlServing(pane, canEdit);
  }
  return null;
}

async function mlRuns(pane, exp) {
  const [d, all] = await Promise.all([api(`/api/ml/experiments/${exp}/runs`), api('/api/ml/experiments')]);
  const e = all.experiments.find((x) => x.id === exp) || { name: exp };
  const metrics = [...new Set(d.runs.flatMap((r) => Object.keys(r.metrics)))].slice(0, 6);
  const params = [...new Set(d.runs.flatMap((r) => Object.keys(r.params)))].slice(0, 4);
  const fmt = (v) => (typeof v === 'number' ? (Math.abs(v) >= 1000 ? v.toLocaleString(undefined, { maximumFractionDigits: 1 }) : Number(v.toPrecision(4))) : v ?? '—');
  setKids(pane, el('div', { class: 'crumbs', style: { marginBottom: '8px' } }, el('a', { href: '#/ml?tab=experiments' }, 'Experiments'), el('span', {}, ' / ')),
    el('section', { class: 'panel' }, el('div', { class: 'panel-head' }, el('h2', { class: 'grow' }, e.name),
      btn('Compare in MLflow', () => window.open(`/mlflow/#/experiments/${exp}`, '_blank', 'noopener'), { cls: 'sm', ic: 'ext' })),
    d.runs.length ? el('div', { class: 'tbl-wrap' }, el('table', { class: 't' },
      el('thead', {}, el('tr', {}, ['Run', 'Status', 'Started', ...params.map((p) => `param: ${p}`), ...metrics].map((h) => el('th', {}, h)))),
      el('tbody', {}, d.runs.map((r) => el('tr', { class: 'clickable', onClick: () => window.open(`/mlflow/#/experiments/${exp}/runs/${r.id}`, '_blank', 'noopener') },
        el('td', {}, el('b', {}, r.name), r.user ? el('div', { class: 'muted small' }, r.user) : null), el('td', {}, mlState(r.status)),
        el('td', { class: 'muted' }, ago(r.start * 1000)), params.map((p) => el('td', { class: 'mono small' }, r.params[p] ?? '—')),
        metrics.map((m) => el('td', { class: 'mono' }, fmt(r.metrics[m]))))))))
      : el('div', { class: 'empty' }, el('p', {}, 'No runs in this experiment yet.'))));
}

async function mlServing(pane, canEdit) {
  const d = await api('/api/ml/serving');
  const act = (s, a) => async () => {
    if (a === 'delete' && !(await confirmDialog(`Delete endpoint ${s.name}?`, 'Apps calling it will get errors.'))) return;
    try { await api(`/api/ml/serving/${s.name}/${a}`, { method: 'POST', body: {} }); toast(a === 'delete' ? 'Deleted' : 'Done'); render(); } catch (e) { toast(e.message, 'err'); }
  };
  const test = (s) => openDialog((close) => {
    const input = el('textarea', { class: 'field mono', rows: 6 }, '{"inputs": [[1, 2, 3]]}');
    const out = el('pre', { class: 'code', style: { minHeight: '60px' } }, '');
    const go = async () => {
      out.textContent = 'Calling…';
      try {
        const res = await fetch(s.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: input.value });
        out.textContent = `${res.status}\n${await res.text()}`;
      } catch (e) { out.textContent = e.message; }
    };
    const curl = `curl -X POST ${location.origin}${s.url} \\\n  -H "Authorization: Bearer <your access token>" \\\n  -H "Content-Type: application/json" \\\n  -d '{"inputs": [[1, 2, 3]]}'`;
    return el('div', { class: 'dlg' }, el('h2', {}, `Test ${s.name}`), el('label', { class: 'lbl' }, 'Request body (MLflow format: inputs, dataframe_split or dataframe_records)', input),
      el('div', {}, btn('Send', go, { cls: 'primary', ic: 'play' })), out, el('h3', {}, 'From any app'), el('pre', { class: 'code' }, curl),
      el('div', { class: 'actions' }, btn('Close', () => close(null))));
  }, { wide: true });
  setKids(pane, el('section', { class: 'panel' }, el('div', { class: 'panel-head' }, el('h2', { class: 'grow' }, `Serving endpoints (${d.endpoints.length})`),
    el('span', { class: 'muted small' }, 'Serve a model from the Models tab')),
  d.endpoints.length ? el('table', { class: 't' }, el('thead', {}, el('tr', {}, ['Endpoint', 'State', 'Model', 'URL', 'Requests', ''].map((h) => el('th', {}, h)))),
    el('tbody', {}, d.endpoints.map((s) => el('tr', {}, el('td', {}, el('b', {}, s.name)),
      el('td', {}, mlState(s.status), s.error ? el('div', { class: 'error-text small', title: s.error }, 'see log') : null),
      el('td', {}, `${s.model} ${/^\d+$/.test(s.ref) ? `v${s.ref}` : `@${s.ref}`}`), el('td', { class: 'mono small' }, s.url), el('td', {}, s.requests || 0),
      el('td', { style: { textAlign: 'right', whiteSpace: 'nowrap' } },
        btn('Test', () => test(s), { cls: 'sm', ic: 'play', disabled: s.status !== 'READY' }),
        btn('', () => textDialog(`${s.name} · log`, async () => (await fetch(`/api/ml/serving/${s.name}/log`)).text()), { cls: 'ghost icon sm', ic: 'log', title: 'Log' }),
        canEdit ? (s.status === 'READY' || s.status === 'STARTING' ? btn('', act(s, 'stop'), { cls: 'ghost icon sm', ic: 'stop', title: 'Stop' }) : btn('', act(s, 'start'), { cls: 'ghost icon sm', ic: 'restart', title: 'Start' })) : null,
        canEdit ? btn('', act(s, 'delete'), { cls: 'ghost icon sm', ic: 'trash', title: 'Delete' }) : null)))))
    : el('div', { class: 'empty' }, el('p', {}, 'No endpoints. Register a model, then press Serve on the Models tab.'))));
  if (d.endpoints.some((s) => s.status === 'STARTING')) { const t = setTimeout(render, 4000); return () => clearTimeout(t); }
  return null;
}

window.EXTRA_ROUTES = Object.assign(window.EXTRA_ROUTES || {}, { ml: viewMl });
