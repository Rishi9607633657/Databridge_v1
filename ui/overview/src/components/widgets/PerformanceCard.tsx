/* "Sales Performance" (label follows the domain): area chart of the selected metric, by day/week/month,
   optionally against the previous period. Tooltip shows the change vs the same point of the previous period. */
import { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useApp } from '../../app/state';
import { useData } from '../../app/data';
import { Card } from '../ui/Card';
import { Dropdown } from '../ui/Dropdown';
import { Segmented } from '../ui/Segmented';
import { CardSkeleton, EmptyState } from '../ui/States';
import { Delta } from '../ui/Delta';
import type { SeriesKey } from '../../domains/types';
import type { DailyPoint } from '../../services/types';
import { autoGrain, bucketLabel, bucketLength, bucketOf, fmtDay, type Grain } from '../../lib/dates';
import { formatAxis, formatValue } from '../../lib/format';
import { useChartTheme } from '../../lib/hooks';

interface Point {
  key: number;
  label: string;
  value: number;
  prev: number | null;
  from: number;
  to: number;
}

const PREV: Record<SeriesKey, keyof DailyPoint> = { primary: 'prevPrimary', secondary: 'prevSecondary', people: 'prevPeople' };

/** weekly / monthly buckets; a first or last bucket with under half of its days in the range is left out
    (a 2-day "month" would look like a collapse) — `cut` says how many were left out */
export function bucketize(daily: DailyPoint[], metric: SeriesKey, grain: Grain, whole = false): Point[] & { cut?: number } {
  const map = new Map<number, Point>();
  for (const d of daily) {
    const key = bucketOf(d.day, grain);
    const p = map.get(key) || { key, label: bucketLabel(key, grain), value: 0, prev: 0, from: d.day, to: d.day };
    p.value += d[metric];
    const pv = d[PREV[metric]] as number | null;
    p.prev = p.prev == null || pv == null ? null : p.prev + pv;
    p.to = d.day;
    map.set(key, p);
  }
  const list: Point[] & { cut?: number } = [...map.values()].sort((a, b) => a.key - b.key);
  if (grain !== 'day' && list.length > 2 && !whole) {
    const thin = (p: Point) => p.to - p.from + 1 < bucketLength(p.key, grain) / 2;
    let cut = 0;
    if (thin(list[list.length - 1])) { list.pop(); cut += 1; }
    if (thin(list[0])) { list.shift(); cut += 1; }
    list.cut = cut;
  }
  return list;
}

export function PerformanceCard({ tall = false, initialMetric = 'primary', initialCompare = false }: { tall?: boolean; initialMetric?: SeriesKey; initialCompare?: boolean }) {
  const { domain, fo, resolved, reducedMotion } = useApp();
  const { overview } = useData();
  const ct = useChartTheme();
  const [metricSel, setMetric] = useState<SeriesKey>(initialMetric);
  const metric: SeriesKey = (domain.metrics ?? ['primary', 'secondary', 'people']).includes(metricSel) ? metricSel : 'primary';
  const [grainSel, setGrain] = useState<Grain | 'auto'>('auto');
  const [compare, setCompare] = useState(initialCompare);
  const floor = domain.live?.grain === 'month' ? 2 : domain.live?.grain === 'week' ? 1 : 0;
  const rankOf = (g: Grain) => (g === 'day' ? 0 : g === 'week' ? 1 : 2);
  const fit = (g: Grain): Grain => (rankOf(g) >= floor ? g : floor === 2 ? 'month' : 'week');
  const grain: Grain = fit(grainSel === 'auto' ? autoGrain(resolved.days) : grainSel);
  const metrics = domain.metrics ?? (['primary', 'secondary', 'people'] as SeriesKey[]);
  const fmt = domain.series[metric].format;
  /* a table with one row a month (or week) has whole buckets at that grain, whatever the range edges */
  const whole = (domain.live?.grain === 'month' && grain === 'month') || (domain.live?.grain === 'week' && grain === 'week');
  const data = useMemo(() => (overview ? bucketize(overview.daily, metric, grain, whole) : []), [overview, metric, grain, whole]);
  const gid = `perf-${metric}`;
  const title = `${domain.series.primary.label} Performance`;
  const grainOptions = [
    { value: 'auto' as const, label: `Auto (${fit(autoGrain(resolved.days)) === 'day' ? 'daily' : fit(autoGrain(resolved.days)) === 'week' ? 'weekly' : 'monthly'})` },
    { value: 'day' as const, label: 'Daily', disabled: resolved.days > 400 || floor > 0 },
    { value: 'week' as const, label: 'Weekly', disabled: resolved.days < 14 || floor > 1 },
    { value: 'month' as const, label: 'Monthly', disabled: resolved.days < 60 && floor < 2 },
  ];
  return (
    <Card
      id="performance"
      className="card-perf"
      title={title}
      sub={resolved.text}
      actions={<Dropdown label="Granularity" value={grainSel} onChange={(v) => setGrain(v as Grain | 'auto')} options={grainOptions} />}
    >
      <div className="perf-bar">
        <Segmented
          label="Metric"
          variant="pill"
          value={metric}
          onChange={setMetric}
          options={metrics.map((k) => ({ value: k, label: domain.series[k].label }))}
        />
        <label className="chk">
          <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} />
          <span>Previous period</span>
        </label>
      </div>
      {!overview ? (
        <CardSkeleton lines={5} />
      ) : !data.length ? (
        <EmptyState title="No data in this period">Pick a longer date range.</EmptyState>
      ) : (
        <div className={`perf-chart ${tall ? 'tall' : ''}`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 12, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ct.primary} stopOpacity={0.32} />
                  <stop offset="100%" stopColor={ct.primary} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={ct.grid} strokeDasharray="4 4" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: ct.axis, fontSize: 12 }} minTickGap={22} interval="preserveStartEnd" />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: ct.axis, fontSize: 12 }} width={56} tickFormatter={(v: number) => formatAxis(v, fmt, fo)} />
              <Tooltip
                cursor={{ stroke: ct.primary, strokeOpacity: 0.35, strokeDasharray: '4 4' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload as Point;
                  const ch = p.prev ? p.value / p.prev - 1 : null;
                  return (
                    <div className="chart-tip" style={{ background: ct.tipBg, color: ct.tipText }}>
                      <span className="tip-date">{grain === 'day' ? fmtDay(p.key, { weekday: true }) : p.from === p.to ? fmtDay(p.from) : `${fmtDay(p.from)} – ${fmtDay(p.to)}`}</span>
                      <strong>{formatValue(p.value, fmt, fo)}</strong>
                      {ch != null && <Delta value={ch} size="sm" />}
                      {compare && p.prev != null && <span className="tip-prev">Previous: {formatValue(p.prev, fmt, fo)}</span>}
                    </div>
                  );
                }}
              />
              {compare && <Area type="monotone" dataKey="prev" stroke={ct.prev} strokeDasharray="5 4" strokeWidth={1.6} fill="none" isAnimationActive={!reducedMotion} dot={false} activeDot={false} name="Previous period" />}
              <Area type="monotone" dataKey="value" stroke={ct.primary} strokeWidth={2.6} fill={`url(#${gid})`} isAnimationActive={!reducedMotion} animationDuration={700} dot={false} activeDot={{ r: 5, fill: ct.primary, stroke: '#fff', strokeWidth: 2 }} name={domain.series[metric].label} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      {!!data.cut && <p className="perf-note">Part-{grain === 'week' ? 'weeks' : 'months'} at the edges of the range are not drawn.</p>}
      <p className="sr-only">
        {domain.series[metric].label} for {resolved.text}: total {overview ? formatValue(data.reduce((s, p) => s + p.value, 0), fmt, fo) : ''}.
      </p>
    </Card>
  );
}
