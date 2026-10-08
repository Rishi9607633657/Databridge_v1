/* DataBridge Logs centre: server, notebook/Spark kernels, job runs, pipeline runs — live. */
'use strict';

async function viewLogs(main, r) {
  main.classList.add('flush');
  const S = { source: r.params.get('source') || 'server', q: '', level: '', follow: true, timer: null, sources: [] };
  const list = el('nav', { class: 'logs-sources', 'aria-label': 'Log sources' });
  const search = el('input', { class: 'field', type: 'search', placeholder: 'Search this log…', 'aria-label': 'Search log' });
  const level = el('select', { class: 'field', 'aria-label': 'Level' }, el('option', { value: '' }, 'All lines'), el('option', { value: 'warn' }, 'Warnings + errors'), el('option', { value: 'error' }, 'Errors only'));
  const follow = el('input', { type: 'checkbox', checked: true });
  const title = el('h2', { class: 'grow' }, 'Logs');
  const meta = el('span', { class: 'muted small' });
  const view = el('div', { class: 'logs-view', tabindex: '0', 'aria-live': 'off' });
  main.append(el('div', { class: 'logs' },
    el('aside', { class: 'logs-side' }, el('div', { class: 'logs-side-head' }, el('h1', {}, 'Logs'), el('span', { class: 'muted small' }, 'Updates live')), list),
    el('section', { class: 'logs-main' },
      el('div', { class: 'logs-bar' }, title, meta, search, level,
        el('label', { class: 'switch' }, follow, 'Follow'),
        btn('Download', () => {
          const text = [...view.querySelectorAll('.ln')].map((x) => x.textContent).join('\n');
          download(`${S.source.replace(/[^\w.-]+/g, '_')}.log`, text);
        }, { cls: 'sm', ic: 'download' })),
      view)));
  search.addEventListener('input', () => { clearTimeout(S.st); S.st = setTimeout(() => { S.q = search.value.trim(); load(); }, 250); });
  level.addEventListener('change', () => { S.level = level.value; load(); });
  follow.addEventListener('change', () => { S.follow = follow.checked; if (S.follow) view.scrollTop = view.scrollHeight; });
  view.addEventListener('scroll', () => {
    const atEnd = view.scrollHeight - view.scrollTop - view.clientHeight < 30;
    if (!atEnd && S.follow && !S.loading) { S.follow = false; follow.checked = false; }
  });

  async function loadSources() {
    try { S.sources = await api('/api/logs/sources'); } catch (e) { list.replaceChildren(errBox(e)); return; }
    const groups = { server: 'Server', kernel: 'Notebooks & Spark', runs: 'Runs' };
    list.replaceChildren(...Object.entries(groups).map(([kind, label]) => {
      const items = S.sources.filter((x) => x.kind === kind);
      if (!items.length) return null;
      return el('div', { class: 'logs-group' }, el('div', { class: 'logs-group-h' }, label), items.map((x) => el('button', {
        type: 'button', class: 'logs-src', 'aria-current': x.id === S.source ? 'true' : null,
        onClick: () => { S.source = x.id; history.replaceState(null, '', `#/logs?source=${encodeURIComponent(x.id)}`); loadSources(); load(true); },
      }, el('span', { class: `logs-dot ${x.live ? 'live' : ''}` }), el('span', { class: 'logs-src-t' }, el('b', {}, x.name), el('span', { class: 'muted' }, x.detail || '')))));
    }));
  }

  async function load(reset) {
    S.loading = true;
    const src = S.sources.find((x) => x.id === S.source);
    title.textContent = src ? src.name : 'Logs';
    let res;
    try { res = await api(`/api/logs/read?source=${encodeURIComponent(S.source)}&lines=1500&q=${encodeURIComponent(S.q)}&level=${S.level}`); }
    catch (e) { view.replaceChildren(errBox(e)); S.loading = false; return; }
    if (res.kind === 'runs') {
      meta.textContent = `${res.rows.length} recent runs`;
      view.classList.add('runs');
      view.replaceChildren(...(res.rows.length ? res.rows.filter((r2) => !S.q || JSON.stringify(r2).toLowerCase().includes(S.q.toLowerCase()))
        .filter((r2) => !S.level || ['failed', 'error', 'timed_out', 'canceled'].includes(r2.state) || (S.level === 'warn' && r2.steps.some((x) => x.error)))
        .map((r2) => el('details', { class: `logs-run st-${r2.state}`, open: ['failed', 'error', 'timed_out'].includes(r2.state) || null },
          el('summary', {}, el('span', { class: `logs-state st-${r2.state}` }, r2.state), el('b', {}, r2.title),
            el('span', { class: 'muted' }, `${r2.start} · ${r2.duration != null ? `${r2.duration}s` : ''} · ${r2.trigger || ''}`),
            el('a', { href: r2.link, class: 'logs-open' }, 'Open run')),
          r2.message ? el('pre', { class: 'logs-msg' }, r2.message) : null,
          el('ol', { class: 'logs-steps' }, r2.steps.map((st) => el('li', {}, el('span', { class: `logs-state st-${st.state}` }, st.state), el('span', {}, st.name),
            st.detail ? el('span', { class: 'muted' }, st.detail) : null, st.error ? el('pre', { class: 'logs-err' }, st.error) : null)))))
        : [el('p', { class: 'muted logs-empty' }, 'No runs yet.')]));
      S.loading = false;
      return;
    }
    view.classList.remove('runs');
    meta.textContent = `${res.lines.length.toLocaleString('en-IN')} lines${S.q || S.level ? ' (filtered)' : ''}`;
    const frag = document.createDocumentFragment();
    for (const ln of res.lines) {
      const d = document.createElement('div');
      d.className = `ln${ln.l ? ` l-${ln.l}` : ''}`;
      d.textContent = ln.t;
      frag.append(d);
    }
    const keep = !reset && !S.follow ? view.scrollTop : null;
    view.replaceChildren(frag);
    if (!res.lines.length) view.append(el('p', { class: 'muted logs-empty' }, S.q || S.level ? 'No matching lines.' : 'This log is empty so far.'));
    if (S.follow || reset) view.scrollTop = view.scrollHeight; else if (keep != null) view.scrollTop = keep;
    S.loading = false;
  }

  await loadSources();
  if (!S.sources.some((x) => x.id === S.source)) S.source = 'server';
  await load(true);
  S.timer = setInterval(() => { if (!document.hidden) { load(); } }, 3000);
  S.timer2 = setInterval(() => { if (!document.hidden) loadSources(); }, 15000);
  return () => { clearInterval(S.timer); clearInterval(S.timer2); main.classList.remove('flush'); };
}
