/* Shared data for every page: the overview numbers (recomputed when domain, dates or region change),
   insights, the event stream and system health samples. */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useApp } from './state';
import type { MetricsService, Overview } from '../services/types';
import { demoMetricsService } from '../services/metricsService';
import { buildInsights, type Insight } from '../services/insightsService';
import { initialEvents, subscribeEvents, type AppEvent } from '../services/eventsService';
import { sampleHealth, type HealthSample } from '../services/healthService';
import { boardEvents } from '../board/board';

interface DataState {
  overview: Overview | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
  insights: Insight[];
  events: AppEvent[];
  eventsPaused: boolean;
  setEventsPaused: (p: boolean) => void;
  health: HealthSample | null;
  healthHistory: HealthSample[];
  readIds: Set<string>;
  markRead: (ids: string[]) => void;
}

const Ctx = createContext<DataState | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { domain, resolved, prev, region, fo, board, boardStatus, boardError, refreshBoard } = useApp();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const reload = useCallback(() => (board ? refreshBoard() : setNonce((n) => n + 1)), [board, refreshBoard]);

  useEffect(() => {
    if (boardStatus === 'loading') {
      setLoading(true);
      return;
    }
    if (boardStatus === 'error') {
      setOverview(null);
      setError(boardError || 'Could not load this board');
      setLoading(false);
      return;
    }
    /* the demo generator, or the live board's own numbers (same interface) */
    const metrics: MetricsService = board ? board.service : demoMetricsService;
    let alive = true;
    setLoading(true);
    metrics
      .getOverview({ domain, range: resolved, prev, region })
      .then((o) => {
        if (!alive) return;
        setOverview(o);
        setError(null);
      })
      .catch((e: unknown) => alive && setError(e instanceof Error ? e.message : 'Could not load the numbers'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [domain, resolved, prev, region, nonce, board, boardStatus, boardError]);

  const insights = useMemo(() => (overview ? buildInsights(overview, fo) : []), [overview, fo]);

  /* events: a recent history plus a simulated stream for the current domain */
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [eventsPaused, setEventsPaused] = useState(false);
  const pausedRef = useRef(false);
  pausedRef.current = eventsPaused;
  useEffect(() => {
    if (domain.live) {
      setEvents([]); // a live board shows events from its own data (below), never simulated ones
      return;
    }
    setEvents(initialEvents(domain, fo));
    return subscribeEvents(domain, fo, (e) => {
      if (!pausedRef.current) setEvents((list) => [e, ...list].slice(0, 80));
    });
  }, [domain, fo]);
  const liveEvents = useMemo(() => (overview && overview.source === 'live' ? boardEvents(overview, fo) : null), [overview, fo]);

  /* health samples every 3 s */
  const [health, setHealth] = useState<HealthSample | null>(null);
  const [healthHistory, setHistory] = useState<HealthSample[]>([]);
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      if (document.hidden) return;
      const s = await sampleHealth();
      if (!alive) return;
      setHealth(s);
      setHistory((h) => [...h, s].slice(-60));
    };
    tick();
    const t = setInterval(tick, 3000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const markRead = useCallback((ids: string[]) => setReadIds((s) => new Set([...s, ...ids])), []);

  const value: DataState = { overview, loading, error, reload, insights, events: liveEvents ?? events, eventsPaused, setEventsPaused, health, healthHistory, readIds, markRead };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useData(): DataState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useData must be used inside DataProvider');
  return v;
}
