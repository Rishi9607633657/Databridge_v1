/* Textures drawn on a canvas at runtime (no image downloads): the Earth map and a window pattern for buildings. */
import * as THREE from 'three';
import { centroidLat, landColor, type World } from './geo';

export function earthTexture(world: World, highlight: Set<string>, dark: boolean): THREE.CanvasTexture {
  const W = 2048;
  const H = 1024;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  /* ocean: deeper at the poles, brighter around the equator */
  const og = g.createLinearGradient(0, 0, 0, H);
  const deep = dark ? '#0B2A6E' : '#1747B8';
  const mid = dark ? '#1A4FB0' : '#2F74E4';
  og.addColorStop(0, deep);
  og.addColorStop(0.5, mid);
  og.addColorStop(1, deep);
  g.fillStyle = og;
  g.fillRect(0, 0, W, H);
  /* graticule */
  g.strokeStyle = 'rgba(255,255,255,0.07)';
  g.lineWidth = 1;
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * W;
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, H);
    g.stroke();
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = ((90 - lat) / 180) * H;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(W, y);
    g.stroke();
  }
  const X = (lon: number) => ((lon + 180) / 360) * W;
  const Y = (lat: number) => ((90 - lat) / 180) * H;
  world.features.forEach((f, i) => {
    const iso = f.properties.iso2 || '';
    let fill = landColor(f, i + 7);
    if (highlight.has(iso)) fill = '#7CD992';
    const lat = centroidLat(f);
    if (Math.abs(lat) > 58 && !highlight.has(iso) && fill.startsWith('hsl(1')) fill = `hsl(110, 22%, ${dark ? 62 : 70}%)`;
    g.fillStyle = fill;
    g.beginPath();
    for (const poly of f.geometry.coordinates) {
      for (const ring of poly) {
        ring.forEach(([lo, la], k) => (k ? g.lineTo(X(lo), Y(la)) : g.moveTo(X(lo), Y(la))));
        g.closePath();
      }
    }
    g.fill('evenodd');
    g.strokeStyle = highlight.has(iso) ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.38)';
    g.lineWidth = highlight.has(iso) ? 1.6 : 0.8;
    g.stroke();
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

let windowTex: THREE.CanvasTexture | null = null;
/** Light wall with rows of blue windows; repeated vertically by building height. */
export function windowTexture(): THREE.CanvasTexture {
  if (windowTex) return windowTex;
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d')!;
  g.fillStyle = '#F7F9FC';
  g.fillRect(0, 0, 64, 64);
  for (let y = 8; y < 64; y += 16) {
    for (let x = 6; x < 64; x += 16) {
      const lit = (x * 7 + y * 3) % 7 === 0;
      g.fillStyle = lit ? '#FFE9B0' : '#B9CFF4';
      g.fillRect(x, y, 10, 8);
    }
  }
  windowTex = new THREE.CanvasTexture(c);
  windowTex.colorSpace = THREE.SRGBColorSpace;
  windowTex.wrapS = THREE.RepeatWrapping;
  windowTex.wrapT = THREE.RepeatWrapping;
  return windowTex;
}
