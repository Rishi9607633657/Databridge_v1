/* DataBridge SQL alerts: list, editor (query → preview → condition → schedule → who to tell) and check history. */
'use strict';

const ALERT_SCHEDULES = [['*/5 * * * *', 'Every 5 minutes'], ['*/15 * * * *', 'Every 15 minutes'], ['0 * * * *', 'Every hour'],
  ['0 9 * * *', 'Daily at 09:00'], ['0 9 * * 1-5', 'Weekdays at 09:00'], ['0 9 * * 1', 'Mondays at 09:00'], ['custom', 'Custom (cron)']];
const alertState = (s) => {
  const m = { TRIGGERED: ['bad', 'Triggered'], OK: ['good', 'OK'], ERROR: ['warn', 'Error'], UNKNOWN: ['', 'Not checked yet'] }[s] || ['', s];
  return el('span', { class: `chip ${m[0]}` }, m[1]);
};

async function viewAlerts(main) {
  const canEdit = CURRENT_USER && CURRENT_USER.role !== 'viewer';
  main.append(el('div', { class: 'page-head' }, el('div', { class: 'grow' }, el('h1', {}, 'Alerts'),
    el('p', { class: 'muted small', style: { margin: '2px 0 0' } }, 'A query, a condition and a schedule. DataBridge checks it and tells you by e-mail, Slack or Teams.')),
  canEdit ? btn('New alert', () => (location.hash = '#/alert/new'), { cls: 'primary', ic: 'plus' }) : null));
  const panel = el('section', { class: 'panel' }, loading());
  main.append(panel);
  const load = async () => {
    let d;
    try { d = await api('/api/alerts'); } catch (e) { setKids(panel, errBox(e)); return; }
    if (!d.alerts.length) {
      setKids(panel, el('div', { class: 'empty' }, icon('bell', 32), el('h2', {}, 'No alerts yet'),
        el('p', {}, 'Examples: failed orders today > 50 · no rows loaded into sales.orders since midnight · stock below reorder level.'),
        canEdit ? btn('Create an alert', () => (location.hash = '#/alert/new'), { cls: 'primary' }) : null));
      return;
    }
    setKids(panel, el('div', { class: 'tbl-wrap' }, el('table', { class: 't' },
      el('thead', {}, el('tr', {}, ['Alert', 'State', 'Condition', 'Last value', 'Schedule', 'Checked', 'Owner'].map((h) => el('th', {}, h)))),
      el('tbody', {}, d.alerts.map((a) => el('tr', { class: 'clickable', onClick: () => (location.hash = `#/alert/${a.id}`) },
        el('td', {}, el('b', {}, a.name), a.paused ? el('span', { class: 'chip', style: { marginLeft: '8px' } }, 'Paused') : null),
        el('td', {}, alertState(a.state)), el('td', { class: 'muted' }, a.condition),
        el('td', { class: 'mono', style: { fontSize: '12.5px' } }, a.last_value ?? '—'),
        el('td', { class: 'muted' }, cronText(a.schedule, a.timezone)), el('td', { class: 'muted' }, a.last_checked ? ago(a.last_checked * 1000) : '—'),
        el('td', { class: 'muted' }, a.owner || '—')))))));
  };
  await load();
  const t = setInterval(load, 15000);
  return () => clearInterval(t);
}

async function viewAlert(main, r) {
  const id = r.rest[0];
  const isNew = !id || id === 'new';
  let a = { name: '', query: sessionStorage.getItem('databridge.alertPrefill') || '', kind: 'value', col: '', op: '>', threshold: '', schedule: '*/15 * * * *',
    timezone: 'Asia/Kolkata', notify_when: 'change', notify_ok: true, dest: {}, paused: false, history: [] };
  sessionStorage.removeItem('databridge.alertPrefill');
  if (!isNew) {
    try { a = await api(`/api/alerts/${id}`); } catch (e) { main.append(errBox(e)); return; }
  }
  const mine = isNew || (CURRENT_USER && (['admin', 'super_admin'].includes(CURRENT_USER.role) || CURRENT_USER.username === a.owner));
  const canEdit = mine && CURRENT_USER && CURRENT_USER.role !== 'viewer';

  const name = el('input', { class: 'field', value: a.name, placeholder: 'e.g. Failed orders today', 'aria-label': 'Alert name' });
  const q = el('textarea', { class: 'field mono', rows: 7, spellcheck: false, 'aria-label': 'Query' }, a.query);
  const prev = el('div', { class: 'al-prev' });
  const kind = el('select', { class: 'field', 'aria-label': 'Condition type' }, [['value', 'A value crosses a threshold'], ['rows', 'The query returns rows / no rows'], ['changed', 'A value changes']].map(([v, l]) => el('option', { value: v, selected: v === a.kind }, l)));
  const col = el('select', { class: 'field', 'aria-label': 'Column' }, el('option', { value: a.col || '' }, a.col || 'First column'));
  const op = el('select', { class: 'field', style: { width: '90px' }, 'aria-label': 'Operator' }, ['>', '>=', '<', '<=', '==', '!='].map((o) => el('option', { value: o, selected: o === a.op }, o)));
  const rowsOp = el('select', { class: 'field', 'aria-label': 'Rows condition' }, [['!=', 'returns any rows'], ['==', 'returns no rows']].map(([v, l]) => el('option', { value: v, selected: v === a.op }, l)));
  const thr = el('input', { class: 'field', value: a.threshold, placeholder: '100', style: { width: '140px' }, 'aria-label': 'Threshold' });
  const condRow = el('div', { class: 'row al-cond' });
  const drawCond = () => {
    setKids(condRow, kind.value === 'value' ? [el('span', { class: 'muted' }, 'when'), col, op, thr]
      : kind.value === 'rows' ? [el('span', { class: 'muted' }, 'when the query'), rowsOp]
        : [el('span', { class: 'muted' }, 'when'), col, el('span', { class: 'muted' }, 'is different from the last check')]);
  };
  kind.addEventListener('change', drawCond); drawCond();
  const preset = ALERT_SCHEDULES.find(([v]) => v === a.schedule) ? a.schedule : 'custom';
  const sched = el('select', { class: 'field', 'aria-label': 'Schedule' }, ALERT_SCHEDULES.map(([v, l]) => el('option', { value: v, selected: v === preset }, l)));
  const cron = el('input', { class: 'field mono', value: a.schedule, style: { width: '160px' }, 'aria-label': 'Cron expression', hidden: preset !== 'custom' });
  sched.addEventListener('change', () => { cron.hidden = sched.value !== 'custom'; if (sched.value !== 'custom') cron.value = sched.value; });
  const tz = el('input', { class: 'field', value: a.timezone, style: { width: '170px' }, 'aria-label': 'Time zone' });
  const when = el('select', { class: 'field', 'aria-label': 'When to notify' }, [['change', 'Once, when it becomes triggered'], ['each', 'At every check while triggered']].map(([v, l]) => el('option', { value: v, selected: v === a.notify_when }, l)));
  const okToo = el('input', { type: 'checkbox', checked: a.notify_ok !== false });
  const paused = el('input', { type: 'checkbox', checked: !!a.paused });
  const d = a.dest || {};
  const emails = el('input', { class: 'field', value: (d.emails || []).join(', '), placeholder: 'ops@company.com, you@company.com', 'aria-label': 'E-mail to' });
  const slack = el('select', { class: 'field', 'aria-label': 'Slack' }, [['', 'No Slack'], ['default', 'Default Slack channel'], ['custom', 'Other webhook…']].map(([v, l]) => el('option', { value: v, selected: v === (d.slack && d.slack !== 'default' ? 'custom' : d.slack || '') }, l)));
  const slackUrl = el('input', { class: 'field mono', value: d.slack && d.slack !== 'default' ? d.slack : '', placeholder: 'https://hooks.slack.com/services/…', hidden: !(d.slack && d.slack !== 'default'), 'aria-label': 'Slack webhook URL' });
  const teams = el('select', { class: 'field', 'aria-label': 'Teams' }, [['', 'No Teams'], ['default', 'Default Teams channel'], ['custom', 'Other webhook…']].map(([v, l]) => el('option', { value: v, selected: v === (d.teams && d.teams !== 'default' ? 'custom' : d.teams || '') }, l)));
  const teamsUrl = el('input', { class: 'field mono', value: d.teams && d.teams !== 'default' ? d.teams : '', placeholder: 'https://…logic.azure.com/workflows/…', hidden: !(d.teams && d.teams !== 'default'), 'aria-label': 'Teams webhook URL' });
  slack.addEventListener('change', () => { slackUrl.hidden = slack.value !== 'custom'; });
  teams.addEventListener('change', () => { teamsUrl.hidden = teams.value !== 'custom'; });

  const setCols = (cols) => {
    const cur = col.value;
    setKids(col, ...cols.map((c, i) => el('option', { value: c, selected: c === cur || (!cur && i === 0) }, c)));
  };
  const preview = async () => {
    setKids(prev, loading('Running the query…'));
    try {
      const res = await api('/api/alerts/preview', { method: 'POST', body: { query: q.value } });
      setCols(res.columns);
      setKids(prev, el('div', { class: 'muted small' }, `${res.rows.length} row${res.rows.length === 1 ? '' : 's'} · ${res.elapsed}s · the alert looks at the first row`), grid(res));
    } catch (e) { setKids(prev, errBox(e)); }
  };
  const body = () => ({ name: name.value, query: q.value, kind: kind.value, col: kind.value === 'rows' ? '' : col.value,
    op: kind.value === 'rows' ? rowsOp.value : kind.value === 'changed' ? '!=' : op.value, threshold: thr.value,
    schedule: sched.value === 'custom' ? cron.value : sched.value, timezone: tz.value, notify_when: when.value, notify_ok: okToo.checked, paused: paused.checked,
    dest: { emails: emails.value.split(/[,;\s]+/).filter(Boolean), slack: slack.value === 'custom' ? slackUrl.value : slack.value, teams: teams.value === 'custom' ? teamsUrl.value : teams.value } });
  const save = async () => {
    try {
      const res = await api(isNew ? '/api/alerts' : `/api/alerts/${id}`, { method: isNew ? 'POST' : 'PUT', body: body() });
      toast('Alert saved');
      if (isNew) location.hash = `#/alert/${res.id}`; else render();
    } catch (e) { toast(e.message, 'err'); }
  };
  const checkNow = async () => {
    try { const res = await api(`/api/alerts/${id}/check`, { method: 'POST' }); toast(`Checked: ${res.state === 'TRIGGERED' ? 'triggered' : res.state.toLowerCase()}`); render(); }
    catch (e) { toast(e.message, 'err'); }
  };
  const del = async () => {
    if (!(await confirmDialog(`Delete alert ${a.name}?`, 'It stops being checked and its history is removed.'))) return;
    await api(`/api/alerts/${id}`, { method: 'DELETE' }); location.hash = '#/alerts';
  };

  const field = (label, ...kids) => el('label', { class: 'lbl' }, label, ...kids);
  main.append(el('div', { class: 'page-head' }, el('div', { class: 'grow' }, el('div', { class: 'crumbs' }, el('a', { href: '#/alerts' }, 'Alerts'), el('span', {}, '/')),
    el('div', { class: 'row', style: { marginTop: '4px' } }, el('h1', {}, isNew ? 'New alert' : a.name), isNew ? null : alertState(a.state))),
  !isNew && canEdit ? btn('Check now', checkNow, { ic: 'play' }) : null,
  !isNew && canEdit ? btn('Delete', del, { cls: 'danger', ic: 'trash' }) : null,
  canEdit ? btn(isNew ? 'Create alert' : 'Save', save, { cls: 'primary', ic: 'save' }) : null));
  if (!isNew && a.last_error) main.append(el('div', { class: 'error-box', style: { marginBottom: '14px' } }, a.last_error));
  main.append(el('div', { class: 'al-grid' },
    el('section', { class: 'panel al-card' }, el('h2', {}, 'What to check'), field('Name', name),
      field('Query (one SELECT; the first row is checked)', q), el('div', { class: 'row' }, btn('Preview result', preview, { cls: 'sm', ic: 'play' })), prev,
      el('h3', { style: { marginTop: '8px' } }, 'Condition'), kind, condRow),
    el('section', { class: 'panel al-card' }, el('h2', {}, 'When and who'),
      el('div', { class: 'row', style: { flexWrap: 'wrap' } }, field('Check', sched), cron, field('Time zone', tz)),
      field('Notify', when), el('label', { class: 'switch' }, okToo, 'Also tell me when it is back to normal'),
      field('E-mail to', emails), field('Slack', slack, slackUrl), field('Microsoft Teams', teams, teamsUrl),
      el('label', { class: 'switch' }, paused, 'Paused'),
      el('p', { class: 'muted small' }, 'The alert runs as its owner, so the owner’s data permissions apply. Set up e-mail and default channels in Admin › Settings › Notifications.'))));
  if (!isNew) {
    main.append(el('section', { class: 'panel', style: { marginTop: '16px' } }, el('div', { class: 'panel-head' }, el('h2', { class: 'grow' }, 'History'),
      el('span', { class: 'muted small' }, `${cronText(a.schedule, a.timezone)} · owner ${a.owner || '—'}`)),
    a.history.length ? el('div', { class: 'tbl-wrap' }, el('table', { class: 't' }, el('thead', {}, el('tr', {}, ['Checked', 'State', 'Value', 'Notified', 'Error'].map((h) => el('th', {}, h)))),
      el('tbody', {}, a.history.map((h) => {
        const n = h.notified ? JSON.parse(h.notified) : null;
        return el('tr', {}, el('td', { class: 'muted' }, fmtTime(h.time * 1000)), el('td', {}, alertState(h.state)), el('td', { class: 'mono' }, h.value ?? '—'),
          el('td', { class: 'muted small' }, n ? [n.sent.join(', ') || '—', n.errors.length ? el('div', { class: 'error-text' }, n.errors.join('; ')) : null] : '—'),
          el('td', { class: 'muted small' }, h.error || ''));
      }))))
      : el('div', { class: 'empty' }, el('p', {}, 'Not checked yet.'))));
  }
  if (!canEdit) {                                  // read-only view for viewers and other people's alerts
    main.querySelectorAll('.al-grid input, .al-grid select, .al-grid textarea').forEach((x) => { x.disabled = true; });
    main.querySelectorAll('.al-grid .btn').forEach((x) => { x.hidden = true; });
  } else if (a.query) preview();
}

window.EXTRA_ROUTES = Object.assign(window.EXTRA_ROUTES || {}, { alerts: viewAlerts, alert: viewAlert });
window.EXTRA_NAV_FOR = Object.assign(window.EXTRA_NAV_FOR || {}, { alert: 'alerts' });
