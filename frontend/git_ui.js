/* Git folders (like Databricks Repos): credentials, clone, branch switch/create, pull, changes + diff, commit & push, history. */
'use strict';

const GIT_PROVIDERS = [['github', 'GitHub'], ['azure', 'Azure DevOps'], ['gitlab', 'GitLab'], ['bitbucket', 'Bitbucket'], ['other', 'Other (HTTPS)']];

async function gitCredentialsDialog() {
  let cur;
  try { cur = await api('/api/git/credentials'); } catch (e) { toast(e.message, 'err'); return null; }
  if (!cur.git_installed) toast('Git is not installed on the DataBridge machine — install Git for Windows (git-scm.com).', 'err');
  const v = await formDialog({
    title: 'Git credentials', submit: 'Save',
    intro: 'Used for clone, pull and push over HTTPS. Use a personal access token (GitHub: Settings › Developer settings › Tokens; Azure DevOps: User settings › Personal access tokens) with repository read/write access. The token is stored encrypted and never written into repos.',
    fields: [
      { name: 'provider', label: 'Provider', type: 'select', options: GIT_PROVIDERS, value: cur.provider || 'github' },
      { name: 'username', label: 'Git username', value: cur.username || '', placeholder: 'your-git-username', required: false },
      { name: 'email', label: 'Email for commits', value: cur.email || '', placeholder: 'you@company.com', required: false },
      { name: 'token', label: cur.token_set ? `Personal access token (saved ${cur.token_hint} — leave empty to keep)` : 'Personal access token', type: 'password', value: '', required: false },
    ],
  });
  if (!v) return null;
  try { const res = await api('/api/git/credentials', { method: 'PUT', body: v }); toast('Git credentials saved'); return res; } catch (e) { toast(e.message, 'err'); return null; }
}

async function gitCloneDialog(onDone) {
  const creds = await api('/api/git/credentials').catch(() => ({}));
  const v = await formDialog({
    title: 'Add Git folder', submit: 'Clone',
    intro: creds.token_set ? `Clones into Repos/your folder using your saved ${creds.provider || 'Git'} credentials.` : 'Public repos work without a token. For private repos, set Git credentials first.',
    fields: [
      { name: 'url', label: 'Repository URL (HTTPS)', placeholder: 'https://github.com/org/analytics.git' },
      { name: 'name', label: 'Folder name (optional)', placeholder: 'defaults to the repo name', required: false },
      { name: 'branch', label: 'Branch (optional)', placeholder: 'default branch', required: false },
    ],
  });
  if (!v || !v.url) return;
  const t = toast('Cloning…');
  try {
    const res = await api('/api/git/clone', { method: 'POST', body: v });
    if (t && t.remove) t.remove();
    toast(`Cloned into ${res.path}`);
    if (onDone) onDone(res);
  } catch (e) { toast(e.message, 'err'); }
}

/* The Git dialog for a repo (opened from the workspace or a notebook's branch button). */
async function gitDialog(repoPath, onChange) {
  let R;
  try { R = await api(`/api/git/repo?path=${encodeURIComponent(repoPath)}`); } catch (e) { toast(e.message, 'err'); return; }
  await openDialog((close) => {
    const root = el('div', { class: 'dlg git-dlg' });
    let tab = 'changes', sel = new Set(R.changes.map((c) => c.path)), current = R.changes[0] ? R.changes[0].path : null, busy = false;
    const msgIn = el('textarea', { class: 'field git-msg', rows: 3, placeholder: 'Commit message (required)' });
    const act = async (label, fn) => {
      if (busy) return; busy = true;
      root.classList.add('busy'); status.textContent = `${label}…`; status.className = 'git-status busy';
      try { const res = await fn(); if (res && res.root) R = res; status.className = 'git-status ok'; status.textContent = res && res.log ? res.log.split('\n').slice(-2).join(' ') : `${label} done`; if (onChange) onChange(R); }
      catch (e) { status.className = 'git-status err'; status.textContent = e.message; }
      busy = false; root.classList.remove('busy');
      sel = new Set([...sel].filter((p) => R.changes.some((c) => c.path === p)));
      if (!R.changes.some((c) => c.path === current)) current = R.changes[0] ? R.changes[0].path : null;
      draw();
    };
    const post = (url, body) => api(url, { method: 'POST', body: { path: R.root, ...body } });
    const status = el('div', { class: 'git-status', role: 'status', 'aria-live': 'polite' });
    const diffBox = el('div', { class: 'git-diff' });
    async function showDiff(file) {
      current = file;
      root.querySelectorAll('.git-file').forEach((x) => x.classList.toggle('sel', x.dataset.path === file));
      if (!file) { diffBox.replaceChildren(el('p', { class: 'muted' }, 'No changes.')); return; }
      diffBox.replaceChildren(loading('Loading diff…'));
      try {
        const d = await api(`/api/git/diff?path=${encodeURIComponent(R.root)}&file=${encodeURIComponent(file)}`);
        const pre = el('pre', { class: 'git-diff-pre' });
        (d.diff || '(no text changes)').split('\n').forEach((ln) => {
          const cls = ln.startsWith('+++') || ln.startsWith('---') ? 'h' : ln.startsWith('@@') ? 'hunk' : ln.startsWith('+') ? 'add' : ln.startsWith('-') ? 'del' : ln.startsWith('# ── cell') || ln.startsWith(' # ── cell') ? 'cell' : '';
          pre.append(el('span', { class: `dl ${cls}` }, `${ln}\n`));
        });
        diffBox.replaceChildren(el('div', { class: 'git-diff-head' }, el('b', {}, d.file), el('span', { class: 'git-add' }, `+${d.added}`), el('span', { class: 'git-del' }, `−${d.removed}`),
          d.notebook ? el('span', { class: 'muted small' }, 'Notebook: code cells only (outputs are never committed)') : null), pre);
      } catch (e) { diffBox.replaceChildren(errBox(e)); }
    }
    function branchMenu() {
      const s = el('select', { class: 'field git-branch-sel', 'aria-label': 'Branch' },
        el('optgroup', { label: 'Local branches' }, R.local.map((b) => el('option', { value: b, selected: b === R.branch }, b))),
        R.remote.length ? el('optgroup', { label: 'Remote branches' }, R.remote.map((b) => el('option', { value: b }, b))) : null);
      s.addEventListener('change', () => act(`Switching to ${s.value}`, () => post('/api/git/checkout', { branch: s.value })));
      return s;
    }
    async function newBranch() {
      const v = await formDialog({ title: 'Create branch', submit: 'Create', fields: [
        { name: 'branch', label: 'Branch name', placeholder: 'feature/sales-kpis' },
        { name: 'base', label: 'Based on', type: 'select', options: [...R.local, ...R.remote].map((b) => [b, b]), value: R.branch }] });
      if (v && v.branch) act(`Creating ${v.branch}`, () => post('/api/git/checkout', { branch: v.branch, create: true, base: v.base }));
    }
    async function delBranch() {
      const others = R.local.filter((b) => b !== R.branch);
      if (!others.length) { toast('No other local branches to delete'); return; }
      const v = await formDialog({ title: 'Delete branch', submit: 'Delete', fields: [
        { name: 'branch', label: 'Branch', type: 'select', options: others.map((b) => [b, b]) },
        { name: 'remote', label: 'Also delete it on the remote (origin)', type: 'checkbox', value: false }] });
      if (v && v.branch && (await confirmDialog(`Delete branch ${v.branch}?`, v.remote ? 'It is deleted locally and on the remote.' : 'Only the local copy is deleted.', 'Delete'))) {
        act(`Deleting ${v.branch}`, () => post('/api/git/branch/delete', { branch: v.branch, remote: !!v.remote }));
      }
    }
    function changesPane() {
      const list = el('div', { class: 'git-files', role: 'list' });
      const all = el('input', { type: 'checkbox', checked: R.changes.length && sel.size === R.changes.length, 'aria-label': 'Select all changes',
        onChange: (e) => { sel = e.target.checked ? new Set(R.changes.map((c) => c.path)) : new Set(); draw(); } });
      R.changes.forEach((c) => {
        const row = el('div', { class: `git-file${c.path === current ? ' sel' : ''}`, role: 'listitem', 'data-path': c.path },
          el('input', { type: 'checkbox', checked: sel.has(c.path), 'aria-label': `Include ${c.path}`, onChange: (e) => { if (e.target.checked) sel.add(c.path); else sel.delete(c.path); countEl.textContent = `${sel.size} selected`; } }),
          el('button', { type: 'button', class: 'git-file-name', title: c.path, onClick: () => showDiff(c.path) }, c.path),
          el('span', { class: `git-badge s-${c.code}`, title: c.status }, c.code === '?' ? 'N' : c.code));
        list.append(row);
      });
      const countEl = el('span', { class: 'muted small' }, `${sel.size} selected`);
      const left = el('div', { class: 'git-left' },
        el('div', { class: 'git-left-head' }, el('label', { class: 'switch' }, all, el('b', {}, `${R.changes.length} change${R.changes.length === 1 ? '' : 's'}`)), el('span', { class: 'grow' }), countEl),
        R.changes.length ? list : el('p', { class: 'muted git-empty' }, 'Working tree clean — nothing to commit.'),
        el('div', { class: 'git-commit' }, msgIn,
          el('div', { class: 'row', style: { gap: '6px', flexWrap: 'wrap' } },
            btn('Commit & push', () => doCommit(true), { cls: 'primary', ic: 'check' }),
            btn('Commit', () => doCommit(false)),
            btn('Discard', async () => {
              if (!sel.size) { toast('Select files to discard', 'err'); return; }
              if (await confirmDialog(`Discard changes in ${sel.size} file${sel.size === 1 ? '' : 's'}?`, 'Your edits are lost; new files are deleted. This cannot be undone.', 'Discard')) act('Discarding', () => post('/api/git/discard', { files: [...sel] }));
            }, { cls: 'ghost' }))));
      return el('div', { class: 'git-body' }, left, diffBox);
    }
    function doCommit(push) {
      if (!msgIn.value.trim()) { msgIn.focus(); toast('Write a commit message', 'err'); return; }
      if (!sel.size) { toast('Select at least one file', 'err'); return; }
      const message = msgIn.value.trim();
      act(push ? 'Committing and pushing' : 'Committing', async () => { const r = await post('/api/git/commit', { message, files: [...sel], push }); msgIn.value = ''; return r; });
    }
    async function historyPane() {
      const box = el('div', { class: 'git-history' }, loading('Loading history…'));
      try {
        const h = await api(`/api/git/history?path=${encodeURIComponent(R.root)}`);
        box.replaceChildren(el('table', { class: 't' }, el('thead', {}, el('tr', {}, ['Commit', 'Message', 'Author', 'When'].map((x) => el('th', {}, x)))),
          el('tbody', {}, h.map((c) => el('tr', {}, el('td', { class: 'mono' }, c.hash.slice(0, 8)), el('td', {}, c.message), el('td', { class: 'muted' }, c.author), el('td', { class: 'muted' }, c.date.slice(0, 16)))))));
      } catch (e) { box.replaceChildren(errBox(e)); }
      return box;
    }
    async function draw() {
      const sync = R.has_upstream ? `${R.ahead ? `↑${R.ahead} to push` : ''}${R.ahead && R.behind ? ' · ' : ''}${R.behind ? `↓${R.behind} to pull` : ''}` || 'Up to date' : 'No upstream yet — push to publish this branch';
      const head = el('div', { class: 'git-head' },
        el('div', { class: 'git-title' }, el('h2', {}, R.name), el('span', { class: 'muted small mono', title: R.url }, R.url)),
        el('span', { class: 'grow' }), btn('Close', () => close(true), { cls: 'sm' }));
      const bar = el('div', { class: 'git-bar' },
        el('span', { class: 'git-br-ic', 'aria-hidden': 'true' }, '⎇'), branchMenu(),
        btn('New branch', newBranch, { cls: 'sm', ic: 'plus' }), btn('', delBranch, { cls: 'sm ghost icon', ic: 'trash', title: 'Delete a branch' }),
        el('span', { class: `git-sync${R.behind ? ' behind' : ''}` }, sync),
        el('span', { class: 'grow' }),
        btn('Fetch', () => act('Fetching', () => post('/api/git/fetch', {})), { cls: 'sm' }),
        btn('Pull', () => act('Pulling', () => post('/api/git/pull', {})), { cls: 'sm', ic: 'download' }),
        R.ahead || !R.has_upstream ? btn('Push', () => act('Pushing', () => post('/api/git/push', {})), { cls: 'sm' }) : null);
      const tabs = el('div', { class: 'git-tabs', role: 'tablist' }, [['changes', `Changes (${R.changes.length})`], ['history', 'History']].map(([k, l]) =>
        el('button', { type: 'button', role: 'tab', 'aria-selected': String(tab === k), onClick: () => { tab = k; draw(); } }, l)));
      const pane = tab === 'changes' ? changesPane() : await historyPane();
      root.replaceChildren(head, bar, status, tabs, pane);
      if (tab === 'changes') showDiff(current);
    }
    draw();
    return root;
  }, { wide: true });
}

/* Workspace root cards + repo header helpers used by viewWorkspace. */
const WS_SPECIAL = {
  Shared: { ic: 'folder', text: 'Visible to everyone. Put team notebooks here.' },
  Users: { ic: 'user', text: 'Your private folder (admins can see all users).' },
  Repos: { ic: 'branch', text: 'Git folders — clone a repo, work on branches, commit and push.' },
};
