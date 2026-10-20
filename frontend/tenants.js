/* DataBridge Data Hub — Tenants & businesses: who synced rows belong to. Loaded before app.js. */
'use strict';

let TN_CACHE = null;
async function tnLoad(force) {
  if (!TN_CACHE || force) TN_CACHE = await api('/api/datahub/tenants');
  return TN_CACHE;
}
const tnIsAdmin = () => !!CURRENT_USER && ['super_admin', 'admin'].includes(CURRENT_USER.role);

/* small chip: "Tucanos › Downtown" or "Tucanos › by location_id" */
function tnBadge(t, opts = {}) {
  if (!t) return opts.empty ? el('span', { class: 'tn-chip none', title: 'Not assigned to a tenant — no tenant / business columns' }, 'No tenant') : null;
  if (t.missing) return el('span', { class: 'tn-chip bad' }, 'Tenant deleted');
  return el('span', { class: 'tn-chip', title: `Rows get tenant = ${t.tenant_code}, business = ${t.business_code || (t.business_from ? `mapped from ${t.business_from}` : 'empty')}` },
    el('b', {}, t.tenant), t.business ? ` › ${t.business}` : t.business_from ? el('span', { class: 'muted' }, ` › by ${t.business_from}`) : null);
}

/* ---------------- Tenants tab ---------------- */
async function dhTenants(body) {
  body.append(loading());
  let T;
  try { T = await tnLoad(true); } catch (e) { body.replaceChildren(errBox(e)); return; }
  const reload = () => { body.replaceChildren(); dhTenants(body); };
  const cols = T.columns || { tenant: 'tenant', business: 'business' };
  const head = el('div', { class: 'tn-head' },
    el('div', { class: 'grow' },
      el('p', { class: 'muted small', style: { margin: 0 } }, 'A tenant is a customer; businesses are its brands or locations. Assign a connection to a tenant and every row it syncs gets ',
        el('code', {}, cols.tenant), ' and ', el('code', {}, cols.business), ' columns — so many customers can share one table. Upsert keys include them and a full refresh only replaces that tenant’s rows.')),
    tnIsAdmin() ? btn('New tenant', () => tnEdit(null, reload), { cls: 'primary', ic: 'plus' }) : null);
  if (!T.tenants.length) {
    body.replaceChildren(head, el('section', { class: 'empty' }, el('h2', {}, 'No tenants yet'),
      el('p', {}, 'Add your first customer, its locations and their POS IDs (Toast restaurant GUID, Clover merchant ID, R365 location…).'),
      tnIsAdmin() ? btn('Add a tenant', () => tnEdit(null, reload), { cls: 'primary', ic: 'plus' }) : el('p', { class: 'muted small' }, 'Ask an admin to add tenants.')));
    return;
  }
  body.replaceChildren(head, el('div', { class: 'tn-list' }, T.tenants.map((t) => el('section', { class: 'tn-card' },
    el('div', { class: 'tn-card-h' },
      el('span', { class: 'tn-av', 'aria-hidden': 'true' }, t.name.slice(0, 1).toUpperCase()),
      el('div', { class: 'grow' }, el('h3', {}, t.name, t.active === false ? el('span', { class: 'chip' }, 'inactive') : null),
        el('div', { class: 'muted small' }, el('code', {}, t.code), ` · ${t.businesses.length} business${t.businesses.length === 1 ? '' : 'es'} · ${t.connections} connection${t.connections === 1 ? '' : 's'}`)),
      tnIsAdmin() ? btn('Edit', () => tnEdit(t, reload), { cls: 'sm', ic: 'edit' }) : null,
      tnIsAdmin() ? btn('', async () => {
        if (!(await confirmDialog(`Delete tenant ${t.name}?`, 'Rows already synced keep their tenant column. Connections must be reassigned first.'))) return;
        try { await api(`/api/datahub/tenants/${t.id}`, { method: 'DELETE' }); toast('Tenant deleted'); reload(); } catch (e) { toast(e.message, 'err'); }
      }, { cls: 'sm', ic: 'trash', title: 'Delete' }) : null),
    t.notes ? el('p', { class: 'muted small', style: { margin: '6px 0 0' } }, t.notes) : null,
    t.businesses.length ? el('table', { class: 't tn-bt' },
      el('thead', {}, el('tr', {}, ['Business', 'Code', 'Source IDs (POS location IDs)', 'Time zone'].map((x) => el('th', {}, x)))),
      el('tbody', {}, t.businesses.map((b) => el('tr', {},
        el('td', {}, b.name, b.active === false ? el('span', { class: 'chip' }, 'inactive') : null), el('td', {}, el('code', {}, b.code)),
        el('td', {}, b.source_ids.length ? b.source_ids.map((x) => el('span', { class: 'tn-id mono', title: x }, x)) : el('span', { class: 'muted small' }, '—')),
        el('td', { class: 'small' }, b.timezone || '—')))))
      : el('p', { class: 'muted small' }, 'No businesses yet — rows get an empty business unless the connection maps one.')))));
}

function tnEdit(t, done) {
  return openDialog((close) => {
    const name = el('input', { class: 'field', value: t ? t.name : '', placeholder: 'e.g. Tucanos Brazilian Grill', 'aria-label': 'Tenant name' });
    const code = el('input', { class: 'field mono', value: t ? t.code : '', placeholder: 'auto from name', 'aria-label': 'Tenant code' });
    const notes = el('input', { class: 'field', value: t ? t.notes || '' : '', placeholder: 'optional' });
    const autoCode = (x) => x.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').replace(/^(\d)/, 't_$1').slice(0, 40);
    let codeTouched = !!t;
    code.addEventListener('input', () => { codeTouched = true; });
    name.addEventListener('input', () => { if (!codeTouched) code.value = autoCode(name.value); });
    const rows = el('tbody');
    const addRow = (b = {}) => {
      const r = { id: b.id, name: el('input', { class: 'field sm', value: b.name || '', placeholder: 'Downtown', 'aria-label': 'Business name' }),
        code: el('input', { class: 'field sm mono', value: b.code || '', placeholder: 'auto', 'aria-label': 'Business code' }),
        ids: el('input', { class: 'field sm mono', value: (b.source_ids || []).join(', '), placeholder: 'Toast GUID, Clover merchant ID…', 'aria-label': 'Source IDs' }),
        tz: el('input', { class: 'field sm', value: b.timezone || '', placeholder: 'America/Chicago', 'aria-label': 'Time zone' }) };
      let touched = !!b.code;
      r.code.addEventListener('input', () => { touched = true; });
      r.name.addEventListener('input', () => { if (!touched) r.code.value = autoCode(r.name.value); });
      const tr = el('tr', {}, el('td', {}, r.name), el('td', {}, r.code), el('td', {}, r.ids), el('td', {}, r.tz),
        el('td', {}, btn('', () => { tr.remove(); R.delete(r); }, { cls: 'sm ghost', ic: 'x', title: 'Remove' })));
      R.add(r); rows.append(tr);
    };
    const R = new Set();
    (t ? t.businesses : [{}]).forEach(addRow);
    const err = el('div');
    const collect = () => ({ name: name.value.trim(), code: code.value.trim(), notes: notes.value.trim(),
      businesses: [...R].map((r) => ({ id: r.id, name: r.name.value.trim(), code: r.code.value.trim(), timezone: r.tz.value.trim(),
        source_ids: r.ids.value.split(',').map((x) => x.trim()).filter(Boolean) })) });
    const save = btn('Save', async () => {
      err.replaceChildren(); save.disabled = true;
      const body = collect();
      const send = (b) => api(t ? `/api/datahub/tenants/${t.id}` : '/api/datahub/tenants', { method: t ? 'PUT' : 'POST', body: b });
      try { close(await send(body)); }
      catch (e) {
        if (e.status === 409 && /code from/.test(e.message) && (await formDialog({ title: 'Change the tenant code?', text: `${e.message.replace(' Send confirm_code_change to proceed.', '')} New rows will use the new code.`, fields: [], submit: 'Change code' }))) {
          try { close(await send({ ...body, confirm_code_change: true })); return; } catch (x) { err.replaceChildren(errBox(x)); }
        } else err.replaceChildren(errBox(e));
        save.disabled = false;
      }
    }, { cls: 'primary', ic: 'save' });
    return el('div', { class: 'dlg tn-dlg' },
      el('div', { class: 'row' }, el('h2', { class: 'grow' }, t ? `Edit ${t.name}` : 'New tenant'), btn('Close', () => close(null), { cls: 'sm' })),
      el('div', { class: 'tn-form' }, el('label', { class: 'lbl' }, 'Name', name), el('label', { class: 'lbl' }, 'Code (written to the tenant column)', code),
        el('label', { class: 'lbl', style: { gridColumn: '1 / -1' } }, 'Notes', notes)),
      el('div', { class: 'cx-h' }, 'Businesses (brands / locations)'),
      el('p', { class: 'muted small', style: { margin: '0 0 6px' } }, 'Source IDs map rows to a business: when a connection takes the business “from data”, a row whose location_id (or the column you choose) equals one of these IDs gets that business code.'),
      el('div', { class: 'dh-grid-wrap', style: { maxHeight: '44vh' } }, el('table', { class: 't tn-et' },
        el('thead', {}, el('tr', {}, ['Name', 'Code', 'Source IDs (comma-separated)', 'Time zone', ''].map((x) => el('th', {}, x)))), rows)),
      el('div', { class: 'row', style: { marginTop: '8px' } }, btn('Add business', () => addRow(), { cls: 'sm', ic: 'plus' })),
      err,
      el('div', { class: 'actions' }, el('span', { class: 'grow' }), btn('Cancel', () => close(null)), save));
  }, { wide: true }).then((saved) => { if (saved) { toast('Tenant saved'); TN_CACHE = null; done && done(); } });
}

/* ---------------- tenant / business picker for connection forms ---------------- */
function tnPicker(conn, isLibrary) {
  const node = el('fieldset', { class: 'tn-pick' }, el('legend', {}, 'Tenant'), loading());
  const V = { tenant_id: (conn && conn.tenant_id) || '', business_id: (conn && conn.business_id) || '', business_column: (conn && conn.business_column) || '' };
  let T = null;
  const draw = () => {
    const tSel = el('select', { class: 'field', 'aria-label': 'Tenant' }, el('option', { value: '' }, '— No tenant (one company, no tenant columns) —'),
      T.tenants.map((t) => el('option', { value: t.id, selected: t.id === V.tenant_id }, `${t.name} (${t.code})`)));
    const ten = () => T.tenants.find((t) => t.id === V.tenant_id);
    const bSel = el('select', { class: 'field', 'aria-label': 'Business' });
    const bCol = el('input', { class: 'field mono', value: V.business_column, placeholder: isLibrary ? 'location_id' : 'e.g. store_id', 'aria-label': 'Business column' });
    const hint = el('div', { class: 'muted small tn-hint' });
    const bColLbl = el('label', { class: 'lbl' }, 'Business column', bCol);
    const fill = () => {
      const t = ten();
      bSel.replaceChildren(el('option', { value: '' }, isLibrary ? 'From data — map each row by its location ID' : 'From data — map each row by a column'),
        ...(t ? t.businesses : []).map((b) => el('option', { value: b.id, selected: b.id === V.business_id }, `${b.name} (${b.code})`)));
      bSel.disabled = !t;
      upd();
    };
    const upd = () => {
      const t = ten();
      const b = t && t.businesses.find((x) => x.id === V.business_id);
      bColLbl.hidden = !t || !!b;
      const col = V.business_column || (isLibrary ? 'location_id' : '');
      hint.replaceChildren(!t ? 'Rows are written as they come — fine for a single company.'
        : el('span', {}, 'Every row gets ', el('code', {}, `${T.columns.tenant} = ${t.code}`), ' and ',
          b ? el('code', {}, `${T.columns.business} = ${b.code}`)
            : col ? el('span', {}, el('code', {}, T.columns.business), ` from `, el('code', {}, col), t.businesses.some((x) => x.source_ids.length) ? ' (mapped through the source IDs)' : ' (as is — add source IDs to map them)')
              : el('span', {}, el('code', {}, `${T.columns.business} = empty`), ' — pick a business or a column')));
    };
    tSel.addEventListener('change', () => { V.tenant_id = tSel.value; V.business_id = ''; fill(); });
    bSel.addEventListener('change', () => { V.business_id = bSel.value; upd(); });
    bCol.addEventListener('input', () => { V.business_column = bCol.value.trim(); upd(); });
    fill();
    node.replaceChildren(...[el('legend', {}, 'Tenant'),
      el('div', { class: 'tn-pick-row' }, el('label', { class: 'lbl' }, 'Tenant', tSel), el('label', { class: 'lbl' }, 'Business', bSel), bColLbl),
      hint,
      !T.tenants.length ? el('div', { class: 'muted small' }, 'No tenants yet — ', el('a', { href: '#/datahub?tab=tenants' }, 'add one in Data Hub › Tenants'), '.') : null].filter(Boolean));
  };
  tnLoad().then((x) => { T = x; draw(); }).catch((e) => node.replaceChildren(el('legend', {}, 'Tenant'), errBox(e)));
  return { node, get: () => ({ tenant_id: V.tenant_id || null, business_id: V.tenant_id ? (V.business_id || null) : null, business_column: V.tenant_id && !V.business_id ? (V.business_column || null) : null }) };
}
