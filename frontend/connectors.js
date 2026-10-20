/* DataBridge Data Hub — native Connections & Syncs. Loaded before app.js. */
'use strict';

let CX_TYPES = null;
async function cxTypes() { return CX_TYPES || (CX_TYPES = await api('/api/datahub/connector-types')); }
const cxType = (t) => (CX_TYPES || []).find((x) => x.type === t) || { label: t, icon: t, fields: [], kind: 'db' };

function cxLogo(type, size = 28, airbyteId = null) {
  if (type === 'airbyte' && typeof axLogo === 'function') return axLogo(airbyteId, size, airbyteId || 'A');
  const t = cxType(type);
  const letter = el('span', { class: 'ab-logo ab-letter', style: { width: `${size}px`, height: `${size}px`, fontSize: `${Math.round(size * 0.45)}px` } },
    t.kind === 'files' ? '📁' : t.kind === 'api' ? '{}' : (t.label || '?').slice(0, 1).toUpperCase());
  const img = el('img', { class: 'ab-logo', src: `/api/datahub/icons/${encodeURIComponent(t.icon || type)}`, alt: '', width: size, height: size, loading: 'lazy' });
  img.addEventListener('error', () => img.replaceWith(letter));
  return img;
}
const cxSummary = (c) => { if (c.type === 'airbyte') { const a = c.airbyte || {}; const v = (c.config || {}).values || {}; const locs = (v.restaurant_guids || []).length; return a.support === 'builtin' ? `Built-in · ${a.name || ''}${locs ? ` · ${locs} location${locs === 1 ? '' : 's'}` : v.merchant_id ? ` · ${v.merchant_id}` : v.domain ? ` · ${v.domain}` : ''}` : `Connector library · ${a.name || ''}`; } const k = c.config || {}; return k.host ? `${k.user ? `${k.user}@` : ''}${k.host}${k.port ? `:${k.port}` : ''}${k.database ? `/${k.database}` : k.service_name ? `/${k.service_name}` : ''}${k.path && c.type === 'sftp' ? ` ${k.path}` : ''}` : (k.path || k.url || ''); };
const CX_STATE = { succeeded: 'var(--ok)', failed: 'var(--fail)', partial: 'var(--retry)', running: 'var(--run)', queued: 'var(--wait)' };
const cxState = (s) => el('span', { class: 'state' }, el('span', { class: 'dot', style: { background: CX_STATE[s] || 'var(--line-strong)' } }), s ? s[0].toUpperCase() + s.slice(1) : 'Never run');
const cxSched = (s) => {
  const x = s.schedule || {};
  if (x.type === 'realtime') return el('span', { class: 'cx-live' }, el('i'), `Real-time · every ${x.seconds < 60 ? `${x.seconds}s` : `${Math.round(x.seconds / 60)} min`}`);
  if (x.type === 'event') return x.on === 'files' ? 'When new files arrive' : x.on === 'webhook' ? 'On webhook call' : 'After another sync';
  return x.type === 'interval' ? (x.minutes % 60 === 0 ? `Every ${x.minutes / 60 === 1 ? 'hour' : `${x.minutes / 60} hours`}` : `Every ${x.minutes} min`) : x.type === 'daily' ? `Daily at ${x.at}` : 'Manual';
};

/* ---------------- Connections tab ---------------- */
async function dhConnections(body) {
  body.append(loading());
  let conns;
  try { await cxTypes(); conns = await api('/api/datahub/connections'); } catch (e) { body.replaceChildren(errBox(e)); return; }
  const reload = () => { body.replaceChildren(); dhConnections(body); };
  const head = el('div', { class: 'row dh-ab-head' },
    el('div', { class: 'grow muted small' }, 'Connectors run inside DataBridge — nothing else to install or host. Data is streamed in chunks and written to Delta tables with Spark.'),
    canEditDH() ? btn('New connection', () => cxEdit(null, reload), { cls: 'primary', ic: 'plus' }) : null);
  if (!conns.length) {
    body.replaceChildren(head, el('section', { class: 'panel', style: { padding: '18px' } }, el('h3', { style: { marginTop: 0 } }, 'Connect your first source'),
      cxGallery((t) => cxEdit({ type: t.type }, reload))));
    return;
  }
  const tens = [...new Map(conns.filter((c) => c.tenancy && !c.tenancy.missing).map((c) => [c.tenancy.tenant_id, c.tenancy.tenant])).entries()];
  let only = sessionStorage.getItem('cx-tenant') || '';
  if (only && only !== '-' && !tens.some(([k]) => k === only)) only = '';
  const grid = el('div', { class: 'cx-cards' });
  if (tens.length) {
    const f = el('select', { class: 'field sm cx-tfilter', 'aria-label': 'Filter by tenant' }, el('option', { value: '' }, 'All tenants'),
      tens.map(([k, n]) => el('option', { value: k, selected: k === only }, n)), el('option', { value: '-', selected: only === '-' }, 'No tenant'));
    f.addEventListener('change', () => { only = f.value; try { sessionStorage.setItem('cx-tenant', only); } catch { /* ignore */ } drawCards(); });
    head.insertBefore(f, head.lastChild);
  }
  function drawCards() {
    grid.replaceChildren(...conns.filter((c) => !only || (only === '-' ? !c.tenancy : c.tenancy && c.tenancy.tenant_id === only)).map(card));
  }
  body.replaceChildren(head, grid);
  drawCards();
  function card(c) { return el('div', { class: 'cx-card' },
    el('div', { class: 'ab-name' }, cxLogo(c.type, 34, c.airbyte && c.airbyte.id), el('div', {}, el('b', {}, c.name), el('div', { class: 'muted small' }, c.type === 'airbyte' ? (c.airbyte || {}).name : cxType(c.type).label))),
    tnBadge(c.tenancy, { empty: tens.length > 0 }),
    el('div', { class: 'muted small mono cx-sum', title: cxSummary(c) }, cxSummary(c) || '—'),
    el('div', { class: 'cx-res' }),
    el('div', { class: 'row', style: { gap: '6px', flexWrap: 'wrap' } },
      canEditDH() ? btn('Sync tables', () => cxSyncEdit(null, reload, c.id), { cls: 'sm primary', ic: 'download' }) : null,
      btn('Test', async (e) => {
        const b = e.currentTarget; const res = b.closest('.cx-card').querySelector('.cx-res');
        b.disabled = true; res.replaceChildren(el('span', { class: 'muted small' }, 'Testing…'));
        try { const r = await api(`/api/datahub/connections/${c.id}/test`, { method: 'POST' }); res.replaceChildren(el('span', { class: 'cx-ok' }, `✓ ${r.message} · ${r.ms} ms`)); }
        catch (x) { res.replaceChildren(el('span', { class: 'cx-bad' }, `✗ ${x.message}`)); }
        b.disabled = false;
      }, { cls: 'sm', ic: 'check' }),
      canEditDH() ? btn('', () => cxEdit(c, reload), { cls: 'sm', ic: 'edit', title: 'Edit' }) : null,
      canEditDH() ? btn('', async () => {
        if (!(await confirmDialog(`Delete ${c.name}?`, 'Synced tables in the Catalog are kept.'))) return;
        try { await api(`/api/datahub/connections/${c.id}`, { method: 'DELETE' }); toast('Connection deleted'); reload(); } catch (e) { toast(e.message, 'err'); }
      }, { cls: 'sm', ic: 'trash', title: 'Delete' }) : null));
  }
}

function cxGallery(pick) {
  const types = CX_TYPES.filter((t) => t.kind !== 'airbyte');
  const groups = [...new Set(types.map((t) => t.group))];
  return el('div', { class: 'cx-gallery' },
    typeof axGalleryInline === 'function' ? el('button', { type: 'button', class: 'cx-ab-card', onClick: () => pick({ type: 'airbyte' }) },
      el('span', { class: 'cx-ab-ic' }, icon('hub', 22)), el('span', { class: 'grow' }, el('b', {}, '580+ more apps & sources'),
        el('span', { class: 'muted small' }, 'Stripe, Shopify, HubSpot, Salesforce, Zendesk, Jira, Razorpay, Google Ads… from the connector library')), el('span', { class: 'ab-card-name' }, 'Browse ›')) : null,
    groups.map((g) => el('div', {}, el('div', { class: 'cx-group' }, g),
    el('div', { class: 'ab-grid', style: { maxHeight: 'none' } }, types.filter((t) => t.group === g).map((t) =>
      el('button', { type: 'button', class: 'ab-card', onClick: () => pick(t) }, cxLogo(t.type, 34), el('span', { class: 'ab-card-name' }, t.label)))))));
}

async function cxEdit(c, done) {
  await cxTypes();
  if (c && c.id && c.type === 'airbyte') {                 // Airbyte connector: settings form from its spec
    const saved = await openDialog((close) => { const b = el('div', { class: 'dlg ab-dlg' }); axForm(b, c.config.connector, c, close, null, () => close(null)); return b; }, { wide: true });
    if (saved) { toast('Connection saved'); done(); }
    return;
  }
  const res = await openDialog((close) => {
    const box = el('div', { class: 'dlg ab-dlg' });
    const title = el('h2', { class: 'grow' }, 'New connection');
    const body = el('div');
    const headRow = el('div', { class: 'row' }, title, btn('Close', () => close(null), { cls: 'sm' }));
    box.append(headRow, body);
    const showForm = (type) => {
      if (type === 'airbyte') {
        const back = () => { box.replaceChildren(headRow, body); title.textContent = 'New connection'; body.replaceChildren(cxGallery((t) => showForm(t.type))); };
        title.textContent = 'Connector library';
        body.replaceChildren(axGalleryInline((cid) => axForm(box, cid, null, close, () => { box.replaceChildren(headRow, body); showForm('airbyte'); }, () => close(null))));
        body.prepend(el('div', { class: 'row', style: { marginBottom: '8px' } }, btn('Back', back, { cls: 'sm', ic: 'back' })));
        return;
      }
      const T = cxType(type);
      title.replaceChildren(el('span', { class: 'ab-name' }, cxLogo(type, 28), c && c.id ? `Edit ${c.name}` : `New ${T.label} connection`));
      const name = el('input', { class: 'field', value: (c && c.name) || T.label, 'aria-label': 'Name' });
      const inputs = {};
      const fields = T.fields.map((f) => {
        const v = c && c.config ? c.config[f.key] : f.default;
        const inp = f.type === 'select' ? el('select', { class: 'field' }, f.options.map((o) => el('option', { value: o, selected: o === v }, o)))
          : f.type === 'textarea' ? el('textarea', { class: 'field mono', rows: 3, spellcheck: 'false', placeholder: f.placeholder || '' }, v ?? '')
            : el('input', { class: 'field', type: f.type === 'password' ? 'password' : f.type === 'number' ? 'number' : 'text', value: v ?? '', placeholder: f.placeholder || '', autocomplete: f.type === 'password' ? 'new-password' : 'off' });
        inputs[f.key] = inp;
        return el('label', { class: `lbl ab-field ${f.type === 'textarea' ? 'cx-wide' : ''}` }, el('span', {}, f.label, f.required ? el('span', { class: 'req' }, '*') : null), inp,
          f.hint ? el('div', { class: 'ab-help' }, f.hint) : null);
      });
      const cfg = () => Object.fromEntries(Object.entries(inputs).map(([k, i]) => [k, i.value]));
      const tp = tnPicker(c, false);
      const result = el('div');
      const testBtn = btn('Test connection', async () => {
        testBtn.disabled = true; result.replaceChildren(loading('Connecting…'));
        try { const r = await api('/api/datahub/connections/test', { method: 'POST', body: { type, id: c && c.id, config: cfg() } }); result.replaceChildren(el('div', { class: 'cx-ok' }, `✓ ${r.message} · ${r.ms} ms`)); }
        catch (x) { result.replaceChildren(errBox(x)); }
        testBtn.disabled = false;
      }, { ic: 'check' });
      const save = el('button', { type: 'submit', class: 'btn primary' }, 'Save');
      const f = el('form', { method: 'dialog', class: 'ab-form', onSubmit: async (e) => {
        e.preventDefault(); save.disabled = true;
        try { close(await api(c && c.id ? `/api/datahub/connections/${c.id}` : '/api/datahub/connections', { method: c && c.id ? 'PUT' : 'POST', body: { type, name: name.value.trim(), config: cfg(), ...tp.get() } })); }
        catch (x) { result.replaceChildren(errBox(x)); save.disabled = false; }
      } },
      T.kind === 'db' ? el('p', { class: 'muted small', style: { margin: 0 } }, 'DataBridge connects directly from this server. For an on-premises database, the server must reach it (same network or VPN). Use a read-only user.') : null,
      el('label', { class: 'lbl' }, 'Name', name), el('div', { class: 'ab-fields' }, fields), tp.node, result,
      el('div', { class: 'actions' }, !(c && c.id) ? btn('Back', () => { title.textContent = 'New connection'; body.replaceChildren(cxGallery((t) => showForm(t.type))); }, { ic: 'back' }) : null,
        el('span', { class: 'grow' }), testBtn, save));
      body.replaceChildren(f);
    };
    if (c && c.type) showForm(c.type); else body.replaceChildren(cxGallery((t) => showForm(t.type)));
    return box;
  }, { wide: true });
  if (res) { toast('Connection saved'); done(); }
}

/* ---------------- Syncs tab ---------------- */
async function dhSyncs(body) {
  body.append(loading());
  let timer = null;
  const head = el('div', { class: 'row dh-ab-head' });
  const list = el('div');
  body.replaceChildren(head, list);
  async function reload(quiet) {
    let syncs;
    try { await cxTypes(); syncs = await api('/api/datahub/syncs'); } catch (e) { list.replaceChildren(errBox(e)); return; }
    draw(syncs);
    clearTimeout(timer);
    if (syncs.some((s) => s.running)) timer = setTimeout(() => document.body.contains(body) && reload(true), 2500);
  }
  function draw(syncs) {
    const running = syncs.filter((s) => s.running).length;
    const failed = syncs.filter((s) => s.last_run && s.last_run.status === 'failed').length;
    head.replaceChildren(el('div', { class: 'dh-stats' },
      el('div', {}, el('b', {}, String(syncs.length)), 'Syncs'), el('div', { class: running ? 'run' : '' }, el('b', {}, String(running)), 'Running'),
      el('div', { class: failed ? 'bad' : '' }, el('b', {}, String(failed)), 'Failed')),
    el('span', { class: 'grow' }), btn('', () => reload(), { ic: 'refresh', title: 'Refresh' }),
    canEditDH() ? btn('New sync', () => cxSyncEdit(null, reload), { cls: 'primary', ic: 'plus' }) : null);
    if (!syncs.length) {
      list.replaceChildren(el('div', { class: 'empty' }, el('h2', {}, 'No syncs yet'),
        el('p', {}, 'A sync copies tables from a connection into your Catalog — once, or on a schedule, and incrementally.'),
        canEditDH() ? btn('Create a sync', () => cxSyncEdit(null, reload), { cls: 'primary', ic: 'plus' }) : null));
      return;
    }
    list.replaceChildren(el('section', { class: 'panel' }, el('div', { class: 'dh-grid-wrap', style: { border: 0 } }, el('table', { class: 't' },
      el('thead', {}, el('tr', {}, ['Sync', 'Tables → Catalog', 'Schedule', 'Last run', 'Latest data', 'Rows', 'Enabled', ''].map((x) => el('th', { class: x === 'Rows' ? 'num' : '' }, x)))),
      el('tbody', {}, syncs.map((s) => {
        const r = s.last_run;
        // newest change each incremental table has synced (to the second); tooltip: per table, slowest location too
        const pos = Object.entries(s.positions || {}).filter(([, v]) => v && v.cursor).sort((a, b) => ((a[1].latest || a[1].cursor) > (b[1].latest || b[1].cursor) ? -1 : 1));
        return el('tr', {},
          el('td', {}, el('div', { class: 'ab-name' }, cxLogo(s.connection.type, 26, s.connection.connector), el('div', {}, el('b', {}, s.name), el('div', { class: 'muted small' }, s.connection.name || '(deleted connection)'),
            s.connection.tenancy ? tnBadge(s.connection.tenancy) : null))),
          el('td', {}, el('div', {}, `${s.streams.length} table${s.streams.length === 1 ? '' : 's'} → `, el('a', { href: `#/catalog?db=${encodeURIComponent(s.target_schema)}`, class: 'mono' }, s.target_schema)),
            el('div', { class: 'muted small' }, [...new Set(s.streams.map((x) => ({ full: 'Full refresh', append: 'Incremental', merge: 'Upsert' })[x.mode]))].join(' · '))),
          el('td', {}, cxSched(s), s.next_run ? el('div', { class: 'muted small' }, `next ${new Date(s.next_run * 1000).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}`) : null),
          el('td', {}, s.running ? cxState('running') : cxState(r && r.status), r ? el('div', { class: 'muted small' }, `${ago(r.started)}${r.seconds != null ? ` · ${r.seconds}s` : ''}`) : null),
          el('td', { class: 'small cx-pos' }, pos.length ? el('span', { title: `Newest change synced per table (the next run continues from there):\n${pos.map(([t, v]) => `${t}: ${v.latest || v.cursor}${v.partitions > 1 ? ` (oldest location: ${v.cursor})` : ''}`).join('\n')}` },
            pos[0][1].latest || pos[0][1].cursor, pos.length > 1 ? el('div', { class: 'muted' }, `${pos.length} incremental tables`) : null) : el('span', { class: 'muted' }, s.streams.some((x) => x.mode !== 'full') ? 'not started' : 'full refresh')),
          el('td', { class: 'num' }, r && r.rows != null ? Number(r.rows).toLocaleString() : '—'),
          el('td', {}, el('label', { class: 'switch' }, el('input', { type: 'checkbox', checked: s.enabled !== false, disabled: !canEditDH(), 'aria-label': `Enable ${s.name}`,
            onChange: async (e) => { try { await api(`/api/datahub/syncs/${s.id}/enabled`, { method: 'POST', body: { on: e.target.checked } }); reload(true); } catch (x) { toast(x.message, 'err'); } } }))),
          el('td', { class: 'dh-act' },
            canEditDH() ? btn(s.running ? 'Running…' : 'Run now', async (e) => {
              e.currentTarget.disabled = true;
              try { const run = await api(`/api/datahub/syncs/${s.id}/run`, { method: 'POST' }); toast(`Started ${s.name}`); reload(true); cxRunDialog(run.id); } catch (x) { toast(x.message, 'err'); reload(true); }
            }, { cls: 'sm primary', ic: 'play', disabled: s.running }) : null,
            btn('', () => cxRuns(s), { cls: 'sm', ic: 'history', title: 'Run history' }),
            canEditDH() && s.streams.some((x) => x.mode !== 'full') ? btn('', async () => {
              if (!(await confirmDialog(`Re-sync history for ${s.name}?`, 'Forgets how far each table has synced. The next run reads everything again from the connector’s “History from” date — Upsert keeps rows unique; Incremental (append) tables may get duplicates.', 'Re-sync history'))) return;
              try { await api(`/api/datahub/syncs/${s.id}/reset`, { method: 'POST', body: {} }); const run = await api(`/api/datahub/syncs/${s.id}/run`, { method: 'POST' }); toast('Re-syncing history'); reload(true); cxRunDialog(run.id); }
              catch (x) { toast(x.message, 'err'); }
            }, { cls: 'sm', ic: 'restart', title: 'Re-sync history (reload from the start date)', disabled: s.running }) : null,
            canEditDH() ? btn('', () => cxSyncEdit(s, reload), { cls: 'sm', ic: 'edit', title: 'Edit' }) : null,
            canEditDH() ? btn('', async () => {
              if (!(await confirmDialog(`Delete ${s.name}?`, 'Stops the schedule. Tables already in the Catalog are kept.'))) return;
              try { await api(`/api/datahub/syncs/${s.id}`, { method: 'DELETE' }); toast('Sync deleted'); reload(); } catch (x) { toast(x.message, 'err'); }
            }, { cls: 'sm', ic: 'trash', title: 'Delete' }) : null));
      }))))));
  }
  reload();
  return () => clearTimeout(timer);
}

const CX_SCHED = [
  ['Run', [['manual', 'Manual (Run now only)']]],
  ['Real-time', [['rt:30', 'Real-time — every 30 seconds'], ['rt:60', 'Real-time — every minute'], ['rt:300', 'Near real-time — every 5 minutes']]],
  ['Scheduled', [['15', 'Every 15 minutes'], ['60', 'Every hour'], ['360', 'Every 6 hours'], ['daily', 'Daily at…']]],
  ['Event-based', [['ev:files', 'When new files arrive (folder / SFTP)'], ['ev:after_sync', 'When another sync finishes'], ['ev:webhook', 'On webhook call (from another system)']]],
];
const cxSchedValue = (sch) => (sch.type === 'interval' ? String(sch.minutes) : sch.type === 'daily' ? 'daily' : sch.type === 'realtime' ? `rt:${sch.seconds}` : sch.type === 'event' ? `ev:${sch.on}` : 'manual');
const CX_MODES = [['full', 'Full refresh (replace)'], ['append', 'Incremental (new rows only)'], ['merge', 'Upsert (insert + update by key)']];

async function cxSyncEdit(s, done, connId) {
  let conns;
  try { await cxTypes(); conns = await api('/api/datahub/connections'); } catch (e) { toast(e.message, 'err'); return; }
  if (!conns.length) { toast('Create a connection first (Connections tab)', 'err'); return; }
  const res = await openDialog((close) => {
    const S = { conn: (s && s.connection_id) || connId || conns[0].id, sel: new Map((s ? s.streams : []).map((x) => [x.source, { ...x }])), cols: {} };
    const connSel = el('select', { class: 'field' }, conns.map((c) => el('option', { value: c.id, selected: c.id === S.conn }, `${c.name} (${c.type === 'airbyte' && c.airbyte ? c.airbyte.name : cxType(c.type).label})`)));
    const name = el('input', { class: 'field', value: (s && s.name) || '' , placeholder: 'e.g. Sales DB nightly' });
    const target = el('input', { class: 'field mono', value: (s && s.target_schema) || '' });
    const fmt = el('select', { class: 'field' }, [['delta', 'Delta (recommended)'], ['parquet', 'Parquet']].map(([v, l]) => el('option', { value: v, selected: ((s && s.format) || 'delta') === v }, l)));
    const sch = (s && s.schedule) || { type: 'manual' };
    const curSched = cxSchedValue(sch);
    const schedSel = el('select', { class: 'field' }, CX_SCHED.map(([g, opts]) => el('optgroup', { label: g }, opts.map(([v, l]) => el('option', { value: v, selected: v === curSched }, l)))));
    if (![...schedSel.options].some((o) => o.value === curSched)) schedSel.append(el('option', { value: curSched, selected: true }, cxSched({ schedule: sch })));
    const at = el('input', { class: 'field', type: 'time', value: sch.at || '02:00', hidden: sch.type !== 'daily' });
    const afterSel = el('select', { class: 'field', hidden: curSched !== 'ev:after_sync', 'aria-label': 'Run after this sync' }, el('option', { value: '' }, '— pick the sync that triggers this one —'));
    api('/api/datahub/syncs').then((all) => all.filter((x) => !s || x.id !== s.id).forEach((x) => afterSel.append(el('option', { value: x.id, selected: sch.after === x.id }, x.name)))).catch(() => {});
    const schedHint = el('div', { class: 'muted small cx-sched-hint' });
    const hintFor = (v) => (v.startsWith('rt:') ? 'Runs again as soon as the interval passes. Pair it with Upsert or Incremental so each run only moves new/changed rows; dashboards set to “Live” refresh when new data lands.'
      : v === 'ev:files' ? 'DataBridge checks the folder every 30 s (Admin › Settings › Data Hub) and runs when a new or changed file appears.'
        : v === 'ev:webhook' ? 'Call the trigger URL (shown after saving) from another system — e.g. after a POS export or an upload.'
          : v === 'ev:after_sync' ? 'Chains syncs: runs right after the chosen sync succeeds.' : '');
    schedSel.addEventListener('change', () => { at.hidden = schedSel.value !== 'daily'; afterSel.hidden = schedSel.value !== 'ev:after_sync'; schedHint.textContent = hintFor(schedSel.value); });
    schedHint.textContent = hintFor(curSched);
    const streamsBox = el('div', { class: 'cx-streams' }, loading('Reading tables…'));
    const err = el('div');
    const conn = () => conns.find((c) => c.id === S.conn);
    const slug = (x) => x.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '').replace(/^(\d)/, 't_$1') || 'data';
    const defaultTarget = () => (conn().tenancy && conn().type === 'airbyte' && conn().airbyte ? slug(`src_${conn().airbyte.id}`) : slug(`src_${conn().name}`));
    const tenantNote = el('div', { class: 'cx-tenant-note' });
    const drawTenantNote = () => {
      const t = conn().tenancy;
      tenantNote.hidden = !t;
      if (!t) return;
      tenantNote.replaceChildren(tnBadge(t), el('span', {}, ` Rows get tenant and business columns. Several tenants can share these tables: Upsert matches on tenant + business + key, Full refresh replaces only this tenant’s rows. Use `,
        el('code', {}, '{tenant}'), ' in the schema (e.g. ', el('code', {}, 'bronze_{tenant}'), ') for one schema per tenant instead.'));
    };
    drawTenantNote();
    if (!target.value) target.value = defaultTarget();
    if (!name.value) name.value = conn().name;
    connSel.addEventListener('change', () => {
      const oldDefault = defaultTarget();
      S.conn = connSel.value; S.sel.clear(); S.cols = {};
      if (!target.value || target.value === oldDefault) target.value = defaultTarget();
      name.value = conn().name; drawTenantNote(); loadStreams();
    });
    async function cols(stream) {
      if (!S.cols[stream]) S.cols[stream] = api(`/api/datahub/connections/${S.conn}/columns?stream=${encodeURIComponent(stream)}`).then((r) => r.columns).catch(() => []);
      return S.cols[stream];
    }
    async function loadStreams() {
      streamsBox.replaceChildren(loading('Reading tables…'));
      let R;
      try { R = await api(`/api/datahub/connections/${S.conn}/streams`); } catch (e) { streamsBox.replaceChildren(errBox(e)); return; }
      const filter = el('input', { class: 'field', type: 'search', placeholder: `Filter ${R.streams.length} tables…` });
      const all = el('input', { type: 'checkbox', 'aria-label': 'Select all' });
      const tbody = el('tbody');
      const count = el('span', { class: 'muted small' });
      const upd = () => { count.textContent = `${S.sel.size} selected`; };
      const row = (st) => {
        // new sync from a connector: its suggested streams are pre-selected; incremental ones default to history + upsert
        const pre = !s && !S.touched && R.kind === 'airbyte' && st.suggested;
        const on = S.sel.has(st.stream) || pre;
        const cfg = S.sel.get(st.stream) || { source: st.stream, table: slug(st.name || st.stream), mode: R.kind === 'airbyte' && st.incremental && st.pk && st.pk.length ? 'merge' : 'full',
          cursor: null, keys: R.kind === 'airbyte' && st.pk ? [...st.pk] : [], nested: R.kind === 'api' || R.kind === 'airbyte' ? 'struct' : 'flat', transform: {} };
        const trBtn = btn(cxTrSummary(cfg), () => cxTransformDialog(S.conn, R.kind, st.stream, cfg).then(() => { trBtn.lastChild.textContent = cxTrSummary(cfg); }),
          { cls: 'sm cx-tr-btn', ic: 'flow', title: 'Column mapping, types, calculated columns, filter, flatten nested data, de-duplicate', disabled: !on });
        const cb = el('input', { type: 'checkbox', checked: on, 'aria-label': `Sync ${st.stream}` });
        const tbl = el('input', { class: 'field mono sm', value: cfg.table, disabled: !on, onInput: (e) => { cfg.table = e.target.value.trim(); } });
        const mode = el('select', { class: 'field sm', disabled: !on }, CX_MODES.map(([v, l]) => el('option', { value: v, selected: v === cfg.mode }, l)));
        const extra = el('div', { class: 'cx-extra' });
        if (R.kind === 'api' && !cfg.nested) cfg.nested = 'flat';
        const drawExtra = async () => {
          extra.replaceChildren();
          if (!S.sel.has(st.stream) || cfg.mode === 'full') return;
          if (R.kind === 'files') { extra.append(el('span', { class: 'muted small' }, 'Only new or changed files are loaded each run.')); return; }
          if (R.kind === 'airbyte') {
            if (!st.incremental) { extra.append(el('span', { class: 'muted small' }, 'This stream only supports full refresh — each run reads everything.')); return; }
            if (!cfg.keys || !cfg.keys.length) cfg.keys = st.pk || [];
            if (!cfg.cursor) cfg.cursor = st.cursor || null;
            const kk = el('input', { class: 'field sm', value: (cfg.keys || []).join(', '), placeholder: 'key column(s)' });
            kk.addEventListener('input', () => { cfg.keys = kk.value.split(',').map((x) => x.trim()).filter(Boolean); });
            extra.append(...[el('span', { class: 'muted small' }, st.source_cursor ? `Incremental by ${st.cursor} (set by the connector) — the first run loads history, later runs only new/changed records.` : `Incremental cursor: ${cfg.cursor || '—'}`),
              cfg.mode === 'merge' ? el('label', { class: 'lbl' }, 'Key column(s)', kk) : null].filter(Boolean));
            return;
          }
          if (R.kind !== 'db') {
            const kk = el('input', { class: 'field sm', value: (cfg.keys || []).join(', '), placeholder: 'key column(s), e.g. id' });
            kk.addEventListener('input', () => { cfg.keys = kk.value.split(',').map((x) => x.trim()).filter(Boolean); });
            extra.append(...[el('span', { class: 'muted small' }, 'APIs: each run reads what the endpoint returns.'), cfg.mode === 'merge' ? el('label', { class: 'lbl' }, 'Key column(s)', kk) : null].filter(Boolean));
            return;
          }
          extra.append(el('span', { class: 'muted small' }, 'loading columns…'));
          const cs = await cols(st.stream);
          const guess = cs.find((c) => /updated|modified|last_?update|changed/i.test(c.name) && c.cursor_ok) || cs.find((c) => c.pk && c.cursor_ok) || cs.find((c) => c.cursor_ok);
          if (!cfg.cursor && guess) cfg.cursor = guess.name;
          if (!cfg.keys || !cfg.keys.length) cfg.keys = cs.filter((c) => c.pk).map((c) => c.name);
          const cur = el('select', { class: 'field sm', title: 'Cursor: rows with a higher value than last time are new' }, el('option', { value: '' }, '— cursor column —'),
            cs.filter((c) => c.cursor_ok).map((c) => el('option', { value: c.name, selected: c.name === cfg.cursor }, `${c.name} (${c.type})`)));
          cur.addEventListener('change', () => { cfg.cursor = cur.value || null; });
          const keys = el('select', { class: 'field sm', multiple: true, size: Math.min(4, cs.length), title: 'Key column(s) to match rows for upsert' },
            cs.map((c) => el('option', { value: c.name, selected: (cfg.keys || []).includes(c.name) }, `${c.name}${c.pk ? ' 🔑' : ''}`)));
          keys.addEventListener('change', () => { cfg.keys = [...keys.selectedOptions].map((o) => o.value); });
          extra.replaceChildren(...[el('label', { class: 'lbl' }, 'Cursor (new/changed rows)', cur), cfg.mode === 'merge' ? el('label', { class: 'lbl' }, 'Key column(s)', keys) : null].filter(Boolean));
        };
        mode.addEventListener('change', () => { cfg.mode = mode.value; drawExtra(); });
        cb.addEventListener('change', () => {
          S.touched = true;
          if (cb.checked) S.sel.set(st.stream, cfg); else S.sel.delete(st.stream);
          tbl.disabled = mode.disabled = trBtn.disabled = !cb.checked; drawExtra(); upd();
        });
        if (on) { S.sel.set(st.stream, cfg); drawExtra(); }
        return el('tr', { 'data-s': `${st.stream}`.toLowerCase() },
          el('td', {}, cb), el('td', {}, el('b', { class: 'mono' }, st.stream), el('div', { class: 'muted small' }, st.kind === 'view' ? 'view' : st.kind === 'files' ? `${st.count} file(s)` : st.kind === 'airbyte' ? `${st.incremental ? 'incremental' : 'full refresh'}${st.pk && st.pk.length ? ` · key ${st.pk.join('+')}` : ''}${st.suggested ? ' · suggested' : ''}` : ''),
            btn('', () => cxPreview(S.conn, st.stream), { cls: 'sm linkish', ic: 'table', title: 'Preview 50 rows' })),
          el('td', {}, tbl), el('td', {}, mode, extra), el('td', {}, trBtn));
      };
      (R.kind === 'airbyte' ? [...R.streams].sort((a, b) => (b.suggested - a.suggested) || a.stream.localeCompare(b.stream)) : R.streams).forEach((st) => tbody.append(row(st)));
      filter.addEventListener('input', () => { const q = filter.value.toLowerCase(); tbody.querySelectorAll('tr').forEach((tr) => { tr.hidden = !!q && !tr.dataset.s.includes(q); }); });
      all.addEventListener('change', () => tbody.querySelectorAll('tr:not([hidden]) input[type=checkbox]').forEach((cb) => { if (cb.checked !== all.checked) cb.click(); }));
      upd();
      streamsBox.replaceChildren(...[el('div', { class: 'row', style: { gap: '10px', alignItems: 'center', marginBottom: '8px' } }, el('div', { class: 'grow' }, filter), count),
        R.kind === 'files' && R.files ? el('div', { class: 'muted small', style: { marginBottom: '6px' } }, `Matching files: ${R.files.slice(-5).map((f) => f.name).join(', ')}${R.files.length > 5 ? ` … (${R.files.length})` : ''}`) : null,
        el('div', { class: 'dh-grid-wrap', style: { maxHeight: '40vh' } }, el('table', { class: 't cx-st' },
          el('thead', {}, el('tr', {}, el('th', { style: { width: '30px' } }, all), el('th', {}, 'Source'), el('th', {}, 'Catalog table'), el('th', {}, 'How to sync'), el('th', {}, 'Map & transform'))), tbody))].filter(Boolean));
    }
    loadStreams();
    const collect = () => ({
      name: name.value.trim(), connection_id: S.conn, target_schema: target.value.trim(), format: fmt.value, enabled: s ? s.enabled !== false : true,
      schedule: schedSel.value === 'manual' ? { type: 'manual' } : schedSel.value === 'daily' ? { type: 'daily', at: at.value || '02:00' }
        : schedSel.value.startsWith('rt:') ? { type: 'realtime', seconds: Number(schedSel.value.slice(3)) }
          : schedSel.value.startsWith('ev:') ? { type: 'event', on: schedSel.value.slice(3), after: afterSel.value || null } : { type: 'interval', minutes: Number(schedSel.value) },
      streams: [...S.sel.values()].map((x) => ({ source: x.source, table: x.table, mode: x.mode, cursor: x.mode === 'full' ? null : x.cursor, keys: x.mode === 'merge' ? x.keys : [],
        nested: x.nested || 'flat', transform: x.transform || {} })),
    });
    const save = async (run, b) => {
      err.replaceChildren(); b.disabled = true;
      try {
        const saved = await api(s ? `/api/datahub/syncs/${s.id}` : '/api/datahub/syncs', { method: s ? 'PUT' : 'POST', body: collect() });
        let runId = null;
        if (run) runId = (await api(`/api/datahub/syncs/${saved.id}/run`, { method: 'POST' })).id;
        close({ saved, runId });
      } catch (x) { err.replaceChildren(errBox(x)); b.disabled = false; }
    };
    const saveBtn = btn('Save', () => save(false, saveBtn));
    const runBtn = btn('Save & run now', () => save(true, runBtn), { cls: 'primary', ic: 'play' });
    return el('div', { class: 'dlg ab-dlg' },
      el('div', { class: 'row' }, el('h2', { class: 'grow' }, s ? `Edit sync — ${s.name}` : 'New sync'), btn('Close', () => close(null), { cls: 'sm' })),
      el('div', { class: 'dh-form', style: { padding: 0 } },
        el('label', { class: 'lbl' }, 'From connection', connSel), el('label', { class: 'lbl' }, 'Into Catalog schema', target),
        el('div', { style: { gridColumn: '1 / -1' } }, tenantNote),
        el('label', { class: 'lbl' }, 'Name', name), el('label', { class: 'lbl' }, 'Format', fmt),
        el('div', { class: 'lbl', style: { gridColumn: 'span 2' } }, el('span', {}, 'When to run'), schedSel, at, afterSel, schedHint)),
      s && s.hook ? el('div', { class: 'cx-hook' }, el('b', {}, 'Trigger URL '), el('span', { class: 'muted small' }, '(POST, no sign-in — keep it secret)'),
        el('code', { class: 'mono' }, `${location.origin}/api/datahub/hooks/${s.hook}`),
        btn('Copy', () => navigator.clipboard.writeText(`${location.origin}/api/datahub/hooks/${s.hook}`).then(() => toast('Copied')), { cls: 'sm ghost' })) : null,
      el('div', { class: 'cx-h' }, 'Tables to sync'), streamsBox, err,
      el('div', { class: 'actions' }, el('span', { class: 'grow muted small' }, 'Incremental remembers how far it got (to the second) and the first run loads history from the connector’s start date; Upsert updates changed rows by key (Delta MERGE). Each table gets a _synced_at column.'), saveBtn, runBtn));
  }, { wide: true });
  if (res) { toast(res.runId ? 'Sync saved — running now' : 'Sync saved'); done(); if (res.runId) cxRunDialog(res.runId); }
}

function cxPreview(conn, stream, nested) {
  return openDialog((close) => {
    const box = el('div', {}, loading('Reading 50 rows…'));
    api(`/api/datahub/connections/${conn}/preview?stream=${encodeURIComponent(stream)}${nested ? `&nested=${nested}` : ''}`).then((r) => {
      box.replaceChildren(r.columns.length ? el('div', { class: 'dh-grid-wrap' }, el('table', { class: 't dh-grid' },
        el('thead', {}, el('tr', {}, r.columns.map((c) => el('th', {}, c)))),
        el('tbody', {}, r.rows.map((row) => el('tr', {}, row.map((v) => el('td', { class: v == null ? 'nul' : '' }, v == null ? 'null' : typeof v === 'object' ? dtTree(v) : v)))))))
        : el('p', { class: 'muted' }, 'No rows.'));
    }).catch((e) => box.replaceChildren(errBox(e)));
    return el('div', { class: 'dlg' }, el('div', { class: 'row' }, el('h2', { class: 'grow mono' }, stream), btn('Close', () => close(null), { cls: 'sm' })), box);
  }, { wide: true });
}

function cxRunDialog(rid) {
  return openDialog((close) => {
    const box = el('div', {}, loading());
    let timer = null; let alive = true;
    const draw = (r) => {
      box.replaceChildren(...[
        el('div', { class: 'row', style: { gap: '14px', marginBottom: '10px' } }, cxState(r.status),
          el('span', { class: 'muted small' }, `${r.trigger} · started ${new Date(r.started * 1000).toLocaleTimeString()}${r.seconds != null ? ` · ${r.seconds}s` : ''}${r.rows != null ? ` · ${Number(r.rows).toLocaleString()} rows` : ''}`)),
        r.error ? el('div', { class: 'error-box' }, r.error) : null,
        ['succeeded', 'partial'].includes(r.status) && typeof dbAiDialog === 'function' && r.streams.some((x) => x.table && x.status === 'succeeded') ? el('div', { class: 'cx-next' },
          el('span', { class: 'grow' }, 'Data is in the Catalog. '),
          btn('Build a dashboard from it', () => { alive = false; clearTimeout(timer); close(null); location.hash = '#/dashboards'; setTimeout(() => dbAiDialog({ tables: r.streams.filter((x) => x.status === 'succeeded' && x.table && x.table.includes('.')).map((x) => x.table) }), 300); }, { cls: 'sm primary', ic: 'chart' })) : null,
        el('table', { class: 't' }, el('thead', {}, el('tr', {}, ['Table', 'Status', 'Rows', ''].map((x) => el('th', {}, x)))),
          el('tbody', {}, r.streams.map((x) => el('tr', {}, el('td', { class: 'mono' }, x.table), el('td', {}, cxState(x.status === 'no new data' ? 'succeeded' : x.status), x.status === 'no new data' ? el('span', { class: 'muted small' }, ' no new data') : null,
              x.checkpoints ? el('span', { class: 'muted small', title: 'Written to the table in steps during a long read; a restart continues from the last one' }, ` · ${x.checkpoints} checkpoint${x.checkpoints === 1 ? '' : 's'}`) : null),
            el('td', { class: 'num' }, Number(x.rows || 0).toLocaleString()), el('td', { class: 'small', style: { color: 'var(--fail)', maxWidth: '420px' } }, x.error || ''))))),
        r.log && r.log.length ? el('details', { open: ['running', 'queued'].includes(r.status) }, el('summary', {}, 'Log'), el('pre', { class: 'log', style: { maxHeight: '220px' } }, r.log.join('\n'))) : null].filter(Boolean));
    };
    const tick = async () => {
      if (!alive) return;
      try { const r = await api(`/api/datahub/runs/${rid}`); draw(r); if (['running', 'queued'].includes(r.status)) timer = setTimeout(tick, 1500); } catch (e) { box.replaceChildren(errBox(e)); }
    };
    tick();
    return el('div', { class: 'dlg' }, el('div', { class: 'row' }, el('h2', { class: 'grow' }, 'Sync run'), btn('Close', () => { alive = false; clearTimeout(timer); close(null); }, { cls: 'sm' })), box);
  }, { wide: true });
}

function cxRuns(s) {
  return openDialog((close) => {
    const box = el('div', {}, loading());
    api(`/api/datahub/syncs/${s.id}/runs`).then((rs) => {
      box.replaceChildren(rs.length ? el('table', { class: 't' },
        el('thead', {}, el('tr', {}, ['Started', 'Trigger', 'Status', 'Rows', 'Duration', ''].map((x) => el('th', {}, x)))),
        el('tbody', {}, rs.map((r) => el('tr', { class: 'clickable', onClick: () => cxRunDialog(r.id) }, el('td', {}, fmtTime(r.started * 1000)), el('td', {}, r.trigger),
          el('td', {}, cxState(r.status)), el('td', { class: 'num' }, Number(r.rows || 0).toLocaleString()), el('td', {}, r.seconds != null ? `${r.seconds}s` : '—'), el('td', {}, '›')))))
        : el('p', { class: 'muted' }, 'No runs yet.'));
    }).catch((e) => box.replaceChildren(errBox(e)));
    return el('div', { class: 'dlg' }, el('div', { class: 'row' }, el('h2', { class: 'grow' }, `Run history — ${s.name}`), btn('Close', () => close(null), { cls: 'sm' })), box);
  }, { wide: true });
}


/* ---------------- Map & transform: mapping, types, calculated columns, filter, flatten, dedup (window) ---------------- */
const CX_DTYPES = [['auto', 'Keep / auto'], ['string', 'Text'], ['bigint', 'Whole number'], ['double', 'Decimal'], ['decimal(18,2)', 'Money (18,2)'],
  ['boolean', 'True / false'], ['date', 'Date'], ['timestamp', 'Date & time'], ['json', 'JSON text']];
function cxTrSummary(cfg) {
  const t = cfg.transform || {};
  const parts = [];
  const cols = t.columns || [];
  if (cols.some((c) => c.keep === false)) parts.push(`${cols.filter((c) => c.keep === false).length} hidden`);
  if (cols.some((c) => c.as)) parts.push(`${cols.filter((c) => c.as).length} renamed`);
  if (cols.some((c) => c.type)) parts.push(`${cols.filter((c) => c.type).length} typed`);
  if ((t.derived || []).length) parts.push(`${t.derived.length} calculated`);
  if (t.filter) parts.push('filtered');
  if (t.flatten) parts.push('flattened');
  if (t.explode) parts.push(`1 row per ${t.explode} item`);
  if (t.dedup && (t.dedup.keys || []).length) parts.push(`dedup by ${t.dedup.keys.join('+')}`);
  return parts.length ? parts.join(' · ') : 'Map & transform…';
}

function cxTransformDialog(connId, kind, stream, cfg) {
  return openDialog((close) => {
    const T = JSON.parse(JSON.stringify(cfg.transform || {}));
    T.columns = T.columns || []; T.derived = T.derived || []; T.dedup = T.dedup || { keys: [], order_by: '', desc: true };
    let nested = cfg.nested || 'flat';
    let source = null;                                   // [{name, type}] from Spark on a sample
    const rule = (name) => { let r = T.columns.find((c) => c.name === name); if (!r) { r = { name }; T.columns.push(r); } return r; };
    const body = el('div', { class: 'cx-tr' }, loading('Reading a sample and its structure…'));
    const result = el('div', { class: 'cx-tr-result' });
    const err = el('div');

    const spec = () => ({
      columns: T.columns.filter((c) => c.keep === false || c.as || (c.type && c.type !== 'auto')).map((c) => ({ name: c.name, keep: c.keep !== false, as: c.as || undefined, type: c.type && c.type !== 'auto' ? c.type : undefined })),
      derived: T.derived.filter((d) => d.name && d.expr), filter: (T.filter || '').trim() || undefined, flatten: T.flatten || undefined, explode: T.explode || undefined,
      dedup: (T.dedup.keys || []).length ? { keys: T.dedup.keys, order_by: T.dedup.order_by || null, desc: T.dedup.desc !== false } : undefined,
    });
    async function run(show) {
      err.replaceChildren();
      result.replaceChildren(loading('Running the transformation on a sample with Spark…'));
      try {
        const r = await api(`/api/datahub/connections/${connId}/transform-preview`, { method: 'POST',
          body: { stream, nested, transform: show ? spec() : {}, mode: cfg.mode, keys: cfg.keys, cursor: cfg.cursor } });
        if (!source || !show) { source = r.source_columns; draw(); }
        result.replaceChildren(el('div', { class: 'row', style: { alignItems: 'center', marginBottom: '6px' } },
          el('b', { class: 'grow' }, show ? 'Result (sample)' : 'Source sample'),
          el('span', { class: 'muted small' }, `${r.rows_in} rows in → ${r.rows_out} rows out · ${r.columns.length} columns`)),
        el('div', { class: 'dh-grid-wrap', style: { maxHeight: '34vh' } }, el('table', { class: 't dh-grid' },
          el('thead', {}, el('tr', {}, r.columns.map((c, i) => el('th', {}, c, el('div', { class: 'cx-ty' }, r.types[i]))))),
          el('tbody', {}, r.rows.slice(0, 30).map((row) => el('tr', {}, row.map((v) => el('td', { class: v == null ? 'nul' : '' }, v == null ? 'null' : typeof v === 'object' ? dtTree(v) : String(v)))))))));
      } catch (e) { result.replaceChildren(); err.replaceChildren(errBox(e)); }
    }
    function draw() {
      if (!source) return;
      const names = source.map((c) => c.name);
      const isComplex = (t) => /^(struct|array|map)</.test(t);
      const colRows = source.map((c) => {
        const r = rule(c.name);
        const keep = el('input', { type: 'checkbox', checked: r.keep !== false, 'aria-label': `Keep ${c.name}`, onChange: (e) => { r.keep = e.target.checked; } });
        const as = el('input', { class: 'field sm mono', value: r.as || '', placeholder: c.name, onInput: (e) => { r.as = e.target.value.trim().toLowerCase(); } });
        const ty = el('select', { class: 'field sm' }, CX_DTYPES.map(([v, l]) => el('option', { value: v, selected: (r.type || 'auto') === v }, l)));
        ty.addEventListener('change', () => { r.type = ty.value === 'auto' ? undefined : ty.value; });
        return el('tr', {}, el('td', {}, keep), el('td', { class: 'mono' }, c.name), el('td', {}, el('span', { class: `cx-ty${isComplex(c.type) ? ' nested' : ''}`, title: c.type }, c.type.length > 40 ? `${c.type.slice(0, 38)}…` : c.type)), el('td', {}, as), el('td', {}, ty));
      });
      const arrays = source.filter((c) => c.type.startsWith('array<'));
      const structs = source.filter((c) => c.type.startsWith('struct<'));
      const derivedBox = el('div', { class: 'cx-derived' });
      const drawDerived = () => derivedBox.replaceChildren(...T.derived.map((d, i) => el('div', { class: 'cx-der' },
        el('input', { class: 'field sm mono', value: d.name || '', placeholder: 'new_column', onInput: (e) => { d.name = e.target.value.trim().toLowerCase(); } }),
        el('span', {}, '='),
        el('input', { class: 'field sm mono', value: d.expr || '', placeholder: "e.g. qty * price   ·   upper(trim(city))   ·   to_date(created_at)   ·   customer.address.city", onInput: (e) => { d.expr = e.target.value; } }),
        btn('', () => { T.derived.splice(i, 1); drawDerived(); }, { cls: 'ghost icon sm', ic: 'x', title: 'Remove' }))),
      btn('Add calculated column', () => { T.derived.push({ name: '', expr: '' }); drawDerived(); }, { cls: 'sm ghost', ic: 'plus' }));
      drawDerived();
      const dkeys = el('select', { class: 'field sm', multiple: true, size: Math.min(5, names.length), 'aria-label': 'Dedup key columns' }, names.map((n) => el('option', { value: n, selected: (T.dedup.keys || []).includes(n) }, n)));
      dkeys.addEventListener('change', () => { T.dedup.keys = [...dkeys.selectedOptions].map((o) => o.value); });
      const dorder = el('select', { class: 'field sm', 'aria-label': 'Keep which row' }, el('option', { value: '' }, '— last row read —'), names.map((n) => el('option', { value: n, selected: T.dedup.order_by === n }, n)));
      dorder.addEventListener('change', () => { T.dedup.order_by = dorder.value; });
      const ddesc = el('select', { class: 'field sm' }, el('option', { value: 'desc', selected: T.dedup.desc !== false }, 'newest / highest'), el('option', { value: 'asc', selected: T.dedup.desc === false }, 'oldest / lowest'));
      ddesc.addEventListener('change', () => { T.dedup.desc = ddesc.value === 'desc'; });
      const flat = el('select', { class: 'field sm' }, [['', 'Keep nested (struct)'], ['1', 'Flatten 1 level'], ['2', 'Flatten 2 levels'], ['all', 'Flatten everything']].map(([v, l]) => el('option', { value: v, selected: String(T.flatten || '') === v }, l)));
      flat.addEventListener('change', () => { T.flatten = flat.value === 'all' ? 'all' : Number(flat.value) || undefined; });
      const expl = el('select', { class: 'field sm' }, el('option', { value: '' }, '— no —'), arrays.map((c) => el('option', { value: c.name, selected: T.explode === c.name }, c.name)));
      expl.addEventListener('change', () => { T.explode = expl.value || undefined; });
      const filt = el('input', { class: 'field mono', value: T.filter || '', placeholder: "e.g. status <> 'cancelled' AND amount > 0" });
      filt.addEventListener('input', () => { T.filter = filt.value; });
      const nestSel = kind === 'api' ? el('select', { class: 'field sm' }, [['struct', 'Keep nested objects & arrays (struct / array columns)'], ['flat', 'Flatten to columns, arrays as JSON text (old behaviour)']]
        .map(([v, l]) => el('option', { value: v, selected: nested === v }, l))) : null;
      if (nestSel) nestSel.addEventListener('change', () => { nested = nestSel.value; source = null; T.columns = []; body.replaceChildren(loading('Reading the structure again…')); run(false); });
      body.replaceChildren(
        el('ol', { class: 'cx-tr-steps' },
          nestSel ? el('li', {}, el('h4', {}, 'Structure'), el('p', { class: 'muted small' }, 'Nested JSON from the API becomes STRUCT / ARRAY columns you can query like customer.address.city — and browse expandable in results.'), nestSel) : null,
          el('li', {}, el('h4', {}, 'Columns — keep, rename, set type'),
            el('div', { class: 'dh-grid-wrap', style: { maxHeight: '30vh' } }, el('table', { class: 't cx-map' },
              el('thead', {}, el('tr', {}, el('th', {}, 'Keep'), el('th', {}, 'Source column'), el('th', {}, 'Type found'), el('th', {}, 'Rename to'), el('th', {}, 'Convert to'))), el('tbody', {}, colRows)))),
          structs.length || arrays.length ? el('li', {}, el('h4', {}, 'Nested data'),
            el('div', { class: 'cx-inline' }, structs.length ? el('label', { class: 'lbl' }, 'Objects (struct)', flat) : null,
              arrays.length ? el('label', { class: 'lbl' }, 'One row per item of', expl) : null)) : null,
          el('li', {}, el('h4', {}, 'Calculated columns'), el('p', { class: 'muted small' }, 'Spark SQL expressions over the columns above.'), derivedBox),
          el('li', {}, el('h4', {}, 'Keep only rows where'), filt),
          el('li', {}, el('h4', {}, 'Remove duplicates (window)'),
            el('p', { class: 'muted small' }, 'ROW_NUMBER() OVER (PARTITION BY keys ORDER BY column) = 1 — one row per key. Upsert syncs always de-duplicate by their key.'),
            el('div', { class: 'cx-inline' }, el('label', { class: 'lbl' }, 'Key column(s)', dkeys), el('label', { class: 'lbl' }, 'Keep the row with the', ddesc), el('label', { class: 'lbl' }, 'value of', dorder)))),
        el('div', { class: 'row', style: { gap: '8px' } }, btn('Preview result', () => run(true), { cls: 'primary', ic: 'play' }), btn('Show source sample', () => run(false), { cls: 'ghost' })),
        err, result);
    }
    run(false);
    return el('div', { class: 'dlg cx-tr-dlg' },
      el('div', { class: 'row' }, el('h2', { class: 'grow' }, 'Map & transform ', el('span', { class: 'mono muted', style: { fontSize: '14px' } }, stream)), btn('Close', () => close(null), { cls: 'sm' })),
      el('p', { class: 'muted small' }, 'Applied by Spark every run, in this order: structure → columns → calculated columns → filter → remove duplicates. Then the table is written.'),
      body,
      el('div', { class: 'actions' }, btn('Cancel', () => close(null), { cls: 'ghost' }),
        btn('Use these steps', () => { cfg.transform = spec(); cfg.nested = nested; close(true); }, { cls: 'primary', ic: 'check' })));
  }, { wide: true });
}
