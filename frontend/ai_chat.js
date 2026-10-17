/* DataBridge AI: a ChatGPT-style assistant available on every page (top bar, Ctrl+J). */
'use strict';
(function () {
  const KEY = 'databridge-chats';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
  const store = (chats) => { try { localStorage.setItem(KEY, JSON.stringify(chats.slice(0, 50))); } catch { /* full */ } };
  let chats = load(), current = null, busy = null, panel = null;

  function pageContext() {
    const sel = String(window.getSelection ? window.getSelection() : '').trim();
    const route = location.hash || '#/';
    const title = (document.querySelector('main h1') || {}).textContent || '';
    let extra = '';
    const cm = document.querySelector('.cell.active .CodeMirror');
    if (cm && cm.CodeMirror) extra = `\nActive notebook cell:\n${cm.CodeMirror.getValue().slice(0, 4000)}`;
    return `The user is on DataBridge page "${title.trim()}" (${route}).${sel ? `\nSelected text:\n${sel.slice(0, 4000)}` : ''}${extra}`;
  }
  function newChat() { current = { id: Math.random().toString(36).slice(2, 10), title: 'New chat', messages: [], updated: Date.now() }; chats.unshift(current); render(); }
  function render() {
    if (!panel) return;
    const list = panel.querySelector('.aic-list'), log = panel.querySelector('.aic-log');
    if (!chats.length) list.replaceChildren(el('p', { class: 'muted small', style: { padding: '6px 8px' } }, 'No chats yet.'));
    else list.replaceChildren(...chats.map((c) => el('button', { type: 'button', class: 'aic-chat', 'aria-current': current && c.id === current.id ? 'true' : null,
      onClick: () => { current = c; panel.classList.remove('show-hist'); render(); } }, el('span', {}, c.title), el('span', { class: 'aic-del', title: 'Delete chat', onClick: (e) => {
      e.stopPropagation(); chats = chats.filter((x) => x !== c); if (current === c) current = chats[0] || null; store(chats); render();
    } }, '×'))));
    if (!current || !current.messages.length) {
      log.replaceChildren(el('div', { class: 'aic-empty' }, el('h2', {}, 'How can I help?'),
        el('div', { class: 'aic-ideas' }, ['Explain this page and what I can do here', 'Write PySpark to dedupe a table by key, keeping the latest row',
          'Write SQL for monthly revenue growth by region', 'How do I schedule a notebook to run every night?'].map((t) => el('button', { type: 'button', class: 'aic-idea', onClick: () => send(t) }, t)))));
      return;
    }
    log.replaceChildren(...current.messages.map((m) => {
      const b = el('div', { class: `aic-msg ${m.role}` });
      if (m.role === 'assistant') doraRender(b, m.content || '…', { buttons: [] }); else b.textContent = m.content;
      return b;
    }));
    log.scrollTop = log.scrollHeight;
  }
  async function send(text) {
    text = (text || '').trim();
    if (!text || busy) return;
    if (!current) newChat();
    const withPage = panel.querySelector('.aic-ctx input').checked;
    const history = current.messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
    current.messages.push({ role: 'user', content: text });
    if (current.title === 'New chat') current.title = text.slice(0, 48);
    const ans = { role: 'assistant', content: '' };
    current.messages.push(ans); current.updated = Date.now();
    render();
    const log = panel.querySelector('.aic-log');
    const bubble = log.lastElementChild;
    busy = new AbortController();
    panel.querySelector('.aic-stop').hidden = false;
    try {
      await doraStream({ mode: 'chat', prompt: withPage ? `${text}\n\n(Context: ${pageContext()})` : text, history, context: {} },
        (t) => { ans.content = t; doraRender(bubble, t, { buttons: [] }); log.scrollTop = log.scrollHeight; }, busy.signal);
    } catch (e) {
      if (e.name !== 'AbortError') ans.content = `⚠ ${e.message}. Check Dora in Admin › Settings.`;
      doraRender(bubble, ans.content || '_Stopped._', { buttons: [] });
    }
    busy = null; panel.querySelector('.aic-stop').hidden = true;
    store(chats); render();
  }
  function open() {
    if (!panel) {
      const input = el('textarea', { class: 'aic-input', rows: 1, placeholder: 'Ask anything — data, SQL, PySpark, Airflow, your dashboards…', 'aria-label': 'Message' });
      input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = `${Math.min(200, input.scrollHeight)}px`; });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); const t = input.value; input.value = ''; input.style.height = 'auto'; send(t); } });
      let wide = false;
      try { wide = localStorage.getItem('databridge-chat-wide') === '1'; } catch { /* private mode */ }
      const toggleWide = () => { wide = !wide; panel.classList.toggle('wide', wide); panel.classList.remove('show-hist'); try { localStorage.setItem('databridge-chat-wide', wide ? '1' : '0'); } catch { /* ignore */ } };
      panel = el('div', { class: `aic${wide ? ' wide' : ''}`, role: 'dialog', 'aria-label': 'DataBridge AI', 'aria-modal': 'false' },
        el('aside', { class: 'aic-side', 'aria-label': 'Chat history' },
          el('div', { class: 'aic-side-head' }, el('b', {}, 'Chats'), btn('New', () => { newChat(); panel.classList.remove('show-hist'); }, { cls: 'sm', ic: 'plus' })),
          el('div', { class: 'aic-list' })),
        el('section', { class: 'aic-main' },
          el('header', { class: 'aic-head' },
            el('span', { class: 'aic-logo', 'aria-hidden': 'true' }, icon('spark', 16)),
            el('div', { class: 'grow aic-title' }, el('b', {}, 'DataBridge AI'), el('span', { class: 'aic-sub' }, 'Data, SQL, PySpark, Airflow, dashboards')),
            btn('', () => panel.classList.toggle('show-hist'), { cls: 'ghost icon sm aic-hist-btn', ic: 'history', title: 'Chat history' }),
            btn('', () => { newChat(); setTimeout(() => panel.querySelector('.aic-input').focus(), 0); }, { cls: 'ghost icon sm', ic: 'plus', title: 'New chat' }),
            btn('', toggleWide, { cls: 'ghost icon sm', ic: 'fold', title: 'Wider / narrower' }),
            btn('', () => close(), { cls: 'ghost icon sm', ic: 'x', title: 'Close (Esc)' })),
          el('div', { class: 'aic-log', 'aria-live': 'polite' }),
          el('div', { class: 'aic-compose' },
            el('div', { class: 'aic-box' }, input,
              el('div', { class: 'aic-box-row' },
                el('label', { class: 'switch aic-ctx', title: 'Send the page name, your selected text and the active notebook cell' }, el('input', { type: 'checkbox', checked: true }), 'Use this page'),
                el('span', { class: 'grow' }),
                btn('Stop', () => busy && busy.abort(), { cls: 'sm aic-stop' }),
                btn('Send', () => { const t = input.value; input.value = ''; input.style.height = 'auto'; send(t); }, { cls: 'primary sm' })))),
          el('p', { class: 'aic-foot muted' }, 'Enter to send · Shift+Enter new line · Ctrl+J open/close')));
      panel.querySelector('.aic-stop').hidden = true;
      document.body.append(panel);
      panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    }
    if (!current) current = chats[0] || null;
    panel.classList.add('open'); render();
    setTimeout(() => panel.querySelector('.aic-input').focus(), 50);
  }
  function close() { if (panel) panel.classList.remove('open'); }
  window.DBChat = { open, close, toggle: () => (panel && panel.classList.contains('open') ? close() : open()) };
  document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') { e.preventDefault(); window.DBChat.toggle(); } });
  document.addEventListener('DOMContentLoaded', () => {
    const bar = document.querySelector('.topbar');
    if (bar && !document.getElementById('aic-btn') && !document.documentElement.classList.contains('feat-off-ai_assistant')) {
      const b = el('button', { type: 'button', id: 'aic-btn', class: 'aic-btn', title: 'DataBridge AI (Ctrl+J)', onClick: () => window.DBChat.toggle() }, icon('spark', 16), 'Ask AI');
      const search = bar.querySelector('.search');
      if (search && search.nextSibling) bar.insertBefore(b, search.nextSibling); else bar.append(b);
    }
  });
}());
