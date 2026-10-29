/* Deterministic random numbers so the demo data is stable between reloads (same domain → same numbers). */

export function hashString(s: string): number {
  let h1 = 0xdeadbeef ^ s.length;
  let h2 = 0x41c6ce57 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  return h1 >>> 0;
}

export type Rng = () => number;

export function rngFrom(seed: number | string): Rng {
  let a = typeof seed === 'string' ? hashString(seed) : seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard normal sample (Box–Muller). */
export function gauss(rng: Rng): number {
  const u = Math.max(rng(), 1e-9);
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export const pick = <T,>(rng: Rng, list: readonly T[]): T => list[Math.floor(rng() * list.length) % list.length];

export function weightedPick<T extends { weight: number }>(rng: Rng, list: readonly T[]): T {
  const total = list.reduce((s, x) => s + x.weight, 0);
  let r = rng() * total;
  for (const x of list) {
    r -= x.weight;
    if (r <= 0) return x;
  }
  return list[list.length - 1];
}

/** Shares around a base mix (each entity sells a slightly different mix). */
export function jitterShares(rng: Rng, base: readonly number[], amount = 0.35): number[] {
  const raw = base.map((b) => Math.max(0.002, b * (1 + (rng() * 2 - 1) * amount)));
  const sum = raw.reduce((s, x) => s + x, 0);
  return raw.map((x) => x / sum);
}
