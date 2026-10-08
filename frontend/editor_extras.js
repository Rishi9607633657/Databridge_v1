/* DataBridge editor extras — docs on hover / Shift+Tab, signature help, live error checking, format,
   find & replace across the notebook, snippets, cell run time, error-line highlighting.
   Loaded before app.js; helpers (el, api, btn, openDialog, toast…) are resolved at call time. */
'use strict';

/* ---------------- docs tooltip (Shift+Tab, hover, signature help on "(") ---------------- */
const edTip = { el: null, cm: null };
function edHideTip() { if (edTip.el) { edTip.el.remove(); edTip.el = null; edTip.cm = null; } }
function edShowTip(cm, pos, text, { short = false } = {}) {
  edHideTip();
  if (!text || !text.trim()) return;
  let body = text.trim();
  if (short) {
    const lines = body.split('\n');
    const sig = lines.findIndex((l) => /^(Signature|Init signature|Call signature):/.test(l));
    const doc = lines.findIndex((l) => /^Docstring:/.test(l));
    body = [sig >= 0 ? lines[sig].replace(/^(Init |Call )?[Ss]ignature:\s*/, '') : lines[0],
      doc >= 0 ? lines.slice(doc + 1, doc + 4).join('\n') : ''].filter(Boolean).join('\n');
  }
  const c = cm.charCoords(pos, 'page');
  const tip = el('div', { class: 'ed-tip', role: 'tooltip' },
    el('pre', {}, body),
    short ? el('div', { class: 'ed-tip-foot' }, 'Shift+Tab for full docs · Esc to close') : null);
  document.body.append(tip);
  const w = Math.min(640, window.innerWidth - 24);
  tip.style.maxWidth = `${w}px`;
  tip.style.left = `${Math.max(8, Math.min(c.left, window.innerWidth - w - 12))}px`;
  const h = tip.offsetHeight;
  tip.style.top = `${c.top - h - 6 > window.scrollY ? c.top - h - 6 : c.bottom + 6}px`;
  edTip.el = tip; edTip.cm = cm;
}
async function edInspectAt(cm, apiNb, pos, detail = 0) {
  if (/^\s*%(sql|md|sh|fs|run)\b/.test(cm.getValue())) return null;
  const doc = cm.getDoc();
  const d = await apiNb.request('inspect', { code: cm.getValue(), cursor: doc.indexFromPos(pos), detail });
  return d && d.found ? d.text : null;
}
function edSetupDocs(cm, apiNb) {
  // signature help when typing "("
  cm.on('change', async (editor, change) => {
    // typed "(" — auto-close inserts "()" with no origin, plain typing uses "+input"
    if (!(change.origin === '+input' || change.origin === undefined) || !change.text.join('').startsWith('(')) return;
    const cur = editor.getCursor();
    const parenCh = change.from.ch;                       // position of "(" (auto-close may have added ")")
    const before = CodeMirror.Pos(change.from.line, parenCh);
    if (!/\w$/.test(editor.getLine(change.from.line).slice(0, parenCh))) return;
    const text = await edInspectAt(editor, apiNb, before, 0);
    if (text && editor.hasFocus()) edShowTip(editor, cur, text, { short: true });
  });
  cm.on('keydown', (editor, e) => { if (edTip.cm === editor && (e.key === 'Escape' || e.key === ')')) edHideTip(); });
  cm.on('blur', () => setTimeout(() => { if (edTip.cm === cm && !edTip.el?.matches(':hover')) edHideTip(); }, 150));
  // hover docs
  let hoverTimer = null, lastWord = '';
  const wrap = cm.getWrapperElement();
  wrap.addEventListener('mousemove', (e) => {
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(async () => {
      const pos = cm.coordsChar({ left: e.clientX, top: e.clientY }, 'window');
      const tok = cm.getTokenAt(CodeMirror.Pos(pos.line, pos.ch + 1));
      if (!tok || !tok.type || !/variable|property|def|builtin/.test(tok.type) || tok.string.length < 2) return;
      const key = `${pos.line}:${tok.start}`;
      if (key === lastWord && edTip.el) return;
      lastWord = key;
      const text = await edInspectAt(cm, apiNb, CodeMirror.Pos(pos.line, tok.end), 0);
      if (text) edShowTip(cm, CodeMirror.Pos(pos.line, tok.start), text, { short: true });
    }, 650);
  });
  wrap.addEventListener('mouseleave', () => { clearTimeout(hoverTimer); lastWord = ''; setTimeout(() => { if (edTip.cm === cm && !edTip.el?.matches(':hover') && !cm.hasFocus()) edHideTip(); }, 250); });
}
async function edDocsCommand(cm, apiNb) {
  const full = !!edTip.el && edTip.cm === cm;         // second Shift+Tab: full docs
  const cur = cm.getCursor();
  const text = await edInspectAt(cm, apiNb, cur, full ? 1 : 0);
  if (text) edShowTip(cm, cur, text, { short: !full });
  else toast('No documentation found here (or the kernel is busy)');
}

/* ---------------- live error checking ---------------- */
function edApplyLint(cell, diags) {
  const cm = cell.cm;
  (cell.lintMarks || []).forEach((m) => m.clear());
  cell.lintMarks = [];
  for (const d of diags || []) {
    const line = Math.min(d.line, cm.lineCount() - 1);
    const text = cm.getLine(line) || '';
    const col = Math.min(d.col || 0, text.length);
    const m = /^\w+/.exec(text.slice(col));
    const end = m ? col + m[0].length : Math.max(text.length, col + 1);
    const from = CodeMirror.Pos(line, col === end ? Math.max(0, col - 1) : col);
    cell.lintMarks.push(cm.markText(from, CodeMirror.Pos(line, end), {
      className: d.severity === 'error' ? 'cm-lint-err' : 'cm-lint-warn', attributes: { title: d.message } }));
  }
  cell.lintCount = (diags || []).length;
}
async function edLintNotebook(cells, knownNames) {
  const code = cells.filter((c) => c.type === 'code');
  if (!code.length) return;
  try {
    const res = await api('/api/editor/lint', { method: 'POST', body: { cells: code.map((c) => ({ id: c.id, source: c.cm.getValue() })), names: knownNames } });
    for (const c of code) edApplyLint(c, res[c.id]);
  } catch { /* lint is best-effort */ }
}

/* ---------------- format ---------------- */
async function edFormatCell(cell) {
  if (cell.type !== 'code') return;
  const src = cell.cm.getValue();
  try {
    const r = await api('/api/editor/format', { method: 'POST', body: { source: src } });
    if (r.changed) {
      const cm = cell.cm;
      const cur = cm.getCursor();
      cm.operation(() => { cm.replaceRange(r.source, CodeMirror.Pos(0, 0), CodeMirror.Pos(cm.lastLine())); cm.setCursor(Math.min(cur.line, cm.lastLine()), 0); });
    } else if (r.message) toast(r.message);
  } catch (e) { toast(e.message, 'err'); }
}

/* ---------------- find & replace across all cells ---------------- */
function edFindBar(apiNb) {
  let matches = [], cur = -1, marks = [];
  const find = el('input', { class: 'field', placeholder: 'Find in notebook', 'aria-label': 'Find' });
  const repl = el('input', { class: 'field', placeholder: 'Replace with', 'aria-label': 'Replace' });
  const caseBtn = el('button', { type: 'button', class: 'btn sm ghost fb-tog', title: 'Match case', 'aria-pressed': 'false' }, 'Aa');
  const reBtn = el('button', { type: 'button', class: 'btn sm ghost fb-tog', title: 'Regular expression', 'aria-pressed': 'false' }, '.*');
  const count = el('span', { class: 'muted fb-count' }, '');
  const replRow = el('div', { class: 'fb-row', hidden: true }, repl,
    btn('Replace', () => replaceOne(), { cls: 'sm' }), btn('Replace all', () => replaceAll(), { cls: 'sm' }));
  const bar = el('div', { class: 'find-bar', hidden: true },
    el('div', { class: 'fb-row' }, find, caseBtn, reBtn, count,
      btn('', () => step(-1), { cls: 'ghost icon sm', ic: 'up', title: 'Previous (Shift+Enter)' }),
      btn('', () => step(1), { cls: 'ghost icon sm', ic: 'down', title: 'Next (Enter)' }),
      btn('', () => { replRow.hidden = !replRow.hidden; }, { cls: 'ghost icon sm', ic: 'edit', title: 'Toggle replace' }),
      btn('', () => close(), { cls: 'ghost icon sm', ic: 'x', title: 'Close (Esc)' })),
    replRow);
  const toggle = (b) => { b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); search(); };
  caseBtn.addEventListener('click', () => toggle(caseBtn));
  reBtn.addEventListener('click', () => toggle(reBtn));
  function regex() {
    const q = find.value;
    if (!q) return null;
    try {
      return new RegExp(reBtn.getAttribute('aria-pressed') === 'true' ? q : q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        caseBtn.getAttribute('aria-pressed') === 'true' ? 'g' : 'gi');
    } catch { return null; }
  }
  function clearMarks() { marks.forEach((m) => m.clear()); marks = []; }
  function search(keepIndex = false) {
    clearMarks();
    matches = [];
    const re = regex();
    if (re) {
      for (const c of apiNb.cells()) {
        const text = c.cm.getValue();
        const doc = c.cm.getDoc();
        for (const m of text.matchAll(re)) {
          if (!m[0].length) continue;
          const from = doc.posFromIndex(m.index), to = doc.posFromIndex(m.index + m[0].length);
          matches.push({ c, from, to });
          marks.push(c.cm.markText(from, to, { className: 'nb-find' }));
        }
      }
    }
    if (!keepIndex) cur = matches.length ? 0 : -1;
    else cur = Math.min(cur, matches.length - 1);
    paint();
  }
  function paint(scroll = false) {
    count.textContent = find.value ? (matches.length ? `${cur + 1} of ${matches.length}` : 'No results') : '';
    marks.forEach((m, i) => { m.clear(); const x = matches[i]; marks[i] = x.c.cm.markText(x.from, x.to, { className: i === cur ? 'nb-find nb-find-cur' : 'nb-find' }); });
    if (scroll && matches[cur]) {
      const x = matches[cur];
      if (x.c.type === 'markdown' && x.c.root.classList.contains('md-rendered')) apiNb.editMd(x.c);
      if (x.c.root.classList.contains('code-hidden')) apiNb.scrollTo(x.c);
      x.c.cm.setSelection(x.from, x.to);
      x.c.root.scrollIntoView({ block: 'center' });
      x.c.cm.scrollIntoView({ from: x.from, to: x.to }, 80);
    }
  }
  function step(d) { if (!matches.length) return; cur = (cur + d + matches.length) % matches.length; paint(true); }
  function replaceOne() {
    const x = matches[cur];
    if (!x) return;
    const re = regex();
    const text = x.c.cm.getRange(x.from, x.to);
    x.c.cm.replaceRange(reBtn.getAttribute('aria-pressed') === 'true' ? text.replace(new RegExp(re.source, re.flags.replace('g', '')), repl.value) : repl.value, x.from, x.to);
    search(true); paint(true);
  }
  function replaceAll() {
    const re = regex();
    if (!re) return;
    let n = 0;
    for (const c of apiNb.cells()) {
      const text = c.cm.getValue();
      const found = [...text.matchAll(re)].filter((m) => m[0].length);
      if (!found.length) continue;
      n += found.length;
      const doc = c.cm.getDoc();
      c.cm.operation(() => {
        for (const m of found.reverse()) {
          doc.replaceRange(reBtn.getAttribute('aria-pressed') === 'true' ? m[0].replace(new RegExp(re.source, re.flags.replace('g', '')), repl.value) : repl.value,
            doc.posFromIndex(m.index), doc.posFromIndex(m.index + m[0].length));
        }
      });
    }
    toast(`Replaced ${n} occurrence${n === 1 ? '' : 's'}`);
    search();
  }
  function close() { bar.hidden = true; clearMarks(); matches = []; }
  let t = null;
  find.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { search(); paint(true); }, 120); });
  find.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); step(e.shiftKey ? -1 : 1); } if (e.key === 'Escape') close(); });
  repl.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); replaceOne(); } if (e.key === 'Escape') close(); });
  return {
    el: bar,
    open(withReplace = false, seed = '') {
      bar.hidden = false;
      if (withReplace) replRow.hidden = false;
      if (seed && !seed.includes('\n')) find.value = seed;
      find.focus(); find.select();
      search(); paint(true);
    },
    refresh() { if (!bar.hidden && find.value) search(true); },
    close() { if (!bar.hidden) close(); },
    get open_() { return !bar.hidden; },
  };
}

/* ---------------- snippets ---------------- */
const ED_SNIPPETS = [
  { trigger: 'readtable', description: 'Read a table', body: 'df = spark.table("${1:bronze.table_name}")' },
  { trigger: 'readdelta', description: 'Read a Delta path', body: 'df = spark.read.format("delta").load(f"{BASE_PATH}/${1:bronze/table_name}")' },
  { trigger: 'readcsv', description: 'Read CSV files', body: 'df = (spark.read.option("header", True).option("inferSchema", True)\n      .csv(f"{BASE_PATH}/${1:landing/path}"))' },
  { trigger: 'readjson', description: 'Read JSON files', body: 'df = spark.read.option("multiLine", True).json(f"{BASE_PATH}/${1:landing/path}")' },
  { trigger: 'writedelta', description: 'Write a Delta table', body: '(df.write.format("delta")\n   .mode("${1:overwrite}")\n   .option("overwriteSchema", "true")\n   .saveAsTable("${2:silver.table_name}"))' },
  { trigger: 'merge', description: 'Delta MERGE (upsert) in Python', body: 'from delta.tables import DeltaTable\n\ntarget = DeltaTable.forName(spark, "${1:silver.table_name}")\n(target.alias("t")\n   .merge(df.alias("s"), "t.${2:id} = s.${2:id}")\n   .whenMatchedUpdateAll()\n   .whenNotMatchedInsertAll()\n   .execute())' },
  { trigger: 'mergesql', description: 'Delta MERGE in SQL', body: '%sql\nMERGE INTO ${1:silver.table_name} AS t\nUSING ${2:updates} AS s\nON t.id = s.id\nWHEN MATCHED THEN UPDATE SET *\nWHEN NOT MATCHED THEN INSERT *' },
  { trigger: 'dedupe', description: 'Keep the latest row per key', body: 'from pyspark.sql import Window\n\nw = Window.partitionBy("${1:id}").orderBy(F.col("${2:updated_at}").desc())\ndf = df.withColumn("_rn", F.row_number().over(w)).filter("_rn = 1").drop("_rn")' },
  { trigger: 'widget', description: 'Text widget + read it', body: 'dbutils.widgets.text("${1:param}", "${2:default}", "${3:Label}")\nparam_value = dbutils.widgets.get("param")' },
  { trigger: 'dropdown', description: 'Dropdown widget', body: 'dbutils.widgets.dropdown("${1:targetLayer}", "bronze", ["bronze", "silver", "gold"], "${2:Target Layer}")' },
  { trigger: 'nbrun', description: 'dbutils.notebook.run', body: 'result = dbutils.notebook.run("${1:./child_notebook}", ${2:600}, {"${3:key}": "${4:value}"})' },
  { trigger: 'nbmulti', description: 'Run notebooks in parallel', body: 'results = dbutils.notebook.runMultiple(\n    [{"path": "${1:./child_notebook}", "timeout_seconds": 600, "arguments": {"site": s}} for s in ${2:sites}],\n    max_parallel=4,\n)' },
  { trigger: 'nbexit', description: 'Return a value from this notebook', body: 'dbutils.notebook.exit(${1:json.dumps({"status": "ok"})})' },
  { trigger: 'sqlcell', description: '%sql query cell', body: '%sql\nSELECT *\nFROM ${1:bronze.table_name}\nLIMIT 100' },
  { trigger: 'schema', description: 'StructType schema', body: 'from pyspark.sql import types as T\n\nschema = T.StructType([\n    T.StructField("${1:id}", T.StringType(), False),\n    T.StructField("amount", T.DoubleType(), True),\n    T.StructField("updated_at", T.TimestampType(), True),\n])' },
  { trigger: 'jdbc', description: 'Read from PostgreSQL over JDBC', body: 'df = (spark.read.format("jdbc")\n      .option("url", "jdbc:postgresql://${1:host}:5432/${2:db}")\n      .option("dbtable", "${3:schema.table}")\n      .option("user", dbutils.widgets.get("db_user"))\n      .option("password", dbutils.widgets.get("db_password"))\n      .load())' },
  { trigger: 'udf', description: 'Python UDF', body: '@F.udf("${1:string}")\ndef ${2:my_udf}(value):\n    return value' },
  { trigger: 'optimize', description: 'OPTIMIZE + ZORDER', body: 'spark.sql("OPTIMIZE ${1:silver.table_name} ZORDER BY (${2:id})")' },
  { trigger: 'tryex', description: 'try / except with logging', body: 'try:\n    ${1:pass}\nexcept Exception as e:\n    print(f"failed: {e}")\n    raise' },
  { trigger: 'def', description: 'Function', body: 'def ${1:name}(${2:args}):\n    ${3:pass}' },
  { trigger: 'fordf', description: 'Loop over collected rows', body: 'for row in ${1:df}.limit(${2:100}).collect():\n    print(row)' },
];
const ED_SNIP_KEY = 'databridge.snippets';
function edAllSnippets() {
  let custom = [];
  try { custom = JSON.parse(localStorage.getItem(ED_SNIP_KEY) || '[]'); } catch { custom = []; }
  const map = new Map(ED_SNIPPETS.map((s) => [s.trigger, s]));
  custom.forEach((s) => s && s.trigger && s.body && map.set(s.trigger, { ...s, custom: true }));
  return [...map.values()];
}
function edInsertSnippet(cm, from, to, body) {
  const indent = (cm.getLine(from.line).match(/^\s*/) || [''])[0];
  let first = null;
  let text = '';
  const re = /\$\{(\d+):([^}]*)\}|\$(\d+)/g;
  let last = 0;
  body = body.replace(/\n/g, `\n${indent}`);
  for (const m of body.matchAll(re)) {
    text += body.slice(last, m.index);
    const n = Number(m[1] || m[3]);
    const def = m[2] || '';
    if (first === null || n < first.n) first = { n, start: text.length, end: text.length + def.length };
    text += def;
    last = m.index + m[0].length;
  }
  text += body.slice(last);
  cm.replaceRange(text, from, to);
  const doc = cm.getDoc();
  const base = doc.indexFromPos(from);
  if (first) cm.setSelection(doc.posFromIndex(base + first.start), doc.posFromIndex(base + first.end));
  else cm.setCursor(doc.posFromIndex(base + text.length));
}
function edTryExpandSnippet(cm) {
  const cur = cm.getCursor();
  const before = cm.getLine(cur.line).slice(0, cur.ch);
  const m = /(?:^|\s)([A-Za-z]\w*)$/.exec(before);
  if (!m) return false;
  const snip = edAllSnippets().find((s) => s.trigger === m[1]);
  if (!snip) return false;
  edInsertSnippet(cm, CodeMirror.Pos(cur.line, cur.ch - m[1].length), cur, snip.body);
  return true;
}
function edSnippetItems(prefix) {
  if (!prefix || prefix.length < 2) return [];
  return edAllSnippets().filter((s) => s.trigger.startsWith(prefix)).map((s) => ({
    text: s.trigger, displayText: s.trigger, kind: 'snippet', detail: s.description || 'snippet', render: nbRenderItem,
    hint: (cm, data, completion) => edInsertSnippet(cm, data.from, data.to, s.body),
  }));
}
function edSnippetsDialog() {
  return openDialog((close) => {
    let custom = [];
    try { custom = JSON.parse(localStorage.getItem(ED_SNIP_KEY) || '[]'); } catch { custom = []; }
    const ta = el('textarea', { class: 'field', rows: 12, spellcheck: 'false' }, JSON.stringify(custom.length ? custom
      : [{ trigger: 'mytable', description: 'My favourite table', body: 'df = spark.table("${1:silver.orders}")' }], null, 2));
    return el('div', { class: 'dlg' },
      el('div', { class: 'row' }, el('h2', { class: 'grow' }, 'Snippets'), btn('Close', () => close(null), { cls: 'sm' })),
      el('p', { class: 'muted', style: { margin: 0 } }, 'Type a trigger and press Tab (or pick it from the suggestions). ${1:text} marks the part that gets selected.'),
      el('div', { class: 'snip-list' }, ED_SNIPPETS.map((s) => el('div', { class: 'snip' }, el('code', {}, s.trigger), el('span', { class: 'muted' }, s.description)))),
      el('h3', { style: { margin: '8px 0 0' } }, 'Your snippets (JSON)'), ta,
      el('div', { class: 'actions' }, btn('Save my snippets', () => {
        try {
          const v = JSON.parse(ta.value || '[]');
          if (!Array.isArray(v)) throw new Error('Must be a list');
          localStorage.setItem(ED_SNIP_KEY, JSON.stringify(v));
          toast(`Saved ${v.length} snippet${v.length === 1 ? '' : 's'}`); close(true);
        } catch (e) { toast(`Invalid JSON: ${e.message}`, 'err'); }
      }, { cls: 'primary' })));
  }, { wide: true });
}

/* ---------------- cell run time ---------------- */
function edFmtDur(s) { return s == null ? '' : s < 60 ? `${s.toFixed(s < 10 ? 2 : 1)}s` : `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`; }
function edRenderTime(cell) {
  if (!cell.timeEl) return;
  if (cell.type !== 'code') { cell.timeEl.textContent = ''; return; }
  if (cell.status === 'running' && cell.started) {
    cell.timeEl.className = 'cell-time running';
    cell.timeEl.textContent = `Running… ${edFmtDur(Date.now() / 1000 - cell.started)}`;
    return;
  }
  if (cell.status === 'queued') { cell.timeEl.className = 'cell-time'; cell.timeEl.textContent = 'Waiting to run…'; return; }
  const t = (cell.meta && cell.meta.databridge) || {};
  if (t.duration == null) { cell.timeEl.textContent = ''; return; }
  const when = t.finished ? new Date(t.finished * 1000).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
  cell.timeEl.className = `cell-time ${t.status === 'ok' ? 'ok' : t.status ? 'bad' : ''}`;
  cell.timeEl.textContent = `${t.status === 'ok' ? '✓ Took' : t.status === 'aborted' ? '■ Stopped after' : '✗ Failed after'} ${edFmtDur(t.duration)}${when ? ` · ${when}` : ''}`;
}

/* ---------------- error line (like Databricks) ---------------- */
function edErrorLine(cell) {
  const err = (cell.outputs || []).find((o) => o.output_type === 'error' && o.ename !== 'NotebookExit');
  if (!err) return null;
  const tb = (err.traceback || []).join('\n');
  const src = cell.cm ? cell.cm.getValue() : cell.source || '';
  if (/^\s*%sql\b/.test(src)) {       // Spark SQL error: "line 1, pos 14" relative to the statement
    const m = /line (\d+),? pos(?:ition)? (\d+)/i.exec(`${err.evalue} ${tb}`);
    if (!m) return null;
    const lines = src.split('\n');
    let first = 1;
    while (first < lines.length && !lines[first].trim()) first++;
    return { line: Math.min(lines.length - 1, first + Number(m[1]) - 1), col: Number(m[2]), ename: err.ename, evalue: err.evalue };
  }
  const m = /Cell In\[\d+\], line (\d+)/.exec(tb) || /File "<[^>]*>", line (\d+)/.exec(tb);
  if (!m) return null;
  return { line: Number(m[1]) - 1, ename: err.ename, evalue: err.evalue };
}
function edClearErrorLine(cell) {
  if (cell.errLine != null) { try { cell.cm.removeLineClass(cell.errLine, 'background', 'cm-err-line'); } catch { /* line gone */ } }
  if (cell.errWidget) { cell.errWidget.clear(); cell.errWidget = null; }
  cell.errLine = null;
}
function edShowErrorLine(cell) {
  edClearErrorLine(cell);
  const info = edErrorLine(cell);
  if (!info || cell.type !== 'code') return;
  const line = Math.max(0, Math.min(info.line, cell.cm.lineCount() - 1));
  cell.errLine = line;
  cell.cm.addLineClass(line, 'background', 'cm-err-line');
  const w = el('div', { class: 'cm-err-widget' }, el('span', { class: 'cm-err-ic' }, '▲'), `${info.ename}: ${String(info.evalue).split('\n')[0].slice(0, 220)}`);
  cell.errWidget = cell.cm.addLineWidget(line, w, { coverGutter: false, noHScroll: true });
}
