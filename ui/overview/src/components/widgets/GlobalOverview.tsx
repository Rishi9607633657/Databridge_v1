/* Global Business Overview: 3D globe + mini cities (or the 2D map), region list, callouts and summary stats. */
import { lazy, Suspense, useMemo, useRef, useState } from 'react';
import { Building, CalendarDays, Globe, Link2, MapPin } from 'lucide-react';
import { useApp } from '../../app/state';
import { useData } from '../../app/data';
import { Card } from '../ui/Card';
import { Dropdown } from '../ui/Dropdown';
import { Segmented } from '../ui/Segmented';
import { CardSkeleton } from '../ui/States';
import { FlatMap } from '../maps/FlatMap';
import { SceneErrorBoundary } from '../3d/SceneErrorBoundary';
import { hasWebGL } from '../3d/webgl';
import type { SceneArc, SceneBuilding, SceneCallout, SceneMarker } from '../3d/GlobeScene';
import { CITY_BY_ID, GEO, HQ_CITY, HUBS, regionHue, regionLabel } from '../../domains/places';
import type { RegionId } from '../../domains/types';
import { hue, HUES } from '../../lib/palette';
import { BAR_HUES } from './TopEntities';
import { formatValue } from '../../lib/format';
import { useInView, useMedia } from '../../lib/hooks';
import { dateOf } from '../../lib/dates';

const GlobeScene = lazy(() => import('../3d/GlobeScene'));

/** calendar months from the first to the last day, both included */
function monthsBetween(a: number, b: number) {
  const x = dateOf(a);
  const y = dateOf(b);
  return Math.max(1, (y.getFullYear() - x.getFullYear()) * 12 + y.getMonth() - x.getMonth() + 1);
}


export function GlobalOverview() {
  const { domain, region, setRegion, fo, theme, reducedMotion, settings, hoverEntityId, setHoverEntityId, setSelectedEntityId, connected } = useApp();
  const { overview } = useData();
  const gl = hasWebGL();
  const [view, setView] = useState<'globe' | 'map'>(gl ? 'globe' : 'map');
  const [lost, setLost] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const inView = useInView(wrap);
  const narrow = useMedia('(max-width: 760px)');
  const plural = domain.entity.plural;

  const model = useMemo(() => {
    if (!overview) return null;
    const maxCity = Math.max(...overview.cities.map((c) => c.entities), 1);
    const markers: SceneMarker[] = overview.cities.filter((c) => Number.isFinite(c.city.lat) && Number.isFinite(c.city.lon)).map((c) => ({
      id: c.city.id, lat: c.city.lat, lon: c.city.lon, color: hue(regionHue(c.region)).base,
      size: 0.011 + 0.012 * Math.sqrt(c.entities / maxCity), dim: region !== 'all' && c.region !== region,
      label: `${c.city.name}: ${c.entities} ${c.entities === 1 ? domain.entity.singular.toLowerCase() : plural.toLowerCase()}, ${formatValue(c.value, domain.series.primary.format, fo)}`,
    }));
    const hubs = [...overview.hubs].sort((a, b) => b.value - a.value);
    const callouts: SceneCallout[] = hubs.map((h, i) => ({
      id: h.hub.id, lat: h.hub.lat, lon: h.hub.lon, label: h.hub.label, flag: h.hub.flag,
      line1: `${h.entities} ${h.entities === 1 ? domain.entity.singular : plural}`, line2: formatValue(h.value, domain.series.primary.format, fo),
      dim: region !== 'all' && h.region !== region, priority: region !== 'all' && h.region === region ? -10 + i : i,
      onClick: () => setRegion(h.region === region ? 'all' : h.region),
    }));
    /* arcs only for the demo's configured HQ ↔ hub links; a live board has no such relationships */
    const hq = CITY_BY_ID[HQ_CITY];
    const arcs: SceneArc[] = GEO.live
      ? []
      : hubs
          .filter((h) => h.hub.id !== 'in')
          .map((h) => ({ id: `arc-${h.hub.id}`, from: [hq.lat, hq.lon] as [number, number], to: [h.hub.lat, h.hub.lon] as [number, number], color: hue(regionHue(h.region)).base, dim: region !== 'all' && h.region !== region }));
    const top = overview.entities.slice(0, 10);
    const max = Math.max(...top.map((t) => t.value), 1);
    const buildings: SceneBuilding[] = top.map((t) => ({
      id: t.entity.id, name: t.entity.name, rank: t.rank, height: 0.3 + 0.85 * (t.value / max), accent: HUES[BAR_HUES[(t.rank - 1) % BAR_HUES.length]].base,
      value: formatValue(t.value, domain.series.primary.format, fo), sub: `${domain.entity.singular} · ${t.entity.city.name}`,
    }));
    const countries = [...new Set(overview.allEntities.map((e) => e.entity.country).filter(Boolean))];
    /* which way the globe faces: fixed for demo regions, the middle of the locations for a live board */
    const located = overview.allEntities.filter((e) => Number.isFinite(e.entity.lon) && (region === 'all' || e.entity.region === region));
    const meanLon = located.length ? located.reduce((t, e) => t + e.entity.lon * (e.value || 1), 0) / (located.reduce((t, e) => t + (e.value || 1), 0) || 1) : 62;
    const focusLon = GEO.live ? meanLon : GEO.focus[region] ?? meanLon;
    return { markers, callouts, arcs, buildings, countries, focusLon };
  }, [overview, region, domain, fo, plural, setRegion]);

  const regionOptions = [{ value: 'all' as const, label: 'All Regions' }, ...(overview?.regions ?? []).map((r) => ({ value: r.id, label: r.label }))];
  const integrations = Object.values(connected).filter(Boolean).length;
  const sub = `${region === 'all' ? `All ${plural}` : regionLabel(region)} • ${domain.live ? domain.live.table : domain.label}`;
  const fallbackNote = !gl || lost ? '3D view is not available on this device, showing the 2D map.' : undefined;

  return (
    <Card
      id="global"
      className="card-global"
      title="Global Business Overview"
      sub={sub}
      actions={
        <>
          {gl && !lost && (
            <Segmented label="View" variant="pill" value={view} onChange={setView} options={[{ value: 'globe', label: '3D Globe' }, { value: 'map', label: '2D Map' }]} />
          )}
          <Dropdown label="Region" value={region} onChange={(v) => setRegion(v as RegionId | 'all')} options={regionOptions} />
        </>
      }
    >
      {!overview || !model ? (
        <CardSkeleton lines={6} />
      ) : (
        <>
          <div className="gl-grid" ref={wrap}>
            <ul className="gl-regions" aria-label="Regions">
              {overview.regions.map((r) => (
                <li key={r.id}>
                  <button type="button" className={`gl-region ${region === r.id ? 'on' : ''} ${region !== 'all' && region !== r.id ? 'off' : ''}`} aria-pressed={region === r.id} onClick={() => setRegion(region === r.id ? 'all' : r.id)}>
                    <span className="ring" style={{ borderColor: hue(r.hue).base }} aria-hidden="true" />
                    <span>
                      <strong>{r.label}</strong>
                      <small>
                        {r.entities} {r.entities === 1 ? domain.entity.singular.toLowerCase() : plural.toLowerCase()}
                      </small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="gl-stage">
              {view === 'globe' && gl && !lost ? (
                <SceneErrorBoundary fallback={<FlatMap markers={model.markers} callouts={model.callouts} countries={model.countries} note="3D view failed, showing the 2D map." />} onError={() => setLost(true)}>
                  <Suspense fallback={<div className="scene-loading" role="status" aria-label="Loading 3D globe"><span /></div>}>
                    <GlobeScene
                      markers={model.markers}
                      callouts={model.callouts}
                      arcs={model.arcs}
                      buildings={model.buildings}
                      kind={domain.entity.building}
                      countries={model.countries}
                      hoverId={hoverEntityId}
                      onHover={setHoverEntityId}
                      onSelect={setSelectedEntityId}
                      dark={theme === 'dark'}
                      reducedMotion={reducedMotion}
                      autoRotate={settings.autoRotate}
                      showCity={!narrow}
                      focusLon={model.focusLon}
                      active={inView}
                      onContextLost={() => setLost(true)}
                    />
                  </Suspense>
                </SceneErrorBoundary>
              ) : (
                <FlatMap markers={model.markers} callouts={model.callouts} countries={model.countries} note={fallbackNote} />
              )}
            </div>
          </div>
          <dl className="gl-stats">
            <div>
              <dt><MapPin size={18} aria-hidden="true" /></dt>
              <dd><strong>{overview.totals.entities}</strong><span>Total {plural}</span></dd>
            </div>
            <div>
              <dt><Globe size={18} aria-hidden="true" /></dt>
              <dd><strong>{overview.totals.countries}</strong><span>Countries</span></dd>
            </div>
            <div>
              <dt><Building size={18} aria-hidden="true" /></dt>
              <dd><strong>{overview.totals.cities}</strong><span>Cities</span></dd>
            </div>
            {domain.live ? (
              <div>
                <dt><CalendarDays size={18} aria-hidden="true" /></dt>
                <dd><strong>{monthsBetween(domain.live.first, domain.live.last)}</strong><span>Months of data</span></dd>
              </div>
            ) : (
              <div>
                <dt><Link2 size={18} aria-hidden="true" /></dt>
                <dd><strong>{integrations}</strong><span>Active Integrations</span></dd>
              </div>
            )}
          </dl>
          <p className="sr-only">
            {HUBS.length} hubs. Buildings show the top {model.buildings.length} {plural.toLowerCase()} by {domain.series.primary.noun}; the same list is in Top Locations below.
          </p>
        </>
      )}
    </Card>
  );
}
