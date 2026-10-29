/* Number formatting: Indian (₹28.4L, 2.84 Cr, 1,85,420) or international (₹2.8M, 185.4K). */
import type { ValueFormat } from '../domains/types';

export type NumberSystem = 'indian' | 'international';

export interface FormatOptions {
  currency: string;
  system: NumberSystem;
}

const trim = (s: string) => s.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');

function compact(v: number, system: NumberSystem, digits?: number): string {
  const a = Math.abs(v);
  const sign = v < 0 ? '−' : '';
  if (system === 'indian') {
    if (a >= 1e7) return `${sign}${trim((a / 1e7).toFixed(digits ?? (a >= 1e9 ? 0 : 2)))} Cr`;
    if (a >= 1e5) return `${sign}${trim((a / 1e5).toFixed(digits ?? 1))}L`;
    if (a >= 1e3) return `${sign}${trim((a / 1e3).toFixed(digits ?? 1))}K`;
  } else {
    if (a >= 1e9) return `${sign}${trim((a / 1e9).toFixed(digits ?? 2))}B`;
    if (a >= 1e6) return `${sign}${trim((a / 1e6).toFixed(digits ?? 1))}M`;
    if (a >= 1e3) return `${sign}${trim((a / 1e3).toFixed(digits ?? 1))}K`;
  }
  return `${sign}${trim(a.toFixed(a >= 100 ? 0 : a >= 10 ? 1 : 2))}`;
}

function grouped(v: number, system: NumberSystem): string {
  return new Intl.NumberFormat(system === 'indian' ? 'en-IN' : 'en-US', { maximumFractionDigits: 0 }).format(Math.round(v));
}

/** Headline value: compact for big numbers, full digits for small counts (18,542). */
export function formatValue(v: number | null | undefined, format: ValueFormat, o: FormatOptions, opts: { full?: boolean } = {}): string {
  if (v == null || !Number.isFinite(v)) return '—';
  if (format === 'percent') return `${trim((v * 100).toFixed(Math.abs(v) >= 0.1 ? 1 : 2))}%`;
  if (format === 'currency') {
    if (opts.full) return `${o.currency}${grouped(v, o.system)}`;
    return `${o.currency}${Math.abs(v) < 1e5 ? grouped(v, o.system) : compact(v, o.system)}`;
  }
  if (opts.full || Math.abs(v) < 1e5) return grouped(v, o.system);
  return compact(v, o.system);
}

/** Short labels for axes and bars: always compact (₹12L, 8.6K). */
export function formatAxis(v: number, format: ValueFormat, o: FormatOptions): string {
  if (format === 'percent') return `${Math.round(v * 100)}%`;
  const s = Math.abs(v) < 1000 ? trim(v.toFixed(Math.abs(v) >= 100 ? 0 : 1)) : compact(v, o.system, 1);
  return format === 'currency' ? `${o.currency}${s}` : s;
}

/** Change as a ratio (0.18 → "18%"; 0.034 → "3.4%"). */
export function formatDelta(d: number | null | undefined): string {
  if (d == null || !Number.isFinite(d)) return '—';
  const p = Math.abs(d * 100);
  return `${trim(p.toFixed(p < 10 ? 1 : 0))}%`;
}

/** Change in percentage points for rates (OEE 78% → 80% = "2.0 pts"). */
export function formatPoints(d: number): string {
  return `${trim(Math.abs(d * 100).toFixed(1))} pts`;
}

export const pct = (part: number, whole: number) => (whole > 0 ? part / whole : 0);
