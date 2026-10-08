/* DataBridge sign-in, account menu, users admin, audit log. Loaded before app.js. */
'use strict';

let CURRENT_USER = null;
let AUTH_INFO = { auth_enabled: false };
const ROLE_LABEL = { admin: 'Admin', editor: 'Editor', viewer: 'Viewer' };
const ROLE_HELP = { admin: 'Everything, including users, settings and connections', editor: 'Build and run notebooks, SQL, jobs, pipelines', viewer: 'Read-only: browse and view results' };

/* Called by boot(). Resolves once a user is signed in (or auth is off). */
async function authGate() {
  try { AUTH_INFO = await (await fetch('/api/auth/me')).json(); } catch { AUTH_INFO = { auth_enabled: false }; }
  if (AUTH_INFO.user) { CURRENT_USER = AUTH_INFO.user; return; }
  await new Promise((resolve) => authScreen(AUTH_INFO.needs_setup ? 'setup' : 'login', resolve));
}

function authScreen(mode, done) {
  const user = el('input', { class: 'field', autocomplete: 'username', placeholder: mode === 'setup' ? 'e.g. rishi' : '' });
  const name = el('input', { class: 'field', autocomplete: 'name' });
  const pw = el('input', { class: 'field', type: 'password', autocomplete: mode === 'setup' ? 'new-password' : 'current-password' });
  const pw2 = el('input', { class: 'field', type: 'password', autocomplete: 'new-password' });
  const err = el('div', { class: 'auth-err', role: 'alert' });
  const submit = el('button', { type: 'submit', class: 'btn primary auth-submit' }, mode === 'setup' ? 'Create admin account' : 'Sign in');
  const form = el('form', { class: 'auth-card' },
    el('img', { src: '/static/logo-full.png', alt: 'DataBridge', class: 'auth-logo' }),
    el('h1', {}, mode === 'setup' ? 'Welcome — create the admin account' : 'Sign in'),
    mode === 'setup' ? el('p', { class: 'muted' }, 'This is the first sign-in on this DataBridge. The account you create here can add other users.') : null,
    el('label', { class: 'lbl' }, 'Username', user),
    mode === 'setup' ? el('label', { class: 'lbl' }, 'Full name', name) : null,
    el('label', { class: 'lbl' }, 'Password', pw),
    mode === 'setup' ? el('label', { class: 'lbl' }, 'Repeat password', pw2) : null,
    mode === 'setup' ? el('p', { class: 'pl-hint' }, 'At least 8 characters, with letters and numbers.') : null,
    err, submit);
  const overlay = el('div', { class: 'auth-overlay' }, form);
  document.body.append(overlay);
  setTimeout(() => user.focus(), 0);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.textContent = '';
    if (mode === 'setup' && pw.value !== pw2.value) { err.textContent = 'Passwords do not match'; return; }
    submit.disabled = true;
    try {
      const r = await fetch(mode === 'setup' ? '/api/auth/setup' : '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.value.trim(), name: name.value.trim(), password: pw.value }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || 'Sign-in failed');
      CURRENT_USER = data.user;
      overlay.remove();
      done();
    } catch (ex) { err.textContent = ex.message; submit.disabled = false; pw.select(); }
  });
}

/* Sidebar user chip + menu */
function authUserChip() {
  if (!CURRENT_USER || !AUTH_INFO.auth_enabled) return null;
  const initials = (CURRENT_USER.name || CURRENT_USER.username).split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const chip = el('button', { type: 'button', class: 'user-chip', title: 'Account' },
    el('span', { class: 'user-av' }, initials),
    el('span', { class: 'user-txt' }, el('b', {}, CURRENT_USER.name || CURRENT_USER.username), el('span', {}, ROLE_LABEL[CURRENT_USER.role])));
  chip.addEventListener('click', () => authAccountDialog());
  return chip;
}
async function authSignOut() {
  await fetch('/api/auth/logout', { method: 'POST' });
  location.hash = '#/home';
  location.reload();
}

function authAccountDialog(force = false) {
  return openDialog((close) => {
    const cur = el('input', { class: 'field', type: 'password', autocomplete: 'current-password' });
    const nw = el('input', { class: 'field', type: 'password', autocomplete: 'new-password' });
    const nw2 = el('input', { class: 'field', type: 'password', autocomplete: 'new-password' });
    const msg = el('div', { class: 'auth-err' });
    const tokBox = el('div', { class: 'stack', style: { gap: '6px' } });
    const drawTokens = async () => {
      const list = await api('/api/auth/tokens');
      tokBox.replaceChildren(...(list.length ? list.map((t) => el('div', { class: 'row tok-row' },
        el('span', { class: 'mono' }, `${t.prefix}…`), el('b', {}, t.name), el('span', { class: 'grow muted', style: { fontSize: '12px' } },
          `created ${ago(t.created)}${t.expires ? ` · expires ${new Date(t.expires * 1000).toLocaleDateString()}` : ' · never expires'}${t.last_used ? ` · used ${ago(t.last_used)}` : ''}`),
        btn('Revoke', async () => { await api(`/api/auth/tokens/${t.id}`, { method: 'DELETE' }); drawTokens(); }, { cls: 'sm danger' })))
        : [el('p', { class: 'muted', style: { margin: 0, fontSize: '13px' } }, 'No tokens. Use tokens for scripts, e.g. triggering pipelines from Airflow or CI.')]));
    };
    const newTok = async () => {
      const v = await formDialog({ title: 'New API token', submit: 'Create', fields: [{ name: 'name', label: 'Name', value: 'script' },
        { name: 'days', label: 'Expires after (days, 0 = never)', value: '90' }] });
      if (!v) return;
      const t = await api('/api/auth/tokens', { method: 'POST', body: { name: v.name, days: Number(v.days || 0) } });
      await openDialog((c2) => el('div', { class: 'dlg' }, el('h2', {}, 'Copy your token now'),
        el('p', { class: 'muted' }, 'It is shown only once. Use it as:  Authorization: Bearer <token>'),
        el('pre', { class: 'code', style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' } }, t.token),
        el('div', { class: 'actions' }, btn('Copy', () => navigator.clipboard.writeText(t.token).then(() => toast('Copied'))), btn('Done', () => c2(true), { cls: 'primary' }))));
      drawTokens();
    };
    if (!force) drawTokens();
    return el('div', { class: 'dlg' },
      el('div', { class: 'row' }, el('h2', { class: 'grow' }, force ? 'Set a new password' : 'My account'), force ? null : btn('Close', () => close(null), { cls: 'sm' })),
      force ? el('p', { class: 'muted' }, 'An admin created your account with a temporary password. Choose your own to continue.')
        : el('div', { class: 'row', style: { gap: '10px' } }, el('span', { class: 'user-av lg' }, (CURRENT_USER.name || CURRENT_USER.username).slice(0, 2).toUpperCase()),
          el('div', { class: 'grow' }, el('b', {}, CURRENT_USER.name || CURRENT_USER.username), el('div', { class: 'muted', style: { fontSize: '12.5px' } }, `${CURRENT_USER.username} · ${ROLE_LABEL[CURRENT_USER.role]} — ${ROLE_HELP[CURRENT_USER.role]}`)),
          btn('Sign out', authSignOut, { cls: 'sm' })),
      el('h3', { style: { margin: '10px 0 0' } }, 'Change password'),
      el('div', { class: 'grid3' }, el('label', { class: 'lbl' }, 'Current', cur), el('label', { class: 'lbl' }, 'New', nw), el('label', { class: 'lbl' }, 'Repeat new', nw2)), msg,
      el('div', { class: 'actions', style: { marginTop: 0 } }, btn('Update password', async () => {
        msg.textContent = '';
        if (nw.value !== nw2.value) { msg.textContent = 'New passwords do not match'; return; }
        try { await api('/api/auth/password', { method: 'POST', body: { current: cur.value, new: nw.value } }); toast('Password updated'); CURRENT_USER.must_change = 0; if (force) close(true); cur.value = nw.value = nw2.value = ''; }
        catch (e) { msg.textContent = e.message; }
      }, { cls: 'primary' })),
      force ? null : el('div', { class: 'row', style: { marginTop: '10px' } }, el('h3', { class: 'grow', style: { margin: 0 } }, 'API tokens'), btn('New token', newTok, { cls: 'sm', ic: 'plus' })),
      force ? null : tokBox);
  }, { wide: true });
}

/* Admin › Users */
async function authUsersTab(main) {
  const panel = el('section', { class: 'panel' }, loading());
  main.append(el('div', { class: 'row', style: { marginBottom: '12px' } }, el('p', { class: 'muted grow', style: { margin: 0 } },
    'Admin: everything · Editor: build and run · Viewer: read-only'), btn('Add user', () => edit(null), { cls: 'primary', ic: 'plus' })), panel);
  const load = async () => {
    const users = await api('/api/users');
    panel.replaceChildren(el('table', { class: 't' }, el('thead', {}, el('tr', {}, ['User', 'Role', 'Status', 'Last sign-in', ''].map((h) => el('th', {}, h)))),
      el('tbody', {}, users.map((u) => el('tr', {},
        el('td', {}, el('b', {}, u.name || u.username), el('div', { class: 'muted', style: { fontSize: '12px' } }, `${u.username}${u.email ? ` · ${u.email}` : ''}`)),
        el('td', {}, el('span', { class: `chip role-${u.role}` }, ROLE_LABEL[u.role])),
        el('td', {}, u.active ? (u.must_change ? el('span', { class: 'muted' }, 'Must set password') : 'Active') : el('span', { class: 'muted' }, 'Disabled')),
        el('td', { class: 'muted' }, u.last_login ? ago(u.last_login) : 'never'),
        el('td', { style: { textAlign: 'right', whiteSpace: 'nowrap' } },
          btn('Edit', () => edit(u), { cls: 'sm' }),
          u.id !== CURRENT_USER.id ? btn('', async () => {
            if (!(await confirmDialog(`Delete ${u.username}?`, 'Their sessions and API tokens stop working. Notebooks they made are kept.', 'Delete'))) return;
            try { await api(`/api/users/${u.id}`, { method: 'DELETE' }); load(); } catch (e) { toast(e.message, 'err'); }
          }, { cls: 'ghost icon sm', ic: 'trash', title: 'Delete user' }) : null))))));
  };
  async function edit(u) {
    const fields = [
      ...(u ? [] : [{ name: 'username', label: 'Username', value: '' }]),
      { name: 'name', label: 'Full name', value: u ? u.name : '', required: false }, { name: 'email', label: 'Email (optional)', value: u ? u.email : '', required: false },
      { name: 'role', label: 'Role', type: 'select', value: u ? u.role : 'editor', options: ['admin', 'editor', 'viewer'] },
      { name: 'password', type: 'password', label: u ? 'Reset password (leave empty to keep)' : 'Temporary password (user must change it)', value: '', required: !u },
      ...(u ? [{ name: 'active', label: 'Account', type: 'select', value: u.active ? 'active' : 'disabled', options: ['active', 'disabled'] }] : []),
    ];
    const v = await formDialog({ title: u ? `Edit ${u.username}` : 'Add user', submit: u ? 'Save' : 'Create user', fields });
    if (!v) return;
    try {
      if (u) await api(`/api/users/${u.id}`, { method: 'PUT', body: { name: v.name, email: v.email, role: v.role, active: v.active === 'active', ...(v.password ? { password: v.password } : {}) } });
      else await api('/api/users', { method: 'POST', body: v });
      toast(u ? 'User updated' : 'User created — share the temporary password with them'); load();
    } catch (e) { toast(e.message, 'err'); }
  }
  load().catch((e) => panel.replaceChildren(errBox(e)));
}

/* Admin › Audit log */
async function authAuditTab(main) {
  const q = el('input', { class: 'field', type: 'search', placeholder: 'Filter by action or target (e.g. pipeline, settings, login)', style: { maxWidth: '420px' } });
  const panel = el('section', { class: 'panel' }, loading());
  main.append(el('div', { class: 'row', style: { marginBottom: '12px' } }, q, el('span', { class: 'grow' }),
    btn('Export CSV', async () => {
      const rows = await api('/api/audit?limit=5000');
      download('databridge_audit.csv', toCsv({ columns: ['time', 'user', 'action', 'target', 'status', 'ip'],
        rows: rows.map((r) => [new Date(r.time * 1000).toISOString(), r.username, r.action, r.target, r.status, r.ip]) }));
    }, { cls: 'sm', ic: 'download' })), panel);
  const load = async () => {
    const rows = await api(`/api/audit?limit=500${q.value ? `&q=${encodeURIComponent(q.value)}` : ''}`);
    panel.replaceChildren(rows.length ? el('div', { class: 'tbl-wrap' }, el('table', { class: 't' },
      el('thead', {}, el('tr', {}, ['When', 'User', 'Action', 'Target', 'Result', 'IP'].map((h) => el('th', {}, h)))),
      el('tbody', {}, rows.map((r) => el('tr', {},
        el('td', { class: 'muted', style: { whiteSpace: 'nowrap' } }, fmtTime(r.time * 1000)), el('td', { style: { fontWeight: 600 } }, r.username),
        el('td', { class: 'mono', style: { fontSize: '12px' } }, r.action),
        el('td', { class: 'mono muted', style: { fontSize: '11.5px', maxWidth: '360px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, title: r.target }, r.target),
        el('td', {}, el('span', { class: 'chip', style: { background: r.status < 400 ? '#E7F5EC' : '#FDECEA', color: r.status < 400 ? '#1E6B3A' : '#B42318' } }, r.status < 400 ? 'OK' : String(r.status))),
        el('td', { class: 'muted mono', style: { fontSize: '11.5px' } }, r.ip)))))) : el('div', { class: 'empty' }, el('p', {}, 'No matching events.')));
  };
  let t = null;
  q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(load, 250); });
  load().catch((e) => panel.replaceChildren(errBox(e)));
}
