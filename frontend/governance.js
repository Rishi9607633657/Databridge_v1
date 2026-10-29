/* DataBridge Governance: table permissions, column masks, row filters, "test as", and the BI tools connection dialog.
   Other modules add tabs with window.GOV_TABS.push({ key, label, render(pane) }). */
'use strict';

window.GOV_TABS = window.GOV_TABS || [];
const PRINCIPAL_HELP = 'everyone · user:amit@acme.com · role:viewer · company:acme';

function principalText(p) {
  if (p === 'everyone') return 'Everyone';
  const [k, v] = p.split(/:(.*)/s);
  return `${({ user: 'User', role: 'Role', company: 'Company' })[k] || k}: ${v}`;
}

async function tablePicker(value = '') {
  const inp = el('input', { class: 'field mono', value, placeholder: 'schema.table', list: 'gov-tables', 'aria-label': 'Table' });
  if (!document.getElementById('gov-tables')) {
    const dl = el('datalist', { id: 'gov-tables' });
    document.body.append(dl);
    try {
      const dbs = await api('/api/catalog/databases');
      for (const d of dbs.slice(0, 60)) {
        try { (await api(`/api/catalog/databases/${enc(d.name)}/tables`)).forEach((t) => dl.append(el('option', { value: `${d.name}.${t.name}` }))); } catch { /* skip */ }
      }
    } catch { /* ignore */ }
  }
  return inp;
}

async function viewGovernance(main, r) {
  main.append(el('div', { class: 'page-head' }, el('div', { class: 'grow' }, el('h1', {}, 'Governance'),
    el('p', { class: 'muted small', style: { margin: '2px 0 0' } }, 'Who can read which tables, which columns are masked and which rows each person sees. Applies to SQL, dashboards, Ask data, alerts and BI tools.')),
  btn('Connect BI tools', () => biConnectDialog(), { ic: 'plug' })));
  const tabs = [['permissions', 'Permissions'], ['masks', 'Column masks'], ['filters', 'Row filters'], ['test', 'Test as a user'],
    ...window.GOV_TABS.map((t) => [t.key, t.label])];
  const cur = r.params.get('tab') || 'permissions';
  main.append(el('div', { class: 'tabs', role: 'tablist' }, tabs.map(([k, l]) => el('button', { type: 'button', role: 'tab', 'aria-selected': String(k === cur),
    onClick: () => (location.hash = `#/governance?tab=${k}`) }, l))));
  const pane = el('div', {}, loading());
  main.append(pane);
  const extra = window.GOV_TABS.find((t) => t.key === cur);
  if (extra) { setKids(pane); return extra.render(pane); }
  let d;
  try { d = await api('/api/governance'); } catch (e) { setKids(pane, errBox(e)); return; }
  const del = (kind, id) => async () => { await api(`/api/governance/${kind}/${id}`, { method: 'DELETE' }); render(); };
  const exemptText = (x) => (x.exempt || []).length ? x.exempt.map(principalText).join(', ') : '—';

  if (cur === 'permissions') {
    const add = async () => {
      const v = await formDialog({ title: 'Grant access', intro: `Who: ${PRINCIPAL_HELP}`, fields: [
        { name: 'principal', label: 'Who', value: 'role:viewer' },
        { name: 'object', label: 'What (* = everything, a schema, or schema.table)', value: '' },
        { name: 'privilege', label: 'Access', type: 'select', value: 'SELECT', options: [['SELECT', 'Read (SELECT)'], ['MODIFY', 'Change (INSERT, UPDATE, CREATE, DROP)'], ['ALL', 'Read and change']] }] });
      if (!v) return;
      try { await api('/api/governance/grants', { method: 'POST', body: v }); toast('Access granted'); render(); } catch (e) { toast(e.message, 'err'); }
    };
    setKids(pane, el('div', { class: `gov-banner ${d.require_grants ? 'on' : ''}` }, icon('shield', 20),
      el('div', { class: 'grow' }, el('b', {}, d.require_grants ? 'Table grants are required.' : 'Table grants are not required yet.'),
        el('div', { class: 'small' }, d.require_grants ? 'Editors and viewers can only read and change what is granted below. Admins always have full access.'
          : 'Everyone signed in can read every table. Add grants below, then turn on “Require table grants” in Admin › Settings › Governance.'))),
    el('section', { class: 'panel' }, el('div', { class: 'panel-head' }, el('h2', { class: 'grow' }, 'Grants'), btn('Grant access', add, { cls: 'sm primary', ic: 'plus' })),
      d.grants.length ? el('table', { class: 't' }, el('thead', {}, el('tr', {}, ['Who', 'What', 'Access', 'Added', ''].map((h) => el('th', {}, h)))),
        el('tbody', {}, d.grants.map((g) => el('tr', {}, el('td', {}, el('b', {}, principalText(g.principal))), el('td', { class: 'mono' }, g.object === '*' ? '* (everything)' : g.object),
          el('td', {}, el('span', { class: 'chip' }, g.privilege)), el('td', { class: 'muted small' }, `${ago(g.created * 1000)} by ${g.created_by || '—'}`),
          el('td', { style: { textAlign: 'right' } }, btn('', del('grants', g.id), { cls: 'ghost icon sm', ic: 'trash', title: 'Remove' }))))))
        : el('div', { class: 'empty' }, el('p', {}, 'No grants yet.'))));
  } else if (cur === 'masks') {
    const add = async () => {
      const tbl = await tablePicker();
      const col = el('input', { class: 'field mono', placeholder: 'column name' });
      const method = el('select', { class: 'field' }, Object.entries(d.mask_methods).map(([k, l]) => el('option', { value: k }, l)));
      const expr = el('input', { class: 'field mono', placeholder: "concat(left({col}, 2), '***')", hidden: true });
      const exempt = el('input', { class: 'field mono', placeholder: 'role:editor, user:finance@acme.com' });
      method.addEventListener('change', () => { expr.hidden = method.value !== 'custom'; });
      const v = await openDialog((close) => el('form', { class: 'dlg', onSubmit: (e) => { e.preventDefault(); close({ object: tbl.value, column: col.value, method: method.value, expr: expr.value, exempt: exempt.value }); } },
        el('h2', {}, 'Mask a column'), el('label', { class: 'lbl' }, 'Table', tbl), el('label', { class: 'lbl' }, 'Column', col),
        el('label', { class: 'lbl' }, 'Show instead', method, expr), el('label', { class: 'lbl' }, 'Who still sees the real value (optional)', exempt),
        el('p', { class: 'muted small' }, 'Admins always see real values.'),
        el('div', { class: 'actions' }, btn('Cancel', () => close(null)), el('button', { type: 'submit', class: 'btn primary' }, 'Add mask'))));
      if (!v) return;
      try { await api('/api/governance/masks', { method: 'POST', body: v }); toast('Mask added'); render(); } catch (e) { toast(e.message, 'err'); }
    };
    setKids(pane, el('section', { class: 'panel' }, el('div', { class: 'panel-head' }, el('h2', { class: 'grow' }, 'Column masks'), btn('Mask a column', add, { cls: 'sm primary', ic: 'plus' })),
      d.masks.length ? el('table', { class: 't' }, el('thead', {}, el('tr', {}, ['Table', 'Column', 'Shown as', 'Sees real value', ''].map((h) => el('th', {}, h)))),
        el('tbody', {}, d.masks.map((m) => el('tr', {}, el('td', { class: 'mono' }, m.object), el('td', { class: 'mono' }, m.col),
          el('td', {}, m.method === 'custom' ? el('span', { class: 'mono small' }, m.expr) : d.mask_methods[m.method]), el('td', { class: 'muted small' }, exemptText(m)),
          el('td', { style: { textAlign: 'right' } }, btn('', del('masks', m.id), { cls: 'ghost icon sm', ic: 'trash', title: 'Remove' }))))))
        : el('div', { class: 'empty' }, el('p', {}, 'No masked columns. Mask phone numbers, e-mails, PAN or salary columns so only the right people see them.'))));
  } else if (cur === 'filters') {
    const add = async () => {
      const tbl = await tablePicker();
      const pred = el('input', { class: 'field mono', placeholder: "tenant = {company}   or   region IN ('North', 'West')" });
      const desc = el('input', { class: 'field', placeholder: 'e.g. each customer sees only its own rows' });
      const exempt = el('input', { class: 'field mono', placeholder: 'role:editor' });
      const v = await openDialog((close) => el('form', { class: 'dlg', onSubmit: (e) => { e.preventDefault(); close({ object: tbl.value, predicate: pred.value, description: desc.value, exempt: exempt.value }); } },
        el('h2', {}, 'Row filter'), el('label', { class: 'lbl' }, 'Table', tbl), el('label', { class: 'lbl' }, 'Rows people may see (a SQL condition)', pred),
        el('p', { class: 'muted small', style: { margin: 0 } }, 'Use {company}, {username}, {email} or {role} — they become the values of the person running the query.'),
        el('label', { class: 'lbl' }, 'Description', desc), el('label', { class: 'lbl' }, 'Who sees all rows (optional)', exempt),
        el('div', { class: 'actions' }, btn('Cancel', () => close(null)), el('button', { type: 'submit', class: 'btn primary' }, 'Add filter'))));
      if (!v) return;
      try { await api('/api/governance/filters', { method: 'POST', body: v }); toast('Row filter added'); render(); } catch (e) { toast(e.message, 'err'); }
    };
    setKids(pane, el('section', { class: 'panel' }, el('div', { class: 'panel-head' }, el('h2', { class: 'grow' }, 'Row filters'), btn('Add row filter', add, { cls: 'sm primary', ic: 'plus' })),
      d.filters.length ? el('table', { class: 't' }, el('thead', {}, el('tr', {}, ['Table', 'Rows shown', 'Description', 'Sees all rows', ''].map((h) => el('th', {}, h)))),
        el('tbody', {}, d.filters.map((f) => el('tr', {}, el('td', { class: 'mono' }, f.object), el('td', { class: 'mono small' }, f.predicate),
          el('td', { class: 'muted' }, f.description || '—'), el('td', { class: 'muted small' }, exemptText(f)),
          el('td', { style: { textAlign: 'right' } }, btn('', del('filters', f.id), { cls: 'ghost icon sm', ic: 'trash', title: 'Remove' }))))))
        : el('div', { class: 'empty' }, el('p', {}, 'No row filters. Example: on a shared table with a tenant column, add  tenant = {company}  so each customer sees only its rows.'))));
  } else if (cur === 'test') {
    const role = el('select', { class: 'field' }, ['viewer', 'editor'].map((x) => el('option', { value: x }, x)));
    const uname = el('input', { class: 'field', placeholder: 'amit@acme.com' });
    const comp = el('input', { class: 'field', placeholder: 'acme' });
    const q = el('textarea', { class: 'field mono', rows: 5 }, 'SELECT * FROM sales.customers LIMIT 10');
    const out = el('div', {});
    const go = async () => {
      setKids(out, loading());
      const p = await api('/api/governance/preview', { method: 'POST', body: { query: q.value, user: { username: uname.value, email: uname.value, role: role.value, company: comp.value } } });
      setKids(out, p.error ? el('div', { class: 'error-box' }, p.error) : [el('h3', {}, 'Query that runs for this person'), el('pre', { class: 'code' }, p.sql)]);
    };
    setKids(pane, el('section', { class: 'panel al-card' }, el('p', { class: 'muted', style: { margin: 0 } }, 'See exactly how a query is rewritten for someone — which masks and row filters apply, or why it is refused.'),
      el('div', { class: 'row', style: { flexWrap: 'wrap' } }, el('label', { class: 'lbl' }, 'User name / e-mail', uname), el('label', { class: 'lbl' }, 'Role', role), el('label', { class: 'lbl' }, 'Company', comp)),
      el('label', { class: 'lbl' }, 'Query', q), el('div', {}, btn('Show rewritten query', go, { cls: 'primary', ic: 'play' })), out));
  }
}

async function biConnectDialog() {
  let info = { odata_url: `${location.origin}/api/odata/`, query_url: `${location.origin}/api/bi/query` };
  try { info = await api('/api/bi/info'); } catch { /* defaults */ }
  const copyRow = (label, value) => el('div', { class: 'bi-row' }, el('div', { class: 'muted small' }, label),
    el('div', { class: 'row' }, el('code', { class: 'grow bi-code' }, value), btn('Copy', () => navigator.clipboard.writeText(value).then(() => toast('Copied')), { cls: 'sm', ic: 'copy' })));
  const user = CURRENT_USER ? (CURRENT_USER.email || CURRENT_USER.username) : 'your user name';
  return openDialog((close) => el('div', { class: 'dlg bi-dlg' }, el('h2', {}, 'Connect Power BI, Excel or Tableau'),
    copyRow('OData feed URL', info.odata_url),
    el('ol', { class: 'bi-steps' },
      el('li', {}, el('b', {}, 'Create an access token: '), 'your name (bottom left) › API tokens › New token. Copy it.'),
      el('li', {}, el('b', {}, 'Power BI Desktop: '), 'Get data › OData feed › paste the URL › Basic: user name ', el('code', {}, user), ', password = the token. Pick tables in the Navigator.'),
      el('li', {}, el('b', {}, 'Excel: '), 'Data › Get Data › From Other Sources › From OData Feed › same URL and Basic sign-in.'),
      el('li', {}, el('b', {}, 'Tableau: '), 'Connect › OData › same URL, user name and token.'),
      el('li', {}, el('b', {}, 'Scheduled refresh in the Power BI service: '), 'publish, then Dataset settings › Data source credentials › Basic. DataBridge must be reachable on its public URL (or through an on-premises data gateway).')),
    el('h3', {}, 'Your own SQL as a web query'),
    copyRow('CSV of any SELECT (Power BI: Get data › Web, Basic sign-in)', `${info.query_url}?sql=${encodeURIComponent('SELECT * FROM sales.orders LIMIT 1000')}`),
    el('p', { class: 'muted small' }, `Everything goes through Governance as that person: grants, column masks and row filters apply. Feed pages hold ${(info.page_size || 5000).toLocaleString()} rows; the tools follow the next-page links.`),
    el('div', { class: 'actions' }, btn('Close', () => close(null), { cls: 'primary' }))));
}

window.EXTRA_ROUTES = Object.assign(window.EXTRA_ROUTES || {}, { governance: viewGovernance });

/* Catalog › table › Access tab (admins) */
window.CAT_EXTRA_TABS = window.CAT_EXTRA_TABS || [];
window.CAT_EXTRA_TABS.push({ label: 'Access', when: () => CURRENT_USER && ['admin', 'super_admin'].includes(CURRENT_USER.role), async render(pane, db, tbl) {
  const fq = `${db}.${tbl}`.toLowerCase();
  const p = await api(`/api/governance/table?fq=${enc(fq)}`);
  const row = (cells) => el('tr', {}, cells.map((c) => el('td', {}, c)));
  setKids(pane, el('section', { class: 'panel' }, el('div', { class: 'panel-head' }, el('h3', { class: 'grow' }, `Who can see ${fq}`),
    btn('Manage in Governance', () => (location.hash = '#/governance'), { cls: 'sm', ic: 'shield' })),
  el('table', { class: 't' }, el('thead', {}, el('tr', {}, ['Rule', 'Details', 'Applies to'].map((h) => el('th', {}, h)))), el('tbody', {},
    p.grants.map((g) => row([el('span', { class: 'chip' }, `Grant ${g.privilege}`), g.object === '*' ? 'All tables' : g.object, principalText(g.principal)])),
    p.masks.map((m) => row([el('span', { class: 'chip warn' }, 'Mask'), el('span', { class: 'mono' }, m.col), `Everyone except ${(m.exempt || []).map(principalText).join(', ') || 'admins'}`])),
    p.filters.map((f) => row([el('span', { class: 'chip teal' }, 'Row filter'), el('span', { class: 'mono small' }, f.predicate), `Everyone except ${(f.exempt || []).map(principalText).join(', ') || 'admins'}`])),
    !p.grants.length && !p.masks.length && !p.filters.length ? el('tr', {}, el('td', { colspan: 3, class: 'muted' }, 'No rules for this table. Admins always see everything.')) : null))));
} });
