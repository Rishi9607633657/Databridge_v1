/* DataBridge — single-page UI. No build step. */
'use strict';

/* ================= core helpers ================= */
const $ = (s, r = document) => r.querySelector(s);
/* replaceChildren that flattens arrays and skips null/false (like el()) */
function setKids(node, ...kids) { node.replaceChildren(...kids.flat(Infinity).filter((k) => k != null && k !== false)); }

function el(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'html') e.innerHTML = v; // only used with trusted/sanitized strings
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false) continue;
    e.append(k instanceof Node ? k : String(k));
  }
  return e;
}

const ICONS = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  folder: '<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  db: '<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  flow: '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M9 6h4a2 2 0 0 1 2 2v7"/>',
  cpu: '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
  term: '<path d="M4 17l6-5-6-5M12 19h8"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  nb: '<path d="M6 3h9l4 4v14H6zM14 3v5h5"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/>',
  play: '<path d="M7 4l13 8-13 8z" fill="currentColor" stroke="none"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor" stroke="none"/>',
  restart: '<path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4"/>',
  save: '<path d="M5 3h11l3 3v15H5zM8 3v6h8V3M8 21v-7h8v7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  up: '<path d="M6 15l6-6 6 6"/>', down: '<path d="M6 9l6 6 6-6"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v4h-4"/>',
  back: '<path d="M15 6l-6 6 6 6"/>', caret: '<path d="M9 6l6 6-6 6"/>',
  log: '<path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
  eraser: '<path d="M7 21h10M5.5 14.5l7-7 5 5-7 7H8z"/><path d="M12.5 7.5l3-3 5 5-3 3"/>',
  branch: '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 7v10M18 10c0 4-6 3-12 7"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  logs: '<path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/>',
  wind: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  pipe: '<rect x="2" y="9" width="6" height="6" rx="1"/><rect x="16" y="3" width="6" height="6" rx="1"/><rect x="16" y="15" width="6" height="6" rx="1"/><path d="M8 12h4M12 12V6h4M12 12v6h4"/>',
  runAbove: '<path d="M12 19V7M7 12l5-5 5 5M5 4h14"/>', runBelow: '<path d="M12 5v12M7 12l5 5 5-5M5 20h14"/>',
  eyeOff: '<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 22 12a14 14 0 0 1-3.2 4M6.6 6.6A14 14 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 4.4-1"/>',
  fold: '<path d="M4 6h16M4 12h10M4 18h6"/>',
  format: '<path d="M4 7h10M4 12h16M4 17h7M17 15l2 2 3-4"/>', list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  vars: '<path d="M8 4c-2 0-3 1-3 3v2c0 1-1 2-2 3 1 1 2 2 2 3v2c0 2 1 3 3 3M16 4c2 0 3 1 3 3v2c0 1 1 2 2 3-1 1-2 2-2 3v2c0 2-1 3-3 3"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2"/>', key: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
};
function icon(name, size = 18) {
  const s = el('span', { 'aria-hidden': 'true', style: { display: 'inline-flex' } });
  s.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;
  return s;
}
function btn(label, onClick, { cls = '', ic = null, title = null, disabled = false } = {}) {
  return el('button', { type: 'button', class: `btn ${cls}`, onClick, title, 'aria-label': !label ? title : null, disabled },
    ic ? icon(ic, 16) : null, label || null);
}

async function api(path, opts = {}) {
  const init = { method: opts.method || 'GET', headers: {} };
  if (opts.body !== undefined) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(opts.body);
  }
  const r = await fetch(path, init);
  if (r.status === 401 && !path.startsWith('/api/auth/') && typeof AUTH_INFO !== 'undefined' && AUTH_INFO.auth_enabled) {
    location.reload();                      // session expired -> sign-in screen
    throw new Error('Sign in required');
  }
  const ct = r.headers.get('content-type') || '';
  const data = ct.includes('json') ? await r.json() : await r.text();
  if (!r.ok) {
    const err = new Error((data && data.detail) || data || r.statusText);
    err.data = data; err.status = r.status;
    throw err;
  }
  return data;
}
const enc = encodeURIComponent;

function toast(msg, kind = '') {
  const t = el('div', { class: `toast ${kind}`, role: kind === 'err' ? 'alert' : 'status' }, msg);
  $('#toasts').append(t);
  setTimeout(() => t.remove(), kind === 'err' ? 7000 : 3500);
}
function errBox(e) {
  const tb = e.data && e.data.traceback;
  return el('div', { class: 'error-box' }, String(e.message || e),
    tb && tb.length ? el('details', {}, el('summary', {}, 'Traceback'), el('pre', { class: 'mono', style: { fontSize: '11.5px' } }, tb.join('\n'))) : null);
}
function loading(text = 'Loading…') { return el('div', { class: 'loading' }, el('span', { class: 'spinner' }), text); }

function ago(ts) {
  if (!ts) return '—';
  const t = typeof ts === 'number' ? ts * 1000 : Date.parse(ts);
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
function dur(a, b) {
  if (!a) return '—';
  const s = Math.max(0, Math.round(((b ? Date.parse(b) : Date.now()) - Date.parse(a)) / 1000));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}
function fmtTime(ts) { return ts ? new Date(ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'; }

const STATE_COLORS = {
  success: 'var(--ok)', failed: 'var(--fail)', running: 'var(--run)', queued: 'var(--wait)', scheduled: 'var(--wait)',
  up_for_retry: 'var(--retry)', up_for_reschedule: 'var(--retry)', upstream_failed: '#D08B4A', skipped: 'var(--skip)',
  deferred: 'var(--retry)', removed: 'var(--skip)', restarting: 'var(--retry)',
  SUCCESS: 'var(--ok)', QUEUED: 'var(--wait)', CANCELED: '#6B6F76', TIMEDOUT: 'var(--fail)', UPSTREAM_FAILED: '#D08B4A',
  WAITING_FOR_RETRY: 'var(--retry)', SKIPPED: 'var(--skip)',
  RUNNING: 'var(--run)', COMPLETED: 'var(--ok)', FAILED: 'var(--fail)', SUBMITTED: 'var(--wait)', PENDING: 'var(--wait)',
  SUBMISSION_FAILED: 'var(--fail)', FAILING: 'var(--fail)', SUCCEEDING: 'var(--ok)', PENDING_RERUN: 'var(--wait)',
  idle: 'var(--ok)', busy: 'var(--run)', starting: 'var(--wait)', error: 'var(--fail)',
};
function stateEl(s) {
  const label = s ? String(s).replace(/_/g, ' ') : 'no status';
  return el('span', { class: 'state' }, el('span', { class: 'dot', style: { background: STATE_COLORS[s] || 'var(--line-strong)' } }),
    label.charAt(0).toUpperCase() + label.slice(1).toLowerCase());
}

/* ================= dialogs ================= */
function openDialog(build, { wide = false } = {}) {
  return new Promise((resolve) => {
    const d = el('dialog', { class: wide ? 'wide' : '' });
    const close = (v) => { d.close(); d.remove(); resolve(v); };
    d.append(build(close));
    d.addEventListener('cancel', (e) => { e.preventDefault(); close(null); });
    document.body.append(d);
    d.showModal();
  });
}
function formDialog({ title, fields, submit = 'Save', danger = false, text = null, intro = null }) {
  text = text || intro;
  return openDialog((close) => {
    const inputs = {};
    const f = el('form', { method: 'dialog' }, el('h2', {}, title), text ? el('p', { class: 'muted', style: { margin: 0 } }, text) : null);
    for (const fd of fields || []) {
      const inp = fd.type === 'textarea'
        ? el('textarea', { class: 'field', rows: fd.rows || 6, name: fd.name, placeholder: fd.placeholder || '' }, fd.value || '')
        : fd.type === 'select'
          ? el('select', { class: 'field', name: fd.name }, (fd.options || []).map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return el('option', { value: v, selected: v === fd.value }, l); }))
          : fd.type === 'checkbox'
            ? el('input', { type: 'checkbox', name: fd.name, checked: !!fd.value })
            : el('input', { class: 'field', name: fd.name, type: fd.type === 'password' ? 'password' : 'text', value: fd.value || '', placeholder: fd.placeholder || '', required: fd.required !== false, autocomplete: fd.type === 'password' ? 'new-password' : 'off' });
      inputs[fd.name] = inp;
      f.append(fd.type === 'checkbox' ? el('label', { class: 'switch' }, inp, fd.label) : el('label', { class: 'lbl' }, fd.label, inp));
    }
    f.append(el('div', { class: 'actions' },
      el('button', { type: 'button', class: 'btn', onClick: () => close(null) }, 'Cancel'),
      el('button', { type: 'submit', class: `btn ${danger ? 'danger' : 'primary'}` }, submit)));
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const out = {};
      for (const [k, v] of Object.entries(inputs)) out[k] = v.type === 'checkbox' ? v.checked : v.value.trim();
      close(out);
    });
    setTimeout(() => { const first = Object.values(inputs)[0]; if (first) { first.focus(); first.select?.(); } }, 0);
    return f;
  });
}
const confirmDialog = (title, text, submit = 'Delete') => formDialog({ title, text, fields: [], submit, danger: true });
function textDialog(title, loader) {
  return openDialog((close) => {
    const pre = el('pre', { class: 'log' }, 'Loading…');
    const reload = async () => {
      pre.textContent = 'Loading…';
      try { pre.textContent = (await loader()) || '(empty)'; pre.scrollTop = pre.scrollHeight; } catch (e) { pre.textContent = String(e.message); }
    };
    reload();
    return el('div', { class: 'dlg' }, el('div', { class: 'row' }, el('h2', { class: 'grow' }, title),
      btn('Refresh', reload, { cls: 'sm', ic: 'refresh' }), btn('Close', () => close(null), { cls: 'sm' })), pre);
  }, { wide: true });
}

/* ================= shared actions ================= */
async function newNotebook(parent = '') {
  const v = await formDialog({ title: 'New notebook', submit: 'Create notebook',
    fields: [{ name: 'name', label: 'Name', placeholder: 'e.g. toast_bronze_ingest' }] });
  if (!v || !v.name) return;
  try {
    const nb = await api('/api/workspace', { method: 'POST', body: { parent, name: v.name, kind: 'notebook' } });
    location.hash = `#/notebook?path=${enc(nb.path)}`;
  } catch (e) { toast(e.message, 'err'); }
}
async function newFolder(parent = '', after) {
  const v = await formDialog({ title: 'New folder', submit: 'Create folder', fields: [{ name: 'name', label: 'Name' }] });
  if (!v || !v.name) return;
  try { await api('/api/workspace', { method: 'POST', body: { parent, name: v.name, kind: 'folder' } }); after && after(); }
  catch (e) { toast(e.message, 'err'); }
}
async function newSchema(after) {
  const v = await formDialog({ title: 'Create schema', submit: 'Create schema', fields: [
    { name: 'name', label: 'Name', placeholder: 'e.g. silver' },
    { name: 'comment', label: 'Comment (optional)', required: false },
    { name: 'location', label: 'Location (optional)', placeholder: 'abfss://container@account.dfs.core.windows.net/silver', required: false }] });
  if (!v || !v.name) return;
  toast('Creating schema… (starts Spark if needed)');
  try {
    await api('/api/catalog/databases', { method: 'POST', body: { name: v.name, comment: v.comment || null, location: v.location || null } });
    toast(`Schema ${v.name} created`); after && after();
  } catch (e) { toast(e.message, 'err'); }
}
function openInSql(query) {
  sessionStorage.setItem('stratum.sqlPrefill', query);
  location.hash = '#/sql';
}

/* ================= Home ================= */
async function viewHome(main) {
  const qi = (ic, bg, fg) => el('span', { class: 'qi', style: { background: bg, color: fg } }, icon(ic));
  main.append(
    el('div', { class: 'hero' },
      el('img', { class: 'hero-logo', src: '/static/logo-full.png', alt: 'DataBridge' }),
      el('p', {}, 'Build, schedule and query your lakehouse — bronze to gold.')),
    el('div', { class: 'quick' },
      el('button', { type: 'button', onClick: () => newNotebook('') }, qi('nb', '#E7EFFF', '#0A5CFF'), el('b', {}, 'New notebook'), el('span', { class: 'd' }, 'PySpark and SQL in a Jupyter kernel')),
      el('button', { type: 'button', onClick: () => (location.hash = '#/jobedit/new') }, qi('flow', '#F6EDDA', '#8A5A10'), el('b', {}, 'Create a job'), el('span', { class: 'd' }, 'Schedule notebooks with retries')),
      el('button', { type: 'button', onClick: () => (location.hash = '#/catalog') }, qi('db', '#E3F7FC', '#0891B2'), el('b', {}, 'Browse catalog'), el('span', { class: 'd' }, 'Schemas, tables, history, DDL')),
      el('button', { type: 'button', onClick: () => (location.hash = '#/sql') }, qi('term', '#F1E6DD', '#8A4B26'), el('b', {}, 'New query'), el('span', { class: 'd' }, 'Explore tables with Spark SQL'))));

  const recentPanel = el('section', { class: 'panel' }, el('div', { class: 'panel-head' }, el('h2', { class: 'grow' }, 'Recent notebooks'),
    el('a', { href: '#/workspace', style: { fontSize: '13px' } }, 'Open workspace')), loading());
  const connPanel = el('section', { class: 'panel' }, el('div', { class: 'panel-head' }, el('h2', {}, 'Connections')));
  main.append(el('div', { class: 'two' }, recentPanel, connPanel));
  admHomeBanner(main);

  const s = STATUS || {};
  const connRow = (name, ok, detail) => el('div', { class: 'row', style: { padding: '12px 18px', borderBottom: '1px solid var(--line-soft)' } },
    el('span', { class: 'dot', style: { background: ok ? 'var(--ok)' : 'var(--line-strong)' } }),
    el('div', { class: 'grow' }, el('div', { style: { fontWeight: 500 } }, name), el('div', { class: 'muted', style: { fontSize: '12px' } }, detail)));
  connPanel.append(
    connRow('Notebooks', true, `Jupyter kernels · Spark auto-start ${s.spark_auto_init ? 'on' : 'off'}`),
    connRow('Catalog', s.catalog_backend === 'spark' || s.metastore, s.catalog_backend === 'metastore' ? 'Hive Metastore (PostgreSQL)' : 'Spark SHOW / DESCRIBE'),
    connRow('Workflows', s.airflow, s.airflow ? `Airflow REST API ${s.airflow_api}` : 'Set AIRFLOW_URL in .env'),
    connRow('Compute', s.kubernetes, s.kubernetes ? 'Spark Operator on Kubernetes' : 'Set K8S_ENABLED=true in .env'));

  try {
    const items = await api('/api/workspace/recent');
    recentPanel.lastChild.remove();
    if (!items.length) {
      recentPanel.append(el('div', { class: 'empty' }, el('p', {}, 'No notebooks yet.'), btn('Create a notebook', () => newNotebook(''), { cls: 'primary' })));
    } else {
      const tb = el('tbody');
      for (const it of items) tb.append(el('tr', { class: 'clickable', onClick: () => (location.hash = `#/notebook?path=${enc(it.path)}`) },
        el('td', {}, el('span', { class: 'row' }, icon('nb', 16), el('span', { style: { fontWeight: 500 } }, it.name.replace(/\.ipynb$/, '')))),
        el('td', { class: 'mono muted', style: { fontSize: '12px' } }, '/' + it.path.split('/').slice(0, -1).join('/')),
        el('td', { class: 'muted' }, ago(it.modified))));
      recentPanel.append(el('table', { class: 't' }, el('thead', {}, el('tr', {}, el('th', {}, 'Name'), el('th', {}, 'Folder'), el('th', {}, 'Modified'))), tb));
    }
  } catch (e) { recentPanel.lastChild.replaceWith(errBox(e)); }
}

/* ================= Workspace ================= */
async function viewWorkspace(main, r) {
  const path = r.params.get('path') || '';
  const reload = () => render();
  const parts = path ? path.split('/') : [];
  const label = (p) => (p === 'Repos' ? 'Git folders' : p);
  const crumbs = el('div', { class: 'crumbs' }, el('a', { href: '#/workspace' }, 'Workspace'),
    parts.map((p, i) => [el('span', {}, '/'), el('a', { href: `#/workspace?path=${enc(parts.slice(0, i + 1).join('/'))}` }, label(p))]));
  const head = el('div', { class: 'page-head ws-head' });
  const banner = el('div');
  const panel = el('section', { class: 'panel' }, loading());
  main.append(head, banner, panel);
  let data;
  try { data = await api(`/api/workspace?path=${enc(path)}`); } catch (e) { panel.replaceChildren(errBox(e)); return; }
  const me = data.me;
  const inRepos = parts[0] === 'Repos';
  const atReposRoot = inRepos && parts.length <= 2;
  const canCreate = path && !(parts.length === 1 && ['Users', 'Repos'].includes(parts[0])) && !(inRepos && parts.length === 2);
  head.append(...[el('div', { class: 'grow' }, crumbs, el('h1', { style: { marginTop: '4px' } }, parts.length ? label(parts.at(-1)) : 'Workspace')),
    btn('Git credentials', () => gitCredentialsDialog(), { ic: 'user', cls: 'ghost' }),
    atReposRoot ? btn('Add Git folder', () => gitCloneDialog((res) => { location.hash = `#/workspace?path=${enc(res.path)}`; }), { cls: 'primary', ic: 'branch' }) : null,
    canCreate ? btn('New folder', () => newFolder(path, reload), { ic: 'folder' }) : null,
    canCreate ? btn('New notebook', () => newNotebook(path), { cls: atReposRoot ? '' : 'primary', ic: 'plus' }) : null].filter(Boolean));
  if (data.repo) {
    const br = btn(`⎇ ${data.repo.branch}`, () => gitDialog(data.repo.root, (R) => { br.lastChild.textContent = `⎇ ${R.branch}`; reload(); }), { cls: 'git-chip', title: 'Branches, changes, commit & push' });
    banner.append(el('div', { class: 'ws-repo' }, icon('branch', 18), el('span', {}, 'Git folder ', el('b', {}, data.repo.name)), br,
      el('span', { class: 'muted small' }, 'Notebooks are committed without outputs.'), el('span', { class: 'grow' }),
      btn('Git…', () => gitDialog(data.repo.root, () => reload()), { cls: 'sm' })));
  }
  const rowFor = (it) => {
    const open = () => {
      if (it.type === 'dir') location.hash = `#/workspace?path=${enc(it.path)}`;
      else if (it.type === 'notebook') location.hash = `#/notebook?path=${enc(it.path)}`;
    };
    const fixed = !!it.special || (parts.length === 1 && ['Users', 'Repos'].includes(parts[0]));
    const rename = async (e) => {
      e.stopPropagation();
      const v = await formDialog({ title: 'Rename', submit: 'Rename', fields: [{ name: 'name', label: 'New name', value: it.name }] });
      if (!v || !v.name) return;
      try { await api('/api/workspace/rename', { method: 'POST', body: { path: it.path, name: v.name } }); reload(); } catch (err) { toast(err.message, 'err'); }
    };
    const del = async (e) => {
      e.stopPropagation();
      if (!(await confirmDialog(`Delete ${it.name}?`, it.git ? 'The Git folder and its local commits that are not pushed will be deleted.' : it.type === 'dir' ? 'The folder and everything inside it will be deleted.' : 'This cannot be undone.'))) return;
      try { await api(`/api/workspace?path=${enc(it.path)}`, { method: 'DELETE' }); reload(); } catch (err) { toast(err.message, 'err'); }
    };
    const name = parts.length === 1 && parts[0] === 'Users' && it.name === me ? `${it.name} (you)` : parts.length === 1 && parts[0] === 'Repos' && it.name === me ? `${it.name} (you)` : it.name;
    return el('tr', { class: it.type === 'file' ? '' : 'clickable', onClick: open },
      el('td', {}, el('span', { class: 'row' }, icon(it.git ? 'branch' : it.type === 'dir' ? 'folder' : it.type === 'notebook' ? 'nb' : 'log', 16),
        el('span', { style: { fontWeight: 500 } }, name), it.git ? el('span', { class: 'git-mini', title: 'Git folder — current branch' }, `⎇ ${it.git.branch}`) : null)),
      el('td', { class: 'muted' }, it.git ? 'Git folder' : it.type === 'dir' ? 'Folder' : it.type === 'notebook' ? 'Notebook' : 'File'),
      el('td', { class: 'muted' }, ago(it.modified)),
      el('td', { style: { textAlign: 'right', whiteSpace: 'nowrap' } },
        it.git ? btn('', (e) => { e.stopPropagation(); gitDialog(it.path, () => reload()); }, { cls: 'ghost icon sm', ic: 'branch', title: 'Git: branches, changes, commit' }) : null,
        fixed ? null : btn('', rename, { cls: 'ghost icon sm', ic: 'edit', title: `Rename ${it.name}` }),
        fixed ? null : btn('', del, { cls: 'ghost icon sm', ic: 'trash', title: `Delete ${it.name}` })));
  };
  const table = (items) => el('table', { class: 't' }, el('thead', {}, el('tr', {}, el('th', {}, 'Name'), el('th', {}, 'Type'), el('th', {}, 'Modified'), el('th', {}))),
    el('tbody', {}, path ? el('tr', { class: 'clickable', onClick: () => (location.hash = `#/workspace?path=${enc(parts.slice(0, -1).join('/'))}`) },
      el('td', { colspan: 4 }, el('span', { class: 'row muted' }, icon('back', 16), 'Up one level'))) : null, items.map(rowFor)));
  if (!path) {
    const special = data.items.filter((i) => i.special);
    const other = data.items.filter((i) => !i.special);
    panel.replaceWith(el('div', { class: 'ws-root' },
      el('div', { class: 'ws-tiles' }, special.map((it) => el('a', { class: 'ws-tile', href: `#/workspace?path=${enc(it.name === 'Shared' ? 'Shared' : `${it.name}/${me}`)}` },
        el('span', { class: 'ws-tile-ic' }, icon(WS_SPECIAL[it.name].ic, 22)), el('b', {}, it.name === 'Repos' ? 'Git folders' : it.name === 'Users' ? `Users / ${me}` : it.name),
        el('span', { class: 'muted' }, WS_SPECIAL[it.name].text)))),
      other.length ? el('section', { class: 'panel' }, el('div', { class: 'panel-head' }, el('h3', {}, 'Other items')), table(other)) : null));
    return;
  }
  panel.replaceChildren(data.items.length || path ? table(data.items) : null);
  if (!data.items.length) {
    panel.append(el('div', { class: 'empty' }, atReposRoot
      ? [el('h2', {}, 'No Git folders yet'), el('p', {}, 'Clone a GitHub, Azure DevOps, GitLab or Bitbucket repo to work on branches and commit from DataBridge.'),
        el('div', { class: 'row', style: { gap: '8px', justifyContent: 'center' } }, btn('Add Git folder', () => gitCloneDialog((res) => { location.hash = `#/workspace?path=${enc(res.path)}`; }), { cls: 'primary', ic: 'branch' }), btn('Git credentials', () => gitCredentialsDialog()))]
      : [el('h2', {}, 'This folder is empty'), el('p', {}, 'Create a notebook to start writing PySpark.'), canCreate ? btn('New notebook', () => newNotebook(path), { cls: 'primary' }) : null]));
  }
}

/* ================= Notebook ================= */
const srcText = (s) => (Array.isArray(s) ? s.join('') : s || '');
const newId = () => Math.random().toString(16).slice(2, 10);
const fixCR = (t) => t.split('\n').map((l) => (l.includes('\r') ? l.slice(l.lastIndexOf('\r') + 1) : l)).join('\n');

function renderOutput(o, ctx = {}) {
  if (o.output_type === 'stream') return el('pre', { class: o.name === 'stderr' ? 'stderr' : '' }, o.text);
  if (o.output_type === 'error' && o.ename === 'NotebookExit') return el('div', { class: 'chip teal', style: { alignSelf: 'flex-start' } }, `Notebook exited: ${o.evalue || '(no value)'}`);
  if (o.output_type === 'error') {
    const tb = o.traceback && o.traceback.length ? o.traceback.join('\n') : '';
    const line = ctx.errorLine != null ? ctx.errorLine : null;
    return el('div', { class: 'err-block' },
      el('div', { class: 'err-head' }, el('span', { class: 'err-name' }, o.ename || 'Error'),
        el('span', { class: 'err-msg' }, String(o.evalue || '').split('\n')[0]),
        line != null && ctx.onErrorLine ? el('button', { type: 'button', class: 'err-line-btn', onClick: () => ctx.onErrorLine(line) }, `Go to line ${line + 1}`) : null,
        ctx.onDora ? el('button', { type: 'button', class: 'err-dora-btn', onClick: () => ctx.onDora() }, doraIcon(), 'Fix with Dora') : null),
      tb ? el('pre', { class: 'err' }, tb) : null);
  }
  const d = o.data || {};
  if (d[DB_SPARK_MIME]) return renderSparkJobs(d[DB_SPARK_MIME], o.metadata || {});
  if (d[DB_TABLE_MIME]) return renderTableOutput(d[DB_TABLE_MIME], o.metadata || (o.metadata = {}), ctx.onChange);
  if (d[DB_RUN_MIME]) return renderRunCard(d[DB_RUN_MIME]);
  const g = (k) => srcText(d[k]);
  if (d['text/html']) return el('div', { class: 'html-out', html: DOMPurify.sanitize(g('text/html')) });
  if (d['image/png']) return el('img', { src: 'data:image/png;base64,' + g('image/png').replace(/\s/g, ''), alt: 'Cell output' });
  if (d['image/jpeg']) return el('img', { src: 'data:image/jpeg;base64,' + g('image/jpeg').replace(/\s/g, ''), alt: 'Cell output' });
  if (d['image/svg+xml']) return el('div', { html: DOMPurify.sanitize(g('image/svg+xml'), { USE_PROFILES: { svg: true } }) });
  if (d['text/markdown']) return el('div', { class: 'md', html: DOMPurify.sanitize(marked.parse(g('text/markdown'))) });
  if (d['application/json']) return el('pre', {}, JSON.stringify(d['application/json'], null, 2));
  if (d['text/plain']) return el('pre', {}, g('text/plain'));
  return el('pre', { class: 'muted' }, '[output type not supported]');
}

async function viewNotebook(main, r) {
  const path = r.params.get('path');
  if (!path) { location.hash = '#/workspace'; return; }
  main.append(loading('Opening notebook…'));
  const doc = await api(`/api/notebook?path=${enc(path)}`);
  main.replaceChildren();
  const nb = doc.content;
  const S = { cells: [], active: null, dirty: false, kernel: null, ws: null, pending: new Map(), closed: false, saving: false, timers: [],
    reqs: new Map(), reqId: 0, lastD: 0 };
  const nbApi = {
    send: (msg) => { if (S.ws && S.ws.readyState === WebSocket.OPEN) S.ws.send(JSON.stringify(msg)); },
    request: (action, payload) => new Promise((resolve) => {
      if (!S.ws || S.ws.readyState !== WebSocket.OPEN) { resolve(null); return; }
      const req = ++S.reqId;
      S.reqs.set(req, resolve);
      S.ws.send(JSON.stringify({ action, req, ...payload }));
      setTimeout(() => { if (S.reqs.has(req)) { S.reqs.delete(req); resolve(null); } }, 15000);
    }),
    cells: () => S.cells,
    variables: () => S.vars || [],
    scrollTo: (c) => { if (c.root.classList.contains('code-hidden')) toggleCode(c); setActive(c); c.root.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
    runAll: () => runAll(),
  };
  nbApi.editMd = (c) => editMd(c);
  nbApi.path = path;
  nbApi.activeCell = () => S.active;
  const cellError = (c) => {
    const e = (c.outputs || []).find((o) => o.output_type === 'error' && o.ename !== 'NotebookExit');
    return e ? `${e.ename}: ${e.evalue}\n${(e.traceback || []).join('\n').split('\n').slice(-30).join('\n')}` : null;
  };
  nbApi.context = () => ({ path, active: S.active ? S.cells.indexOf(S.active) : null, variables: S.vars || [],
    cells: S.cells.map((c) => ({ type: c.type, source: c.cm.getValue(), error: cellError(c) })) });
  nbApi.insertBelow = (src) => {
    const n = addCell('code', S.active || S.cells.at(-1), false);
    n.cm.setValue(src); markDirty(); n.root.scrollIntoView({ block: 'center', behavior: 'smooth' });
    return n;
  };
  nbApi.replaceActive = (src) => {
    if (!S.active || S.active.type !== 'code') return false;
    S.active.cm.setValue(src); markDirty(); return true;
  };
  const dora = createDoraPanel(nbApi);
  nbApi.dora = dora;
  const widgetsBar = nbWidgetsBar(nbApi);
  const findBar = edFindBar(nbApi);
  let lintTimer = null;
  const scheduleLint = () => { clearTimeout(lintTimer); lintTimer = setTimeout(() => edLintNotebook(S.cells, (S.vars || []).map((v) => v.name)), 700); };
  const side = nbSidePanel(nbApi);
  const hinter = nbMakeHinter(nbApi);
  let tocTimer = null;

  /* ---- header ---- */
  const parts = path.split('/');
  const kdot = el('span', { class: 'dot', style: { background: 'var(--wait)' } });
  const ktext = el('span', {}, 'Starting kernel…');
  const kbadge = el('span', { class: 'kbadge', role: 'status' }, kdot, ktext);
  const saveState = el('span', { class: 'muted', style: { fontSize: '12px' } }, 'Saved');
  const setK = (text, state, title) => { ktext.textContent = text; kdot.style.background = STATE_COLORS[state] || 'var(--wait)'; kbadge.title = title || ''; };
  const nbTitle = el('div', { class: 'nb-titlebox' },
    el('div', { class: 'nb-path' }, el('a', { href: '#/workspace' }, 'Workspace'),
      parts.slice(0, -1).map((p, i) => [el('span', {}, ' / '), el('a', { href: `#/workspace?path=${enc(parts.slice(0, i + 1).join('/'))}` }, p === 'Repos' ? 'Git folders' : p)])),
    el('div', { class: 'nb-title-row' }, el('h1', { title: path }, parts.at(-1).replace(/\.ipynb$/, '')), el('span', { class: 'nb-lang' }, 'Python · PySpark')));

  /* one compact sticky header (like Databricks): title on the left, every action on the right */
  const bar = el('div', { class: 'nb-bar nb-head' }, ...[nbTitle,
    doc.git && doc.git.root ? (() => { const b = btn(`⎇ ${doc.git.branch}`, () => gitDialog(doc.git.root, (R) => { b.lastChild.textContent = `⎇ ${R.branch}`; }), { cls: 'git-chip sm', title: `Git folder ${doc.git.name}: branches, changes, commit & push` }); return b; })() : null,
    saveState,
    el('span', { class: 'grow' }),
    btn('Run all', () => runAll(), { cls: 'primary sm', ic: 'play', title: 'Run all cells' }),
    el('span', { class: 'nb-grp' },
      btn('', () => interrupt(), { cls: 'ghost icon sm', ic: 'stop', title: 'Interrupt (stop the running cell)' }),
      btn('', () => restart(), { cls: 'ghost icon sm', ic: 'restart', title: 'Restart kernel' }),
      btn('', () => { S.cells.forEach((c) => { c.outputs = []; c.count = null; updateCount(c); renderOutputs(c); }); markDirty(); }, { cls: 'ghost icon sm', ic: 'eraser', title: 'Clear all outputs' })),
    kbadge,
    btn('Schedule', () => (location.hash = `#/jobedit/new?notebook=${enc(path)}`), { cls: 'sm', ic: 'flow', title: 'Create a job that runs this notebook' }),
    el('button', { type: 'button', class: 'btn sm dora-btn', title: 'Dora — AI assistant', onClick: () => side.show('dora') }, doraIcon(), 'Dora'),
    el('span', { class: 'nb-grp' },
      btn('', () => side.show('toc'), { cls: 'ghost icon sm', ic: 'list', title: 'Table of contents' }),
      btn('', () => side.show('vars'), { cls: 'ghost icon sm', ic: 'vars', title: 'Variable explorer' }),
      btn('', () => nbHistoryDialog(path, toNb, async () => { S.dirty = false; toast('Version restored'); render(); }), { cls: 'ghost icon sm', ic: 'history', title: 'Version history' }),
      btn('', () => nbShortcutsDialog(), { cls: 'ghost icon sm', ic: 'key', title: 'Keyboard shortcuts (?)' })),
    btn('', () => save(true), { cls: 'icon sm', ic: 'save', title: 'Save a version (Ctrl+S)' })].filter(Boolean));
  const cellsEl = el('div', { class: 'cells' });
  const addBar = el('div', { class: 'add-cell' },
    btn('Code', () => addCell('code', S.cells.at(-1)), { cls: 'sm', ic: 'plus' }),
    btn('SQL', () => { const nc = addCell('code', S.cells.at(-1)); nc.cm.setValue('%sql\n'); nc.cm.setCursor(1, 0); }, { cls: 'sm', ic: 'plus' }),
    btn('Markdown', () => addCell('markdown', S.cells.at(-1)), { cls: 'sm', ic: 'plus' }));
  main.append(bar, el('div', { class: 'nb-layout' }, el('div', { class: 'nb-main' }, findBar.el, widgetsBar.el, cellsEl), side.el));

  /* ---- cells ---- */
  function markDirty() {
    S.dirty = true; saveState.textContent = 'Unsaved changes';
    clearTimeout(tocTimer); tocTimer = setTimeout(() => side.refreshToc(), 600);
  }
  function applyFold(c) {
    const j = (c.meta && c.meta.jupyter) || {};
    c.root.classList.toggle('code-hidden', !!j.source_hidden);
    c.root.classList.toggle('out-hidden', !!j.outputs_hidden);
    if (c.codeSummary) c.codeSummary.textContent = (c.cm.getValue().split('\n').find((l) => l.trim()) || '(empty cell)').slice(0, 120) + '  …';
    if (c.outSummary) c.outSummary.textContent = `${c.outputs.length} output${c.outputs.length === 1 ? '' : 's'} hidden — click to show`;
  }
  function markMagic(c) {
    if (c.magicLine != null) { c.cm.removeLineClass(c.magicLine, 'text', 'cm-magic-line'); c.magicLine = null; }
    if (c.type === 'code' && /^%\w+/.test(c.cm.getLine(0) || '')) { c.cm.addLineClass(0, 'text', 'cm-magic-line'); c.magicLine = 0; }
  }
  function toggleCode(c) { c.meta = c.meta || {}; c.meta.jupyter = { ...(c.meta.jupyter || {}), source_hidden: !(c.meta.jupyter || {}).source_hidden }; applyFold(c); markDirty(); if (!c.meta.jupyter.source_hidden) c.cm.refresh(); }
  function toggleOut(c) { c.meta = c.meta || {}; c.meta.jupyter = { ...(c.meta.jupyter || {}), outputs_hidden: !(c.meta.jupyter || {}).outputs_hidden }; applyFold(c); markDirty(); }
  function updateCount(c) {
    c.countEl.textContent = c.type !== 'code' ? '' : c.status === 'queued' || c.status === 'running' ? '[*]' : c.count ? `[${c.count}]` : '[ ]';
  }
  function outCtx(c) {
    const info = edErrorLine(c);
    return { onChange: markDirty, errorLine: info ? info.line : null, onErrorLine: (l) => goLine(c, l),
      onDora: () => { setActive(c); if (side.tab !== 'dora') side.show('dora'); dora.ask('fix', 'Fix this error'); } };
  }
  function goLine(c, line) {
    if (c.root.classList.contains('code-hidden')) toggleCode(c);
    setActive(c); c.cm.focus(); c.cm.setCursor(line, 0);
    c.root.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  function renderOutputs(c) {
    const ctx = outCtx(c);
    c.outEl.replaceChildren(...c.outputs.map((o) => renderOutput(o, ctx)));
    if (c.cm) edShowErrorLine(c);
  }
  function addOutput(c, o) {
    if (o.output_type === 'clear_output') {
      if (o.wait) c.clearPending = true; else { c.outputs = []; renderOutputs(c); }
      return;
    }
    if (o.output_type === 'update_display_data') {  // live-updating output (run cards, progress)
      const idx = c.outputs.findIndex((x) => (x.metadata || {}).databridge_display_id === o.display_id);
      if (idx >= 0) {
        c.outputs[idx] = { ...c.outputs[idx], data: o.data, metadata: { ...(o.metadata || {}), databridge_display_id: o.display_id } };
        const node = c.outEl.children[idx];
        if (node) node.replaceWith(renderOutput(c.outputs[idx], { onChange: markDirty })); else renderOutputs(c);
      }
      return;
    }
    if (c.clearPending) { c.outputs = []; c.clearPending = false; }
    const last = c.outputs.at(-1);
    if (o.output_type === 'stream' && last && last.output_type === 'stream' && last.name === o.name) {
      last.text = fixCR(last.text + o.text);
      c.outEl.lastChild.textContent = last.text;
      return;
    }
    if (o.output_type === 'stream') o.text = fixCR(o.text);
    c.outputs.push(o);
    c.outEl.append(renderOutput(o, outCtx(c)));
    if (o.output_type === 'error') edShowErrorLine(c);
  }
  function renderMd(c) {
    const src = c.cm.getValue();
    c.mdEl.hidden = false;
    c.mdEl.innerHTML = src.trim() ? DOMPurify.sanitize(marked.parse(src)) : '<p class="md-empty">Empty markdown cell — double-click to edit</p>';
    c.root.classList.add('md-rendered');
  }
  function editMd(c) {
    c.root.classList.remove('md-rendered');
    c.mdEl.hidden = true;
    c.cm.refresh(); c.cm.focus();
  }
  function cellMode(c) {
    if (c.type !== 'code') return 'markdown';
    const first = (c.cm.getValue().split('\n').find((l) => l.trim()) || '').trim();
    if (/^%sql\b/.test(first)) return 'text/x-sparksql';
    if (/^%md\b/.test(first)) return 'markdown';
    if (/^%(sh|fs|run)\b/.test(first)) return 'text/plain';
    return 'python';
  }
  function setType(c, t) {
    c.type = t;
    c.cm.setOption('mode', cellMode(c));
    c.cm.setOption('lineWrapping', t === 'markdown');
    if (t === 'markdown') { c.outputs = []; c.count = null; renderOutputs(c); }
    else { c.mdEl.hidden = true; c.root.classList.remove('md-rendered'); }
    updateCount(c); markDirty();
  }
  function setActive(c) {
    if (S.active === c) return;
    S.active && S.active.root.classList.remove('active');
    S.active = c; c.root.classList.add('active');
    if (side.tab === 'dora') dora.drawQuick();
  }
  function relayout() {
    cellsEl.replaceChildren(...S.cells.map((c) => c.root), addBar);
    S.cells.forEach((c) => c.cm.refresh());
  }
  function makeCell(type, source = '', outputs = [], count = null, id = newId(), meta = {}) {
    const c = { id, type, outputs: outputs.map((o) => ({ ...o })), count, status: 'idle', meta };
    c.root = el('div', { class: 'cell' });
    c.countEl = el('span', { class: 'cell-count' });
    c.runBtn = el('button', { type: 'button', class: 'run-btn', 'aria-label': 'Run cell', title: 'Run cell (Shift+Enter)', onClick: () => runCell(c) }, icon('play', 13));
    c.typeSel = el('select', { 'aria-label': 'Cell type', onChange: () => setType(c, c.typeSel.value) },
      el('option', { value: 'code' }, 'Code'), el('option', { value: 'markdown' }, 'Markdown'));
    c.typeSel.value = type;
    const move = (dir) => {
      const i = S.cells.indexOf(c), j = i + dir;
      if (j < 0 || j >= S.cells.length) return;
      [S.cells[i], S.cells[j]] = [S.cells[j], S.cells[i]];
      relayout(); markDirty();
    };
    const remove = () => {
      const i = S.cells.indexOf(c);
      S.cells.splice(i, 1);
      if (!S.cells.length) S.cells.push(makeCell('code'));
      relayout(); setActive(S.cells[Math.min(i, S.cells.length - 1)]); markDirty();
    };
    c.move = move; c.remove = remove;
    const tools = el('div', { class: 'cell-tools' }, c.typeSel, el('span', { class: 'grow' }),
      btn('', () => runRange(0, S.cells.indexOf(c)), { cls: 'ghost icon sm', ic: 'runAbove', title: 'Run all cells above' }),
      btn('', () => runRange(S.cells.indexOf(c), S.cells.length), { cls: 'ghost icon sm', ic: 'runBelow', title: 'Run this cell and all below' }),
      btn('', () => edFormatCell(c), { cls: 'ghost icon sm', ic: 'format', title: 'Format cell (Shift+Alt+F)' }),
      btn('', () => toggleCode(c), { cls: 'ghost icon sm', ic: 'eyeOff', title: 'Collapse / expand code (H)' }),
      btn('', () => toggleOut(c), { cls: 'ghost icon sm', ic: 'fold', title: 'Collapse / expand output (O)' }),
      btn('', () => move(-1), { cls: 'ghost icon sm', ic: 'up', title: 'Move cell up' }),
      btn('', () => move(1), { cls: 'ghost icon sm', ic: 'down', title: 'Move cell down' }),
      btn('', () => addCell('code', c), { cls: 'ghost icon sm', ic: 'plus', title: 'Insert code cell below' }),
      btn('', remove, { cls: 'ghost icon sm', ic: 'trash', title: 'Delete cell' }));
    c.editorEl = el('div', { class: 'cell-editor' });
    c.mdEl = el('div', { class: 'md', hidden: true, onDblclick: () => editMd(c) });
    c.outEl = el('div', { class: 'outputs' });
    c.timeEl = el('div', { class: 'cell-time' });
    c.codeSummary = el('button', { type: 'button', class: 'code-summary mono', onClick: () => toggleCode(c) });
    c.outSummary = el('button', { type: 'button', class: 'out-summary', onClick: () => toggleOut(c) });
    c.root.append(el('div', { class: 'cell-gutter' }, c.runBtn, c.countEl), el('div', { class: 'cell-main' }, tools, c.codeSummary, c.editorEl, c.mdEl, c.outSummary, c.outEl, c.timeEl));
    c.root.addEventListener('mousedown', () => setActive(c));
    c.cm = CodeMirror(c.editorEl, {
      value: source, mode: type === 'code' ? 'python' : 'markdown', matchBrackets: true, autoCloseBrackets: true,
      indentUnit: 4, viewportMargin: Infinity, lineWrapping: type === 'markdown', keyMap: 'sublime', theme: 'databridge',
      extraKeys: {
        'Shift-Tab': (cm) => edDocsCommand(cm, nbApi),
        'Shift-Alt-F': () => edFormatCell(c),
        'Ctrl-F': (cm) => findBar.open(false, cm.getSelection()), 'Cmd-F': (cm) => findBar.open(false, cm.getSelection()),
        'Ctrl-H': (cm) => findBar.open(true, cm.getSelection()),
        'Alt-Up': 'swapLineUp', 'Alt-Down': 'swapLineDown', 'Shift-Alt-Down': 'duplicateLine', 'Shift-Alt-Up': 'duplicateLine',
        'Ctrl-/': 'toggleCommentIndented', 'Cmd-/': 'toggleCommentIndented',
        'Shift-Enter': () => runAndAdvance(c), 'Ctrl-Enter': () => runCell(c), 'Cmd-Enter': () => runCell(c),
        'Ctrl-S': () => save(true), 'Cmd-S': () => save(true),
        Tab: (cm) => {
          if (cm.somethingSelected()) return cm.indentSelection('add');
          if (edTryExpandSnippet(cm)) return undefined;
          const cur = cm.getCursor();
          const before = cm.getLine(cur.line).slice(0, cur.ch);
          if (/[\w.)\]'"]$/.test(before)) return cm.showHint({ hint: hinter, completeSingle: true, closeOnUnfocus: true });
          return cm.replaceSelection('    ', 'end');
        },
        'Ctrl-Space': (cm) => cm.showHint({ hint: hinter, completeSingle: false }),
        Esc: (cm) => { if (cm.state.completionActive) { cm.state.completionActive.close(); return; } cm.getInputField().blur(); c.root.focus(); },
        'Shift-Tab': (cm) => cm.indentSelection('subtract'),
      },
    });
    c.cm.on('change', () => {
      markDirty();
      const m = cellMode(c);
      if (c.cm.getOption('mode') !== m) c.cm.setOption('mode', m);
    });
    c.cm.setOption('mode', cellMode(c));
    if (type === 'code') { nbAutoSuggest(c.cm, hinter); edSetupDocs(c.cm, nbApi); }
    c.cm.on('change', () => { if (c.errLine != null) edClearErrorLine(c); if (c.type === 'code') scheduleLint(); findBar.refresh(); markMagic(c); });
    c.cm.on('focus', () => setActive(c));
    c.root.tabIndex = -1;
    updateCount(c); renderOutputs(c);
    if (type === 'markdown') renderMd(c);
    applyFold(c);
    markMagic(c); edRenderTime(c);
    return c;
  }
  function addCell(type, after, focus = true) {
    const c = makeCell(type);
    const i = after ? S.cells.indexOf(after) + 1 : S.cells.length;
    S.cells.splice(i, 0, c);
    relayout(); setActive(c); markDirty();
    if (type === 'markdown') editMd(c);
    if (focus) c.cm.focus();
    return c;
  }

  /* ---- execution ---- */
  function runCell(c) {
    if (c.type === 'markdown') { renderMd(c); return Promise.resolve('ok'); }
    const code = c.cm.getValue();
    c.outputs = []; c.clearPending = false; renderOutputs(c);
    if (!code.trim()) { c.count = null; updateCount(c); return Promise.resolve('ok'); }
    if (!S.ws || S.ws.readyState !== WebSocket.OPEN) { toast('The kernel is not connected yet — wait for it to be ready.', 'err'); return Promise.resolve('error'); }
    c.status = 'queued'; updateCount(c); markDirty();
    return new Promise((res) => {
      S.pending.set(c.id, res);
      S.ws.send(JSON.stringify({ action: 'execute', cell_id: c.id, code }));
    });
  }
  function runAndAdvance(c) {
    runCell(c);
    const i = S.cells.indexOf(c);
    const next = S.cells[i + 1] || addCell('code', c, false);
    setActive(next);
    if (next.type === 'code' || !next.root.classList.contains('md-rendered')) next.cm.focus();
    next.root.scrollIntoView({ block: 'nearest' });
  }
  function runAll() { runRange(0, S.cells.length); }
  function runRange(from, to) {
    if (!S.ws || S.ws.readyState !== WebSocket.OPEN) { toast('The kernel is not connected yet — wait for it to be ready.', 'err'); return; }
    const items = [];
    for (const c of S.cells.slice(from, to)) {
      if (c.type === 'markdown') { renderMd(c); continue; }
      const code = c.cm.getValue();
      if (!code.trim()) continue;
      c.outputs = []; c.clearPending = false; renderOutputs(c);
      c.status = 'queued'; updateCount(c);
      items.push({ cell_id: c.id, code });
    }
    if (!items.length) return;
    markDirty();
    S.ws.send(JSON.stringify({ action: 'execute_many', cells: items }));
    toast(`Running ${items.length} cell${items.length === 1 ? '' : 's'} — they keep running if you leave this page`);
  }
  function onMsg(ev) {
    const m = JSON.parse(ev.data);
    if (m.type === 'state') { S.vars = m.variables || []; widgetsBar.update(m.widgets || []); side.setVariables(S.vars); scheduleLint(); return; }
    if ((m.type === 'complete' || m.type === 'preview' || m.type === 'inspect') && m.req) {
      const res = S.reqs.get(m.req);
      if (res) { S.reqs.delete(m.req); res(m.data); }
      return;
    }
    if (m.type === 'snapshot') {
      // Re-attach: show cells that ran or are still running on the server while we were away
      for (const [cid, st] of Object.entries(m.cells || {})) {
        const c = S.cells.find((x) => x.id === cid);
        if (!c || c.type !== 'code') continue;
        c.outputs = (st.outputs || []).map((o) => (o.output_type === 'stream' ? { ...o, text: fixCR(o.text) } : { ...o }));
        if (st.execution_count) c.count = st.execution_count;
        c.status = st.status === 'running' || st.status === 'queued' ? st.status : 'idle';
        c.started = st.started;
        if (st.duration != null) { c.meta = c.meta || {}; c.meta.databridge = { ...(c.meta.databridge || {}), duration: st.duration, finished: st.finished, status: st.result }; }
        c.root.classList.toggle('running', st.status === 'running');
        updateCount(c); renderOutputs(c); edRenderTime(c);
      }
      return;
    }
    const c = S.cells.find((x) => x.id === m.cell_id);
    if (m.type === 'queued' && c) {
      if (c.status !== 'queued') { c.outputs = []; c.clearPending = false; renderOutputs(c); }
      c.status = 'queued'; updateCount(c); edRenderTime(c);
    } else if (m.type === 'running' && c) { c.status = 'running'; c.started = m.started || Date.now() / 1000; c.root.classList.add('running'); updateCount(c); edRenderTime(c); }
    else if (m.type === 'output' && c) addOutput(c, m.output);
    else if (m.type === 'done') {
      if (c) {
        c.status = 'idle'; c.root.classList.remove('running');
        if (m.execution_count) c.count = m.execution_count;
        if (m.duration != null) { c.meta = c.meta || {}; c.meta.databridge = { ...(c.meta.databridge || {}), duration: m.duration, finished: m.finished, status: m.status }; }
        edRenderTime(c);
        if (m.status === 'error' && !c.outputs.some((o) => o.output_type === 'error')) {
          addOutput(c, { output_type: 'error', ename: 'Error', evalue: m.message || 'Execution failed', traceback: [] });
        }
        updateCount(c); markDirty();
        if (m.status === 'error') { c.root.scrollIntoView({ block: 'nearest' }); }
      }
      const res = S.pending.get(m.cell_id);
      if (res) { S.pending.delete(m.cell_id); res(m.status); }
    }
  }
  function resetRunning() {
    for (const [id, res] of S.pending) {
      const c = S.cells.find((x) => x.id === id);
      if (c) { c.status = 'idle'; c.root.classList.remove('running'); updateCount(c); }
      res('aborted');
    }
    S.pending.clear();
  }

  /* ---- kernel ---- */
  async function connectKernel() {
    setK('Starting kernel…', 'starting');
    try { S.kernel = await api('/api/kernels', { method: 'POST', body: { path } }); }
    catch (e) { setK('Kernel failed to start', 'error', e.message); toast(e.message, 'err'); return; }
    if (S.closed) return;
    const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws/kernels/${S.kernel.id}`);
    S.ws = ws;
    ws.onmessage = onMsg;
    ws.onclose = () => {
      if (S.closed || S.ws !== ws) return;
      resetRunning();
      setK('Reconnecting…', 'starting');
      setTimeout(() => !S.closed && connectKernel(), 2000);
    };
    pollKernel();
  }
  async function pollKernel() {
    if (!S.kernel || S.closed) return;
    try {
      const k = await api(`/api/kernels/${S.kernel.id}`);
      if (k.init_status === 'running') setK('Starting Spark…', 'starting', 'Running config/spark_init.py');
      else if (k.init_status === 'error') setK('Spark init failed', 'error', k.init_message);
      else if (k.busy) setK('Busy', 'busy');
      else setK(k.init_status === 'ready' ? 'Ready · Spark' : 'Ready', 'idle', k.init_message);
    } catch (e) {
      if (e.status === 404 && !S.reconnecting) {  // server restarted: kernel is gone -> start a new one
        S.reconnecting = true;
        if (S.ws) { S.ws.onclose = null; S.ws.close(); }
        S.kernel = null;
        setK('Kernel restarted — reconnecting…', 'starting');
        connectKernel().finally(() => { S.reconnecting = false; });
      }
    }
  }
  async function interrupt() {
    if (!S.kernel) return;
    try { await api(`/api/kernels/${S.kernel.id}/interrupt`, { method: 'POST' }); toast('Interrupt sent'); } catch (e) { toast(e.message, 'err'); }
  }
  async function restart() {
    if (!S.kernel) return;
    if (!(await formDialog({ title: 'Restart kernel?', text: 'All variables and the Spark session will be lost. Spark restarts automatically.', fields: [], submit: 'Restart' }))) return;
    setK('Restarting…', 'starting');
    try {
      await api(`/api/kernels/${S.kernel.id}/restart`, { method: 'POST' });
      resetRunning();
      S.cells.forEach((c) => { c.count = null; updateCount(c); });
      toast('Kernel restarted');
    } catch (e) { toast(e.message, 'err'); }
    pollKernel();
  }

  /* ---- save ---- */
  function toNb() {
    const cells = S.cells.map((c) => (c.type === 'code'
      ? { cell_type: 'code', id: c.id, metadata: c.meta || {}, source: c.cm.getValue(), execution_count: c.count ?? null,
        outputs: c.outputs.filter((o) => o.output_type !== 'clear_output') }
      : { cell_type: 'markdown', id: c.id, metadata: c.meta || {}, source: c.cm.getValue() }));
    return { ...nb, nbformat: 4, nbformat_minor: Math.max(nb.nbformat_minor || 0, 5), cells };
  }
  async function save(manual = false) {
    if (S.saving) return;
    S.saving = true;
    try {
      await api(`/api/notebook?path=${enc(path)}&manual=${manual ? 'true' : 'false'}`, { method: 'PUT', body: toNb() });
      S.dirty = false;
      saveState.textContent = `Saved ${new Date().toLocaleTimeString(undefined, { timeStyle: 'short' })}`;
    } catch (e) { toast('Save failed: ' + e.message, 'err'); }
    finally { S.saving = false; }
  }

  /* ---- boot ---- */
  for (const cell of nb.cells || []) {
    const type = cell.cell_type === 'code' ? 'code' : 'markdown';
    const cid = cell.id && /^[A-Za-z0-9_-]{1,64}$/.test(cell.id) ? cell.id : newId();
    S.cells.push(makeCell(type, srcText(cell.source), cell.outputs || [], cell.execution_count || null, cid, cell.metadata || {}));
  }
  if (!S.cells.length) S.cells.push(makeCell('code'));
  relayout();
  setActive(S.cells[0]);
  if (CURRENT_USER && CURRENT_USER.role === 'viewer') {      // read-only: no kernel, no editing
    S.cells.forEach((x) => x.cm.setOption('readOnly', true));
    main.querySelectorAll('.nb-bar .btn, .add-bar, .cell-tools .btn').forEach((b) => { if (!/Contents|Variables|history|shortcuts/i.test(b.title || '')) b.style.display = 'none'; });
    main.querySelector('.nb-bar').prepend(el('span', { class: 'chip', title: 'Viewers can read notebooks and outputs but not run or edit them' }, '👁 View only'));
    return () => { S.closed = true; S.timers.forEach(clearInterval); };
  }
  connectKernel();
  S.timers.push(setInterval(pollKernel, 2500));
  S.timers.push(setInterval(() => S.cells.forEach((x) => { if (x.status === 'running') edRenderTime(x); }), 1000));
  scheduleLint();
  S.timers.push(setInterval(() => S.dirty && !S.saving && save(), 30000));
  const onKey = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save(true); return; }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'h') && !(e.target.closest && e.target.closest('.find-bar'))) { e.preventDefault(); findBar.open(e.key === 'h'); return; }
    if (e.key === 'Escape') { edHideTip(); findBar.close(); }
    const t = e.target;
    if (t.closest && (t.closest('.CodeMirror') || t.closest('dialog') || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const c = S.active;
    const i = c ? S.cells.indexOf(c) : -1;
    const go = (j) => { const n = S.cells[Math.max(0, Math.min(S.cells.length - 1, j))]; if (n) { setActive(n); n.root.focus(); n.root.scrollIntoView({ block: 'nearest' }); } };
    const k = e.key;
    let handled = true;
    if (k === '?') nbShortcutsDialog();
    else if (!c) handled = false;
    else if (k === 'Enter' && e.shiftKey) runAndAdvance(c);
    else if (k === 'Enter') { if (c.root.classList.contains('code-hidden')) toggleCode(c); if (c.type === 'markdown') editMd(c); else c.cm.focus(); }
    else if (k === 'ArrowUp' || k === 'k') go(i - 1);
    else if (k === 'ArrowDown' || k === 'j') go(i + 1);
    else if (k === 'a') { const n = makeCell('code'); S.cells.splice(i, 0, n); relayout(); setActive(n); markDirty(); n.root.focus(); }
    else if (k === 'b') { const n = addCell('code', c, false); n.root.focus(); }
    else if (k === 'd') { const now = Date.now(); if (now - S.lastD < 600) { S.lastD = 0; S.trash = { type: c.type, source: c.cm.getValue(), index: i }; c.remove(); if (S.active) S.active.root.focus(); } else S.lastD = now; }
    else if (k === 'm') { setType(c, 'markdown'); c.typeSel.value = 'markdown'; renderMd(c); }
    else if (k === 'y') { setType(c, 'code'); c.typeSel.value = 'code'; }
    else if (k === 'o') toggleOut(c);
    else if (k === 'h') toggleCode(c);
    else if (k === 'c') { S.clip = { type: c.type, source: c.cm.getValue() }; toast('Cell copied'); }
    else if (k === 'x') { S.clip = { type: c.type, source: c.cm.getValue() }; S.trash = { ...S.clip, index: i }; c.remove(); toast('Cell cut'); }
    else if (k === 'v' || k === 'V') {
      if (!S.clip) toast('Nothing copied yet');
      else { const n = makeCell(S.clip.type, S.clip.source); S.cells.splice(k === 'V' ? i : i + 1, 0, n); relayout(); setActive(n); markDirty(); n.root.focus(); }
    }
    else if (k === 'z') {
      if (!S.trash) toast('Nothing to undo');
      else { const n = makeCell(S.trash.type, S.trash.source); S.cells.splice(Math.min(S.trash.index, S.cells.length), 0, n); S.trash = null; relayout(); setActive(n); markDirty(); }
    }
    else if (k === 'f' || k === 'F') { if (e.shiftKey) edFormatCell(c); else findBar.open(false); }
    else if (k === '0') { const now = Date.now(); if (now - (S.last0 || 0) < 600) { S.last0 = 0; restart(); } else S.last0 = now; }
    else if (k === 'i') { const now = Date.now(); if (now - (S.lastI || 0) < 600) { S.lastI = 0; interrupt(); } else S.lastI = now; }
    else handled = false;
    if (handled) e.preventDefault();
  };
  const onUnload = (e) => { if (S.dirty) { e.preventDefault(); e.returnValue = ''; } };
  document.addEventListener('keydown', onKey);
  window.addEventListener('beforeunload', onUnload);

  return () => {
    S.closed = true;
    S.timers.forEach(clearInterval);
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('beforeunload', onUnload);
    if (S.dirty) save();
    if (S.ws) S.ws.close();
  };
}

/* ================= result grid (shared) ================= */
function cellText(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}
function grid(res) {
  if (!res.columns.length) return el('div', { class: 'empty' }, el('p', {}, 'Statement ran — no rows returned.'));
  const tb = el('tbody');
  res.rows.forEach((row, i) => tb.append(el('tr', {}, el('td', { class: 'idx' }, i + 1),
    row.map((v) => { const t = cellText(v); return el('td', { class: t === null ? 'null' : '', title: t && t.length > 40 ? t : null }, t === null ? 'null' : t); }))));
  return el('div', { class: 'tbl-wrap', style: { maxHeight: '560px' } },
    el('table', { class: 't grid' }, el('thead', {}, el('tr', {}, el('th', { class: 'idx' }, '#'), res.columns.map((c) => el('th', {}, c)))), tb));
}
function toCsv(res) {
  const esc = (v) => { const t = cellText(v); if (t === null) return ''; return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
  return [res.columns.map(esc).join(','), ...res.rows.map((r) => r.map(esc).join(','))].join('\n');
}
function download(name, text, type = 'text/csv') {
  const a = el('a', { href: URL.createObjectURL(new Blob([text], { type })), download: name });
  document.body.append(a); a.click(); a.remove();
}

/* ================= Catalog ================= */
const CAT = { dbs: null, tables: {}, open: new Set() };
const layerColor = (n) => (/bronze|raw|landing/i.test(n) ? 'var(--bronze)' : /silver/i.test(n) ? 'var(--silver)' : /gold/i.test(n) ? 'var(--gold)' : 'var(--line-strong)');

async function viewCatalog(main, r) {
  main.classList.add('flush');
  CAT.dbs = null; CAT.tables = {};  // always show the current catalog (tables created elsewhere appear)
  const db = r.params.get('db');
  const tbl = r.params.get('table');
  if (db) CAT.open.add(db);
  const filter = el('input', { class: 'field', type: 'search', placeholder: 'Filter schemas and tables', 'aria-label': 'Filter catalog' });
  const tree = el('div', { class: 'tree' }, loading());
  const body = el('div', { class: 'cat-body' });
  const refresh = async () => { CAT.dbs = null; CAT.tables = {}; await boot(); };
  const catEl = el('div', { class: `cat${localStorage.getItem('databridge-cat-tree') === 'hidden' ? ' tree-hidden' : ''}` });
  const setTree = (hidden) => { catEl.classList.toggle('tree-hidden', hidden); try { localStorage.setItem('databridge-cat-tree', hidden ? 'hidden' : 'shown'); } catch { /* ignore */ } };
  const showBtn = el('button', { type: 'button', class: 'cat-show', title: 'Show catalog panel', 'aria-label': 'Show catalog panel', onClick: () => setTree(false) }, icon('db', 16), el('span', {}, 'Catalog'));
  catEl.append(
    el('aside', { class: 'cat-tree' }, el('div', { class: 'head' },
      el('div', { class: 'row' }, el('h2', { class: 'grow' }, 'Catalog'),
        btn('', refresh, { cls: 'ghost icon sm', ic: 'refresh', title: 'Refresh catalog' }),
        btn('Schema', () => newSchema(refresh), { cls: 'sm', ic: 'plus' }),
        el('button', { type: 'button', class: 'btn ghost icon sm cat-hide', title: 'Hide catalog panel', 'aria-label': 'Hide catalog panel', onClick: () => setTree(true) }, '«')), filter), tree),
    el('div', { class: 'cat-main' }, showBtn, body));
  main.append(catEl);

  const loadTables = async (d) => (CAT.tables[d] ||= await api(`/api/catalog/databases/${enc(d)}/tables`));

  function drawTree() {
    const f = filter.value.trim().toLowerCase();
    tree.replaceChildren(el('div', { class: 'muted', style: { fontSize: '12px', fontWeight: 600, padding: '6px 8px' } },
      (STATUS && STATUS.catalog_backend === 'metastore') ? 'hive_metastore' : 'spark_catalog'));
    for (const d of CAT.dbs) {
      const tables = CAT.tables[d.name];
      const tMatch = tables ? tables.filter((t) => !f || t.name.toLowerCase().includes(f)) : [];
      if (f && !d.name.toLowerCase().includes(f) && !tMatch.length) continue;
      const isOpen = CAT.open.has(d.name) || (f && tMatch.length > 0);
      const toggle = async () => {
        if (CAT.open.has(d.name)) CAT.open.delete(d.name);
        else { CAT.open.add(d.name); try { await loadTables(d.name); } catch (e) { toast(e.message, 'err'); } }
        drawTree();
      };
      tree.append(el('div', { class: 'row', style: { gap: '0' } },
        el('button', { type: 'button', class: isOpen ? 'open' : '', style: { width: '28px', flexShrink: 0, padding: '4px 8px' },
          'aria-expanded': String(!!isOpen), 'aria-label': `${isOpen ? 'Collapse' : 'Expand'} ${d.name}`, onClick: toggle },
        el('span', { class: 'caret' }, icon('caret', 12))),
        el('button', { type: 'button', class: `schema ${db === d.name && !tbl ? 'sel' : ''}`, onClick: () => (location.hash = `#/catalog?db=${enc(d.name)}`) },
          el('span', { class: 'swatch', style: { background: layerColor(d.name) } }), el('span', { class: 'tname' }, d.name),
          tables ? el('span', { class: 'tcount' }, String(tables.length)) : null)));
      if (isOpen && tables) {
        for (const t of tMatch) tree.append(el('button', { type: 'button', class: `tbl ${db === d.name && tbl === t.name ? 'sel' : ''}`, title: `${d.name}.${t.name}`,
          onClick: () => (location.hash = `#/catalog?db=${enc(d.name)}&table=${enc(t.name)}`) }, el('span', { class: 'tbl-ic', 'aria-hidden': 'true' }), el('span', { class: 'tname' }, t.name)));
        if (!tMatch.length) tree.append(el('div', { class: 'muted', style: { padding: '4px 30px', fontSize: '12px' } }, 'No tables'));
      }
    }
  }
  filter.addEventListener('input', drawTree);

  async function boot() {
    tree.replaceChildren(loading());
    try {
      CAT.dbs ||= await api('/api/catalog/databases');
      await Promise.all([...CAT.open].map((d) => loadTables(d).catch(() => null)));
      drawTree();
    } catch (e) { tree.replaceChildren(errBox(e)); }
    renderBody();
  }

  async function renderBody() {
    body.replaceChildren();
    if (!db) {
      body.append(el('div', { class: 'empty' }, icon('db', 32), el('h2', {}, 'Select a schema or table'),
        el('p', {}, 'Browse schemas on the left, or create a new one.'), btn('Create schema', () => newSchema(refresh), { cls: 'primary' })));
      return;
    }
    if (!tbl) return renderDb();
    return renderTable();
  }

  async function renderDb() {
    const info = (CAT.dbs || []).find((d) => d.name === db) || {};
    body.append(el('div', { class: 'page-head' }, el('div', { class: 'grow' }, el('div', { class: 'crumbs' }, 'catalog / schema'),
      el('div', { class: 'row', style: { marginTop: '4px' } }, el('span', { class: 'swatch', style: { width: '14px', height: '14px', borderRadius: '3px', background: layerColor(db) } }), el('h1', {}, db))),
    btn('Build dashboard with AI', () => dbAiDialog({ schema: db }), { ic: 'flow' }),
    btn('New query', () => openInSql(`SHOW TABLES IN ${db}`), { ic: 'term' })));
    if (info.location || info.comment) body.append(el('div', { class: 'panel', style: { marginBottom: '16px' } }, el('div', { class: 'kv' },
      info.comment ? [el('div', {}, 'Comment'), el('div', {}, info.comment)] : null,
      info.location ? [el('div', {}, 'Location'), el('div', { class: 'mono', style: { fontSize: '12px' } }, info.location)] : null,
      info.owner ? [el('div', {}, 'Owner'), el('div', {}, info.owner)] : null)));
    const panel = el('section', { class: 'panel' }, loading('Loading tables…'));
    body.append(panel);
    try {
      const tables = await loadTables(db);
      if (!tables.length) { panel.replaceChildren(el('div', { class: 'empty' }, el('p', {}, 'This schema has no tables yet.'))); return; }
      const tb = el('tbody');
      const q = el('input', { class: 'field cat-q', type: 'search', placeholder: `Search ${tables.length} tables…`, 'aria-label': 'Search tables' });
      const drawRows = () => {
        const f = q.value.trim().toLowerCase();
        tb.replaceChildren(...tables.filter((t) => !f || t.name.toLowerCase().includes(f)).map((t) => el('tr', { class: 'clickable', onClick: () => (location.hash = `#/catalog?db=${enc(db)}&table=${enc(t.name)}`) },
          el('td', {}, el('span', { class: 'cat-tname' }, el('span', { class: 'tbl-ic', 'aria-hidden': 'true' }), t.name)),
          el('td', {}, t.provider ? el('span', { class: 'chip teal' }, t.provider) : '—'), el('td', { class: 'muted' }, (t.table_type || '—').replace('_TABLE', '').toLowerCase()),
          el('td', { class: 'muted' }, t.owner || '—'), el('td', { class: 'muted' }, t.created ? fmtTime(t.created) : '—'))));
      };
      q.addEventListener('input', drawRows); drawRows();
      panel.replaceChildren(el('div', { class: 'panel-head' }, el('h3', { class: 'grow' }, `${tables.length} table${tables.length === 1 ? '' : 's'}`), q),
        el('table', { class: 't cat-list' }, el('thead', {}, el('tr', {}, ['Table', 'Format', 'Type', 'Owner', 'Created'].map((h) => el('th', {}, h)))), tb));
    } catch (e) { panel.replaceChildren(errBox(e)); }
  }

  async function renderTable() {
    body.append(loading('Loading table…'));
    let t;
    try { t = await api(`/api/catalog/databases/${enc(db)}/tables/${enc(tbl)}`); }
    catch (e) { body.replaceChildren(errBox(e)); return; }
    body.replaceChildren();
    const fq = `${db}.${tbl}`;
    const drop = async () => {
      if (!(await confirmDialog(`Drop table ${fq}?`, 'The table is removed from the metastore. For managed tables the data is deleted too.', 'Drop table'))) return;
      try { await api(`/api/catalog/databases/${enc(db)}/tables/${enc(tbl)}`, { method: 'DELETE' }); delete CAT.tables[db]; toast(`Dropped ${fq}`); location.hash = `#/catalog?db=${enc(db)}`; }
      catch (e) { toast(e.message, 'err'); }
    };
    body.append(el('div', { class: 'page-head', style: { marginBottom: '0' } },
      el('div', { class: 'grow' }, el('div', { class: 'crumbs' }, el('a', { href: `#/catalog?db=${enc(db)}` }, db), el('span', {}, '/')),
        el('div', { class: 'row', style: { marginTop: '4px', flexWrap: 'wrap' } }, el('h1', {}, tbl),
          el('span', { class: 'chip teal' }, (t.provider || 'hive').replace(/^./, (c) => c.toUpperCase())),
          t.table_type ? el('span', { class: 'chip' }, t.table_type.replace('_TABLE', '').toLowerCase()) : null)),
      btn('Dashboard with AI', () => dbAiDialog({ tables: [fq] }), { ic: 'flow' }),
      btn('Query', () => openInSql(`SELECT *\nFROM ${fq}\nLIMIT 100`), { cls: 'primary', ic: 'term' }),
      btn('Drop', drop, { cls: 'danger', ic: 'trash' })));

    const tabs = ['Columns', 'Sample data', 'Profile (EDA)', 'History & time travel', 'Maintenance', 'Details', 'DDL'];
    const kindOf = (ty) => (/^(tinyint|smallint|int|integer|bigint|long|short|float|double|real|decimal|number)/i.test(ty || '') ? 'num' : /^(date|timestamp)/i.test(ty || '') ? 'date' : /^bool/i.test(ty || '') ? 'bool' : 'text');
    const badge = (ty) => { const k = kindOf(ty); return el('span', { class: `dt-type k-${k}` }, k === 'num' ? '123' : k === 'date' ? 'DATE' : k === 'bool' ? 'T/F' : 'Abc'); };
    const tabBar = el('div', { class: 'tabs', role: 'tablist' });
    const pane = el('div', { role: 'tabpanel' });
    body.append(tabBar, pane);
    const show = async (name) => {
      [...tabBar.children].forEach((b) => b.setAttribute('aria-selected', String(b.textContent === name)));
      pane.replaceChildren();
      if (name === 'Columns') {
        const parts = new Set(t.partition_columns || []);
        const q = el('input', { class: 'field cat-q', type: 'search', placeholder: `Search ${t.columns.length} columns…`, 'aria-label': 'Search columns' });
        const tb = el('tbody');
        const drawCols = () => { const f = q.value.trim().toLowerCase();
          tb.replaceChildren(...t.columns.filter((c) => !f || c.name.toLowerCase().includes(f) || (c.type || '').toLowerCase().includes(f)).map((c, i) => el('tr', {},
            el('td', { class: 'muted cat-num' }, String(i + 1)),
            el('td', {}, el('span', { class: 'cat-col' }, badge(c.type), c.name), parts.has(c.name) ? el('span', { class: 'chip', style: { marginLeft: '8px' } }, 'partition') : null),
            el('td', { class: 'cat-type' }, c.type), el('td', { class: 'muted' }, c.nullable ? 'Yes' : 'No'), el('td', { class: 'muted' }, c.comment || '')))); };
        q.addEventListener('input', drawCols); drawCols();
        const counts = { num: 0, text: 0, date: 0, bool: 0 }; t.columns.forEach((c) => { counts[kindOf(c.type)]++; });
        pane.append(el('section', { class: 'panel' }, el('div', { class: 'panel-head' },
          el('div', { class: 'grow cat-colsum' }, el('b', {}, `${t.columns.length} columns`), counts.num ? el('span', {}, badge('int'), ` ${counts.num} numeric`) : null,
            counts.text ? el('span', {}, badge('string'), ` ${counts.text} text`) : null, counts.date ? el('span', {}, badge('date'), ` ${counts.date} date`) : null,
            counts.bool ? el('span', {}, badge('boolean'), ` ${counts.bool} boolean`) : null), q),
        el('table', { class: 't cat-cols' }, el('thead', {}, el('tr', {}, ['#', 'Column', 'Type', 'Nullable', 'Comment'].map((h) => el('th', {}, h)))), tb)));
      } else if (name === 'Sample data' || name === 'Profile (EDA)') {
        const eda = name !== 'Sample data';
        pane.append(loading(eda ? 'Profiling up to 5,000 rows through Spark…' : 'Reading rows through Spark…'));
        try {
          const res = await api(`/api/catalog/databases/${enc(db)}/tables/${enc(tbl)}/sample?limit=${eda ? 5000 : 1000}`);
          const typeOf = Object.fromEntries(t.columns.map((c) => [c.name, c.type]));
          const payload = { columns: res.columns, types: res.columns.map((c) => typeOf[c] || ''), rows: res.rows, truncated: res.rows.length >= (eda ? 5000 : 1000), limit: eda ? 5000 : 1000 };
          pane.replaceChildren(el('p', { class: 'muted small cat-note' }, `${eda ? 'Profile of' : 'Showing'} ${res.rows.length.toLocaleString()} row${res.rows.length === 1 ? '' : 's'} from ${fq}${payload.truncated ? ' (a sample — not the whole table)' : ''} · ${res.elapsed}s`),
            renderTableOutput(payload, { databridge: { view: eda ? 'eda' : 'table' } }, null));
        } catch (e) { pane.replaceChildren(errBox(e)); }
      } else if (name === 'History & time travel') {
        await deltaHistoryTab(pane, db, tbl);
      } else if (name === 'Maintenance') {
        await deltaMaintenanceTab(pane, db, tbl, t);
      } else if (name === 'Details') {
        const kv = [['Owner', t.owner], ['Created', t.created ? fmtTime(t.created) : null], ['Format', t.provider], ['Type', t.table_type],
          ['Location', t.location], ['Input format', t.input_format], ['Partitioned by', (t.partition_columns || []).join(', ') || null],
          ...Object.entries(t.properties || {})];
        pane.append(el('section', { class: 'panel' }, el('div', { class: 'kv' },
          kv.filter(([, v]) => v).map(([k, v]) => [el('div', {}, k), el('div', { class: /Location|format|\./i.test(k) ? 'mono' : '', style: { fontSize: '12.5px' } }, v)]))));
      } else {
        pane.append(loading('Running through Spark…'));
        try {
          if (name === 'DDL') {
            const d = await api(`/api/catalog/databases/${enc(db)}/tables/${enc(tbl)}/ddl`);
            pane.replaceChildren(el('section', { class: 'panel' }, el('div', { class: 'panel-head' }, el('h3', { class: 'grow' }, 'CREATE statement'),
              btn('Copy', () => navigator.clipboard.writeText(d.ddl).then(() => toast('Copied')), { cls: 'sm' })), el('div', { style: { padding: '12px' } }, el('pre', { class: 'code' }, d.ddl))));
          } else {
            const res = await api(`/api/catalog/databases/${enc(db)}/tables/${enc(tbl)}/history`);
            pane.replaceChildren(el('section', { class: 'panel' }, el('div', { class: 'panel-head' },
              el('span', { class: 'muted grow' }, `${res.rows.length} rows · ${res.elapsed}s`),
              btn('Download CSV', () => download(`${tbl}_${name.replace(' ', '_').toLowerCase()}.csv`, toCsv(res)), { cls: 'sm', ic: 'download' })), grid(res)));
          }
        } catch (e) {
          pane.replaceChildren(name === 'History' && /HISTORY|delta/i.test(e.message)
            ? el('div', { class: 'empty' }, el('p', {}, 'History is only available for Delta tables.'))
            : errBox(e));
        }
      }
    };
    tabs.forEach((name) => tabBar.append(el('button', { type: 'button', role: 'tab', onClick: () => show(name) }, name)));
    show('Columns');
  }

  boot();
  return () => main.classList.remove('flush');
}

/* ================= Workflows ================= */
function notConfigured(title, lines) {
  return el('section', { class: 'panel' }, el('div', { class: 'empty' }, el('h2', {}, title),
    lines.map((l) => el('p', { style: { margin: 0 } }, l))));
}
function runBars(runs) {
  const list = [...runs].reverse();
  return el('div', { class: 'bars', 'aria-label': 'Recent runs' },
    list.length ? list.map((r) => el('span', { title: `${r.state || 'no status'} · ${fmtTime(r.start_date || r.logical_date)}`,
      style: { background: STATE_COLORS[r.state] || 'var(--line-strong)' } })) : el('span', { class: 'muted', style: { width: 'auto', height: 'auto', fontSize: '12px' } }, 'No runs yet'));
}
async function triggerDag(dagId, withConf = false) {
  let conf = {};
  if (withConf) {
    const v = await formDialog({ title: `Trigger ${dagId}`, submit: 'Trigger run',
      fields: [{ name: 'conf', label: 'Run configuration (JSON)', type: 'textarea', value: '{\n  \n}', required: false }] });
    if (!v) return null;
    try { conf = v.conf ? JSON.parse(v.conf) : {}; } catch { toast('The configuration is not valid JSON.', 'err'); return null; }
  }
  try {
    const run = await api(`/api/workflows/${enc(dagId)}/trigger`, { method: 'POST', body: { conf } });
    toast(`Triggered ${dagId}`);
    return run;
  } catch (e) { toast(e.message, 'err'); return null; }
}
function pauseSwitch(d, after) {
  const cb = el('input', { type: 'checkbox', checked: !d.is_paused, 'aria-label': `${d.dag_id} active` });
  cb.addEventListener('change', async () => {
    try { await api(`/api/workflows/${enc(d.dag_id)}/pause`, { method: 'POST', body: { paused: !cb.checked } }); d.is_paused = !cb.checked; after && after(); }
    catch (e) { cb.checked = !cb.checked; toast(e.message, 'err'); }
  });
  return el('label', { class: 'switch', onClick: (e) => e.stopPropagation() }, cb, el('span', { class: 'muted' }, cb.checked ? 'Active' : 'Paused'));
}

async function airflowTab(main) {
  if (!STATUS.airflow) {
    main.append(notConfigured('Connect Airflow to run workflows', ['Set AIRFLOW_URL, AIRFLOW_USER and AIRFLOW_PASSWORD_FILE in .env, then restart DataBridge.']));
    return;
  }
  const filter = el('input', { class: 'field', type: 'search', placeholder: 'Filter by name or tag', 'aria-label': 'Filter workflows', style: { maxWidth: '320px' } });
  const panel = el('section', { class: 'panel' }, loading());
  main.append(el('div', { class: 'row', style: { marginBottom: '14px' } }, filter), panel);
  let dags = [];
  const draw = () => {
    const f = filter.value.trim().toLowerCase();
    const list = dags.filter((d) => !f || d.dag_id.toLowerCase().includes(f) || d.tags.some((t) => t.toLowerCase().includes(f)));
    if (!list.length) { panel.replaceChildren(el('div', { class: 'empty' }, el('p', {}, dags.length ? 'No workflows match this filter.' : 'No DAGs found in Airflow.'))); return; }
    const tb = el('tbody');
    for (const d of list) {
      const last = d.recent_runs[0];
      tb.append(el('tr', { class: 'clickable', onClick: () => (location.hash = `#/workflow/${enc(d.dag_id)}`) },
        el('td', {}, el('div', { style: { fontWeight: 600 } }, d.dag_id), d.tags.length ? el('div', { class: 'row', style: { gap: '4px', marginTop: '4px' } }, d.tags.map((t) => el('span', { class: 'chip', style: { fontSize: '11px', padding: '1px 8px' } }, t))) : null),
        el('td', { class: 'mono', style: { fontSize: '12px' } }, d.schedule || 'Manual'),
        el('td', {}, last ? stateEl(last.state) : el('span', { class: 'muted' }, '—'), last ? el('div', { class: 'muted', style: { fontSize: '12px' } }, ago(last.start_date || last.logical_date)) : null),
        el('td', {}, runBars(d.recent_runs)),
        el('td', {}, pauseSwitch(d, draw)),
        el('td', { style: { textAlign: 'right' } }, btn('Run now', async (e) => { e.stopPropagation(); if (await triggerDag(d.dag_id)) load(); }, { cls: 'sm', ic: 'play' }))));
    }
    panel.replaceChildren(el('div', { class: 'tbl-wrap' }, el('table', { class: 't' },
      el('thead', {}, el('tr', {}, ['Name', 'Schedule', 'Last run', 'Recent runs', 'Status', ''].map((h) => el('th', {}, h)))), tb)));
  };
  const load = async () => { try { dags = await api('/api/workflows'); draw(); } catch (e) { panel.replaceChildren(errBox(e)); } };
  filter.addEventListener('input', draw);
  await load();
  const t = setInterval(load, 10000);
  return () => clearInterval(t);
}

function layoutDag(tasks) {
  const byId = Object.fromEntries(tasks.map((t) => [t.task_id, t]));
  const parents = Object.fromEntries(tasks.map((t) => [t.task_id, []]));
  tasks.forEach((t) => t.downstream.forEach((d) => parents[d] && parents[d].push(t.task_id)));
  const depth = {};
  const visit = (id, seen = new Set()) => {
    if (depth[id] !== undefined) return depth[id];
    if (seen.has(id)) return 0;
    seen.add(id);
    depth[id] = parents[id].length ? Math.max(...parents[id].map((p) => visit(p, seen) + 1)) : 0;
    return depth[id];
  };
  tasks.forEach((t) => visit(t.task_id));
  const cols = {};
  tasks.forEach((t) => (cols[depth[t.task_id]] ||= []).push(t.task_id));
  const W = 190, H = 56, GX = 70, GY = 18, pos = {};
  Object.entries(cols).forEach(([c, ids]) => ids.forEach((id, i) => (pos[id] = { x: 20 + c * (W + GX), y: 20 + i * (H + GY) })));
  const width = 40 + (Object.keys(cols).length) * (W + GX) - GX;
  const height = 40 + Math.max(...Object.values(cols).map((c) => c.length)) * (H + GY) - GY;
  return { pos, W, H, width, height, byId };
}

async function viewWorkflow(main, r) {
  const dagId = r.rest[0];
  let selRun = r.params.get('run');
  main.append(loading());
  let dag;
  try { dag = await api(`/api/workflows/${enc(dagId)}`); } catch (e) { main.replaceChildren(errBox(e)); return; }
  main.replaceChildren();
  const S = { tis: [], timer: null };
  const head = el('div', { class: 'page-head' });
  const runsPanel = el('section', { class: 'panel' });
  const graphPanel = el('section', { class: 'panel' });
  main.append(head, el('div', { class: 'wf-layout' }, runsPanel, graphPanel));

  const reloadDag = async () => { try { dag = await api(`/api/workflows/${enc(dagId)}`); drawRuns(); await loadTis(); } catch (e) { toast(e.message, 'err'); } };
  const afterTrigger = async (run) => { if (run) { selRun = run.run_id; await reloadDag(); } };

  head.append(el('div', { class: 'grow' }, el('div', { class: 'crumbs' }, el('a', { href: '#/workflows' }, 'Workflows'), el('span', {}, '/')),
    el('h1', { style: { marginTop: '4px' } }, dag.dag_id),
    el('div', { class: 'muted', style: { fontSize: '13px', marginTop: '4px' } },
      `Schedule: ${dag.schedule || 'Manual'}${dag.owners.length ? ' · Owner: ' + dag.owners.join(', ') : ''}`)),
  pauseSwitch(dag),
  btn('Run with config', async () => afterTrigger(await triggerDag(dagId, true)), { ic: 'edit' }),
  btn('Run now', async () => afterTrigger(await triggerDag(dagId)), { cls: 'primary', ic: 'play' }));

  function drawRuns() {
    if (!selRun && dag.runs.length) selRun = dag.runs[0].run_id;
    const list = el('div', { class: 'runs-list' });
    for (const run of dag.runs) list.append(el('button', { type: 'button', class: run.run_id === selRun ? 'sel' : '',
      onClick: () => { selRun = run.run_id; history.replaceState(null, '', `#/workflow/${enc(dagId)}?run=${enc(selRun)}`); drawRuns(); loadTis(); } },
    el('span', { class: 'dot', style: { background: STATE_COLORS[run.state] || 'var(--line-strong)' } }),
    el('span', { class: 'grow' }, el('div', { style: { fontWeight: 500 } }, fmtTime(run.logical_date || run.start_date)),
      el('div', { class: 'muted', style: { fontSize: '12px' } }, `${run.state || 'queued'} · ${run.run_type || ''} · ${dur(run.start_date, run.end_date)}`))));
    runsPanel.replaceChildren(el('div', { class: 'panel-head' }, el('h2', {}, 'Runs')),
      dag.runs.length ? list : el('div', { class: 'empty' }, el('p', {}, 'No runs yet.'), btn('Run now', async () => afterTrigger(await triggerDag(dagId)), { cls: 'primary' })));
  }

  async function loadTis() {
    if (selRun) { try { S.tis = await api(`/api/workflows/${enc(dagId)}/runs/${enc(selRun)}/tasks`); } catch (e) { S.tis = []; toast(e.message, 'err'); } }
    drawGraph();
  }

  function drawGraph() {
    const run = dag.runs.find((x) => x.run_id === selRun);
    const tiBy = {};
    S.tis.forEach((t) => { if (!tiBy[t.task_id] || t.map_index <= 0) tiBy[t.task_id] = t; });
    const hasFailed = S.tis.some((t) => ['failed', 'upstream_failed'].includes(t.state));
    const headEl = el('div', { class: 'panel-head' }, el('h2', { class: 'grow' }, run ? `Tasks · ${fmtTime(run.logical_date || run.start_date)}` : 'Tasks'),
      run ? stateEl(run.state) : null,
      run && hasFailed ? btn('Repair run', async () => {
        try { await api(`/api/workflows/${enc(dagId)}/runs/${enc(selRun)}/clear-failed`, { method: 'POST' }); toast('Failed tasks cleared and re-queued'); reloadDag(); }
        catch (e) { toast(e.message, 'err'); }
      }, { cls: 'sm', ic: 'restart' }) : null);
    if (!dag.tasks.length) { graphPanel.replaceChildren(headEl, el('div', { class: 'empty' }, el('p', {}, 'This DAG has no tasks.'))); return; }
    const L = layoutDag(dag.tasks);
    const g = el('div', { class: 'graph' });
    const inner = el('div', { style: { position: 'relative', width: `${L.width}px`, height: `${L.height}px` } });
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', L.width); svg.setAttribute('height', L.height);
    for (const t of dag.tasks) for (const d of t.downstream) {
      const a = L.pos[t.task_id], b = L.pos[d];
      if (!a || !b) continue;
      const x1 = a.x + L.W, y1 = a.y + L.H / 2, x2 = b.x, y2 = b.y + L.H / 2, mx = (x1 + x2) / 2;
      const p = document.createElementNS(svgNS, 'path');
      p.setAttribute('d', `M${x1} ${y1} C${mx} ${y1}, ${mx} ${y2}, ${x2 - 6} ${y2}`);
      p.setAttribute('fill', 'none'); p.setAttribute('stroke', '#A7B0C2'); p.setAttribute('stroke-width', '1.5');
      svg.append(p);
      const h = document.createElementNS(svgNS, 'path');
      h.setAttribute('d', `M${x2 - 8} ${y2 - 4} L${x2} ${y2} L${x2 - 8} ${y2 + 4}`);
      h.setAttribute('fill', 'none'); h.setAttribute('stroke', '#A7B0C2'); h.setAttribute('stroke-width', '1.5');
      svg.append(h);
    }
    inner.append(svg);
    for (const t of dag.tasks) {
      const p = L.pos[t.task_id], ti = tiBy[t.task_id];
      const color = ti ? STATE_COLORS[ti.state] || 'var(--line-strong)' : 'var(--line-strong)';
      inner.append(el('button', { type: 'button', class: 'node', style: { left: `${p.x}px`, top: `${p.y}px`, borderColor: ti && ti.state ? color : null, boxShadow: ti && ti.state ? `inset 0 -3px 0 ${color}` : null },
        title: ti ? 'Open task log' : t.operator || '', onClick: () => ti && openLog(t.task_id, ti) },
      el('span', { class: 'tid' }, t.task_id),
      el('span', { class: 'st' }, el('span', { class: 'dot', style: { background: color, marginRight: 0 } }),
        ti ? `${(ti.state || 'no status').replace(/_/g, ' ')} · ${ti.duration ? Math.round(ti.duration) + 's' : dur(ti.start_date, ti.end_date)}` : t.operator || '')));
    }
    g.append(inner);
    graphPanel.replaceChildren(headEl, g, el('div', { class: 'muted', style: { padding: '0 18px 14px', fontSize: '12px' } }, 'Select a task to read its log.'));
  }

  function openLog(taskId, ti) {
    textDialog(`${taskId} · try ${ti.try_number}`, () => api(`/api/workflows/${enc(dagId)}/runs/${enc(selRun)}/tasks/${enc(taskId)}/log?try_number=${ti.try_number}`));
  }

  drawRuns();
  await loadTis();
  S.timer = setInterval(async () => {
    const run = dag.runs.find((x) => x.run_id === selRun);
    if (!run || ['running', 'queued'].includes(run.state) || S.tis.some((t) => ['running', 'queued', 'scheduled', 'up_for_retry'].includes(t.state))) await reloadDag();
  }, 5000);
  return () => clearInterval(S.timer);
}

/* ================= Compute ================= */
async function viewCompute(main) {
  main.append(el('div', { class: 'page-head' }, el('h1', { class: 'grow' }, 'Compute')));
  const kPanel = el('section', { class: 'panel', style: { marginBottom: '20px' } });
  const sPanel = el('section', { class: 'panel' });
  main.append(kPanel, sPanel);

  async function loadKernels() {
    let ks = [], st = { kernels: {}, java: { count: 0, orphans: [], memory_mb: 0 } };
    try { [ks, st] = await Promise.all([api('/api/kernels'), api('/api/admin/kernels').catch(() => st)]); } catch (e) { kPanel.replaceChildren(errBox(e)); return; }
    const act = (k, what) => async () => {
      if (what === 'shutdown' && !(await confirmDialog(`Shut down ${k.label}?`, 'Running code stops and variables are lost.', 'Shut down'))) return;
      try {
        await api(`/api/kernels/${k.id}${what === 'shutdown' ? '' : '/' + what}`, { method: what === 'shutdown' ? 'DELETE' : 'POST' });
        toast(what === 'shutdown' ? 'Kernel shut down' : what === 'restart' ? 'Kernel restarted' : 'Interrupt sent'); loadKernels();
      } catch (e) { toast(e.message, 'err'); }
    };
    const tb = el('tbody');
    for (const k of ks) tb.append(el('tr', {},
      el('td', {}, el('div', { style: { fontWeight: 500 } }, k.key === '__sql__' ? 'SQL Editor' : k.label.replace(/\.ipynb$/, '')),
        el('div', { class: 'mono muted', style: { fontSize: '11px' } }, k.id)),
      el('td', {}, stateEl(k.busy ? 'busy' : 'idle')),
      el('td', {}, k.init_status === 'error' ? el('span', { title: k.init_message }, stateEl('error'))
        : el('span', { class: 'muted' }, { ready: 'Spark ready', running: 'Starting Spark…', skipped: 'Plain Python', pending: 'Pending' }[k.init_status] || k.init_status)),
      el('td', { class: 'muted' }, ago(k.started_at)), el('td', { class: 'muted' }, ago(k.last_activity)),
      el('td', { class: 'muted' }, (st.kernels[k.id] || {}).memory_mb != null ? `${((st.kernels[k.id].memory_mb) / 1024).toFixed(2)} GB` : '—'),
      el('td', { style: { textAlign: 'right', whiteSpace: 'nowrap' } },
        btn('', act(k, 'interrupt'), { cls: 'ghost icon sm', ic: 'stop', title: 'Interrupt' }),
        btn('', act(k, 'restart'), { cls: 'ghost icon sm', ic: 'restart', title: 'Restart' }),
        btn('', act(k, 'shutdown'), { cls: 'ghost icon sm', ic: 'trash', title: 'Shut down' }))));
    const stopK = async (idleOnly) => {
      if (!idleOnly && !(await confirmDialog('Stop all kernels?', 'Every notebook, SQL and pipeline kernel stops (running job tasks are kept). They restart on next use.', 'Stop all'))) return;
      const res = await api('/api/admin/kernels/stop', { method: 'POST', body: { idleOnly, idleMinutes: 10 } });
      toast(`Stopped ${res.stopped.length} kernel(s)`); loadKernels();
    };
    setKids(kPanel, el('div', { class: 'panel-head', style: { flexWrap: 'wrap' } }, el('h2', { class: 'grow' }, 'Kernels'),
      el('span', { class: 'muted', style: { fontSize: '12px' } }, `${st.java.count} Spark JVM${st.java.count === 1 ? '' : 's'} · ${(st.java.memory_mb / 1024).toFixed(1)} GB`),
      st.java.orphans.length ? btn(`Kill ${st.java.orphans.length} leftover JVM${st.java.orphans.length === 1 ? '' : 's'}`, async () => {
        const res = await api('/api/admin/kill-orphans', { method: 'POST' }); toast(`Killed ${res.killed.length} process(es)`); loadKernels();
      }, { cls: 'sm danger' }) : null,
      btn('Stop idle (10 min+)', () => stopK(true), { cls: 'sm' }), btn('Stop all', () => stopK(false), { cls: 'sm', ic: 'stop' })),
    ks.length ? el('table', { class: 't' }, el('thead', {}, el('tr', {}, ['Attached to', 'State', 'Spark', 'Started', 'Last activity', 'Memory', ''].map((h) => el('th', {}, h)))), tb)
      : el('div', { class: 'empty' }, el('p', {}, 'No kernels running. Open a notebook to start one.')));
  }

  async function loadApps() {
    const head = el('div', { class: 'panel-head' }, el('h2', { class: 'grow' }, 'Spark applications'), el('span', { class: 'muted', style: { fontSize: '12px' } }, 'Spark Operator on Kubernetes'));
    if (!STATUS.kubernetes) {
      sPanel.replaceChildren(head, el('div', { class: 'empty' }, el('p', { style: { margin: 0 } }, 'Set K8S_ENABLED=true and SPARK_NAMESPACE in .env to see Spark jobs running on your cluster.')));
      return;
    }
    let apps = [];
    try { apps = await api('/api/compute/spark-apps'); } catch (e) { sPanel.replaceChildren(head, el('div', { style: { padding: '14px' } }, errBox(e))); return; }
    const tb = el('tbody');
    for (const a of apps) tb.append(el('tr', {},
      el('td', {}, el('div', { style: { fontWeight: 500 } }, a.name), el('div', { class: 'mono muted', style: { fontSize: '11px' } }, a.main || '')),
      el('td', {}, a.error ? el('span', { title: a.error }, stateEl(a.state)) : stateEl(a.state)),
      el('td', {}, a.autoscale.enabled ? `${a.executors_running} running · ${a.autoscale.min}–${a.autoscale.max} auto` : `${a.executors_running} / ${a.executor.instances ?? '—'}`),
      el('td', { class: 'muted', style: { fontSize: '12px' } }, `driver ${a.driver.cores ?? '—'}c/${a.driver.memory ?? '—'} · exec ${a.executor.cores ?? '—'}c/${a.executor.memory ?? '—'}`),
      el('td', { class: 'mono muted', style: { fontSize: '11px', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis' } }, a.image || ''),
      el('td', { class: 'muted' }, ago(a.created)),
      el('td', { style: { textAlign: 'right', whiteSpace: 'nowrap' } },
        btn('', () => textDialog(`${a.name} · driver log`, () => api(`/api/compute/spark-apps/${enc(a.name)}/log`)), { cls: 'ghost icon sm', ic: 'log', title: 'Driver log' }),
        btn('', async () => {
          if (!(await confirmDialog(`Delete ${a.name}?`, 'The Spark application and its pods are removed.'))) return;
          try { await api(`/api/compute/spark-apps/${enc(a.name)}`, { method: 'DELETE' }); loadApps(); } catch (e) { toast(e.message, 'err'); }
        }, { cls: 'ghost icon sm', ic: 'trash', title: 'Delete application' }))));
    sPanel.replaceChildren(head, apps.length
      ? el('div', { class: 'tbl-wrap' }, el('table', { class: 't' }, el('thead', {}, el('tr', {}, ['Application', 'State', 'Executors', 'Resources', 'Image', 'Created', ''].map((h) => el('th', {}, h)))), tb))
      : el('div', { class: 'empty' }, el('p', {}, `No Spark applications in namespace "${STATUS.spark_namespace || 'spark'}".`)));
  }
  kPanel.append(loading()); sPanel.append(loading());
  await Promise.all([loadKernels(), loadApps()]);
  const t = setInterval(() => { loadKernels(); loadApps(); }, 5000);
  return () => clearInterval(t);
}

/* ================= SQL editor ================= */
async function viewSql(main) {
  main.classList.add('flush');
  const HKEY = 'stratum.sqlHistory';
  const hist = () => { try { return JSON.parse(localStorage.getItem(HKEY) || '[]'); } catch { return []; } };
  const prefill = sessionStorage.getItem('stratum.sqlPrefill');
  sessionStorage.removeItem('stratum.sqlPrefill');
  const initial = prefill !== null ? prefill : localStorage.getItem('stratum.sql') || 'SHOW DATABASES';

  const side = el('aside', { class: 'sql-side' });
  const edHost = el('div', { class: 'sql-editor' });
  const status = el('span', { class: 'muted', style: { fontSize: '13px' } }, 'Ctrl+Enter to run · select text to run part of it');
  const limitSel = el('select', { class: 'field', style: { width: '130px' }, 'aria-label': 'Row limit' },
    [100, 1000, 10000].map((n) => el('option', { value: n, selected: n === 1000 }, `${n.toLocaleString()} rows`)));
  const out = el('section', { class: 'panel' }, el('div', { class: 'empty' }, el('p', {}, 'Results appear here.')));
  let running = false, last = null;
  const runBtn = btn('Run', () => run(), { cls: 'primary', ic: 'play' });
  const cancelBtn = btn('Cancel', async () => { try { await api('/api/sql/cancel', { method: 'POST' }); } catch (e) { toast(e.message, 'err'); } }, { ic: 'stop', disabled: true });
  const main2 = el('div', { class: 'sql-main' },
    el('div', { class: 'row' }, el('h1', { class: 'grow' }, 'SQL Editor'), limitSel, cancelBtn, runBtn),
    createDoraSqlBar(() => cm.getValue(), (sql) => { cm.setValue(sql); cm.focus(); }), edHost, status, out);
  main.append(el('div', { class: 'sql' }, side, main2));

  const cm = CodeMirror(edHost, { value: initial, mode: 'text/x-sparksql', lineNumbers: true, matchBrackets: true, autoCloseBrackets: true, indentUnit: 2,
    extraKeys: { 'Ctrl-Enter': () => run(), 'Cmd-Enter': () => run() } });
  cm.setSize(null, 220);
  cm.on('change', () => localStorage.setItem('stratum.sql', cm.getValue()));
  setTimeout(() => cm.refresh(), 0);

  const CUR = 'stratum.sqlCurrent';
  let pollTimer = null, closed = false;
  const setRunning = (on) => { running = on; runBtn.disabled = on; cancelBtn.disabled = !on; };
  function showResult(res) {
    last = res;
    CAT.dbs = null; CAT.tables = {};  // DDL may have changed the catalog
    status.textContent = `${res.rows.length.toLocaleString()} row${res.rows.length === 1 ? '' : 's'}${res.truncated ? ` (limited to ${res.limit.toLocaleString()})` : ''} · ${res.elapsed}s`;
    out.replaceChildren(el('div', { class: 'panel-head' }, el('h3', { class: 'grow' }, 'Results'),
      btn('Download CSV', () => download('query_result.csv', toCsv(last)), { cls: 'sm', ic: 'download' })), grid(res));
  }
  async function follow(qid, quiet = false) {
    clearTimeout(pollTimer);
    if (closed) return;
    let q;
    try { q = await api(`/api/sql/queries/${qid}`); }
    catch { if (!quiet) toast('That query is no longer available', 'err'); localStorage.removeItem(CUR); setRunning(false); return; }
    if (q.state === 'running') {
      setRunning(true);
      const secs = Math.round(Date.now() / 1000 - q.started);
      status.textContent = `Running for ${secs}s… it keeps running if you leave this page${secs < 5 ? ' (the first query starts Spark and can take a minute)' : ''}`;
      if (!out.querySelector('.spinner')) out.replaceChildren(loading('Running query…'));
      pollTimer = setTimeout(() => follow(qid, true), 800);
      return;
    }
    setRunning(false);
    if (q.state === 'done') showResult(q.result);
    else {
      status.textContent = 'Query failed';
      const e = new Error(q.error ? q.error.detail : 'Query failed');
      e.data = q.error || {};
      out.replaceChildren(el('div', { style: { padding: '14px' } }, errBox(e)));
    }
  }
  async function run() {
    if (running) return;
    const q = (cm.somethingSelected() ? cm.getSelection() : cm.getValue()).trim();
    if (!q) return;
    setRunning(true);
    out.replaceChildren(loading('Running query…'));
    try {
      const sub = await api('/api/sql/submit', { method: 'POST', body: { query: q, limit: Number(limitSel.value) } });
      localStorage.setItem(CUR, sub.id);
      const h = [q, ...hist().filter((x) => x !== q)].slice(0, 15);
      localStorage.setItem(HKEY, JSON.stringify(h));
      drawSide();
      follow(sub.id);
    } catch (e) { setRunning(false); toast(e.message, 'err'); }
  }

  const insert = (text) => { cm.replaceSelection(text); cm.focus(); };
  async function drawSide() {
    const schema = el('div', { class: 'tree', style: { padding: 0 } });
    side.replaceChildren(el('h3', { style: { padding: '4px 8px 8px' } }, 'Schemas'), schema,
      el('h3', { style: { padding: '16px 8px 8px' } }, 'Recent queries'),
      el('div', { class: 'hist' }, hist().length ? hist().map((q) => el('button', { type: 'button', title: q, onClick: () => { cm.setValue(q); cm.focus(); } }, q.replace(/\s+/g, ' '))) : el('p', { class: 'muted', style: { padding: '0 8px', fontSize: '12px' } }, 'Queries you run show up here.')));
    try {
      CAT.dbs ||= await api('/api/catalog/databases');
      for (const d of CAT.dbs) {
        const box = el('div');
        const b = el('button', { type: 'button', title: 'Show tables (double-click to insert name)',
          onDblclick: () => insert(d.name),
          onClick: async () => {
            if (box.childElementCount) { box.replaceChildren(); return; }
            try {
              const ts = (CAT.tables[d.name] ||= await api(`/api/catalog/databases/${enc(d.name)}/tables`));
              box.replaceChildren(...ts.map((t) => el('button', { type: 'button', class: 'tbl', title: 'Insert table name', onClick: () => insert(`${d.name}.${t.name}`) }, t.name)));
            } catch (e) { toast(e.message, 'err'); }
          } }, el('span', { class: 'swatch', style: { background: layerColor(d.name) } }), d.name);
        schema.append(b, box);
      }
    } catch (e) { schema.append(el('p', { class: 'muted', style: { fontSize: '12px', padding: '0 8px' } }, 'Schemas unavailable: ' + e.message)); }
  }
  drawSide();
  if (prefill) run();
  else if (localStorage.getItem(CUR)) follow(localStorage.getItem(CUR), true);  // re-attach to running/last query
  return () => { closed = true; clearTimeout(pollTimer); main.classList.remove('flush'); };
}

/* ================= router, search, boot ================= */
let STATUS = {};
let cleanup = null;
const ROUTES = { home: viewHome, workspace: viewWorkspace, notebook: viewNotebook, catalog: viewCatalog,
  workflows: viewWorkflows, workflow: viewWorkflow, compute: viewCompute, sql: viewSql,
  job: viewJob, jobedit: viewJobEdit, run: viewRun, pipelines: viewPipelines, pipeline: viewPipeline, prun: viewPipelineRun, admin: viewAdmin, dashboards: viewDashboards, dashboard: viewDashboard, logs: viewLogs, airflow: viewAirflow };
const NAV_FOR = { notebook: 'workspace', workflow: 'workflows', job: 'workflows', jobedit: 'workflows', run: 'workflows', pipeline: 'workflows', prun: 'workflows', pipelines: 'workflows', dashboard: 'dashboards', airflow: 'workflows' };

function parseHash() {
  const h = location.hash.replace(/^#\/?/, '') || 'home';
  const [p, qs] = h.split('?');
  const parts = p.split('/');
  return { view: parts[0], rest: parts.slice(1).map(decodeURIComponent), params: new URLSearchParams(qs || '') };
}
async function render() {
  if (cleanup) { try { cleanup(); } catch { /* ignore */ } cleanup = null; }
  const r = parseHash();
  const view = ROUTES[r.view] ? r.view : 'home';
  document.querySelectorAll('.nav').forEach((a) => {
    const on = a.dataset.view === (NAV_FOR[view] || view);
    a.classList.toggle('active', on);
    on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
  });
  const main = $('#main');
  main.className = '';
  main.replaceChildren();
  main.scrollTop = 0;
  try { cleanup = (await ROUTES[view](main, r)) || null; }
  catch (e) { main.replaceChildren(errBox(e)); }
}

function setupSearch() {
  const input = $('#search'), box = $('#search-results');
  let timer = null;
  const hide = () => { box.hidden = true; };
  input.addEventListener('input', () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (q.length < 2) { hide(); return; }
    timer = setTimeout(async () => {
      try {
        const res = await api(`/api/search?q=${enc(q)}`);
        const go = (h) => () => { location.hash = h; input.value = ''; hide(); };
        setKids(box,
          res.notebooks.length ? el('div', { class: 'grp' }, 'Workspace') : null,
          res.notebooks.map((n) => el('a', { href: n.type === 'dir' ? `#/workspace?path=${enc(n.path)}` : `#/notebook?path=${enc(n.path)}`, onClick: go(n.type === 'dir' ? `#/workspace?path=${enc(n.path)}` : `#/notebook?path=${enc(n.path)}`) },
            icon(n.type === 'dir' ? 'folder' : 'nb', 16), el('span', {}, n.name), el('span', { class: 'mono muted', style: { fontSize: '11px', marginLeft: 'auto' } }, n.path))),
          res.tables.length ? el('div', { class: 'grp' }, 'Tables') : null,
          res.tables.map((t) => el('a', { href: `#/catalog?db=${enc(t.database)}&table=${enc(t.name)}`, onClick: go(`#/catalog?db=${enc(t.database)}&table=${enc(t.name)}`) },
            icon('table', 16), el('span', { class: 'mono' }, `${t.database}.${t.name}`))),
          !res.notebooks.length && !res.tables.length ? el('div', { class: 'grp' }, 'No matches') : null);
        box.hidden = false;
      } catch { hide(); }
    }, 200);
  });
  input.addEventListener('keydown', (e) => { if (e.key === 'Escape') { input.value = ''; hide(); } if (e.key === 'ArrowDown') { const a = box.querySelector('a'); a && a.focus(); e.preventDefault(); } });
  document.addEventListener('click', (e) => { if (!e.target.closest('.search')) hide(); });
  document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); input.focus(); } });
}

function setupNew() {
  $('#new-btn').addEventListener('click', () => openDialog((close) => {
    const pick = (fn) => () => { close(null); fn(); };
    return el('div', { class: 'dlg' }, el('h2', {}, 'Create'),
      el('div', { class: 'choice' },
        el('button', { type: 'button', onClick: pick(() => newNotebook(parseHash().view === 'workspace' ? parseHash().params.get('path') || '' : '')) }, el('b', {}, 'Notebook'), el('span', {}, 'PySpark in a Jupyter kernel')),
        el('button', { type: 'button', onClick: pick(() => { sessionStorage.setItem('stratum.sqlPrefill', ''); location.hash = '#/sql'; }) }, el('b', {}, 'Query'), el('span', {}, 'Spark SQL editor')),
        el('button', { type: 'button', onClick: pick(() => newFolder(parseHash().view === 'workspace' ? parseHash().params.get('path') || '' : '', render)) }, el('b', {}, 'Folder'), el('span', {}, 'Organize notebooks')),
        el('button', { type: 'button', onClick: pick(() => newSchema(() => { CAT.dbs = null; location.hash = '#/catalog'; render(); })) }, el('b', {}, 'Schema'), el('span', {}, 'A new database in the catalog'))),
      el('div', { class: 'actions' }, btn('Cancel', () => close(null))));
  }));
}

async function boot() {
  document.querySelectorAll('[data-icon]').forEach((s) => s.replaceWith(icon(s.dataset.icon)));
  await authGate();
  document.body.classList.toggle('role-viewer', !!CURRENT_USER && CURRENT_USER.role === 'viewer');
  if (CURRENT_USER && CURRENT_USER.role !== 'admin') document.querySelectorAll('.nav[data-view="admin"]').forEach((n) => n.remove());
  const chip = authUserChip();
  if (chip) $('#conn-summary').before(chip);
  if (CURRENT_USER && CURRENT_USER.must_change) authAccountDialog(true);
  try { STATUS = await api('/api/status'); } catch { STATUS = {}; }
  const foot = $('#conn-summary');
  const c = (label, ok) => el('div', { class: 'conn' }, el('span', { class: 'dot', style: { background: ok ? '#12CFF5' : '#3A4A6B' } }), label);
  foot.append(c('Notebooks', true), c('Catalog', STATUS.metastore || STATUS.catalog_backend === 'spark'), c('Airflow', STATUS.airflow), c('Kubernetes', STATUS.kubernetes));
  setupSearch();
  setupNew();
  window.addEventListener('hashchange', render);
  render();
}
boot();
