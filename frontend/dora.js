/* Dora — DataBridge AI assistant (chat panel, Fix with Dora, SQL helper). Loaded before app.js. */
'use strict';

const DORA_SPARK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><defs><linearGradient id="dg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0A5CFF"/><stop offset="1" stop-color="#12CFF5"/></linearGradient></defs><path d="M12 2l2.2 6.3L20.5 10.5l-6.3 2.2L12 19l-2.2-6.3L3.5 10.5l6.3-2.2z" fill="url(#dg)"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z" fill="#12CFF5"/></svg>';
function doraIcon() { const s = el('span', { class: 'dora-ic', 'aria-hidden': 'true' }); s.innerHTML = DORA_SPARK; return s; }

let DORA_STATUS = null;
async function doraStatus(force = false) {
  if (!DORA_STATUS || force) { try { DORA_STATUS = await api('/api/dora/status'); } catch (e) { DORA_STATUS = { ok: false, message: e.message }; } }
  return DORA_STATUS;
}

async function doraStream(body, onChunk, signal) {
  const r = await fetch('/api/dora/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal });
  if (!r.ok || !r.body) throw new Error(`Dora request failed (${r.status})`);
  const reader = r.body.getReader();
  const dec = new TextDecoder();
  let text = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    text += dec.decode(value, { stream: true });
    onChunk(text);
  }
  return text;
}

/* Render markdown and add action buttons to every code block. */
function doraRender(target, text, actions) {
  target.innerHTML = DOMPurify.sanitize(marked.parse(text || ''));
  target.querySelectorAll('pre > code').forEach((code) => {
    const pre = code.parentElement;
    const lang = ((code.className || '').match(/language-(\w+)/) || [])[1] || '';
    let src = code.textContent.replace(/\n$/, '');
    if (lang === 'sql' && !/^\s*%sql/.test(src) && actions.sqlAsMagic) src = `%sql\n${src}`;
    const bar = el('div', { class: 'dora-code-bar' }, el('span', { class: 'muted' }, lang || 'code'), el('span', { class: 'grow' }),
      (actions.buttons || []).map(([label, fn]) => el('button', { type: 'button', class: 'btn sm', onClick: () => fn(src, lang) }, label)),
      el('button', { type: 'button', class: 'btn sm ghost', onClick: () => navigator.clipboard.writeText(src).then(() => toast('Copied')) }, 'Copy'));
    pre.parentElement.insertBefore(el('div', { class: 'dora-code' }, bar, pre.cloneNode(true)), pre);
    pre.remove();
  });
}

/* ---------------- notebook chat panel ---------------- */
function createDoraPanel(nbApi) {
  const history = [];
  let controller = null;
  const list = el('div', { class: 'dora-msgs', 'aria-live': 'polite' });
  const input = el('textarea', { class: 'field dora-input', rows: 2, placeholder: 'Ask Dora… e.g. "read bronze.orders, keep the latest row per order_id and write silver.orders"' });
  const sendBtn = btn('Send', () => send(), { cls: 'primary sm' });
  const stopBtn = btn('Stop', () => controller && controller.abort(), { cls: 'sm', ic: 'stop' });
  stopBtn.hidden = true;
  const statusEl = el('div', { class: 'dora-status' });
  const quick = el('div', { class: 'dora-quick' });
  const root = el('div', { class: 'dora' }, statusEl, list, quick,
    el('div', { class: 'dora-compose' }, input, el('div', { class: 'row', style: { gap: '6px' } },
      el('span', { class: 'muted', style: { fontSize: '11px' } }, 'Enter to send · Shift+Enter new line'), el('span', { class: 'grow' }),
      btn('New chat', () => { history.length = 0; list.replaceChildren(); welcome(); }, { cls: 'sm ghost' }), stopBtn, sendBtn)));
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });

  const codeActions = {
    sqlAsMagic: true,
    buttons: [
      ['Insert cell', (src) => { nbApi.insertBelow(src); toast('Inserted a new cell'); }],
      ['Replace cell', (src) => { if (nbApi.replaceActive(src)) toast('Active cell replaced'); else toast('Select a code cell first', 'err'); }],
    ],
  };

  function welcome() {
    list.append(el('div', { class: 'dora-msg dora-bot' }, el('div', { class: 'dora-who' }, doraIcon(), 'Dora'),
      el('div', { class: 'md' }, el('p', {}, 'Hi, I\'m Dora. I can see this notebook, your variables and the schemas of the tables you use.'),
        el('p', {}, 'Ask me to write, explain, fix or speed up code — or use the buttons below for the selected cell.'))));
  }
  function drawQuick() {
    const c = nbApi.activeCell();
    const hasErr = c && c.outputs && c.outputs.some((o) => o.output_type === 'error' && o.ename !== 'NotebookExit');
    setKids(quick, el('span', { class: 'muted' }, c ? `Cell ${nbApi.cells().indexOf(c) + 1}:` : 'Select a cell:'),
      hasErr ? el('button', { type: 'button', class: 'chip dora-chip err', onClick: () => ask('fix', 'Fix this error') }, 'Fix error') : null,
      el('button', { type: 'button', class: 'chip dora-chip', onClick: () => ask('explain', 'Explain this cell') }, 'Explain'),
      el('button', { type: 'button', class: 'chip dora-chip', onClick: () => ask('optimize', 'Optimize this cell') }, 'Optimize'),
      el('button', { type: 'button', class: 'chip dora-chip', onClick: () => ask('comment', 'Add comments to this cell') }, 'Add comments'));
  }
  async function refreshStatus() {
    const st = await doraStatus(true);
    setKids(statusEl, el('span', { class: 'dot', style: { background: st.ok ? 'var(--ok)' : 'var(--fail)' } }),
      el('span', {}, st.ok ? `${st.model}` : 'Not connected'),
      el('span', { class: 'muted' }, st.ok ? (st.provider === 'ollama' ? ' · local (Ollama)' : ' · cloud') : ''),
      !st.ok && st.message ? el('div', { class: 'dora-setup' }, st.message) : null);
  }
  async function ask(mode, prompt) {
    if (controller) return;
    const ctx = nbApi.context();
    const shown = prompt || '(no question)';
    list.append(el('div', { class: 'dora-msg dora-user' }, shown));
    const body = el('div', { class: 'md' }, el('span', { class: 'dora-typing' }, 'Dora is thinking…'));
    const msg = el('div', { class: 'dora-msg dora-bot' }, el('div', { class: 'dora-who' }, doraIcon(), 'Dora'), body);
    list.append(msg);
    list.scrollTop = list.scrollHeight;
    controller = new AbortController();
    sendBtn.hidden = true; stopBtn.hidden = false;
    let last = 0, text = '';
    try {
      text = await doraStream({ mode, prompt, context: ctx, history }, (t) => {
        text = t;
        const now = Date.now();
        if (now - last > 120) { last = now; doraRender(body, t, { buttons: [] }); list.scrollTop = list.scrollHeight; }
      }, controller.signal);
    } catch (e) {
      if (e.name !== 'AbortError') text += `\n\n**Error:** ${e.message}`;
      else text += '\n\n_(stopped)_';
    } finally {
      controller = null; sendBtn.hidden = false; stopBtn.hidden = true;
    }
    doraRender(body, text, codeActions);
    list.scrollTop = list.scrollHeight;
    history.push({ role: 'user', content: prompt }, { role: 'assistant', content: text });
    drawQuick();
  }
  function send() {
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    const generate = /\b(write|create|generate|build|read|load|join|aggregate|convert|make)\b/i.test(q);
    ask(generate ? 'generate' : 'chat', q);
  }
  welcome();
  return {
    el: root,
    onShow() { refreshStatus(); drawQuick(); setTimeout(() => input.focus(), 50); },
    ask, drawQuick,
  };
}

/* ---------------- SQL editor helper ---------------- */
function createDoraSqlBar(getSql, setSql) {
  const input = el('input', { class: 'field', placeholder: 'Ask Dora to write SQL — e.g. "total sales per site for the last 7 days from gold.sales_daily"' });
  const out = el('div', { class: 'dora-sql-out', hidden: true });
  let controller = null;
  const go = async () => {
    const q = input.value.trim();
    if (!q || controller) return;
    out.hidden = false;
    out.replaceChildren(el('span', { class: 'dora-typing' }, 'Dora is writing SQL…'));
    controller = new AbortController();
    let text = '';
    try {
      text = await doraStream({ mode: 'sql', prompt: q, context: { sql: getSql() } }, (t) => { text = t; doraRender(out, t, { buttons: [] }); }, controller.signal);
    } catch (e) { text += `\n\n**Error:** ${e.message}`; }
    controller = null;
    doraRender(out, text, { buttons: [['Use this SQL', (src) => { setSql(src.replace(/^\s*%sql\s*\n/, '')); toast('SQL placed in the editor'); }]] });
  };
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
  return el('div', { class: 'dora-sql' }, el('div', { class: 'row', style: { gap: '8px' } }, doraIcon(), input, btn('Ask Dora', go, { cls: 'sm' })), out);
}
