/* Dates as local "day numbers" (days since 1970-01-01 in the viewer's time zone) — simple to add, compare and bucket. */

export type PresetId = 'today' | '7d' | '28d' | '30d' | '90d' | 'mtd' | 'qtd' | 'ytd' | '12m' | 'custom';

export interface RangeState {
  preset: PresetId;
  from?: string; // yyyy-mm-dd, for custom
  to?: string;
}

export interface ResolvedRange {
  from: number;
  to: number;
  days: number;
  label: string; // "Last 28 days"
  text: string; // "Oct 1, 2026 – Oct 28, 2026"
  /** previous period only: it starts before the first day with data, so comparisons would be misleading */
  partial?: boolean;
}

export const PRESETS: { id: PresetId; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: 'Last 7 days' },
  { id: '28d', label: 'Last 28 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: '90d', label: 'Last 90 days' },
  { id: 'mtd', label: 'Month to date' },
  { id: 'qtd', label: 'Quarter to date' },
  { id: 'ytd', label: 'Year to date' },
  { id: '12m', label: 'Last 12 months' },
  { id: 'custom', label: 'Custom range' },
];

const MS = 86400000;

export function dayOf(d: Date): number {
  return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / MS);
}

export function dateOf(day: number): Date {
  const u = new Date(day * MS);
  return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate());
}

export const todayDay = () => dayOf(new Date());

export function isoOf(day: number): string {
  const d = dateOf(day);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function dayFromIso(s: string | undefined): number | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split('-').map(Number);
  return dayOf(new Date(y, m - 1, d));
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function fmtDay(day: number, opts: { year?: boolean; weekday?: boolean } = {}): string {
  const d = dateOf(day);
  const s = `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  return `${opts.weekday ? `${WEEKDAYS[d.getDay()]}, ` : ''}${s}${opts.year ? `, ${d.getFullYear()}` : ''}`;
}

export const fmtMonth = (day: number) => {
  const d = dateOf(day);
  return `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
};

export const weekdayOf = (day: number) => dateOf(day).getDay();

/** Resolve a preset to concrete days. `minDay` is the oldest day that has data. */
export function resolveRange(r: RangeState, today: number, minDay: number): ResolvedRange {
  const t = dateOf(today);
  let from = today - 27;
  let to = today;
  switch (r.preset) {
    case 'today': from = today; break;
    case '7d': from = today - 6; break;
    case '28d': from = today - 27; break;
    case '30d': from = today - 29; break;
    case '90d': from = today - 89; break;
    case 'mtd': from = dayOf(new Date(t.getFullYear(), t.getMonth(), 1)); break;
    case 'qtd': from = dayOf(new Date(t.getFullYear(), Math.floor(t.getMonth() / 3) * 3, 1)); break;
    case 'ytd': from = dayOf(new Date(t.getFullYear(), 0, 1)); break;
    case '12m': from = today - 364; break;
    case 'custom': {
      const f = dayFromIso(r.from);
      const e = dayFromIso(r.to);
      if (f != null && e != null) {
        from = Math.min(f, e);
        to = Math.max(f, e);
      }
      break;
    }
  }
  to = Math.min(Math.max(to, minDay), today);
  from = Math.min(Math.max(from, minDay), to);
  const days = to - from + 1;
  const preset = PRESETS.find((p) => p.id === r.preset);
  const label = r.preset === 'custom' ? `${days} day${days === 1 ? '' : 's'}` : preset?.label ?? '';
  const text = from === to ? fmtDay(from, { year: true }) : `${fmtDay(from, { year: true })} – ${fmtDay(to, { year: true })}`;
  return { from, to, days, label, text };
}

/** The period just before a range, same length (for "vs previous period"). */
export function previousRange(r: ResolvedRange, minDay: number): ResolvedRange {
  const to = r.from - 1;
  const want = to - r.days + 1;
  const from = Math.max(minDay, want);
  const days = Math.max(0, to - from + 1);
  return { from, to, days, partial: want < minDay, label: 'Previous period', text: days ? `${fmtDay(from, { year: true })} – ${fmtDay(to, { year: true })}` : 'No earlier data' };
}

/** days in the week / month bucket that starts at `key` */
export function bucketLength(key: number, grain: Grain): number {
  if (grain === 'day') return 1;
  if (grain === 'week') return 7;
  const d = dateOf(key);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

export type Grain = 'day' | 'week' | 'month';

export function autoGrain(days: number): Grain {
  return days <= 45 ? 'day' : days <= 200 ? 'week' : 'month';
}

/** Bucket key for a day at a grain (week buckets start on Monday). */
export function bucketOf(day: number, grain: Grain): number {
  if (grain === 'day') return day;
  if (grain === 'week') return day - ((weekdayOf(day) + 6) % 7);
  const d = dateOf(day);
  return dayOf(new Date(d.getFullYear(), d.getMonth(), 1));
}

export function bucketLabel(key: number, grain: Grain): string {
  if (grain === 'month') return fmtMonth(key);
  return fmtDay(key);
}

export function fmtTime(d: Date): string {
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
