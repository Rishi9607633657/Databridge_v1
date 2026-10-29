/* DataBridge cost control: monthly budgets (warn / stop), and customer invoices from metered cluster usage. */
'use strict';

/* Shared: notification destination fields for formDialog, and reading them back. */
function destFields(d = {}) {
  return [
    { name: 'emails', label: 'E-mail to (comma separated)', value: (d.emails || []).join(', '), required: false, placeholder: 'ops@company.com, owner@company.com' },
    { name: 'slack', label: 'Slack', type: 'select', value: d.slack && d.slack !== 'default' ? 'custom' : (d.slack || ''), options: [['', 'No Slack'], ['default', 'Slack — default channel (Admin › Settings)'], ['custom', 'Slack — other webhook below']] },
    { name: 'teams', label: 'Microsoft Teams', type: 'select', value: d.teams && d.teams !== 'default' ? 'custom' : (d.teams || ''), options: [['', 'No Teams'], ['default', 'Teams — default channel (Admin › Settings)'], ['custom', 'Teams — other webhook below']] },
    { name: 'hook', label: 'Other webhook URL (Slack or Teams, optional)', value: [d.slack, d.teams].find((x) => x && x !== 'default') || '', required: false, placeholder: 'https://hooks.slack.com/… or https://…logic.azure.com/…' },
  ];
}
function destFrom(v) {
  const pick = (k) => (v[k] === 'custom' ? v.hook : v[k]) || '';
  return { emails: (v.emails || '').split(/[,;\s]+/).filter(Boolean), slack: pick('slack'), teams: pick('teams') };
}
function destText(d = {}) {
  const parts = [];
  if ((d.emails || []).length) parts.push(`${d.emails.length} e-mail${d.emails.length === 1 ? '' : 's'}`);
  if (d.slack) parts.push('Slack');
  if (d.teams) parts.push('Teams');
  return parts.join(', ') || 'Nobody';
}

async function budgetsPanel(panel) {
  let data;
  try { data = await api('/api/budgets'); } catch (e) { setKids(panel, errBox(e)); return; }
  const reload = () => budgetsPanel(panel);
  let cl = [];
  try { cl = (await api('/api/clusters')).clusters; } catch { /* ignore */ }
  const edit = async (b) => {
    const v = await formDialog({
      title: b ? 'Edit budget' : 'New budget',
      intro: 'A monthly limit on cluster spend. At the warning level DataBridge notifies; at 100% it notifies and can stop the clusters in scope until next month.',
      fields: [
        { name: 'name', label: 'Name', value: b?.name || '', placeholder: 'e.g. Acme Retail — monthly' },
        { name: 'scope', label: 'Applies to', type: 'select', value: b?.scope || 'all', options: [['all', 'All clusters'], ['cluster', 'One cluster'], ['user', 'One user'], ['company', 'One company (users’ Company field)']] },
        { name: 'scope_value', label: 'Cluster name / user name / company (empty for all)', value: b?.scope_value || '', required: false, placeholder: cl.map((c) => c.name).slice(0, 3).join(', ') },
        { name: 'amount', label: 'Monthly amount', value: String(b?.amount || ''), placeholder: '50000' },
        { name: 'basis', label: 'Count', type: 'select', value: b?.basis || 'cost', options: [['cost', 'Cloud cost (price × node-hours)'], ['charge', 'Charge (cost + markup)']] },
        { name: 'warn_pct', label: 'Warn at (%)', value: String(b?.warn_pct || 80) },
        { name: 'action', label: 'At 100%', type: 'select', value: b?.action || 'notify', options: [['notify', 'Notify only'], ['stop', 'Notify and stop the clusters until next month']] },
        ...destFields(b?.dest),
      ],
    });
    if (!v) return;
    try {
      await api(b ? `/api/budgets/${b.id}` : '/api/budgets', { method: b ? 'PUT' : 'POST', body: { ...v, amount: Number(v.amount), warn_pct: Number(v.warn_pct), dest: destFrom(v) } });
      toast('Budget saved'); reload();
    } catch (e) { toast(e.message, 'err'); }
  };
  const del = async (b) => {
    if (!(await confirmDialog(`Delete budget ${b.name}?`, 'Spend is no longer watched for this scope.'))) return;
    await api(`/api/budgets/${b.id}`, { method: 'DELETE' }); reload();
  };
  const lift = async (b) => { await api(`/api/budgets/${b.id}/lift`, { method: 'POST' }); toast('Block lifted for this month'); reload(); };
  const checkNow = async () => { try { await api('/api/budgets/check', { method: 'POST' }); toast('Budgets checked'); reload(); } catch (e) { toast(e.message, 'err'); } };
  const bar = (b) => {
    const pct = Math.min(100, b.pct);
    const tone = b.pct >= 100 ? 'var(--bad, #d64545)' : b.pct >= b.warn_pct ? 'var(--warn, #d99a1a)' : 'var(--ok, #1f9d6b)';
    return el('div', { class: 'bud-bar', role: 'meter', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(b.pct), 'aria-label': `${b.name} spend` },
      el('span', { style: { width: `${pct}%`, background: tone } }), el('i', { style: { left: `${b.warn_pct}%` }, title: `Warn at ${b.warn_pct}%` }));
  };
  const sc = (b) => (b.scope === 'all' ? 'All clusters' : `${({ cluster: 'Cluster', user: 'User', company: 'Company' })[b.scope]}: ${b.scope_value}`);
  const notSet = !data.notify.email && !data.notify.slack && !data.notify.teams;
  setKids(panel, el('div', { class: 'panel-head' }, el('h2', { class: 'grow' }, 'Budgets'),
    btn('Check now', checkNow, { cls: 'sm', ic: 'refresh' }), btn('New budget', () => edit(null), { cls: 'sm primary', ic: 'plus' })),
  notSet ? el('p', { class: 'muted small', style: { padding: '0 16px' } }, 'Set up e-mail, Slack or Teams in Admin › Settings › Notifications so budget alerts reach someone.') : null,
  data.budgets.length ? el('div', { class: 'tbl-wrap' }, el('table', { class: 't' },
    el('thead', {}, el('tr', {}, ['Budget', 'Applies to', 'This month', '', 'At 100%', 'Notify', ''].map((h) => el('th', {}, h)))),
    el('tbody', {}, data.budgets.map((b) => el('tr', {},
      el('td', {}, el('b', {}, b.name)), el('td', { class: 'muted' }, sc(b)),
      el('td', { style: { minWidth: '180px' } }, bar(b), el('div', { class: 'muted small' }, `${b.spend.toLocaleString()} of ${b.amount.toLocaleString()} · ${b.pct}%${b.basis === 'charge' ? ' (charge)' : ''}`)),
      el('td', {}, b.blocked ? el('span', { class: 'chip bad' }, 'Stopped') : b.exceeded ? el('span', { class: 'chip bad' }, 'Reached') : b.warned ? el('span', { class: 'chip warn' }, 'Warning sent') : el('span', { class: 'chip' }, 'OK')),
      el('td', { class: 'muted' }, b.action === 'stop' ? 'Stop clusters' : 'Notify'), el('td', { class: 'muted small' }, destText(b.dest)),
      el('td', { style: { textAlign: 'right', whiteSpace: 'nowrap' } },
        b.blocked ? btn('Lift block', () => lift(b), { cls: 'sm' }) : null,
        btn('', () => edit(b), { cls: 'ghost icon sm', ic: 'edit', title: 'Edit' }),
        btn('', () => del(b), { cls: 'ghost icon sm', ic: 'trash', title: 'Delete' })))))))
    : el('div', { class: 'empty' }, el('p', {}, 'No budgets. Add one to get warned before spend runs over — and optionally stop clusters at the limit.')));
}

async function invoicesPanel(panel, month, by) {
  month = month || new Date().toISOString().slice(0, 7);
  by = by || 'company';
  let d;
  try { d = await api(`/api/invoices?month=${month}&by=${by}`); } catch (e) { setKids(panel, errBox(e)); return; }
  const monthIn = el('input', { class: 'field', type: 'month', value: month, style: { width: '160px' }, 'aria-label': 'Invoice month' });
  monthIn.addEventListener('change', () => invoicesPanel(panel, monthIn.value, by));
  const bySel = el('select', { class: 'field', style: { width: '160px' }, 'aria-label': 'Invoice per' }, [['company', 'Per company'], ['user', 'Per user']].map(([v, l]) => el('option', { value: v, selected: v === by }, l)));
  bySel.addEventListener('change', () => invoicesPanel(panel, month, bySel.value));
  const open = (c) => window.open(`/api/invoices/view?month=${month}&by=${by}&customer=${enc(c.customer)}`, '_blank', 'noopener');
  setKids(panel, el('div', { class: 'panel-head' }, el('h2', { class: 'grow' }, 'Invoices'), bySel, monthIn),
    d.customers.length ? el('div', { class: 'tbl-wrap' }, el('table', { class: 't' },
      el('thead', {}, el('tr', {}, ['Customer', 'Node-hours', 'Cloud cost', 'Charge', ''].map((h) => el('th', {}, h)))),
      el('tbody', {}, d.customers.map((c) => el('tr', {}, el('td', {}, el('b', {}, c.customer)), el('td', {}, c.node_hours),
        el('td', {}, `${c.currency}${c.cost.toLocaleString()}`), el('td', {}, el('b', {}, `${c.currency}${c.charge.toLocaleString()}`)),
        el('td', { style: { textAlign: 'right' } }, btn('Invoice', () => open(c), { cls: 'sm', ic: 'download' })))))))
      : el('div', { class: 'empty' }, el('p', {}, 'No metered usage this month.')),
    el('p', { class: 'muted small', style: { padding: '0 16px 12px' } }, 'Customers are the Company field of each user (Admin › Users), or the user when no company is set. Your company name, address, tax ID and tax % go in Admin › Settings › Invoices. Open an invoice and use Print › Save as PDF.'));
}
