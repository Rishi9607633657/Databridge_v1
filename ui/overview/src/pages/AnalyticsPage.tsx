/* Analytics: trend (with forecast), breakdown by region / category / segment / city, and the full locations table. */
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDown, ArrowUp, Download } from 'lucide-react';
import { useApp } from '../app/state';
import { useData } from '../app/data';
import { PageHeader } from '../components/ui/PageHeader';
import { Segmented } from '../components/ui/Segmented';
import { Card } from '../components/ui/Card';
import { CardSkeleton, EmptyState, SourceTag } from '../components/ui/States';
import { Delta } from '../components/ui/Delta';
import { Dropdown } from '../components/ui/Dropdown';
import { PerformanceCard } from '../components/widgets/PerformanceCard';
import { EntityThumb } from '../components/misc/EntityThumb';
import { regionHue, regionLabel } from '../domains/places';
import type { SeriesKey, ValueFormat } from '../domains/types';
import { hue, HUE_ORDER, HUES } from '../lib/palette';
import { formatAxis, formatValue } from '../lib/format';
import { fmtMonth, fmtDay, isoOf, todayDay } from '../lib/dates';
import { useChartTheme } from '../lib/hooks';
import { downloadCsv } from '../lib/csv';
import type { EntityStat } from '../services/types';

type Tab = 'trend' | 'breakdown' | 'locations';
type Dim = 'region' | 'category' | 'segment' | 'city';

export default function AnalyticsPage() {
  const [params, setParams] = useSearchParams();
  const { domain, resolved, region } = useApp();
  const tab = (['trend', 'breakdown', 'locations'].includes(params.get('tab') || '') ? params.get('tab') : 'trend') as Tab;
  const set = (patch: Record<string, string>) => setParams({ ...Object.fromEntries(params), ...patch }, { replace: true });
  return (
    <>
      <PageHeader
        title="Analytics"
        sub={`${domain.label} · ${resolved.text} · ${region === 'all' ? 'All regions' : regionLabel(region)}`}
        actions={<SourceTag source={domain.live ? 'live' : 'demo'} />}
      />
      <div className="toolbar">
        <Segmented label="Analytics view" variant="tabs" value={tab} onChange={(t) => setParams({ tab: t }, { replace: true })} options={[{ value: 'trend', label: 'Trend' }, { value: 'breakdown', label: 'Breakdown' }, { value: 'locations', label: domain.entity.plural }]} />
      </div>
      {tab === 'trend' && <TrendView metric={(params.get('metric') as SeriesKey) || 'primary'} forecast={params.get('forecast') === '1'} />}
      {tab === 'breakdown' && <BreakdownView dim={(params.get('dim') as Dim) || 'region'} onDim={(d) => set({ dim: d })} />}
      {tab === 'locations' && <LocationsView q={params.get('q') || ''} />}
    </>
  );
}

function TrendView({ metric, forecast }: { metric: SeriesKey; forecast: boolean }) {
  const { domain, fo } = useApp();
  const { overview } = useData();
  const ct = useChartTheme();
  const m: SeriesKey = (domain.metrics ?? ['primary', 'secondary', 'people']).includes(metric) ? metric : 'primary';
  const unit = domain.live?.grain === 'month' ? 'month' : domain.live?.grain === 'week' ? 'week' : 'day';
  const when = (day: number) => (unit === 'month' ? fmtMonth(day) : fmtDay(day, { weekday: unit === 'day', year: true }));
  const stats = useMemo(() => {
    if (!overview?.daily.length) return null;
    /* a live table only counts days that have rows (a monthly table has one row a month) */
    const vals = overview.daily.filter((d) => !domain.live || d.primary > 0 || d.secondary > 0).map((d) => ({ day: d.day, v: d[m] }));
    if (!vals.length) return null;
    const total = vals.reduce((s, x) => s + x.v, 0);
    const best = vals.reduce((a, b) => (b.v > a.v ? b : a));
    const worst = vals.reduce((a, b) => (b.v < a.v ? b : a));
    return { total, avg: total / vals.length, best, worst };
  }, [overview, m, domain.live]);
  const fc = overview?.forecast;
  const fdata = fc ? [...fc.actual.map((p) => ({ day: p.day, actual: p.value, forecast: null as number | null })), ...fc.points.map((p) => ({ day: p.day, actual: null as number | null, forecast: p.value }))] : [];
  if (fc && fdata.length > fc.actual.length) fdata[fc.actual.length - 1].forecast = fc.actual[fc.actual.length - 1].value;
  const fmt: ValueFormat = domain.series[m].format;
  const P = domain.series.primary;
  return (
    <div className="stack">
      <PerformanceCard tall initialMetric={m} initialCompare />
      <div className="grid-3">
        <Card title="Total" sub={domain.series[m].label}>
          <p className="kpi-value">{stats ? formatValue(stats.total, fmt, fo) : '—'}</p>
          <p className="muted small">Average per {unit} {stats ? formatValue(stats.avg, fmt, fo) : '—'}</p>
        </Card>
        <Card title={`Best ${unit}`} sub={stats ? when(stats.best.day) : ''}>
          <p className="kpi-value">{stats ? formatValue(stats.best.v, fmt, fo) : '—'}</p>
        </Card>
        <Card title={`Lowest ${unit}`} sub={stats ? when(stats.worst.day) : ''}>
          <p className="kpi-value">{stats ? formatValue(stats.worst.v, fmt, fo) : '—'}</p>
        </Card>
      </div>
      <Card id="forecast" title={`${P.label} forecast · next 7 days`} sub="Linear trend on the last 28 days with the weekday pattern (demo model)" actions={fc ? <Delta value={fc.delta} /> : undefined} className={forecast ? 'focus-card' : ''}>
        {!fc ? (
          <CardSkeleton />
        ) : (
          <div className="perf-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fdata} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={ct.grid} strokeDasharray="4 4" />
                <XAxis dataKey="day" tickFormatter={(d: number) => fmtDay(d)} tickLine={false} axisLine={false} tick={{ fill: ct.axis, fontSize: 12 }} minTickGap={20} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: ct.axis, fontSize: 12 }} width={56} tickFormatter={(v: number) => formatAxis(v, P.format, fo)} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0].payload as { day: number; actual: number | null; forecast: number | null };
                    return (
                      <div className="chart-tip" style={{ background: ct.tipBg, color: ct.tipText }}>
                        <span className="tip-date">{fmtDay(row.day, { weekday: true })} · {row.actual != null ? 'actual' : 'forecast'}</span>
                        <strong>{formatValue(row.actual ?? row.forecast ?? 0, P.format, fo)}</strong>
                      </div>
                    );
                  }}
                />
                <Line type="monotone" dataKey="actual" stroke={ct.primary} strokeWidth={2.4} dot={false} connectNulls={false} name="Actual" />
                <Line type="monotone" dataKey="forecast" stroke={HUES.rose.base} strokeWidth={2.4} strokeDasharray="6 5" dot={{ r: 3 }} connectNulls={false} name="Forecast" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <p className="card-note">Total forecast {fc ? formatValue(fc.total, P.format, fo) : '—'} vs {fc ? formatValue(fc.lastTotal, P.format, fo) : '—'} in the last 7 days.</p>
      </Card>
    </div>
  );
}

interface BRow {
  id: string;
  label: string;
  value: number;
  share: number;
  change: number | null;
  color: string;
}

function BreakdownView({ dim, onDim }: { dim: Dim; onDim: (d: Dim) => void }) {
  const { domain, fo } = useApp();
  const { overview } = useData();
  const ct = useChartTheme();
  const rows = useMemo<BRow[]>(() => {
    if (!overview) return [];
    if (dim === 'region') {
      const t = overview.regions.reduce((s, r) => s + r.value, 0) || 1;
      return overview.regions.map((r) => ({ id: r.id, label: r.label, value: r.value, share: r.value / t, change: r.growth, color: hue(r.hue).base }));
    }
    if (dim === 'category') return overview.categories.map((c) => ({ id: c.def.id, label: c.def.label, value: c.value, share: c.share, change: c.growth, color: hue(c.def.hue).base }));
    if (dim === 'segment') return overview.segments.map((c) => ({ id: c.def.id, label: c.def.label, value: c.value, share: c.share, change: c.growth, color: hue(c.def.hue).base }));
    const map = new Map<string, { label: string; value: number; prev: number; region: string }>();
    for (const e of overview.entities) {
      const g = map.get(e.entity.city.id) || { label: e.entity.city.name, value: 0, prev: 0, region: e.entity.region };
      g.value += e.value;
      g.prev += e.prev;
      map.set(e.entity.city.id, g);
    }
    const t = [...map.values()].reduce((s, x) => s + x.value, 0) || 1;
    return [...map.entries()].map(([id, g], i) => ({ id, label: g.label, value: g.value, share: g.value / t, change: g.prev > 0 ? g.value / g.prev - 1 : null, color: HUES[HUE_ORDER[i % HUE_ORDER.length]].base }));
  }, [overview, dim]);
  const sorted = [...rows].sort((a, b) => b.value - a.value);
  const fmt: ValueFormat = dim === 'segment' ? domain.series.people.format : domain.series.primary.format;
  const measure = dim === 'segment' ? domain.series.people.label : domain.series.primary.label;
  const changeLabel = dim === 'category' || dim === 'segment' ? 'Change in share' : 'Change';
  return (
    <Card
      title={`${measure} by ${dim}`}
      actions={
        <>
          <Dropdown label="Break down by" value={dim} onChange={(v) => onDim(v as Dim)} options={[{ value: 'region', label: 'Region' }, { value: 'category', label: domain.categories.title.replace(/^.* by /, '') || 'Category' }, { value: 'segment', label: 'Segment' }, { value: 'city', label: 'City' }]} />
          <button type="button" className="btn sm" onClick={() => downloadCsv(`${domain.id}-by-${dim}-${isoOf(todayDay())}`, [[dim, measure, 'share_pct', 'change_pct'], ...sorted.map((r) => [r.label, Math.round(r.value), Number((r.share * 100).toFixed(1)), r.change == null ? null : Number((r.change * 100).toFixed(1))])])}>
            <Download size={15} aria-hidden="true" /> CSV
          </button>
        </>
      }
    >
      {!overview ? (
        <CardSkeleton />
      ) : !sorted.length ? (
        <EmptyState title="Nothing to break down" />
      ) : (
        <div className="grid-2" style={{ marginBottom: 0 }}>
          <div style={{ height: Math.max(220, sorted.length * 34 + 30) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
                <CartesianGrid horizontal={false} stroke={ct.grid} strokeDasharray="4 4" />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: ct.axis, fontSize: 12 }} tickFormatter={(v: number) => formatAxis(v, fmt, fo)} />
                <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} tick={{ fill: ct.text, fontSize: 12.5 }} width={130} />
                <Tooltip
                  cursor={{ fill: ct.track }}
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="chart-tip" style={{ background: ct.tipBg, color: ct.tipText }}>
                        <span className="tip-date">{String(payload[0].payload.label)}</span>
                        <strong>{formatValue(Number(payload[0].value), fmt, fo)}</strong>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={18}>
                  {sorted.map((r) => (
                    <Cell key={r.id} fill={r.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th scope="col">{dim[0].toUpperCase() + dim.slice(1)}</th>
                  <th scope="col" className="num">{measure}</th>
                  <th scope="col" className="num">Share</th>
                  <th scope="col" className="num">{changeLabel}</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className="cell-main"><span className="lg-dot" style={{ background: r.color }} aria-hidden="true" />{r.label}</span>
                    </td>
                    <td className="num">{formatValue(r.value, fmt, fo)}</td>
                    <td className="num">{(r.share * 100).toFixed(1)}%</td>
                    <td className="num"><Delta value={r.change} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}

type SortKey = 'rank' | 'name' | 'city' | 'value' | 'growth' | 'secondary';
const PAGE = 15;

function LocationsView({ q: initialQ }: { q: string }) {
  const { domain, fo, setSelectedEntityId } = useApp();
  const { overview } = useData();
  const [q, setQ] = useState(initialQ);
  const [status, setStatus] = useState<'all' | 'open' | 'closed'>('all');
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'rank', dir: 1 });
  const [page, setPage] = useState(0);
  const rows = useMemo(() => {
    let list: EntityStat[] = overview?.entities ?? [];
    const s = q.trim().toLowerCase();
    if (s) list = list.filter((x) => `${x.entity.name} ${x.entity.city.name} ${regionLabel(x.entity.region)}`.toLowerCase().includes(s));
    if (status !== 'all') list = list.filter((x) => (status === 'open' ? x.openToday : !x.openToday));
    const val = (x: EntityStat): number | string => {
      switch (sort.key) {
        case 'name': return x.entity.name;
        case 'city': return x.entity.city.name;
        case 'value': return x.value;
        case 'growth': return x.growth ?? -Infinity;
        case 'secondary': return x.secondary;
        default: return x.rank;
      }
    };
    return [...list].sort((a, b) => {
      const va = val(a);
      const vb = val(b);
      return (typeof va === 'string' ? va.localeCompare(vb as string) : va - (vb as number)) * sort.dir;
    });
  }, [overview, q, status, sort]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const cur = Math.min(page, pages - 1);
  const shown = rows.slice(cur * PAGE, cur * PAGE + PAGE);
  const th = (key: SortKey, label: string, num = false) => (
    <th scope="col" className={num ? 'num' : ''} aria-sort={sort.key === key ? (sort.dir === 1 ? 'ascending' : 'descending') : undefined}>
      <button type="button" onClick={() => setSort((s) => ({ key, dir: s.key === key ? ((-s.dir) as 1 | -1) : key === 'name' || key === 'city' || key === 'rank' ? 1 : -1 }))}>
        {label}
        {sort.key === key && (sort.dir === 1 ? <ArrowUp size={13} aria-hidden="true" /> : <ArrowDown size={13} aria-hidden="true" />)}
      </button>
    </th>
  );
  return (
    <Card
      title={`All ${domain.entity.plural.toLowerCase()}`}
      sub={`${rows.length} of ${overview?.entities.length ?? 0}`}
      actions={
        <button type="button" className="btn sm" disabled={!rows.length} onClick={() => downloadCsv(`${domain.id}-${domain.entity.plural.toLowerCase()}`, [['rank', domain.entity.singular, 'city', 'region', domain.series.primary.label, 'growth_pct', domain.series.secondary.label, 'open'], ...rows.map((x) => [x.rank, x.entity.name, x.entity.city.name, regionLabel(x.entity.region), Math.round(x.value), x.growth == null ? null : Number((x.growth * 100).toFixed(1)), Math.round(x.secondary), x.openToday ? 'yes' : 'no'])])}>
          <Download size={15} aria-hidden="true" /> CSV
        </button>
      }
    >
      <div className="toolbar">
        <input className="inp" type="search" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder={`Search ${domain.entity.plural.toLowerCase()} or cities`} aria-label={`Search ${domain.entity.plural}`} />
        <div className="chips" role="group" aria-label="Status">
          {(['all', 'open', 'closed'] as const).map((s) => (
            <button key={s} type="button" className={status === s ? 'on' : ''} aria-pressed={status === s} onClick={() => { setStatus(s); setPage(0); }}>
              {s === 'all' ? 'All' : s === 'open' ? 'Open' : 'Closed'}
            </button>
          ))}
        </div>
      </div>
      {!overview ? (
        <CardSkeleton />
      ) : !rows.length ? (
        <EmptyState title="No matches">Try a different search or status.</EmptyState>
      ) : (
        <>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  {th('rank', '#')}
                  {th('name', domain.entity.singular)}
                  {th('city', 'City')}
                  {th('value', domain.series.primary.label, true)}
                  {th('growth', 'Change', true)}
                  {th('secondary', domain.series.secondary.label, true)}
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((x) => (
                  <tr key={x.entity.id} className="click" onClick={() => setSelectedEntityId(x.entity.id)}>
                    <td>{x.rank}</td>
                    <td>
                      <button type="button" className="cell-main link-plain" onClick={(e) => { e.stopPropagation(); setSelectedEntityId(x.entity.id); }}>
                        <EntityThumb kind={domain.entity.building} color={hue(regionHue(x.entity.region)).base} size={30} />
                        <strong>{x.entity.name}</strong>
                      </button>
                    </td>
                    <td>{x.entity.city.name}</td>
                    <td className="num">{formatValue(x.value, domain.series.primary.format, fo)}</td>
                    <td className="num"><Delta value={x.growth} size="sm" /></td>
                    <td className="num">{formatValue(x.secondary, domain.series.secondary.format, fo)}</td>
                    <td><span className={`badge ${x.openToday ? 'ok' : 'warn'}`}>{x.openToday ? 'Open' : 'Closed'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pager">
            <span>
              Showing {cur * PAGE + 1}–{Math.min(rows.length, cur * PAGE + PAGE)} of {rows.length}
            </span>
            <span className="page-actions">
              <button type="button" className="btn sm" disabled={cur === 0} onClick={() => setPage(cur - 1)}>Previous</button>
              <button type="button" className="btn sm" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>Next</button>
            </span>
          </div>
        </>
      )}
    </Card>
  );
}
