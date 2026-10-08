/* Resizable panels: drag the edge of the main sidebar or the notebook side panel (double-click to reset). */
(function () {
  const KEY = 'databridge-sizes';
  const sizes = (() => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } })();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(sizes)); } catch { /* ignore */ } };
  const root = document.documentElement.style;
  const apply = () => {
    if (sizes.sidebar) root.setProperty('--sidebar-w', `${sizes.sidebar}px`); else root.removeProperty('--sidebar-w');
    if (sizes.nbside) root.setProperty('--nbside-w', `${sizes.nbside}px`); else root.removeProperty('--nbside-w');
    if (sizes.cattree) root.setProperty('--cattree-w', `${sizes.cattree}px`); else root.removeProperty('--cattree-w');
  };
  function handle(target, key, side, min, max, def) {
    if (!target || target.querySelector(':scope > .resize-handle')) return;
    const h = document.createElement('div');
    h.className = `resize-handle ${side}`; h.setAttribute('role', 'separator'); h.setAttribute('aria-orientation', 'vertical');
    h.title = 'Drag to resize · double-click to reset'; h.tabIndex = 0;
    h.addEventListener('pointerdown', (e) => {
      e.preventDefault(); h.setPointerCapture(e.pointerId); document.body.classList.add('resizing');
      const start = e.clientX, w0 = target.getBoundingClientRect().width;
      const move = (ev) => { const dx = ev.clientX - start; sizes[key] = Math.round(Math.max(min, Math.min(max, side === 'right' ? w0 + dx : w0 - dx))); apply(); };
      const up = () => { h.removeEventListener('pointermove', move); h.removeEventListener('pointerup', up); document.body.classList.remove('resizing'); save(); window.dispatchEvent(new Event('resize')); };
      h.addEventListener('pointermove', move); h.addEventListener('pointerup', up);
    });
    h.addEventListener('dblclick', () => { delete sizes[key]; apply(); save(); window.dispatchEvent(new Event('resize')); });
    h.addEventListener('keydown', (e) => {
      const d = { ArrowLeft: side === 'right' ? -16 : 16, ArrowRight: side === 'right' ? 16 : -16 }[e.key];
      if (!d) return;
      e.preventDefault(); sizes[key] = Math.max(min, Math.min(max, (sizes[key] || def) + d)); apply(); save();
    });
    target.append(h);
  }
  apply();
  document.addEventListener('DOMContentLoaded', () => {
    handle(document.querySelector('.sidebar'), 'sidebar', 'right', 64, 380, 232);
    new MutationObserver(() => { handle(document.querySelector('.nb-side'), 'nbside', 'left', 220, 640, 300); handle(document.querySelector('.cat-tree'), 'cattree', 'right', 200, 520, 300); })
      .observe(document.body, { childList: true, subtree: true });
  });
}());
