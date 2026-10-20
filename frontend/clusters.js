/* DataBridge Clusters (Compute page): define Spark clusters for this machine, AKS, EKS or OKE; usage and cost per month. */
'use strict';

async function clustersPanel(panel, usagePanel) {
  const admin = CURRENT_USER && ['admin', 'super_admin'].includes(CURRENT_USER.role);
  let data;
  try { data = await api('/api/clusters'); } catch (e) { panel.replaceChildren(errBox(e)); return; }
  const cur = (c) => c.currency || '₹';
  const head = el('div', { class: 'panel-head' }, el('h2', { class: 'grow' }, 'Clusters'),
    el('span', { class: 'muted', style: { fontSize: '12px' } }, data.on_kubernetes ? 'DataBridge is running on Kubernetes' : 'DataBridge is running on this machine'),
    admin ? btn('New cluster', () => clusterDialog(null, data, () => clustersPanel(panel, usagePanel)), { cls: 'primary sm', ic: 'plus' }) : null);
  if (!data.clusters.length) {
    panel.replaceChildren(head, el('div', { class: 'empty' },
      el('p', {}, 'A cluster is the Spark compute a notebook or job runs on — this machine, or a node pool on Azure (AKS), AWS (EKS) or Oracle Cloud (OKE) that grows to your maximum and shrinks to zero when idle.'),
      admin ? btn('Create your first cluster', () => clusterDialog(null, data, () => clustersPanel(panel, usagePanel)), { cls: 'primary' }) : null));
  } else {
    const tb = el('tbody');
    for (const c of data.clusters) {
      const live = data.live[c.id] || {};
      tb.append(el('tr', {},
        el('td', {}, el('div', { style: { fontWeight: 600 } }, c.name, data.default_cluster === c.id ? el('span', { class: 'pill', style: { marginLeft: '8px' } }, 'default') : null),
          el('div', { class: 'muted small' }, c.description || data.clouds[c.cloud])),
        el('td', {}, data.clouds[c.cloud] || c.cloud),
        el('td', { class: 'muted' }, c.cloud === 'local' ? `${c.vcpu} cores · driver ${c.driver_memory}` : `${c.node_type} · ${c.vcpu} vCPU / ${c.memory_gb} GB${c.spot ? ' · spot' : ''}`),
        el('td', {}, c.cloud === 'local' ? '—' : `${c.min_workers}–${c.max_workers}`),
        el('td', { class: 'muted' }, c.cloud === 'local' ? '—' : `${c.auto_stop_minutes} min`),
        el('td', {}, c.price_per_node_hour ? `${cur(c)}${c.price_per_node_hour}/node-h${c.markup_pct ? ` +${c.markup_pct}%` : ''}` : el('span', { class: 'muted' }, 'not set')),
        el('td', {}, stateEl(live.kernels ? 'running' : 'idle'), el('div', { class: 'muted small' }, `${live.kernels || 0} attached · ${live.executors || 0} workers`)),
        el('td', { style: { textAlign: 'right', whiteSpace: 'nowrap' } }, admin ? [
          btn('', () => clusterDialog(c, data, () => clustersPanel(panel, usagePanel)), { cls: 'ghost icon sm', ic: 'edit', title: 'Edit' }),
          btn('', () => clusterDialog({ ...c, id: null, name: `${c.name} copy` }, data, () => clustersPanel(panel, usagePanel)), { cls: 'ghost icon sm', ic: 'copy', title: 'Duplicate' }),
          btn('', async () => {
            if (!(await confirmDialog(`Delete cluster ${c.name}?`, 'Notebooks and jobs that use it fall back to this machine. Usage history is kept.', 'Delete'))) return;
            try { await api(`/api/clusters/${c.id}`, { method: 'DELETE' }); clustersPanel(panel, usagePanel); } catch (e) { toast(e.message, 'err'); }
          }, { cls: 'ghost icon sm', ic: 'trash', title: 'Delete' })] : null)));
    }
    panel.replaceChildren(head, el('div', { class: 'tbl-wrap' }, el('table', { class: 't' },
      el('thead', {}, el('tr', {}, ['Cluster', 'Cloud', 'Workers are', 'Workers', 'Auto-stop', 'Price', 'Now', ''].map((h) => el('th', {}, h)))), tb)),
      el('p', { class: 'muted small', style: { padding: '0 16px 12px' } }, 'Pick a cluster in a notebook’s header or in a job’s settings. Set the default for new notebooks in Admin › Settings › Kubernetes.'));
  }
  if (admin && usagePanel) clusterUsage(usagePanel);
}

async function clusterUsage(panel, month) {
  month = month || new Date().toISOString().slice(0, 7);
  let u;
  try { u = await api(`/api/clusters-usage?month=${month}`); } catch (e) { panel.replaceChildren(errBox(e)); return; }
  const monthIn = el('input', { class: 'field', type: 'month', value: month, style: { width: '160px' } });
  monthIn.addEventListener('change', () => clusterUsage(panel, monthIn.value));
  const total = (k) => u.rows.reduce((a, r) => a + (r[k] || 0), 0);
  const csv = () => {
    const cols = ['cluster', 'cloud', 'user', 'attached_hours', 'node_hours', 'cost', 'charge', 'currency'];
    download(`cluster-usage-${u.month}.csv`, [cols.join(','), ...u.rows.map((r) => cols.map((c) => JSON.stringify(r[c] ?? '')).join(','))].join('\n'));
  };
  panel.replaceChildren(el('div', { class: 'panel-head' }, el('h2', { class: 'grow' }, 'Usage and cost'), monthIn,
    btn('Download CSV', csv, { cls: 'sm', ic: 'download' })),
  u.rows.length ? el('div', { class: 'tbl-wrap' }, el('table', { class: 't' },
    el('thead', {}, el('tr', {}, ['Cluster', 'User', 'Attached hours', 'Node-hours', 'Cloud cost', 'Charge (with markup)'].map((h) => el('th', {}, h)))),
    el('tbody', {}, ...u.rows.map((r) => el('tr', {}, el('td', {}, r.cluster), el('td', {}, r.user), el('td', {}, r.attached_hours),
      el('td', {}, r.node_hours), el('td', {}, `${r.currency}${r.cost.toLocaleString()}`), el('td', {}, el('b', {}, `${r.currency}${r.charge.toLocaleString()}`)))),
    el('tr', {}, el('td', {}, el('b', {}, 'Total')), el('td'), el('td', {}, total('attached_hours').toFixed(2)), el('td', {}, total('node_hours').toFixed(2)),
      el('td', {}, total('cost').toLocaleString()), el('td', {}, el('b', {}, total('charge').toLocaleString()))))))
    : el('div', { class: 'empty' }, el('p', {}, 'No usage recorded this month.')),
  el('p', { class: 'muted small', style: { padding: '0 16px 12px' } }, 'Measured every minute: node-hours = running worker pods (one per node). Cost = node-hours × the cluster’s price per node-hour; charge adds the markup — use it to bill customers.'));
}

function clusterDialog(c, data, done) {
  const v = { cloud: data.on_kubernetes ? 'azure' : 'local', min_workers: 0, max_workers: 4, auto_stop_minutes: 30, driver_memory: '2g', node_pool: 'spark', spot: false,
    price_per_node_hour: 0, markup_pct: 0, currency: '₹', spark_conf: {}, ...(c || {}) };
  return openDialog((close) => {
    const name = el('input', { class: 'field', value: v.name || '', placeholder: 'e.g. Analytics (AKS)' });
    const desc = el('input', { class: 'field', value: v.description || '', placeholder: 'optional' });
    const cloud = el('select', { class: 'field' }, Object.entries(data.clouds).map(([k, l]) => el('option', { value: k, selected: k === v.cloud }, l)));
    const node = el('select', { class: 'field' });
    const vcpu = el('input', { class: 'field', type: 'number', min: 1, value: v.vcpu || 4 });
    const memG = el('input', { class: 'field', type: 'number', min: 1, value: v.memory_gb || 16 });
    const drv = el('select', { class: 'field' }, ['1g', '2g', '4g', '8g', '16g'].map((m) => el('option', { value: m, selected: m === v.driver_memory }, m)));
    const minW = el('input', { class: 'field', type: 'number', min: 0, value: v.min_workers });
    const maxW = el('input', { class: 'field', type: 'number', min: 1, value: v.max_workers });
    const stop = el('input', { class: 'field', type: 'number', min: 1, value: v.auto_stop_minutes });
    const pool = el('input', { class: 'field mono', value: v.node_pool || 'spark' });
    const spot = el('input', { type: 'checkbox', checked: !!v.spot });
    const price = el('input', { class: 'field', type: 'number', min: 0, step: '0.01', value: v.price_per_node_hour || 0 });
    const markup = el('input', { class: 'field', type: 'number', min: 0, step: '1', value: v.markup_pct || 0 });
    const curIn = el('input', { class: 'field', value: v.currency || '₹', maxlength: 4, style: { width: '80px' } });
    const conf = el('textarea', { class: 'field mono', rows: 3, placeholder: 'spark.sql.shuffle.partitions=200' }, Object.entries(v.spark_conf || {}).map(([k, x]) => `${k}=${x}`).join('\n'));
    const est = el('p', { class: 'muted small' });
    const k8sBox = el('div');
    const fillNodes = () => {
      const list = data.node_types[cloud.value] || [];
      node.replaceChildren(...list.map((n) => el('option', { value: n.name, selected: n.name === v.node_type }, `${n.name} — ${n.vcpu} vCPU, ${n.memory_gb} GB`)), el('option', { value: '__custom', selected: !list.some((n) => n.name === v.node_type) && !!v.node_type && cloud.value !== 'local' }, 'Other size…'));
      const pick = list.find((n) => n.name === node.value);
      if (pick) { vcpu.value = pick.vcpu; memG.value = pick.memory_gb; }
      k8sBox.hidden = cloud.value === 'local';
      estimate();
    };
    node.addEventListener('change', () => { const p = (data.node_types[cloud.value] || []).find((n) => n.name === node.value); if (p) { vcpu.value = p.vcpu; memG.value = p.memory_gb; } estimate(); });
    cloud.addEventListener('change', fillNodes);
    const estimate = () => {
      const p = Number(price.value) || 0, mx = Number(maxW.value) || 0, mn = Number(minW.value) || 0;
      est.textContent = cloud.value === 'local' ? 'Runs on the DataBridge machine — no extra cloud cost.'
        : p ? `Idle: ${curIn.value}${(p * mn).toFixed(2)}/h · fully busy: ${curIn.value}${(p * mx).toFixed(2)}/h${Number(markup.value) ? ` (you charge ${curIn.value}${(p * mx * (1 + Number(markup.value) / 100)).toFixed(2)}/h)` : ''}. Workers above the minimum are removed after ${stop.value} idle minutes.`
          : 'Enter the price per node-hour from your cloud price list to see costs and charge customers.';
    };
    [price, maxW, minW, markup, stop, curIn].forEach((i) => i.addEventListener('input', estimate));
    const f = (l, i, h) => el('label', { class: 'lbl' }, l, i, h ? el('span', { class: 'muted small' }, h) : null);
    setKids(k8sBox,
      el('div', { class: 'grid3' }, f('Worker size', node), f('vCPU per node', vcpu), f('Memory per node (GB)', memG)),
      el('div', { class: 'grid3' }, f('Min workers', minW, '0 = scale to zero when idle'), f('Max workers', maxW), f('Auto-stop idle workers (min)', stop)),
      el('div', { class: 'grid2' }, f('Node pool', pool, 'Nodes labelled databridge.io/pool=<this>'), el('label', { class: 'switch', style: { marginTop: '26px' } }, spot, 'Use spot / preemptible nodes (cheaper, can be taken back)')));
    fillNodes();
    const form = el('form', { class: 'dlg' }, el('h2', {}, c && c.id ? `Edit ${c.name}` : 'New cluster'),
      el('div', { class: 'grid2' }, f('Name', name), f('Runs on', cloud)), f('Description', desc),
      k8sBox,
      el('div', { class: 'grid3' }, f('Driver memory', drv, 'Spark driver inside the DataBridge kernel'), f('Price per node-hour', price), f('Your markup %', markup, 'Added to cost for customer charges')),
      el('div', { class: 'grid2' }, f('Currency', curIn), f('Extra Spark settings', conf, 'key=value per line')),
      est,
      el('div', { class: 'actions' }, el('button', { type: 'button', class: 'btn', onClick: () => close(null) }, 'Cancel'), el('button', { type: 'submit', class: 'btn primary' }, c && c.id ? 'Save' : 'Create cluster')));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = { name: name.value.trim(), description: desc.value.trim(), cloud: cloud.value, node_type: node.value === '__custom' ? `${vcpu.value} vCPU / ${memG.value} GB` : node.value,
        vcpu: Number(vcpu.value) || 1, memory_gb: Number(memG.value) || 1, driver_memory: drv.value, min_workers: Number(minW.value) || 0,
        max_workers: Number(maxW.value) || 1, auto_stop_minutes: Number(stop.value) || 30, node_pool: pool.value.trim() || 'spark', spot: spot.checked,
        price_per_node_hour: Number(price.value) || 0, markup_pct: Number(markup.value) || 0, currency: curIn.value || '₹',
        spark_conf: Object.fromEntries(conf.value.split('\n').map((l) => l.trim()).filter((l) => l.includes('=')).map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])) };
      try {
        await api(c && c.id ? `/api/clusters/${c.id}` : '/api/clusters', { method: c && c.id ? 'PUT' : 'POST', body });
        toast(c && c.id ? 'Cluster saved — kernels pick up changes when they restart' : 'Cluster created');
        close(true); done && done();
      } catch (err) { toast(err.message, 'err'); }
    });
    return form;
  }, { wide: true });
}
