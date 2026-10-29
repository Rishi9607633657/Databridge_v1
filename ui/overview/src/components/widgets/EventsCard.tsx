/* Recent Events timeline (simulated stream for the current domain). */
import { useNavigate } from 'react-router-dom';
import { useData } from '../../app/data';
import { useApp } from '../../app/state';
import { Card, LinkButton } from '../ui/Card';
import { SourceTag } from '../ui/States';
import { iconOf, type IconKey } from '../ui/icons';
import { HUES } from '../../lib/palette';
import { fmtTime } from '../../lib/dates';
import type { EventType, Hue } from '../../domains/types';
import type { AppEvent } from '../../services/eventsService';

export const EVENT_STYLE: Record<EventType, { icon: IconKey; hue: Hue; label: string }> = {
  order: { icon: 'bag', hue: 'green', label: 'Activity' },
  payment: { icon: 'card', hue: 'blue', label: 'Payments' },
  inventory: { icon: 'boxes', hue: 'violet', label: 'Updates' },
  customer: { icon: 'userPlus', hue: 'rose', label: 'People' },
  sync: { icon: 'sync', hue: 'teal', label: 'Data sync' },
  alert: { icon: 'alert', hue: 'orange', label: 'Alerts' },
};

export function EventRow({ e }: { e: AppEvent }) {
  const s = EVENT_STYLE[e.type];
  const h = HUES[s.hue];
  const Icon = iconOf(s.icon);
  return (
    <li className={`ev-row ev-${e.type}`}>
      <time dateTime={e.time.toISOString()}>{e.when ?? fmtTime(e.time)}</time>
      <span className="ev-dot" style={{ background: h.base }} aria-hidden="true" />
      <span className="chip-ico sm" style={{ ['--c' as string]: h.base }} aria-hidden="true">
        <Icon size={14} />
      </span>
      <span className="ev-text">
        <span className="sr-only">{s.label}: </span>
        {e.text}
      </span>
    </li>
  );
}

export function EventsCard({ limit = 6 }: { limit?: number }) {
  const { events } = useData();
  const { domain } = useApp();
  const nav = useNavigate();
  return (
    <Card
      id="events"
      className="card-events"
      title="Recent Events"
      actions={
        <>
          {domain.live ? <SourceTag source="live" title={`Daily totals and unusual days from ${domain.live.table}`} /> : <SourceTag source="simulated" title="Events are simulated from the demo data" />}
          <LinkButton onClick={() => nav('/monitoring')}>View All</LinkButton>
        </>
      }
    >
      <ul className="ev-list" aria-live="polite" aria-relevant="additions">
        {events.slice(0, limit).map((e) => (
          <EventRow key={e.id} e={e} />
        ))}
      </ul>
    </Card>
  );
}
