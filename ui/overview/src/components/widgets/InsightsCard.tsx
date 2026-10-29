/* AI Insights: three tinted cards; "Generate New" shows the next set. Rule-based, computed from the numbers. */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WandSparkles } from 'lucide-react';
import { useData } from '../../app/data';
import { useApp } from '../../app/state';
import { Card } from '../ui/Card';
import { CardSkeleton } from '../ui/States';
import { iconOf } from '../ui/icons';
import { hue } from '../../lib/palette';
import { insightPage, type Insight } from '../../services/insightsService';

export function InsightTile({ x, onOpen }: { x: Insight; onOpen?: (to: string) => void }) {
  const h = hue(x.hue);
  const Icon = iconOf(x.icon);
  return (
    <article className={`ins ins-${x.tone}`} style={{ ['--c' as string]: h.base }}>
      <span className="ins-ico" aria-hidden="true">
        <Icon size={22} />
      </span>
      <div>
        <h3>{x.title}</h3>
        <p>{x.text}</p>
        {x.link && onOpen && (
          <button type="button" className="link-btn sm" onClick={() => onOpen(x.link!.to)}>
            {x.link.label}
          </button>
        )}
      </div>
    </article>
  );
}

export function InsightsCard() {
  const { insights, overview } = useData();
  const { domain } = useApp();
  const nav = useNavigate();
  const [page, setPage] = useState(0);
  const list = insightPage(insights, page);
  const pages = Math.max(1, Math.ceil(insights.length / 3));
  return (
    <Card
      id="insights"
      className="card-ins"
      title="AI Insights"
      actions={
        <button type="button" className="btn-soft" onClick={() => setPage((x) => x + 1)} disabled={insights.length <= 3} aria-describedby="ins-note">
          <WandSparkles size={15} aria-hidden="true" /> {insights.length <= 3 ? 'All shown' : `More insights ${(page % pages) + 1}/${pages}`}
        </button>
      }
    >
      {!overview ? (
        <CardSkeleton lines={4} />
      ) : (
        <div className="ins-grid" aria-live="polite">
          {list.map((x) => (
            <InsightTile key={x.id} x={x} onOpen={(to) => nav(to)} />
          ))}
        </div>
      )}
      <p className="card-note" id="ins-note">Rule-based insights from {domain.live ? 'your data' : 'demo data'} · {insights.length} found</p>
    </Card>
  );
}
