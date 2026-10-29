/* Geography helpers shared by the 3D globe and the 2D map. The world outline is Natural Earth (public domain)
   from India's point of view, so India's borders follow the official Indian position. */

export interface WorldFeature {
  type: 'Feature';
  properties: { name: string; iso2: string | null; cont: string | null };
  geometry: { type: 'MultiPolygon'; coordinates: number[][][][] };
}
export interface World {
  type: 'FeatureCollection';
  features: WorldFeature[];
}

let worldPromise: Promise<World> | null = null;

/** Loaded on demand (separate chunk) so the first paint does not wait for the map. */
export function loadWorld(): Promise<World> {
  if (!worldPromise) worldPromise = import('../../data/geo/world-lite.json').then((m) => (m.default ?? m) as unknown as World);
  return worldPromise;
}

const RAD = Math.PI / 180;

/** Same convention as three.js SphereGeometry + an equirectangular texture (lon 0 → +x, 90°E → −z). */
export function latLonToXYZ(lat: number, lon: number, r = 1): [number, number, number] {
  const la = lat * RAD;
  const lo = lon * RAD;
  return [r * Math.cos(la) * Math.cos(lo), r * Math.sin(la), -r * Math.cos(la) * Math.sin(lo)];
}

/** Y rotation that brings a longitude to the front (towards the camera on +z). */
export const frontRotation = (lon: number) => -Math.PI / 2 - lon * RAD;

/** Equirectangular projection for the 2D map (x 0..w, y from lat 84 to −58). */
export const MAP_TOP = 84;
export const MAP_BOTTOM = -58;
export function project(lon: number, lat: number, w: number, h: number): [number, number] {
  return [((lon + 180) / 360) * w, ((MAP_TOP - lat) / (MAP_TOP - MAP_BOTTOM)) * h];
}

/* rough biome colouring by country so the globe reads like a stylised Earth */
const DESERT = new Set(['SA', 'EG', 'LY', 'DZ', 'ML', 'NE', 'TD', 'SD', 'MR', 'EH', 'YE', 'OM', 'AE', 'QA', 'KW', 'IQ', 'JO', 'TM', 'NA', 'BW', 'SO', 'ER', 'DJ', 'SY', 'AF', 'IR', 'MN', 'KZ', 'UZ', 'AU', 'TN', 'BH']);
const ICE = new Set(['AQ', 'GL']);
export function landColor(f: WorldFeature, seed: number): string {
  const iso = f.properties.iso2 || '';
  if (ICE.has(iso) || f.properties.name === 'Antarctica' || f.properties.name === 'Greenland') return '#EEF4FA';
  const j = ((seed * 9301 + 49297) % 233280) / 233280 - 0.5; // small per-country variation
  if (DESERT.has(iso)) return `hsl(${38 + j * 6}, ${52 + j * 10}%, ${70 + j * 4}%)`;
  return `hsl(${128 + j * 14}, ${42 + j * 10}%, ${50 + j * 6}%)`;
}

export function centroidLat(f: WorldFeature): number {
  let min = 90;
  let max = -90;
  for (const poly of f.geometry.coordinates) for (const [, la] of poly[0]) {
    if (la < min) min = la;
    if (la > max) max = la;
  }
  return (min + max) / 2;
}
