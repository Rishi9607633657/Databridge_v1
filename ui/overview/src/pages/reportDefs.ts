/* Report templates. Each one builds its rows from the current overview (domain, dates and region filters apply). */
import type { DomainConfig } from '../domains/types';
import type { Overview } from '../services/types';
import { isoOf } from '../lib/dates';
import { regionLabel } from '../domains/places';

export interface ReportDef {
  id: string;
  name: string;
  description: string;
  cadence: 'Daily' | 'Weekly' | 'Monthly';
  rows: (o: Overview, d: DomainConfig) => (string | number | null)[][];
}

export const REPORTS: ReportDef[] = [
  {
    id: 'daily',
    name: 'Daily performance',
    description: 'Day-by-day main metrics with the previous period alongside',
    cadence: 'Daily',
    rows: (o, d) => {
      const m = d.metrics ?? ['primary', 'secondary', 'people'];
      const sec = m.includes('secondary');
      const ppl = m.includes('people');
      return [
        ['date', d.series.primary.label, ...(sec ? [d.series.secondary.label] : []), ...(ppl ? [d.series.people.label] : []), `previous ${d.series.primary.label}`],
        ...o.daily.map((p) => [isoOf(p.day), Math.round(p.primary), ...(sec ? [Math.round(p.secondary)] : []), ...(ppl ? [Math.round(p.people)] : []), p.prevPrimary == null ? null : Math.round(p.prevPrimary)]),
      ];
    },
  },
  {
    id: 'locations',
    name: 'Location ranking',
    description: 'Every location ranked by the main metric, with growth and status',
    cadence: 'Weekly',
    rows: (o, d) => [
      ['rank', d.entity.singular, 'city', 'country', 'region', d.series.primary.label, 'growth_vs_previous', d.series.secondary.label, 'open'],
      ...o.entities.map((x) => [x.rank, x.entity.name, x.entity.city.name, x.entity.country, regionLabel(x.entity.region), Math.round(x.value), x.growth == null ? null : Number((x.growth * 100).toFixed(1)), Math.round(x.secondary), x.openToday ? 'yes' : 'no']),
    ],
  },
  {
    id: 'categories',
    name: 'Category mix',
    description: 'Value and share by category, with the change in share',
    cadence: 'Monthly',
    rows: (o, d) => [
      ['category', d.series.primary.label, 'share_pct', 'previous_share_pct'],
      ...o.categories.map((c) => [c.def.label, Math.round(c.value), Number((c.share * 100).toFixed(1)), Number((c.prevShare * 100).toFixed(1))]),
    ],
  },
  {
    id: 'segments',
    name: 'Segment distribution',
    description: 'People by segment and by region',
    cadence: 'Monthly',
    rows: (o, d) => [
      ['type', 'name', d.series[d.segments.series ?? 'people'].label, 'share_pct'],
      ...o.segments.map((s) => ['segment', s.def.label, Math.round(s.value), Number((s.share * 100).toFixed(1))]),
      ...o.segmentsByRegion.map((s) => ['region', s.def.label, Math.round(s.value), Number((s.share * 100).toFixed(1))]),
    ],
  },
  {
    id: 'regions',
    name: 'Regional summary',
    description: 'Locations, activity and growth per region',
    cadence: 'Weekly',
    rows: (o, d) => [
      ['region', d.entity.plural, 'open', d.series.primary.label, 'growth_vs_previous'],
      ...o.regions.map((r) => [r.label, r.entities, r.active, Math.round(r.value), r.growth == null ? null : Number((r.growth * 100).toFixed(1))]),
    ],
  },
];
