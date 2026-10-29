/* "Revenue by Category" (title follows the domain): icon chip, bar, value and share for each category. */
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/state';
import { useData } from '../../app/data';
import { Card, LinkButton } from '../ui/Card';
import { CardSkeleton } from '../ui/States';
import { iconOf } from '../ui/icons';
import { hue } from '../../lib/palette';
import { formatValue } from '../../lib/format';

export function CategoryCard() {
  const { domain, fo } = useApp();
  const { overview } = useData();
  const nav = useNavigate();
  const list = overview ? [...overview.categories].sort((a, b) => b.value - a.value) : [];
  const max = Math.max(...list.map((x) => x.value), 1);
  return (
    <Card id="categories" className="card-cat" title={domain.categories.title} actions={<LinkButton onClick={() => nav('/analytics?tab=breakdown&dim=category')}>View All</LinkButton>}>
      {!overview ? (
        <CardSkeleton lines={5} />
      ) : (
        <ul className="cat-list">
          {list.map((x) => {
            const h = hue(x.def.hue);
            const Icon = iconOf(x.def.icon);
            return (
              <li key={x.def.id} className="cat-row">
                <span className="chip-ico" style={{ ['--c' as string]: h.base }} aria-hidden="true">
                  <Icon size={17} />
                </span>
                <span className="cat-name">{x.def.label}</span>
                <span className="cat-bar" aria-hidden="true">
                  <span style={{ width: `${Math.max(5, (x.value / max) * 100)}%`, background: `linear-gradient(90deg, ${h.from}, ${h.to})` }} />
                </span>
                <span className="cat-val">{formatValue(x.value, domain.series.primary.format, fo)}</span>
                <span className="cat-share">{(x.share * 100).toFixed(0)}%</span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
