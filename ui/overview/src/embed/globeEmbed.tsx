/* The Overview's 3D globe (Earth, location markers, region callouts and the miniature city of top locations),
   packaged for the classic Dashboards tab: window.DBOverviewEmbed.mountGlobe(el, props) → { update, unmount }.
   Built as its own entry (embed/overview-embed.js). three.js and R3F load lazily with the scene; without WebGL,
   or if the scene fails, the 2D world map is shown instead. Styles are scoped to .dbx-embed. */
import { lazy, Suspense, useEffect, useRef, useState, type RefObject } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { SceneArc, SceneBuilding, SceneCallout, SceneMarker } from '../components/3d/GlobeScene';
import { SceneErrorBoundary } from '../components/3d/SceneErrorBoundary';
import { hasWebGL } from '../components/3d/webgl';
import { FlatMap } from '../components/maps/FlatMap';
import type { BuildingKind } from '../domains/types';
import css from './embed.css?inline';

const GlobeScene = lazy(() => import('../components/3d/GlobeScene'));

export interface EmbedGlobeProps {
  markers: SceneMarker[];
  callouts: SceneCallout[];
  arcs?: SceneArc[];
  buildings: SceneBuilding[];
  kind: BuildingKind;
  countries: string[];
  dark: boolean;
  reducedMotion: boolean;
  autoRotate: boolean;
  showCity: boolean;
  focusLon: number;
  view?: 'globe' | 'map';
  onSelect?: (id: string) => void;
}

/* the dashboard moves this element to a new card on every redraw, which can leave a stale "not visible";
   `epoch` changes on each update, so the observer starts again and reports the real state */
function useInView(ref: RefObject<Element>, epoch: number): boolean {
  const [v, setV] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver !== 'function') return;
    const io = new IntersectionObserver(([e]) => setV(e.isIntersecting), { rootMargin: '120px' });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, epoch]);
  return v;
}

function usePageVisible(): boolean {
  const [v, setV] = useState(() => !document.hidden);
  useEffect(() => {
    const on = () => setV(!document.hidden);
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  return v;
}

function EmbedGlobe(p: EmbedGlobeProps & { epoch: number }) {
  const wrap = useRef<HTMLDivElement>(null);
  const inView = useInView(wrap, p.epoch);
  const visible = usePageVisible();
  const [hover, setHover] = useState<string | null>(null);
  const [lost, setLost] = useState(false);
  const gl = hasWebGL();
  const flat = (note?: string) => <FlatMap markers={p.markers} callouts={p.callouts} countries={p.countries} note={note} />;
  return (
    <div className="dbx-stage" ref={wrap} data-active={String(inView && visible)}>
      {p.view !== 'map' && gl && !lost ? (
        <SceneErrorBoundary fallback={flat('3D view failed, showing the 2D map.')} onError={() => setLost(true)}>
          <Suspense fallback={<div className="scene-loading" role="status" aria-label="Loading 3D globe"><span /></div>}>
            <GlobeScene
              markers={p.markers}
              callouts={p.callouts}
              arcs={p.arcs ?? []}
              buildings={p.buildings}
              kind={p.kind}
              countries={p.countries}
              hoverId={hover}
              onHover={setHover}
              onSelect={(id) => p.onSelect?.(id)}
              dark={p.dark}
              reducedMotion={p.reducedMotion}
              autoRotate={p.autoRotate}
              showCity={p.showCity}
              focusLon={p.focusLon}
              active={inView && visible}
              onContextLost={() => setLost(true)}
            />
          </Suspense>
        </SceneErrorBoundary>
      ) : (
        flat(p.view !== 'map' && (!gl || lost) ? '3D view is not available on this device, showing the 2D map.' : undefined)
      )}
    </div>
  );
}

function injectStyles() {
  if (document.getElementById('dbx-embed-css')) return;
  const s = document.createElement('style');
  s.id = 'dbx-embed-css';
  s.textContent = css;
  document.head.append(s);
}

export interface GlobeHandle {
  update(props: EmbedGlobeProps): void;
  unmount(): void;
}

export function mountGlobe(el: HTMLElement, props: EmbedGlobeProps): GlobeHandle {
  injectStyles();
  el.classList.add('dbx-embed');
  el.classList.toggle('dark', !!props.dark);
  const root: Root = createRoot(el);
  let epoch = 0;
  root.render(<EmbedGlobe {...props} epoch={epoch} />);
  let alive = true;
  return {
    update(next) {
      if (!alive) return;
      el.classList.toggle('dark', !!next.dark);
      root.render(<EmbedGlobe {...next} epoch={++epoch} />);
    },
    unmount() {
      if (!alive) return;
      alive = false;
      root.unmount();
    },
  };
}

declare global {
  interface Window {
    DBOverviewEmbed?: { mountGlobe: typeof mountGlobe; hasWebGL: typeof hasWebGL; version: number };
  }
}
window.DBOverviewEmbed = { mountGlobe, hasWebGL, version: 1 };
window.dispatchEvent(new Event('dbx-embed-ready'));
