/* AI Agent: chat with an agent that explores data and builds pipelines. Runs list | chat | live tool steps. Writes need Approve. */
'use strict';

const AG_SUGGEST = [
  'What data do I have? Suggest Silver and Gold tables to build.',
  'Why did my last sync fail? Find the cause and suggest a fix.',
  'Build a cleaned Silver table from my newest source table: typed columns, trimmed text, deduplicated. Then run quality checks.',
  'Check every table in my silver schemas for null keys and duplicates.',
];
const AG_TOOL_LABEL = {
  list_schemas: 'List schemas', list_tables: 'List tables', describe_table: 'Describe table', sample_table: 'Sample rows',
  run_sql: 'Run SQL', quality_check: 'Quality check', list_connections: 'List connections', list_syncs: 'List syncs',
  recent_failures: 'Recent failures', create_table: 'Create table', run_sync: 'Run sync',
};
const AG_STATUS = { queued: 'Starting', running: 'Working', stopping: 'Stopping', waiting: 'Needs approval', done: 'Done', failed: 'Failed', stopped: 'Stopped' };

function agMd(text) {
  return el('div', { class: 'md ag-md', html: DOMPurify.sanitize(marked.parse(String(text || ''))) });
}
function agAgo(t) {
  const s = Math.max(0, Date.now() / 1000 - (t || 0));
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return new Date(t * 1000).toLocaleDateString();
}
function agBadge(st) {
  return el('span', { class: `ag-badge s-${st}` }, (st === 'running' || st === 'queued') ? el('span', { class: 'ag-dot' }) : null, AG_STATUS[st] || st);
}
function agArgsLine(name, a) {
  a = a || {};
  if (name === 'run_sql') return String(a.query || '').replace(/\s+/g, ' ').slice(0, 90);
  if (name === 'describe_table' || name === 'sample_table') return `${a.schema}.${a.table}`;
  if (name === 'list_tables') return a.schema;
  if (name === 'quality_check') return `${a.table} · keys ${(a.key_columns || []).join(', ')}`;
  if (name === 'create_table') return a.target;
  if (name === 'run_sync') return a.sync_id;
  return '';
}
function agResult(res) {
  if (res && Array.isArray(res.columns) && Array.isArray(res.rows)) {
    const rows = res.rows.slice(0, 20);
    return el('div', { class: 'ag-tbl' },
      el('table', { class: 't' }, el('thead', {}, el('tr', {}, res.columns.map((c) => el('th', {}, c)))),
        el('tbody', {}, rows.map((r) => el('tr', {}, r.map((v) => el('td', {}, v == null ? 'null' : typeof v === 'object' ? JSON.stringify(v) : String(v))))))),
      el('div', { class: 'muted small', style: { padding: '4px 2px' } }, `${res.rows_returned ?? res.rows.length} row(s)${res.engine ? ' · ' + res.engine : ''}`));
  }
  return el('pre', { class: 'ag-pre mono' }, JSON.stringify(res, null, 2).slice(0, 6000));
}

async function viewAgent(main, r) {
  let rid = r.params.get('run') || null;
  let alive = true, timer = null, status = null, lastSig = '';
  main.classList.add('ag-page');
  const runsBox = el('div', { class: 'ag-runs' });
  const chat = el('div', { class: 'ag-chat', 'aria-live': 'polite' });
  const steps = el('div', { class: 'ag-steps' });
  const head = el('div', { class: 'ag-chat-head' });
  const input = el('textarea', { class: 'ag-input', rows: 2, placeholder: 'Tell the agent what to do…  (Enter to send, Shift+Enter for a new line)' });
  const send = el('button', { type: 'button', class: 'btn primary' }, 'Send');
  const stopBtn = el('button', { type: 'button', class: 'btn', hidden: true }, 'Stop');

  main.append(
    el('div', { class: 'page-head', style: { marginBottom: '10px' } },
      el('div', { class: 'grow' }, el('h1', {}, 'AI Agent'),
        el('p', { class: 'muted small', style: { margin: '2px 0 0' } }, 'Explores your data, builds Silver/Gold tables and fixes syncs. It asks before it writes anything.')),
      el('span', { class: 'muted small', id: 'ag-model' })),
    el('div', { class: 'ag-grid' },
      el('aside', { class: 'ag-col ag-left' },
        el('button', { type: 'button', class: 'btn primary', style: { width: '100%' }, onClick: () => go(null) }, '+ New task'),
        el('div', { class: 'ag-sub' }, 'Recent runs'), runsBox),
      el('section', { class: 'ag-col ag-mid' }, head, chat,
        el('div', { class: 'ag-compose' }, input, el('div', { class: 'ag-compose-btns' }, stopBtn, send))),
      el('aside', { class: 'ag-col ag-right' }, el('div', { class: 'ag-sub' }, 'Steps'), steps)));

  function go(id) {
    rid = id;
    lastSig = '';
    history.replaceState(null, '', id ? `#/agent?run=${id}` : '#/agent');
    load();
  }

  async function loadRuns() {
    let list = [];
    try { list = await api('/api/agent/runs'); } catch { /* ignore */ }
    if (!alive) return;
    setKids(runsBox, list.length ? list.map((x) => el('button', {
      type: 'button', class: `ag-run${x.id === rid ? ' on' : ''}`, onClick: () => go(x.id),
    }, el('div', { class: 'ag-run-t' }, x.title || x.task), el('div', { class: 'ag-run-m' }, agBadge(x.status), el('span', {}, agAgo(x.updated || x.created)))))
      : el('div', { class: 'muted small', style: { padding: '8px 4px' } }, 'No runs yet.'));
  }

  function renderEmpty() {
    setKids(head, el('h3', {}, 'New task'));
    const cfg = status || {};
    setKids(chat, el('div', { class: 'ag-empty' },
      el('div', { class: 'ag-empty-ico' }, icon('spark', 28)),
      el('h3', {}, 'What should the agent do?'),
      el('p', { class: 'muted' }, 'It reads your catalog and syncs, tests SQL, and pauses for your approval before creating tables or running syncs.'),
      cfg.configured === false ? el('div', { class: 'error-box' }, 'No AI model configured. Set Dora (AI) or the AI Agent settings in Admin › Settings.') : null,
      el('div', { class: 'ag-chips' }, AG_SUGGEST.map((s) => el('button', { type: 'button', class: 'ag-chip', onClick: () => { input.value = s; input.focus(); } }, s))),
      cfg.write_schemas ? el('p', { class: 'muted small' }, `Allowed write schemas: ${cfg.write_schemas.join(', ')}`) : null));
    setKids(steps, el('div', { class: 'muted small', style: { padding: '8px 4px' } }, 'Tool calls appear here as the agent works.'));
    stopBtn.hidden = true;
    send.disabled = false;
    input.disabled = false;
  }

  function approvalCard(run, s, isPending) {
    const a = s.args || {};
    const body = s.name === 'create_table'
      ? [el('div', { class: 'ag-appr-t' }, 'Create or replace table ', el('b', { class: 'mono' }, a.target)),
        el('pre', { class: 'ag-sql mono' }, `CREATE OR REPLACE TABLE ${a.target} USING DELTA AS\n${a.select_sql || ''}`)]
      : [el('div', { class: 'ag-appr-t' }, 'Run sync ', el('b', { class: 'mono' }, a.sync_id), ' now')];
    const note = el('input', { class: 'field', placeholder: 'Optional: why reject / what to change', style: { flex: 1 } });
    const decide = async (ok) => {
      try { await api(`/api/agent/runs/${run.id}/approve`, { method: 'POST', body: { approve: ok, note: note.value.trim() || null } }); }
      catch (e) { toast(e.message, 'err'); }
      lastSig = '';
      load();
    };
    return el('div', { class: `ag-appr${isPending ? ' pending' : ''}` },
      el('div', { class: 'ag-appr-h' }, '⚠ Approval needed'), body,
      isPending ? el('div', { class: 'ag-appr-btns' }, note,
        el('button', { type: 'button', class: 'btn danger', onClick: () => decide(false) }, 'Reject'),
        el('button', { type: 'button', class: 'btn primary', onClick: () => decide(true) }, 'Approve & run')) : null);
  }

  function renderRun(run) {
    const sig = `${run.status}|${run.steps.length}`;
    if (sig === lastSig) return;
    const stick = chat.scrollHeight - chat.scrollTop - chat.clientHeight < 80;
    lastSig = sig;
    setKids(head, el('h3', { class: 'grow', title: run.task }, run.title || run.task), agBadge(run.status),
      el('button', { type: 'button', class: 'btn ghost sm', title: 'Delete run', onClick: async () => {
        if (!confirm('Delete this run?')) return;
        await api(`/api/agent/runs/${run.id}`, { method: 'DELETE' }); go(null); loadRuns();
      } }, 'Delete'));
    const pendingIdx = run.status === 'waiting' ? run.steps.map((s) => s.kind).lastIndexOf('approval') : -1;
    const decisions = {};
    run.steps.forEach((s, i) => { if (s.kind === 'decision') decisions[i] = s; });
    const items = [];
    run.steps.forEach((s, i) => {
      if (s.kind === 'user') items.push(el('div', { class: 'ag-msg me' }, el('div', { class: 'ag-bub' }, s.text)));
      else if (s.kind === 'thought') items.push(el('div', { class: 'ag-msg bot' }, el('div', { class: 'ag-bub' }, agMd(s.text))));
      else if (s.kind === 'final') items.push(el('div', { class: 'ag-msg bot final' }, el('div', { class: 'ag-bub' }, agMd(s.text))));
      else if (s.kind === 'error') items.push(el('div', { class: 'ag-msg bot' }, el('div', { class: 'error-box' }, s.text)));
      else if (s.kind === 'approval') items.push(approvalCard(run, s, i === pendingIdx));
      else if (s.kind === 'decision') items.push(el('div', { class: `ag-decision ${s.approved ? 'ok' : 'no'}` },
        s.approved ? '✓ Approved' : '✕ Rejected', s.by ? ` by ${s.by}` : '', s.note ? ` — ${s.note}` : ''));
    });
    if (run.running || run.status === 'queued' || run.status === 'running') {
      items.push(el('div', { class: 'ag-msg bot' }, el('div', { class: 'ag-bub ag-typing' }, el('span'), el('span'), el('span'))));
    }
    setKids(chat, items);
    if (stick || run.status === 'waiting') chat.scrollTop = chat.scrollHeight;

    const tools = [];
    run.steps.forEach((s, i) => {
      if (s.kind === 'tool') tools.push(s);
      else if (s.kind === 'approval') {
        const d = run.steps.slice(i + 1).find((x) => x.kind === 'decision');
        if (!d && i === pendingIdx) tools.push(s);
      }
    });
    let n = 0;
    setKids(steps, tools.length ? tools.map((s) => {
      if (s.kind === 'approval') return el('div', { class: 'ag-step wait' }, el('div', { class: 'ag-step-h' }, el('span', { class: 'ag-step-n' }, '!'),
        el('b', {}, AG_TOOL_LABEL[s.name] || s.name), el('span', { class: 'muted small grow' }, 'waiting for your approval')));
      n += 1;
      return el('details', { class: `ag-step${s.error ? ' err' : ' ok'}` },
        el('summary', { class: 'ag-step-h' }, el('span', { class: 'ag-step-n' }, String(n)), el('b', {}, AG_TOOL_LABEL[s.name] || s.name),
          el('span', { class: 'ag-step-a mono' }, agArgsLine(s.name, s.args)),
          el('span', { class: 'ag-step-ms' }, s.error ? 'error' : s.ms != null ? `${(s.ms / 1000).toFixed(1)}s` : '')),
        Object.keys(s.args || {}).length ? el('pre', { class: 'ag-pre mono' }, JSON.stringify(s.args, null, 2)) : null,
        agResult(s.result));
    }) : el('div', { class: 'muted small', style: { padding: '8px 4px' } }, run.running ? 'Thinking…' : 'No tool calls.'));
    if (run.running) steps.scrollTop = steps.scrollHeight;

    const busy = run.running || ['queued', 'running', 'stopping'].includes(run.status);
    stopBtn.hidden = !(busy || run.status === 'waiting');
    send.disabled = busy || run.status === 'waiting';
    input.disabled = busy || run.status === 'waiting';
    input.placeholder = run.status === 'waiting' ? 'Approve or reject the action above first' : busy ? 'The agent is working…' : 'Follow-up: ask a question or tell it what to change…';
  }

  async function load() {
    clearTimeout(timer);
    if (!alive) return;
    if (!rid) { renderEmpty(); loadRuns(); return; }
    let run;
    try { run = await api(`/api/agent/runs/${rid}`); }
    catch (e) { setKids(chat, errBox(e)); return; }
    if (!alive || run.id !== rid) return;
    const before = lastSig.split('|')[0];
    renderRun(run);
    if (before !== run.status) loadRuns();
    const busy = run.running || ['queued', 'running', 'stopping'].includes(run.status);
    if (busy) timer = setTimeout(load, 1500);
  }

  async function submit() {
    const text = input.value.trim();
    if (!text || send.disabled) return;
    send.disabled = true;
    try {
      const run = rid ? await api(`/api/agent/runs/${rid}/message`, { method: 'POST', body: { text } })
        : await api('/api/agent/runs', { method: 'POST', body: { task: text } });
      input.value = '';
      go(run.id);
      loadRuns();
    } catch (e) { toast(e.message, 'err'); send.disabled = false; }
  }
  send.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } });
  stopBtn.addEventListener('click', async () => {
    try { await api(`/api/agent/runs/${rid}/stop`, { method: 'POST' }); } catch (e) { toast(e.message, 'err'); }
    lastSig = ''; load();
  });

  api('/api/agent/status').then((s) => {
    status = s;
    const m = $('#ag-model');
    if (m) m.textContent = s.configured ? `Model: ${s.model}` : '';
    if (!rid) renderEmpty();
  }).catch(() => {});
  loadRuns();
  load();
  return () => { alive = false; clearTimeout(timer); };
}
