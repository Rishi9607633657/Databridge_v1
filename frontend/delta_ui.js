/* Delta Lake: History & time travel + Maintenance (OPTIMIZE / Z-ORDER / VACUUM / RESTORE / clustering / properties). */
'use strict';

const DELTA_OP_COLOR = { WRITE: 'blue', 'CREATE TABLE AS SELECT': 'blue', 'CREATE OR REPLACE TABLE AS SELECT': 'blue', MERGE: 'purple', UPDATE: 'amber', DELETE: 'red',
  OPTIMIZE: 'teal', 'VACUUM START': 'grey', 'VACUUM END': 'grey', RESTORE: 'orange', 'SET TBLPROPERTIES': 'grey', 'CREATE TABLE': 'blue', STREAMING_UPDATE: 'blue' };
const fmtBytes = (n) => { n = Number(n) || 0; const u = ['B', 'KB', 'MB', 'GB', 'TB']; let i = 0; while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; } return `${n.toFixed(i ? 1 : 0)} ${u[i]}`; };
const deltaBase = (db, tbl) => `/api/catalog/databases/${encodeURIComponent(db)}/tables/${encodeURIComponent(tbl)}/delta`;

function deltaMetricText(op, m) {
  if (!m) return '';
  const g = (k) => (m[k] != null ? Number(m[k]) : null);
  const parts = [];
  const n = (k, label) => { const v = g(k); if (v) parts.push(`${v.toLocaleString()} ${label}`); };
  n('numOutputRows', 'rows written'); n('numTargetRowsInserted', 'inserted'); n('numTargetRowsUpdated', 'updated'); n('numTargetRowsDeleted', 'deleted');
  n('numDeletedRows', 'rows deleted'); n('numUpdatedRows', 'rows updated');
  if (op === 'OPTIMIZE') { n('numRemovedFiles', 'files compacted'); n('numAddedFiles', 'files written'); }
  else { n('numAddedFiles', 'files added'); n('numRemovedFiles', 'files removed'); }
  n('numDeletedFiles', 'files deleted'); n('numVacuumedDirectories', 'folders vacuumed');
  if (g('restoredFilesSize') || g('numRestoredFiles')) n('numRestoredFiles', 'files restored');
  return parts.slice(0, 3).join(' · ');
}

async function deltaHistoryTab(pane, db, tbl) {
  pane.append(loading('Reading table history…'));
  let hist;
  try { hist = await api(`${deltaBase(db, tbl)}/history`); } catch (e) { pane.replaceChildren(errBox(e)); return; }
  const canEdit = !CURRENT_USER || CURRENT_USER.role !== 'viewer';
  const detailBox = el('div', { class: 'dh-detail' });
  const q = el('input', { class: 'field cat-q', type: 'search', placeholder: 'Filter by operation or user…', 'aria-label': 'Filter history' });
  const tb = el('tbody');
  const drawRows = () => {
    const f = q.value.trim().toLowerCase();
    tb.replaceChildren(...hist.filter((h) => !f || `${h.operation} ${h.userName || ''}`.toLowerCase().includes(f)).map((h, i) => el('tr', {},
      el('td', { class: 'dh-v' }, `v${h.version}`, i === 0 && !f ? el('span', { class: 'chip teal', style: { marginLeft: '6px' } }, 'current') : null),
      el('td', { class: 'muted dh-ts' }, String(h.timestamp || '').replace('T', ' ').slice(0, 19)),
      el('td', {}, el('span', { class: `dh-op c-${DELTA_OP_COLOR[h.operation] || 'grey'}` }, h.operation)),
      el('td', { class: 'muted' }, h.userName || '—'),
      el('td', { class: 'dh-m' }, deltaMetricText(h.operation, h.operationMetrics)),
      el('td', { class: 'dh-act' },
        btn('Preview', () => preview(h.version), { cls: 'sm ghost', title: `See the table as it was at version ${h.version}` }),
        i > 0 || f ? btn('Compare', () => compareV(h.version), { cls: 'sm ghost', title: 'Rows added and removed since this version' }) : null,
        canEdit && (i > 0 || f) ? btn('Restore', () => restore(h), { cls: 'sm ghost dh-restore', title: `Make the table look like version ${h.version} again` }) : null))));
  };
  q.addEventListener('input', drawRows);
  async function preview(v) {
    detailBox.replaceChildren(loading(`Reading version ${v}…`));
    try {
      const res = await api(`${deltaBase(db, tbl)}/version/${v}?limit=1000`);
      detailBox.replaceChildren(el('div', { class: 'dh-head' }, el('h3', {}, `Version ${v}`), el('span', { class: 'muted small' }, `SELECT * FROM ${db}.${tbl} VERSION AS OF ${v} — first ${res.rows.length.toLocaleString()} rows`),
        el('span', { class: 'grow' }), btn('Query in SQL editor', () => openInSql(`SELECT *\nFROM ${db}.${tbl} VERSION AS OF ${v}\nLIMIT 100`), { cls: 'sm', ic: 'term' }), btn('', () => detailBox.replaceChildren(), { cls: 'ghost icon sm', ic: 'x', title: 'Close' })),
      renderTableOutput({ columns: res.columns, types: [], rows: res.rows, truncated: res.truncated, limit: 1000 }, {}, null));
      detailBox.scrollIntoView({ block: 'nearest' });
    } catch (e) { detailBox.replaceChildren(errBox(e)); }
  }
  async function compareV(v) {
    detailBox.replaceChildren(loading(`Comparing version ${v} with the current table…`));
    try {
      const c = await api(`${deltaBase(db, tbl)}/compare/${v}`);
      const delta = c.rows_now - c.rows_then;
      detailBox.replaceChildren(el('div', { class: 'dh-head' }, el('h3', {}, `Version ${v} → now`), el('span', { class: 'grow' }), btn('', () => detailBox.replaceChildren(), { cls: 'ghost icon sm', ic: 'x', title: 'Close' })),
        el('div', { class: 'dh-cmp' }, [['Rows then', c.rows_then], ['Rows now', c.rows_now], ['Net change', `${delta >= 0 ? '+' : ''}${Number(delta).toLocaleString()}`], ['Rows added', c.rows_added], ['Rows removed', c.rows_removed]]
          .map(([k, v2]) => el('div', { class: 'dh-cmp-card' }, el('b', {}, typeof v2 === 'number' ? v2.toLocaleString() : v2), el('span', {}, k)))),
        el('p', { class: 'muted small' }, 'Added/removed compare whole rows (EXCEPT ALL); an updated row counts as one removed plus one added.'));
    } catch (e) { detailBox.replaceChildren(errBox(e)); }
  }
  async function restore(h) {
    const pre = await api(`${deltaBase(db, tbl)}/action`, { method: 'POST', body: { action: 'restore', version: h.version, preview_sql: true } });
    if (!(await confirmDialog(`Restore ${db}.${tbl} to version ${h.version}?`,
      `The table will look exactly as it did on ${String(h.timestamp).replace('T', ' ').slice(0, 19)}. This adds a new RESTORE version — history is kept, so you can undo it the same way.\n\n${pre.sql}`, 'Restore'))) return;
    detailBox.replaceChildren(loading('Restoring…'));
    try {
      const res = await api(`${deltaBase(db, tbl)}/action`, { method: 'POST', body: { action: 'restore', version: h.version } });
      toast(`Restored to version ${h.version}`);
      hist = await api(`${deltaBase(db, tbl)}/history`); drawRows();
      detailBox.replaceChildren(deltaResult(res, 'Restore finished'));
    } catch (e) { detailBox.replaceChildren(errBox(e)); }
  }
  drawRows();
  pane.replaceChildren(el('section', { class: 'panel' },
    el('div', { class: 'panel-head' }, el('h3', { class: 'grow' }, `${hist.length} version${hist.length === 1 ? '' : 's'}`), q,
      btn('Time travel query', () => openInSql(`-- by version\nSELECT * FROM ${db}.${tbl} VERSION AS OF ${hist[hist.length - 1] ? hist[hist.length - 1].version : 0} LIMIT 100;\n-- or by time\n-- SELECT * FROM ${db}.${tbl} TIMESTAMP AS OF '2026-09-30 00:00:00'`), { cls: 'sm', ic: 'term' })),
    el('div', { class: 'dh-scroll' }, el('table', { class: 't dh-table' }, el('thead', {}, el('tr', {}, ['Version', 'Time', 'Operation', 'User', 'What changed', ''].map((x) => el('th', {}, x)))), tb))),
  detailBox);
}

function deltaResult(res, title) {
  const box = el('div', { class: 'dm-result' }, el('div', { class: 'dh-head' }, el('b', {}, `✓ ${title}`), el('span', { class: 'muted small' }, res.elapsed != null ? `${res.elapsed}s` : '')),
    el('pre', { class: 'code dm-sql' }, res.sql));
  if (res.columns && res.columns.length && res.rows && res.rows.length) {
    if (res.rows.length === 1 && res.columns.includes('metrics')) {
      let m = res.rows[0][res.columns.indexOf('metrics')];
      try { m = typeof m === 'string' ? JSON.parse(m) : m; } catch { /* keep */ }
      if (m && typeof m === 'object') {
        const pick = [['numFilesRemoved', 'Files compacted'], ['numFilesAdded', 'Files written'], ['filesRemoved', 'Files compacted'], ['filesAdded', 'Files written'],
          ['totalConsideredFiles', 'Files considered'], ['numBatches', 'Batches']];
        const cards = pick.map(([k, l]) => { const v = typeof m[k] === 'object' && m[k] ? (m[k].totalFiles ?? m[k].numFiles) : m[k]; return v != null ? [l, v] : null; }).filter(Boolean);
        if (cards.length) box.append(el('div', { class: 'dh-cmp' }, cards.map(([l, v]) => el('div', { class: 'dh-cmp-card' }, el('b', {}, Number(v).toLocaleString()), el('span', {}, l)))));
      }
    }
    box.append(renderTableOutput({ columns: res.columns, types: [], rows: res.rows }, {}, null));
  }
  return box;
}

async function deltaMaintenanceTab(pane, db, tbl, t) {
  pane.append(loading('Reading Delta table details…'));
  let info;
  try { info = await api(`${deltaBase(db, tbl)}/detail`); } catch (e) {
    const notDelta = /not a Delta table|Convert to Delta/i.test(e.message);
    pane.replaceChildren(errBox(e), notDelta ? el('section', { class: 'panel dm-card' }, el('h3', {}, 'Convert to Delta'),
      el('p', { class: 'muted' }, 'This table is plain Parquet. Converting adds a Delta transaction log in place (no data is copied), giving you history, time travel, OPTIMIZE and VACUUM.'),
      btn('Convert to Delta', async (ev) => { ev.currentTarget.disabled = true; try { await api(`${deltaBase(db, tbl)}/action`, { method: 'POST', body: { action: 'convert' } }); toast('Converted to Delta'); render(); } catch (e2) { toast(e2.message, 'err'); ev.currentTarget.disabled = false; } }, { cls: 'primary' })) : null);
    return;
  }
  const d = info.detail;
  const caps = info.capabilities || { stats: true, alterCluster: true };
  const canEdit = !CURRENT_USER || CURRENT_USER.role !== 'viewer';
  const unsupported = (text) => el('div', { class: 'dm-unsup' }, el('b', {}, 'Not available in your Delta Lake version'), el('span', {}, text));
  const cols = (t.columns || []).map((c) => c.name);
  const avg = d.numFiles ? d.sizeInBytes / d.numFiles : 0;
  const run = async (body, title, out, opts = {}) => {
    const pre = await api(`${deltaBase(db, tbl)}/action`, { method: 'POST', body: { ...body, preview_sql: true } }).catch((e) => { toast(e.message, 'err'); return null; });
    if (!pre) return null;
    if (opts.confirm && !(await confirmDialog(opts.confirm.title, `${opts.confirm.text}\n\n${pre.sql}`, opts.confirm.ok))) return null;
    out.replaceChildren(loading(`${title}…`), el('pre', { class: 'code dm-sql' }, pre.sql));
    try { const res = await api(`${deltaBase(db, tbl)}/action`, { method: 'POST', body }); out.replaceChildren(deltaResult(res, `${title} finished`)); return res; }
    catch (e) { out.replaceChildren(errBox(e), el('pre', { class: 'code dm-sql' }, pre.sql)); return null; }
  };
  const colPicker = (selected, max = 4) => el('div', { class: 'dm-cols' }, cols.map((c) => el('label', { class: 'switch' }, el('input', { type: 'checkbox', value: c, checked: selected.includes(c),
    onChange: (e) => { if (e.target.checked && e.target.closest('.dm-cols').querySelectorAll('input:checked').length > max) { e.target.checked = false; toast(`Pick up to ${max} columns`, 'err'); } } }), c)));
  const picked = (box) => [...box.querySelectorAll('input:checked')].map((i) => i.value);

  // --- overview
  const lastOf = (ops) => null;
  const cards = el('div', { class: 'dm-overview' }, [
    ['Files', (d.numFiles ?? 0).toLocaleString()], ['Size', fmtBytes(d.sizeInBytes)], ['Avg file', fmtBytes(avg)],
    ['Partitioned by', (d.partitionColumns || []).join(', ') || 'none'], ['Clustered by', (d.clusteringColumns || []).join(', ') || 'none'],
    ['Protocol', d.minReaderVersion ? `reader ${d.minReaderVersion} · writer ${d.minWriterVersion}` : '—'],
  ].map(([k, v]) => el('div', { class: 'dh-cmp-card' }, el('b', {}, String(v)), el('span', {}, k))));
  void lastOf;

  // --- OPTIMIZE
  const optOut = el('div', { class: 'dm-out' });
  const zBox = colPicker((d.clusteringColumns || []).length ? [] : []);
  const where = el('input', { class: 'field mono', placeholder: (d.partitionColumns || []).length ? `${d.partitionColumns[0]} >= '2026-09-01'` : 'only for partitioned tables', disabled: !(d.partitionColumns || []).length || null });
  const optimize = el('section', { class: 'panel dm-card' }, el('h3', {}, 'Compact small files', el('span', { class: 'chip' }, 'OPTIMIZE')),
    el('p', { class: 'muted' }, 'Rewrites many small files into fewer large ones so queries read less. Z-ORDER also co-locates rows with similar values in the chosen columns, so filters on them skip more data.'),
    el('div', { class: 'lbl' }, 'Z-ORDER by (optional, up to 4 columns you often filter on)', zBox),
    el('label', { class: 'lbl' }, 'Only these partitions (optional)', where),
    canEdit ? btn('Run OPTIMIZE', () => run({ action: 'optimize', zorder: picked(zBox), where: where.value.trim() }, 'OPTIMIZE', optOut), { cls: 'primary', ic: 'play' }) : null, optOut);

  // --- VACUUM
  const vacOut = el('div', { class: 'dm-out' });
  const hours = el('input', { class: 'field', type: 'number', min: 0, value: 168, style: { width: '120px' } });
  const warn = el('p', { class: 'dm-warn', hidden: true }, '⚠ Under 168 hours (7 days) can break readers or time travel to older versions. Delta blocks it unless the retention check is disabled.');
  hours.addEventListener('input', () => { warn.hidden = Number(hours.value) >= 168; });
  let dryDone = false;
  const delBtn = btn('Delete these files', async () => {
    const res = await run({ action: 'vacuum', hours: Number(hours.value) }, 'VACUUM', vacOut,
      { confirm: { title: 'Permanently delete old files?', text: `Files no longer referenced by versions newer than ${hours.value} hours are deleted. You will not be able to time-travel to versions older than that.`, ok: 'Delete files' } });
    if (res) { dryDone = false; delBtn.disabled = true; }
  }, { cls: 'danger' });
  delBtn.disabled = true;
  const vacuum = el('section', { class: 'panel dm-card' }, el('h3', {}, 'Clean up old files', el('span', { class: 'chip' }, 'VACUUM')),
    el('p', { class: 'muted' }, 'Deletes data files that no current version uses any more (left behind by updates, deletes and OPTIMIZE). Saves storage; always preview first.'),
    el('label', { class: 'lbl' }, 'Keep files needed by versions from the last … hours', hours), warn,
    canEdit ? el('div', { class: 'row', style: { gap: '8px' } },
      btn('Preview (dry run)', async () => { const r = await run({ action: 'vacuum_dry', hours: Number(hours.value) }, 'VACUUM dry run', vacOut);
        if (r) { dryDone = true; delBtn.disabled = !r.rows.length; vacOut.prepend(el('p', { class: 'dm-note' }, r.rows.length ? `${r.rows.length.toLocaleString()} file${r.rows.length === 1 ? '' : 's'} would be deleted.` : 'Nothing to delete — the table is already clean.')); } }, { ic: 'search' }),
      delBtn) : null, vacOut);
  void dryDone;

  // --- clustering
  const clOut = el('div', { class: 'dm-out' });
  const clBox = colPicker(d.clusteringColumns || []);
  const clustering = el('section', { class: 'panel dm-card' }, el('h3', {}, 'Liquid clustering', el('span', { class: 'chip' }, 'CLUSTER BY')),
    el('p', { class: 'muted' }, 'A flexible replacement for partitioning and Z-ORDER: Delta keeps rows clustered by these columns as data arrives (applied on the next OPTIMIZE). Changing it on an existing table needs Delta Lake 3.2+.'),
    caps.alterCluster ? el('div', { class: 'lbl' }, 'Cluster by (up to 4 columns)', clBox)
      : unsupported(`Changing clustering on an existing table needs Delta Lake 3.2 or newer.${(d.clusteringColumns || []).length ? ` Current clustering: ${d.clusteringColumns.join(', ')}.` : ''} Use Z-ORDER in “Compact small files” for the same benefit today.`),
    canEdit && caps.alterCluster ? el('div', { class: 'row', style: { gap: '8px' } }, btn('Apply clustering', () => run({ action: 'cluster', columns: picked(clBox) }, 'Clustering change', clOut), { cls: 'primary' }),
      (d.clusteringColumns || []).length ? btn('Remove clustering', () => run({ action: 'cluster', columns: [] }, 'Clustering removed', clOut), { cls: 'ghost' }) : null) : null, clOut);

  // --- statistics
  const stOut = el('div', { class: 'dm-out' });
  const stats = el('section', { class: 'panel dm-card' }, el('h3', {}, 'Data-skipping statistics', el('span', { class: 'chip' }, 'ANALYZE')),
    el('p', { class: 'muted' }, 'Recomputes the per-file min/max statistics Delta uses to skip files — useful after changing which columns are indexed.'),
    caps.stats ? (canEdit ? btn('Recompute statistics', () => run({ action: 'stats' }, 'Statistics', stOut), {}) : null)
      : unsupported('Delta already collects statistics for the first 32 columns on every write. To refresh them for older files, run OPTIMIZE — rewritten files get new statistics.'), stOut);

  // --- properties
  const prOut = el('div', { class: 'dm-out' });
  const props = d.properties || {};
  const inputs = {};
  const propsCard = el('section', { class: 'panel dm-card' }, el('h3', {}, 'Table settings', el('span', { class: 'chip' }, 'TBLPROPERTIES')),
    el('div', { class: 'dm-props' }, Object.entries(info.editable).map(([k, meta]) => {
      const cur = props[k];
      const inp = meta.kind === 'bool' ? el('select', { class: 'field' }, [['', 'default'], ['true', 'on'], ['false', 'off']].map(([v, l]) => el('option', { value: v, selected: String(cur ?? '') === v }, l)))
        : el('input', { class: 'field mono', value: cur ?? '', placeholder: meta.kind === 'interval' ? 'interval 30 days' : 'default' });
      inputs[k] = [inp, cur ?? ''];
      return el('label', { class: 'lbl' }, el('span', {}, meta.label, el('span', { class: 'muted mono dm-pk' }, ` ${k}`)), inp);
    })),
    canEdit ? btn('Save settings', () => {
      const changed = Object.fromEntries(Object.entries(inputs).filter(([, [inp, was]]) => inp.value !== '' && inp.value !== String(was)).map(([k, [inp]]) => [k, inp.value]));
      if (!Object.keys(changed).length) { toast('Nothing changed'); return; }
      run({ action: 'props', properties: changed }, 'Settings saved', prOut);
    }, { cls: 'primary' }) : null, prOut);

  pane.replaceChildren(
    info.advice.length ? el('div', { class: 'dm-advice' }, info.advice.map((a) => el('div', {}, `💡 ${a}`))) : null,
    cards,
    el('div', { class: 'dm-grid' }, optimize, vacuum, propsCard, clustering, stats),
    canEdit ? null : el('p', { class: 'muted' }, 'Viewers can see table health; maintenance needs an Editor or Admin.'));
}
