import { useEffect, useState } from 'react';
import { Menu, Moon, Pencil, Plus, Radio, Sun } from 'lucide-react';
import { useApp } from '../../app/state';
import { SearchBox } from './SearchBox';
import { DateRangePicker } from './DateRangePicker';
import { DataPill, Notifications, UserMenu } from './HeaderMenus';
import { useMenu } from './menu';
import { Dropdown } from '../ui/Dropdown';
import { CustomDomainDialog } from './CustomDomainDialog';
import { listDomains } from '../../domains/registry';
import type { DomainId } from '../../domains/types';
import { iconOf } from '../ui/icons';
import { hue } from '../../lib/palette';
import { boardUrl, listBoards, type BoardSummary } from '../../board/board';

/* What the page shows: one of your live boards (real tables) or a demo domain. Used in the header when the
   sidebar holds the shared DataBridge menu. */
function DomainSwitch() {
  const { domainId, setDomainId, custom, boardId, board, me } = useApp();
  const [editing, setEditing] = useState(false);
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  useEffect(() => {
    listBoards().then(setBoards);
  }, []);
  const canBuild = !me || me.role !== 'viewer';
  const value = boardId ? `board:${boardId}` : `demo:${domainId}`;
  const options = [
    ...boards.map((b) => ({
      value: `board:${b.id}`,
      label: b.name,
      hint: `Live · ${b.table ?? 'your table'}`,
      icon: <span className="dom-ico live" style={{ ['--c' as string]: hue('green').base }}><Radio size={15} /></span>,
    })),
    ...(boardId && !boards.some((b) => b.id === boardId) ? [{ value: `board:${boardId}`, label: board?.domain.label ?? 'Live board', hint: 'Live', icon: <span className="dom-ico live" style={{ ['--c' as string]: hue('green').base }}><Radio size={15} /></span> }] : []),
    ...listDomains(custom).map((d) => {
      const Icon = iconOf(d.icon);
      return { value: `demo:${d.id}`, label: d.label, hint: `Demo data · ${d.description}`, icon: <span className="dom-ico" style={{ ['--c' as string]: hue(d.hue).base }}><Icon size={15} /></span> };
    }),
  ];
  return (
    <>
      <Dropdown
        label="Data shown"
        value={value}
        className="hdr-dom"
        align="end"
        onChange={(v) => {
          const [kind, id] = v.split(':');
          if (kind === 'board') {
            if (id !== boardId) location.assign(boardUrl(id));
            return;
          }
          setDomainId(id as DomainId);
          if (boardId) location.assign(boardUrl(null));
        }}
        options={options}
        footer={(close) => (
          <>
            {canBuild && (
              <a className="dd-foot" href="/#/dashboards?ai=1&board=1" onClick={() => close()}>
                <Plus size={14} aria-hidden="true" /> New full-page Overview from your tables
              </a>
            )}
            {!boardId && (
              <button
                type="button"
                className="dd-foot"
                onClick={() => {
                  close();
                  setEditing(true);
                }}
              >
                <Pencil size={14} aria-hidden="true" /> Customize the Custom domain
              </button>
            )}
          </>
        )}
      />
      <CustomDomainDialog open={editing} onClose={() => setEditing(false)} />
    </>
  );
}

export function Header({ onMenu }: { onMenu: () => void }) {
  const { theme, toggleTheme } = useApp();
  const shared = useMenu() !== null;
  return (
    <header className="top">
      <button type="button" className="icon-btn hdr menu-btn" onClick={onMenu} aria-label="Open menu">
        <Menu size={20} />
      </button>
      <SearchBox />
      {shared && (
        <div className="hdr-dom-slot">
          <DomainSwitch />
        </div>
      )}
      <div className="top-right">
        <DateRangePicker />
        <DataPill />
        <Notifications />
        <button type="button" className="icon-btn hdr hdr-theme" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <UserMenu />
      </div>
    </header>
  );
}
