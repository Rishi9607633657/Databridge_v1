/* DataBridge notebook extras — widgets bar, contents / variables side panel, revision history,
   keyboard shortcut help, Python + SQL autocomplete. Loaded before app.js; helpers are resolved at call time. */
'use strict';

/* ---------------- widgets bar ---------------- */
function nbWidgetsBar(api) {
  const box = el('div', { class: 'nb-widgets', hidden: true });
  const ON_CHANGE_KEY = 'databridge.widgetOnChange';
  let widgets = [];
  const commit = (name, value) => {
    api.send({ action: 'set_widget', name, value });
    if (localStorage.getItem(ON_CHANGE_KEY) === 'run') setTimeout(() => api.runAll(), 300);
  };
  function field(w) {
    let input;
    if ((w.type === 'dropdown' || w.type === 'multiselect') && w.choices) {
      input = el('select', { class: 'field', multiple: w.type === 'multiselect' || null },
        w.choices.map((c) => el('option', { value: c, selected: (w.type === 'multiselect' ? String(w.value).split(',') : [w.value]).includes(c) }, c)));
      input.addEventListener('change', () => commit(w.name, w.type === 'multiselect'
        ? [...input.selectedOptions].map((o) => o.value).join(',') : input.value));
    } else {
      const listId = `wl-${w.name.replace(/\W/g, '_')}`;
      input = el('input', { class: 'field', value: w.value ?? '', list: w.type === 'combobox' ? listId : null, placeholder: w.default || '' });
      const send = () => { if (input.value !== w.value) { w.value = input.value; commit(w.name, input.value); } };
      input.addEventListener('change', send);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); send(); input.blur(); } });
      if (w.type === 'combobox') return el('label', { class: 'nb-widget' }, el('span', {}, w.label || w.name), input,
        el('datalist', { id: listId }, (w.choices || []).map((c) => el('option', { value: c }))));
    }
    return el('label', { class: 'nb-widget', title: w.name }, el('span', {}, w.label || w.name), input);
  }
  function draw() {
    box.hidden = !widgets.length;
    if (!widgets.length) return;
    const mode = el('select', { class: 'nb-widget-mode', 'aria-label': 'On widget change' },
      el('option', { value: 'none' }, 'On change: do nothing'), el('option', { value: 'run' }, 'On change: run notebook'));
    mode.value = localStorage.getItem(ON_CHANGE_KEY) || 'none';
    mode.addEventListener('change', () => localStorage.setItem(ON_CHANGE_KEY, mode.value));
    box.replaceChildren(el('div', { class: 'nb-widgets-fields' }, widgets.map(field)), mode);
  }
  return {
    el: box,
    update(ws) {
      const active = document.activeElement;
      if (active && box.contains(active) && active.tagName === 'INPUT') { widgets = ws; return; }  // don't clobber typing
      widgets = ws; draw();
    },
  };
}

/* ---------------- side panel: contents + variables ---------------- */
function nbSidePanel(api) {
  let tab = null, vars = [], filter = '';
  const body = el('div', { class: 'nb-side-body' });
  const title = el('h3', { class: 'grow' });
  const panel = el('aside', { class: 'nb-side', hidden: true },
    el('div', { class: 'nb-side-head' }, title, btn('', () => show(null), { cls: 'ghost icon sm', ic: 'x', title: 'Close panel' })), body);

  function headings() {
    const out = [];
    for (const c of api.cells()) {
      const src = c.cm.getValue();
      const md = c.type === 'markdown' ? src : /^\s*%md\b/.test(src) ? src.replace(/^\s*%md[^\n]*\n?/, '') : null;
      if (md == null) continue;
      let inFence = false;
      for (const line of md.split('\n')) {
        if (/^```/.test(line)) inFence = !inFence;
        const m = !inFence && line.match(/^(#{1,4})\s+(.+)/);
        if (m) out.push({ level: m[1].length, text: m[2].replace(/[*_`]/g, ''), cell: c });
      }
    }
    return out;
  }
  function drawToc() {
    const hs = headings();
    body.replaceChildren(hs.length ? el('nav', { class: 'toc' }, hs.map((h) => el('button', { type: 'button', class: `toc-l${h.level}`,
      onClick: () => api.scrollTo(h.cell) }, h.text)))
      : el('p', { class: 'muted', style: { padding: '8px 12px' } }, 'Add markdown headings (# Title) to build a table of contents.'));
  }
  function drawVars() {
    const f = el('input', { class: 'field', type: 'search', placeholder: 'Filter variables', value: filter, 'aria-label': 'Filter variables' });
    const list = el('div', { class: 'vars' });
    const paint = () => {
      const q = f.value.toLowerCase();
      filter = f.value;
      const shown = vars.filter((v) => !q || v.name.toLowerCase().includes(q) || v.type.toLowerCase().includes(q));
      list.replaceChildren(...(shown.length ? shown.map((v) => el('button', { type: 'button', class: 'var-row', disabled: !v.previewable || null,
        title: v.previewable ? 'Preview' : '', onClick: () => v.previewable && previewVar(v) },
      el('div', { class: 'row', style: { gap: '8px' } }, el('span', { class: 'mono var-name' }, v.name), el('span', { class: 'chip var-type' }, v.type)),
      el('div', { class: 'muted var-sum' }, v.summary)))
        : [el('p', { class: 'muted', style: { padding: '8px 4px' } }, vars.length ? 'No match.' : 'Run a cell to see its variables here.')]));
    };
    f.addEventListener('input', paint);
    paint();
    body.replaceChildren(el('div', { style: { padding: '8px 10px' } }, f), list);
  }
  async function previewVar(v) {
    const data = await api.request('preview', { name: v.name });
    openDialog((close) => el('div', { class: 'dlg' },
      el('div', { class: 'row' }, el('h2', { class: 'grow mono' }, v.name), el('span', { class: 'chip' }, v.type), btn('Close', () => close(null), { cls: 'sm' })),
      data && data.table ? renderTableOutput(data.table, {}, null)
        : el('pre', { class: 'code', style: { maxHeight: '60vh', overflow: 'auto' } }, (data && (data.text || data.error)) || 'No preview available.')), { wide: true });
  }
  function show(t) {
    tab = tab === t ? null : t;
    panel.hidden = !tab;
    api.onPanel && api.onPanel(tab);
    if (tab === 'toc') { title.textContent = 'Contents'; drawToc(); }
    if (tab !== 'dora' && title.firstChild && title.firstChild.nodeType !== 3) title.textContent = title.textContent;
    if (tab === 'vars') { title.textContent = 'Variables'; drawVars(); api.send({ action: 'refresh_state' }); }
    panel.classList.toggle('dora-mode', tab === 'dora');
    if (tab === 'dora') { title.replaceChildren(doraIcon(), ' Dora'); body.replaceChildren(api.dora.el); api.dora.onShow(); }
  }
  return {
    el: panel, show,
    get tab() { return tab; },
    setVariables(v) { vars = v || []; if (tab === 'vars' && !body.contains(document.activeElement)) drawVars(); },
    refreshToc() { if (tab === 'toc') drawToc(); },
  };
}

/* ---------------- revision history ---------------- */
function nbLineDiff(a, b) {
  const A = a.split('\n'), B = b.split('\n');
  if (A.length * B.length > 4e6) return [{ t: '~', s: 'Notebook too large to diff.' }];
  const dp = Array.from({ length: A.length + 1 }, () => new Uint16Array(B.length + 1));
  for (let i = A.length - 1; i >= 0; i--) for (let j = B.length - 1; j >= 0; j--)
    dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out = [];
  let i = 0, j = 0;
  while (i < A.length && j < B.length) {
    if (A[i] === B[j]) { out.push({ t: ' ', s: A[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) out.push({ t: '-', s: A[i++] });
    else out.push({ t: '+', s: B[j++] });
  }
  while (i < A.length) out.push({ t: '-', s: A[i++] });
  while (j < B.length) out.push({ t: '+', s: B[j++] });
  return out;
}
function nbFlatten(content) {
  return (content.cells || []).map((c, i) => `── cell ${i + 1} (${c.cell_type}) ──\n${srcText(c.source)}`).join('\n');
}
function nbHistoryDialog(path, currentContent, onRestore) {
  return openDialog((close) => {
    const list = el('div', { class: 'rev-list' }, loading());
    const view = el('div', { class: 'rev-view' }, el('p', { class: 'muted', style: { padding: '16px' } }, 'Select a version to compare it with the current notebook.'));
    (async () => {
      let revs;
      try { revs = await api(`/api/notebook/revisions?path=${encodeURIComponent(path)}`); } catch (e) { list.replaceChildren(errBox(e)); return; }
      if (!revs.length) { list.replaceChildren(el('p', { class: 'muted', style: { padding: '12px' } }, 'No saved versions yet. Versions are kept on every Save (Ctrl+S) and every 5 minutes of editing.')); return; }
      const now = nbFlatten(currentContent());
      list.replaceChildren(...revs.map((r) => {
        const b = el('button', { type: 'button', class: 'rev-row' }, el('div', { style: { fontWeight: 600 } }, fmtTime(r.time * 1000)),
          el('div', { class: 'muted', style: { fontSize: '12px' } }, `${ago(r.time)} · ${r.cells ?? '?'} cells · ${(r.size / 1024).toFixed(1)} KB`));
        b.addEventListener('click', async () => {
          list.querySelectorAll('.rev-row').forEach((x) => x.classList.toggle('sel', x === b));
          view.replaceChildren(loading());
          const rev = await api(`/api/notebook/revisions/${r.id}?path=${encodeURIComponent(path)}`);
          const diff = nbLineDiff(nbFlatten(rev.content), now);
          const changed = diff.filter((d) => d.t !== ' ').length;
          view.replaceChildren(
            el('div', { class: 'row', style: { padding: '10px 14px', borderBottom: '1px solid var(--line-soft)' } },
              el('span', { class: 'grow muted', style: { fontSize: '12.5px' } }, changed ? `${changed} changed lines · red = only in this version, green = only in current` : 'Identical to the current notebook'),
              btn('Restore this version', async () => {
                if (!(await confirmDialog('Restore this version?', 'The current notebook is saved as a version first, so you can undo this.', 'Restore'))) return;
                try { await api(`/api/notebook/revisions/${r.id}/restore?path=${encodeURIComponent(path)}`, { method: 'POST' }); close(true); onRestore(); }
                catch (e) { toast(e.message, 'err'); }
              }, { cls: 'primary sm', ic: 'restart' })),
            el('pre', { class: 'diff' }, diff.map((d) => el('div', { class: `d-${d.t === '+' ? 'add' : d.t === '-' ? 'del' : 'eq'}` }, `${d.t} ${d.s}`))));
        });
        return b;
      }));
    })();
    return el('div', { class: 'dlg' }, el('div', { class: 'row' }, el('h2', { class: 'grow' }, 'Version history'), btn('Close', () => close(null), { cls: 'sm' })),
      el('div', { class: 'rev-layout' }, list, view));
  }, { wide: true });
}

/* ---------------- keyboard shortcuts help ---------------- */
const NB_SHORTCUTS = [
  ['Run', [['Shift+Enter', 'Run cell, select next'], ['Ctrl+Enter', 'Run cell'], ['Run all / ⤒ ⤓ buttons', 'Run all, run above, run cell and below'], ['I  I', 'Interrupt (command mode)'], ['0  0', 'Restart kernel (command mode)']]],
  ['Editing code', [['Ctrl+/', 'Comment / uncomment lines'], ['Tab', 'Autocomplete · expand snippet · indent'], ['Ctrl+Space', 'Show suggestions'],
    ['Shift+Tab', 'Docs for the name at the cursor (press twice for full docs)'], ['Shift+Alt+F', 'Format cell (Black / SQL)'],
    ['Ctrl+D', 'Select next occurrence (multi-cursor)'], ['Ctrl+Click', 'Add another cursor'], ['Alt+Drag', 'Column (box) selection'],
    ['Alt+↑ / Alt+↓', 'Move line up / down'], ['Shift+Alt+↓', 'Duplicate line'], ['Ctrl+Shift+K', 'Delete line'], ['Ctrl+L', 'Select line'],
    ['Ctrl+] / Ctrl+[', 'Indent / outdent'], ['Ctrl+Z / Ctrl+Y', 'Undo / redo'], ['Ctrl+F / Ctrl+H', 'Find / replace in the whole notebook'], ['Ctrl+S', 'Save a version'], ['Esc', 'Leave the editor (command mode)']]],
  ['Command mode (press Esc first)', [['Enter', 'Edit cell'], ['↑ ↓  or  K J', 'Select previous / next cell'], ['A / B', 'Insert cell above / below'],
    ['D  D', 'Delete cell'], ['Z', 'Undo cell delete'], ['C / X', 'Copy / cut cell'], ['V / Shift+V', 'Paste cell below / above'],
    ['M / Y', 'Change to markdown / code'], ['O / H', 'Collapse output / code'], ['F / Shift+F', 'Find / format cell'], ['?', 'This help']]],
];
function nbShortcutsDialog() {
  return openDialog((close) => el('div', { class: 'dlg' }, el('div', { class: 'row' }, el('h2', { class: 'grow' }, 'Keyboard shortcuts'),
    btn('Snippets…', () => { close(null); edSnippetsDialog(); }, { cls: 'sm' }), btn('Close', () => close(null), { cls: 'sm' })),
  el('div', { class: 'kb-grid' }, NB_SHORTCUTS.map(([group, keys]) => el('div', {}, el('h3', { style: { margin: '6px 0 8px' } }, group),
    el('table', { class: 't kb' }, el('tbody', {}, keys.map(([k, d]) => el('tr', {}, el('td', {}, el('kbd', {}, k)), el('td', {}, d))))))))), { wide: true });
}

/* ---------------- autocomplete (IDE-style, as you type) ---------------- */
const NB_SQL_KEYWORDS = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'JOIN', 'LEFT JOIN', 'INNER JOIN', 'ON', 'AS', 'AND', 'OR', 'NOT',
  'IN', 'IS NULL', 'IS NOT NULL', 'DISTINCT', 'CASE WHEN', 'THEN', 'ELSE', 'END', 'UNION ALL', 'WITH', 'INSERT INTO', 'INSERT OVERWRITE', 'VALUES',
  'CREATE TABLE', 'CREATE OR REPLACE TABLE', 'CREATE SCHEMA', 'USING delta', 'MERGE INTO', 'WHEN MATCHED THEN', 'WHEN NOT MATCHED THEN', 'UPDATE SET',
  'DELETE FROM', 'DESCRIBE', 'DESCRIBE HISTORY', 'SHOW TABLES', 'SHOW DATABASES', 'OPTIMIZE', 'VACUUM', 'PARTITIONED BY', 'OVER', 'PARTITION BY'];
const NB_SQL_FUNCS = ['count(', 'sum(', 'avg(', 'min(', 'max(', 'coalesce(', 'concat(', 'lower(', 'upper(', 'trim(', 'cast(', 'date_format(', 'to_date(',
  'to_timestamp(', 'current_date()', 'current_timestamp()', 'date_add(', 'datediff(', 'row_number()', 'rank()', 'lag(', 'lead(', 'round(', 'nvl(', 'explode(',
  'from_json(', 'to_json(', 'get_json_object(', 'regexp_replace(', 'split(', 'size(', 'collect_list(', 'collect_set(', 'approx_count_distinct('];
const NB_PY_KEYWORDS = ['import', 'from', 'def', 'class', 'return', 'for', 'while', 'if', 'elif', 'else', 'try', 'except', 'finally', 'with', 'as', 'lambda',
  'yield', 'pass', 'break', 'continue', 'raise', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is', 'print(', 'len(', 'range(', 'display(', 'dbutils'];
const NB_KIND = {
  module: ['mod', 'k-mod'], class: ['class', 'k-cls'], function: ['fn', 'k-fn'], method: ['fn', 'k-fn'], instance: ['var', 'k-var'],
  statement: ['var', 'k-var'], param: ['param', 'k-var'], keyword: ['kw', 'k-kw'], path: ['path', 'k-path'], property: ['prop', 'k-var'],
  snippet: ['snip', 'k-snip'], database: ['schema', 'k-db'], table: ['table', 'k-tbl'], column: ['col', 'k-col'], sqlfn: ['fn', 'k-fn'], variable: ['var', 'k-var'], magic: ['magic', 'k-kw'],
};
const NB_SQL_CACHE = { dbs: null, tables: {}, cols: {}, at: 0 };
async function nbSqlDatabases() {
  if (!NB_SQL_CACHE.dbs || Date.now() - NB_SQL_CACHE.at > 60000) {
    try { NB_SQL_CACHE.dbs = (await api('/api/catalog/databases')).map((d) => d.name); NB_SQL_CACHE.tables = {}; NB_SQL_CACHE.at = Date.now(); }
    catch { NB_SQL_CACHE.dbs = NB_SQL_CACHE.dbs || []; }
  }
  return NB_SQL_CACHE.dbs;
}
async function nbSqlTables(db) {
  if (!NB_SQL_CACHE.tables[db]) {
    try { NB_SQL_CACHE.tables[db] = (await api(`/api/catalog/databases/${encodeURIComponent(db)}/tables`)).map((t) => t.name); }
    catch { NB_SQL_CACHE.tables[db] = []; }
  }
  return NB_SQL_CACHE.tables[db];
}
async function nbSqlColumns(fq) {
  if (!NB_SQL_CACHE.cols[fq]) {
    const [db, tb] = fq.split('.');
    try { NB_SQL_CACHE.cols[fq] = (await api(`/api/catalog/databases/${encodeURIComponent(db)}/tables/${encodeURIComponent(tb)}`)).columns.map((c) => ({ name: c.name, type: c.type })); }
    catch { NB_SQL_CACHE.cols[fq] = []; }
  }
  return NB_SQL_CACHE.cols[fq];
}
function nbItem(text, kind, detail = '', display = null) {
  return { text, displayText: display || text, kind, detail, render: nbRenderItem };
}
function nbRenderItem(elt, _self, data) {
  const [badge, cls] = NB_KIND[data.kind] || [data.kind || '', 'k-var'];
  elt.classList.add('nbh');
  elt.innerHTML = '';
  const b = document.createElement('span'); b.className = `nbh-k ${cls}`; b.textContent = badge;
  const t = document.createElement('span'); t.className = 'nbh-t'; t.textContent = data.displayText;
  elt.append(b, t);
  if (data.detail) { const d = document.createElement('span'); d.className = 'nbh-d'; d.textContent = data.detail; elt.append(d); }
}
function nbRank(list, prefix) {
  const p = (prefix || '').toLowerCase();
  const seen = new Set();
  return list.filter((it) => { if (seen.has(it.text)) return false; seen.add(it.text); return true; })
    .map((it) => { const t = it.displayText.toLowerCase(); return [t.startsWith(p) ? 0 : t.includes(p) ? 1 : 2, t.length, it]; })
    .filter(([r]) => !p || r < 2).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map((x) => x[2]).slice(0, 80);
}

/* SQL completions (a %sql cell, or SQL / a table name inside spark.sql("…"), spark.table("…")…) */
async function nbSqlSuggest(sqlBefore, fullSql, tableOnly = false) {
  const word = (sqlBefore.match(/[\w.`]*$/) || [''])[0].replace(/`/g, '');
  const before = sqlBefore.slice(0, sqlBefore.length - word.length);
  const prevKw = (before.match(/(\w+)\s*$/) || ['', ''])[1].toUpperCase();
  const dbs = await nbSqlDatabases();
  const out = [];
  if (word.includes('.')) {
    const parts = word.split('.');
    if (parts.length === 2 && dbs.includes(parts[0])) {
      (await nbSqlTables(parts[0])).forEach((t) => out.push(nbItem(`${parts[0]}.${t}`, 'table', parts[0], t)));
    } else if (parts.length >= 2) {
      const fq = parts.slice(0, 2).join('.');
      if (parts.length === 3) (await nbSqlColumns(fq)).forEach((c) => out.push(nbItem(`${fq}.${c.name}`, 'column', c.type, c.name)));
      const alias = parts[0];
      const m = new RegExp(`(\\w+\\.\\w+)\\s+(?:AS\\s+)?${alias}\\b`, 'i').exec(fullSql);
      if (m) (await nbSqlColumns(m[1])).forEach((c) => out.push(nbItem(`${alias}.${c.name}`, 'column', `${m[1]} · ${c.type}`, c.name)));
    }
    return { items: nbRank(out, word.split('.').pop()), word };
  }
  const wantTables = tableOnly || ['FROM', 'JOIN', 'INTO', 'TABLE', 'UPDATE', 'DESCRIBE', 'HISTORY', 'OPTIMIZE', 'VACUUM', 'IN'].includes(prevKw);
  dbs.forEach((d) => out.push(nbItem(`${d}.`, 'database', 'schema', d)));
  if (wantTables) {
    for (const d of dbs.slice(0, 25)) (await nbSqlTables(d)).forEach((t) => out.push(nbItem(`${d}.${t}`, 'table', d)));
  }
  if (!tableOnly) {
    const used = [...new Set((fullSql.match(/\b\w+\.\w+\b/g) || []))].filter((fq) => dbs.includes(fq.split('.')[0])).slice(0, 6);
    for (const fq of used) (await nbSqlColumns(fq)).forEach((c) => out.push(nbItem(c.name, 'column', `${fq.split('.')[1]} · ${c.type}`)));
    if (!wantTables) {
      NB_SQL_KEYWORDS.forEach((k) => out.push(nbItem(k, 'keyword')));
      NB_SQL_FUNCS.forEach((f) => out.push(nbItem(f, 'sqlfn')));
    }
  }
  return { items: nbRank(out, word), word };
}

/* Is the cursor inside the string argument of spark.sql( / spark.table( / .saveAsTable( / .insertInto( / DeltaTable.forName(spark, ? */
function nbStringCall(upto) {
  const m = /(\bsql|\btable|saveAsTable|insertInto|forName\s*\([^,()]*,)\s*\(?\s*[rfb]?("{3}|'{3}|"|')([^"']*)$/.exec(upto);
  if (!m) return null;
  return { isSql: /^sql$/.test(m[1].replace(/\b/g, '')), inner: m[3] };
}

function nbMakeHinter(apiNb) {
  const hint = (cm, callback) => {
    const cur = cm.getCursor();
    const doc = cm.getDoc();
    const text = cm.getValue();
    const idx = doc.indexFromPos(cur);
    const upto = text.slice(0, idx);
    const done = (list, fromIdx) => callback(list && list.length ? { list, from: doc.posFromIndex(fromIdx), to: cur } : null);

    if (/^\s*%sql\b/.test(text)) {
      const sql = text.replace(/^\s*%sql[^\n]*\n?/, '');
      const offset = text.length - sql.length;
      nbSqlSuggest(upto.slice(offset), sql).then(({ items, word }) => done(items, idx - word.length));
      return;
    }
    const tok = cm.getTokenAt(cur);
    if (tok.type && tok.type.includes('comment')) { callback(null); return; }
    const sc = tok.type && tok.type.includes('string') ? nbStringCall(upto) : null;
    if (sc) {
      nbSqlSuggest(sc.inner, sc.inner, !sc.isSql).then(({ items, word }) => done(items, idx - word.length));
      return;
    }
    const word = (upto.match(/\w*$/) || [''])[0];
    const varsList = apiNb.variables ? apiNb.variables() : [];
    const vars = varsList.map((v) => nbItem(v.name, 'variable', v.previewable ? `${v.type} · ${v.summary}` : v.type));
    const varTypes = Object.fromEntries(varsList.map((v) => [v.name, v.type]));
    const afterDot = /\.\w*$/.test(upto);
    apiNb.request('complete', { code: text, cursor: idx }).then((d) => {
      if (d && d.items && d.items.length) {
        const known = (t) => (t && t !== '<unknown>' ? t : 'statement');
        let items = d.items.map((it) => (varTypes[it.text]
          ? nbItem(it.text, 'variable', vars.find((v) => v.text === it.text).detail)
          : nbItem(it.text, known(it.type), (it.signature || '').replace(/^\w+/, ''))));
        const start = d.cursor_start;
        if (!afterDot) {  // your own variables first, then snippets, then everything else
          const typed = text.slice(start, idx).toLowerCase();
          const mine = vars.filter((v) => v.text.toLowerCase().startsWith(typed));
          items = [...mine, ...(typeof edSnippetItems === 'function' ? edSnippetItems(typed) : []), ...nbRank(items, typed)];
          const seen = new Set(); items = items.filter((x) => (seen.has(x.text) ? false : seen.add(x.text)));
        }
        callback(items.length ? { list: items.slice(0, 120), from: doc.posFromIndex(start), to: doc.posFromIndex(d.cursor_end) } : null);
        return;
      }
      if (afterDot || !word) { callback(null); return; }       // kernel busy: offline suggestions
      done([...(typeof edSnippetItems === 'function' ? edSnippetItems(word) : []), ...nbRank([...vars, ...NB_PY_KEYWORDS.map((k) => nbItem(k, 'keyword'))], word)], idx - word.length);
    }).catch(() => callback(null));
  };
  hint.async = true;
  return hint;
}

/* Show suggestions automatically while typing, like an IDE. */
function nbAutoSuggest(cm, hinter) {
  let timer = null;
  cm.on('inputRead', (editor, change) => {
    if (change.origin !== '+input' || editor.state.completionActive || editor.somethingSelected()) return;
    const ch = change.text.join('');
    const cur = editor.getCursor();
    const line = editor.getLine(cur.line).slice(0, cur.ch);
    const tok = editor.getTokenAt(cur);
    if (tok.type && tok.type.includes('comment')) return;
    const inSqlCell = /^\s*%sql\b/.test(editor.getValue());
    const inString = tok.type && tok.type.includes('string');
    let go = false;
    if (ch === '.') go = true;
    else if (ch === ' ') go = /\b(import|from\s+[\w.]+\s+import|FROM|JOIN|INTO|TABLE|UPDATE)\s$/i.test(line);
    else if (ch === '"' || ch === "'") go = !!nbStringCall(line);
    else if (/\w/.test(ch)) go = /[A-Za-z_]\w+$/.test(line) && (!inString || inSqlCell || !!nbStringCall(line));
    if (!go) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!editor.hasFocus() || editor.state.completionActive) return;
      editor.showHint({ hint: hinter, completeSingle: false, closeCharacters: /[\s()\[\]{};:>,=+\-*/]/, alignWithWord: true });
    }, 90);
  });
}
