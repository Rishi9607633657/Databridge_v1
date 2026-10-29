/* KPI card: gradient icon tile, label, value, change and a sparkline. The whole card opens the detail view. */
import { Link } from 'react-router-dom';
import type { KpiResult } from '../../services/types';
import { iconOf } from '../ui/icons';
import { hue } from '../../lib/palette';
import { formatValue, type FormatOptions } from '../../lib/format';
import { Delta } from '../ui/Delta';
import { BarSparkline, ForecastSparkline } from './Sparklines';
import { Skeleton } from '../ui/States';

const linkFor = (k: KpiResult): string => {
  switch (k.def.kind) {
    case 'sum': return `/analytics?tab=trend&metric=${k.def.series}`;
    case 'active': return '/analytics?tab=locations';
    case 'forecast': return '/analytics?tab=trend&metric=primary&forecast=1';
    default: return '/analytics?tab=trend&metric=primary';
  }
};

export function KpiCard({ k, fo }: { k: KpiResult; fo: FormatOptions }) {
  const h = hue(k.def.hue);
  const Icon = iconOf(k.def.icon);
  const value = k.display ?? formatValue(k.value, k.format, fo);
  const full = k.format === 'percent' || k.display ? value : formatValue(k.value, k.format, fo, { full: true });
  return (
    <Link to={linkFor(k)} className={`kpi kpi-${k.def.kind}`} style={{ ['--k' as string]: h.base, ['--k-soft' as string]: h.soft }} aria-label={`${k.def.label}: ${full}. ${k.caption}. Open details`}>
      <span className="kpi-tile" style={{ background: `linear-gradient(145deg, ${h.from}, ${h.to})`, boxShadow: `0 10px 22px -10px ${h.to}` }} aria-hidden="true">
        <Icon size={28} strokeWidth={2.2} />
      </span>
      <span className="kpi-label">{k.def.label}</span>
      <span className="kpi-value" title={full}>{value}</span>
      <span className="kpi-foot">
          {k.deltaKind === 'share' ? (
            <span className={`delta ${k.good === false ? 'neg' : k.good ? 'pos' : 'neutral'}`}>{Math.round((k.delta ?? 0) * 100)}%</span>
          ) : (
            <Delta value={k.delta} kind={k.deltaKind === 'points' ? 'points' : 'ratio'} good={k.good} />
          )}
          <span className="kpi-cap">{k.caption}</span>
      </span>
      <span className="kpi-spark">
        {k.line ? <ForecastSparkline actual={k.line.actual} forecast={k.line.forecast} hue={h} /> : <BarSparkline values={k.spark} hue={h} />}
      </span>
    </Link>
  );
}

export function KpiSkeleton() {
  return (
    <div className="kpi kpi-skel" aria-hidden="true">
      <Skeleton w={56} h={56} r={16} />
      <span className="kpi-label"><Skeleton w="60%" h={12} /></span>
      <span className="kpi-value"><Skeleton w="75%" h={24} /></span>
      <span className="kpi-foot"><Skeleton w="50%" h={12} /></span>
    </div>
  );
}
