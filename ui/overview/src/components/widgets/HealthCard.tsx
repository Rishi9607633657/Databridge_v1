/* System Health: CPU, memory, storage and network as ring gauges.
   Live from the DataBridge host when available (see healthService); otherwise a labelled simulation. */
import { useApp } from '../../app/state';
import { useData } from '../../app/data';
import { Card } from '../ui/Card';
import { SourceTag } from '../ui/States';
import { HUES } from '../../lib/palette';
import type { Hue } from '../../domains/types';

export function Ring({ value, label, hueName, sub, size = 84 }: { value: number; label: string; hueName: Hue; sub?: string; size?: number }) {
  const h = HUES[hueName];
  const r = 34;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  const id = `rg-${label.replace(/\W/g, '')}`;
  return (
    <figure className="ring-g" style={{ width: '100%', maxWidth: size }}>
      <svg viewBox="0 0 84 84" width={size} height={size} role="img" aria-label={`${label} ${Math.round(v * 100)}%${sub ? `, ${sub}` : ''}`}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={h.from} />
            <stop offset="1" stopColor={h.to} />
          </linearGradient>
        </defs>
        <circle cx="42" cy="42" r={r} className="ring-track" strokeWidth="8" fill="none" />
        {v > 0.004 && <circle cx="42" cy="42" r={r} stroke={`url(#${id})`} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={`${c * v} ${c}`} transform="rotate(-90 42 42)" className="ring-val" />}
        <text x="42" y="37" textAnchor="middle" className="ring-label">{label}</text>
        <text x="42" y="54" textAnchor="middle" className="ring-num">{Math.round(v * 100)}%</text>
      </svg>
      {sub && <figcaption>{sub}</figcaption>}
    </figure>
  );
}

export function HealthCard() {
  const { reducedMotion } = useApp();
  const { health } = useData();
  const live = health?.source === 'live';
  return (
    <Card
      id="health"
      className="card-health"
      title="System Health"
      actions={<SourceTag source={live ? 'live' : 'simulated'} title={live ? `Live from the DataBridge host${health?.host ? ` (${health.host})` : ''}` : 'Simulated values: open this page inside DataBridge while signed in for live host metrics'} />}
    >
      <div className={`rings ${reducedMotion ? 'still' : ''}`}>
        <Ring value={health?.cpu ?? 0} label="CPU" hueName="teal" size={112} />
        <Ring value={health?.memory ?? 0} label="Memory" hueName="blue" size={112} />
        <Ring value={health?.storage ?? 0} label="Storage" hueName="violet" size={112} />
        <Ring value={health?.network ?? 0} label="Network" hueName="amber" size={112} sub={health ? `${health.networkMbps} Mbps` : undefined} />
      </div>
    </Card>
  );
}
