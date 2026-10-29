/* Recent events. SIMULATED: events are made from the domain's templates and the demo entities,
   one every few seconds. A real implementation would subscribe to an event API or a websocket. */
import type { DomainConfig, EventType } from '../domains/types';
import { datasetFor } from '../data/demo/generator';
import { formatValue, type FormatOptions } from '../lib/format';
import { pick, rngFrom, weightedPick } from '../lib/random';

export interface AppEvent {
  id: string;
  time: Date;
  type: EventType;
  text: string;
  entityId?: string;
  severity: 'info' | 'success' | 'warning';
  /** shown instead of the clock time (events from data are per day) */
  when?: string;
}

let seq = 0;

export function makeEvent(domain: DomainConfig, fo: FormatOptions, when: Date, seed: string): AppEvent {
  const rng = rngFrom(seed);
  const ds = datasetFor(domain);
  const t = weightedPick(rng, domain.events);
  const e = pick(rng, ds.entities.filter((x) => x.status === 'active'));
  const amount = domain.scale.primaryPerDay * (0.4 + rng() * 2.2);
  const text = t.text
    .replace('{entity}', e.name)
    .replace('{city}', e.city.name)
    .replace('{category}', pick(rng, domain.categories.items).label)
    .replace('{segment}', pick(rng, domain.segments.items).label)
    .replace('{n}', String(2 + Math.floor(rng() * 9)))
    .replace('{amount}', formatValue(amount, 'currency', fo));
  seq += 1;
  return { id: `ev${when.getTime()}-${seq}`, time: when, type: t.type, text, entityId: e.id, severity: t.type === 'alert' ? 'warning' : t.type === 'sync' ? 'success' : 'info' };
}

/** A believable recent history: the last ~20 events spaced 5–60 s apart. */
export function initialEvents(domain: DomainConfig, fo: FormatOptions, n = 20): AppEvent[] {
  const rng = rngFrom(`events:${domain.id}:${Math.floor(Date.now() / 600000)}`);
  const out: AppEvent[] = [];
  let t = Date.now() - 2000;
  for (let i = 0; i < n; i++) {
    out.push(makeEvent(domain, fo, new Date(t), `${domain.id}:init:${i}:${Math.floor(Date.now() / 600000)}`));
    t -= 5000 + rng() * 55000;
  }
  return out;
}

/** Calls `cb` with a new event every 6–14 s while the page is visible. Returns a stop function. */
export function subscribeEvents(domain: DomainConfig, fo: FormatOptions, cb: (e: AppEvent) => void): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;
  const next = () => {
    if (stopped) return;
    timer = setTimeout(() => {
      if (!document.hidden) cb(makeEvent(domain, fo, new Date(), `${domain.id}:live:${Date.now()}`));
      next();
    }, 6000 + Math.random() * 8000);
  };
  next();
  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
}
