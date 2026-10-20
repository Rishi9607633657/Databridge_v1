/* DataBridge Data Hub — Import file (CSV / Excel -> Delta) and Connectors (Airbyte, in DataBridge's own UI). Loaded before app.js. */
'use strict';

const DH_TABS = [['import', 'Import file', 'data_hub'], ['connections', 'Connections', 'data_hub'], ['syncs', 'Syncs', 'data_hub'], ['tenants', 'Tenants', 'data_hub'], ['catalog', 'Connectors (580+)', 'data_hub'], ['history', 'Import history', 'data_hub']];

async function viewDataHub(main, r) {
  const tabs = DH_TABS.filter(([, , f]) => dbFeat(f));
  let tab = r.params.get('tab') || 'import';
  if (!tabs.some(([k]) => k === tab) && !(['connectors', 'airbyte-server'].includes(tab) && dbFeat('airbyte'))) tab = tabs[0] ? tabs[0][0] : 'import';
  main.append(el('div', { class: 'page-head', style: { marginBottom: '4px' } },
    el('div', { class: 'grow' }, el('h1', {}, 'Data Hub'),
      el('p', { class: 'muted small', style: { margin: '2px 0 0' } }, 'Bring data in: upload files, connect databases and apps, keep them in sync.'))),
  el('div', { class: 'tabs', role: 'tablist', style: { marginTop: 0 } }, tabs.map(([k, l]) =>
    el('button', { type: 'button', role: 'tab', 'aria-selected': String(tab === k), onClick: () => (location.hash = `#/datahub?tab=${k}`) }, l))));
  const body = el('div', { class: 'dh' });
  main.append(body);
  if (tab === 'catalog') return dhCatalog(body);
  if (tab === 'tenants') return dhTenants(body);
  if (tab === 'connectors' || tab === 'airbyte-server') return dhConnectors(body);   // optional external Airbyte server
  if (tab === 'connections') return dhConnections(body);
  if (tab === 'syncs') return dhSyncs(body);
  if (tab === 'history') return dhHistory(body);
  return dhImport(body);
}

/* ---------------- Import file wizard ---------------- */
const DH_STEPS = ['Upload', 'Preview', 'Map columns', 'Load'];
const DH_TYPE_LABEL = { string: 'Text', bigint: 'Whole number', double: 'Decimal', 'decimal(18,2)': 'Money (2 dp)', boolean: 'True / false', date: 'Date', timestamp: 'Date & time' };

function dhStepper(cur) {
  return el('ol', { class: 'dh-steps' }, DH_STEPS.map((s, i) => el('li', { class: i < cur ? 'done' : i === cur ? 'on' : '' },
    el('span', { class: 'n' }, i < cur ? '✓' : String(i + 1)), s)));
}

function dhUpload(file, onProgress) {
  return new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open('POST', `/api/datahub/uploads?filename=${encodeURIComponent(file.name)}`);
    x.setRequestHeader('Content-Type', 'application/octet-stream');
    x.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    x.onload = () => {
      let d = null; try { d = JSON.parse(x.responseText); } catch { /* text */ }
      if (x.status >= 400) reject(new Error((d && (typeof d.detail === 'string' ? d.detail : JSON.stringify(d.detail))) || x.statusText));
      else resolve(d);
    };
    x.onerror = () => reject(new Error('Upload failed (network)'));
    x.send(file);
  });
}

const fmtBytesDH = (n) => (n == null ? '—' : n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : n < 1073741824 ? `${(n / 1048576).toFixed(1)} MB` : `${(n / 1073741824).toFixed(2)} GB`);

async function dhImport(body) {
  if (canEditDH()) api('/api/datahub/warm', { method: 'POST' }).catch(() => {});   // start Spark now, so Load is instant later
  const S = { step: 0, upload: null, prev: null, opts: {}, cols: [] };
  const box = el('div');
  body.append(box);
  draw();

  function draw() {
    box.replaceChildren(dhStepper(S.step), [stepUpload, stepPreview, stepMap, stepLoad][S.step]());
  }

  function stepUpload() {
    const input = el('input', { type: 'file', accept: '.csv,.tsv,.txt,.xlsx,.xlsm,.xls,.json,.jsonl,.ndjson,.parquet', hidden: true, onChange: () => input.files[0] && go(input.files[0]) });
    const bar = el('div', { class: 'dh-bar' }, el('span'));
    const msg = el('div', { class: 'muted small' }, 'CSV, TSV, TXT, Excel, JSON / JSON Lines or Parquet · up to 200 MB · every sheet of a workbook can be loaded');
    const drop = el('div', { class: 'dh-drop', tabindex: '0', role: 'button', 'aria-label': 'Choose a file to upload',
      onClick: () => input.click(), onKeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } } },
    icon('upload', 34), el('b', {}, 'Drop a file here or click to browse'), msg, bar, input);
    ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
    drop.addEventListener('drop', (e) => { const f = e.dataTransfer.files[0]; if (f) go(f); });
    async function go(f) {
      drop.classList.add('busy'); msg.textContent = `Uploading ${f.name} (${fmtBytesDH(f.size)})…`;
      try {
        S.upload = await dhUpload(f, (p) => { bar.firstChild.style.width = `${Math.round(p * 100)}%`; });
        S.opts = S.upload.sheets ? { sheet: S.upload.sheets[0], header: true } : { header: true };
        msg.textContent = 'Reading the file…';
        await refresh();
        S.step = 1; draw();
      } catch (e) { toast(e.message, 'err'); drop.classList.remove('busy'); msg.textContent = 'Try another file.'; bar.firstChild.style.width = '0'; }
    }
    return el('section', { class: 'panel' }, drop,
      el('div', { class: 'dh-tips' },
        el('div', {}, el('b', {}, 'Smart detection'), el('span', {}, 'Delimiter, encoding, header and column types are detected for you.')),
        el('div', {}, el('b', {}, 'Your rules'), el('span', {}, 'Rename columns, change types, skip columns, remove duplicates.')),
        el('div', {}, el('b', {}, 'Ready to use'), el('span', {}, 'Lands as a Delta table in the Catalog — query it or build a dashboard.'))));
  }

  async function refresh() {
    S.prev = await api(`/api/datahub/uploads/${S.upload.id}/preview`, { method: 'POST', body: S.opts });
    S.opts = { ...S.opts, ...S.prev.options };
    S.cols = S.prev.columns.map((c) => ({ ...c }));
    S.table = S.table && S.keepName ? S.table : S.prev.suggested_table;
  }

  function stepPreview() {
    const P = S.prev; const U = S.upload;
    const reparse = async (patch) => {
      Object.assign(S.opts, patch);
      wrap.replaceChildren(loading('Re-reading the file…'));
      try { await refresh(); draw(); } catch (e) { wrap.replaceChildren(errBox(e)); }
    };
    const ctl = [];
    if (U.sheets) {
      ctl.push(el('label', { class: 'lbl' }, 'Sheet', el('select', { class: 'field', onChange: (e) => reparse({ sheet: e.target.value }) },
        U.sheets.map((s) => el('option', { value: s, selected: s === S.opts.sheet }, s)))));
    } else {
      ctl.push(el('label', { class: 'lbl' }, 'Delimiter', el('select', { class: 'field', onChange: (e) => reparse({ delimiter: e.target.value }) },
        [[',', 'Comma ,'], [';', 'Semicolon ;'], ['\t', 'Tab'], ['|', 'Pipe |']].map(([v, l]) => el('option', { value: v, selected: v === S.opts.delimiter }, l)))));
      ctl.push(el('label', { class: 'lbl' }, 'Encoding', el('select', { class: 'field', onChange: (e) => reparse({ encoding: e.target.value }) },
        [['utf-8-sig', 'UTF-8'], ['utf-8', 'UTF-8 (no BOM)'], ['latin-1', 'Latin-1 / Windows'], ['utf-16', 'UTF-16']].map(([v, l]) => el('option', { value: v, selected: v === S.opts.encoding }, l)))));
    }
    ctl.push(el('label', { class: 'lbl' }, 'Skip rows at top', el('input', { class: 'field', type: 'number', min: 0, value: S.opts.skip_rows || 0, style: { width: '90px' },
      onChange: (e) => reparse({ skip_rows: Number(e.target.value) || 0 }) })));
    ctl.push(el('label', { class: 'switch', style: { alignSelf: 'end', paddingBottom: '8px' } },
      el('input', { type: 'checkbox', checked: S.opts.header !== false, onChange: (e) => reparse({ header: e.target.checked }) }), 'First row is the header'));
    const wrap = el('div', { class: 'dh-grid-wrap' }, el('table', { class: 't dh-grid' },
      el('thead', {}, el('tr', {}, el('th', { class: 'rn' }, '#'), P.headers.map((h, i) => el('th', {}, h, el('div', { class: 'dh-ty' }, DH_TYPE_LABEL[P.columns[i].type]))))),
      el('tbody', {}, P.rows.map((row, i) => el('tr', {}, el('td', { class: 'rn' }, String(i + 1)), row.map((v) => el('td', { class: v == null ? 'nul' : '' }, v == null ? 'null' : v)))))));
    return el('section', { class: 'panel' },
      el('div', { class: 'panel-head' }, el('div', { class: 'grow' }, el('h3', {}, U.filename),
        el('div', { class: 'muted small' }, `${fmtBytesDH(U.size)} · ${P.columns.length} columns · ${P.rows_scanned >= 5000 ? '5,000+ rows' : `${P.rows_scanned.toLocaleString()} rows`} scanned · showing first ${P.rows.length}`)),
      btn('Start over', () => discard(), { ic: 'back' }), btn('Next: map columns', () => { S.step = 2; draw(); }, { cls: 'primary' })),
      el('div', { class: 'row dh-ctl' }, ctl), wrap);
  }

  async function discard() {
    if (S.upload) api(`/api/datahub/uploads/${S.upload.id}`, { method: 'DELETE' }).catch(() => {});
    Object.assign(S, { step: 0, upload: null, prev: null, opts: {}, cols: [], table: null, keepName: false }); draw();
  }

  function stepMap() {
    const types = S.prev.types;
    const count = el('span', { class: 'muted small' });
    const upd = () => { count.textContent = `${S.cols.filter((c) => c.include).length} of ${S.cols.length} columns selected`; };
    upd();
    const allBox = el('input', { type: 'checkbox', checked: S.cols.every((c) => c.include), 'aria-label': 'Select all columns',
      onChange: (e) => { S.cols.forEach((c) => { c.include = e.target.checked; }); draw(); } });
    const rows = S.cols.map((c) => el('tr', { class: c.include ? '' : 'off' },
      el('td', {}, el('input', { type: 'checkbox', checked: c.include, 'aria-label': `Include ${c.source}`,
        onChange: (e) => { c.include = e.target.checked; e.target.closest('tr').classList.toggle('off', !c.include); upd(); } })),
      el('td', {}, el('b', {}, c.source), el('div', { class: 'muted small mono' }, (c.sample || []).filter((x) => x != null).join(' · ') || '—')),
      el('td', {}, '→'),
      el('td', {}, el('input', { class: 'field mono', value: c.name, 'aria-label': `Column name for ${c.source}`,
        onInput: (e) => { c.name = e.target.value.trim(); e.target.classList.toggle('bad', !/^[A-Za-z_][A-Za-z0-9_]*$/.test(c.name)); } })),
      el('td', {}, el('select', { class: 'field', 'aria-label': `Type for ${c.source}`, onChange: (e) => { c.type = e.target.value; } },
        types.map((t) => el('option', { value: t, selected: t === c.type }, DH_TYPE_LABEL[t] || t)))),
      el('td', { class: 'num' }, c.nulls ? el('span', { class: 'dh-warn' }, c.nulls.toLocaleString()) : '0'),
      el('td', { class: 'num' }, c.distinct.toLocaleString())));
    return el('section', { class: 'panel' },
      el('div', { class: 'panel-head' }, el('div', { class: 'grow' }, el('h3', {}, 'Map columns'),
        el('div', { class: 'muted small' }, 'Choose the columns to keep, rename them, and set their types. Values that cannot be converted are loaded as null and reported.')),
      count, btn('Back', () => { S.step = 1; draw(); }, { ic: 'back' }), btn('Next: load', () => {
        const inc = S.cols.filter((c) => c.include);
        if (!inc.length) return toast('Select at least one column', 'err');
        const bad = inc.find((c) => !/^[A-Za-z_][A-Za-z0-9_]*$/.test(c.name));
        if (bad) return toast(`Bad column name "${bad.name}" — use letters, digits and _`, 'err');
        const names = inc.map((c) => c.name.toLowerCase());
        const dup = names.find((n, i) => names.indexOf(n) !== i);
        if (dup) return toast(`Column name "${dup}" is used twice`, 'err');
        S.step = 3; draw();
      }, { cls: 'primary' })),
      el('div', { class: 'dh-grid-wrap' }, el('table', { class: 't dh-map' },
        el('thead', {}, el('tr', {}, el('th', { style: { width: '32px' } }, allBox), el('th', {}, 'Source column'), el('th', {}), el('th', {}, 'Target name'), el('th', {}, 'Type'), el('th', { class: 'num' }, 'Empty'), el('th', { class: 'num' }, 'Distinct'))),
        el('tbody', {}, rows))));
  }

  function stepLoad() {
    const result = el('div', { class: 'dh-res' });
    const dl = el('datalist', { id: 'dh-schemas' });
    api('/api/catalog/databases').then((dbs) => dl.replaceChildren(...(dbs || []).map((d) => el('option', { value: d.name || d })))).catch(() => {});
    const f = {
      schema: el('input', { class: 'field mono', value: S.schema || 'default', list: 'dh-schemas', 'aria-label': 'Schema' }),
      table: el('input', { class: 'field mono', value: S.table || '', 'aria-label': 'Table name', onInput: () => { S.keepName = true; } }),
      mode: el('select', { class: 'field', 'aria-label': 'If the table exists' }, [['create', 'Create new (fail if it exists)'], ['overwrite', 'Replace the table'], ['append', 'Append rows']].map(([v, l]) => el('option', { value: v }, l))),
      format: el('select', { class: 'field', 'aria-label': 'Format' }, [['delta', 'Delta (recommended)'], ['parquet', 'Parquet']].map(([v, l]) => el('option', { value: v }, l))),
      dedupe: el('input', { type: 'checkbox' }), drop_empty: el('input', { type: 'checkbox', checked: true }),
    };
    const inc = S.cols.filter((c) => c.include);
    const go = btn('Load to table', async () => {
      const body = { schema: f.schema.value.trim(), table: f.table.value.trim(), mode: f.mode.value, format: f.format.value,
        dedupe: f.dedupe.checked, drop_empty: f.drop_empty.checked, options: S.opts, columns: S.cols };
      S.schema = body.schema; S.table = body.table;
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(body.schema) || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(body.table)) return toast('Schema and table: letters, digits and _ only', 'err');
      go.disabled = true;
      result.replaceChildren(loading('Loading into Spark — the first run can take a minute while Spark starts…'));
      try {
        const res = await api(`/api/datahub/uploads/${S.upload.id}/load`, { method: 'POST', body });
        delete (typeof CAT !== 'undefined' ? CAT.tables : {})[res.schema];
        result.replaceChildren(dhResult(res, () => discard()));
        toast(`Loaded ${res.rows.toLocaleString()} rows into ${res.schema}.${res.table}`);
      } catch (e) { result.replaceChildren(errBox(e)); go.disabled = false; }
    }, { cls: 'primary', ic: 'play' });
    return el('section', { class: 'panel' },
      el('div', { class: 'panel-head' }, el('div', { class: 'grow' }, el('h3', {}, 'Load into a table'),
        el('div', { class: 'muted small' }, `${inc.length} columns from ${S.upload.filename}${S.opts.sheet ? ` › ${S.opts.sheet}` : ''}`)),
      btn('Back', () => { S.step = 2; draw(); }, { ic: 'back' }), go),
      el('div', { class: 'dh-form' }, dl,
        el('label', { class: 'lbl' }, 'Schema', f.schema), el('label', { class: 'lbl' }, 'Table name', f.table),
        el('label', { class: 'lbl' }, 'If the table exists', f.mode), el('label', { class: 'lbl' }, 'Format', f.format),
        el('label', { class: 'switch' }, f.drop_empty, 'Skip empty rows'), el('label', { class: 'switch' }, f.dedupe, 'Remove duplicate rows')),
      el('div', { class: 'dh-schema' }, inc.map((c) => el('span', { class: 'chip' }, el('b', { class: 'mono' }, c.name), ` ${DH_TYPE_LABEL[c.type] || c.type}`))),
      result);
  }
}

function dhResult(res, again) {
  const fq = `${res.schema}.${res.table}`;
  const issues = Object.entries(res.issues || {});
  return el('div', { class: 'dh-done' },
    el('div', { class: 'dh-done-ic' }, icon('check', 22)),
    el('div', { class: 'grow' }, el('h3', {}, `${fq} is ready`),
      el('div', { class: 'muted small' }, `${res.rows.toLocaleString()} rows · ${res.columns} columns · ${res.format} · ${res.seconds}s`),
      issues.length ? el('div', { class: 'dh-warn small', style: { marginTop: '6px' } }, 'Some values could not be converted and were loaded as null: ',
        issues.map(([c, n]) => `${c} (${n})`).join(', ')) : null,
      el('div', { class: 'row', style: { gap: '8px', marginTop: '12px', flexWrap: 'wrap' } },
        btn('Open in Catalog', () => (location.hash = `#/catalog?db=${encodeURIComponent(res.schema)}&table=${encodeURIComponent(res.table)}`), { ic: 'db' }),
        dbFeat('dashboards_ai') && typeof dbAiDialog === 'function' ? btn('Build dashboard with AI', () => dbAiDialog({ tables: [fq] }), { ic: 'chart' }) : null,
        dbFeat('sql_editor') ? btn('Copy SQL', () => { navigator.clipboard?.writeText(`SELECT * FROM ${fq} LIMIT 100`); toast('Query copied — paste it in the SQL editor'); }, { ic: 'term' }) : null,
        btn('Import another file', again, { ic: 'upload' }))));
}

async function dhHistory(body) {
  body.append(loading());
  let h;
  try { h = await api('/api/datahub/imports'); } catch (e) { body.replaceChildren(errBox(e)); return; }
  if (!h.length) {
    body.replaceChildren(el('div', { class: 'empty' }, el('h2', {}, 'No imports yet'), el('p', {}, 'Files you load appear here.'),
      el('a', { class: 'btn primary', href: '#/datahub?tab=import' }, 'Import a file'))); return;
  }
  body.replaceChildren(el('section', { class: 'panel' }, el('table', { class: 't' },
    el('thead', {}, el('tr', {}, ['When', 'File', 'Table', 'Mode', 'Rows', 'Columns', 'Null-ed values', 'By'].map((x) => el('th', {}, x)))),
    el('tbody', {}, h.map((x) => el('tr', { class: 'clickable', onClick: () => (location.hash = `#/catalog?db=${encodeURIComponent(x.schema)}&table=${encodeURIComponent(x.table)}`) },
      el('td', {}, ago(x.at)), el('td', {}, x.file, x.sheet ? el('span', { class: 'muted' }, ` › ${x.sheet}`) : null),
      el('td', { class: 'mono' }, `${x.schema}.${x.table}`), el('td', {}, x.mode), el('td', { class: 'num' }, (x.rows || 0).toLocaleString()),
      el('td', { class: 'num' }, String(x.columns)), el('td', { class: 'num' }, String(Object.values(x.issues || {}).reduce((a, b) => a + b, 0))), el('td', {}, x.user || '—')))))));
}

/* ---------------- Connectors (Airbyte) ---------------- */
const AB_STATE = { succeeded: 'var(--ok)', failed: 'var(--fail)', running: 'var(--run)', pending: 'var(--wait)', incomplete: 'var(--retry)', cancelled: '#6B6F76' };
const abState = (s) => el('span', { class: 'state' }, el('span', { class: 'dot', style: { background: AB_STATE[s] || 'var(--line-strong)' } }), s ? s[0].toUpperCase() + s.slice(1) : 'Never synced');
const AB_SCHEDULES = [['', 'Manual (Sync now only)'], ['0 0 * * * ?', 'Every hour'], ['0 0 */6 * * ?', 'Every 6 hours'], ['0 0 2 * * ?', 'Daily at 02:00'], ['0 0 2 ? * MON', 'Weekly, Monday 02:00'], ['custom', 'Custom (Quartz cron)…']];
function abDur(iso) {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:([\d.]+)S)?/.exec(iso || ''); if (!m) return '—';
  const s = (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + Math.round(+m[3] || 0);
  return s < 60 ? `${s}s` : s < 3600 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}
const abSched = (c) => { const s = c.schedule || {}; if (s.scheduleType !== 'cron') return s.scheduleType === 'basic' ? 'Basic schedule' : 'Manual'; const f = AB_SCHEDULES.find(([v]) => v === s.cronExpression); return f ? f[1] : s.cronExpression; };
const canEditDH = () => !!CURRENT_USER && CURRENT_USER.role !== 'viewer';

async function dhConnectors(body) {
  body.append(loading());
  let st;
  try { st = await api('/api/airbyte/status'); } catch (e) { body.replaceChildren(errBox(e)); return; }
  if (!st.configured) { body.replaceChildren(abSetup()); return; }
  let O = null; let timer = null;
  const head = el('div', { class: 'row dh-ab-head' });
  const list = el('div', { class: 'stack', style: { gap: '16px' } }, loading('Talking to Airbyte…'));
  body.replaceChildren(head, list);
  async function reload(quiet) {
    if (!quiet) list.replaceChildren(loading('Talking to Airbyte…'));
    let L;
    try { [O, L] = await Promise.all([api('/api/airbyte/overview'), api('/api/airbyte/landing').catch(() => ({}))]); } catch (e) { list.replaceChildren(errBox(e)); return; }
    O.landing = L || {};
    draw();
    clearTimeout(timer);
    if (O.connections.some((c) => c.lastJob && ['running', 'pending'].includes(c.lastJob.status)) || Object.values(O.landing).some((l) => l.running || (l.last_run && l.last_run.status === 'running'))) timer = setTimeout(() => document.body.contains(body) && reload(true), 8000);
  }
  const ui = (p = '') => `${O.ui_url}/workspaces/${O.workspaceId}${p}`;
  function draw() {
    const running = O.connections.filter((c) => c.lastJob && c.lastJob.status === 'running').length;
    const failed = O.connections.filter((c) => c.lastJob && c.lastJob.status === 'failed').length;
    head.replaceChildren(
      el('div', { class: 'dh-stats' },
        el('div', {}, el('b', {}, String(O.connections.length)), 'Connections'), el('div', {}, el('b', {}, String(O.sources.length)), 'Sources'),
        el('div', {}, el('b', {}, String(O.destinations.length)), 'Destinations'),
        el('div', { class: running ? 'run' : '' }, el('b', {}, String(running)), 'Syncing'), el('div', { class: failed ? 'bad' : '' }, el('b', {}, String(failed)), 'Failed')),
      el('span', { class: 'grow' }),
      btn('', () => reload(), { ic: 'refresh', title: 'Refresh' }),
      canEditDH() ? btn('New source', () => abNewObj('source', reload), { ic: 'plus' }) : null,
      canEditDH() ? btn('New destination', () => abNewObj('destination', reload), { ic: 'plus' }) : null,
      canEditDH() ? btn('New connection', () => abNewConn(O, reload), { cls: 'primary', ic: 'plus' }) : null,
      el('a', { class: 'btn', href: ui('/connections'), target: '_blank', rel: 'noopener' }, icon('ext', 16), 'Open Airbyte'));
    const connRows = O.connections.map((c) => {
      const j = c.lastJob;
      const active = c.status === 'active';
      return el('tr', {},
        el('td', {}, el('b', {}, c.name), el('div', { class: 'muted small' }, abSched(c))),
        el('td', {}, el('div', { class: 'dh-flow' }, el('span', { class: 'chip ab-chip' }, abLogo('source', c.sourceType, 16), c.sourceName || '?'), '→', el('span', { class: 'chip ab-chip' }, abLogo('destination', c.destinationType, 16), c.destinationName || '?')),
          el('div', { class: 'muted small' }, `${c.sourceType || ''} → ${c.destinationType || ''}`)),
        el('td', {}, abState(j && j.status), j ? el('div', { class: 'muted small' }, `${ago(j.startTime)}${j.duration ? ` · ${abDur(j.duration)}` : ''}`) : null),
        el('td', { class: 'num' }, j && j.rowsSynced != null ? Number(j.rowsSynced).toLocaleString() : '—', j && j.bytesSynced ? el('div', { class: 'muted small' }, fmtBytesDH(j.bytesSynced)) : null),
        el('td', {}, el('label', { class: 'switch', title: active ? 'Enabled (scheduled syncs run)' : 'Paused' },
          el('input', { type: 'checkbox', checked: active, disabled: !canEditDH(), 'aria-label': `Enable ${c.name}`,
            onChange: async (e) => { try { await api(`/api/airbyte/connections/${c.connectionId}/status`, { method: 'POST', body: { active: e.target.checked } }); toast(e.target.checked ? 'Connection enabled' : 'Connection paused'); reload(true); } catch (er) { toast(er.message, 'err'); e.target.checked = !e.target.checked; } } }),
          active ? 'On' : 'Paused')),
        el('td', {}, abLandCell(c, O.landing[c.connectionId], reload)),
        el('td', { class: 'dh-act' },
          canEditDH() ? (j && j.status === 'running'
            ? btn('Cancel', async () => { try { await api(`/api/airbyte/jobs/${j.jobId}`, { method: 'DELETE' }); toast('Cancelling…'); reload(true); } catch (e) { toast(e.message, 'err'); } }, { cls: 'sm', ic: 'stop' })
            : btn('Sync now', async (e) => { e.currentTarget.disabled = true; try { await api(`/api/airbyte/connections/${c.connectionId}/run`, { method: 'POST', body: { job_type: 'sync' } }); toast(`Sync started: ${c.name}`); reload(true); } catch (er) { toast(er.message, 'err'); } }, { cls: 'sm primary', ic: 'play' })) : null,
          btn('', () => abJobs(c), { cls: 'sm', ic: 'history', title: 'Sync history' }),
          el('a', { class: 'btn sm', href: ui(`/connections/${c.connectionId}/status`), target: '_blank', rel: 'noopener', title: 'Edit streams & settings in Airbyte' }, icon('ext', 16)),
          canEditDH() ? btn('', () => abDelete('connections', c.connectionId, c.name, reload), { cls: 'sm', ic: 'trash', title: 'Delete connection' }) : null));
    });
    const objPanel = (title, kind, items, idKey, typeKey) => el('section', { class: 'panel' },
      el('div', { class: 'panel-head' }, el('h3', { class: 'grow' }, title), el('span', { class: 'muted small' }, `${items.length}`)),
      items.length ? el('table', { class: 't' }, el('tbody', {}, items.map((s) => el('tr', {},
        el('td', {}, el('div', { class: 'ab-name' }, abLogo(kind === 'sources' ? 'source' : 'destination', s[typeKey], 22), el('b', {}, s.name))), el('td', { class: 'muted' }, s[typeKey] || ''),
        el('td', { class: 'muted small' }, `${O.connections.filter((c) => c[kind === 'sources' ? 'sourceId' : 'destinationId'] === s[idKey]).length} connection(s)`),
        el('td', { class: 'dh-act' }, el('a', { class: 'btn sm', href: ui(`/${kind === 'sources' ? 'source' : 'destination'}/${s[idKey]}`), target: '_blank', rel: 'noopener', title: 'Edit in Airbyte' }, icon('ext', 16)),
          canEditDH() ? btn('', () => abDelete(kind, s[idKey], s.name, reload), { cls: 'sm', ic: 'trash', title: 'Delete' }) : null))))) : el('p', { class: 'muted small', style: { margin: '4px 0' } }, 'None yet.'));
    list.replaceChildren(
      el('section', { class: 'panel' }, el('div', { class: 'panel-head' }, el('h3', { class: 'grow' }, 'Connections'),
        el('span', { class: 'muted small' }, 'A connection copies data from a source into a destination on a schedule')),
      O.connections.length ? el('div', { class: 'dh-grid-wrap' }, el('table', { class: 't dh-conns' },
        el('thead', {}, el('tr', {}, ['Name', 'Source → Destination', 'Last sync', 'Rows', 'Enabled', 'In Catalog', ''].map((x) => el('th', { class: x === 'Rows' ? 'num' : '' }, x)))),
        el('tbody', {}, connRows)))
        : el('div', { class: 'empty', style: { padding: '24px' } }, el('h2', {}, 'No connections yet'),
          el('p', {}, '1. Add a source (database, SFTP, app)  ·  2. Add a destination  ·  3. Create a connection and press Sync now.'))),
      el('div', { class: 'dh-two' }, objPanel('Sources', 'sources', O.sources, 'sourceId', 'sourceType'), objPanel('Destinations', 'destinations', O.destinations, 'destinationId', 'destinationType')));
  }
  reload();
  return () => clearTimeout(timer);
}

function abSetup() {
  const admin = CURRENT_USER && ['admin', 'super_admin'].includes(CURRENT_USER.role);
  const step = (n, t, d) => el('li', {}, el('span', { class: 'n' }, String(n)), el('div', {}, el('b', {}, t), el('div', { class: 'muted small' }, d)));
  return el('section', { class: 'panel dh-setup' },
    el('div', { class: 'panel-head' }, el('div', { class: 'grow' }, el('h3', {}, 'Connect Airbyte to unlock 300+ connectors'),
      el('div', { class: 'muted small' }, 'Databases (Postgres, MySQL, SQL Server, Oracle, MongoDB), SFTP and S3 files, Google Sheets, Salesforce, HubSpot, Shopify, Razorpay and more — managed right here.'))),
    el('ol', { class: 'dh-setup-steps' },
      step(1, 'Install Airbyte (free, open source)', 'Windows: download abctl.exe from github.com/airbytehq/abctl/releases, then  abctl local install --low-resource-mode --port 8010   ·  Linux/Mac: curl -LsfS https://get.airbyte.com | bash -'),
      step(2, 'Create an application', 'Run  abctl local credentials  — it prints the login email/password and the Client-Id and Client-Secret.'),
      step(3, 'Connect it to DataBridge', 'Admin › Settings › Airbyte: set the URL (http://localhost:8010, or http://host.docker.internal:8010 if DataBridge runs in Docker), Client ID and Client secret, then Save.')),
    admin ? el('a', { class: 'btn primary', href: '#/admin?tab=settings' }, icon('gear', 16), 'Open Admin › Settings')
      : el('p', { class: 'muted small' }, 'Ask your administrator to connect Airbyte.'));
}

/* connector logo (served + cached by DataBridge); falls back to a letter badge */
function abLogo(kind, type, size = 28) {
  const letter = el('span', { class: 'ab-logo ab-letter', style: { width: `${size}px`, height: `${size}px`, fontSize: `${Math.round(size * 0.45)}px` } }, (type || '?').slice(0, 1).toUpperCase());
  if (!type) return letter;
  const img = el('img', { class: 'ab-logo', src: `/api/airbyte/icons/${kind}/${encodeURIComponent(String(type).toLowerCase())}`, alt: '', width: size, height: size, loading: 'lazy' });
  img.addEventListener('error', () => img.replaceWith(letter));
  return img;
}

const AB_CAT_LABEL = { database: 'Databases', api: 'Apps & APIs', file: 'Files', custom: 'Custom', vectorstore: 'Vector stores' };
const AB_CACHE = {};

/* Step 1: gallery of every Airbyte connector, with logos, search and categories */
function abGallery(kind, list, offline, pick, logoFn) {
  let q = ''; let cat = 'all';
  const cats = ['all', ...new Set(list.map((c) => c.category).filter(Boolean))];
  const grid = el('div', { class: 'ab-grid' });
  const count = el('span', { class: 'muted small' });
  const search = el('input', { class: 'field', type: 'search', placeholder: `Search ${list.length} ${kind === 'source' ? 'sources' : 'destinations'}… (e.g. postgres, sftp, shopify)`, 'aria-label': 'Search connectors',
    onInput: (e) => { q = e.target.value.trim().toLowerCase(); draw(); } });
  const chips = el('div', { class: 'ab-cats' });
  function drawChips() {
    chips.replaceChildren(...cats.map((c) => el('button', { type: 'button', class: `ab-cat ${c === cat ? 'on' : ''}`, onClick: () => { cat = c; drawChips(); draw(); } },
      c === 'all' ? 'All' : (AB_CAT_LABEL[c] || c))));
  }
  function draw() {
    const hit = list.filter((c) => (cat === 'all' || c.category === cat) && (!q || `${c.name} ${c.type}`.toLowerCase().includes(q)));
    count.textContent = `${hit.length} connector${hit.length === 1 ? '' : 's'}`;
    grid.replaceChildren(...[...hit.slice(0, 150).map((c) => el('button', { type: 'button', class: 'ab-card', title: c.name, onClick: () => pick(c) },
      logoFn ? logoFn(c, 34) : abLogo(kind, c.type, 34), el('span', { class: 'ab-card-name' }, c.name),
      c.support === 'certified' ? el('span', { class: 'ab-badge' }, 'Certified') : null)),
    hit.length > 150 ? el('div', { class: 'muted small ab-more' }, `…and ${hit.length - 150} more — type to narrow down`) : null,
    !hit.length ? el('div', { class: 'muted ab-more' }, 'No connector matches.') : null].filter(Boolean));
  }
  drawChips(); draw();
  setTimeout(() => search.focus(), 0);
  return el('div', { class: 'ab-gallery' },
    offline ? el('div', { class: 'dh-warn small' }, 'Offline: showing the built-in list. Connect to the internet once to load all 600+ connectors.') : null,
    el('div', { class: 'row', style: { gap: '10px', alignItems: 'center' } }, el('div', { class: 'grow' }, search), count), chips, grid);
}

/* Dates in connector specs: show a date (and time) picker and send exactly the format the connector's pattern wants
   (2021-03-01T00:00:00Z, 2021-03-01T00:00:00.000Z, 2021-03-01, 2021-03 …) — people never type the format by hand. */
const AB_DATE_RE = /\[0-9\]\{4\}-\[0-9\]\{2\}/;
function abIsDateField(p) {
  const t = Array.isArray(p.type) ? p.type.find((x) => x !== 'null') : p.type;
  return t === 'string' && !p.enum && (p.format === 'date-time' || p.format === 'date' || AB_DATE_RE.test(p.pattern || ''));
}
function abDateField(title, p, required, dv, errs, help) {
  const pat = p.pattern || '';
  const monthOnly = /^\^?\[0-9\]\{4\}-\[0-9\]\{2\}\$?$/.test(pat);
  const withTime = !monthOnly && (p.format === 'date-time' || /T|:\[0-9\]|\s\[0-9\]\{2\}:/.test(pat.replace(/^\^?\[0-9\]\{4\}-\[0-9\]\{2\}-\[0-9\]\{2\}/, '')));
  const cur = String(dv ?? (p.examples ? [].concat(p.examples)[0] : '') ?? '');
  const m = /^(\d{4}-\d{2}(?:-\d{2})?)(?:[T ](\d{2}:\d{2}(?::\d{2})?))?/.exec(dv != null ? String(dv) : '');
  const date = el('input', { class: 'field', type: monthOnly ? 'month' : 'date', value: m ? m[1] : '', 'aria-label': title });
  const time = withTime ? el('input', { class: 'field', type: 'time', step: '1', value: m && m[2] ? (m[2].length === 5 ? `${m[2]}:00` : m[2]) : '00:00:00', 'aria-label': `${title} time` }) : null;
  const tz = withTime ? el('span', { class: 'muted small' }, 'UTC') : null;
  const preview = el('div', { class: 'ab-help mono' });
  let re = null;
  try { re = pat ? new RegExp(pat) : null; } catch { re = null; }
  const value = () => {
    if (!date.value) return undefined;
    if (monthOnly) return date.value.slice(0, 7);
    const d = date.value;
    const t = time && time.value ? (time.value.length === 5 ? `${time.value}:00` : time.value) : '00:00:00';
    const cands = withTime ? [`${d}T${t}Z`, `${d}T${t}.000Z`, `${d}T${t}`, `${d} ${t}`, `${d}T${t}+00:00`, d] : [d, `${d}T${t}Z`];
    return (re && cands.find((c) => re.test(c))) || (p.format === 'date' ? d : cands[0]);
  };
  const show = () => { const v = value(); preview.textContent = v ? `Sent as ${v}` : (cur ? `e.g. ${cur}` : ''); };
  date.addEventListener('input', show); if (time) time.addEventListener('input', show); show();
  const node = el('div', { class: 'lbl ab-field' }, el('span', {}, title, required ? el('span', { class: 'req' }, '*') : null),
    el('div', { class: 'ab-date' }, date, time, tz), preview, help(p));
  return { node, get: () => { const v = value(); if (required && !v) errs.push(`${title} is required`); return v; } };
}

/* Step 2: a form generated from the connector's JSON-schema spec */
function abSpecForm(schema, values) {
  const errs = [];
  const label = (k, p) => p.title || k.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
  const help = (p) => (p.description ? el('div', { class: 'ab-help', html: DOMPurify.sanitize(marked.parseInline(String(p.description).slice(0, 400))) }) : null);
  const has = (v) => v !== undefined && v !== null;
  function field(k, p, required, path, val) {
    const title = label(k, p);
    if (p.const !== undefined) return { node: null, get: () => p.const };
    if (Array.isArray(p.oneOf) && p.oneOf.length) return oneOf(k, p, required, path, val);
    const t = Array.isArray(p.type) ? p.type.find((x) => x !== 'null') : p.type;
    if (t === 'object' && p.properties) {
      const sub = obj(p, `${path}${k}.`, val);
      const box = el('fieldset', { class: 'ab-fs' }, el('legend', {}, title), help(p), sub.node);
      return { node: box, get: sub.get };
    }
    const dv = has(val) ? val : p.default;
    let input; let get;
    if (t === 'boolean') {
      input = el('input', { type: 'checkbox', checked: dv === true });
      return { node: el('label', { class: 'switch ab-bool' }, input, title, required ? el('span', { class: 'req' }, '*') : null), get: () => input.checked };
    }
    if (p.enum) {
      input = el('select', { class: 'field' }, required ? null : el('option', { value: '' }, '—'), p.enum.map((v) => el('option', { value: String(v), selected: v === dv }, String(v))));
      get = () => (input.value === '' ? undefined : (t === 'integer' || t === 'number' ? Number(input.value) : input.value));
    } else if (t === 'integer' || t === 'number') {
      input = el('input', { class: 'field', type: 'number', value: dv ?? '', placeholder: p.examples ? String(p.examples[0]) : '', step: t === 'integer' ? '1' : 'any' });
      get = () => (input.value === '' ? undefined : Number(input.value));
    } else if (t === 'array') {
      const it = p.items || {};
      if (it.type === 'object' || it.oneOf || it.properties) {
        input = el('textarea', { class: 'field mono', rows: 5, spellcheck: 'false' }, JSON.stringify(dv || [], null, 2));
        get = () => { const v = input.value.trim(); if (!v) return undefined; try { return JSON.parse(v); } catch { errs.push(`${title}: not valid JSON`); return undefined; } };
      } else {
        input = el('input', { class: 'field', value: (dv || []).join(', '), placeholder: p.examples ? [].concat(p.examples[0]).join(', ') : 'value1, value2' });
        get = () => { const v = input.value.split(',').map((x) => x.trim()).filter(Boolean); if (!v.length) return undefined; return it.type === 'integer' || it.type === 'number' ? v.map(Number) : v; };
      }
    } else if (t === 'object') {
      input = el('textarea', { class: 'field mono', rows: 4, spellcheck: 'false', placeholder: '{ }' }, dv ? JSON.stringify(dv, null, 2) : '');
      get = () => { const v = input.value.trim(); if (!v) return undefined; try { return JSON.parse(v); } catch { errs.push(`${title}: not valid JSON`); return undefined; } };
    } else if (abIsDateField(p)) {
      return abDateField(title, p, required, dv, errs, help);
    } else {
      const secret = p.airbyte_secret || p.x_secret;
      input = p.multiline ? el('textarea', { class: 'field mono', rows: 4, spellcheck: 'false', placeholder: p.examples ? String(p.examples[0]) : '' }, dv ?? '')
        : el('input', { class: 'field', type: secret ? 'password' : 'text', value: dv ?? '', autocomplete: secret ? 'new-password' : 'off', placeholder: p.examples ? String(p.examples[0]) : (p.pattern_descriptor || '') });
      get = () => {
        if (input.value === '') return undefined;
        if (p.pattern && !p.airbyte_secret && !p.x_secret) {
          let re = null;
          try { re = new RegExp(p.pattern); } catch { /* JS can't parse this pattern: skip */ }
          if (re && !re.test(input.value)) errs.push(`${title}: expected ${p.pattern_descriptor || (p.examples ? `e.g. ${[].concat(p.examples)[0]}` : p.pattern)}`);
        }
        return input.value;
      };
    }
    const wrap = el('label', { class: 'lbl ab-field' }, el('span', {}, title, required ? el('span', { class: 'req' }, '*') : null), input, help(p));
    return { node: wrap, get: () => { const v = get(); if (required && (v === undefined || v === '')) errs.push(`${title} is required`); return v; } };
  }
  function oneOf(k, p, required, path, val) {
    const opts = p.oneOf;
    const sel = el('select', { class: 'field' }, opts.map((o, i) => el('option', { value: String(i) }, o.title || `Option ${i + 1}`)));
    // default option: the one matching the saved value / spec default, else the simplest (fewest fields to fill)
    const constOf = (o) => { const kk = Object.keys(o.properties || {}).find((x) => (o.properties[x] || {}).const !== undefined); return kk ? [kk, o.properties[kk].const] : null; };
    const need = (o) => (o.required || []).filter((x) => ((o.properties || {})[x] || {}).const === undefined && ((o.properties || {})[x] || {}).default === undefined).length;
    const match = (v) => (v && typeof v === 'object' ? opts.findIndex((o) => { const c = constOf(o); return c && v[c[0]] === c[1]; }) : -1);
    let def = match(val);
    if (def < 0) def = match(p.default);
    if (def < 0) def = opts.reduce((best, o, i) => (need(o) < need(opts[best]) ? i : best), 0);
    sel.value = String(def);
    const sub = el('div', { class: 'ab-sub' }); let cur = null;
    const drawSub = (first) => { cur = obj(opts[Number(sel.value)], `${path}${k}.`, first ? val : undefined); sub.replaceChildren(cur.node); };
    sel.addEventListener('change', () => drawSub(false)); drawSub(true);
    return { node: el('fieldset', { class: 'ab-fs' }, el('legend', {}, label(k, p), required ? el('span', { class: 'req' }, '*') : null), help(p), sel, sub), get: () => cur.get() };
  }
  function obj(sch, path = '', vals) {
    const props = sch.properties || {};
    const req = new Set(sch.required || []);
    const v0 = vals && typeof vals === 'object' ? vals : {};
    const keys = Object.keys(props).filter((k) => !props[k].airbyte_hidden && !props[k].x_hidden)
      .sort((a, b) => ((props[a].order ?? 999) - (props[b].order ?? 999)) || (req.has(b) - req.has(a)));
    const items = keys.map((k) => [k, field(k, props[k], req.has(k), path, v0[k])]);
    const main = el('div', { class: 'ab-fields' }); const opt = el('div', { class: 'ab-fields' });
    items.forEach(([k, f]) => { if (f.node) (req.has(k) || props[k].const !== undefined ? main : opt).append(f.node); });
    const node = el('div', {}, main, opt.childNodes.length ? el('details', { class: 'ab-opt', open: keys.some((k) => !req.has(k) && has(v0[k])) || null }, el('summary', {}, `Optional settings (${opt.childNodes.length})`), opt) : null);
    return { node, get: () => { const o = {}; items.forEach(([k, f]) => { const v = f.get(); if (v !== undefined) o[k] = v; }); return o; } };
  }
  const root = obj(schema || {}, '', values);
  return { node: root.node, get: () => { errs.length = 0; const v = root.get(); if (errs.length) throw new Error(errs.slice(0, 4).join(' · ')); return v; } };
}

async function abNewObj(kind, done) {
  const plural = kind === 'source' ? 'sources' : 'destinations';
  let C;
  try { C = AB_CACHE[kind] || (AB_CACHE[kind] = await api(`/api/airbyte/catalog/${kind}`)); } catch (e) { toast(e.message, 'err'); return; }
  let T = null;
  const res = await openDialog((close) => {
    const box = el('div', { class: 'dlg ab-dlg' });
    const title = el('h2', { class: 'grow' }, kind === 'source' ? 'Add a source' : 'Add a destination');
    const head = el('div', { class: 'row' }, title, btn('Close', () => close(null), { cls: 'sm' }));
    const body = el('div');
    box.append(head, body);
    const showGallery = () => {
      title.textContent = kind === 'source' ? 'Add a source' : 'Add a destination';
      body.replaceChildren(abGallery(kind, C.connectors, C.offline, showForm));
    };
    async function showForm(c) {
      title.replaceChildren(el('span', { class: 'ab-name' }, abLogo(kind, c.type, 28), c.name));
      body.replaceChildren(loading('Loading connector settings…'));
      let spec = null;
      if (c.id) { try { spec = (await api(`/api/airbyte/catalog/${kind}/${c.id}`)).spec; } catch { spec = null; } }
      const name = el('input', { class: 'field', value: `${c.name}`, 'aria-label': 'Name' });
      const err = el('div');
      let form = null; let raw = null;
      if (spec && spec.properties) form = abSpecForm(spec);
      else {
        if (!T) { try { T = await api('/api/airbyte/templates'); } catch { T = { sources: {}, destinations: {} }; } }
        const t = (T[plural] || {})[c.type];
        raw = el('textarea', { class: 'field mono', rows: 12, spellcheck: 'false' }, JSON.stringify(t ? t.config : {}, null, 2));
      }
      const create = el('button', { type: 'submit', class: 'btn primary' }, 'Test & create');
      const f = el('form', { method: 'dialog', class: 'ab-form', onSubmit: async (e) => {
        e.preventDefault(); err.replaceChildren();
        let conf;
        try { conf = form ? form.get() : JSON.parse(raw.value || '{}'); } catch (x) { err.replaceChildren(errBox(x)); return; }
        create.disabled = true; create.textContent = 'Testing connection…';
        try { close(await api(`/api/airbyte/${plural}`, { method: 'POST', body: { name: name.value.trim() || c.name, type: c.type, definitionId: c.id || undefined, configuration: conf } })); }
        catch (x) { err.replaceChildren(errBox(x)); create.disabled = false; create.textContent = 'Test & create'; }
      } },
      el('p', { class: 'muted small', style: { margin: 0 } }, kind === 'source'
        ? 'Airbyte tests the connection before saving. For on-prem databases, the Airbyte server must be able to reach the host (VPN, or Airbyte installed inside that network).'
        : 'Synced data lands here. Pick Postgres to copy synced tables into the DataBridge Catalog automatically.',
      c.docs ? el('a', { href: c.docs, target: '_blank', rel: 'noopener', style: { marginLeft: '6px' } }, 'Setup guide ↗') : null),
      el('label', { class: 'lbl' }, 'Name', name),
      form ? form.node : el('label', { class: 'lbl' }, 'Configuration (JSON)', raw), err,
      el('div', { class: 'actions' }, btn('Back', showGallery, { ic: 'back' }), el('span', { class: 'grow' }), el('button', { type: 'button', class: 'btn', onClick: () => close(null) }, 'Cancel'), create));
      body.replaceChildren(f);
    }
    showGallery();
    return box;
  }, { wide: true });
  if (res) { toast(`${kind === 'source' ? 'Source' : 'Destination'} created`); done(); }
}

/* ---------- Sync to Catalog: copy synced tables into Delta tables ---------- */
function abLandCell(c, L, reload) {
  const setup = () => abLandDialog(c, reload);
  if (!L || L.enabled === false) {
    return canEditDH() ? btn('Set up', setup, { cls: 'sm', ic: 'db', title: 'Copy synced tables into the DataBridge Catalog' }) : el('span', { class: 'muted' }, '—');
  }
  const r = L.last_run || {};
  const running = L.running || r.status === 'running';
  const tables = (r.tables || []).filter((t) => t.status === 'ok');
  const status = running ? el('span', { class: 'state' }, el('span', { class: 'dot', style: { background: 'var(--run)' } }), 'Copying…')
    : r.status === 'failed' ? el('button', { type: 'button', class: 'linkish', style: { color: 'var(--fail)' }, title: r.error || '', onClick: setup }, '✗ Copy failed')
      : r.status === 'succeeded' ? el('a', { href: `#/catalog?db=${encodeURIComponent(L.target_schema)}`, title: 'Open in Catalog' }, `✓ ${tables.length} table${tables.length === 1 ? '' : 's'}`)
        : el('span', { class: 'muted' }, 'Not copied yet');
  return el('div', {}, el('div', { class: 'ab-land' }, status,
    canEditDH() && !running ? btn('', async (e) => {
      e.currentTarget.disabled = true; toast('Copying into the Catalog…');
      try { const out = await api(`/api/airbyte/connections/${c.connectionId}/land`, { method: 'POST' }); toast(`Copied ${(out.tables || []).filter((t) => t.status === 'ok').length} table(s) into ${L.target_schema}`); }
      catch (er) { toast(er.message, 'err'); }
      reload(true);
    }, { cls: 'sm', ic: 'download', title: 'Copy now' }) : null,
    canEditDH() ? btn('', setup, { cls: 'sm', ic: 'gear', title: 'Catalog settings' }) : null),
  el('div', { class: 'muted small' }, `${L.target_schema}${L.auto ? ' · auto' : ''}${r.ended ? ` · ${ago(r.ended)}` : ''}`));
}

async function abLandDialog(c, reload) {
  let D;
  try { D = await api(`/api/airbyte/connections/${c.connectionId}/landing`); } catch (e) { toast(e.message, 'err'); return; }
  const v = { ...D.suggest, enabled: true, auto: true, mode: 'replace', format: 'delta', drop_meta: true, ...D.config };
  const res = await openDialog((close) => {
    const inp = (k, ph, type = 'text') => el('input', { class: 'field mono', type, value: type === 'password' ? '' : (v[k] ?? ''), placeholder: ph, autocomplete: 'off' });
    const F = {
      auto: el('input', { type: 'checkbox', checked: !!v.auto }), enabled: el('input', { type: 'checkbox', checked: v.enabled !== false }),
      jdbc_url: inp('jdbc_url', 'jdbc:postgresql://localhost:5432/airbyte'), user: inp('user', 'postgres'),
      password: inp('password', D.has_password ? '•••••• (saved — leave empty to keep)' : 'Password of the destination database', 'password'),
      src_schema: inp('src_schema', 'public'), target_schema: inp('target_schema', 'airbyte_sales'),
      mode: el('select', { class: 'field' }, [['replace', 'Replace tables on every copy'], ['append', 'Add only new rows (incremental)']].map(([k, l]) => el('option', { value: k, selected: v.mode === k }, l))),
      format: el('select', { class: 'field' }, [['delta', 'Delta (recommended)'], ['parquet', 'Parquet']].map(([k, l]) => el('option', { value: k, selected: v.format === k }, l))),
      drop_meta: el('input', { type: 'checkbox', checked: v.drop_meta !== false }),
    };
    const err = el('div');
    const body = () => ({ enabled: F.enabled.checked, auto: F.auto.checked, jdbc_url: F.jdbc_url.value.trim(), user: F.user.value.trim(), password: F.password.value,
      src_schema: F.src_schema.value.trim(), target_schema: F.target_schema.value.trim(), mode: F.mode.value, format: F.format.value, drop_meta: F.drop_meta.checked });
    const save = async (andRun, b) => {
      err.replaceChildren(); b.disabled = true;
      try {
        await api(`/api/airbyte/connections/${c.connectionId}/landing`, { method: 'PUT', body: body() });
        if (andRun) { b.textContent = 'Copying… (Spark may take a minute to start)'; await api(`/api/airbyte/connections/${c.connectionId}/land`, { method: 'POST' }); }
        close(true);
      } catch (x) { err.replaceChildren(errBox(x)); b.disabled = false; b.textContent = andRun ? 'Save & copy now' : 'Save'; }
    };
    const saveBtn = btn('Save', () => save(false, saveBtn));
    const runBtn = btn('Save & copy now', () => save(true, runBtn), { cls: 'primary', ic: 'download' });
    const tgt = (s) => `${F.target_schema.value || 'schema'}.${s.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;
    const r = (D.config && D.config.last_run) || null;
    return el('div', { class: 'dlg ab-dlg' },
      el('div', { class: 'row' }, el('h2', { class: 'grow' }, `Sync to Catalog — ${D.connection.name}`), btn('Close', () => close(null), { cls: 'sm' })),
      el('p', { class: 'muted small', style: { margin: 0 } }, 'After each Airbyte sync, DataBridge copies the synced tables from the destination database into Delta tables in your Catalog, ready for SQL, notebooks and dashboards.'),
      !D.supported ? el('div', { class: 'error-box' }, `This connection writes to "${D.destinationType}". Copying into the Catalog works with a Postgres destination for now — create a Postgres destination and point the connection to it.`) : null,
      el('div', { class: 'ab-toggles' }, el('label', { class: 'switch' }, F.enabled, 'On'), el('label', { class: 'switch' }, F.auto, 'Copy automatically after every successful sync')),
      el('div', { class: 'dh-form', style: { padding: 0 } },
        el('label', { class: 'lbl', style: { gridColumn: 'span 2' } }, 'Destination database (JDBC URL, as DataBridge reaches it)', F.jdbc_url), el('label', { class: 'lbl' }, 'User', F.user),
        el('label', { class: 'lbl' }, 'Password', F.password), el('label', { class: 'lbl' }, 'Schema the tables were synced into', F.src_schema),
        el('label', { class: 'lbl' }, 'Catalog schema to create the tables in', F.target_schema), el('label', { class: 'lbl' }, 'How to copy', F.mode),
        el('label', { class: 'lbl' }, 'Format', F.format), el('label', { class: 'switch' }, F.drop_meta, 'Hide Airbyte system columns (keeps _synced_at)')),
      D.connection.streams.length ? el('div', {}, el('div', { class: 'muted small', style: { margin: '4px 0 6px' } }, 'Tables that will appear in the Catalog:'),
        el('div', { class: 'dh-schema', style: { padding: 0 } }, D.connection.streams.map((s) => el('span', { class: 'chip mono' }, tgt(s))))) : null,
      r && (r.tables || r.error) ? el('details', { open: r.status === 'failed' }, el('summary', {}, `Last copy: ${r.status}${r.ended ? `, ${ago(r.ended)}` : ''}`),
        r.error ? el('pre', { class: 'mono small', style: { whiteSpace: 'pre-wrap' } }, r.error) : null,
        el('table', { class: 't' }, el('tbody', {}, (r.tables || []).map((t) => el('tr', {}, el('td', { class: 'mono' }, t.table || t.stream), el('td', {}, t.status), el('td', { class: 'num' }, (t.rows || 0).toLocaleString())))))) : null,
      err, el('div', { class: 'actions' }, el('span', { class: 'grow' }), saveBtn, runBtn));
  }, { wide: true });
  if (res) { toast('Catalog sync saved'); reload(true); }
}

async function abNewConn(O, done) {
  if (!O.sources.length || !O.destinations.length) { toast('Create a source and a destination first', 'err'); return; }
  const res = await openDialog((close) => {
    const src = el('select', { class: 'field' }, O.sources.map((s) => el('option', { value: s.sourceId }, `${s.name} (${s.sourceType})`)));
    const dst = el('select', { class: 'field' }, O.destinations.map((d) => el('option', { value: d.destinationId }, `${d.name} (${d.destinationType})`)));
    const name = el('input', { class: 'field', placeholder: 'e.g. Sales DB → Lakehouse' });
    const sched = el('select', { class: 'field' }, AB_SCHEDULES.map(([v, l]) => el('option', { value: v }, l)));
    const cron = el('input', { class: 'field mono', placeholder: '0 30 1 * * ?  (sec min hour day month weekday)', hidden: true });
    const prefix = el('input', { class: 'field mono', placeholder: 'optional, e.g. sales_' });
    sched.addEventListener('change', () => { cron.hidden = sched.value !== 'custom'; });
    const err = el('div');
    const f = el('form', { method: 'dialog', onSubmit: async (e) => {
      e.preventDefault(); err.replaceChildren();
      const b = f.querySelector('button[type=submit]'); b.disabled = true;
      try { close(await api('/api/airbyte/connections', { method: 'POST', body: { sourceId: src.value, destinationId: dst.value, name: name.value.trim() || null,
        cron: sched.value === 'custom' ? cron.value.trim() : sched.value, prefix: prefix.value.trim() } })); }
      catch (x) { err.replaceChildren(errBox(x)); b.disabled = false; }
    } },
    el('h2', {}, 'New connection'), el('p', { class: 'muted', style: { margin: 0 } }, 'All streams (tables) of the source are synced. To pick streams or change sync modes, use the ↗ link on the connection after it is created.'),
    el('label', { class: 'lbl' }, 'Source', src), el('label', { class: 'lbl' }, 'Destination', dst), el('label', { class: 'lbl' }, 'Name', name),
    el('label', { class: 'lbl' }, 'Schedule', sched), cron, el('label', { class: 'lbl' }, 'Table prefix', prefix), err,
    el('div', { class: 'actions' }, el('button', { type: 'button', class: 'btn', onClick: () => close(null) }, 'Cancel'), el('button', { type: 'submit', class: 'btn primary' }, 'Create connection')));
    return f;
  });
  if (res) { toast('Connection created — press Sync now to run it'); done(); }
}

async function abDelete(kind, id, nm, done) {
  if (!(await confirmDialog(`Delete ${nm}?`, 'This removes it from Airbyte. Data already synced is kept.'))) return;
  try { await api(`/api/airbyte/${kind}/${id}`, { method: 'DELETE' }); toast('Deleted'); done(); } catch (e) { toast(e.message, 'err'); }
}

function abJobs(c) {
  return openDialog((close) => {
    const box = el('div', {}, loading());
    api(`/api/airbyte/connections/${c.connectionId}/jobs`).then((r) => {
      const jobs = r.data || [];
      box.replaceChildren(jobs.length ? el('table', { class: 't' },
        el('thead', {}, el('tr', {}, ['Job', 'Type', 'Status', 'Started', 'Duration', 'Rows', 'Size'].map((x) => el('th', {}, x)))),
        el('tbody', {}, jobs.map((j) => el('tr', {}, el('td', { class: 'mono' }, `#${j.jobId}`), el('td', {}, j.jobType), el('td', {}, abState(j.status)),
          el('td', {}, fmtTime(j.startTime)), el('td', {}, abDur(j.duration)), el('td', { class: 'num' }, j.rowsSynced != null ? Number(j.rowsSynced).toLocaleString() : '—'),
          el('td', { class: 'num' }, fmtBytesDH(j.bytesSynced))))))
        : el('p', { class: 'muted' }, 'No syncs yet.'));
    }).catch((e) => box.replaceChildren(errBox(e)));
    return el('div', { class: 'dlg' }, el('div', { class: 'row' }, el('h2', { class: 'grow' }, `Sync history — ${c.name}`), btn('Close', () => close(null), { cls: 'sm' })), box);
  }, { wide: true });
}
