/* DataBridge Markets pack: Indian stocks (NSE), mutual funds (AMFI) and forex — install, run, open the dashboards. */
'use strict';

async function viewMarkets(main) {
  const admin = CURRENT_USER && ['admin', 'super_admin'].includes(CURRENT_USER.role);
  main.append(el('div', { class: 'page-head' }, el('div', { class: 'grow' }, el('h1', {}, 'Markets'),
    el('p', { class: 'muted small', style: { margin: '2px 0 0' } }, 'Indian stocks, mutual funds and forex: official daily data, analysis every night, five ready dashboards.'))));
  const body = el('div', {}, loading());
  main.append(body);
  let st;
  try { st = await api('/api/markets/status'); } catch (e) { body.replaceChildren(errBox(e)); return; }

  const note = el('div', { class: 'mk-note', role: 'note' }, el('b', {}, 'Not investment advice. '),
    'Scores rank stocks and funds on past data so you can screen faster. They are not a recommendation to buy or sell, and past returns do not guarantee future returns. ',
    'Offering stock recommendations to clients in India needs SEBI Research Analyst registration.');

  const install = async (overwrite) => {
    if (overwrite && !confirm('Replace the five Markets dashboards with the original versions? Your edits to them will be lost.')) return;
    try {
      toast('Installing the Markets pack…');
      await api('/api/markets/install', { method: 'POST', body: { overwrite_dashboards: !!overwrite } });
      toast('Markets pack installed');
      render();
    } catch (e) { toast(e.message, 'err'); }
  };
  const runNow = async (job) => {
    try { const r = await api('/api/markets/run', { method: 'POST', body: { job } }); toast('Started'); location.hash = `#/run/${r.id}`; }
    catch (e) { toast(e.message, 'err'); }
  };

  if (!st.installed) {
    body.replaceChildren(note, el('section', { class: 'panel mk-intro' },
      el('h2', {}, 'Install the Markets pack'),
      el('ol', {},
        el('li', {}, el('b', {}, '7 notebooks '), 'in Workspace › Markets: download NSE end-of-day files, AMFI mutual fund NAVs and forex rates; then calculate adjusted prices, indicators, SIP returns and scores.'),
        el('li', {}, el('b', {}, '2 jobs: '), '“Markets — nightly refresh” at 23:40 IST on weekdays, and “Markets — live quotes” from your broker every 5 minutes in market hours (paused until you add your API key).'),
        el('li', {}, el('b', {}, '5 dashboards: '), 'Markets overview, Stock screener, Stock deep dive, Mutual funds & SIP, and Forex.')),
      el('h3', {}, 'Where the data comes from'),
      el('ul', {},
        el('li', {}, 'NSE: the public end-of-day files (every security, every index) and the NIFTY 500 list. Fine for your own analysis; to sell NSE data on to customers you need a data licence from NSE.'),
        el('li', {}, 'AMFI: daily NAVs of every mutual fund scheme.'),
        el('li', {}, 'Forex: European Central Bank reference rates via the free Frankfurter API.'),
        el('li', {}, 'Live quotes: your own Zerodha Kite, Upstox or Dhan API key (Admin › Settings › Markets), for your own use under the broker’s terms.')),
      el('p', { class: 'muted small' }, 'The first run loads 3 years of history (change it in Admin › Settings › Markets). Downloads are paced one file per second, so the first run takes about an hour; after that each night takes a few minutes.'),
      admin ? btn('Install Markets pack', () => install(false), { cls: 'primary', ic: 'download' }) : el('p', { class: 'muted' }, 'Ask an admin to install the Markets pack.')));
    return;
  }

  const D = st.dashboards || {};
  const dashCard = (key, desc) => D[key] ? el('a', { class: 'mk-card', href: `#/dashboard/${D[key].id}` }, el('b', {}, D[key].name), el('span', {}, desc)) : null;
  const job = (kind, label) => {
    const j = (st.jobs || {})[kind];
    if (!j) return null;
    const last = j.last_run;
    return el('div', { class: 'mk-job' },
      el('div', { class: 'grow' }, el('a', { href: `#/job/${j.id}` }, el('b', {}, j.name)),
        el('div', { class: 'muted small' }, `${cronText(j.schedule)}${j.paused ? ' · paused' : ''}`)),
      el('div', {}, last ? stateEl(last.state) : el('span', { class: 'muted small' }, 'Not run yet'),
        last ? el('div', { class: 'muted small' }, ago(last.start)) : null),
      btn(label, () => runNow(kind), { cls: 'sm', ic: 'play' }));
  };
  body.replaceChildren(note,
    el('div', { class: 'mk-cards' },
      dashCard('overview', 'Indices, breadth, sectors and the highest scores'),
      dashCard('screener', 'Every stock with its scores; filter by industry and band'),
      dashCard('deep', 'One stock: adjusted price, averages, RSI, volume'),
      dashCard('funds', 'SIP XIRR, CAGR and risk, ranked within each category'),
      dashCard('fx', 'Rupee against USD, EUR, GBP and JPY')),
    el('section', { class: 'panel', style: { marginTop: '18px' } },
      el('div', { class: 'panel-head' }, el('h3', { class: 'grow' }, 'Jobs')),
      el('div', { class: 'mk-jobs' }, job('nightly', 'Run now'), job('live', 'Fetch quotes now'))),
    el('section', { class: 'panel', style: { marginTop: '18px' } },
      el('div', { class: 'panel-head' }, el('h3', { class: 'grow' }, 'Notebooks'), el('span', { class: 'muted small' }, 'Workspace › Markets')),
      el('ul', { class: 'mk-nbs' }, ...(st.notebooks || []).map((p) => el('li', {}, el('a', { href: `#/notebook?path=${encodeURIComponent(p)}` }, p.split('/').pop().replace(/\.ipynb$/, '')))))),
    admin ? el('div', { class: 'row', style: { marginTop: '18px', gap: '10px' } },
      btn('Update notebooks and jobs', () => install(false), { ic: 'refresh' }),
      btn('Reset dashboards', () => install(true), { ic: 'chart' }),
      el('a', { class: 'btn', href: '#/admin?tab=settings' }, icon('gear', 16), 'Markets settings')) : null);
}
