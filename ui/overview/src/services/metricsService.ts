/* Demo metrics service: aggregates the generated demo dataset for a domain, date range and region.
   It implements the same MetricsService interface a live API client would (see services/types.ts). */
import type { DomainConfig, ShareDef } from '../domains/types';
import { HUBS, REGION_IDS, regionHue, regionLabel } from '../domains/places';
import { datasetFor, type Dataset } from '../data/demo/generator';
import { weekdayOf, type ResolvedRange } from '../lib/dates';
import type {
  AnomalyFinding, CityStat, DailyPoint, EntityStat, Forecast, HubStat, KpiResult, MetricsService, Overview, OverviewQuery, RegionStat, ShareStat,
} from './types';

/** visits → distinct people: the longer the range, the more repeat visits (demo assumption) */
export const uniqueFactor = (days: number) => 1 / (1 + 0.045 * Math.pow(Math.max(1, days), 0.95));

type Span = [number, number] | null;

function span(ds: Dataset, r: ResolvedRange): Span {
  const a = Math.max(0, r.from - ds.start);
  const b = Math.min(ds.days - 1, r.to - ds.start);
  return b >= a ? [a, b] : null;
}

function sum(arr: Float64Array, s: Span): number {
  if (!s) return 0;
  let t = 0;
  for (let i = s[0]; i <= s[1]; i++) t += arr[i];
  return t;
}

const ratio = (cur: number, prev: number) => (prev > 0 ? cur / prev - 1 : null);

/** split a span into at most n buckets (daily when short) */
function buckets(s: Span, n: number): [number, number][] {
  if (!s) return [];
  const len = s[1] - s[0] + 1;
  if (len <= n) return Array.from({ length: len }, (_, i) => [s[0] + i, s[0] + i] as [number, number]);
  return Array.from({ length: n }, (_, k) => {
    const a = s[0] + Math.floor((k * len) / n);
    const b = s[0] + Math.floor(((k + 1) * len) / n) - 1;
    return [a, b] as [number, number];
  });
}

/** category / segment shares with a slow drift over time, so mixes change between periods */
function mixShares(ds: Dataset, series: Float64Array[], idx: number[], s: Span, items: ShareDef[], mixOf: (e: number) => number[], trend: number[]): number[] {
  const out = items.map(() => 0);
  if (!s) return out;
  for (const e of idx) {
    let s0 = 0;
    let s1 = 0;
    const arr = series[e];
    for (let i = s[0]; i <= s[1]; i++) {
      s0 += arr[i];
      s1 += (arr[i] * (ds.start + i - ds.today)) / 365;
    }
    const mix = mixOf(e);
    for (let c = 0; c < items.length; c++) out[c] += Math.max(0, mix[c] * (s0 + trend[c] * s1));
  }
  return out;
}

/** live boards: exact sums per item (category / segment) over a span for some entities */
function exactShares(ds: Dataset, arrays: Float32Array[], idx: number[], s: Span): number[] {
  return arrays.map((arr) => {
    if (!s) return 0;
    let t = 0;
    for (const e of idx) {
      const o = e * ds.days;
      for (let i = s[0]; i <= s[1]; i++) t += arr[o + i];
    }
    return t;
  });
}

function shareStats(items: ShareDef[], cur: number[], prev: number[], total: number | null): ShareStat[] {
  const cs = cur.reduce((a, b) => a + b, 0) || 1;
  const ps = prev.reduce((a, b) => a + b, 0) || 1;
  return items.map((def, i) => ({
    def,
    value: total == null ? cur[i] : (cur[i] / cs) * total,
    share: cur[i] / cs,
    prevShare: prev[i] / ps,
    growth: prev[i] > 0 ? cur[i] / cs / (prev[i] / ps) - 1 : null,
  }));
}

function forecastOf(ds: Dataset, idx: number[]): Forecast {
  const end = ds.days - 1;
  const look = Math.min(56, ds.days);
  const daily: number[] = [];
  for (let i = end - look + 1; i <= end; i++) {
    let t = 0;
    for (const e of idx) t += ds.primary[e][i];
    daily.push(t);
  }
  const wkSum = new Array(7).fill(0);
  const wkN = new Array(7).fill(0);
  daily.forEach((v, k) => {
    const wd = weekdayOf(ds.start + end - look + 1 + k);
    wkSum[wd] += v;
    wkN[wd] += 1;
  });
  const mean = daily.reduce((a, b) => a + b, 0) / (daily.length || 1) || 1;
  const wk = wkSum.map((s, i) => (wkN[i] ? s / wkN[i] / mean : 1) || 1);
  const last = daily.slice(-28);
  const y = last.map((v, k) => v / wk[weekdayOf(ds.today - last.length + 1 + k)]);
  const n = y.length;
  const xm = (n - 1) / 2;
  const ym = y.reduce((a, b) => a + b, 0) / (n || 1);
  let num = 0;
  let den = 0;
  y.forEach((v, x) => {
    num += (x - xm) * (v - ym);
    den += (x - xm) ** 2;
  });
  const slope = den ? num / den : 0;
  const points = Array.from({ length: 7 }, (_, k) => {
    const day = ds.today + k + 1;
    return { day, value: Math.max(0, (ym + slope * (n - 1 - xm + k + 1)) * wk[weekdayOf(day)]) };
  });
  const total = points.reduce((s, p) => s + p.value, 0);
  const lastTotal = daily.slice(-7).reduce((a, b) => a + b, 0);
  const actual = daily.slice(-14).map((value, k) => ({ day: ds.today - 13 + k, value }));
  return { actual, points, total, lastTotal, delta: ratio(total, lastTotal) };
}

/** city-level anomaly search: compare open entities with their own same-weekday average of the 4 weeks before */
function anomaliesOf(ds: Dataset, idx: number[], s: Span): AnomalyFinding[] {
  if (!s) return [];
  const found: (AnomalyFinding & { impact: number })[] = [];
  const dayMean = idx.reduce((t, e) => t + sum(ds.primary[e], s), 0) / (s[1] - s[0] + 1);
  for (let i = Math.max(s[0], 28); i <= s[1]; i++) {
    const byCity = new Map<string, { v: number; x: number; n: number }>();
    for (const e of idx) {
      if (!ds.open[e][i]) continue;
      /* median of the same weekday over the 4 weeks before (one odd day does not move it) */
      const same: number[] = [];
      for (const w of [7, 14, 21, 28]) if (ds.open[e][i - w]) same.push(ds.primary[e][i - w]);
      if (!same.length) continue;
      same.sort((a, b) => a - b);
      const mid = same.length >> 1;
      const base = same.length % 2 ? same[mid] : (same[mid - 1] + same[mid]) / 2;
      /* same weekday over 4 weeks, scaled by the recent trend (last 7 days vs last 28) */
      let s7 = 0, n7 = 0, s28 = 0, n28 = 0;
      for (let k = 1; k <= 28; k++) {
        if (!ds.open[e][i - k]) continue;
        s28 += ds.primary[e][i - k];
        n28 += 1;
        if (k <= 7) {
          s7 += ds.primary[e][i - k];
          n7 += 1;
        }
      }
      const trend = n7 && n28 && s28 ? s7 / n7 / (s28 / n28) : 1;
      const c = ds.entities[e].city.name;
      const g = byCity.get(c) || { v: 0, x: 0, n: 0 };
      g.v += ds.primary[e][i];
      g.x += base * Math.min(1.4, Math.max(0.7, trend));
      g.n += 1;
      byCity.set(c, g);
    }
    const hit = [...byCity.entries()].filter(([, g]) => g.x > dayMean * 0.04 && Math.abs(g.v / g.x - 1) >= 0.3);
    if (!hit.length) continue;
    const v = hit.reduce((t, [, g]) => t + g.v, 0);
    const x = hit.reduce((t, [, g]) => t + g.x, 0);
    found.push({ day: ds.start + i, value: v, expected: x, change: v / x - 1, cities: hit.map(([c]) => c), entities: hit.reduce((t, [, g]) => t + g.n, 0), impact: Math.abs(v - x) });
  }
  return found.sort((a, b) => b.impact - a.impact).slice(0, 4).map(({ impact: _i, ...f }) => f);
}

export function computeOverview(ds: Dataset, q: OverviewQuery): Overview {
  const { domain, range, prev, region } = q;
  const cur = span(ds, range);
  /* a previous period that starts before the first day with data would make every change look huge: no comparison then */
  const hasPrev = !prev.partial && prev.days >= range.days;
  const prv = hasPrev ? span(ds, prev) : null;
  const inRegion = (e: number) => region === 'all' || ds.entities[e].region === region;
  const all = ds.entities.map((e) => e.index);
  const idx = all.filter(inRegion);
  const endIdx = cur ? cur[1] : ds.days - 1;
  const uf = domain.series.people.unique && !ds.live ? uniqueFactor(range.days) : 1;
  const ufPrev = domain.series.people.unique && !ds.live ? uniqueFactor(prev.days) : 1;

  /* entity stats */
  const stats: EntityStat[] = all.map((e) => {
    const value = sum(ds.primary[e], cur);
    const p = sum(ds.primary[e], prv);
    return {
      entity: ds.entities[e],
      value,
      prev: p,
      growth: ratio(value, p),
      secondary: sum(ds.secondary[e], cur),
      people: sum(ds.people[e], cur) * uf,
      share: 0,
      rank: 0,
      openToday: !!ds.open[e][endIdx],
      daily: cur ? Array.from(ds.primary[e].subarray(cur[0], cur[1] + 1)) : [],
      catValues: ds.catDaily ? exactShares(ds, ds.catDaily, [e], cur) : undefined,
    };
  });
  const rankIt = (list: EntityStat[]) => {
    const total = list.reduce((t, x) => t + x.value, 0) || 1;
    return list
      .slice()
      .sort((a, b) => b.value - a.value)
      .map((x, i) => ({ ...x, rank: i + 1, share: x.value / total }));
  };
  const ranked = stats.filter((x) => !x.entity.other);
  const allEntities = rankIt(ranked);
  const entities = rankIt(ranked.filter((x) => inRegion(x.entity.index)));

  /* totals */
  const tot = (arr: Float64Array[], s: Span) => idx.reduce((t, e) => t + sum(arr[e], s), 0);
  const totals = {
    primary: tot(ds.primary, cur),
    secondary: tot(ds.secondary, cur),
    people: tot(ds.people, cur) * uf,
    entities: idx.length,
    active: idx.filter((e) => ds.open[e][endIdx]).length,
    countries: new Set(idx.map((e) => ds.entities[e].country)).size,
    cities: new Set(idx.map((e) => ds.entities[e].city.id)).size,
  };
  const prevTotals = { primary: tot(ds.primary, prv), secondary: tot(ds.secondary, prv), people: tot(ds.people, prv) * ufPrev };

  /* daily series with the previous period aligned day by day */
  const daily: DailyPoint[] = [];
  if (cur) {
    for (let i = cur[0]; i <= cur[1]; i++) {
      const j = hasPrev ? i - range.days : -1;
      let p = 0, s2 = 0, pe = 0, pp = 0, ps = 0, ppe = 0;
      for (const e of idx) {
        p += ds.primary[e][i];
        s2 += ds.secondary[e][i];
        pe += ds.people[e][i];
        if (j >= 0) {
          pp += ds.primary[e][j];
          ps += ds.secondary[e][j];
          ppe += ds.people[e][j];
        }
      }
      daily.push({ day: ds.start + i, primary: p, secondary: s2, people: pe, prevPrimary: j >= 0 ? pp : null, prevSecondary: j >= 0 ? ps : null, prevPeople: j >= 0 ? ppe : null });
    }
  }

  /* KPI cards */
  /* forecasts and weekday anomalies need daily rows; monthly / weekly tables skip them */
  const daily7 = !ds.grain || ds.grain === 'day';
  const fc: Forecast = daily7 ? forecastOf(ds, idx) : { actual: [], points: [], total: 0, lastTotal: 0, delta: null };
  const bks = buckets(cur, 8); // KPI sparkline bars
  const kpis: KpiResult[] = domain.kpis.map((def): KpiResult => {
    const prevCaption = !hasPrev ? 'no history' : range.days === 1 ? 'vs previous day' : `vs prev. ${range.days}d`;
    if (def.kind === 'sum') {
      const arr = ds[def.series];
      const f = def.series === 'people' ? uf : 1;
      const value = tot(arr, cur) * f;
      const p = tot(arr, prv) * (def.series === 'people' ? ufPrev : 1);
      const d = ratio(value, p);
      return { def, value, prev: p, delta: d, deltaKind: 'ratio', format: domain.series[def.series].format, caption: prevCaption, spark: bks.map((b) => tot(arr, b)), good: d == null ? null : d >= 0 };
    }
    if (def.kind === 'active') {
      const share = totals.entities ? totals.active / totals.entities : 0;
      return {
        def, value: totals.active, prev: null, delta: share, deltaKind: 'share', format: 'count', display: `${totals.active} / ${totals.entities}`,
        caption: ds.live ? 'reporting' : cur && cur[1] === ds.days - 1 ? 'open\u00a0today' : 'open at period end',
        spark: bks.map(([a, b]) => { let t = 0; for (let i = a; i <= b; i++) for (const e of idx) t += ds.open[e][i]; return t / (b - a + 1); }),
        good: share >= 0.9 ? true : share < 0.75 ? false : null,
      };
    }
    if (def.kind === 'rate') {
      const avg = (s: Span) => {
        if (!s) return null;
        let t = 0, n = 0;
        for (const e of idx) for (let i = s[0]; i <= s[1]; i++) if (ds.open[e][i] && ds.rate[e][i] === ds.rate[e][i]) { t += ds.rate[e][i]; n += 1; }
        return n ? t / n : null;
      };
      const value = avg(cur);
      const p = avg(prv);
      const d = value != null && p != null ? value - p : null;
      return { def, value, prev: p, delta: d, deltaKind: 'points', format: 'percent', caption: prevCaption, spark: bks.map((b) => avg(b) ?? 0), good: d == null ? null : def.rate.higherIsBetter ? d >= 0 : d <= 0 };
    }
    return {
      def, value: fc.total, prev: fc.lastTotal, delta: fc.delta, deltaKind: 'ratio', format: domain.series[def.series].format,
      caption: `next\u00a0${def.horizonDays}\u00a0days`, spark: [...fc.actual.map((x) => x.value), ...fc.points.map((x) => x.value)],
      line: { actual: fc.actual.map((x) => x.value), forecast: fc.points.map((x) => x.value) }, good: fc.delta == null ? null : fc.delta >= 0,
    };
  });

  /* regions, hubs, cities */
  const regions: RegionStat[] = REGION_IDS.map((id) => {
    const ids = all.filter((e) => ds.entities[e].region === id);
    const value = ids.reduce((t, e) => t + sum(ds.primary[e], cur), 0);
    const p = ids.reduce((t, e) => t + sum(ds.primary[e], prv), 0);
    return { id, label: regionLabel(id), hue: regionHue(id), entities: ids.filter((e) => !ds.entities[e].other).length, active: ids.filter((e) => ds.open[e][endIdx]).length, value, prev: p, growth: ratio(value, p) };
  }).filter((r) => r.entities > 0);
  const hubs: HubStat[] = HUBS.map((hub) => {
    const ids = all.filter((e) => (hub.zones ? hub.zones.includes(ds.entities[e].region) : hub.countries.includes(ds.entities[e].country)));
    const value = ids.reduce((t, e) => t + sum(ds.primary[e], cur), 0);
    const p = ids.reduce((t, e) => t + sum(ds.primary[e], prv), 0);
    return { hub, region: ds.entities[ids[0] ?? 0]?.region ?? 'asia', entities: ids.length, value, growth: ratio(value, p) };
  }).filter((h) => h.entities > 0);
  const cityMap = new Map<string, CityStat>();
  for (const s of allEntities) {
    const c = cityMap.get(s.entity.city.id) || { city: s.entity.city, region: s.entity.region, entities: 0, value: 0 };
    c.entities += 1;
    c.value += s.value;
    cityMap.set(s.entity.city.id, c);
  }

  /* mixes: the demo spreads each entity's total over its mix; a live board has the real split per day */
  const segSeries = ds[domain.segments.series ?? 'people'];
  const segUf = (domain.segments.series ?? 'people') === 'people' ? uf : 1;
  const segUfPrev = (domain.segments.series ?? 'people') === 'people' ? ufPrev : 1;
  const segCur = ds.segDaily ? exactShares(ds, ds.segDaily, idx, cur) : mixShares(ds, ds.people, idx, cur, domain.segments.items, (e) => ds.entities[e].segmentMix, ds.segmentTrend);
  const segPrev = ds.segDaily ? exactShares(ds, ds.segDaily, idx, prv) : mixShares(ds, ds.people, idx, prv, domain.segments.items, (e) => ds.entities[e].segmentMix, ds.segmentTrend);
  const catCur = ds.catDaily ? exactShares(ds, ds.catDaily, idx, cur) : mixShares(ds, ds.primary, idx, cur, domain.categories.items, (e) => ds.entities[e].categoryMix, ds.categoryTrend);
  const catPrev = ds.catDaily ? exactShares(ds, ds.catDaily, idx, prv) : mixShares(ds, ds.primary, idx, prv, domain.categories.items, (e) => ds.entities[e].categoryMix, ds.categoryTrend);
  const regionPeople = regions.map((r) => all.filter((e) => ds.entities[e].region === r.id).reduce((t, e) => t + sum(segSeries[e], cur), 0) * segUf);
  const regionPeoplePrev = regions.map((r) => all.filter((e) => ds.entities[e].region === r.id).reduce((t, e) => t + sum(segSeries[e], prv), 0) * segUfPrev);
  const regionDefs: ShareDef[] = regions.map((r) => ({ id: r.id, label: r.label, share: 0, icon: 'plane', hue: r.hue }));

  return {
    source: ds.live ? 'live' : 'demo',
    query: q,
    today: ds.today,
    kpis,
    daily,
    entities,
    allEntities,
    regions,
    hubs,
    cities: [...cityMap.values()],
    segments: shareStats(domain.segments.items, segCur, segPrev, ds.segDaily ? null : totals.people),
    segmentsByRegion: shareStats(regionDefs, regionPeople, regionPeoplePrev, regionPeople.reduce((a, b) => a + b, 0)),
    categories: shareStats(domain.categories.items, catCur, catPrev, ds.catDaily ? null : totals.primary),
    totals,
    prevTotals,
    forecast: fc,
    anomalies: daily7 ? anomaliesOf(ds, idx, cur) : [],
    generatedAt: new Date(),
  };
}

export const demoMetricsService: MetricsService = {
  source: 'demo',
  async getOverview(q: OverviewQuery) {
    return computeOverview(datasetFor(q.domain), q);
  },
  minDay(domain: DomainConfig) {
    return datasetFor(domain).start;
  },
};

