/* DEMO DATA — generated in the browser from a fixed seed per domain. Nothing here is real.
   Each entity (store, facility, branch, plant, campus…) gets ~26 months of daily values with weekday
   patterns, seasonality, growth, closures and two planted anomalies, so filters and comparisons have
   something meaningful to work on. Replace metricsService with a real API to use live data. */
import type { CountryCode, DomainConfig, DomainId, RegionId } from '../../domains/types';
import { CITIES, COUNTRIES, type City } from '../../domains/places';
import { gauss, jitterShares, rngFrom, type Rng } from '../../lib/random';
import { dateOf, todayDay, weekdayOf } from '../../lib/dates';

export const HISTORY_DAYS = 800; // enough for 'Last 12 months' vs the 12 months before

export type EntityStatus = 'active' | 'maintenance' | 'inactive';

export interface Entity {
  id: string;
  index: number;
  name: string;
  area: string;
  city: City;
  country: CountryCode;
  region: RegionId;
  lat: number;
  lon: number;
  size: number;
  status: EntityStatus;
  opened: number; // first day with data (day number)
  categoryMix: number[];
  segmentMix: number[];
  /** live boards: the combined "Other …" bucket for small locations (counted in totals, not ranked) */
  other?: boolean;
}

export interface Anomaly {
  day: number;
  factor: number; // 0.62 = 38% drop
  cityIds: string[];
}

export interface Dataset {
  key: string;
  domainId: DomainId;
  today: number;
  start: number;
  days: number;
  entities: Entity[];
  primary: Float64Array[];
  secondary: Float64Array[];
  people: Float64Array[];
  rate: Float64Array[];
  open: Uint8Array[];
  categoryTrend: number[]; // yearly drift of each category's share
  segmentTrend: number[];
  planted: Anomaly[];
  /** live boards: real values per category / segment, one array per item, laid out entity * days + day */
  live?: boolean;
  catDaily?: Float32Array[];
  segDaily?: Float32Array[];
  /** how often the table has rows: every day, one row a week, or one a month */
  grain?: 'day' | 'week' | 'month';
}

/* weekday factors (Sun..Sat) — shape of a typical week per domain */
const WEEK: Record<DomainId, number[]> = {
  retail: [1.18, 0.86, 0.88, 0.92, 0.97, 1.08, 1.26],
  healthcare: [0.62, 1.12, 1.08, 1.06, 1.05, 1.02, 0.84],
  finance: [0.32, 1.16, 1.12, 1.1, 1.1, 1.18, 0.55],
  manufacturing: [0.38, 1.1, 1.12, 1.12, 1.1, 1.08, 0.82],
  education: [0.22, 1.22, 1.2, 1.18, 1.16, 1.1, 0.56],
  custom: [0.7, 1.06, 1.06, 1.05, 1.05, 1.06, 0.88],
};

/* festive season bump (around early November) — strongest for retail */
const FESTIVE: Record<DomainId, number> = { retail: 0.32, healthcare: -0.06, finance: 0.14, manufacturing: 0.1, education: -0.12, custom: 0.12 };

function allocate(total: number, weights: Record<string, number>): Record<string, number> {
  const keys = Object.keys(weights).filter((k) => weights[k] > 0);
  const sum = keys.reduce((s, k) => s + weights[k], 0) || 1;
  const exact = keys.map((k) => ({ k, v: (weights[k] / sum) * total }));
  const out: Record<string, number> = {};
  let used = 0;
  for (const e of exact) {
    out[e.k] = Math.floor(e.v);
    used += out[e.k];
  }
  exact.sort((a, b) => (b.v % 1) - (a.v % 1));
  for (let i = 0; used < total && i < exact.length * 4; i++, used++) out[exact[i % exact.length].k] += 1;
  return out;
}

function festive(day: number): number {
  const d = dateOf(day);
  const peak = new Date(d.getFullYear(), 10, 8); // ~Nov 8
  const dist = (d.getTime() - peak.getTime()) / 86400000;
  return Math.exp(-(dist * dist) / (2 * 11 * 11));
}

function season(day: number): number {
  const d = dateOf(day);
  const doy = (d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / 86400000;
  return 1 + 0.06 * Math.sin((2 * Math.PI * (doy - 250)) / 365); // high season Nov–Dec, low in June
}

const cache = new Map<string, Dataset>();

export function datasetFor(domain: DomainConfig): Dataset {
  const today = todayDay();
  const key = `${domain.id}|${domain.entity.plural}|${domain.categories.items.length}|${domain.segments.items.length}|${today}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const ds = generate(domain, today, key);
  cache.set(key, ds);
  return ds;
}

function generate(domain: DomainConfig, today: number, key: string): Dataset {
  const rng: Rng = rngFrom(`databridge-demo:${domain.id}`);
  const start = today - HISTORY_DAYS + 1;
  const sc = domain.scale;

  /* where the entities are */
  const perCountry = allocate(sc.count, sc.countryWeights as Record<string, number>);
  const entities: Entity[] = [];
  for (const [country, n] of Object.entries(perCountry)) {
    const cities = CITIES.filter((c) => c.country === country);
    const perCity = allocate(n, Object.fromEntries(cities.map((c) => [c.id, c.weight])));
    for (const city of cities) {
      const k = perCity[city.id] || 0;
      for (let j = 0; j < k; j++) {
        const area = city.areas[j % city.areas.length] + (j >= city.areas.length ? ` ${Math.floor(j / city.areas.length) + 1}` : '');
        entities.push({
          id: `${domain.id}-${city.id}-${j}`,
          index: 0,
          name: `${city.name} - ${area}`,
          area,
          city,
          country: city.country,
          region: COUNTRIES[city.country].region,
          lat: city.lat + (rng() - 0.5) * 0.16,
          lon: city.lon + (rng() - 0.5) * 0.16,
          size: Math.exp(gauss(rng) * 0.42) * (j === 0 ? 1.35 : 1),
          status: 'active',
          opened: start - 1,
          categoryMix: jitterShares(rng, domain.categories.items.map((c) => c.share), 0.45),
          segmentMix: jitterShares(rng, domain.segments.items.map((c) => c.share), 0.4),
        });
      }
    }
  }
  entities.forEach((e, i) => {
    e.index = i;
    const r = rng();
    if (r < 0.055) e.status = 'inactive';
    else if (r < 0.11) e.status = 'maintenance';
    if (rng() < 0.09) e.opened = today - 60 - Math.floor(rng() * 260);
  });
  /* keep at least one entity open in each country, and the biggest one always active */
  const biggest = entities.reduce((b, e) => (e.size > b.size ? e : b), entities[0]);
  biggest.status = 'active';
  biggest.opened = start - 1;

  const days = HISTORY_DAYS;
  const week = WEEK[domain.id];
  const fest = FESTIVE[domain.id];
  const rateKpi = domain.kpis.find((k) => k.kind === 'rate');
  const rateDef = rateKpi && rateKpi.kind === 'rate' ? rateKpi.rate : null;

  /* two planted anomalies so the anomaly detector has something real to find */
  const cityIds = [...new Set(entities.map((e) => e.city.id))];
  const pickCities = (n: number) => {
    const a = [...cityIds];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, n);
  };
  const planted: Anomaly[] = [
    { day: today - 9 - Math.floor(rng() * 5), factor: 0.56 + rng() * 0.08, cityIds: pickCities(1) },
    { day: today - 34 - Math.floor(rng() * 8), factor: 1.55 + rng() * 0.15, cityIds: pickCities(2) },
  ];

  const primary: Float64Array[] = [];
  const secondary: Float64Array[] = [];
  const people: Float64Array[] = [];
  const rate: Float64Array[] = [];
  const open: Uint8Array[] = [];
  const seasonCache = new Float64Array(days);
  const festiveCache = new Float64Array(days);
  for (let d = 0; d < days; d++) {
    seasonCache[d] = season(start + d);
    festiveCache[d] = festive(start + d);
  }

  for (const e of entities) {
    const er = rngFrom(`${domain.id}:${e.id}`);
    const growth = 0.16 + gauss(er) * 0.12; // yearly
    const base = sc.primaryPerDay * e.size;
    const rateBias = rateDef ? gauss(er) * rateDef.spread : 0;
    /* closed a while ago (before the default comparison window), or in maintenance for the last few days */
    const closedFrom = e.status === 'inactive' ? today - 70 - Math.floor(er() * 90) : e.status === 'maintenance' ? today - Math.floor(er() * 3) : Infinity;
    const p = new Float64Array(days);
    const s = new Float64Array(days);
    const q = new Float64Array(days);
    const r = new Float64Array(days);
    const o = new Uint8Array(days);
    for (let d = 0; d < days; d++) {
      const day = start + d;
      const isOpen = day >= e.opened && day < closedFrom && er() > 0.006;
      if (!isOpen) continue;
      o[d] = 1;
      const wd = week[weekdayOf(day)];
      const trend = Math.pow(1 + growth, (day - today) / 365);
      const ramp = Math.min(1, (day - e.opened + 1) / 50);
      let v = base * wd * seasonCache[d] * (1 + fest * festiveCache[d]) * trend * ramp * Math.exp(gauss(er) * 0.085);
      for (const a of planted) if (a.day === day && a.cityIds.includes(e.city.id)) v *= a.factor;
      p[d] = v;
      const tx = v / (sc.ticket * Math.exp(gauss(er) * 0.05));
      s[d] = tx;
      q[d] = tx * sc.peoplePerTxn * Math.exp(gauss(er) * 0.05);
      if (rateDef) r[d] = Math.min(0.99, Math.max(0.3, rateDef.mean + rateBias + gauss(er) * rateDef.spread * 0.35 + (wd - 1) * 0.04));
    }
    primary.push(p);
    secondary.push(s);
    people.push(q);
    rate.push(r);
    open.push(o);
  }

  return {
    key,
    domainId: domain.id,
    today,
    start,
    days,
    entities,
    primary,
    secondary,
    people,
    rate,
    open,
    categoryTrend: domain.categories.items.map(() => (rng() - 0.35) * 0.5),
    segmentTrend: domain.segments.items.map(() => (rng() - 0.45) * 0.3),
    planted,
  };
}
