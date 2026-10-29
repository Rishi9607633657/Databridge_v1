/* 3D "Global Business Overview": an Earth globe with location markers, HQ ↔ hub arcs and DOM callouts,
   flanked by two miniature cities whose buildings are the top business entities (height = main metric).
   Loaded lazily; the 2D map is the fallback. Labels and values live in regular DOM (drei <Html>) for readability. */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, QuadraticBezierLine, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { BuildingKind } from '../../domains/types';
import type { FlagCode } from '../../domains/places';
import { Flag } from '../misc/Flag';
import { Building, Tree } from './Buildings';
import { earthTexture } from './textures';
import { frontRotation, latLonToXYZ, loadWorld } from './geo';

export interface SceneMarker { id: string; lat: number; lon: number; color: string; size: number; dim: boolean; label: string }
export interface SceneCallout { id: string; lat: number; lon: number; label: string; flag: FlagCode; line1: string; line2: string; dim: boolean; priority: number; onClick?: () => void }
export interface SceneArc { id: string; from: [number, number]; to: [number, number]; color: string; dim: boolean }
export interface SceneBuilding { id: string; name: string; value: string; sub: string; rank: number; height: number; accent: string }

export interface GlobeSceneProps {
  markers: SceneMarker[];
  callouts: SceneCallout[];
  arcs: SceneArc[];
  buildings: SceneBuilding[];
  kind: BuildingKind;
  countries: string[];
  hoverId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  dark: boolean;
  reducedMotion: boolean;
  autoRotate: boolean;
  showCity: boolean;
  focusLon: number;
  active: boolean; // false when scrolled off screen → no frames
  onContextLost?: () => void;
}

const GLOBE_Y = 0.12;
const R = 1;

/* ---------------- globe rotation: drag, arrow keys, gentle auto-rotate ---------------- */
interface Rig {
  rot: number;
  target: number;
  tilt: number;
  dragging: boolean;
  hovering: boolean;
  lastX: number;
  lastY: number;
}

function useGlobeRig(focusLon: number) {
  return useRef<Rig>({ rot: frontRotation(focusLon), target: frontRotation(focusLon), tilt: 0.12, dragging: false, hovering: false, lastX: 0, lastY: 0 });
}

function GlobeRig({ rig, autoRotate, reducedMotion, y, children }: { rig: React.MutableRefObject<Rig>; autoRotate: boolean; reducedMotion: boolean; y: number; children: React.ReactNode }) {
  const inner = useRef<THREE.Group>(null);
  const outer = useRef<THREE.Group>(null);
  const { gl, invalidate } = useThree();
  useEffect(() => {
    const el = gl.domElement;
    const down = (e: PointerEvent) => {
      rig.current.dragging = true;
      rig.current.lastX = e.clientX;
      rig.current.lastY = e.clientY;
      el.style.cursor = 'grabbing';
    };
    const move = (e: PointerEvent) => {
      const r = rig.current;
      if (!r.dragging) return;
      const dx = e.clientX - r.lastX;
      const dy = e.clientY - r.lastY;
      r.lastX = e.clientX;
      r.lastY = e.clientY;
      r.rot += dx * 0.0065;
      r.target = r.rot;
      r.tilt = Math.max(-0.35, Math.min(0.6, r.tilt + dy * 0.004));
      invalidate();
    };
    const up = () => {
      rig.current.dragging = false;
      el.style.cursor = 'grab';
    };
    const enter = () => (rig.current.hovering = true);
    const leave = () => (rig.current.hovering = false);
    el.style.cursor = 'grab';
    el.style.touchAction = 'pan-y';
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointerleave', leave);
    };
  }, [gl, rig, invalidate]);
  useFrame((_, dt) => {
    const r = rig.current;
    if (!r.dragging && autoRotate && !reducedMotion && !r.hovering) r.target += Math.min(dt, 0.05) * 0.07;
    r.rot += (r.target - r.rot) * Math.min(1, dt * 6);
    if (inner.current) inner.current.rotation.y = r.rot;
    if (outer.current) outer.current.rotation.x = r.tilt;
    if (Math.abs(r.target - r.rot) > 0.0005) invalidate();
  });
  return (
    <group ref={outer} position={[0, y, 0]}>
      <group ref={inner}>{children}</group>
    </group>
  );
}

/* ---------------- earth + atmosphere ---------------- */
const atmoVert = `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const haloFrag = `uniform vec3 c; uniform float k; varying vec3 vN; void main(){ float i = pow(max(0.0, 0.72 - dot(vN, vec3(0.0,0.0,1.0))), 3.2); gl_FragColor = vec4(c, 1.0) * i * k; }`;
const rimFrag = `uniform vec3 c; uniform float k; varying vec3 vN; void main(){ float i = pow(1.0 - max(0.0, dot(vN, vec3(0.0,0.0,1.0))), 3.0); gl_FragColor = vec4(c, i * k); }`;

function Earth({ countries, dark }: { countries: string[]; dark: boolean }) {
  const [tex, setTex] = useState<THREE.CanvasTexture | null>(null);
  const key = countries.join(',');
  useEffect(() => {
    let alive = true;
    loadWorld().then((w) => {
      if (alive) setTex(earthTexture(w, new Set(countries), dark));
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, dark]);
  useEffect(() => () => tex?.dispose(), [tex]);
  const halo = useMemo(() => new THREE.ShaderMaterial({ vertexShader: atmoVert, fragmentShader: haloFrag, uniforms: { c: { value: new THREE.Color(dark ? '#4C8DFF' : '#5FA2FF') }, k: { value: dark ? 0.9 : 0.75 } }, side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }), [dark]);
  const rim = useMemo(() => new THREE.ShaderMaterial({ vertexShader: atmoVert, fragmentShader: rimFrag, uniforms: { c: { value: new THREE.Color('#BFE0FF') }, k: { value: 0.75 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), []);
  return (
    <group>
      <mesh castShadow>
        <sphereGeometry args={[R, 96, 64]} />
        {tex ? (
          <meshStandardMaterial key="tex" map={tex} roughness={0.74} metalness={0.05} />
        ) : (
          <meshStandardMaterial key="plain" color={dark ? '#1A4FB0' : '#2F74E4'} roughness={0.78} metalness={0.04} />
        )}
      </mesh>
      <mesh material={rim} scale={1.004}>
        <sphereGeometry args={[R, 64, 48]} />
      </mesh>
      <mesh material={halo} scale={1.16}>
        <sphereGeometry args={[R, 64, 48]} />
      </mesh>
    </group>
  );
}

/* ---------------- markers with a pulse ---------------- */
const dotGeo = new THREE.SphereGeometry(1, 16, 12);
const pulseGeo = new THREE.RingGeometry(0.75, 1, 40);

function Marker({ m, i, reducedMotion }: { m: SceneMarker; i: number; reducedMotion: boolean }) {
  const pos = useMemo(() => new THREE.Vector3(...latLonToXYZ(m.lat, m.lon, R * 1.004)), [m.lat, m.lon]);
  const ringRef = useRef<THREE.Mesh>(null);
  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({ color: m.color, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false }), [m.color]);
  const dotMat = useMemo(() => new THREE.MeshBasicMaterial({ color: m.color, transparent: true }), [m.color]);
  useLayoutEffect(() => {
    ringRef.current?.lookAt(pos.clone().multiplyScalar(2));
  }, [pos]);
  useFrame(({ clock }) => {
    const dim = m.dim ? 0.25 : 1;
    dotMat.opacity = dim;
    if (!ringRef.current) return;
    if (reducedMotion) {
      ringRef.current.scale.setScalar(m.size * 2.2);
      ringMat.opacity = 0.35 * dim;
      return;
    }
    const t = (clock.elapsedTime * 0.45 + i * 0.137) % 1;
    ringRef.current.scale.setScalar(m.size * (1.2 + t * 2.6));
    ringMat.opacity = (1 - t) * 0.65 * dim;
  });
  return (
    <group>
      <mesh geometry={dotGeo} material={dotMat} position={pos} scale={m.size} />
      <mesh ref={ringRef} geometry={pulseGeo} material={ringMat} position={pos} />
    </group>
  );
}

/* ---------------- arcs HQ → hubs with a travelling light ---------------- */
function Arc({ a, reducedMotion, i }: { a: SceneArc; reducedMotion: boolean; i: number }) {
  const { start, end, mid, curve } = useMemo(() => {
    const s = new THREE.Vector3(...latLonToXYZ(a.from[0], a.from[1], R * 1.003));
    const e = new THREE.Vector3(...latLonToXYZ(a.to[0], a.to[1], R * 1.003));
    const lift = 1 + 0.18 + s.distanceTo(e) * 0.22;
    const m = s.clone().add(e).normalize().multiplyScalar(lift);
    return { start: s, end: e, mid: m, curve: new THREE.QuadraticBezierCurve3(s, m, e) };
  }, [a.from, a.to]);
  const dot = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!dot.current) return;
    dot.current.visible = !reducedMotion && !a.dim;
    if (reducedMotion) return;
    const t = (clock.elapsedTime * 0.28 + i * 0.21) % 1;
    dot.current.position.copy(curve.getPoint(t));
  });
  return (
    <group>
      <QuadraticBezierLine start={start} end={end} mid={mid} color={a.color} lineWidth={1.6} transparent opacity={a.dim ? 0.18 : 0.85} />
      <mesh ref={dot} geometry={dotGeo} scale={0.018}>
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

/* ---------------- callouts: DOM cards, hidden on the far side and when they would overlap ---------------- */
function Callouts({ items }: { items: SceneCallout[] }) {
  const anchors = useRef<(THREE.Object3D | null)[]>([]);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const { camera, size } = useThree();
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const center = useMemo(() => new THREE.Vector3(), []);
  const order = useMemo(() => items.map((_, i) => i).sort((a, b) => items[a].priority - items[b].priority), [items]);
  useFrame(() => {
    const shown: [number, number, number, number][] = [];
    for (const i of order) {
      const o = anchors.current[i];
      const card = cards.current[i];
      if (!o || !card) continue;
      o.getWorldPosition(tmp);
      o.parent?.getWorldPosition(center);
      const normal = tmp.clone().sub(center).normalize();
      const toCam = camera.position.clone().sub(tmp).normalize();
      let visible = normal.dot(toCam) > 0.22;
      const p = tmp.clone().project(camera);
      const sx = (p.x * 0.5 + 0.5) * size.width;
      const sy = (-p.y * 0.5 + 0.5) * size.height;
      /* the card opens to the side with more room; hide it if it would cover a card already shown */
      const w = card.offsetWidth || 140;
      const h = card.offsetHeight || 54;
      let right = sx > size.width * 0.5; // open away from the globe centre…
      if (right && sx + 12 + w > size.width - 4) right = false; // …unless there is no room on that side
      else if (!right && sx - 12 - w < 4) right = true;
      if ((right ? sx + 12 + w > size.width - 4 : sx - 12 - w < 4)) visible = false;
      const below = sy - 6 - h < 2; // no room above: open below the marker
      const x0 = right ? sx + 12 : sx - 12 - w;
      const y0 = below ? sy + 6 : sy - 6 - h;
      const rect: [number, number, number, number] = [x0 - 4, y0 - 4, x0 + w + 4, y0 + h + 4];
      if (visible && shown.some(([a, b, c, d]) => rect[0] < c && rect[2] > a && rect[1] < d && rect[3] > b)) visible = false;
      if (visible) shown.push(rect);
      const want = visible ? '1' : '0';
      if (card.style.opacity !== want) {
        card.style.opacity = want;
        card.style.pointerEvents = visible ? 'auto' : 'none';
        card.setAttribute('aria-hidden', visible ? 'false' : 'true');
        card.tabIndex = visible ? 0 : -1;
      }
      const tr = `translate(${right ? 12 : -12 - w}px, ${below ? 6 : -6 - h}px)`;
      if (card.style.transform !== tr) card.style.transform = tr;
    }
  });
  return (
    <>
      {items.map((c, i) => (
        <group key={c.id} position={latLonToXYZ(c.lat, c.lon, R * 1.01)} ref={(g) => (anchors.current[i] = g)}>
          <Html zIndexRange={[30, 10]} style={{ pointerEvents: 'none' }}>
            <div
              ref={(d) => (cards.current[i] = d)}
              className={`g-callout ${c.dim ? 'dim' : ''}`}
              style={{ opacity: 0 }}
              role="button"
              aria-label={`${c.label}: ${c.line1}, ${c.line2}. Filter to this region`}
              onClick={c.onClick}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && c.onClick?.()}
            >
              <Flag code={c.flag} size={24} />
              <span>
                <strong>{c.label}</strong>
                <small>{c.line1}</small>
                <b>{c.line2}</b>
              </span>
            </div>
          </Html>
        </group>
      ))}
    </>
  );
}

/* ---------------- miniature cities: one building per top entity ---------------- */
const SLOTS: [number, number][] = [
  [0, -0.22], [-0.42, -0.2], [0.42, -0.24], [-0.22, 0.24], [0.24, 0.26], [0.6, 0.18],
];

function City({ side, items, kind, hoverId, onHover, onSelect, dark }: { side: -1 | 1; items: SceneBuilding[]; kind: BuildingKind; hoverId: string | null; onHover: (id: string | null) => void; onSelect: (id: string) => void; dark: boolean }) {
  const { viewport, camera, gl } = useThree();
  const vp = viewport.getCurrentViewport(camera, new THREE.Vector3(0, -0.78, 0.45));
  /* fit the city between the globe and the card edge */
  const half = vp.width / 2;
  const s = Math.max(0.45, Math.min(0.86, (half - 1.35) / 0.97));
  /* stay close to the globe on wide cards instead of drifting to the edges */
  const x = Math.min(2.5, Math.max(1.35, half - 0.97 * s));
  const plate = dark ? '#1B2740' : '#F1F5FB';
  const lawn = dark ? '#1F4B3A' : '#CDEFD7';
  const road = dark ? '#2A3956' : '#DCE3EE';
  return (
    <group position={[side * x, -0.78, 0.45]} rotation={[0, side * -0.42, 0]} scale={s}>
      <RoundedBox args={[1.62, 0.1, 1.12]} radius={0.05} smoothness={3} position={[0, -0.05, 0]} receiveShadow>
        <meshStandardMaterial color={plate} roughness={0.9} />
      </RoundedBox>
      <mesh position={[0, 0.003, 0.02]} receiveShadow>
        <boxGeometry args={[1.5, 0.006, 0.12]} />
        <meshStandardMaterial color={road} roughness={0.95} />
      </mesh>
      {[[-0.56, -0.38], [0.56, 0.38], [-0.62, 0.36]].map(([lx, lz], k) => (
        <mesh key={k} position={[lx, 0.004, lz]} receiveShadow>
          <boxGeometry args={[0.36, 0.008, 0.26]} />
          <meshStandardMaterial color={lawn} roughness={0.95} />
        </mesh>
      ))}
      {[[-0.68, -0.42], [-0.5, 0.42], [0.7, 0.44], [0.72, -0.4], [-0.72, 0.3], [0.52, 0.48]].map(([tx, tz], k) => (
        <Tree key={k} position={[tx, 0, tz]} s={0.9 + (k % 3) * 0.15} alt={k % 2 === 1} />
      ))}
      {items.slice(0, SLOTS.length).map((b, i) => {
        const [bx, bz] = SLOTS[i];
        const isHover = hoverId === b.id;
        return (
          <group key={b.id}>
            <Building
              kind={kind}
              height={b.height}
              accent={b.accent}
              position={[bx, 0, bz]}
              active={isHover}
              onOver={(e) => {
                e.stopPropagation();
                onHover(b.id);
                gl.domElement.style.cursor = 'pointer';
              }}
              onOut={() => {
                onHover(null);
                gl.domElement.style.cursor = 'grab';
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (e.delta < 6) onSelect(b.id);
              }}
            />
            {isHover && (
              <Html position={[bx, b.height + 0.22, bz]} center zIndexRange={[40, 30]} style={{ pointerEvents: 'none' }}>
                <div className="b-tip">
                  <span className="b-rank">#{b.rank}</span>
                  <strong>{b.name}</strong>
                  <small>{b.sub}</small>
                  <b>{b.value}</b>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

function Lights({ dark }: { dark: boolean }) {
  return (
    <>
      <ambientLight intensity={dark ? 0.55 : 0.75} />
      <hemisphereLight args={[dark ? '#9fb6ff' : '#ffffff', dark ? '#0b1220' : '#c4d0e4', dark ? 0.45 : 0.65]} />
      <directionalLight
        position={[3.5, 5.5, 5]}
        intensity={dark ? 1.4 : 1.7}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-4.5}
        shadow-camera-right={4.5}
        shadow-camera-top={2.5}
        shadow-camera-bottom={-2.5}
        shadow-bias={-0.0006}
      />
      <directionalLight position={[-5, 1.5, -2]} intensity={0.45} color="#9CC2FF" />
    </>
  );
}

function KeyBridge({ rig, focusLon, register }: { rig: React.MutableRefObject<Rig>; focusLon: number; register: (fn: (k: string) => void) => void }) {
  const { invalidate } = useThree();
  useEffect(() => {
    register((k) => {
      const r = rig.current;
      if (k === 'ArrowLeft') r.target -= 0.35;
      if (k === 'ArrowRight') r.target += 0.35;
      if (k === 'ArrowUp') r.tilt = Math.min(0.6, r.tilt + 0.12);
      if (k === 'ArrowDown') r.tilt = Math.max(-0.35, r.tilt - 0.12);
      if (k === 'Home') {
        const base = frontRotation(focusLon);
        const turns = Math.round((r.rot - base) / (Math.PI * 2));
        r.target = base + turns * Math.PI * 2;
        r.tilt = 0.12;
      }
      invalidate();
    });
  }, [rig, focusLon, register, invalidate]);
  return null;
}

export default function GlobeScene(p: GlobeSceneProps) {
  const rig = useGlobeRig(p.focusLon);
  /* R3F forces a context loss when the scene unmounts (e.g. switching to the 2D map): not a failure */
  const alive = useRef(true);
  useEffect(() => () => {
    alive.current = false;
  }, []);
  const keyFn = useRef<(k: string) => void>(() => undefined);
  /* turn to the selected region (shortest way round) */
  useEffect(() => {
    const r = rig.current;
    const base = frontRotation(p.focusLon);
    r.target = base + Math.round((r.rot - base) / (Math.PI * 2)) * Math.PI * 2;
  }, [p.focusLon, rig]);
  const left = p.buildings.filter((_, i) => i % 2 === 0);
  const right = p.buildings.filter((_, i) => i % 2 === 1);
  return (
    <div
      className="scene-wrap"
      tabIndex={0}
      role="group"
      aria-label="3D globe. Drag or use the arrow keys to rotate, Home to reset. Hover or select a building for details."
      onKeyDown={(e) => {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(e.key)) {
          e.preventDefault();
          keyFn.current(e.key);
        }
      }}
      onDoubleClick={() => keyFn.current('Home')}
    >
      <Canvas
        dpr={[1, 1.75]}
        shadows
        frameloop={!p.active ? 'never' : p.reducedMotion ? 'demand' : 'always'}
        camera={{ position: [0, 1.25, 5.3], fov: 30, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl, camera }) => {
          camera.lookAt(0, -0.12, 0);
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            if (alive.current) p.onContextLost?.();
          });
        }}
      >
        <Lights dark={p.dark} />
        <KeyBridge rig={rig} focusLon={p.focusLon} register={(fn) => (keyFn.current = fn)} />
        <GlobeRig rig={rig} autoRotate={p.autoRotate} reducedMotion={p.reducedMotion} y={p.showCity ? GLOBE_Y : -0.12}>
          <Earth countries={p.countries} dark={p.dark} />
          {p.markers.map((m, i) => <Marker key={m.id} m={m} i={i} reducedMotion={p.reducedMotion} />)}
          {p.arcs.map((a, i) => <Arc key={a.id} a={a} i={i} reducedMotion={p.reducedMotion} />)}
          <Callouts items={p.callouts} />
        </GlobeRig>
        {p.showCity && (
          <>
            <City side={-1} items={left} kind={p.kind} hoverId={p.hoverId} onHover={p.onHover} onSelect={p.onSelect} dark={p.dark} />
            <City side={1} items={right} kind={p.kind} hoverId={p.hoverId} onHover={p.onHover} onSelect={p.onSelect} dark={p.dark} />
          </>
        )}
      </Canvas>
    </div>
  );
}
