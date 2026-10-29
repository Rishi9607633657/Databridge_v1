/* Live boards: the Overview page on the person's own table. The server (backend/boards.py) sends compact daily
   aggregates per location (+ categories / segments); this file turns them into the same Dataset and DomainConfig
   the demo uses, so every card, filter and page works unchanged — with real numbers. */
import type { BuildingKind, DomainConfig, Hue, KpiDef, SeriesKey, ShareDef, WidgetId } from '../domains/types';
import type { City, GeoContext, Hub } from '../domains/places';
import type { Dataset, Entity } from '../data/demo/generator';
import type { IconKey } from '../components/ui/icons';
import type { MetricsService, Overview } from '../services/types';
import type { AppEvent } from '../services/eventsService';
import { computeOverview } from '../services/metricsService';
import { apiGet, ApiError } from '../services/apiClient';
import { dateOf, dayFromIso, fmtDay, fmtMonth } from '../lib/dates';
import { formatValue, formatDelta, type FormatOptions } from '../lib/format';

export interface BoardLabels {
  entity: string;
  entities: string;
  building: BuildingKind;
  primary: string;
  primaryFormat: 'currency' | 'count';
  secondary: string | null;
  people: string | null;
  peopleDaily: boolean;
  rate: string | null;
  category: string | null;
  categoryTitle: string | null;
  segment: string | null;
  segmentSeries: SeriesKey;
  segmentTitle: string;
  segmentNoun: string;
}

interface Split {
  labels: string[];
  d: number[];
  e: number[];
  c: number[];
  v: number[];
}

export interface BoardPayload {
  id: string;
  name: string;
  description: string;
  board: { table: string; map: Record<string, string | number | null>; labels: BoardLabels };
  columns: { name: string; type: string; kind: string }[];
  start: string;
  end: string;
  firstDay: string;
  days: number;
  grain: 'day' | 'week' | 'month';
  entities: { name: string; city: string | null; state: string | null; country: string; countryName: string; zone: string; lat: number | null; lon: number | null; other?: boolean }[];
  geo: { mode: string; zones: { id: string; label: string; hue: Hue }[]; hubs: Hub[]; countries: Record<string, { name: string; zone: string }> };
  daily: { d: number[]; e: number[]; p: number[]; s: number[] | null; q: number[] | null; r: (number | null)[] | null };
  categories: Split | null;
  segments: Split | null;
  warnings: string[];
  engine: string;
  elapsed: number;
  loadedAt: number;
  cached?: boolean;
}

export interface Board {
  payload: BoardPayload;
  dataset: Dataset;
  domain: DomainConfig;
  geo: GeoContext;
  service: MetricsService;
}

export interface BoardSummary {
  id: string;
  name: string;
  table?: string;
  updated?: number;
}

/** the board id in the page address (?board=…) */
export const boardIdFromUrl = (): string | null => {
  try {
    const v = new URLSearchParams(location.search).get('board');
    return v && /^[A-Za-z0-9_-]{4,40}$/.test(v) ? v : null;
  } catch {
    return null;
  }
};

export const boardUrl = (id: string | null) => `${location.pathname}${id ? `?board=${encodeURIComponent(id)}` : ''}#/`;

export async function listBoards(): Promise<BoardSummary[]> {
  try {
    const r = await apiGet<{ id: string; name: string; kind?: string; table?: string; updated?: number }[]>('/api/dashboards', 5000);
    return (Array.isArray(r) ? r : []).filter((d) => d.kind === 'overview').map((d) => ({ id: d.id, name: d.name, table: d.table, updated: d.updated }));
  } catch {
    return [];
  }
}

export async function loadBoard(id: string, refresh = false): Promise<Board> {
  let payload: BoardPayload;
  try {
    payload = await apiGet<BoardPayload>(`/api/dashboards/${encodeURIComponent(id)}/board-data${refresh ? '?refresh=1' : ''}`, 180000);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) throw new Error('This board no longer exists. Pick another one in the header.');
    throw e;
  }
  return buildBoard(payload);
}

/* ---------------- icons and colours for categories / segments, from their names ---------------- */
const CAT_ICONS: [RegExp, IconKey][] = [
  [/apparel|cloth|fashion|garment|wear|shirt/i, 'shirt'], [/electronic|mobile|phone|gadget|computer|laptop/i, 'phone'],
  [/grocery|food|fresh|produce|dairy|bakery|snack/i, 'basket'], [/home|living|furniture|decor|kitchen/i, 'sofa'],
  [/beauty|care|cosmetic|personal|skin|wellness/i, 'sparkles'], [/foot|shoe/i, 'bag'], [/sport|fitness|outdoor/i, 'activity'],
  [/toy|kid|baby|game/i, 'box'], [/book|stationery|education|course/i, 'book'], [/drink|beverage|bar|wine|coffee|tea/i, 'flask'],
  [/pharma|medicine|drug|health/i, 'pill'], [/jewel|watch|luxury|gold/i, 'crown'], [/auto|car|vehicle/i, 'car'],
  [/service|repair|maintenance/i, 'wrench'], [/other/i, 'dashed'],
];
const SEG_ICONS: [RegExp, IconKey][] = [
  [/vip|premium|gold|platinum|elite|loyal/i, 'crown'], [/new|first/i, 'userPlus'], [/inactive|lapsed|churn|lost|dormant/i, 'userX'],
  [/online|web|app|digital|delivery|ecom/i, 'laptop'], [/store|offline|walk|dine|counter|in-?store/i, 'store'], [/other/i, 'dashed'],
];
const iconFor = (rules: [RegExp, IconKey][], label: string, fallback: IconKey): IconKey => rules.find(([rx]) => rx.test(label))?.[1] ?? fallback;
const CAT_HUES: Hue[] = ['blue', 'green', 'violet', 'rose', 'orange', 'teal', 'amber', 'sky'];
const SEG_HUES: Hue[] = ['blue', 'rose', 'orange', 'amber', 'violet', 'teal', 'sky'];
const BUILDING_ICON: Record<BuildingKind, IconKey> = { store: 'store', hospital: 'hospital', bank: 'landmark', factory: 'factory', campus: 'school', office: 'building' };

function shareDefs(labels: string[], hues: Hue[], rules: [RegExp, IconKey][], fallback: IconKey): ShareDef[] {
  return labels.map((label, i) => ({ id: `i${i}`, label, share: 0, icon: iconFor(rules, label, fallback), hue: /^other/i.test(label) ? 'slate' : hues[i % hues.length] }));
}

/* ---------------- the board's words → a DomainConfig ---------------- */
export function boardDomain(p: BoardPayload): DomainConfig {
  const L = p.board.labels;
  const P = L.primary;
  const S = L.secondary;
  const Q = L.people;
  const lower = (s: string) => s.toLowerCase();
  const metrics: SeriesKey[] = ['primary', ...(S ? (['secondary'] as SeriesKey[]) : []), ...(Q ? (['people'] as SeriesKey[]) : [])];
  const kpis: KpiDef[] = [{ id: 'primary', kind: 'sum', series: 'primary', label: `Total ${P}`, icon: 'chart', hue: 'green' }];
  if (S) kpis.push({ id: 'secondary', kind: 'sum', series: 'secondary', label: `Total ${S}`, icon: 'cart', hue: 'blue' });
  kpis.push({ id: 'active', kind: 'active', label: `Active ${L.entities}`, icon: BUILDING_ICON[L.building] ?? 'building', hue: 'violet' });
  const rateKpi: KpiDef | null = L.rate
    ? { id: 'rate', kind: 'rate', label: L.rate, icon: 'gauge', hue: 'orange', rate: { label: L.rate, mean: 0.5, spread: 0.1, higherIsBetter: !/cost|discount|return|refund|churn|wait|delay|cancel|void|waste/i.test(L.rate) } }
    : null;
  if (Q) kpis.push({ id: 'people', kind: 'sum', series: 'people', label: Q, icon: 'users', hue: 'orange' });
  else if (rateKpi) kpis.push(rateKpi);
  if (p.grain === 'day') kpis.push({ id: 'forecast', kind: 'forecast', series: 'primary', label: `${P} Forecast`, icon: 'target', hue: 'rose', horizonDays: 7 });
  else if (Q && rateKpi) kpis.push({ ...rateKpi, hue: 'rose' });
  const cats = p.categories?.labels ?? [];
  const segs = p.segments?.labels ?? [];
  const widgets: WidgetId[] = ['kpis', 'globe', 'performance', 'top', 'distribution', ...(cats.length ? (['categories'] as WidgetId[]) : []), 'health', 'events', 'insights'];
  const first = dayFromIso(p.firstDay) ?? dayFromIso(p.start) ?? 0;
  const last = dayFromIso(p.end) ?? first;
  return {
    id: 'custom',
    label: p.name,
    icon: BUILDING_ICON[L.building] ?? 'building',
    hue: 'blue',
    description: `Live · ${p.board.table}`,
    entity: { singular: L.entity, plural: L.entities, building: L.building },
    series: {
      primary: { label: P, noun: lower(P), format: L.primaryFormat === 'currency' ? 'currency' : 'count' },
      secondary: { label: S ?? 'Records', noun: lower(S ?? 'records'), format: 'count' },
      people: { label: Q ?? 'People', noun: lower(Q ?? 'people'), format: 'count' },
    },
    kpis,
    segments: { title: L.segmentTitle, noun: L.segmentNoun, items: shareDefs(segs, SEG_HUES, SEG_ICONS, 'users'), series: L.segmentSeries },
    categories: { title: L.categoryTitle ?? `${P} by category`, items: shareDefs(cats, CAT_HUES, CAT_ICONS, 'layers') },
    scale: { count: p.entities.length, primaryPerDay: 0, ticket: 1, peoplePerTxn: 1, countryWeights: {} },
    events: [],
    widgets,
    searchHint: `Search ${lower(L.entities)}, ${cats.length ? 'categories, ' : ''}reports…`,
    metrics,
    live: { boardId: p.id, table: p.board.table, first, last, grain: p.grain },
  };
}

/* ---------------- rows → Dataset ---------------- */
const slug = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'x';

export function buildBoard(p: BoardPayload): Board {
  const D = p.days;
  const start = dayFromIso(p.start) ?? 0;
  const today = dayFromIso(p.end) ?? start + D - 1;
  const E = p.entities.length;
  const mk = () => Array.from({ length: E }, () => new Float64Array(D));
  const primary = mk();
  const secondary = mk();
  const people = mk();
  const rate = Array.from({ length: E }, () => new Float64Array(D).fill(NaN));
  const open = Array.from({ length: E }, () => new Uint8Array(D));
  const { d, e, p: pv, s, q, r } = p.daily;
  for (let k = 0; k < d.length; k++) {
    const di = d[k];
    const ei = e[k];
    if (ei == null || ei >= E || di < 0 || di >= D) continue;
    primary[ei][di] += pv[k] || 0;
    if (s) secondary[ei][di] += s[k] || 0;
    if (q) people[ei][di] += q[k] || 0;
    if (r && r[k] != null) rate[ei][di] = r[k] as number;
    open[ei][di] = 1;
  }
  const split = (sp: Split | null) => {
    if (!sp || !sp.labels.length) return undefined;
    const arrs = sp.labels.map(() => new Float32Array(E * D));
    for (let k = 0; k < sp.d.length; k++) {
      const c = sp.c[k];
      const ei = sp.e[k];
      const di = sp.d[k];
      if (c == null || c >= arrs.length || ei >= E || di < 0 || di >= D) continue;
      arrs[c][ei * D + di] += sp.v[k] || 0;
    }
    return arrs;
  };
  /* a location that had rows in the last stretch is active; quiet ones are shown as inactive */
  const recent = p.grain === 'month' ? 62 : p.grain === 'week' ? 21 : 14;
  const cities = new Map<string, City>();
  const entities: Entity[] = p.entities.map((x, i) => {
    let firstDay = -1;
    let lastDay = -1;
    for (let k = 0; k < D; k++) if (open[i][k]) { if (firstDay < 0) firstDay = k; lastDay = k; }
    const lat = x.lat ?? NaN;
    const lon = x.lon ?? NaN;
    const cityName = x.city || x.name;
    const cid = x.city ? slug(`${x.city}-${x.state ?? ''}-${x.country}`) : `e-${i}`;
    let city = cities.get(cid);
    if (!city) {
      city = { id: cid, name: cityName, country: x.country, lat, lon, weight: 1, areas: [] };
      cities.set(cid, city);
    } else if (!Number.isFinite(city.lat) && Number.isFinite(lat)) {
      city.lat = lat;
      city.lon = lon;
    }
    return {
      id: `b${i}`,
      index: i,
      name: x.name,
      area: x.state ?? '',
      city,
      country: x.country,
      region: x.zone,
      lat,
      lon,
      size: 1,
      status: lastDay >= 0 && lastDay >= D - recent ? 'active' : 'inactive',
      opened: firstDay >= 0 ? start + firstDay : today,
      categoryMix: [],
      segmentMix: [],
      other: !!x.other,
    };
  });
  const dataset: Dataset = {
    key: `board:${p.id}:${p.loadedAt}`,
    domainId: 'custom',
    today,
    start,
    days: D,
    entities,
    primary,
    secondary,
    people,
    rate,
    open,
    categoryTrend: [],
    segmentTrend: [],
    planted: [],
    live: true,
    catDaily: split(p.categories),
    segDaily: split(p.segments),
    grain: p.grain,
  };
  const domain = boardDomain(p);
  const geo: GeoContext = {
    regions: p.geo.zones,
    countries: p.geo.countries,
    hubs: p.geo.hubs.map((h) => ({ ...h, countries: h.countries ?? [], flag: h.flag || '' })),
    focus: {},
  };
  const service: MetricsService = {
    source: 'live',
    async getOverview(qry) {
      return computeOverview(dataset, qry);
    },
    minDay() {
      return start;
    },
  };
  return { payload: p, dataset, domain, geo, service };
}

/* ---------------- "Recent events" from the data itself (no simulation on a live board) ---------------- */
export function boardEvents(o: Overview, fo: FormatOptions): AppEvent[] {
  const dom = o.query.domain;
  const P = dom.series.primary;
  const fv = (v: number) => formatValue(v, P.format, fo);
  const out: AppEvent[] = [];
  const g = dom.live?.grain ?? 'day';
  const label = (day: number) => (g === 'month' ? fmtMonth(day) : g === 'week' ? `Wk ${fmtDay(day)}` : fmtDay(day));
  /* short lines: the card is narrow; the full detail is one click away in Monitoring / Analytics */
  const days = o.daily.filter((x) => x.primary > 0).slice(-8).reverse();
  days.forEach((x, i) => {
    const prev = days[i + 1];
    const ch = prev && prev.primary > 0 ? x.primary / prev.primary - 1 : null;
    out.push({
      id: `day-${x.day}`,
      time: dateOf(x.day),
      when: label(x.day),
      type: 'order',
      text: `${fv(x.primary)} ${P.noun}${ch != null ? ` · ${ch >= 0 ? '▲' : '▼'} ${formatDelta(ch)}` : ''}`,
      severity: 'info',
    });
  });
  for (const a of o.anomalies) {
    const where = a.cities.length === 1 ? a.cities[0] : `${a.cities.length} cities`;
    out.push({
      id: `an-${a.day}`,
      time: dateOf(a.day),
      when: fmtDay(a.day),
      type: 'alert',
      text: `${where}: ${a.change < 0 ? '▼' : '▲'} ${formatDelta(a.change)} vs usual`,
      severity: 'warning',
    });
  }
  const best = o.entities[0];
  if (best) {
    const k = best.daily.reduce((m, v, i, arr) => (v > arr[m] ? i : m), 0);
    const day = o.query.range.from + k;
    out.push({ id: `best-${best.entity.id}`, time: dateOf(day), when: label(day), type: 'customer', text: `Best ${g}: ${best.entity.name} ${fv(best.daily[k] ?? 0)}`, severity: 'success' });
  }
  return out.sort((a, b) => b.time.getTime() - a.time.getTime());
}
