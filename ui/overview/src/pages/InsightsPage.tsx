/* AI Insights: every rule-based insight for the current view, filterable by kind, plus the anomaly list. */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, RefreshCw } from 'lucide-react';
import { useApp } from '../app/state';
import { useData } from '../app/data';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { CardSkeleton, EmptyState, SourceTag } from '../components/ui/States';
import { InsightTile } from '../components/widgets/InsightsCard';
import { Delta } from '../components/ui/Delta';
import type { InsightKind } from '../services/insightsService';
import { fmtDay } from '../lib/dates';
import { formatValue } from '../lib/format';

const KINDS: { id: 'all' | InsightKind; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'growth', label: 'Growth' },
  { id: 'behavior', label: 'Behaviour' },
  { id: 'anomaly', label: 'Anomalies' },
  { id: 'forecast', label: 'Forecast' },
  { id: 'mover', label: 'Movers' },
  { id: 'leader', label: 'Leaders' },
  { id: 'risk', label: 'Risks' },
];

export default function InsightsPage() {
  const { domain, fo, resolved } = useApp();
  const { insights, overview, reload } = useData();
  const nav = useNavigate();
  const [kind, setKind] = useState<'all' | InsightKind>('all');
  const list = insights.filter((i) => kind === 'all' || i.kind === kind);
  return (
    <>
      <PageHeader
        title="AI Insights"
        sub={`What changed for ${domain.label} · ${resolved.text}`}
        actions={
          <>
            <SourceTag source={domain.live ? 'live' : 'demo'} />
            <button type="button" className="btn" onClick={reload}>
              <RefreshCw size={15} aria-hidden="true" /> Recompute
            </button>
          </>
        }
      />
      <p className="notice">
        <Info size={18} aria-hidden="true" />
        <span>Insights are rule-based: growth by region, behaviour, anomalies (each city vs its usual weekday level), a 7-day forecast and movers. They are computed from the {domain.live ? 'live' : 'demo'} data shown on this page.</span>
      </p>
      <div className="toolbar">
        <div className="chips" role="group" aria-label="Insight type">
          {KINDS.map((k) => (
            <button key={k.id} type="button" className={kind === k.id ? 'on' : ''} aria-pressed={kind === k.id} onClick={() => setKind(k.id)}>
              {k.label} {k.id !== 'all' && `(${insights.filter((i) => i.kind === k.id).length})`}
            </button>
          ))}
        </div>
      </div>
      {!overview ? (
        <CardSkeleton lines={6} />
      ) : !list.length ? (
        <EmptyState title="No insights of this type for this period" />
      ) : (
        <div className="ins-grid wide" style={{ marginBottom: 16 }}>
          {list.map((x) => (
            <InsightTile key={x.id} x={x} onOpen={(to) => nav(to)} />
          ))}
        </div>
      )}
      <Card title="Anomalies found" sub="Days where a city was at least 30% away from its usual level for that weekday">
        {!overview ? (
          <CardSkeleton />
        ) : !overview.anomalies.length ? (
          <EmptyState title="No anomalies in this period" />
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th scope="col">Day</th>
                  <th scope="col">Where</th>
                  <th scope="col" className="num">{domain.series.primary.label}</th>
                  <th scope="col" className="num">Usual level</th>
                  <th scope="col" className="num">Difference</th>
                </tr>
              </thead>
              <tbody>
                {overview.anomalies.map((a) => (
                  <tr key={a.day}>
                    <td>{fmtDay(a.day, { weekday: true, year: true })}</td>
                    <td>{a.cities.join(', ')} · {a.entities} {a.entities === 1 ? domain.entity.singular.toLowerCase() : domain.entity.plural.toLowerCase()}</td>
                    <td className="num">{formatValue(a.value, domain.series.primary.format, fo)}</td>
                    <td className="num">{formatValue(a.expected, domain.series.primary.format, fo)}</td>
                    <td className="num"><Delta value={a.change} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
