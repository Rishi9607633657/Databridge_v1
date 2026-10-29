/* Isometric mini-building thumbnails (SVG) — the same building kinds as the 3D scene, for lists and tooltips. */
import type { BuildingKind } from '../../domains/types';

const C = 0.866;
const S = 0.5;
type V3 = [number, number, number];
const P = ([x, y, z]: V3): string => `${(24 + (x - y) * C).toFixed(1)},${(33 + (x + y) * S - z).toFixed(1)}`;
const poly = (pts: V3[], fill: string, key?: string | number) => <polygon key={key} points={pts.map(P).join(' ')} fill={fill} />;

function box(x: number, y: number, z: number, w: number, d: number, h: number, top: string, left: string, right: string, key?: string) {
  return (
    <g key={key}>
      {poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], right)}
      {poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], left)}
      {poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], top)}
    </g>
  );
}
/* rectangles drawn on a wall: left wall is the plane y = const, right wall is x = const */
const onLeft = (y: number, x0: number, x1: number, z0: number, z1: number, fill: string, key?: string | number) => poly([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], fill, key);
const onRight = (x: number, y0: number, y1: number, z0: number, z1: number, fill: string, key?: string | number) => poly([[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]], fill, key);

const WALL = { top: '#F8FAFD', left: '#E3E9F2', right: '#C9D3E1' };
const GLASS = { left: '#8DB4F5', right: '#6C97E6' };

function windows(y: number, x0: number, x1: number, rows: number[], fill: string) {
  const out = [];
  for (const z of rows) for (let x = x0; x < x1 - 1; x += 3.2) out.push(onLeft(y, x, x + 2, z, z + 2.2, fill, `w${x}-${z}`));
  return out;
}

export function EntityThumb({ kind, color, size = 40, title }: { kind: BuildingKind; color: string; size?: number; title?: string }) {
  let body: JSX.Element[] = [];
  switch (kind) {
    case 'store':
      body = [
        box(-8, -7, 0, 15, 13, 10, WALL.top, WALL.left, WALL.right, 'b'),
        onLeft(6, -6.5, 5.5, 1, 5.5, GLASS.left, 'g'),
        poly([[-8.5, 6, 6.2], [7.5, 6, 6.2], [7.5, 8.6, 4.6], [-8.5, 8.6, 4.6]], color, 'aw'),
        ...[-5, -1, 3].map((x) => poly([[x, 6, 6.2], [x + 2, 6, 6.2], [x + 2, 8.6, 4.6], [x, 8.6, 4.6]], 'rgba(255,255,255,.75)', `s${x}`)),
        box(-4, -2, 10, 8, 2, 3.4, color, color, color, 'sign'),
        onRight(7, -5, 4, 2, 7, GLASS.right, 'rg'),
      ];
      break;
    case 'hospital':
      body = [
        box(-8, -8, 0, 16, 16, 17, WALL.top, WALL.left, WALL.right, 'b'),
        ...windows(8, -6.5, 7, [4, 8, 12], GLASS.left),
        onLeft(8, -1.6, 1.6, 12.6, 16.2, '#fff', 'cw'),
        onLeft(8, -1, 1, 12.9, 15.9, '#E5484D', 'c1'),
        onLeft(8, -1.9, 1.9, 13.6, 15.2, '#E5484D', 'c2'),
        onRight(8, -6, 6, 3, 14, color, 'stripe'),
        box(-3, -3, 17, 6, 6, 1, color, color, color, 'pad'),
      ];
      break;
    case 'bank':
      body = [
        box(-9, -8, 0, 18, 16, 2, '#EEF2F8', '#D5DDE9', '#BCC8D9', 'plinth'),
        box(-8, -7, 2, 15, 12, 10, WALL.top, WALL.left, WALL.right, 'b'),
        ...[-7, -4, -1, 2, 5].map((x) => box(x, 5.2, 2, 1.4, 1.4, 10, '#fff', '#F3F6FA', '#D8E0EB', `col${x}`)),
        box(-8.6, -7.6, 12, 16.2, 14.2, 1.4, WALL.top, '#D9E1EC', '#C2CDDC', 'ent'),
        poly([[-8.6, 6.6, 13.4], [7.6, 6.6, 13.4], [-0.5, 6.6, 18]], color, 'ped'),
        poly([[7.6, -7.6, 13.4], [7.6, 6.6, 13.4], [-0.5, 6.6, 18], [-0.5, -7.6, 18]], '#B7C3D4', 'roof'),
      ];
      break;
    case 'factory':
      body = [
        box(-10, -6, 0, 18, 12, 8, WALL.top, WALL.left, WALL.right, 'b'),
        ...[-10, -4, 2].map((x) => poly([[x, 6, 8], [x + 6, 6, 8], [x + 6, 6, 12]], color, `t${x}`)),
        ...[-10, -4, 2].map((x) => poly([[x + 6, -6, 8], [x + 6, 6, 8], [x + 6, 6, 12], [x + 6, -6, 12]], '#AEB9CA', `r${x}`)),
        ...[-10, -4, 2].map((x) => poly([[x, -6, 8], [x + 6, -6, 12], [x + 6, 6, 12], [x, 6, 8]], '#DCE3ED', `k${x}`)),
        onLeft(6, -8, -2, 0.5, 5, GLASS.left, 'door'),
        box(4.5, -5.5, 8, 2.6, 2.6, 13, '#E5E9F0', '#CBD3DE', '#AFBACB', 'ch'),
        box(4.5, -5.5, 17, 2.6, 2.6, 2, color, color, color, 'band'),
      ];
      break;
    case 'campus':
      body = [
        box(-10, -5, 0, 20, 10, 8, WALL.top, WALL.left, WALL.right, 'b'),
        ...windows(5, -8.5, 9, [2.5, 5.2], GLASS.left),
        poly([[-10, 5, 8], [10, 5, 8], [10, 0, 12], [-10, 0, 12]], color, 'rf'),
        poly([[10, -5, 8], [10, 5, 8], [10, 0, 12]], '#C7D1DF', 'gab'),
        box(-2.2, -2.2, 0, 4.4, 4.4, 17, WALL.top, WALL.left, WALL.right, 'tw'),
        poly([[-2.2, 2.2, 17], [2.2, 2.2, 17], [0, 0, 21.5]], color, 'tr1'),
        poly([[2.2, -2.2, 17], [2.2, 2.2, 17], [0, 0, 21.5]], '#B9C5D6', 'tr2'),
        onLeft(2.2, -1.2, 1.2, 13, 15.4, '#fff', 'clock'),
      ];
      break;
    default:
      body = [
        box(-6, -6, 0, 12, 12, 24, '#EAF1FD', GLASS.left, GLASS.right, 'b'),
        ...[4, 8, 12, 16, 20].map((z) => onLeft(6, -6, 6, z, z + 0.5, 'rgba(255,255,255,.55)', `l${z}`)),
        ...[4, 8, 12, 16, 20].map((z) => onRight(6, -6, 6, z, z + 0.5, 'rgba(255,255,255,.35)', `r${z}`)),
        box(-3, -3, 24, 6, 6, 1.6, color, color, color, 'crown'),
      ];
  }
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className="ethumb" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <rect x="1" y="1" width="46" height="46" rx="11" fill={color} opacity="0.12" />
      <ellipse cx="24" cy="38.5" rx="15" ry="4.2" fill="rgba(15,23,42,.08)" />
      {body}
    </svg>
  );
}
