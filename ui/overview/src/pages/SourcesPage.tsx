/* Data Sources: sample sources with status, freshness and a working "Sync now" (simulated). */
import { useEffect, useMemo, useState } from 'react';
import { CircleAlert, Database, FileText, Info, LoaderCircle, Radio, RefreshCw, Webhook, Cloud } from 'lucide-react';
import { useApp } from '../app/state';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { EmptyState, SourceTag } from '../components/ui/States';
import { demoSources, type SourceRow, type SourceStatus } from '../data/demo/sources';
import { formatValue } from '../lib/format';
import { servedByDataBridge } from '../services/apiClient';

const KIND_ICON = { Database, Stream: Radio, API: Webhook, Files: FileText, SaaS: Cloud };
const STATUS: Record<SourceStatus, { label: string; cls: string }> = {
  healthy: { label: 'Healthy', cls: 'ok' },
  delayed: { label: 'Delayed', cls: 'warn' },
  failed: { label: 'Failed', cls: 'bad' },
  syncing: { label: 'Syncing', cls: 'info' },
};

const ago = (ms: number) => {
  const m = Math.max(0, (Date.now() - ms) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${Math.round(m)} min ago`;
  return `${(m / 60).toFixed(m < 600 ? 1 : 0)} h ago`;
};

/* a live board: the one table it reads, how fresh it is, and which column plays which role */
function LiveSource() {
  const { board, domain, refreshBoard, boardStatus } = useApp();
  if (!board) return null;
  const p = board.payload;
  const roles = Object.entries(p.board.map).filter(([k, v]) => v && !k.endsWith('_mode') && k !== 'rate_scale');
  return (
    <>
      <PageHeader
        title="Data Sources"
        sub={`Where the numbers on “${p.name}” come from.`}
        actions={
          <>
            <SourceTag source="live" />
            <button type="button" className="btn" onClick={refreshBoard} disabled={boardStatus === 'loading'}>
              <RefreshCw size={15} aria-hidden="true" /> {boardStatus === 'loading' ? 'Refreshing…' : 'Refresh now'}
            </button>
          </>
        }
      />
      <div className="grid-3">
        <Card title="Table"><p className="kpi-value mono-sm">{p.board.table}</p><p className="muted small">Read with the {p.engine === 'duckdb' ? 'fast engine (DuckDB)' : 'Spark engine'} in {p.elapsed}s</p></Card>
        <Card title="Data covers"><p className="kpi-value">{p.firstDay} → {p.end}</p><p className="muted small">{p.grain === 'day' ? 'Daily rows' : p.grain === 'week' ? 'One row a week' : 'One row a month'} · {p.entities.length} {domain.entity.plural.toLowerCase()}</p></Card>
        <Card title="Last loaded"><p className="kpi-value">{ago(p.loadedAt * 1000)}</p><p className="muted small">The server keeps results for 5 minutes; Refresh reads the table again.</p></Card>
      </div>
      <Card title="Columns used" sub="Change them in Settings › Board data">
        <ul className="role-list">
          {roles.map(([k, v]) => (
            <li key={k}><span>{k}</span><code>{String(v)}</code></li>
          ))}
        </ul>
        {p.warnings.length > 0 && <ul className="pop-warn">{p.warnings.map((w) => <li key={w}>{w}</li>)}</ul>}
      </Card>
      <p className="notice">
        <Info size={18} aria-hidden="true" />
        <span>
          Connections that load this table are managed in <a href="/#/datahub">Data Hub</a> and <a href="/#/workflows">Workflows</a>.
        </span>
      </p>
    </>
  );
}

export default function SourcesPage() {
  const { board } = useApp();
  return board ? <LiveSource /> : <DemoSources />;
}

function DemoSources() {
  const { domain, fo } = useApp();
  const [rows, setRows] = useState<SourceRow[]>(() => demoSources(domain));
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | SourceStatus>('all');
  const [, tick] = useState(0);
  useEffect(() => setRows(demoSources(domain)), [domain]);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);
  const sync = (id: string) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status: 'syncing' } : x)));
    setTimeout(() => {
      setRows((r) => r.map((x) => (x.id === id ? { ...x, status: 'healthy', lastSync: Date.now(), note: undefined, records24h: x.records24h + Math.round(500 + Math.random() * 4000) } : x)));
    }, 2200);
  };
  const shown = useMemo(() => rows.filter((r) => (filter === 'all' || r.status === filter) && `${r.name} ${r.system}`.toLowerCase().includes(q.toLowerCase())), [rows, filter, q]);
  const counts = (s: SourceStatus) => rows.filter((r) => r.status === s).length;
  return (
    <>
      <PageHeader title="Data Sources" sub={`Where the ${domain.label.toLowerCase()} numbers come from, and how fresh they are.`} actions={<SourceTag source="demo" />} />
      <p className="notice">
        <Info size={18} aria-hidden="true" />
        <span>
          These are sample sources and “Sync now” is simulated.{' '}
          {servedByDataBridge() ? <a href="/#/datahub">Manage real connections in DataBridge Data Hub</a> : 'Real connections are managed in DataBridge → Data Hub.'}
        </span>
      </p>
      <div className="grid-3">
        <Card title="Healthy"><p className="kpi-value" style={{ color: 'var(--pos)' }}>{counts('healthy')}</p></Card>
        <Card title="Delayed"><p className="kpi-value" style={{ color: 'var(--warn)' }}>{counts('delayed')}</p></Card>
        <Card title="Failed"><p className="kpi-value" style={{ color: 'var(--neg)' }}>{counts('failed')}</p></Card>
      </div>
      <Card title="Sources" sub={`${shown.length} of ${rows.length}`}>
        <div className="toolbar">
          <input className="inp" type="search" placeholder="Search sources" aria-label="Search sources" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="chips" role="group" aria-label="Status filter">
            {(['all', 'healthy', 'delayed', 'failed'] as const).map((s) => (
              <button key={s} type="button" className={filter === s ? 'on' : ''} aria-pressed={filter === s} onClick={() => setFilter(s)}>
                {s === 'all' ? 'All' : STATUS[s].label}
              </button>
            ))}
          </div>
        </div>
        {!shown.length ? (
          <EmptyState title="No sources match" />
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th scope="col">Source</th>
                  <th scope="col">Type</th>
                  <th scope="col">Schedule</th>
                  <th scope="col">Last sync</th>
                  <th scope="col" className="num">Records (24 h)</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => {
                  const Icon = KIND_ICON[r.kind];
                  return (
                    <tr key={r.id}>
                      <td>
                        <span className="cell-main">
                          <span className="chip-ico sm" style={{ ['--c' as string]: '#2F6BFF' }} aria-hidden="true"><Icon size={14} /></span>
                          <span>
                            <strong>{r.name}</strong>
                            <small>{r.system}</small>
                            {r.note && (
                              <small className="row-note"><CircleAlert size={12} aria-hidden="true" /> {r.note}</small>
                            )}
                          </span>
                        </span>
                      </td>
                      <td>{r.kind}</td>
                      <td>{r.schedule}</td>
                      <td>{ago(r.lastSync)}</td>
                      <td className="num">{formatValue(r.records24h, 'count', fo)}</td>
                      <td>
                        <span className={`badge ${STATUS[r.status].cls}`}>
                          {r.status === 'syncing' && <LoaderCircle size={12} className="spin" aria-hidden="true" />} {STATUS[r.status].label}
                        </span>
                      </td>
                      <td className="num">
                        <button type="button" className="btn sm" disabled={r.status === 'syncing'} onClick={() => sync(r.id)} aria-label={`Sync ${r.name} now`}>
                          <RefreshCw size={14} aria-hidden="true" /> Sync now
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
