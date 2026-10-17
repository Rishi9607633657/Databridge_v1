/* DataBridge Admin — System health + Settings. Loaded before app.js. */
'use strict';

const ADM_ICON = { ok: ['✓', 'var(--ok)'], warn: ['!', '#BF8700'], fail: ['✗', 'var(--fail)'], skip: ['–', 'var(--wait)'] };

async function viewAdmin(main, r) {
  const tab = r.params.get('tab') || 'health';
  main.append(el('div', { class: 'page-head', style: { marginBottom: '4px' } }, el('h1', { class: 'grow' }, 'Admin')),
    el('div', { class: 'tabs', role: 'tablist', style: { marginTop: 0 } }, [['health', 'System health'], ['settings', 'Settings'], ['users', 'Users'], ['audit', 'Audit log'], ...(isSuper() ? [['features', 'Features']] : [])].map(([k, l]) =>
      el('button', { type: 'button', role: 'tab', 'aria-selected': String(tab === k), onClick: () => (location.hash = `#/admin?tab=${k}`) }, l))));
  const body = el('div');
  main.append(body);
  if (tab === 'features') return adminFeaturesTab(body);
  if (tab === 'users') return authUsersTab(body);
  if (tab === 'audit') return authAuditTab(body);
  return tab === 'settings' ? admSettings(body) : admHealth(body);
}

async function admHealth(main) {
  const summary = el('div', { class: 'adm-summary' });
  const list = el('div', { class: 'stack', style: { gap: '16px' } }, loading('Checking your setup…'));
  const deepBtn = btn('Deep check (runs a Spark query)', () => run(true), { ic: 'play' });
  main.append(el('div', { class: 'row', style: { marginBottom: '14px' } }, summary, el('span', { class: 'grow' }),
    btn('Re-run checks', () => run(false), { ic: 'refresh' }), deepBtn), list);
  async function run(deep) {
    list.replaceChildren(loading(deep ? 'Starting Spark and querying the catalog (up to a minute)…' : 'Checking your setup…'));
    deepBtn.disabled = true;
    let res;
    try { res = await api(`/api/admin/health?deep=${deep ? 'true' : 'false'}`); } catch (e) { list.replaceChildren(errBox(e)); deepBtn.disabled = false; return; }
    deepBtn.disabled = false;
    const s = res.summary;
    setKids(summary, s.fail ? el('span', { class: 'adm-pill fail' }, `${s.fail} problem${s.fail === 1 ? '' : 's'}`) : el('span', { class: 'adm-pill ok' }, 'All critical checks pass'),
      s.warn ? el('span', { class: 'adm-pill warn' }, `${s.warn} warning${s.warn === 1 ? '' : 's'}`) : null,
      el('span', { class: 'muted', style: { fontSize: '12px' } }, `checked ${new Date(res.time * 1000).toLocaleTimeString()}`));
    const groups = {};
    res.checks.forEach((c) => { (groups[c.group] = groups[c.group] || []).push(c); });
    const order = { fail: 0, warn: 1, ok: 2, skip: 3 };
    list.replaceChildren(...Object.entries(groups).map(([g, cs]) => el('section', { class: 'panel' },
      el('div', { class: 'panel-head' }, el('h2', { class: 'grow' }, g),
        el('span', { class: 'muted', style: { fontSize: '12px' } }, cs.every((c) => c.status === 'ok' || c.status === 'skip') ? 'all good' : '')),
      el('div', {}, cs.sort((a, b) => order[a.status] - order[b.status]).map((c) => el('div', { class: `adm-check st-${c.status}` },
        el('span', { class: 'adm-ic', style: { background: ADM_ICON[c.status][1] } }, ADM_ICON[c.status][0]),
        el('div', { class: 'grow' }, el('div', { style: { fontWeight: 600 } }, c.name), el('div', { class: 'muted', style: { fontSize: '12.5px', wordBreak: 'break-word' } }, c.detail),
          c.fix && c.status !== 'ok' ? el('div', { class: 'adm-fix' }, el('span', {}, 'Fix:'), el('code', {}, c.fix),
            el('button', { type: 'button', class: 'btn sm ghost', onClick: () => navigator.clipboard.writeText(c.fix).then(() => toast('Copied')) }, 'Copy'),
            /Settings/.test(c.fix) ? el('a', { class: 'btn sm', href: '#/admin?tab=settings' }, 'Open Settings') : null,
            /Compute/.test(c.fix) ? el('a', { class: 'btn sm', href: '#/compute' }, 'Open Compute') : null) : null)))))));
  }
  run(false);
}

const ADM_GROUPS = [
  ['General', [['Server', 'gear', 'Port, sign-in, sessions and idle kernels']]],
  ['AI', [['Dora (AI)', 'spark', 'The AI model used by Dora, Ask AI and dashboards'], ['AI Agent', 'bot', 'Pipeline agent model and where it may write'], ['Voice', 'play', 'Presenter voice (text to speech)']]],
  ['Data', [['Spark', 'cpu', 'Spark engine, dashboard query engine, start-up'], ['Catalog', 'db', 'Hive metastore / catalog backend'], ['Storage', 'folder', 'ADLS / cloud storage access'], ['Data Hub', 'hub', 'Syncs, real-time and event triggers'], ['Connector catalog', 'download', 'Airbyte connectors built from GitHub — no Airbyte server']]],
  ['Integrations', [['Airflow', 'wind', 'Airflow connection for workflows'], ['Airbyte', 'hub', 'Optional external Airbyte server (not needed)'], ['Kubernetes', 'cpu', 'Kubernetes clusters for jobs']]],
];

async function admSettings(main) {
  let data;
  main.append(loading());
  try { data = await api('/api/admin/settings'); } catch (e) { main.replaceChildren(errBox(e)); return; }
  main.replaceChildren();
  const values = {};                                     // key -> new value (unsaved)
  const byGroup = {};
  data.settings.forEach((s) => { (byGroup[s.group] = byGroup[s.group] || []).push(s); });
  const known = new Set(ADM_GROUPS.flatMap(([, gs]) => gs.map(([g]) => g)));
  const cats = ADM_GROUPS.map(([c, gs]) => [c, gs.filter(([g]) => byGroup[g])]).filter(([, gs]) => gs.length);
  const other = Object.keys(byGroup).filter((g) => !known.has(g));
  if (other.length) cats.push(['Other', other.map((g) => [g, 'gear', ''])]);
  const meta = Object.fromEntries(cats.flatMap(([, gs]) => gs.map(([g, ic, d]) => [g, { ic, d }])));
  let group = new URLSearchParams(location.hash.split('?')[1] || '').get('group');
  if (!byGroup[group]) group = cats[0][1][0][0];
  let query = '';

  const errOf = (s, v) => {
    if (v === '' || v === '********') return null;
    if (s.type === 'bool' && !/^(true|false)$/.test(v)) return 'must be true or false';
    if (s.type === 'int' && !/^-?\d+$/.test(v)) return 'must be a whole number';
    if (s.type.startsWith('enum:') && !s.type.slice(5).split(',').includes(v)) return `must be ${s.type.slice(5).replace(/,/g, ' or ')}`;
    if (s.type === 'jdbc' && !/^jdbc:postgresql:\/\/[^/:\s]+:\d+\/\w+/.test(v)) return 'expected jdbc:postgresql://host:port/database';
    if (s.type === 'url' && !/^https?:\/\//.test(v)) return 'must start with http:// or https://';
    if (s.type === 'tz') { try { new Intl.DateTimeFormat('en', { timeZone: v }); } catch { return 'unknown timezone (e.g. Asia/Kolkata or UTC)'; } }
    if (v !== v.trim()) return 'remove leading/trailing spaces';
    return null;
  };
  const cur = (s) => (s.key in values ? values[s.key] : s.value);
  const changedIn = (g) => byGroup[g].filter((s) => s.key in values).length;

  const search = el('input', { class: 'field adm-search', type: 'search', placeholder: 'Search settings (e.g. port, model, voice, Airflow)…', 'aria-label': 'Search settings' });
  const saveBtn = btn('Save changes', () => save(), { cls: 'primary', ic: 'save' });
  const discardBtn = btn('Discard', () => { Object.keys(values).forEach((k) => delete values[k]); draw(); }, { cls: 'ghost' });
  const status = el('div', { class: 'adm-status', role: 'status', 'aria-live': 'polite' });
  const nav = el('nav', { class: 'adm-nav', 'aria-label': 'Settings sections' });
  const pane = el('div', { class: 'adm-pane' });

  function field(s) {
    let input;
    const msg = el('div', { class: 'adm-err' }, s.error || '');
    const v0 = cur(s);
    const set = (v) => {
      if (v === s.value) delete values[s.key]; else values[s.key] = v;
      const e = errOf(s, v); msg.textContent = e || ''; input.classList.toggle('bad', !!e);
      row.classList.toggle('changed', s.key in values); drawBar(); drawNav();
    };
    let control;
    if (s.type === 'bool') {
      input = el('input', { type: 'checkbox', checked: String(v0 || s.default).toLowerCase() === 'true', 'aria-label': s.label });
      input.addEventListener('change', () => set(input.checked ? 'true' : 'false'));
      control = el('label', { class: 'switch adm-switch' }, input, el('span', {}, input.checked ? 'On' : 'Off'));
      input.addEventListener('change', () => { control.lastChild.textContent = input.checked ? 'On' : 'Off'; });
    } else if (s.type.startsWith('enum:')) {
      const opts = s.type.slice(5).split(',');
      input = el('select', { class: 'field', 'aria-label': s.label }, opts.map((o) => el('option', { value: o, selected: (v0 || s.default) === o }, o)));
      input.addEventListener('change', () => set(input.value));
      control = input;
    } else {
      input = el('input', { class: 'field', type: s.type === 'secret' ? 'password' : 'text', value: v0, placeholder: s.default ? `default: ${s.default}` : '', 'aria-label': s.label, autocomplete: 'off' });
      input.addEventListener('input', () => set(input.value));
      control = s.type === 'secret' ? el('div', { class: 'adm-secret' }, input, btn('Show', (e) => { const show = input.type === 'password'; input.type = show ? 'text' : 'password'; e.currentTarget.textContent = show ? 'Hide' : 'Show'; }, { cls: 'sm ghost' })) : input;
    }
    if (s.error) input.classList.add('bad');
    const row = el('div', { class: `adm-row${s.key in values ? ' changed' : ''}` },
      el('div', { class: 'adm-row-l' },
        el('div', { class: 'adm-row-t' }, el('span', { class: 'adm-dot', title: 'Changed (not saved yet)' }), s.label,
          s.restart ? el('span', { class: 'chip adm-restart', title: 'Needs a DataBridge restart to apply' }, 'restart') : null),
        s.from_file ? el('div', { class: 'adm-help' }, `Currently read from ${s.from_file} — typing a value here replaces it`) : s.help ? el('div', { class: 'adm-help' }, s.help) : null,
        el('code', { class: 'adm-key' }, s.key)),
      el('div', { class: 'adm-row-r' }, control, msg,
        s.key in values ? el('button', { type: 'button', class: 'adm-undo', onClick: () => { delete values[s.key]; draw(); } }, 'Undo change') : null));
    return row;
  }
  function drawNav() {
    nav.replaceChildren(...cats.map(([c, gs]) => el('div', { class: 'adm-nav-cat' }, el('div', { class: 'adm-nav-h' }, c),
      gs.map(([g, ic]) => el('button', { type: 'button', class: 'adm-nav-item', 'aria-current': !query && g === group ? 'page' : null,
        onClick: () => { group = g; query = ''; search.value = ''; history.replaceState(null, '', `#/admin?tab=settings&group=${encodeURIComponent(g)}`); draw(); } },
      icon(ic, 16), el('span', { class: 'grow' }, g), changedIn(g) ? el('span', { class: 'adm-nav-badge', title: 'Unsaved changes' }, changedIn(g)) : el('span', { class: 'adm-nav-n' }, byGroup[g].length))))));
  }
  function drawBar() {
    const n = Object.keys(values).length;
    saveBtn.disabled = !n; discardBtn.hidden = !n;
    if (n) setKids(status, el('b', {}, `${n} unsaved change${n === 1 ? '' : 's'}`));
    else if (!status.dataset.keep) setKids(status, el('span', { class: 'muted' }, `Saved in ${data.env_path}`));
  }
  function draw() {
    drawNav(); drawBar();
    if (query) {
      const q = query.toLowerCase();
      const hits = data.settings.filter((s) => [s.label, s.key, s.help, s.group].join(' ').toLowerCase().includes(q));
      const groups = [...new Set(hits.map((s) => s.group))];
      pane.replaceChildren(el('h2', { class: 'adm-pane-h' }, `${hits.length} setting${hits.length === 1 ? '' : 's'} match “${query}”`),
        ...(groups.length ? groups.map((g) => el('section', { class: 'adm-card' }, el('h3', {}, g), hits.filter((s) => s.group === g).map(field)))
          : [el('p', { class: 'muted' }, 'Nothing matches. Try a different word.')]));
      return;
    }
    const m = meta[group] || {};
    pane.replaceChildren(el('div', { class: 'adm-pane-head' }, el('span', { class: 'adm-pane-ic' }, icon(m.ic || 'gear', 20)),
      el('div', {}, el('h2', { class: 'adm-pane-h' }, group), m.d ? el('p', { class: 'muted small' }, m.d) : null)),
    el('section', { class: 'adm-card' }, byGroup[group].map(field)));
  }
  async function save() {
    const bad = Object.entries(values).filter(([k, v]) => errOf(data.settings.find((x) => x.key === k), v));
    if (bad.length) { toast(`Fix ${bad.map(([k]) => data.settings.find((x) => x.key === k).label).join(', ')} first`, 'err'); return; }
    if (!Object.keys(values).length) { toast('Nothing changed'); return; }
    try {
      const r = await api('/api/admin/settings', { method: 'PUT', body: { values } });
      for (const [k, v] of Object.entries(values)) { const s = data.settings.find((x) => x.key === k); if (s) { s.value = v; s.error = null; } }
      Object.keys(values).forEach((k) => delete values[k]);
      status.dataset.keep = '1';
      setKids(status, el('b', { class: 'adm-ok' }, r.changed.length ? `✓ Saved ${r.changed.length} setting${r.changed.length === 1 ? '' : 's'}. ` : 'Nothing changed. '),
        r.restart_needed.length ? el('span', {}, `Restart DataBridge to apply: ${r.restart_needed.join(', ')}. `) : null,
        el('span', { class: 'muted' }, 'Spark/notebook settings apply after “Apply to kernels”.'));
      setTimeout(() => { delete status.dataset.keep; }, 8000);
      draw(); toast('Settings saved');
    } catch (e) { toast(e.message, 'err'); }
  }
  search.addEventListener('input', () => { query = search.value.trim(); draw(); });
  main.append(
    el('div', { class: 'adm-top' }, search, status, el('span', { class: 'grow' }),
      btn('Apply to kernels', async () => {
        if (!(await confirmDialog('Apply settings to kernels?', 'Reloads .env and stops all notebook/SQL kernels (running cells are interrupted). They restart with the new settings on next use.', 'Apply'))) return;
        const r = await api('/api/admin/apply', { method: 'POST' }); toast(`Reloaded settings · stopped ${r.stopped.length} kernel(s)`);
      }, { ic: 'restart', title: 'Restart kernels so Spark picks up new settings' }),
      discardBtn, saveBtn),
    el('div', { class: 'adm-layout' }, nav, pane),
    ...(data.other_keys.length ? [el('p', { class: 'muted', style: { fontSize: '12px', marginTop: '14px' } }, `Also in .env (edit the file directly): ${data.other_keys.join(', ')}`)] : []));
  draw();
  const unload = (e) => { if (Object.keys(values).length) { e.preventDefault(); e.returnValue = ''; } };
  window.addEventListener('beforeunload', unload);
  return () => window.removeEventListener('beforeunload', unload);
}

/* Home banner when health has problems */
async function admHomeBanner(container) {
  try {
    const res = await api('/api/admin/health');
    if (!res.summary.fail) return;
    const first = res.checks.find((c) => c.status === 'fail');
    container.prepend(el('a', { class: 'adm-banner', href: '#/admin?tab=health' }, el('span', { class: 'adm-ic', style: { background: 'var(--fail)' } }, '✗'),
      el('div', { class: 'grow' }, el('b', {}, `${res.summary.fail} setup problem${res.summary.fail === 1 ? '' : 's'} found`), el('div', { class: 'muted', style: { fontSize: '12.5px' } }, `${first.name}: ${first.detail}`)),
      el('span', { class: 'btn sm' }, 'Open System health')));
  } catch { /* ignore */ }
}
