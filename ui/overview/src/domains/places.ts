/* Shared geography: regions, countries, cities (with real coordinates) and the "hubs" that get a callout on the
   globe. These start as the demo geography; a live board replaces them with its own (see applyGeo). */
import type { CountryCode, Hue, RegionId } from './types';

const DEMO_REGIONS: Record<RegionId, { label: string; hue: Hue }> = {
  asia: { label: 'Asia', hue: 'green' },
  'north-america': { label: 'North America', hue: 'blue' },
  europe: { label: 'Europe', hue: 'violet' },
  'middle-east': { label: 'Middle East', hue: 'orange' },
  oceania: { label: 'Oceania', hue: 'rose' },
};
export const REGIONS: Record<RegionId, { label: string; hue: Hue }> = { ...DEMO_REGIONS };
export const REGION_IDS: RegionId[] = Object.keys(REGIONS);

export type FlagCode = CountryCode | 'EU';

const DEMO_COUNTRIES: Record<CountryCode, { name: string; region: RegionId }> = {
  IN: { name: 'India', region: 'asia' },
  SG: { name: 'Singapore', region: 'asia' },
  US: { name: 'United States', region: 'north-america' },
  CA: { name: 'Canada', region: 'north-america' },
  GB: { name: 'United Kingdom', region: 'europe' },
  DE: { name: 'Germany', region: 'europe' },
  AE: { name: 'United Arab Emirates', region: 'middle-east' },
  AU: { name: 'Australia', region: 'oceania' },
};
export const COUNTRIES: Record<CountryCode, { name: string; region: RegionId }> = { ...DEMO_COUNTRIES };

export interface City {
  id: string;
  name: string;
  country: CountryCode;
  lat: number;
  lon: number;
  weight: number; // relative share of a country's entities
  areas: string[];
}

export const CITIES: City[] = [
  { id: 'mumbai', name: 'Mumbai', country: 'IN', lat: 19.076, lon: 72.878, weight: 5, areas: ['Bandra', 'Andheri', 'Powai', 'Lower Parel', 'Thane', 'Malad'] },
  { id: 'delhi', name: 'Delhi', country: 'IN', lat: 28.614, lon: 77.209, weight: 4.5, areas: ['Connaught Place', 'Saket', 'Dwarka', 'Karol Bagh', 'Rohini'] },
  { id: 'bengaluru', name: 'Bangalore', country: 'IN', lat: 12.972, lon: 77.594, weight: 4, areas: ['Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout', 'Jayanagar'] },
  { id: 'hyderabad', name: 'Hyderabad', country: 'IN', lat: 17.385, lon: 78.487, weight: 3, areas: ['Hitech City', 'Banjara Hills', 'Gachibowli', 'Kukatpally'] },
  { id: 'pune', name: 'Pune', country: 'IN', lat: 18.52, lon: 73.857, weight: 3, areas: ['Kothrud', 'Baner', 'Hinjewadi', 'Viman Nagar', 'Kharadi'] },
  { id: 'chennai', name: 'Chennai', country: 'IN', lat: 13.083, lon: 80.27, weight: 2.5, areas: ['T. Nagar', 'Adyar', 'Velachery', 'Anna Nagar'] },
  { id: 'kolkata', name: 'Kolkata', country: 'IN', lat: 22.573, lon: 88.364, weight: 2, areas: ['Park Street', 'Salt Lake', 'New Town'] },
  { id: 'ahmedabad', name: 'Ahmedabad', country: 'IN', lat: 23.023, lon: 72.571, weight: 1.6, areas: ['Navrangpura', 'Satellite', 'Bodakdev'] },
  { id: 'jaipur', name: 'Jaipur', country: 'IN', lat: 26.912, lon: 75.787, weight: 1.2, areas: ['C-Scheme', 'Malviya Nagar', 'Vaishali Nagar'] },
  { id: 'singapore', name: 'Singapore', country: 'SG', lat: 1.352, lon: 103.82, weight: 1, areas: ['Orchard', 'Marina Bay', 'Jurong', 'Tampines'] },
  { id: 'newyork', name: 'New York', country: 'US', lat: 40.713, lon: -74.006, weight: 3, areas: ['Manhattan', 'Brooklyn', 'Queens'] },
  { id: 'sanfrancisco', name: 'San Francisco', country: 'US', lat: 37.775, lon: -122.419, weight: 2, areas: ['SoMa', 'Mission', 'Sunset'] },
  { id: 'chicago', name: 'Chicago', country: 'US', lat: 41.878, lon: -87.63, weight: 1.6, areas: ['The Loop', 'Lincoln Park'] },
  { id: 'austin', name: 'Austin', country: 'US', lat: 30.267, lon: -97.743, weight: 1.2, areas: ['Downtown', 'The Domain'] },
  { id: 'seattle', name: 'Seattle', country: 'US', lat: 47.606, lon: -122.332, weight: 1.2, areas: ['Capitol Hill', 'Ballard'] },
  { id: 'toronto', name: 'Toronto', country: 'CA', lat: 43.653, lon: -79.383, weight: 2, areas: ['Downtown', 'North York', 'Scarborough'] },
  { id: 'vancouver', name: 'Vancouver', country: 'CA', lat: 49.283, lon: -123.121, weight: 1, areas: ['Gastown', 'Kitsilano'] },
  { id: 'london', name: 'London', country: 'GB', lat: 51.507, lon: -0.128, weight: 3, areas: ['Soho', 'Canary Wharf', 'Camden', 'Kensington'] },
  { id: 'manchester', name: 'Manchester', country: 'GB', lat: 53.481, lon: -2.243, weight: 1.2, areas: ['Northern Quarter', 'Salford Quays'] },
  { id: 'berlin', name: 'Berlin', country: 'DE', lat: 52.52, lon: 13.405, weight: 2, areas: ['Mitte', 'Kreuzberg', 'Charlottenburg'] },
  { id: 'munich', name: 'Munich', country: 'DE', lat: 48.135, lon: 11.582, weight: 1.4, areas: ['Maxvorstadt', 'Schwabing'] },
  { id: 'frankfurt', name: 'Frankfurt', country: 'DE', lat: 50.11, lon: 8.682, weight: 1, areas: ['Westend', 'Sachsenhausen'] },
  { id: 'dubai', name: 'Dubai', country: 'AE', lat: 25.205, lon: 55.271, weight: 3, areas: ['Downtown', 'Dubai Marina', 'Deira', 'Business Bay'] },
  { id: 'abudhabi', name: 'Abu Dhabi', country: 'AE', lat: 24.454, lon: 54.377, weight: 1.4, areas: ['Corniche', 'Yas Island', 'Al Reem'] },
  { id: 'sydney', name: 'Sydney', country: 'AU', lat: -33.869, lon: 151.209, weight: 2, areas: ['CBD', 'Parramatta', 'Bondi'] },
  { id: 'melbourne', name: 'Melbourne', country: 'AU', lat: -37.814, lon: 144.963, weight: 1.6, areas: ['Southbank', 'Fitzroy', 'Docklands'] },
];

export const CITY_BY_ID: Record<string, City> = Object.fromEntries(CITIES.map((c) => [c.id, c]));

/** Callouts on the globe: one per country group (Europe is shown as one hub). */
export interface Hub {
  id: string;
  label: string;
  flag: FlagCode;
  countries: CountryCode[];
  /** live boards: the hub covers these regions (states / cities) instead of whole countries */
  zones?: RegionId[];
  lat: number;
  lon: number;
}

const DEMO_HUBS: Hub[] = [
  { id: 'in', label: 'India', flag: 'IN', countries: ['IN'], lat: 21.5, lon: 78.5 },
  { id: 'us', label: 'USA', flag: 'US', countries: ['US'], lat: 39.5, lon: -98.5 },
  { id: 'eu', label: 'Europe', flag: 'EU', countries: ['GB', 'DE'], lat: 51.5, lon: 6.5 },
  { id: 'ae', label: 'UAE', flag: 'AE', countries: ['AE'], lat: 24.4, lon: 54.4 },
  { id: 'au', label: 'Australia', flag: 'AU', countries: ['AU'], lat: -27.5, lon: 134 },
  { id: 'ca', label: 'Canada', flag: 'CA', countries: ['CA'], lat: 52, lon: -98 },
  { id: 'sg', label: 'Singapore', flag: 'SG', countries: ['SG'], lat: 1.35, lon: 103.8 },
];

export const HUBS: Hub[] = [...DEMO_HUBS];

/** Head office used as the source of the connection arcs (configured relationships: HQ ↔ regional hubs). */
export const HQ_CITY = 'mumbai';

/** Globe longitude to face for each demo region. */
const DEMO_FOCUS: Record<string, number> = { all: 62, asia: 82, 'north-america': -95, europe: 10, 'middle-east': 52, oceania: 140 };

/** Is the geography a live board's (true) or the demo one (false)? Live boards have no HQ arcs. */
export const GEO = { live: false, focus: { ...DEMO_FOCUS } as Record<string, number> };

export interface GeoContext {
  regions: { id: RegionId; label: string; hue: Hue }[];
  countries: Record<CountryCode, { name: string; zone: RegionId }>;
  hubs: Hub[];
  focus: Record<string, number>;
}

function replace<T extends object>(target: T, src: T) {
  for (const k of Object.keys(target)) delete (target as Record<string, unknown>)[k];
  Object.assign(target, src);
}

/** Switch the shared geography to a live board's (or back to the demo one with null). Call before showing its numbers. */
export function applyGeo(ctx: GeoContext | null) {
  if (!ctx) {
    replace(REGIONS, DEMO_REGIONS);
    replace(COUNTRIES, DEMO_COUNTRIES);
    HUBS.splice(0, HUBS.length, ...DEMO_HUBS);
    GEO.live = false;
    GEO.focus = { ...DEMO_FOCUS };
  } else {
    replace(REGIONS, Object.fromEntries(ctx.regions.map((r) => [r.id, { label: r.label, hue: r.hue }])));
    replace(COUNTRIES, Object.fromEntries(Object.entries(ctx.countries).map(([k, v]) => [k, { name: v.name, region: v.zone }])));
    HUBS.splice(0, HUBS.length, ...ctx.hubs);
    GEO.live = true;
    GEO.focus = { ...ctx.focus };
  }
  REGION_IDS.splice(0, REGION_IDS.length, ...Object.keys(REGIONS));
}

export const regionLabel = (id: RegionId) => REGIONS[id]?.label ?? id;
export const regionHue = (id: RegionId): Hue => REGIONS[id]?.hue ?? 'slate';
export const countryName = (code: CountryCode) => COUNTRIES[code]?.name ?? code;
