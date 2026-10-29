/* App-wide state: domain, date range, region, settings, theme, selection. Persisted per viewer in localStorage. */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CustomDomainInput, DomainConfig, DomainId, RegionId, WidgetId } from '../domains/types';
import { getDomain, isDomainId } from '../domains/registry';
import { CUSTOM_DEFAULTS } from '../domains/configs/custom';
import { REGION_IDS, applyGeo } from '../domains/places';
import { boardIdFromUrl, loadBoard, type Board } from '../board/board';
import { previousRange, resolveRange, todayDay, type RangeState, type ResolvedRange } from '../lib/dates';
import type { FormatOptions, NumberSystem } from '../lib/format';
import { load, loadValue, save } from '../lib/storage';
import { demoMetricsService } from '../services/metricsService';
import { getFeatures, getMe, type Me } from '../services/platformService';
import { servedByDataBridge } from '../services/apiClient';
import { INTEGRATIONS } from '../data/demo/integrations';

export type ThemeSetting = 'light' | 'dark' | 'system';

/* Inside DataBridge the theme is shared with the workspace pages (its Light / Dark / Auto switch uses this key). */
const SHARED_THEME = 'databridge-theme';
const isTheme = (v: unknown): v is ThemeSetting => v === 'light' || v === 'dark' || v === 'system';
function sharedTheme(): ThemeSetting | null {
  if (!servedByDataBridge()) return null;
  try {
    const v = localStorage.getItem(SHARED_THEME);
    return isTheme(v) ? v : 'system';
  } catch {
    return null;
  }
}
function saveSharedTheme(t: ThemeSetting) {
  if (!servedByDataBridge()) return;
  try {
    localStorage.setItem(SHARED_THEME, t);
  } catch {
    /* storage unavailable */
  }
}
export type MotionSetting = 'system' | 'reduce' | 'full';

export interface Settings {
  theme: ThemeSetting;
  motion: MotionSetting;
  numberSystem: NumberSystem;
  currency: string;
  hiddenWidgets: WidgetId[];
  autoRotate: boolean;
  defaultDomain: DomainId;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  motion: 'system',
  numberSystem: 'indian',
  currency: '₹',
  hiddenWidgets: [],
  autoRotate: true,
  defaultDomain: 'retail',
};

interface AppState {
  domainId: DomainId;
  domain: DomainConfig;
  setDomainId: (id: DomainId) => void;
  custom: CustomDomainInput;
  setCustom: (c: CustomDomainInput) => void;
  range: RangeState;
  setRange: (r: RangeState) => void;
  resolved: ResolvedRange;
  prev: ResolvedRange;
  minDay: number;
  today: number;
  region: RegionId | 'all';
  setRegion: (r: RegionId | 'all') => void;
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  fo: FormatOptions;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  reducedMotion: boolean;
  selectedEntityId: string | null;
  setSelectedEntityId: (id: string | null) => void;
  hoverEntityId: string | null;
  setHoverEntityId: (id: string | null) => void;
  me: Me | null;
  /** a live board on the person's own table (?board=… in the address) */
  boardId: string | null;
  board: Board | null;
  boardStatus: 'none' | 'loading' | 'ready' | 'error';
  boardError: string | null;
  /** fetch the board's data again (skips the server's 5-minute cache) */
  refreshBoard: () => void;
  /** feature flags of the signed-in user (missing = on) */
  features: Record<string, boolean>;
  connected: Record<string, boolean>;
  setConnected: (id: string, on: boolean) => void;
}

const Ctx = createContext<AppState | null>(null);

const isRange = (v: unknown): v is RangeState => !!v && typeof v === 'object' && typeof (v as RangeState).preset === 'string';
const isRegion = (v: unknown): v is RegionId | 'all' => v === 'all' || (typeof v === 'string' && (REGION_IDS as string[]).includes(v));

function useMedia(query: string): boolean {
  const get = () => (typeof matchMedia === 'function' ? matchMedia(query).matches : false);
  const [m, setM] = useState(get);
  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const mq = matchMedia(query);
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return m;
}

function initialDomain(settings: Settings): DomainId {
  try {
    const q = new URLSearchParams(location.hash.split('?')[1] || location.search).get('domain');
    if (isDomainId(q)) return q;
  } catch {
    /* ignore */
  }
  return loadValue<DomainId>('dbx.domain', settings.defaultDomain, isDomainId);
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const s = load<Settings>('dbx.settings', DEFAULT_SETTINGS);
    return { ...s, theme: sharedTheme() ?? s.theme, hiddenWidgets: Array.isArray(s.hiddenWidgets) ? s.hiddenWidgets : [] };
  });
  const [domainId, setDomainIdRaw] = useState<DomainId>(() => initialDomain(settings));
  const [custom, setCustomRaw] = useState<CustomDomainInput>(() => load<CustomDomainInput>('dbx.custom', CUSTOM_DEFAULTS));
  const [range, setRangeRaw] = useState<RangeState>(() => loadValue<RangeState>('dbx.range', { preset: '28d' }, isRange));
  const [region, setRegionRaw] = useState<RegionId | 'all'>(() => loadValue<RegionId | 'all'>('dbx.region', 'all', isRegion));
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [hoverEntityId, setHoverEntityId] = useState<string | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [boardId] = useState<string | null>(boardIdFromUrl);
  const [board, setBoard] = useState<Board | null>(null);
  const [boardStatus, setBoardStatus] = useState<AppState['boardStatus']>(() => (boardIdFromUrl() ? 'loading' : 'none'));
  const [boardError, setBoardError] = useState<string | null>(null);
  const [boardNonce, setBoardNonce] = useState(0);
  const refreshBoard = useCallback(() => setBoardNonce((n) => n + 1), []);
  useEffect(() => {
    if (!boardId) {
      applyGeo(null);
      return;
    }
    let alive = true;
    setBoardStatus('loading');
    loadBoard(boardId, boardNonce > 0)
      .then((b) => {
        if (!alive) return;
        applyGeo(b.geo);
        setRegionRaw((r) => (r === 'all' || REGION_IDS.includes(r) ? r : 'all'));
        /* a monthly or weekly table needs a longer range than "last 7 days" */
        if (b.dataset.grain !== 'day') setRangeRaw((r) => (['today', '7d', '28d', '30d'].includes(r.preset) ? { preset: '12m' } : r));
        setBoard(b);
        setBoardError(null);
        setBoardStatus('ready');
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setBoardError(e instanceof Error ? e.message : 'Could not load this board');
        setBoardStatus('error');
      });
    return () => {
      alive = false;
    };
  }, [boardId, boardNonce]);
  const [today, setToday] = useState(todayDay);
  const [connected, setConnectedRaw] = useState<Record<string, boolean>>(() => load<Record<string, boolean>>('dbx.integrations', Object.fromEntries(INTEGRATIONS.map((i) => [i.id, i.connected]))));
  const setConnected = useCallback((id: string, on: boolean) => {
    setConnectedRaw((c) => {
      const n = { ...c, [id]: on };
      save('dbx.integrations', n);
      return n;
    });
  }, []);

  const sysDark = useMedia('(prefers-color-scheme: dark)');
  const sysReduce = useMedia('(prefers-reduced-motion: reduce)');
  const theme: 'light' | 'dark' = settings.theme === 'system' ? (sysDark ? 'dark' : 'light') : settings.theme;
  const reducedMotion = settings.motion === 'reduce' || (settings.motion === 'system' && sysReduce);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  useEffect(() => {
    document.documentElement.toggleAttribute('data-reduce-motion', reducedMotion);
  }, [reducedMotion]);
  useEffect(() => {
    getMe().then(setMe);
    if (servedByDataBridge()) getFeatures().then(setFeatures);
    const t = setInterval(() => setToday(todayDay()), 60000); // roll over at midnight
    /* follow a theme change made on a workspace page in another tab */
    const onStorage = (e: StorageEvent) => {
      if (e.key === SHARED_THEME && isTheme(e.newValue) && servedByDataBridge()) {
        const theme = e.newValue;
        setSettings((s) => (s.theme === theme ? s : { ...s, theme }));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      clearInterval(t);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const demoDomain = useMemo(() => getDomain(domainId, custom), [domainId, custom]);
  const domain = board ? board.domain : demoDomain;
  const minDay = useMemo(() => (board ? board.dataset.start : demoMetricsService.minDay(demoDomain)), [board, demoDomain]);
  const dataToday = board ? board.dataset.today : today;
  const resolved = useMemo(() => resolveRange(range, dataToday, minDay), [range, dataToday, minDay]);
  const prev = useMemo(() => previousRange(resolved, minDay), [resolved, minDay]);

  const setDomainId = useCallback((id: DomainId) => {
    setDomainIdRaw(id);
    setSelectedEntityId(null);
    save('dbx.domain', id);
  }, []);
  const setCustom = useCallback((c: CustomDomainInput) => {
    setCustomRaw(c);
    save('dbx.custom', c);
  }, []);
  const setRange = useCallback((r: RangeState) => {
    setRangeRaw(r);
    save('dbx.range', r);
  }, []);
  const setRegion = useCallback((r: RegionId | 'all') => {
    setRegionRaw(r);
    save('dbx.region', r);
  }, []);
  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => {
      const n = { ...s, ...patch };
      save('dbx.settings', n);
      return n;
    });
    if (patch.theme) saveSharedTheme(patch.theme);
  }, []);
  const toggleTheme = useCallback(() => updateSettings({ theme: theme === 'dark' ? 'light' : 'dark' }), [theme, updateSettings]);
  const fo = useMemo<FormatOptions>(() => ({ currency: settings.currency || '₹', system: settings.numberSystem }), [settings.currency, settings.numberSystem]);

  const value: AppState = {
    domainId, domain, setDomainId, custom, setCustom, range, setRange, resolved, prev, minDay, today: dataToday, region, setRegion,
    settings, updateSettings, fo, theme, toggleTheme, reducedMotion, selectedEntityId, setSelectedEntityId, hoverEntityId, setHoverEntityId, me,
    features, connected, setConnected, boardId, board, boardStatus, boardError, refreshBoard,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppStateProvider');
  return v;
}
