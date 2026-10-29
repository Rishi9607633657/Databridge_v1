/* DataBridge data quality: rules per table (Catalog › table › Quality), runs and results, and an overview in Governance. */
'use strict';

const DQ_STATUS = { PASSED: ['good', 'Passed'], WARN: ['warn', 'Warnings'], FAILED: ['bad', 'Failed'], ERROR: ['bad', 'Error'],
  pass: ['good', 'Pass'], warn: ['warn', 'Warning'], fail: ['bad', 'Fail'], error: ['bad', 'Error'] };
const dqChip = (s) => { const m = DQ_STATUS[s] || ['', s]; return el('span', { class: `chip ${m[0]}` }, m[1]); };

function dqRuleDialog(fq, columns, types, rule) {
  const r = rule || { rule_type: 'not_null', col: '', params: {}, severity: 'fail', name: '' };
  return openDialog((close) => {
    const type = el('select', { class: 'field', 'aria-label': 'Rule type' }, Object.entries(types).map(([k, l]) => el('option', { value: k, selected: k === r.rule_type }, l)));
    const col = el('select', { class: 'field', 'aria-label': 'Column' }, (columns || []).map((c) => el('option', { value: c.name, selected: c.name === r.col }, `${c.name}  (${c.type})`)));
    const p = r.params || {};
    const mn = el('input', { class: 'field', value: p.min ?? '', placeholder: 'minimum' });
    const mx = el('input', { class: 'field', value: p.max ?? '', placeholder: 'maximum' });
    const vals = el('input', { class: 'field', value: (p.values || []).join(', '), placeholder: 'PAID, FAILED, REFUNDED' });
    const pat = el('input', { class: 'field mono', value: p.pattern || '', placeholder: '^[0-9]{10}$' });
    const hours = el('input', { class: 'field', value: p.max_hours ?? 24, placeholder: '24' });
    const expr = el('input', { class: 'field mono', value: p.expr || '', placeholder: "amount >= 0 AND currency IN ('INR', 'USD')" });
    const sql = el('textarea', { class: 'field mono', rows: 4, placeholder: `SELECT count(*) FROM ${fq} o LEFT JOIN sales.customers c ON o.customer_id = c.customer_id WHERE c.customer_id IS NULL` }, p.sql || '');
    const allowed = el('input', { class: 'field', value: p.max_bad_pct ?? 0, style: { width: '110px' } });
    const sev = el('select', { class: 'field' }, [['fail', 'Fail (stops a job using dbutils.quality.check)'], ['warn', 'Warn only']].map(([v, l]) => el('option', { value: v, selected: v === r.severity }, l)));
    const name = el('input', { class: 'field', value: r.name || '', placeholder: 'optional — e.g. Every order has a customer' });
    const body = el('div', { class: 'stack', style: { gap: '12px' } });
    const L = (label, ...k) => el('label', { class: 'lbl' }, label, ...k);
    const draw = () => {
      const t = type.value;
      const needsCol = ['not_null', 'unique', 'between', 'in_set', 'regex', 'freshness'].includes(t);
      setKids(body, needsCol ? L('Column', col) : null,
        t === 'between' ? el('div', { class: 'row' }, L('Minimum', mn), L('Maximum', mx)) : null,
        t === 'row_count' ? el('div', { class: 'row' }, L('At least', mn), L('At most (optional)', mx)) : null,
        t === 'in_set' ? L('Allowed values (comma separated)', vals) : null,
        t === 'regex' ? L('Pattern (regular expression)', pat) : null,
        t === 'freshness' ? L('Newest row is at most … hours old', hours) : null,
        t === 'expression' ? L('Every row must meet', expr) : null,
        t === 'custom_sql' ? L('Query returning the number of bad rows', sql) : null,
        ['not_null', 'unique', 'between', 'in_set', 'regex', 'expression'].includes(t) ? L('Allowed bad rows (%)', allowed) : null);
    };
    type.addEventListener('change', draw); draw();
    const submit = (e) => {
      e.preventDefault();
      const t = type.value;
      const params = { max_bad_pct: Number(allowed.value || 0) };
      if (t === 'between' || t === 'row_count') { params.min = mn.value; params.max = mx.value; }
      if (t === 'in_set') params.values = vals.value;
      if (t === 'regex') params.pattern = pat.value;
      if (t === 'freshness') params.max_hours = hours.value;
      if (t === 'expression') params.expr = expr.value;
      if (t === 'custom_sql') params.sql = sql.value;
      close({ object: fq, rule_type: t, col: col.value, params, severity: sev.value, name: name.value });
    };
    return el('form', { class: 'dlg', onSubmit: submit }, el('h2', {}, rule ? 'Edit rule' : 'Add a quality rule'),
      L('Check', type), body, L('When it fails', sev), L('Name', name),
      el('div', { class: 'actions' }, btn('Cancel', () => close(null)), el('button', { type: 'submit', class: 'btn primary' }, rule ? 'Save' : 'Add rule')));
  });
}

function dqResults(run) {
  if (!run) return null;
  return el('div', { class: 'dq-res' }, el('div', { class: 'row', style: { marginBottom: '8px', flexWrap: 'wrap' } }, dqChip(run.status),
    el('span', { class: 'muted small' }, `${fmtTime(run.time * 1000)} · ${run.trigger} · ${(run.rows || 0).toLocaleString()} rows checked in ${run.duration}s · ${run.passed} passed, ${run.warned} warnings, ${run.failed} failed`)),
  run.error ? el('div', { class: 'error-box' }, run.error) : null,
  (run.results || []).map((x) => el('div', { class: `dq-row s-${x.status}` }, dqChip(x.status),
    el('div', { class: 'grow' }, el('b', {}, x.name), el('div', { class: 'muted small' }, [
      x.bad != null ? `${x.bad.toLocaleString()} bad row${x.bad === 1 ? '' : 's'}${x.pct != null ? ` (${x.pct}%)` : ''}` : null,
      x.value != null ? `value: ${x.value}` : null, x.error || null].filter(Boolean).join(' · ')),
    x.sample && x.sample.rows.length ? el('details', {}, el('summary', { class: 'small' }, 'Show examples'), grid(x.sample)) : null))));
}

async function dqTab(pane, db, tbl, t) {
  const fq = `${db}.${tbl}`.toLowerCase();
  const canEdit = CURRENT_USER && CURRENT_USER.role !== 'viewer';
  let d;
  try { d = await api(`/api/quality/table?object=${enc(fq)}`); } catch (e) { setKids(pane, errBox(e)); return; }
  const reload = () => dqTab(pane, db, tbl, t);
  const latest = d.runs[0] ? await api(`/api/quality/runs/${d.runs[0].id}`).catch(() => null) : null;
  const add = async (rule) => {
    const v = await dqRuleDialog(fq, t.columns, d.types, rule);
    if (!v) return;
    try { await api(rule ? `/api/quality/rules/${rule.id}` : '/api/quality/rules', { method: rule ? 'PUT' : 'POST', body: v }); toast('Rule saved'); reload(); }
    catch (e) { toast(e.message, 'err'); }
  };
  const runNow = async () => {
    try { toast('Checking…'); await api('/api/quality/run', { method: 'POST', body: { object: fq } }); reload(); } catch (e) { toast(e.message, 'err'); }
  };
  const settings = async () => {
    const s = d.settings;
    const v = await formDialog({ title: 'Schedule and notifications', fields: [
      { name: 'schedule', label: 'Check on a schedule (cron, empty = only on demand / from code)', value: s.schedule || '', required: false, placeholder: '0 7 * * *' },
      { name: 'timezone', label: 'Time zone', value: s.timezone || 'Asia/Kolkata' },
      { name: 'notify', label: 'Notify', type: 'select', value: s.notify || 'fail', options: [['fail', 'When checks fail'], ['always', 'After every run'], ['never', 'Never']] },
      ...destFields(s.dest)] });
    if (!v) return;
    try { await api(`/api/quality/table?object=${enc(fq)}`, { method: 'PUT', body: { schedule: v.schedule, timezone: v.timezone, notify: v.notify, dest: destFrom(v) } }); toast('Saved'); reload(); }
    catch (e) { toast(e.message, 'err'); }
  };
  const toggle = (r) => async () => { await api(`/api/quality/rules/${r.id}`, { method: 'PUT', body: { enabled: !r.enabled } }); reload(); };
  const del = (r) => async () => { if (await confirmDialog('Delete this rule?', r.text)) { await api(`/api/quality/rules/${r.id}`, { method: 'DELETE' }); reload(); } };
  setKids(pane, el('section', { class: 'panel', style: { marginBottom: '16px' } }, el('div', { class: 'panel-head' }, el('h3', { class: 'grow' }, `Rules (${d.rules.length})`),
    el('span', { class: 'muted small' }, d.settings.schedule ? cronText(d.settings.schedule, d.settings.timezone) : 'On demand'),
    canEdit ? btn('Schedule', settings, { cls: 'sm', ic: 'history' }) : null,
    d.rules.length ? btn('Run checks', runNow, { cls: 'sm', ic: 'play' }) : null,
    canEdit ? btn('Add rule', () => add(null), { cls: 'sm primary', ic: 'plus' }) : null),
  d.rules.length ? el('table', { class: 't' }, el('thead', {}, el('tr', {}, ['Rule', 'Type', 'If it fails', 'On', ''].map((h) => el('th', {}, h)))),
    el('tbody', {}, d.rules.map((r) => el('tr', {}, el('td', {}, el('b', {}, r.name || r.text), r.name ? el('div', { class: 'muted small' }, r.text) : null),
      el('td', { class: 'muted' }, r.type_label), el('td', {}, r.severity === 'fail' ? el('span', { class: 'chip bad' }, 'Fail') : el('span', { class: 'chip warn' }, 'Warn')),
      el('td', {}, canEdit ? el('label', { class: 'switch' }, el('input', { type: 'checkbox', checked: r.enabled, onChange: toggle(r), 'aria-label': 'Rule on' })) : (r.enabled ? 'On' : 'Off')),
      el('td', { style: { textAlign: 'right', whiteSpace: 'nowrap' } }, canEdit ? [btn('', () => add(r), { cls: 'ghost icon sm', ic: 'edit', title: 'Edit' }),
        btn('', del(r), { cls: 'ghost icon sm', ic: 'trash', title: 'Delete' })] : null)))))
    : el('div', { class: 'empty' }, el('p', {}, 'No rules yet. Add checks like “order_id is unique”, “amount is between 0 and 10,00,000” or “newest order is less than 24 hours old”.'))),
  el('section', { class: 'panel' }, el('div', { class: 'panel-head' }, el('h3', { class: 'grow' }, 'Latest run'),
    el('span', { class: 'muted small' }, 'In a notebook or job: ', el('code', {}, `dbutils.quality.check("${fq}")`), ' — the task fails when a “Fail” rule fails')),
  el('div', { style: { padding: '12px 18px' } }, latest ? dqResults(latest) : el('p', { class: 'muted', style: { margin: 0 } }, 'Not checked yet.'),
    d.runs.length > 1 ? el('div', { class: 'dq-hist' }, el('h4', {}, 'History'), d.runs.slice(0, 20).map((r) => el('button', { type: 'button', class: 'dq-dot', title: `${r.status} · ${fmtTime(r.time * 1000)}`,
      onClick: async () => { const full = await api(`/api/quality/runs/${r.id}`); openDialog((close) => el('div', { class: 'dlg' }, el('h2', {}, `Check of ${fq}`), dqResults(full), el('div', { class: 'actions' }, btn('Close', () => close(null))))); } },
    dqChip(r.status)))) : null)));
}

window.CAT_EXTRA_TABS = window.CAT_EXTRA_TABS || [];
window.CAT_EXTRA_TABS.push({ label: 'Quality', render: dqTab });

window.GOV_TABS = window.GOV_TABS || [];
window.GOV_TABS.push({ key: 'quality', label: 'Data quality', async render(pane) {
  let d;
  try { d = await api('/api/quality/overview'); } catch (e) { setKids(pane, errBox(e)); return; }
  setKids(pane, el('section', { class: 'panel' }, el('div', { class: 'panel-head' }, el('h2', { class: 'grow' }, 'Tables with quality rules')),
    d.tables.length ? el('table', { class: 't' }, el('thead', {}, el('tr', {}, ['Table', 'Rules', 'Last check', 'Result', 'Schedule'].map((h) => el('th', {}, h)))),
      el('tbody', {}, d.tables.map((x) => { const [db, tb] = x.object.split('.');
        return el('tr', { class: 'clickable', onClick: () => (location.hash = `#/catalog?db=${enc(db)}&table=${enc(tb)}&tab=quality`) },
          el('td', { class: 'mono' }, x.object), el('td', {}, x.rules), el('td', { class: 'muted' }, x.last ? ago(x.last.time * 1000) : '—'),
          el('td', {}, x.last ? [dqChip(x.last.status), el('span', { class: 'muted small', style: { marginLeft: '8px' } }, `${x.last.failed} failed · ${x.last.warned} warn`)] : '—'),
          el('td', { class: 'muted' }, x.schedule ? cronText(x.schedule, x.timezone) : 'On demand')); })))
      : el('div', { class: 'empty' }, el('p', {}, 'No quality rules yet. Open a table in the Catalog › Quality to add some.'))));
} });
