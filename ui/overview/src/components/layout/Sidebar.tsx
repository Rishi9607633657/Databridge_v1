/* Left navigation. Inside DataBridge it is the one shared menu (same groups and order as the workspace sidebar);
   on its own it shows this app's pages plus the domain switcher. Becomes a drawer on small screens. */
import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ArrowUpRight, Pencil, X } from 'lucide-react';
import { useApp } from '../../app/state';
import { listDomains } from '../../domains/registry';
import type { DomainId } from '../../domains/types';
import { iconOf } from '../ui/icons';
import { hue } from '../../lib/palette';
import { Dropdown } from '../ui/Dropdown';
import { NAV } from './nav';
import { CustomDomainDialog } from './CustomDomainDialog';
import { servedByDataBridge } from '../../services/apiClient';
import { useMenu } from './menu';
import { DbIcon } from '../ui/DbIcon';
import logo from '../../assets/logo-mark.png';

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { domainId, setDomainId, custom } = useApp();
  const [editing, setEditing] = useState(false);
  const menu = useMenu();
  const side = useRef<HTMLElement>(null);
  const loc = useLocation();
  useEffect(() => {
    const s = side.current;
    const a = s?.querySelector<HTMLElement>('a.active');
    if (!s || !a || s.scrollHeight <= s.clientHeight) return;
    const top = a.offsetTop;
    const bottom = top + a.offsetHeight;
    if (top < s.scrollTop + 8) s.scrollTop = Math.max(0, top - 56);
    else if (bottom > s.scrollTop + s.clientHeight - 8) s.scrollTop = bottom - s.clientHeight + 56;
  }, [loc.pathname, menu]);
  const domains = listDomains(custom);
  const pick = (id: DomainId) => {
    setDomainId(id);
    onClose();
  };
  return (
    <>
      <div className={`side-scrim ${open ? 'show' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside ref={side} className={`side ${open ? 'open' : ''}`} aria-label="Main navigation">
        <div className="brand">
          <img src={logo} alt="" width={menu ? 34 : 40} height={menu ? 34 : 40} />
          <div>
            <span className="brand-name">
              DataBridge <b>AI</b>
            </span>
            <span className="brand-sub">Unified Data Intelligence</span>
          </div>
          <button type="button" className="icon-btn side-close" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        {menu ? (
          <>
            <a className="side-new" href="/#/home?create=1" onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New
            </a>
            <nav className="nav nav-shared" aria-label="DataBridge">
              {menu.map((g) => (
                <div key={g.label} className="nav-group">
                  <p className="nav-sec" id={`nav-sec-${g.label.toLowerCase()}`}>
                    {g.label}
                  </p>
                  <ul aria-labelledby={`nav-sec-${g.label.toLowerCase()}`}>
                    {g.items.map((n) => (
                      <li key={n.label} className={n.sub ? 'nav-sub' : undefined}>
                        {n.to ? (
                          <NavLink to={n.to} end={n.to === '/'} onClick={onClose} className={({ isActive }) => (isActive ? 'active' : '')}>
                            <DbIcon name={n.icon} />
                            <span>{n.label}</span>
                          </NavLink>
                        ) : (
                          <a href={n.href}>
                            <DbIcon name={n.icon} />
                            <span>{n.label}</span>
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </>
        ) : (
        <>
        <nav className="nav">
          <ul>
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} end={n.to === '/'} onClick={onClose} className={({ isActive }) => (isActive ? 'active' : '')}>
                  <n.icon size={20} strokeWidth={1.9} aria-hidden="true" />
                  <span>{n.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="side-domain">
          <p className="side-h" id="dom-h">Switch Domain</p>
          <Dropdown
            label="Domain"
            value={domainId}
            align="start"
            className="dom-dd"
            onChange={(v) => pick(v as DomainId)}
            options={domains.map((d) => {
              const Icon = iconOf(d.icon);
              return { value: d.id, label: d.label, hint: d.description, icon: <span className="dom-ico" style={{ ['--c' as string]: hue(d.hue).base }}><Icon size={15} /></span> };
            })}
          />
          <ul className="dom-list" aria-labelledby="dom-h">
            {domains.map((d) => {
              const Icon = iconOf(d.icon);
              const h = hue(d.hue);
              return (
                <li key={d.id}>
                  <button type="button" className={d.id === domainId ? 'on' : ''} aria-pressed={d.id === domainId} onClick={() => pick(d.id)}>
                    <span className="dom-ico" style={{ ['--c' as string]: h.base }} aria-hidden="true">
                      <Icon size={15} />
                    </span>
                    <span>{d.label}</span>
                  </button>
                  {d.id === 'custom' && (
                    <button type="button" className="icon-btn xs" onClick={() => setEditing(true)} aria-label="Customize the Custom domain">
                      <Pencil size={13} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        {servedByDataBridge() && (
          <a className="side-back" href="/#/home">
            Open DataBridge workspace <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        )}
        </>
        )}
      </aside>
      <CustomDomainDialog open={editing} onClose={() => setEditing(false)} />
    </>
  );
}
