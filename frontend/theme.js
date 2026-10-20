/* DataBridge theme: light / dark / system. Loaded in <head> so the page never flashes the wrong theme. */
(function () {
  const KEY = 'databridge-theme';
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const read = () => { try { return localStorage.getItem(KEY) || 'system'; } catch { return 'system'; } };
  const resolve = (mode) => (mode === 'system' ? (media.matches ? 'dark' : 'light') : mode);
  function chartDefaults() {
    if (!window.Chart) return;
    const css = getComputedStyle(document.documentElement);
    Chart.defaults.color = css.getPropertyValue('--muted').trim() || '#56607A';
    Chart.defaults.borderColor = css.getPropertyValue('--line').trim() || '#E1E6EF';
  }
  function apply(mode) {
    const theme = resolve(mode);
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    chartDefaults();
    window.dispatchEvent(new CustomEvent('db-theme', { detail: { mode, theme } }));
    document.querySelectorAll('#theme-toggle button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.mode === mode)));
  }
  window.DBTheme = {
    get: read,
    isDark: () => document.documentElement.dataset.theme === 'dark',
    set(mode) { try { localStorage.setItem(KEY, mode); } catch { /* private mode */ } apply(mode); },
    toggle() { this.set(this.isDark() ? 'light' : 'dark'); },
  };
  apply(read());
  media.addEventListener('change', () => { if (read() === 'system') apply('system'); });
  document.addEventListener('DOMContentLoaded', () => {
    const foot = document.querySelector('.sidebar-foot') || document.querySelector('.sidebar');
    if (foot && !document.getElementById('theme-toggle')) {
      const box = document.createElement('div');
      box.id = 'theme-toggle'; box.className = 'theme-toggle'; box.setAttribute('role', 'group'); box.setAttribute('aria-label', 'Theme');
      [['light', '☀', 'Light'], ['dark', '☾', 'Dark'], ['system', 'A', 'Auto']].forEach(([mode, ic, label]) => {
        const b = document.createElement('button');
        b.type = 'button'; b.dataset.mode = mode; b.title = mode === 'system' ? 'Follow Windows light/dark setting' : `${label} theme`;
        b.innerHTML = `<span aria-hidden="true">${ic}</span>${label}`;
        b.addEventListener('click', () => window.DBTheme.set(mode));
        box.append(b);
      });
      foot.parentNode.insertBefore(box, foot);
    }
    apply(read());
  });
}());

/* DataBridge design ("skin"): the look of the whole app, chosen in Admin › Settings › Look & feel.
   Cached in localStorage so the page never flashes the old look; ?skin=<name> previews one in this tab only. */
(function () {
  const KEY = 'databridge-skin';
  const SKINS = ['classic', 'saffron', 'studio', 'midnight', 'ledger'];   // fonts: /static/vendor/fonts (bundled, offline)
  const url = new URLSearchParams(location.search).get('skin');
  const read = () => { try { return localStorage.getItem(KEY) || 'classic'; } catch { return 'classic'; } };
  function apply(name) {
    const skin = SKINS.includes(name) ? name : 'classic';
    document.documentElement.dataset.skin = skin;
    window.dispatchEvent(new CustomEvent('db-skin', { detail: { skin } }));
  }
  window.DBSkin = {
    list: SKINS,
    get: () => document.documentElement.dataset.skin || 'classic',
    /* the server's choice (from /api/auth/me) */
    server(name) { if (url) return; try { localStorage.setItem(KEY, name || 'classic'); } catch { /* private mode */ } apply(name || 'classic'); },
    /* try a look without saving it */
    preview: apply,
  };
  apply(url || read());
}());

