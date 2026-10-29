/* DataBridge Ask data: plain-English questions → SQL → table / chart, with the SQL always shown. */
'use strict';

const ASK = { history: [] };

function askChart(res) {
  const c = res.chart || {};
  const cols = res.columns || [];
  if (!res.rows.length) return null;
  if (c.type === 'number' || (cols.length === 1 && res.rows.length === 1)) {
    const v = res.rows[0][cols.indexOf(c.y) >= 0 ? cols.indexOf(c.y) : 0];
    return el('div', { class: 'ask-big' }, typeof v === 'number' ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : String(v ?? '—'),
      el('span', {}, (c.y || cols[0] || '').replace(/_/g, ' ')));
  }
  if (!['bar', 'line', 'pie'].includes(c.type) || typeof Chart === 'undefined') return null;
  const xi = cols.indexOf(c.x), yi = cols.indexOf(c.y);
  if (xi < 0 || yi < 0 || res.rows.length > 200) return null;
  const canvas = el('canvas', { role: 'img', 'aria-label': `${c.type} chart of ${c.y} by ${c.x}` });
  const css = getComputedStyle(document.documentElement);
  const accent = css.getPropertyValue('--lagoon').trim() || '#0A5CFF';
  const grid = css.getPropertyValue('--line-soft').trim() || '#EDF0F6';
  const text = css.getPropertyValue('--muted').trim() || '#56607A';
  const palette = [accent, '#12CFF5', '#D4A22A', '#1F9D6B', '#A5673F', '#8F99A8', '#6E56CF', '#D64545'];
  const labels = res.rows.map((r) => String(r[xi]).slice(0, 40));
  const data = res.rows.map((r) => Number(r[yi]) || 0);
  setTimeout(() => new Chart(canvas, {
    type: c.type, data: { labels, datasets: [{ label: c.y.replace(/_/g, ' '), data, borderColor: accent, tension: 0.25, pointRadius: res.rows.length > 40 ? 0 : 3,
      backgroundColor: c.type === 'pie' ? palette : c.type === 'line' ? 'transparent' : accent, borderWidth: c.type === 'pie' ? 1 : 2, borderRadius: c.type === 'bar' ? 4 : 0 }] },
    options: { responsive: true, maintainAspectRatio: false, animation: false,
      plugins: { legend: { display: c.type === 'pie', position: 'right', labels: { color: text } } },
      scales: c.type === 'pie' ? {} : { x: { grid: { display: false }, ticks: { color: text, maxRotation: 0, autoSkip: true } },
        y: { grid: { color: grid }, ticks: { color: text, callback: (v) => Number(v).toLocaleString(undefined, { notation: 'compact' }) } } } },
  }), 0);
  return el('div', { class: 'ask-chart' }, canvas);
}

function askAnswer(res) {
  const sqlBox = res.sql ? el('details', { class: 'ask-sql', open: !!res.error },
    el('summary', {}, 'SQL', res.fixed ? el('span', { class: 'muted small' }, ' · corrected after the first try') : null),
    el('pre', { class: 'code' }, res.sql),
    el('div', { class: 'row' },
      btn('Copy', () => navigator.clipboard.writeText(res.sql).then(() => toast('Copied')), { cls: 'sm', ic: 'copy' }),
      btn('Open in SQL editor', () => openInSql(res.sql), { cls: 'sm', ic: 'term' }),
      CURRENT_USER && CURRENT_USER.role !== 'viewer' ? btn('Create alert', () => { sessionStorage.setItem('databridge.alertPrefill', res.sql); location.hash = '#/alert/new'; }, { cls: 'sm', ic: 'bell' }) : null)) : null;
  const table = res.rows && res.rows.length ? el('details', { class: 'ask-rows', open: !['bar', 'line', 'pie', 'number'].includes((res.chart || {}).type) },
    el('summary', {}, `${res.rows.length.toLocaleString()} row${res.rows.length === 1 ? '' : 's'}${res.truncated ? ' (first 1,000)' : ''}`),
    grid({ columns: res.columns, rows: res.rows.slice(0, 200) }),
    btn('Download CSV', () => download('answer.csv', toCsv(res)), { cls: 'sm', ic: 'download' })) : null;
  return el('div', { class: 'ask-a' },
    res.answer ? el('p', { class: 'ask-say' }, res.answer) : null,
    res.error ? el('div', { class: 'error-box' }, `The query didn’t run: ${res.error}`) : null,
    !res.error && res.sql && !res.rows.length ? el('p', { class: 'muted' }, 'The query ran but returned no rows.') : null,
    askChart(res), table, sqlBox,
    el('div', { class: 'muted small' }, [`${res.elapsed}s`, res.tables && res.tables.length ? `from ${res.tables.join(', ')}` : null].filter(Boolean).join(' · ')));
}

async function viewAsk(main) {
  main.append(el('div', { class: 'page-head' }, el('div', { class: 'grow' }, el('h1', {}, 'Ask data'),
    el('p', { class: 'muted small', style: { margin: '2px 0 0' } }, 'Ask in plain English. DataBridge writes the SQL, runs it with your data permissions, and shows the query so you can check it.')),
  btn('New conversation', () => { ASK.history = []; render(); }, { ic: 'refresh' })));
  const thread = el('div', { class: 'ask-thread', 'aria-live': 'polite' });
  const input = el('textarea', { class: 'field ask-in', rows: 2, placeholder: 'e.g. Which 10 customers spent the most last month?', 'aria-label': 'Your question' });
  const send = btn('Ask', () => go(), { cls: 'primary', ic: 'play' });
  const chips = el('div', { class: 'ask-chips' });
  main.append(el('div', { class: 'ask-wrap' }, thread, el('div', { class: 'ask-box' }, chips, el('div', { class: 'row' }, input, send))));
  const draw = () => {
    setKids(thread, ASK.history.length ? ASK.history.map((h) => el('div', { class: 'ask-turn' }, el('div', { class: 'ask-q' }, h.question),
      h.pending ? el('div', { class: 'ask-a' }, loading('Writing the query…')) : askAnswer(h)))
      : el('div', { class: 'empty ask-empty' }, icon('chat', 32), el('h2', {}, 'What do you want to know?'),
        el('p', {}, 'Questions are answered from tables in the Catalog that you can read. Table and column comments help the answers.')));
    thread.lastElementChild && thread.lastElementChild.scrollIntoView({ block: 'end', behavior: 'smooth' });
  };
  async function go(q) {
    const question = (q || input.value).trim();
    if (!question) return;
    input.value = '';
    const turn = { question, pending: true };
    ASK.history.push(turn);
    draw();
    send.disabled = true;
    try {
      const prior = ASK.history.filter((h) => h !== turn && h.sql).map((h) => ({ question: h.question, sql: h.sql }));
      Object.assign(turn, await api('/api/ask', { method: 'POST', body: { question, history: prior } }), { pending: false });
    } catch (e) { Object.assign(turn, { pending: false, error: e.message, rows: [], columns: [], elapsed: 0 }); }
    send.disabled = false;
    draw();
    input.focus();
  }
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); go(); } });
  draw();
  setTimeout(() => input.focus(), 0);
  api('/api/ask/suggestions').then((s) => setKids(chips, (s.suggestions || []).map((x) => el('button', { type: 'button', class: 'ask-chip', onClick: () => go(x) }, x)))).catch(() => {});
}

window.EXTRA_ROUTES = Object.assign(window.EXTRA_ROUTES || {}, { ask: viewAsk });
