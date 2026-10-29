/* Monitoring: system health (live or simulated) with history, and the full event log with filters. */
import { useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Pause, Play } from 'lucide-react';
import { useApp } from '../app/state';
import { useData } from '../app/data';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { EmptyState, SourceTag } from '../components/ui/States';
import { HealthCard } from '../components/widgets/HealthCard';
import { EVENT_STYLE, EventRow } from '../components/widgets/EventsCard';
import type { EventType } from '../domains/types';
import { HUES } from '../lib/palette';
import { useChartTheme } from '../lib/hooks';

export default function MonitoringPage() {
  const { reducedMotion } = useApp();
  const { healthHistory, health, events, eventsPaused, setEventsPaused } = useData();
  const ct = useChartTheme();
  const [type, setType] = useState<'all' | EventType>('all');
  const live = health?.source === 'live';
  const data = healthHistory.map((h) => ({
    t: new Date(h.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    CPU: Math.round(h.cpu * 100),
    Memory: Math.round(h.memory * 100),
    Network: Math.round(h.network * 100),
  }));
  const shown = events.filter((e) => type === 'all' || e.type === type);
  return (
    <>
      <PageHeader title="Monitoring" sub="Platform health and the activity stream." actions={<SourceTag source={live ? 'live' : 'simulated'} />} />
      <div className="grid-2">
        <HealthCard />
        <Card title="Last few minutes" sub={live ? `DataBridge host${health?.host ? ` · ${health.host}` : ''}` : 'Simulated values'}>
          {data.length < 2 ? (
            <EmptyState title="Collecting samples…">A sample is taken every 3 seconds.</EmptyState>
          ) : (
            <div className="perf-chart" style={{ minHeight: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={ct.grid} strokeDasharray="4 4" />
                  <XAxis dataKey="t" tickLine={false} axisLine={false} tick={{ fill: ct.axis, fontSize: 11 }} minTickGap={30} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: ct.axis, fontSize: 11 }} width={40} domain={[0, 100]} unit="%" />
                  <Tooltip contentStyle={{ background: ct.tipBg, border: 0, borderRadius: 12, color: ct.tipText }} labelStyle={{ color: ct.tipText }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="CPU" stroke={HUES.teal.base} strokeWidth={2} dot={false} isAnimationActive={!reducedMotion} />
                  <Line type="monotone" dataKey="Memory" stroke={HUES.blue.base} strokeWidth={2} dot={false} isAnimationActive={!reducedMotion} />
                  <Line type="monotone" dataKey="Network" stroke={HUES.amber.base} strokeWidth={2} dot={false} isAnimationActive={!reducedMotion} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
      <Card
        title="Event log"
        sub={`${shown.length} events · simulated stream`}
        actions={
          <button type="button" className="btn sm" onClick={() => setEventsPaused(!eventsPaused)} aria-pressed={eventsPaused}>
            {eventsPaused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />} {eventsPaused ? 'Resume stream' : 'Pause stream'}
          </button>
        }
      >
        <div className="toolbar">
          <div className="chips" role="group" aria-label="Event type">
            <button type="button" className={type === 'all' ? 'on' : ''} aria-pressed={type === 'all'} onClick={() => setType('all')}>All</button>
            {(Object.keys(EVENT_STYLE) as EventType[]).map((t) => (
              <button key={t} type="button" className={type === t ? 'on' : ''} aria-pressed={type === t} onClick={() => setType(t)}>
                {EVENT_STYLE[t].label}
              </button>
            ))}
          </div>
        </div>
        {!shown.length ? (
          <EmptyState title="No events of this type yet" />
        ) : (
          <ul className="ev-list">
            {shown.slice(0, 60).map((e) => (
              <EventRow key={e.id} e={e} />
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
