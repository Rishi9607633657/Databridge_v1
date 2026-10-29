/* Header menus: where the data comes from, notifications, user. */
import { Link } from 'react-router-dom';
import { Bell, ChevronDown, ExternalLink, Keyboard, Settings as Cog } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../../app/state';
import { useData } from '../../app/data';
import { Popover } from '../ui/Popover';
import { Modal } from '../ui/Modal';
import { fmtTime } from '../../lib/dates';
import { servedByDataBridge } from '../../services/apiClient';
import { retryLiveHealth } from '../../services/healthService';

export function DataPill() {
  const { health, overview } = useData();
  const { board, domain, refreshBoard, boardStatus, me } = useApp();
  const live = health?.source === 'live';
  if (domain.live && board) {
    const p = board.payload;
    const loaded = new Date(p.loadedAt * 1000);
    return (
      <Popover
        align="end"
        label="Where the numbers come from"
        trigger={(t) => (
          <button type="button" {...t} className="data-pill live" aria-label={`Live data from ${p.board.table}. Details`}>
            <span className="dot live" aria-hidden="true" />
            <span>Live Data</span>
            <ChevronDown size={15} aria-hidden="true" />
          </button>
        )}
      >
        {(close) => (
          <div className="data-pop">
            <p className="pop-title">Live from {p.board.table}</p>
            <ul>
              <li><span className="dot live" /> <b>Business metrics</b> {p.entities.length} {domain.entity.plural.toLowerCase()}, {p.firstDay} to {p.end}. Updated {fmtTime(loaded)} ({p.engine === 'duckdb' ? 'fast engine' : 'Spark'}, {p.elapsed}s{p.cached ? ', cached' : ''}).</li>
              <li><span className="dot live" /> <b>Events and insights</b> worked out from the same data (daily totals, unusual days, leaders).</li>
              <li><span className={`dot ${live ? 'live' : 'demo'}`} /> <b>System health</b> {live ? 'live from the DataBridge host.' : 'simulated.'}</li>
            </ul>
            {p.warnings.length > 0 && <ul className="pop-warn">{p.warnings.map((w) => <li key={w}>{w}</li>)}</ul>}
            <div className="pop-row">
              <button type="button" className="btn sm" disabled={boardStatus === 'loading'} onClick={() => { refreshBoard(); close(); }}>
                {boardStatus === 'loading' ? 'Refreshing…' : 'Refresh now'}
              </button>
              {(!me || me.role !== 'viewer') && <Link className="btn sm" to="/settings" onClick={() => close()}>Change columns</Link>}
            </div>
            {overview && overview.source !== 'live' && <p className="muted small">Loading…</p>}
          </div>
        )}
      </Popover>
    );
  }
  return (
    <Popover
      align="end"
      label="Data sources on this page"
      trigger={(p) => (
        <button type="button" {...p} className="data-pill" aria-label="Demo data. Where the numbers come from">
          <span className="dot demo" aria-hidden="true" />
          <span>Demo Data</span>
          <ChevronDown size={15} aria-hidden="true" />
        </button>
      )}
    >
      {() => (
        <div className="data-pop">
          <p className="pop-title">Where the numbers come from</p>
          <ul>
            <li><span className="dot demo" /> <b>Business metrics</b> KPIs, charts, globe and buildings: demo data generated in the browser (same numbers on every reload).</li>
            <li><span className={`dot ${live ? 'live' : 'demo'}`} /> <b>System health</b> {live ? 'live from the DataBridge host.' : 'simulated. Open this page inside DataBridge while signed in for live host metrics.'}</li>
            <li><span className="dot demo" /> <b>Recent events</b> simulated stream.</li>
            <li><span className="dot mixed" /> <b>Dashboards, catalog, users</b> live from DataBridge when available, sample rows otherwise (each page says which).</li>
          </ul>
          <p className="muted small">To use real data, replace <code>demoMetricsService</code> with an API client (see the README).</p>
          {!live && (
            <button type="button" className="btn sm" onClick={retryLiveHealth}>Retry live health</button>
          )}
        </div>
      )}
    </Popover>
  );
}

export function Notifications() {
  const { events, insights, readIds, markRead } = useData();
  const items = [
    ...events.filter((e) => e.type === 'alert').slice(0, 6).map((e) => ({ id: e.id, title: e.text, time: fmtTime(e.time), tone: 'warn' as const })),
    ...insights.filter((i) => i.tone === 'negative').map((i) => ({ id: i.id, title: `${i.title}: ${i.text}`, time: 'Insight', tone: 'neg' as const })),
  ];
  const unread = items.filter((i) => !readIds.has(i.id)).length;
  return (
    <Popover
      align="end"
      label="Notifications"
      trigger={(p) => (
        <button type="button" {...p} className="icon-btn hdr" aria-label={`Notifications, ${unread} unread`}>
          <Bell size={20} />
          {unread > 0 && <span className="badge-count" aria-hidden="true">{unread > 9 ? '9+' : unread}</span>}
        </button>
      )}
    >
      {() => (
        <div className="notif-pop">
          <div className="pop-row">
            <p className="pop-title">Notifications</p>
            <button type="button" className="link-btn sm" onClick={() => markRead(items.map((i) => i.id))} disabled={!unread}>Mark all read</button>
          </div>
          {items.length === 0 ? (
            <p className="muted small">You are all caught up.</p>
          ) : (
            <ul>
              {items.map((i) => (
                <li key={i.id} className={`${readIds.has(i.id) ? 'read' : ''} ${i.tone}`}>
                  <span className="dot" aria-hidden="true" />
                  <span>
                    {i.title}
                    <small>{i.time}</small>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/monitoring" className="link-btn sm">Open Monitoring</Link>
        </div>
      )}
    </Popover>
  );
}

export function UserMenu() {
  const { me } = useApp();
  const [keys, setKeys] = useState(false);
  const name = me?.name || me?.username || 'Admin';
  const initial = name.trim().charAt(0).toUpperCase() || 'A';
  return (
    <>
      <Popover
        align="end"
        label="Account"
        trigger={(p) => (
          <button type="button" {...p} className="avatar" aria-label={`Account menu for ${name}`}>
            {initial}
          </button>
        )}
      >
        {(close) => (
          <div className="user-pop">
            <p className="pop-title">{name}</p>
            <p className="muted small">{me ? `Signed in to DataBridge · ${me.role?.replace('_', ' ')}` : 'Demo session'}</p>
            <Link to="/settings" onClick={close} className="menu-item"><Cog size={16} /> Settings</Link>
            <button type="button" className="menu-item" onClick={() => { close(); setKeys(true); }}><Keyboard size={16} /> Keyboard shortcuts</button>
            {servedByDataBridge() && <a className="menu-item" href="/#/home"><ExternalLink size={16} /> Open DataBridge workspace</a>}
          </div>
        )}
      </Popover>
      <Modal open={keys} onClose={() => setKeys(false)} title="Keyboard shortcuts">
        <dl className="keys">
          <dt><kbd>Ctrl</kbd> + <kbd>K</kbd></dt><dd>Search</dd>
          <dt><kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd></dt><dd>Rotate the globe (when it has focus)</dd>
          <dt><kbd>Home</kbd></dt><dd>Reset the globe</dd>
          <dt><kbd>Esc</kbd></dt><dd>Close menus and panels</dd>
          <dt><kbd>Tab</kbd></dt><dd>Move between controls</dd>
        </dl>
      </Modal>
    </>
  );
}
