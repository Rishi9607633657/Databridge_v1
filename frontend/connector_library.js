/* Data Hub › Connectors: the connector library (600+ open-source connector definitions) installed and run by DataBridge itself.
   Uses abSpecForm (datahub.js) for the settings form and cxSyncEdit (connectors.js) for syncs. Loaded after connectors.js. */
'use strict';

const AX_RT = { manifest: ['App', 'Runs on the shared connector runtime — nothing to install'], python: ['Advanced', 'Installs itself the first time you use it'],
  docker: ['Docker', 'Runs in Docker Desktop'] };
let AX_CAT = null;

function axLogo(cid, size = 28, name = '') {
  const letter = el('span', { class: 'ab-logo ab-letter', style: { width: `${size}px`, height: `${size}px`, fontSize: `${Math.round(size * 0.45)}px` } }, (name || cid || '?').slice(0, 1).toUpperCase());
  if (!cid) return letter;
  const img = el('img', { class: 'ab-logo', src: `/api/datahub/library/icons/${encodeURIComponent(cid)}`, alt: '', width: size, height: size, loading: 'lazy' });
  img.addEventListener('error', () => img.replaceWith(letter));
  return img;
}
const axBadge = (rt) => el('span', { class: `ax-rt rt-${rt}`, title: (AX_RT[rt] || [rt, ''])[1] }, (AX_RT[rt] || [rt])[0]);

async function axCatalog(force) {
  if (!AX_CAT || force) AX_CAT = await api('/api/datahub/library/catalog');
  return AX_CAT;
}

/* poll a background job (build / install) until it finishes; draw(job) on every tick */
async function axWait(name, draw) {
  for (;;) {
    let st;
    try { st = await api('/api/datahub/library/status'); } catch { await new Promise((r) => setTimeout(r, 2000)); continue; }
    const j = (st.jobs || {})[name] || { state: 'idle', log: [] };
    draw(j, st);
    if (j.state !== 'running') return j;
    await new Promise((r) => setTimeout(r, 1500));
  }
}

/* ---------------- tab: Connector catalog ---------------- */
async function dhCatalog(body) {
  body.append(loading());
  let st;
  try { st = await api('/api/datahub/library/status'); } catch (e) { body.replaceChildren(errBox(e)); return; }
  const logBox = el('pre', { class: 'log ax-log', hidden: true });
  const build = async (btnEl) => {
    if (btnEl) btnEl.disabled = true;
    try { await api('/api/datahub/library/build', { method: 'POST' }); } catch (e) { if (!/Already/.test(e.message)) { toast(e.message, 'err'); if (btnEl) btnEl.disabled = false; return; } }
    logBox.hidden = false;
    const j = await axWait('build', (job) => { logBox.textContent = (job.log || []).join('\n'); logBox.scrollTop = logBox.scrollHeight; });
    if (j.state === 'done') { toast('Connector library ready'); AX_CAT = null; body.replaceChildren(); dhCatalog(body); } else if (btnEl) btnEl.disabled = false;
  };
  let banner = null;
  if (!st.built) {
    // built-in connectors (Toast, Clover, R365, Revel…) work right away; the 580+ library is an optional one-time download
    const b = btn('Install connector library', () => build(b), { cls: 'primary', ic: 'download', disabled: !st.git || !canEditDH() });
    banner = el('section', { class: 'panel ax-hero ax-hero-sm' },
      el('div', { class: 'ax-hero-ic' }, icon('hub', 26)),
      el('div', { class: 'grow' },
        el('h3', { style: { margin: '0 0 4px' } }, `Add 580+ more sources to ${st.brand}`),
        el('p', { class: 'muted small', style: { margin: 0 } }, 'Built-in POS connectors below work now. Install the connector library once (about 50 MB) for Stripe, Shopify, Square, HubSpot, Salesforce, Zendesk, Jira, Google Ads… — they run inside DataBridge, nothing else to host.'),
        !st.git ? el('div', { class: 'dh-warn' }, 'Git is required to download the library. Install Git for Windows from git-scm.com, restart DataBridge, then install.') : null,
        logBox),
      b);
    if (st.jobs && st.jobs.build && st.jobs.build.state === 'running') build(b);
  }
  let cat, conns = [];
  try { [cat, conns] = await Promise.all([axCatalog(true), api('/api/datahub/connections').catch(() => [])]); } catch (e) { body.replaceChildren(errBox(e)); return; }
  const used = {};
  conns.filter((c) => c.type === 'airbyte' && c.airbyte).forEach((c) => { used[c.airbyte.id] = (used[c.airbyte.id] || 0) + 1; });
  const F = { q: '', cat: 'all', type: 'all', certified: false, ready: false, sort: 'popular' };
  try { Object.assign(F, JSON.parse(sessionStorage.getItem('ax-filters') || '{}'), { q: '' }); } catch { /* ignore */ }
  const keep = () => { try { sessionStorage.setItem('ax-filters', JSON.stringify({ ...F, q: '' })); } catch { /* ignore */ } };
  const cats = [...new Set(cat.map((c) => c.category))].sort((x, y) => (x === 'Other apps') - (y === 'Other apps') || x.localeCompare(y));
  const nav = el('nav', { class: 'ax-nav', 'aria-label': 'Connector categories' });
  const grid = el('div', { class: 'ax-grid' });
  const popular = el('section', { class: 'ax-popular' });
  const count = el('span', { class: 'muted small' });
  const status = (c) => (used[c.id] ? el('span', { class: 'ax-st on', title: `${used[c.id]} connection(s) use it` }, `Connected${used[c.id] > 1 ? ` · ${used[c.id]}` : ''}`)
    : c.ready ? el('span', { class: 'ax-st ready', title: 'Installed — ready to connect' }, 'Ready')
      : el('span', { class: 'ax-st', title: 'Installs itself the first time (about a minute)' }, 'Install on first use'));
  const card = (c, big) => el('button', { type: 'button', class: `ax-card2${big ? ' big' : ''}${used[c.id] ? ' used' : ''}`, title: `${c.name} · v${c.version}`, onClick: () => axConnectDialog(c.id) },
    axLogo(c.id, big ? 40 : 34, c.name),
    el('span', { class: 'ax-c-main' },
      el('span', { class: 'ax-c-name' }, c.name, c.builtin ? el('span', { class: 'ax-bi', title: `Built into ${st.brand} — no library needed${c.stage === 'beta' ? ' (beta)' : ''}` }, c.stage === 'beta' ? 'Built-in · beta' : 'Built-in')
        : c.support === 'certified' ? el('span', { class: 'ax-cert', title: 'Certified connector', 'aria-label': 'Certified' }, '✓') : null),
      el('span', { class: 'ax-c-meta' }, c.category, ' · ', (AX_RT[c.runtime] || [c.runtime])[0]),
      status(c)));
  const match = (c) => (F.cat === 'all' || (F.cat === 'connected' ? used[c.id] : F.cat === 'popular' ? c.popular != null : F.cat === 'builtin' ? c.builtin : c.category === F.cat))
    && (F.type === 'all' || c.runtime === F.type) && (!F.certified || c.support === 'certified') && (!F.ready || c.ready || used[c.id])
    && (!F.q || `${c.name} ${c.id} ${c.category}`.toLowerCase().includes(F.q));
  const sorter = { popular: (x, y) => ((x.popular ?? 999) - (y.popular ?? 999)) || ((y.support === 'certified') - (x.support === 'certified')) || x.name.localeCompare(y.name),
    az: (x, y) => x.name.localeCompare(y.name), connected: (x, y) => ((used[y.id] || 0) - (used[x.id] || 0)) || x.name.localeCompare(y.name) };
  const toTop = () => { const lay = nav.parentElement; if (lay && lay.getBoundingClientRect().top < 60) lay.scrollIntoView({ block: 'start' }); };
  function drawNav() {
    const n = (k) => cat.filter((c) => (k === 'connected' ? used[c.id] : k === 'popular' ? c.popular != null : k === 'builtin' ? c.builtin : c.category === k)).length;
    const item = (k, label, ic, cnt) => el('button', { type: 'button', class: 'ax-nav-item', 'aria-current': F.cat === k ? 'true' : null, onClick: () => { F.cat = k; keep(); drawNav(); draw(); toTop(); } },
      ic ? el('span', { class: 'ax-nav-ic', 'aria-hidden': 'true' }, ic) : null, el('span', { class: 'grow' }, label), el('span', { class: 'ax-nav-n' }, String(cnt)));
    nav.replaceChildren(...[
      el('div', { class: 'ax-nav-h' }, 'Browse'),
      item('all', 'All connectors', '◎', cat.length), n('builtin') ? item('builtin', 'Built-in POS', '◆', n('builtin')) : null, item('popular', 'Popular', '★', n('popular')),
      Object.keys(used).length ? item('connected', 'Connected', '●', n('connected')) : null,
      el('div', { class: 'ax-nav-h' }, 'Categories'),
      ...cats.map((k) => item(k, k, null, n(k)))].filter(Boolean));
  }
  function draw() {
    let hit = cat.filter(match).sort(sorter[F.sort]);
    count.textContent = `${hit.length} of ${cat.length}`;
    const showPopular = F.cat === 'all' && !F.q && F.type === 'all' && !F.certified && !F.ready;
    popular.hidden = !showPopular;
    if (showPopular) {
      const top = cat.filter((c) => c.popular != null).sort(sorter.popular).slice(0, 8);
      const shown = new Set(top.map((c) => c.id));
      hit = hit.filter((c) => !shown.has(c.id));
      popular.replaceChildren(el('div', { class: 'ax-sec-h' }, el('h3', {}, 'Popular'), el('span', { class: 'muted small' }, 'Most-used sources for business analytics')),
        el('div', { class: 'ax-pop-grid' }, top.map((c) => card(c, true))));
    }
    grid.replaceChildren(
      ...(hit.length ? [el('div', { class: 'ax-sec-h' }, el('h3', {}, F.q ? `Results for “${F.q}”` : F.cat === 'all' ? (showPopular ? 'More connectors' : 'All connectors') : F.cat === 'popular' ? 'Popular' : F.cat === 'connected' ? 'Connected' : F.cat === 'builtin' ? 'Built-in POS connectors' : F.cat), count)] : []),
      el('div', { class: 'ax-cards' }, hit.slice(0, 300).map((c) => card(c)),
        hit.length > 300 ? el('div', { class: 'muted small ax-more' }, `…and ${hit.length - 300} more — search or pick a category`) : null,
        el('button', { type: 'button', class: 'ax-card2 ax-custom', onClick: () => (typeof cxEdit === 'function' ? cxEdit({ type: 'rest' }, () => { location.hash = '#/datahub?tab=connections'; }) : null) },
          el('span', { class: 'ax-custom-ic', 'aria-hidden': 'true' }, '+'),
          el('span', { class: 'ax-c-main' }, el('span', { class: 'ax-c-name' }, hit.length ? 'Don’t see your source?' : F.q ? `No connector matches “${F.q}”` : 'No connector matches these filters'),
            el('span', { class: 'ax-c-meta' }, 'Connect any REST API — URL, auth, pagination, nested JSON'), el('span', { class: 'ax-st ready' }, 'Custom API connection')))));
  }
  const search = el('input', { class: 'field ax-search', type: 'search', placeholder: 'Search connectors — stripe, shopify, square, zoho, jira…', 'aria-label': 'Search connectors',
    onInput: (e) => { F.q = e.target.value.trim().toLowerCase(); draw(); } });
  const typeSel = el('select', { class: 'field ax-sel', 'aria-label': 'Connector type' },
    [['all', 'All types'], ['manifest', 'Apps (no install)'], ['python', 'Advanced'], ['docker', 'Docker']].map(([k, l]) => el('option', { value: k, selected: F.type === k }, l)));
  typeSel.addEventListener('change', () => { F.type = typeSel.value; keep(); draw(); });
  const sortSel = el('select', { class: 'field ax-sel', 'aria-label': 'Sort' },
    [['popular', 'Sort: Popular'], ['az', 'Sort: A–Z'], ['connected', 'Sort: Connected first']].map(([k, l]) => el('option', { value: k, selected: F.sort === k }, l)));
  sortSel.addEventListener('change', () => { F.sort = sortSel.value; keep(); draw(); });
  const toggle = (k, label) => el('label', { class: 'switch ax-tg' }, el('input', { type: 'checkbox', checked: F[k], onChange: (e) => { F[k] = e.target.checked; keep(); draw(); } }), label);
  const upd = btn('Update library', () => build(upd), { cls: 'sm', ic: 'refresh', disabled: !canEditDH(), title: 'Get the latest connector versions' });
  body.replaceChildren(...[
    el('div', { class: 'ax-head' },
      el('div', { class: 'ax-kpis' },
        el('div', {}, el('b', {}, String(cat.length)), el('span', {}, 'connectors')),
        el('div', {}, el('b', {}, String(cat.filter((c) => c.builtin).length)), el('span', {}, 'built-in POS')),
        el('div', {}, el('b', {}, String(Object.keys(used).length)), el('span', {}, 'in use')),
        el('div', {}, el('b', {}, String(cat.filter((c) => c.ready).length)), el('span', {}, 'ready'))),
      el('span', { class: 'grow' }),
      st.built ? el('span', { class: 'muted small' }, `Library updated ${new Date(st.updated * 1000).toLocaleDateString()}`) : null, st.built ? upd : null),
    banner, st.built ? logBox : null,
    el('div', { class: 'ax-layout' }, nav,
      el('div', { class: 'ax-main' },
        el('div', { class: 'ax-toolbar' }, search, typeSel, sortSel, toggle('certified', 'Certified'), toggle('ready', 'Ready only')),
        popular, grid,
        el('p', { class: 'muted small ax-foot' }, 'Pick a connector, fill in its settings, then choose the streams to sync into the Catalog — with schedules, real-time and event triggers, mapping and dedup. ',
          el('a', { href: '#', onClick: (e) => { e.preventDefault(); axNotices(); } }, 'Licences & third-party notices'))))].filter(Boolean));
  drawNav(); draw();
  setTimeout(() => search.focus({ preventScroll: true }), 0);
}

/* ---------------- connector settings form (create / edit a DataBridge connection) ---------------- */
function axConnectDialog(cid, conn) {
  return openDialog((close) => {
    const box = el('div', { class: 'dlg ab-dlg' });
    axForm(box, cid, conn, (saved) => close(saved), null, () => close(null));
    return box;
  }, { wide: true }).then((saved) => {
    if (!saved) return;
    toast('Connection saved');
    if (canEditDH() && typeof cxSyncEdit === 'function') cxSyncEdit(null, () => { location.hash = '#/datahub?tab=syncs'; }, saved.id);
  });
}

async function axForm(box, cid, conn, onSaved, onBack, onClose) {
  box.replaceChildren(loading('Reading the connector’s settings…'));
  let S;
  try { S = await api(`/api/datahub/library/catalog/${encodeURIComponent(cid)}/spec`); } catch (e) { box.replaceChildren(errBox(e)); return; }
  const C = S.connector;
  const head = el('div', { class: 'row' },
    el('h2', { class: 'grow ab-name' }, axLogo(C.id, 30, C.name), conn && conn.id ? `Edit ${conn.name}` : `New ${C.name} connection`),
    C.builtin ? el('span', { class: 'ax-bi' }, C.stage === 'beta' ? 'Built-in · beta' : 'Built-in') : axBadge(C.runtime),
    C.builtin ? null : C.support === 'certified' ? el('span', { class: 'ab-badge' }, 'Certified') : el('span', { class: 'chip' }, C.support),
    C.builtin ? null : el('span', { class: 'chip', title: 'Connector licence' }, C.license || 'ELv2'),
    S.docs ? el('a', { class: 'btn sm ghost', href: S.docs, target: '_blank', rel: 'noopener' }, icon('ext', 14), 'Docs') : null,
    onClose ? btn('Close', onClose, { cls: 'sm' }) : null);
  if (!S.ready || !S.schema) {
    const logBox = el('pre', { class: 'log ax-log', hidden: true });
    const what = C.runtime === 'manifest' ? 'Install the connector runtime (one time for all ~500 app connectors, about a minute).'
      : C.runtime === 'python' ? `Install ${C.name} ${C.version} (one time, about a minute).`
        : `Download ${C.name} for Docker (one time).`;
    const go = btn(C.runtime === 'docker' ? 'Pull image' : 'Install', async () => {
      go.disabled = true; logBox.hidden = false;
      try { await api(`/api/datahub/library/catalog/${encodeURIComponent(cid)}/install`, { method: 'POST' }); } catch (e) { toast(e.message, 'err'); go.disabled = false; return; }
      const j = await axWait(`install:${cid}`, (job) => { logBox.textContent = (job.log || []).join('\n'); logBox.scrollTop = logBox.scrollHeight; });
      if (j.state === 'done') { AX_CAT = null; axForm(box, cid, conn, onSaved, onBack, onClose); } else go.disabled = false;
    }, { cls: 'primary', ic: 'download', disabled: !canEditDH() });
    if (C.runtime === 'manifest' && S.schema) {
      // the form can be shown already; only running needs the runner
    } else {
      box.replaceChildren(head, el('section', { class: 'panel ax-prep' }, el('h3', {}, 'One-time setup'), el('p', { class: 'muted' }, what), go, logBox),
        onBack ? el('div', { class: 'actions' }, btn('Back', onBack, { ic: 'back' })) : null);
      return;
    }
    box.replaceChildren(head, el('div', { class: 'dh-warn small ax-prep-inline' }, what, ' ', go), logBox);
  } else box.replaceChildren(head);
  const name = el('input', { class: 'field', value: (conn && conn.name) || C.name, 'aria-label': 'Connection name' });
  const form = abSpecForm(S.schema, conn && conn.config ? conn.config.values : undefined);
  const tp = typeof tnPicker === 'function' ? tnPicker(conn, true) : null;
  const result = el('div');
  const collect = () => ({ type: 'airbyte', name: name.value.trim(), config: { connector: C.id, values: form.get() }, ...(tp ? tp.get() : {}) });
  const testBtn = btn('Test connection', async () => {
    let body;
    try { body = collect(); } catch (e) { result.replaceChildren(errBox(e)); return; }
    testBtn.disabled = true; result.replaceChildren(loading(`Running ${C.name} check…`));
    try { const r = await api('/api/datahub/connections/test', { method: 'POST', body: { ...body, id: conn && conn.id } }); result.replaceChildren(el('div', { class: 'cx-ok' }, `✓ ${r.message} · ${r.ms} ms`)); }
    catch (x) { result.replaceChildren(errBox(x)); }
    testBtn.disabled = false;
  }, { ic: 'check' });
  const save = btn(conn && conn.id ? 'Save' : 'Save & choose streams', async () => {
    let body;
    try { body = collect(); } catch (e) { result.replaceChildren(errBox(e)); return; }
    save.disabled = true;
    try { onSaved(await api(conn && conn.id ? `/api/datahub/connections/${conn.id}` : '/api/datahub/connections', { method: conn && conn.id ? 'PUT' : 'POST', body })); }
    catch (x) { result.replaceChildren(errBox(x)); save.disabled = false; }
  }, { cls: 'primary', ic: 'save', disabled: !canEditDH() });
  box.append(
    C.description ? el('p', { class: 'small', style: { margin: '0 0 6px' } }, C.description) : null,
    C.hosts && C.hosts.length ? el('p', { class: 'muted small' }, 'Connects to: ', el('span', { class: 'mono' }, C.hosts.slice(0, 4).join(', ')),
      C.location ? ` · every row gets location_id (${C.location}) for mapping rows to a tenant’s business` : '') : null,
    el('label', { class: 'lbl' }, 'Connection name', name), form.node, tp ? tp.node : null, result,
    el('div', { class: 'actions' }, onBack ? btn('Back', onBack, { ic: 'back' }) : null, el('span', { class: 'grow' }), testBtn, save));
}

/* inline gallery used inside "New connection" */
function axGalleryInline(pick) {
  const box = el('div', {}, loading('Loading the connector catalog…'));
  axCatalog().then((cat) => {
    box.replaceChildren(abGallery('source', cat.map((c) => ({ ...c, type: c.id, category: c.runtime === 'docker' ? 'database' : 'api' })), false, (c) => pick(c.id),
      (c, size) => axLogo(c.id, size, c.name)));
  }).catch((e) => box.replaceChildren(el('div', {}, errBox(e), el('p', {}, el('a', { href: '#/datahub?tab=catalog' }, 'Open Data Hub › Connectors to install the library')))));
  return box;
}


function axNotices() {
  return openDialog((close) => {
    const box = el('div', { class: 'dlg' }, el('div', { class: 'row' }, el('h2', { class: 'grow' }, 'Licences & third-party notices'), btn('Close', () => close(null), { cls: 'sm' })), loading());
    api('/api/datahub/library/notices').then((n) => {
      box.lastChild.replaceWith(el('div', {}, el('pre', { class: 'log', style: { whiteSpace: 'pre-wrap' } }, n.text),
        el('p', { class: 'small' }, 'Connectors in the library by licence: ', Object.entries(n.licenses).map(([k, v]) => `${k}: ${v}`).join(' · '),
          `. Enabled on this installation: ${n.allowed.join(', ')} (Admin › Settings › Connectors).`)));
    }).catch((e) => box.lastChild.replaceWith(errBox(e)));
    return box;
  }, { wide: true });
}
