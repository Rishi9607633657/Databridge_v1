/* Header search (Ctrl+K): pages, the current domain's entities, categories and reports. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useApp } from '../../app/state';
import { useData } from '../../app/data';
import { NAV } from './nav';
import { useMenu } from './menu';
import { REPORTS } from '../../pages/reportDefs';

interface Hit {
  id: string;
  group: string;
  label: string;
  sub?: string;
  go: () => void;
}

export function SearchBox() {
  const { domain, setSelectedEntityId } = useApp();
  const { overview } = useData();
  const nav = useNavigate();
  const menu = useMenu();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        input.current?.focus();
        setOpen(true);
      }
    };
    const onDown = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, []);

  const hits = useMemo<Hit[]>(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    const has = (...t: (string | undefined)[]) => t.some((x) => x && x.toLowerCase().includes(s));
    const out: Hit[] = [];
    if (menu) {
      menu.forEach((g) =>
        g.items
          .filter((n) => has(n.label, n.keywords, g.label))
          .forEach((n) => out.push({ id: `p${n.to ?? n.href}`, group: 'Pages', label: n.label, sub: g.label, go: () => (n.to ? nav(n.to) : location.assign(n.href ?? '/')) })),
      );
    } else {
      NAV.filter((n) => has(n.label, n.keywords)).forEach((n) => out.push({ id: `p${n.to}`, group: 'Pages', label: n.label, go: () => nav(n.to) }));
    }
    (overview?.allEntities ?? [])
      .filter((x) => has(x.entity.name, x.entity.city.name, x.entity.area))
      .slice(0, 6)
      .forEach((x) => out.push({ id: x.entity.id, group: domain.entity.plural, label: x.entity.name, sub: `#${x.rank} · ${x.entity.city.name}`, go: () => setSelectedEntityId(x.entity.id) }));
    domain.categories.items.filter((c) => has(c.label)).forEach((c) => out.push({ id: `c${c.id}`, group: 'Categories', label: c.label, sub: domain.categories.title, go: () => nav('/analytics?tab=breakdown&dim=category') }));
    REPORTS.filter((r) => has(r.name, r.description)).forEach((r) => out.push({ id: `r${r.id}`, group: 'Reports', label: r.name, go: () => nav('/reports') }));
    return out.slice(0, 14);
  }, [q, overview, domain, nav, setSelectedEntityId, menu]);

  const choose = (h: Hit) => {
    h.go();
    setOpen(false);
    setQ('');
    input.current?.blur();
  };

  return (
    <div className="search" ref={box} role="search">
      <Search size={18} className="search-ico" aria-hidden="true" />
      <input
        ref={input}
        type="search"
        value={q}
        placeholder={domain.searchHint}
        aria-label="Search"
        aria-expanded={open && hits.length > 0}
        aria-controls="search-results"
        aria-activedescendant={open && hits[active] ? `sr-${hits[active].id}` : undefined}
        role="combobox"
        autoComplete="off"
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(hits.length - 1, a + 1)); }
          if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
          if (e.key === 'Enter' && hits[active]) { e.preventDefault(); choose(hits[active]); }
          if (e.key === 'Escape') { setOpen(false); input.current?.blur(); }
        }}
      />
      <kbd aria-hidden="true">Ctrl + K</kbd>
      {open && q.trim() && (
        <div className="search-pop" id="search-results" role="listbox" aria-label="Search results">
          {hits.length === 0 ? (
            <p className="search-empty">No matches for “{q}”.</p>
          ) : (
            hits.map((h, i) => (
              <div key={h.id}>
                {(i === 0 || hits[i - 1].group !== h.group) && <p className="search-group">{h.group}</p>}
                <button type="button" id={`sr-${h.id}`} role="option" aria-selected={i === active} className={i === active ? 'on' : ''} onMouseEnter={() => setActive(i)} onClick={() => choose(h)}>
                  <span>{h.label}</span>
                  {h.sub && <small>{h.sub}</small>}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
