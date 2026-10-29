/* Typed domain configuration. The dashboard shell is domain-neutral; everything domain-specific
   (labels, KPIs, categories, segments, entity type, building style, events, widgets) comes from here. */
import type { IconKey } from '../components/ui/icons';

export type DomainId = 'retail' | 'healthcare' | 'finance' | 'manufacturing' | 'education' | 'custom';
export type BuildingKind = 'store' | 'hospital' | 'bank' | 'factory' | 'campus' | 'office';
export type ValueFormat = 'currency' | 'count' | 'percent';
export type Hue = 'green' | 'blue' | 'violet' | 'orange' | 'rose' | 'teal' | 'amber' | 'sky' | 'slate';
export type SeriesKey = 'primary' | 'secondary' | 'people';
/** demo: asia, north-america, europe, middle-east, oceania; live boards add their own (states, cities, continents) */
export type RegionId = string;
/** ISO 3166 alpha-2 (IN, US, AE…); live boards may have others */
export type CountryCode = string;
export type WidgetId = 'kpis' | 'globe' | 'performance' | 'top' | 'distribution' | 'categories' | 'health' | 'events' | 'insights';
export type EventType = 'order' | 'payment' | 'inventory' | 'customer' | 'sync' | 'alert';

export interface SeriesDef {
  label: string; // "Sales"
  noun: string; // "sales" (used in sentences)
  format: ValueFormat;
  /** daily values are visits/people: a longer range has repeat visitors, so totals are de-duplicated */
  unique?: boolean;
}

export interface RateDef {
  label: string; // "OEE"
  mean: number; // 0..1
  spread: number;
  higherIsBetter: boolean;
}

interface KpiBase {
  id: string;
  label: string;
  icon: IconKey;
  hue: Hue;
}
export type KpiDef =
  | (KpiBase & { kind: 'sum'; series: SeriesKey })
  | (KpiBase & { kind: 'active' })
  | (KpiBase & { kind: 'rate'; rate: RateDef })
  | (KpiBase & { kind: 'forecast'; series: SeriesKey; horizonDays: number });

export interface ShareDef {
  id: string;
  label: string;
  share: number; // base share, the generator varies it per entity
  icon: IconKey;
  hue: Hue;
}

export interface EventTemplate {
  type: EventType;
  /** placeholders: {entity} {city} {category} {segment} {n} {amount} */
  text: string;
  weight: number;
}

export interface DomainConfig {
  id: DomainId;
  label: string;
  icon: IconKey;
  hue: Hue;
  description: string;
  entity: {
    singular: string; // "Store"
    plural: string; // "Stores"
    building: BuildingKind; // shape of the miniature building in the 3D scene and list thumbnails
  };
  series: Record<SeriesKey, SeriesDef>;
  /** four KPI cards + one forecast card */
  kpis: KpiDef[];
  segments: { title: string; noun: string; items: ShareDef[]; series?: SeriesKey };
  categories: { title: string; items: ShareDef[] };
  /** demo data scale */
  scale: { count: number; primaryPerDay: number; ticket: number; peoplePerTxn: number; countryWeights: Partial<Record<CountryCode, number>> };
  events: EventTemplate[];
  widgets: WidgetId[];
  searchHint: string; // header search placeholder
  /** which series exist (live boards may have no orders or people column); default all three */
  metrics?: SeriesKey[];
  /** a live board on the person's own table (absent for demo domains) */
  live?: { boardId: string; table: string; first: number; last: number; grain: 'day' | 'week' | 'month' };
}

/** What a person can change for the Custom domain (stored in the browser). */
export interface CustomDomainInput {
  label: string;
  entitySingular: string;
  entityPlural: string;
  building: BuildingKind;
  primaryLabel: string;
  secondaryLabel: string;
  peopleLabel: string;
  categories: string; // comma separated
  segments: string; // comma separated
}
