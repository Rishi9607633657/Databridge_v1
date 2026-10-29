/* Rule-based insights computed from the overview numbers (growth, behaviour, anomalies, forecast,
   movers). They are labelled as generated from demo data in the UI; nothing is invented beyond the data. */
import type { Overview } from './types';
import { formatDelta, formatValue, formatPoints, type FormatOptions } from '../lib/format';
import { fmtDay } from '../lib/dates';
import type { IconKey } from '../components/ui/icons';
import type { Hue } from '../domains/types';

export type InsightKind = 'growth' | 'behavior' | 'anomaly' | 'forecast' | 'mover' | 'risk' | 'leader';

export interface Insight {
  id: string;
  kind: InsightKind;
  tone: 'positive' | 'info' | 'negative';
  hue: Hue;
  icon: IconKey;
  title: string;
  text: string;
  /** where to look for the detail */
  link?: { label: string; to: string };
}

/** "Active accounts" → "Account", "Customers" → "Customer" */
const singular = (label: string) => {
  const w = label.trim().split(/\s+/).pop() || label;
  const s = w.endsWith('ies') ? `${w.slice(0, -3)}y` : w.endsWith('s') ? w.slice(0, -1) : w;
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export function buildInsights(o: Overview, fo: FormatOptions): Insight[] {
  const d = o.query.domain;
  const P = d.series.primary;
  const out: Insight[] = [];
  const fv = (v: number) => formatValue(v, P.format, fo);
  const period = 'the previous period';

  /* 1. growth by region */
  const reg = o.regions.filter((r) => r.growth != null && r.value > 0).sort((a, b) => (b.growth ?? 0) - (a.growth ?? 0));
  if (reg.length) {
    const r = reg[0];
    out.push({
      id: `growth-${r.id}`, kind: 'growth', tone: (r.growth ?? 0) >= 0 ? 'positive' : 'negative', hue: (r.growth ?? 0) >= 0 ? 'green' : 'rose', icon: 'chart',
      title: `${P.label} Growth`,
      text: `${r.label} ${P.noun} ${(r.growth ?? 0) >= 0 ? 'up' : 'down'} ${formatDelta(r.growth)} vs ${period}.`,
      link: { label: 'Open analytics', to: '/analytics?tab=breakdown&dim=region' },
    });
  }

  /* 2. behaviour: how often people come back (transactions per person) or the segment that moved most */
  const S = d.series.secondary;
  const pe = d.series.people;
  const perNow = o.totals.people ? o.totals.secondary / o.totals.people : 0;
  const perPrev = o.prevTotals.people ? o.prevTotals.secondary / o.prevTotals.people : 0;
  if (perNow && perPrev && pe.unique) {
    const ch = perNow / perPrev - 1;
    out.push({
      id: 'behavior-frequency', kind: 'behavior', tone: ch >= 0 ? 'info' : 'negative', hue: 'blue', icon: 'users',
      title: `${singular(pe.label)} Behavior`,
      text: `${S.label} per ${pe.noun.replace(/s$/, '')} ${ch >= 0 ? 'rose' : 'fell'} ${formatDelta(ch)} to ${perNow.toFixed(2)} in the last ${o.query.range.days} days.`,
    });
  }
  const seg = o.segments.filter((s) => s.prevShare > 0).sort((a, b) => Math.abs(b.share - b.prevShare) - Math.abs(a.share - a.prevShare))[0];
  if (seg) {
    const ch = seg.share - seg.prevShare;
    out.push({
      id: `segment-${seg.def.id}`, kind: 'behavior', tone: 'info', hue: 'blue', icon: 'users',
      title: `${d.segments.title} shift`,
      text: `${seg.def.label} is now ${(seg.share * 100).toFixed(1)}% of ${d.segments.noun} (${ch >= 0 ? 'up' : 'down'} ${formatPoints(ch)} vs ${period}).`,
    });
  }

  /* 3. anomalies found in the data */
  for (const a of o.anomalies.slice(0, 2)) {
    const drop = a.change < 0;
    const where = a.cities.length === 1 ? a.cities[0] : a.cities.length === 2 ? `${a.cities[0]} and ${a.cities[1]}` : `${a.cities[0]} and ${a.cities.length - 1} more cities`;
    out.push({
      id: `anomaly-${a.day}`, kind: 'anomaly', tone: drop ? 'negative' : 'info', hue: drop ? 'rose' : 'violet', icon: 'alert',
      title: drop ? 'Anomaly Detected' : 'Unusual Spike',
      text: `${P.label} in ${where} was ${formatDelta(a.change)} ${drop ? 'below' : 'above'} usual on ${fmtDay(a.day)} (${a.entities} ${a.entities === 1 ? d.entity.singular.toLowerCase() : d.entity.plural.toLowerCase()}).`,
      link: { label: 'Open monitoring', to: '/monitoring' },
    });
  }

  /* 4. forecast */
  if (o.forecast.delta != null) {
    out.push({
      id: 'forecast', kind: 'forecast', tone: o.forecast.delta >= 0 ? 'positive' : 'negative', hue: o.forecast.delta >= 0 ? 'teal' : 'orange', icon: 'target',
      title: `${P.label} Forecast`,
      text: `Next 7 days: ${fv(o.forecast.total)} projected, ${o.forecast.delta >= 0 ? 'up' : 'down'} ${formatDelta(o.forecast.delta)} on the last 7 days.`,
    });
  }

  /* 5. category movers */
  const cats = o.categories.filter((c) => c.growth != null).sort((a, b) => (b.growth ?? 0) - (a.growth ?? 0));
  if (cats.length > 1) {
    const best = cats[0];
    const worst = cats[cats.length - 1];
    out.push({
      id: `mover-${best.def.id}`, kind: 'mover', tone: 'positive', hue: 'violet', icon: 'trend',
      title: 'Fastest Growing',
      text: `${best.def.label} share grew ${formatDelta(best.growth)} to ${(best.share * 100).toFixed(1)}% of ${P.noun}; ${worst.def.label} ${(worst.growth ?? 0) < 0 ? `slipped ${formatDelta(worst.growth)}` : 'grew least'}.`,
      link: { label: 'See categories', to: '/analytics?tab=breakdown&dim=category' },
    });
  }

  /* 6. leader and laggard */
  const lead = o.entities[0];
  if (lead && o.totals.primary > 0) {
    out.push({
      id: `leader-${lead.entity.id}`, kind: 'leader', tone: 'positive', hue: 'green', icon: 'crown',
      title: `Top ${d.entity.singular}`,
      text: `${lead.entity.name} leads with ${fv(lead.value)}, ${(lead.share * 100).toFixed(1)}% of ${P.noun} in this view.`,
    });
  }
  const median = o.entities.length ? o.entities[Math.floor(o.entities.length / 2)].value : 0;
  const lag = o.entities.filter((e) => e.value >= median && e.growth != null && e.openToday).sort((a, b) => (a.growth ?? 0) - (b.growth ?? 0))[0];
  if (lag && (lag.growth ?? 0) < -0.03) {
    out.push({
      id: `risk-${lag.entity.id}`, kind: 'risk', tone: 'negative', hue: 'orange', icon: 'alert',
      title: `${d.entity.singular} Needs Attention`,
      text: `${lag.entity.name} is down ${formatDelta(lag.growth)} vs ${period} while most ${d.entity.plural.toLowerCase()} grew.`,
    });
  }
  return out;
}

/** The three cards shown on the overview: growth, behaviour, anomaly first (like the reference layout), then rotate. */
export function insightPage(list: Insight[], page: number, size = 3): Insight[] {
  if (list.length <= size) return list;
  const first = ['growth', 'behavior', 'anomaly'] as InsightKind[];
  const ordered = [
    ...first.map((k) => list.find((x) => x.kind === k)).filter((x): x is Insight => !!x),
    ...list.filter((x) => !first.includes(x.kind) || list.filter((y) => y.kind === x.kind)[0] !== x),
  ];
  const start = (page * size) % ordered.length;
  return Array.from({ length: size }, (_, i) => ordered[(start + i) % ordered.length]);
}
