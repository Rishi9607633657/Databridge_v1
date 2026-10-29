/* Dashboards: the real DataBridge dashboards when this page runs inside DataBridge, sample cards otherwise. */
import { useEffect, useState } from 'react';
import { ExternalLink, Info, LayoutGrid, WandSparkles } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { CardSkeleton, EmptyState, SourceTag } from '../components/ui/States';
import { getDashboards, type DashboardRow, type Sourced } from '../services/platformService';
import { HUES, HUE_ORDER } from '../lib/palette';

export default function DashboardsPage() {
  const [res, setRes] = useState<Sourced<DashboardRow[]> | null>(null);
  const [q, setQ] = useState('');
  useEffect(() => {
    getDashboards().then(setRes);
  }, []);
  const live = res?.source === 'live';
  const list = (res?.data ?? []).filter((d) => d.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader
        title="Dashboards"
        sub="Boards built in DataBridge (by hand or with AI)."
        actions={
          <>
            {res && <SourceTag source={live ? 'live' : 'demo'} title={res.note} />}
            {live && (
              <a className="btn primary" href="/#/dashboards">
                <WandSparkles size={16} aria-hidden="true" /> Build with AI
              </a>
            )}
          </>
        }
      />
      {res && !live && (
        <p className="notice">
          <Info size={18} aria-hidden="true" />
          <span>Showing sample dashboards ({res.note}). Open this page from DataBridge while signed in to see yours.</span>
        </p>
      )}
      <div className="toolbar">
        <input className="inp" type="search" placeholder="Search dashboards" aria-label="Search dashboards" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {!res ? (
        <CardSkeleton lines={6} />
      ) : !list.length ? (
        <EmptyState title={q ? 'No dashboards match' : 'No dashboards yet'} action={live ? <a className="btn primary" href="/#/dashboards">Create one in DataBridge</a> : undefined}>
          {q ? 'Try another name.' : 'Build one with AI from any table.'}
        </EmptyState>
      ) : (
        <div className="tiles">
          {list.map((d, i) => {
            const h = HUES[HUE_ORDER[i % HUE_ORDER.length]];
            return (
              <article key={d.id} className="tile">
                <div className="dash-thumb" style={{ background: `linear-gradient(135deg, ${h.from}22, ${h.to}33)` }} aria-hidden="true">
                  {[0.55, 0.8, 0.4, 0.95, 0.7].map((v, k) => (
                    <span key={k} style={{ height: `${v * 100}%`, background: `linear-gradient(${h.from}, ${h.to})` }} />
                  ))}
                </div>
                <div className="tile-head">
                  <LayoutGrid size={18} aria-hidden="true" />
                  <h3>{d.name}</h3>
                </div>
                {d.description && <p>{d.description}</p>}
                <div className="meta">
                  {d.pages != null && <span>{d.pages} page{d.pages === 1 ? '' : 's'}</span>}
                  {d.widgets != null && <span>{d.widgets} widgets</span>}
                  {d.look && <span>Theme: {d.look}</span>}
                </div>
                <div className="tile-foot">
                  <span className="muted small">{[d.owner, d.updated].filter(Boolean).join(' · ')}</span>
                  {live ? (
                    <a className="btn sm" href={`/#/dashboard/${encodeURIComponent(d.id)}`}>
                      Open <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="badge">Sample</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
