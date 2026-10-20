/* Feature flags: load what this user may use, hide disabled UI, guard routes, and the Super Admin › Features page. */
'use strict';

let FEAT = {};                                   // {key: bool}; missing key = on
const dbFeat = (k) => FEAT[k] !== false;
const isSuper = () => !!CURRENT_USER && CURRENT_USER.role === 'super_admin';

/* page (route) -> feature(s) it needs; an array means "any of these" */
const FEAT_ROUTE = {
  notebook: 'notebooks', catalog: 'catalog', sql: 'sql_editor', compute: 'compute', logs: 'logs',
  dashboards: 'dashboards', dashboard: 'dashboards', job: 'jobs', jobedit: 'jobs', run: 'jobs',
  pipeline: 'pipelines', prun: 'pipelines', workflow: 'airflow', workflows: ['jobs', 'airflow', 'pipelines'],
  datahub: ['data_hub', 'airbyte'], markets: 'markets',
};
const FEAT_NAV = { catalog: 'catalog', sql: 'sql_editor', compute: 'compute', logs: 'logs', dashboards: 'dashboards', workflows: ['jobs', 'airflow', 'pipelines'], datahub: ['data_hub', 'airbyte'], markets: 'markets' };
const featOk = (need) => (Array.isArray(need) ? need.some(dbFeat) : dbFeat(need));

async function loadFeatures() {
  try { FEAT = (await api('/api/features/me')).features || {}; } catch { FEAT = {}; }
  for (const [view, need] of Object.entries(FEAT_NAV)) {
    document.querySelectorAll(`.nav[data-view="${view}"]`).forEach((n) => { n.hidden = !featOk(need); });
  }
  Object.keys(FEAT).forEach((k) => document.documentElement.classList.toggle(`feat-off-${k}`, !FEAT[k]));
  const ask = document.getElementById('aic-btn'); if (ask) ask.hidden = !dbFeat('ai_assistant');
}

/* returns a blocked-page element when the route's feature is off, else null */
function featureGate(view) {
  const need = FEAT_ROUTE[view];
  if (!need || featOk(need)) return null;
  return el('div', { class: 'empty feat-off' }, el('h2', {}, 'This feature is turned off'),
    el('p', {}, 'Your administrator has not enabled it for your account.'), el('a', { class: 'btn primary', href: '#/home' }, 'Go home'));
}

/* ---------- Super Admin › Features ---------- */
async function adminFeaturesTab(body) {
  if (!isSuper()) { body.append(el('div', { class: 'empty' }, el('h2', {}, 'Super admins only'))); return; }
  body.append(loading());
  let C;
  try { C = await api('/api/features'); } catch (e) { body.replaceChildren(errBox(e)); return; }
  const ROLE_NAMES = { admin: 'Admin', editor: 'Editor', viewer: 'Viewer' };
  const pending = { global: {}, roles: {}, users: {} };
  const status = el('span', { class: 'muted small' });
  const saveBtn = btn('Save changes', async () => {
    saveBtn.disabled = true;
    try { C = { ...C, ...(await api('/api/features', { method: 'PUT', body: pending })) }; pending.global = {}; pending.roles = {}; pending.users = {};
      toast('Feature settings saved'); status.textContent = ''; await loadFeatures(); draw(); }
    catch (e) { toast(e.message, 'err'); }
    saveBtn.disabled = false;
  }, { cls: 'primary', ic: 'save' });
  const mark = () => { const n = Object.keys(pending.global).length + Object.values(pending.roles).reduce((a, x) => a + Object.keys(x).length, 0) + Object.values(pending.users).reduce((a, x) => a + Object.keys(x).length, 0);
    status.textContent = n ? `${n} unsaved change${n === 1 ? '' : 's'}` : ''; };
  const cur = (scope, who, k) => {
    const p = scope === 'global' ? pending.global : (pending[scope][who] || {});
    if (k in p) return p[k];
    const s = scope === 'global' ? C.global : ((C[scope] || {})[who] || {});
    return k in s ? s[k] : null;
  };
  const set = (scope, who, k, v) => { if (scope === 'global') pending.global[k] = v; else (pending[scope][who] ||= {})[k] = v; mark(); draw(); };
  const tri = (scope, who, k, label) => {
    const v = cur(scope, who, k);
    const s = el('select', { class: `feat-tri ${v === true ? 'on' : v === false ? 'off' : 'inh'}`, 'aria-label': label },
      [['', 'Inherit'], ['on', 'On'], ['off', 'Off']].map(([val, l]) => el('option', { value: val, selected: (v === true ? 'on' : v === false ? 'off' : '') === val }, l)));
    s.addEventListener('change', () => set(scope, who, k, s.value === '' ? null : s.value === 'on'));
    return s;
  };
  const globalSwitch = (k, label) => {
    const v = cur('global', null, k) !== false;
    return el('label', { class: 'switch', title: v ? 'On for everyone (unless overridden)' : 'Off for everyone (unless overridden)' },
      el('input', { type: 'checkbox', checked: v, 'aria-label': label, onChange: (e) => set('global', null, k, e.target.checked ? null : false) }), v ? 'On' : 'Off');
  };
  const userSel = el('select', { class: 'field', 'aria-label': 'User' }, el('option', { value: '' }, 'Add a user override…'),
    C.users_list.filter((u) => u.role !== 'super_admin').map((u) => el('option', { value: u.username }, `${u.name || u.username} (${u.username}, ${u.role})`)));
  const extraUsers = new Set(Object.keys(C.users || {}));
  userSel.addEventListener('change', () => { if (userSel.value) { extraUsers.add(userSel.value); userSel.value = ''; draw(); } });
  const tableBox = el('div', { class: 'feat-wrap' });
  function draw() {
    const users = [...extraUsers];
    const groups = [...new Set(C.features.map((f) => f.group))];
    tableBox.replaceChildren(el('table', { class: 't feat-table' },
      el('thead', {}, el('tr', {}, el('th', {}, 'Feature'), el('th', {}, 'Everyone'), C.role_list.map((r) => el('th', {}, ROLE_NAMES[r] || r)),
        users.map((u) => el('th', { class: 'feat-user' }, u, el('button', { type: 'button', class: 'linkish', title: `Remove overrides for ${u}`,
          onClick: () => { C.features.forEach((f) => { if (cur('users', u, f.key) !== null) (pending.users[u] ||= {})[f.key] = null; }); extraUsers.delete(u); mark(); draw(); } }, ' ×'))))),
      el('tbody', {}, groups.flatMap((g) => [el('tr', { class: 'feat-group' }, el('td', { colspan: 2 + C.role_list.length + users.length }, g)),
        ...C.features.filter((f) => f.group === g).map((f) => el('tr', {},
          el('td', {}, el('b', {}, f.label), el('div', { class: 'muted small' }, f.description)),
          el('td', {}, globalSwitch(f.key, `${f.label} for everyone`)),
          C.role_list.map((r) => el('td', {}, tri('roles', r, f.key, `${f.label} for ${r}`))),
          users.map((u) => el('td', {}, tri('users', u, f.key, `${f.label} for ${u}`)))))]))));
  }
  draw();
  body.replaceChildren(el('section', { class: 'panel' },
    el('div', { class: 'panel-head' }, el('div', { class: 'grow' }, el('h3', {}, 'Features'),
      el('p', { class: 'muted small', style: { margin: '2px 0 0' } }, 'Turn features on or off for everyone, per role, or per user. Most specific wins: user › role › everyone. Super admins always see everything. Disabled features are hidden and blocked in the API.')),
      status, saveBtn),
    el('div', { class: 'row', style: { gap: '8px', margin: '0 0 10px' } }, userSel), tableBox));
}
