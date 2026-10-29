/* "Top Locations by Sales": ranked entities with mini building thumbnails, bars and growth.
   Hovering a row highlights the same building in the 3D scene; clicking opens its details. */
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/state';
import { useData } from '../../app/data';
import { Card, LinkButton } from '../ui/Card';
import { CardSkeleton, EmptyState } from '../ui/States';
import { Delta } from '../ui/Delta';
import { EntityThumb } from '../misc/EntityThumb';
import { regionLabel } from '../../domains/places';
import { HUES } from '../../lib/palette';
import { formatValue } from '../../lib/format';

export const BAR_HUES = ['violet', 'blue', 'sky', 'amber', 'orange'] as const;

export function TopEntities({ limit = 5 }: { limit?: number }) {
  const { domain, fo, hoverEntityId, setHoverEntityId, setSelectedEntityId, region } = useApp();
  const { overview } = useData();
  const nav = useNavigate();
  const list = overview?.entities.slice(0, limit) ?? [];
  const max = Math.max(...list.map((x) => x.value), 1);
  return (
    <Card
      id="top"
      className="card-top"
      title={`Top ${domain.entity.plural} by ${domain.series.primary.label}`}
      sub={region === 'all' ? undefined : regionLabel(region)}
      actions={<LinkButton onClick={() => nav('/analytics?tab=locations')}>View All</LinkButton>}
    >
      {!overview ? (
        <CardSkeleton lines={5} />
      ) : !list.length ? (
        <EmptyState title={`No ${domain.entity.plural.toLowerCase()} here`}>Try another region.</EmptyState>
      ) : (
        <ol className="rank-list">
          {list.map((x, i) => {
            const h = HUES[BAR_HUES[i % BAR_HUES.length]];
            return (
              <li key={x.entity.id}>
                <button
                  type="button"
                  className={`rank-row ${hoverEntityId === x.entity.id ? 'hl' : ''}`}
                  onMouseEnter={() => setHoverEntityId(x.entity.id)}
                  onMouseLeave={() => setHoverEntityId(null)}
                  onFocus={() => setHoverEntityId(x.entity.id)}
                  onBlur={() => setHoverEntityId(null)}
                  onClick={() => setSelectedEntityId(x.entity.id)}
                  aria-label={`Rank ${x.rank}: ${x.entity.name}, ${formatValue(x.value, domain.series.primary.format, fo)}. Open details`}
                >
                  <span className="rank-no">#{x.rank}</span>
                  <EntityThumb kind={domain.entity.building} color={h.base} size={34} />
                  <span className="rank-name">
                    <span>{x.entity.name}</span>
                  </span>
                  <span className="rank-bar" aria-hidden="true">
                    <span style={{ width: `${Math.max(6, (x.value / max) * 100)}%`, background: `linear-gradient(90deg, ${h.from}, ${h.to})` }} />
                  </span>
                  <span className="rank-val">{formatValue(x.value, domain.series.primary.format, fo)}</span>
                  <span className="rank-delta"><Delta value={x.growth} size="sm" /></span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
