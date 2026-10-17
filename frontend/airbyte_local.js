/* Data Hub › Connector catalog: Airbyte's 600+ source connectors, built from GitHub and run by DataBridge itself (no Airbyte server).
   Uses abSpecForm (datahub.js) for the settings form and cxSyncEdit (connectors.js) for syncs. Loaded after connectors.js. */
'use strict';

const AX_RT = { manifest: ['API', 'Runs on the shared connector runner — no per-connector install'], python: ['Python', 'Installed with pip into its own environment'],
  docker: ['Docker', 'Java connector — needs Docker Desktop'] };
let AX_CAT = null;

function axLogo(cid, size = 28, name = '') {
  const letter = el('span', { class: 'ab-logo ab-letter', style: { width: `${size}px`, height: `${size}px`, fontSize: `${Math.round(size * 0.45)}px` } }, (name || cid || '?').slice(0, 1).toUpperCase());
  if (!cid) return letter;
  const img = el('img', { class: 'ab-logo', src: `/api/datahub/airbyte/icons/${encodeURIComponent(cid)}`, alt: '', width: size, height: size, loading: 'lazy' });
  img.addEventListener('error', () => img.replaceWith(letter));
  return img;
}
const axBadge = (rt) => el('span', { class: `ax-rt rt-${rt}`, title: (AX_RT[rt] || [rt, ''])[1] }, (AX_RT[rt] || [rt])[0]);

async function axCatalog(force) {
  if (!AX_CAT || force) AX_CAT = await api('/api/datahub/airbyte/catalog');
  return AX_CAT;
}

/* poll a background job (build / install) until it finishes; draw(job) on every tick */
async function axWait(name, draw) {
  for (;;) {
    let st;
    try { st = await api('/api/datahub/airbyte/status'); } catch { await new Promise((r) => setTimeout(r, 2000)); continue; }
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
  try { st = await api('/api/datahub/airbyte/status'); } catch (e) { body.replaceChildren(errBox(e)); return; }
  const logBox = el('pre', { class: 'log ax-log', hidden: true });
  const build = async (btnEl) => {
    if (btnEl) btnEl.disabled = true;
    try { await api('/api/datahub/airbyte/build', { method: 'POST' }); } catch (e) { if (!/Already/.test(e.message)) { toast(e.message, 'err'); if (btnEl) btnEl.disabled = false; return; } }
    logBox.hidden = false;
    const j = await axWait('build', (job) => { logBox.textContent = (job.log || []).join('\n'); logBox.scrollTop = logBox.scrollHeight; });
    if (j.state === 'done') { toast('Connector catalog ready'); AX_CAT = null; body.replaceChildren(); dhCatalog(body); } else if (btnEl) btnEl.disabled = false;
  };
  if (!st.built) {
    const b = btn('Build connectors from GitHub', () => build(b), { cls: 'primary', ic: 'download', disabled: !st.git || !canEditDH() });
    body.replaceChildren(el('section', { class: 'panel ax-hero' },
      el('div', { class: 'ax-hero-ic' }, icon('hub', 30)),
      el('div', { class: 'grow' },
        el('h2', {}, 'Airbyte’s 600+ connectors — without Airbyte'),
        el('p', { class: 'muted' }, 'DataBridge downloads the connector definitions from ', el('span', { class: 'mono' }, st.repo),
          ' (about 50 MB, definitions only) and runs the connectors itself. No Airbyte server, no abctl, no Kubernetes.'),
        el('ul', { class: 'ax-bul' },
          el('li', {}, el('b', {}, '~500 API connectors'), ' (Stripe, Shopify, HubSpot, Salesforce, Zendesk, Jira, Google Ads, Razorpay…) run on one shared runner — nothing to install per connector.'),
          el('li', {}, el('b', {}, '~70 Python connectors'), ' install themselves with pip the first time you use them.'),
          el('li', {}, el('b', {}, '~20 Java connectors'), ' (mostly databases) need Docker — or use the built-in Postgres / MySQL / SQL Server / Oracle connectors.')),
        !st.git ? el('div', { class: 'dh-warn' }, 'Git is not installed on this machine. Install Git for Windows from git-scm.com, restart DataBridge, then build.') : null,
        el('div', { class: 'row', style: { gap: '10px', marginTop: '10px' } }, b,
          dbFeat('airbyte') ? el('a', { class: 'btn ghost', href: '#/datahub?tab=airbyte-server' }, 'I already run an Airbyte server') : null),
        logBox)));
    if (st.jobs && st.jobs.build && st.jobs.build.state === 'running') build(b);
    return;
  }
  let cat;
  try { cat = await axCatalog(true); } catch (e) { body.replaceChildren(errBox(e)); return; }
  let q = ''; let rt = 'all';
  const grid = el('div', { class: 'ab-grid ax-grid' });
  const count = el('span', { class: 'muted small' });
  const chips = el('div', { class: 'ab-cats' });
  const filters = [['all', 'All'], ['manifest', 'API — no install'], ['python', 'Python'], ['docker', 'Docker'], ['certified', 'Certified'], ['ready', 'Ready to use']];
  const drawChips = () => chips.replaceChildren(...filters.map(([k, l]) => el('button', { type: 'button', class: `ab-cat ${k === rt ? 'on' : ''}`, onClick: () => { rt = k; drawChips(); draw(); } }, l)));
  function draw() {
    const hit = cat.filter((c) => (rt === 'all' || c.runtime === rt || (rt === 'certified' && c.support === 'certified') || (rt === 'ready' && c.ready))
      && (!q || `${c.name} ${c.id}`.toLowerCase().includes(q)));
    count.textContent = `${hit.length} connector${hit.length === 1 ? '' : 's'}`;
    grid.replaceChildren(...hit.slice(0, 240).map((c) => el('button', { type: 'button', class: 'ab-card ax-card', title: `${c.name} · v${c.version}`, onClick: () => axConnectDialog(c.id) },
      axLogo(c.id, 34, c.name), el('span', { class: 'ab-card-name' }, c.name),
      el('span', { class: 'ax-tags' }, axBadge(c.runtime), c.support === 'certified' ? el('span', { class: 'ab-badge' }, 'Certified') : null, c.ready ? el('span', { class: 'ax-ready', title: 'Installed' }, '✓') : null))),
    hit.length > 240 ? el('div', { class: 'muted small ab-more' }, `…and ${hit.length - 240} more — type to narrow down`) : null,
    !hit.length ? el('div', { class: 'muted ab-more' }, 'No connector matches.') : null);
  }
  const search = el('input', { class: 'field', type: 'search', placeholder: `Search ${cat.length} connectors… (stripe, shopify, hubspot, razorpay, zoho, jira)`, 'aria-label': 'Search connectors',
    onInput: (e) => { q = e.target.value.trim().toLowerCase(); draw(); } });
  const upd = btn('Update from GitHub', () => build(upd), { ic: 'refresh', disabled: !canEditDH(), title: 'Pull the latest connector definitions' });
  body.replaceChildren(
    el('div', { class: 'row dh-ab-head' },
      el('div', { class: 'dh-stats' }, el('div', {}, el('b', {}, String(st.connectors)), 'Connectors'),
        el('div', {}, el('b', {}, String(st.counts.manifest)), 'API (no install)'), el('div', {}, el('b', {}, String(st.counts.python)), 'Python'),
        el('div', {}, el('b', {}, String(st.counts.docker)), st.docker ? 'Docker' : 'Docker (not found)')),
      el('span', { class: 'grow' }),
      el('span', { class: 'muted small' }, `Built ${new Date(st.updated * 1000).toLocaleString()}`), upd),
    logBox,
    el('div', { class: 'row', style: { gap: '10px', alignItems: 'center' } }, el('div', { class: 'grow' }, search), count), chips, grid,
    el('p', { class: 'muted small' }, 'Pick a connector, fill in its settings, then create a Sync to load its streams into the Catalog — same schedules, real-time / event triggers, mapping and dedup as every other connection.'));
  drawChips(); draw();
  setTimeout(() => search.focus(), 0);
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
  try { S = await api(`/api/datahub/airbyte/catalog/${encodeURIComponent(cid)}/spec`); } catch (e) { box.replaceChildren(errBox(e)); return; }
  const C = S.connector;
  const head = el('div', { class: 'row' },
    el('h2', { class: 'grow ab-name' }, axLogo(C.id, 30, C.name), conn && conn.id ? `Edit ${conn.name}` : `New ${C.name} connection`),
    axBadge(C.runtime), C.support === 'certified' ? el('span', { class: 'ab-badge' }, 'Certified') : el('span', { class: 'chip' }, C.support),
    S.docs ? el('a', { class: 'btn sm ghost', href: S.docs, target: '_blank', rel: 'noopener' }, icon('ext', 14), 'Docs') : null,
    onClose ? btn('Close', onClose, { cls: 'sm' }) : null);
  if (!S.ready || !S.schema) {
    const logBox = el('pre', { class: 'log ax-log', hidden: true });
    const what = C.runtime === 'manifest' ? 'Install the shared connector runner (one time for all ~500 API connectors, about a minute).'
      : C.runtime === 'python' ? `Install ${C.pypi || `airbyte-source-${C.id}`} ${C.version} with pip into its own environment.`
        : `Download the Docker image ${C.image}.`;
    const go = btn(C.runtime === 'docker' ? 'Pull image' : 'Install', async () => {
      go.disabled = true; logBox.hidden = false;
      try { await api(`/api/datahub/airbyte/catalog/${encodeURIComponent(cid)}/install`, { method: 'POST' }); } catch (e) { toast(e.message, 'err'); go.disabled = false; return; }
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
  const result = el('div');
  const collect = () => ({ type: 'airbyte', name: name.value.trim(), config: { connector: C.id, values: form.get() } });
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
    C.hosts && C.hosts.length ? el('p', { class: 'muted small' }, 'Connects to: ', el('span', { class: 'mono' }, C.hosts.slice(0, 4).join(', '))) : null,
    el('label', { class: 'lbl' }, 'Connection name', name), form.node, result,
    el('div', { class: 'actions' }, onBack ? btn('Back', onBack, { ic: 'back' }) : null, el('span', { class: 'grow' }), testBtn, save));
}

/* inline gallery used inside "New connection" */
function axGalleryInline(pick) {
  const box = el('div', {}, loading('Loading the connector catalog…'));
  axCatalog().then((cat) => {
    box.replaceChildren(abGallery('source', cat.map((c) => ({ ...c, type: c.id, category: c.runtime === 'docker' ? 'database' : 'api' })), false, (c) => pick(c.id),
      (c, size) => axLogo(c.id, size, c.name)));
  }).catch((e) => box.replaceChildren(el('div', {}, errBox(e), el('p', {}, el('a', { href: '#/datahub?tab=catalog' }, 'Open Data Hub › Connector catalog to build it')))));
  return box;
}
