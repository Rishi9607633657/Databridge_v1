/* "Customer Distribution" (title follows the domain): donut with the total in the middle and a legend
   with shares. Can switch between the domain's segments and regions. */
import { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useApp } from '../../app/state';
import { useData } from '../../app/data';
import { Card } from '../ui/Card';
import { Dropdown } from '../ui/Dropdown';
import { CardSkeleton, EmptyState } from '../ui/States';
import { hue } from '../../lib/palette';
import { formatValue } from '../../lib/format';
import { useChartTheme } from '../../lib/hooks';

export function DistributionCard() {
  const { domain, fo, reducedMotion } = useApp();
  const { overview } = useData();
  const ct = useChartTheme();
  const [bySel, setBy] = useState<'segment' | 'region'>('segment');
  const [active, setActive] = useState<number | null>(null);
  const hasSegments = domain.segments.items.length > 0;
  const by = hasSegments ? bySel : 'region';
  const items = overview ? (by === 'segment' ? overview.segments : overview.segmentsByRegion) : [];
  const total = items.reduce((s, x) => s + x.value, 0);
  const fmt = domain.series[domain.segments.series ?? 'people'].format;
  const sel = active != null ? items[active] : null;
  return (
    <Card
      id="distribution"
      className="card-dist"
      title={domain.segments.title}
      actions={
        hasSegments ? (
          <Dropdown label="Breakdown" value={by} onChange={(v) => { setBy(v as 'segment' | 'region'); setActive(null); }} options={[{ value: 'segment', label: 'By segment' }, { value: 'region', label: 'By region' }]} />
        ) : (
          <span className="card-hint">By region</span>
        )
      }
    >
      {!overview ? (
        <CardSkeleton lines={5} />
      ) : !items.length || total <= 0 ? (
        <EmptyState title="Nothing to show for this period" />
      ) : (
        <div className="dist">
          <div className="dist-chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={items.map((x) => ({ name: x.def.label, value: x.value }))}
                  dataKey="value"
                  innerRadius="64%"
                  outerRadius="96%"
                  paddingAngle={2}
                  cornerRadius={6}
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                  isAnimationActive={!reducedMotion}
                  onMouseEnter={(_, i) => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                >
                  {items.map((x, i) => (
                    <Cell key={x.def.id} fill={hue(x.def.hue).base} opacity={active == null || active === i ? 1 : 0.35} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active: a, payload }) =>
                    a && payload?.length ? (
                      <div className="chart-tip" style={{ background: ct.tipBg, color: ct.tipText }}>
                        <span className="tip-date">{String(payload[0].name)}</span>
                        <strong>{formatValue(Number(payload[0].value), fmt, fo)}</strong>
                      </div>
                    ) : null
                  }
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="dist-center" aria-hidden="true">
              <strong>{formatValue(sel ? sel.value : total, fmt, fo)}</strong>
              <span>{sel ? sel.def.label : `Total ${domain.segments.noun}`}</span>
            </div>
          </div>
          <ul className="legend" aria-label={`${domain.segments.title} shares`}>
            {items.map((x, i) => (
              <li key={x.def.id} className={active === i ? 'on' : ''} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}>
                <span className="lg-dot" style={{ background: hue(x.def.hue).base }} aria-hidden="true" />
                <span className="lg-label">{x.def.label}</span>
                <span className="lg-val">{(x.share * 100).toFixed(0)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
