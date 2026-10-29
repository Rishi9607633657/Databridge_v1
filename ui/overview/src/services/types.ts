/* What the dashboard needs from a data service. The demo service fills these from generated data;
   a real implementation would return the same shapes from an API (see services/README.md). */
import type { DomainConfig, Hue, KpiDef, RegionId, ShareDef, ValueFormat } from '../domains/types';
import type { City, Hub } from '../domains/places';
import type { Entity } from '../data/demo/generator';
import type { ResolvedRange } from '../lib/dates';

export type DataSource = 'demo' | 'live';

export interface OverviewQuery {
  domain: DomainConfig;
  range: ResolvedRange;
  prev: ResolvedRange;
  region: RegionId | 'all';
}

export interface KpiResult {
  def: KpiDef;
  value: number | null;
  prev: number | null;
  /** ratio change (0.18 = +18%), or point change for rates */
  delta: number | null;
  deltaKind: 'ratio' | 'points' | 'share';
  format: ValueFormat;
  display?: string; // "54 / 60"
  caption: string; // "vs previous 28 days"
  spark: number[];
  /** forecast card: actual then projected values */
  line?: { actual: number[]; forecast: number[] };
  /** is the change good for the business? null = neutral */
  good: boolean | null;
}

export interface DailyPoint {
  day: number;
  primary: number;
  secondary: number;
  people: number;
  prevPrimary: number | null;
  prevSecondary: number | null;
  prevPeople: number | null;
}

export interface EntityStat {
  entity: Entity;
  value: number;
  prev: number;
  growth: number | null;
  secondary: number;
  people: number;
  share: number;
  rank: number;
  openToday: boolean;
  daily: number[]; // primary per day in range (for the drill-down sparkline)
  /** live boards: this location's real value per category in the range */
  catValues?: number[];
}

export interface RegionStat {
  id: RegionId;
  label: string;
  hue: Hue;
  entities: number;
  active: number;
  value: number;
  prev: number;
  growth: number | null;
}

export interface HubStat {
  hub: Hub;
  region: RegionId;
  entities: number;
  value: number;
  growth: number | null;
}

export interface CityStat {
  city: City;
  region: RegionId;
  entities: number;
  value: number;
}

export interface ShareStat {
  def: ShareDef;
  value: number;
  share: number;
  prevShare: number;
  growth: number | null;
}

export interface AnomalyFinding {
  day: number;
  value: number;
  expected: number;
  change: number; // -0.38
  cities: string[];
  entities: number;
}

export interface Forecast {
  actual: { day: number; value: number }[];
  points: { day: number; value: number }[];
  total: number;
  lastTotal: number;
  delta: number | null;
}

export interface Overview {
  source: DataSource;
  query: OverviewQuery;
  today: number;
  kpis: KpiResult[];
  daily: DailyPoint[];
  entities: EntityStat[]; // in the selected region, ranked by primary value
  allEntities: EntityStat[]; // every region (globe markers)
  regions: RegionStat[];
  hubs: HubStat[];
  cities: CityStat[];
  segments: ShareStat[];
  segmentsByRegion: ShareStat[];
  categories: ShareStat[];
  totals: { primary: number; secondary: number; people: number; entities: number; active: number; countries: number; cities: number };
  prevTotals: { primary: number; secondary: number; people: number };
  forecast: Forecast;
  anomalies: AnomalyFinding[];
  generatedAt: Date;
}

export interface MetricsService {
  readonly source: DataSource;
  getOverview(q: OverviewQuery): Promise<Overview>;
  /** oldest day that has data (limits the date picker) */
  minDay(domain: DomainConfig): number;
}
