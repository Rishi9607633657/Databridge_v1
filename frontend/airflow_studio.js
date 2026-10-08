/* Airflow inside DataBridge: write & deploy DAGs (no kubectl) and use the full Airflow UI. */
'use strict';

/* Old #/airflow links go to the Workflows tabs. */
function viewAirflow(main, r) {
  location.replace(`#/workflows?tab=airflow&sub=${r.params.get('tab') === 'ui' ? 'ui' : 'studio'}`);
}

async function airflowUiTab(body) {
  body.append(loading('Checking Airflow…'));
  let chk;
  try { chk = await api('/api/airflow-studio/embed-check'); } catch (e) { body.replaceChildren(errBox(e)); return; }
  if (!chk.url) {
    body.replaceChildren(el('div', { class: 'empty' }, el('h2', {}, 'Airflow is not connected'),
      el('p', {}, 'Set AIRFLOW_URL in Admin › Settings (for example http://localhost:8080).'), el('a', { class: 'btn primary', href: '#/admin?tab=settings' }, 'Open Settings')));
    return;
  }
  if (chk.embeddable) {
    body.replaceChildren(el('div', { class: 'af-ui' },
      el('div', { class: 'af-ui-bar' }, el('span', { class: 'muted small' }, chk.url), el('span', { class: 'grow' }),
        el('a', { class: 'btn sm', href: chk.url, target: '_blank', rel: 'noopener' }, 'Open in new tab')),
      el('iframe', { class: 'af-frame', src: chk.url, title: 'Airflow', referrerpolicy: 'no-referrer' })));
    return;
  }
  body.replaceChildren(el('div', { class: 'af-blocked' },
    el('div', { class: 'af-blocked-card' },
      el('h2', {}, chk.reachable === false ? 'Airflow is not reachable' : 'Airflow opens in its own tab'),
      el('p', {}, chk.reason),
      chk.reachable === false
        ? el('p', { class: 'muted' }, 'Check that Airflow is running and that AIRFLOW_URL in Admin › Settings is correct (if Airflow runs in Kubernetes, the port-forward must be active).')
        : el('p', { class: 'muted' }, 'This is a security setting in Airflow, not a DataBridge problem. You can still do almost everything from here:'),
      el('div', { class: 'af-blocked-actions' },
        el('a', { class: 'btn primary', href: chk.url, target: '_blank', rel: 'noopener' }, icon('ext', 14), 'Open Airflow'),
        el('a', { class: 'btn', href: '#/workflows?tab=airflow&sub=dags' }, 'Airflow DAGs — runs, trigger, logs'),
        el('a', { class: 'btn', href: '#/workflows?tab=airflow&sub=studio' }, 'DAG studio — write & deploy')))));
}

async function dagStudioTab(body) {
  let meta;
  try { meta = await api('/api/airflow-studio/files'); } catch (e) { body.append(errBox(e)); return; }
  const canEdit = !CURRENT_USER || CURRENT_USER.role !== 'viewer';
  body.append(el('p', { class: 'muted small af-where' }, meta.mode === 'git' ? `Save & deploy commits and pushes to git (${meta.dir}); Airflow's git-sync pulls it.` : `Save & deploy writes to the DAGs folder Airflow reads: ${meta.dir}`));
  // ---------------- DAG studio ----------------
  const S = { files: meta.files, current: null, dirty: false, poll: null };
  const fileList = el('div', { class: 'af-files' });
  const editorBox = el('div', { class: 'af-editor' });
  const nameIn = el('input', { class: 'field mono af-name', placeholder: 'my_dag.py', 'aria-label': 'File name' });
  const statusBox = el('div', { class: 'af-status', 'aria-live': 'polite' });
  const cm = CodeMirror(editorBox, { mode: 'python', theme: 'databridge', lineNumbers: true, indentUnit: 4, tabSize: 4, viewportMargin: 60, readOnly: !canEdit });
  cm.on('change', () => { S.dirty = true; });
  body.append(el('div', { class: 'af-studio af-in-wf' },
    el('aside', { class: 'af-side' },
      canEdit ? btn('New DAG', () => newDag(), { cls: 'primary', ic: 'plus' }) : null, fileList),
    el('section', { class: 'af-main' },
      el('div', { class: 'af-bar' }, nameIn,
        canEdit ? btn('Check', () => check(), { ic: 'check', title: 'Check the file for errors' }) : null,
        canEdit ? btn('Save & deploy', () => save(), { cls: 'primary', ic: 'save' }) : null,
        btn('Run now', () => trigger(), { ic: 'play', title: 'Trigger a run in Airflow' }),
        meta.airflow_url ? btn('Open in Airflow', () => { const id = (S.ids || [])[0]; window.open(id ? `${meta.airflow_url}/dags/${id}/grid` : meta.airflow_url, '_blank'); }, { ic: 'ext' }) : null,
        canEdit ? btn('', () => remove(), { cls: 'ghost icon', ic: 'trash', title: 'Delete DAG file' }) : null),
      editorBox, statusBox)));
  setTimeout(() => cm.refresh(), 0);

  function drawFiles() {
    fileList.replaceChildren(...(S.files.length ? S.files.map((f) => el('button', { type: 'button', class: 'af-file', 'aria-current': S.current === f.name ? 'true' : null, onClick: () => open(f.name) },
      el('b', { class: 'mono' }, f.name), el('span', { class: 'muted' }, f.dag_ids.join(', ') || 'no DAG found'), el('span', { class: 'muted' }, ago(f.updated))))
      : [el('p', { class: 'muted small' }, 'No DAG files yet. Click New DAG.')]));
  }
  function setStatus(kind, title, lines) {
    statusBox.className = `af-status ${kind}`;
    statusBox.replaceChildren(el('b', {}, title), ...(lines || []).map((x) => (String(x).includes('\n') ? el('pre', {}, x) : el('div', {}, x))));
  }
  async function open(name) {
    if (S.dirty && !(await confirmDialog('Discard unsaved changes?', 'Your edits to the current DAG are not saved.', 'Discard'))) return;
    const f = await api(`/api/airflow-studio/files/${encodeURIComponent(name)}`);
    S.current = name; S.ids = f.dag_ids; nameIn.value = name; cm.setValue(f.code); S.dirty = false; drawFiles();
    setStatus('', `DAGs in this file: ${f.dag_ids.join(', ') || 'none'}`, []);
    refreshStatus(false);
  }
  async function newDag() {
    const tpls = await api('/api/airflow-studio/templates');
    const v = await openDialog((close) => el('div', { class: 'dlg' }, el('h2', {}, 'New DAG'), el('p', { class: 'muted' }, 'Start from a template:'),
      el('div', { class: 'combine-choices' }, tpls.map((t) => el('button', { type: 'button', class: 'combine-opt', onClick: () => close(t) }, el('b', {}, t.name),
        el('span', { class: 'mono' }, (t.code.match(/dag_id="([\w.-]+)"|def (\w+)\(\):/) || [])[1] || '')))),
      el('div', { class: 'actions' }, btn('Cancel', () => close(null)))));
    if (!v) return;
    const id = (v.code.match(/dag_id="([\w.-]+)"/) || [])[1] || (v.code.match(/@dag[^\n]*\n\s*def\s+(\w+)/) || [])[1] || 'my_dag';
    S.current = null; S.ids = []; nameIn.value = `${id}.py`; cm.setValue(v.code); S.dirty = true; drawFiles(); cm.focus();
    setStatus('', 'New DAG — edit it, then Save & deploy.', []);
  }
  async function check() {
    const v = await api('/api/airflow-studio/validate', { method: 'POST', body: { code: cm.getValue() } });
    if (v.ok) setStatus('ok', `Looks good — DAGs: ${v.dag_ids.join(', ')}`, v.warnings.map((w) => `⚠ ${w}`));
    else setStatus('err', 'Fix these before deploying', [...v.problems, ...v.warnings.map((w) => `⚠ ${w}`)]);
    return v;
  }
  async function save() {
    const name = nameIn.value.trim();
    if (!/^[A-Za-z0-9_][\w.-]*\.py$/.test(name)) { toast('File name must end in .py (letters, numbers, _ - .)', 'err'); nameIn.focus(); return; }
    setStatus('busy', 'Saving and deploying…', []);
    try {
      const res = await api(`/api/airflow-studio/files/${encodeURIComponent(name)}`, { method: 'PUT', body: { code: cm.getValue(), deploy: true } });
      S.current = name; S.ids = res.dag_ids; S.dirty = false;
      S.files = (await api('/api/airflow-studio/files')).files; drawFiles();
      setStatus('busy', 'Deployed — waiting for Airflow to load it…', [res.log, ...res.warnings.map((w) => `⚠ ${w}`)]);
      refreshStatus(true);
    } catch (e) { setStatus('err', 'Not deployed', [e.message]); }
  }
  async function refreshStatus(polling) {
    clearInterval(S.poll);
    if (!S.current || !meta.airflow_url) { if (polling) setStatus('ok', 'Saved. Connect Airflow (AIRFLOW_URL) to see whether it loaded.', []); return; }
    const started = Date.now();
    const tick = async () => {
      let st;
      try { st = await api(`/api/airflow-studio/status/${encodeURIComponent(S.current)}`); } catch (e) { setStatus('err', 'Could not ask Airflow', [e.message]); clearInterval(S.poll); return; }
      if (st.import_errors.length) { setStatus('err', 'Airflow could not import this file', st.import_errors); clearInterval(S.poll); return; }
      const found = st.dags.filter((d) => d.found);
      if (st.dags.length && found.length === st.dags.length) {
        setStatus('ok', `Live in Airflow: ${found.map((d) => d.dag_id + (d.paused ? ' (paused — unpause it in Airflow to schedule)' : '')).join(', ')}`, []);
        clearInterval(S.poll); return;
      }
      if (!polling || Date.now() - started > 180000) {
        setStatus(polling ? 'warn' : '', polling ? 'Airflow has not loaded it yet' : 'Not in Airflow yet', [polling ? 'Airflow scans for new files every 30 s – 5 min (dag_dir_list_interval). Check again shortly.' : 'Save & deploy to send it to Airflow.']);
        clearInterval(S.poll);
      }
    };
    await tick();
    if (polling) S.poll = setInterval(tick, 6000);
  }
  async function trigger() {
    const id = (S.ids || [])[0];
    if (!id) { toast('Open or deploy a DAG first', 'err'); return; }
    try { await api(`/api/workflows/${encodeURIComponent(id)}/trigger`, { method: 'POST', body: {} }); toast(`Triggered ${id}`); }
    catch (e) { toast(e.message, 'err'); }
  }
  async function remove() {
    if (!S.current) return;
    if (!(await confirmDialog(`Delete ${S.current}?`, 'The file is removed from the DAGs folder; Airflow stops showing it after its next scan.', 'Delete'))) return;
    await api(`/api/airflow-studio/files/${encodeURIComponent(S.current)}`, { method: 'DELETE' });
    S.current = null; S.dirty = false; cm.setValue(''); nameIn.value = '';
    S.files = (await api('/api/airflow-studio/files')).files; drawFiles(); setStatus('', 'Deleted.', []);
  }
  drawFiles();
  if (S.files.length) await open(S.files[0].name); else setStatus('', 'Create your first DAG with New DAG.', []);
  const unload = (e) => { if (S.dirty) { e.preventDefault(); e.returnValue = ''; } };
  window.addEventListener('beforeunload', unload);
  return () => { clearInterval(S.poll); window.removeEventListener('beforeunload', unload); };
}
