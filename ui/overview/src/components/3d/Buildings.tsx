/* Miniature buildings for the 3D scene. One building = one business entity (store, facility, branch, plant,
   campus…); height follows its main metric. Simple shared geometry and materials keep it light. */
import { useMemo } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import type { BuildingKind } from '../../domains/types';
import { windowTexture } from './textures';

const box = new THREE.BoxGeometry(1, 1, 1);
const cyl = new THREE.CylinderGeometry(1, 1, 1, 14);
/* triangular prism: CylinderGeometry with 3 sides. Rotation [-π/2,0,0] = ridge front-to-back, [-π/2,0,-π/2] = ridge left-to-right;
   scale [half-width/0.866, length, height/1.5] */
const prism = new THREE.CylinderGeometry(1, 1, 1, 3);
const pyramid = new THREE.ConeGeometry(1, 1, 4);
const ring = new THREE.RingGeometry(0.17, 0.215, 40);

const wallMat = new THREE.MeshStandardMaterial({ color: '#F3F6FB', roughness: 0.7 });
const glassMat = new THREE.MeshStandardMaterial({ color: '#86AEF0', roughness: 0.25, metalness: 0.25 });
const greyMat = new THREE.MeshStandardMaterial({ color: '#CBD5E3', roughness: 0.8 });
const redMat = new THREE.MeshStandardMaterial({ color: '#E5484D', roughness: 0.6 });

function windowMat(h: number) {
  const t = windowTexture().clone();
  t.needsUpdate = true;
  t.repeat.set(1.2, Math.max(1, Math.round(h * 3.2)));
  return new THREE.MeshStandardMaterial({ map: t, roughness: 0.65 });
}

interface BuildingProps {
  kind: BuildingKind;
  height: number; // 0.25..1.2 scene units
  accent: string;
  position: [number, number, number];
  active: boolean;
  onOver?: (e: ThreeEvent<PointerEvent>) => void;
  onOut?: (e: ThreeEvent<PointerEvent>) => void;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
}

export function Building({ kind, height, accent, position, active, onOver, onOut, onClick }: BuildingProps) {
  const h = Math.max(0.22, height);
  const accentMat = useMemo(() => new THREE.MeshStandardMaterial({ color: accent, roughness: 0.45, emissive: accent, emissiveIntensity: 0.12 }), [accent]);
  const body = useMemo(() => windowMat(h), [h]);
  const glow = useMemo(() => new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.9, side: THREE.DoubleSide }), [accent]);
  const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material, p: [number, number, number], s: [number, number, number], r?: [number, number, number], key?: string) => (
    <mesh key={key} geometry={geo} material={mat} position={p} scale={s} rotation={r} castShadow receiveShadow />
  );

  let parts: JSX.Element[] = [];
  switch (kind) {
    case 'store': {
      const bh = h * 0.8;
      parts = [
        mesh(box, body, [0, bh / 2, 0], [0.34, bh, 0.28], undefined, 'b'),
        mesh(box, glassMat, [0, 0.06, 0.142], [0.28, 0.1, 0.01], undefined, 'g'),
        mesh(box, accentMat, [0, 0.14, 0.17], [0.36, 0.018, 0.07], [0.35, 0, 0], 'aw'),
        mesh(box, accentMat, [0, bh + 0.05, 0.05], [0.22, 0.08, 0.03], undefined, 'sign'),
      ];
      break;
    }
    case 'hospital':
      parts = [
        mesh(box, body, [0, h / 2, 0], [0.32, h, 0.3], undefined, 'b'),
        mesh(box, wallMat, [0.24, h * 0.3, 0], [0.16, h * 0.6, 0.26], undefined, 'wing'),
        mesh(box, redMat, [0, h - 0.07, 0.152], [0.1, 0.03, 0.01], undefined, 'c1'),
        mesh(box, redMat, [0, h - 0.07, 0.152], [0.03, 0.1, 0.01], undefined, 'c2'),
        mesh(cyl, accentMat, [0, h + 0.008, 0], [0.09, 0.016, 0.09], undefined, 'pad'),
      ];
      break;
    case 'bank': {
      const bh = h * 0.78;
      parts = [
        mesh(box, greyMat, [0, 0.02, 0], [0.4, 0.04, 0.36], undefined, 'pl'),
        mesh(box, body, [0, bh / 2 + 0.04, -0.03], [0.34, bh, 0.24], undefined, 'b'),
        ...[-0.12, -0.04, 0.04, 0.12].map((x) => mesh(cyl, wallMat, [x, bh / 2 + 0.04, 0.12], [0.022, bh, 0.022], undefined, `c${x}`)),
        mesh(box, wallMat, [0, bh + 0.055, 0], [0.38, 0.03, 0.32], undefined, 'ent'),
        mesh(prism, accentMat, [0, bh + 0.103, 0], [0.22, 0.34, 0.067], [-Math.PI / 2, 0, 0], 'ped'),
      ];
      break;
    }
    case 'factory': {
      const bh = Math.max(0.16, h * 0.45);
      parts = [
        mesh(box, body, [0, bh / 2, 0], [0.42, bh, 0.3], undefined, 'b'),
        ...[-0.14, 0, 0.14].map((x) => mesh(prism, accentMat, [x, bh + 0.02, 0], [0.08, 0.3, 0.04], [-Math.PI / 2, 0, 0], `t${x}`)),
        mesh(cyl, greyMat, [0.15, h / 2, -0.1], [0.035, h, 0.035], undefined, 'ch'),
        mesh(cyl, accentMat, [0.15, h - 0.04, -0.1], [0.038, 0.04, 0.038], undefined, 'band'),
      ];
      break;
    }
    case 'campus': {
      const bh = h * 0.55;
      parts = [
        mesh(box, body, [0, bh / 2, 0], [0.42, bh, 0.22], undefined, 'b'),
        mesh(prism, accentMat, [0, bh + 0.033, 0], [0.15, 0.44, 0.067], [-Math.PI / 2, 0, -Math.PI / 2], 'roof'),
        mesh(box, wallMat, [0, h / 2, 0.02], [0.1, h, 0.1], undefined, 'tw'),
        mesh(pyramid, accentMat, [0, h + 0.05, 0.02], [0.085, 0.1, 0.085], [0, Math.PI / 4, 0], 'tr'),
      ];
      break;
    }
    default:
      parts = [
        mesh(box, glassMat, [0, h / 2, 0], [0.26, h, 0.26], undefined, 'b'),
        mesh(box, body, [0, h / 2, 0], [0.265, h * 0.96, 0.18], undefined, 'core'),
        mesh(box, accentMat, [0, h + 0.02, 0], [0.18, 0.04, 0.18], undefined, 'crown'),
      ];
  }

  return (
    <group position={position} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
      {parts}
      {active && <mesh geometry={ring} material={glow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} />}
    </group>
  );
}

const coneGeo = new THREE.ConeGeometry(1, 1, 7);
const trunkGeo = new THREE.CylinderGeometry(1, 1, 1, 6);
const leafMat = new THREE.MeshStandardMaterial({ color: '#3FB46B', roughness: 0.8 });
const leafMat2 = new THREE.MeshStandardMaterial({ color: '#6CCB7D', roughness: 0.8 });
const trunkMat = new THREE.MeshStandardMaterial({ color: '#A57A52', roughness: 0.9 });

export function Tree({ position, s = 1, alt = false }: { position: [number, number, number]; s?: number; alt?: boolean }) {
  return (
    <group position={position} scale={s}>
      <mesh geometry={trunkGeo} material={trunkMat} position={[0, 0.03, 0]} scale={[0.012, 0.06, 0.012]} castShadow />
      <mesh geometry={coneGeo} material={alt ? leafMat2 : leafMat} position={[0, 0.11, 0]} scale={[0.05, 0.13, 0.05]} castShadow />
    </group>
  );
}
