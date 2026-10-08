/* DataBridge Admin — System health + Settings. Loaded before app.js. */
'use strict';

const ADM_ICON = { ok: ['✓', 'var(--ok)'], warn: ['!', '#BF8700'], fail: ['✗', 'var(--fail)'], skip: ['–', 'var(--wait)'] };

async function viewAdmin(main, r) {
  const tab = r.params.get('tab') || 'health';
  main.append(el('div', { class: 'page-head', style: { marginBottom: '4px' } }, el('h1', { class: 'grow' }, 'Admin')),
    el('div', { class: 'tabs', role: 'tablist', style: { marginTop: 0 } }, [['health', 'System health'], ['settings', 'Settings'], ['users', 'Users'], ['audit', 'Audit log']].map(([k, l]) =>
      el('button', { type: 'button', role: 'tab', 'aria-selected': String(tab === k), onClick: () => (location.hash = `#/admin?tab=${k}`) }, l))));
  const body = el('div');
  main.append(body);
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

async function admSettings(main) {
  let data;
  main.append(loading());
  try { data = await api('/api/admin/settings'); } catch (e) { main.replaceChildren(errBox(e)); return; }
  main.replaceChildren();
  const values = {}, inputs = {};
  const groups = {};
  data.settings.forEach((s) => { (groups[s.group] = groups[s.group] || []).push(s); });
  const status = el('div', { class: 'muted', style: { fontSize: '13px' } }, `Editing ${data.env_path}`);
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
  const field = (s) => {
    let input;
    const msg = el('div', { class: 'adm-err' }, s.error || '');
    const set = (v) => { values[s.key] = v; const e = errOf(s, v); msg.textContent = e || ''; input.classList.toggle('bad', !!e); };
    if (s.type === 'bool') {
      input = el('input', { type: 'checkbox', checked: String(s.value || s.default).toLowerCase() === 'true' });
      input.addEventListener('change', () => set(input.checked ? 'true' : 'false'));
      inputs[s.key] = input;
      return el('div', { class: 'adm-field' }, el('label', { class: 'switch' }, input, s.label), s.help ? el('div', { class: 'pl-hint' }, s.help) : null, msg);
    }
    if (s.type.startsWith('enum:')) {
      input = el('select', { class: 'field' }, s.type.slice(5).split(',').map((o) => el('option', { value: o, selected: (s.value || s.default) === o }, o)));
      input.addEventListener('change', () => set(input.value));
    } else {
      input = el('input', { class: 'field', type: s.type === 'secret' ? 'password' : 'text', value: s.value, placeholder: s.default || '' });
      input.addEventListener('input', () => set(input.value));
    }
    if (s.error) input.classList.add('bad');
    inputs[s.key] = input;
    return el('label', { class: 'lbl adm-field' }, el('span', {}, s.label, s.restart ? el('span', { class: 'chip', style: { marginLeft: '6px', fontSize: '10px' } }, 'restart') : null), input,
      s.from_file ? el('div', { class: 'pl-hint' }, `Currently read from ${s.from_file} — typing a value here replaces it`) : s.help ? el('div', { class: 'pl-hint' }, s.help) : null, msg);
  };
  const save = async () => {
    const bad = Object.entries(values).filter(([k, v]) => errOf(data.settings.find((x) => x.key === k), v));
    if (bad.length) { toast(`Fix ${bad.map(([k]) => k).join(', ')} first`, 'err'); return; }
    if (!Object.keys(values).length) { toast('Nothing changed'); return; }
    try {
      const r = await api('/api/admin/settings', { method: 'PUT', body: { values } });
      Object.keys(values).forEach((k) => delete values[k]);
      if (!r.changed.length) { toast('Nothing changed'); return; }
      status.replaceChildren(el('b', {}, `Saved ${r.changed.length} setting${r.changed.length === 1 ? '' : 's'}. `),
        r.restart_needed.length ? `Restart DataBridge (Ctrl+C, then .\\run.bat) to apply: ${r.restart_needed.join(', ')}. ` : '',
        'Other changes apply after “Apply to kernels”.');
      toast('Settings saved');
    } catch (e) { toast(e.message, 'err'); }
  };
  main.append(el('div', { class: 'row', style: { marginBottom: '14px', flexWrap: 'wrap' } }, status, el('span', { class: 'grow' }),
    btn('Apply to kernels', async () => {
      if (!(await confirmDialog('Apply settings to kernels?', 'Reloads .env and stops all notebook/SQL kernels (running cells are interrupted). They restart with the new settings on next use.', 'Apply'))) return;
      const r = await api('/api/admin/apply', { method: 'POST' }); toast(`Reloaded settings · stopped ${r.stopped.length} kernel(s)`);
    }, { ic: 'restart' }),
    btn('Save', save, { cls: 'primary', ic: 'save' })),
  el('div', { class: 'adm-grid' }, Object.entries(groups).map(([g, ss]) => el('section', { class: 'panel form-panel' }, el('h2', {}, g), ss.map(field)))),
  data.other_keys.length ? el('p', { class: 'muted', style: { fontSize: '12px', marginTop: '14px' } }, `Also in .env (edit the file directly): ${data.other_keys.join(', ')}`) : null);
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
