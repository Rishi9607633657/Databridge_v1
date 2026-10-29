/* Tiny SVG trend marks for KPI cards (decorative: the card text carries the numbers). */
import { useId } from 'react';
import type { HueSpec } from '../../lib/palette';

export function BarSparkline({ values, hue, width = 58, height = 44 }: { values: number[]; hue: HueSpec; width?: number; height?: number }) {
  const id = `bs${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const v = values.length ? values : [0];
  const max = Math.max(...v, 1e-9);
  const min = Math.min(...v);
  const n = v.length;
  const gap = n > 14 ? 1.5 : 3;
  const bw = Math.max(2, (width - gap * (n - 1)) / n);
  /* keep some height for small bars so the shape reads like the reference */
  const scale = (x: number) => (max === min ? 0.6 : 0.22 + (0.78 * (x - min)) / (max - min));
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="spark" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={hue.from} />
          <stop offset="1" stopColor={hue.to} />
        </linearGradient>
      </defs>
      {v.map((x, i) => {
        const h = Math.max(3, scale(x) * height);
        return <rect key={i} x={i * (bw + gap)} y={height - h} width={bw} height={h} rx={Math.min(2, bw / 2)} fill={`url(#${id})`} opacity={0.3 + (0.7 * (i + 1)) / n} />;
      })}
    </svg>
  );
}

export function ForecastSparkline({ actual, forecast, hue, width = 62, height = 44 }: { actual: number[]; forecast: number[]; hue: HueSpec; width?: number; height?: number }) {
  const id = `fs${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const all = [...actual, ...forecast];
  if (!all.length) return null;
  const max = Math.max(...all);
  const min = Math.min(...all);
  const n = all.length;
  const x = (i: number) => (i / Math.max(1, n - 1)) * (width - 4) + 2;
  const y = (v: number) => height - 4 - ((v - min) / Math.max(1e-9, max - min)) * (height - 10);
  const pa = actual.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
  const pf = [actual[actual.length - 1], ...forecast].map((v, i) => `${i ? 'L' : 'M'}${x(actual.length - 1 + i).toFixed(1)},${y(v).toFixed(1)}`).join('');
  const area = `${pa}L${x(actual.length - 1).toFixed(1)},${height}L${x(0).toFixed(1)},${height}Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="spark" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={hue.base} stopOpacity="0.28" />
          <stop offset="1" stopColor={hue.base} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={pa} fill="none" stroke={hue.base} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <path d={pf} fill="none" stroke={hue.base} strokeWidth="2" strokeDasharray="3 3" strokeLinecap="round" />
      <circle cx={x(n - 1)} cy={y(all[n - 1])} r="3" fill="#fff" stroke={hue.base} strokeWidth="2" />
    </svg>
  );
}
