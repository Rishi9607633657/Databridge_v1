/* Small simplified flags drawn in SVG (emoji flags do not render on Windows). */
import { useId } from 'react';
import type { FlagCode } from '../../domains/places';

export function Flag({ code, size = 22 }: { code: FlagCode; size?: number }) {
  const h = Math.round((size * 2) / 3);
  const clip = `fl-${code}-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg className="flag" width={size} height={h} viewBox="0 0 30 20" role="img" aria-label={`${code} flag`}>
      <defs>
        <clipPath id={clip}>
          <rect width="30" height="20" rx="3" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        {BODY[code] ?? (
          /* no drawing for this country: a neutral tag with its code */
          <g>
            <rect width="30" height="20" fill="#E8EDF5" />
            <text x="15" y="13.6" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#344054" fontFamily="Inter, system-ui, sans-serif">
              {(code || '··').slice(0, 2).toUpperCase()}
            </text>
          </g>
        )}
      </g>
      <rect width="30" height="20" rx="3" fill="none" stroke="rgba(0,0,0,.12)" />
    </svg>
  );
}

const ring = (cx: number, cy: number, r: number, n: number, fill: string, dot = 0.9) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return <circle key={i} cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r} r={dot} fill={fill} />;
  });

const jack = (
  <g>
    <rect width="15" height="10" fill="#012169" />
    <path d="M0 0 15 10M15 0 0 10" stroke="#fff" strokeWidth="2.4" />
    <path d="M0 0 15 10M15 0 0 10" stroke="#C8102E" strokeWidth="0.9" />
    <path d="M7.5 0v10M0 5h15" stroke="#fff" strokeWidth="3.2" />
    <path d="M7.5 0v10M0 5h15" stroke="#C8102E" strokeWidth="1.8" />
  </g>
);

const BODY: Record<string, JSX.Element> = {
  IN: (
    <g>
      <rect width="30" height="20" fill="#fff" />
      <rect width="30" height="6.67" fill="#FF9933" />
      <rect y="13.33" width="30" height="6.67" fill="#138808" />
      <circle cx="15" cy="10" r="2.6" fill="none" stroke="#000080" strokeWidth="0.7" />
      <circle cx="15" cy="10" r="0.6" fill="#000080" />
    </g>
  ),
  US: (
    <g>
      <rect width="30" height="20" fill="#fff" />
      {Array.from({ length: 7 }, (_, i) => <rect key={i} y={i * 2.86} width="30" height="1.43" fill="#B22234" />)}
      <rect width="13" height="10.7" fill="#3C3B6E" />
      {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={1.8 + (i % 4) * 3.1} cy={1.9 + Math.floor(i / 4) * 3.3} r="0.55" fill="#fff" />)}
    </g>
  ),
  EU: (
    <g>
      <rect width="30" height="20" fill="#003399" />
      {ring(15, 10, 5.6, 12, '#FFCC00', 0.85)}
    </g>
  ),
  GB: (
    <g>
      <rect width="30" height="20" fill="#012169" />
      <path d="M0 0 30 20M30 0 0 20" stroke="#fff" strokeWidth="4" />
      <path d="M0 0 30 20M30 0 0 20" stroke="#C8102E" strokeWidth="1.4" />
      <path d="M15 0v20M0 10h30" stroke="#fff" strokeWidth="6" />
      <path d="M15 0v20M0 10h30" stroke="#C8102E" strokeWidth="3.4" />
    </g>
  ),
  DE: (
    <g>
      <rect width="30" height="6.67" fill="#000" />
      <rect y="6.67" width="30" height="6.67" fill="#DD0000" />
      <rect y="13.33" width="30" height="6.67" fill="#FFCE00" />
    </g>
  ),
  AE: (
    <g>
      <rect width="30" height="6.67" fill="#00732F" />
      <rect y="6.67" width="30" height="6.67" fill="#fff" />
      <rect y="13.33" width="30" height="6.67" fill="#000" />
      <rect width="7.5" height="20" fill="#FF0000" />
    </g>
  ),
  AU: (
    <g>
      <rect width="30" height="20" fill="#012169" />
      {jack}
      <circle cx="7.5" cy="15.2" r="1.5" fill="#fff" />
      {[[22.5, 4], [19, 9.5], [26, 8.5], [22.5, 16.5], [24.4, 12.2]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === 4 ? 0.6 : 1} fill="#fff" />)}
    </g>
  ),
  CA: (
    <g>
      <rect width="30" height="20" fill="#fff" />
      <rect width="7.5" height="20" fill="#D52B1E" />
      <rect x="22.5" width="7.5" height="20" fill="#D52B1E" />
      <path d="M15 4.2l1.1 2.3 1.6-.6-.5 3 2-1.6.4 1.4 1.7-.3-1 1.9.8.5-3.2 2.4.4 1.3-2.8-.4V16h-1v-1.9l-2.8.4.4-1.3-3.2-2.4.8-.5-1-1.9 1.7.3.4-1.4 2 1.6-.5-3 1.6.6z" fill="#D52B1E" />
    </g>
  ),
  SG: (
    <g>
      <rect width="30" height="10" fill="#EF3340" />
      <rect y="10" width="30" height="10" fill="#fff" />
      <circle cx="6.6" cy="5" r="3.2" fill="#fff" />
      <circle cx="7.8" cy="5" r="3.2" fill="#EF3340" />
      {ring(10.6, 5, 1.7, 5, '#fff', 0.45)}
    </g>
  ),
};
