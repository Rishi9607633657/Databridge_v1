/* DataBridge platform data for the secondary pages. Each call tries the real DataBridge API first and falls
   back to clearly labelled sample rows when the page runs on its own (or you are not signed in). */
import { apiGet, ApiError } from './apiClient';
import type { DataSource } from './types';

export interface Sourced<T> {
  source: DataSource;
  data: T;
  note?: string;
}

export interface DashboardRow {
  id: string;
  name: string;
  description?: string;
  widgets?: number;
  pages?: number;
  look?: string;
  updated?: string;
  owner?: string;
}

export interface TableRow {
  db: string;
  name: string;
  type?: string;
  rows?: number | null;
  columns?: { name: string; type: string }[];
  updated?: string;
}

export interface UserRow {
  id: string;
  username: string;
  name?: string;
  email?: string;
  role: string;
  lastLogin?: string;
  active?: boolean;
}

export interface Me {
  username: string;
  name?: string;
  role?: string;
}

const why = (e: unknown) => (e instanceof ApiError ? e.message : 'DataBridge API not reachable');

async function attempt<T>(live: () => Promise<T>, demo: () => T): Promise<Sourced<T>> {
  try {
    return { source: 'live', data: await live() };
  } catch (e) {
    return { source: 'demo', data: demo(), note: why(e) };
  }
}

/* ---- sample rows (shown only when the live API is not available) ---- */
const SAMPLE_DASHBOARDS: DashboardRow[] = [
  { id: 'sample-1', name: 'Executive overview', pages: 3, look: 'clean', updated: '2 days ago', owner: 'admin' },
  { id: 'sample-2', name: 'Regional performance', pages: 2, look: 'ocean', updated: '5 days ago', owner: 'analyst' },
  { id: 'sample-3', name: 'Category deep dive', pages: 4, look: 'graphite', updated: '1 week ago', owner: 'analyst' },
  { id: 'sample-4', name: 'Operations live board', pages: 1, look: 'holo', updated: '3 weeks ago', owner: 'ops' },
];

const SAMPLE_TABLES: TableRow[] = [
  { db: 'sales', name: 'orders', type: 'DELTA', rows: 1284553, columns: [{ name: 'order_id', type: 'string' }, { name: 'location_id', type: 'string' }, { name: 'order_ts', type: 'timestamp' }, { name: 'amount', type: 'decimal(12,2)' }, { name: 'channel', type: 'string' }], updated: 'today' },
  { db: 'sales', name: 'order_items', type: 'DELTA', rows: 4120988, columns: [{ name: 'order_id', type: 'string' }, { name: 'sku', type: 'string' }, { name: 'qty', type: 'int' }, { name: 'price', type: 'decimal(12,2)' }], updated: 'today' },
  { db: 'core', name: 'locations', type: 'DELTA', rows: 60, columns: [{ name: 'location_id', type: 'string' }, { name: 'name', type: 'string' }, { name: 'city', type: 'string' }, { name: 'lat', type: 'double' }, { name: 'lon', type: 'double' }], updated: 'yesterday' },
  { db: 'core', name: 'customers', type: 'DELTA', rows: 186420, columns: [{ name: 'customer_id', type: 'string' }, { name: 'segment', type: 'string' }, { name: 'first_seen', type: 'date' }], updated: 'today' },
  { db: 'core', name: 'products', type: 'DELTA', rows: 8412, columns: [{ name: 'sku', type: 'string' }, { name: 'category', type: 'string' }, { name: 'brand', type: 'string' }], updated: '3 days ago' },
  { db: 'ops', name: 'events', type: 'DELTA', rows: 9822310, columns: [{ name: 'event_ts', type: 'timestamp' }, { name: 'type', type: 'string' }, { name: 'payload', type: 'string' }], updated: 'today' },
  { db: 'gold', name: 'daily_kpis', type: 'DELTA', rows: 27360, columns: [{ name: 'day', type: 'date' }, { name: 'location_id', type: 'string' }, { name: 'sales', type: 'double' }, { name: 'orders', type: 'bigint' }], updated: 'today' },
];

const SAMPLE_USERS: UserRow[] = [
  { id: 'u1', username: 'admin', name: 'Admin', email: 'admin@example.com', role: 'super_admin', lastLogin: 'today', active: true },
  { id: 'u2', username: 'analyst', name: 'Data Analyst', email: 'analyst@example.com', role: 'editor', lastLogin: 'yesterday', active: true },
  { id: 'u3', username: 'ops', name: 'Operations Lead', email: 'ops@example.com', role: 'editor', lastLogin: '3 days ago', active: true },
  { id: 'u4', username: 'viewer', name: 'Regional Manager', email: 'viewer@example.com', role: 'viewer', lastLogin: 'last week', active: true },
  { id: 'u5', username: 'auditor', name: 'Auditor', email: 'auditor@example.com', role: 'viewer', lastLogin: 'never', active: false },
];

/* ---- live calls ---- */
type RawDash = { id: string; name: string; description?: string; pages?: number | unknown[]; widgets?: number; look?: string; updated?: number | string; owner?: string };

/** epoch seconds (DataBridge) or text → "2 days ago" */
export function ago(v: number | string | null | undefined): string | undefined {
  if (v == null || v === '') return undefined;
  if (typeof v === 'string') return v;
  const s = Math.max(0, Date.now() / 1000 - v);
  if (s < 90) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  const d = Math.round(s / 86400);
  return d === 1 ? 'yesterday' : d < 30 ? `${d} days ago` : new Date(v * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const getDashboards = () =>
  attempt<DashboardRow[]>(async () => {
    const r = await apiGet<RawDash[] | { dashboards: RawDash[] }>('/api/dashboards');
    const list = Array.isArray(r) ? r : r.dashboards || [];
    return list.map((d) => ({ id: d.id, name: d.name, description: d.description, widgets: d.widgets, pages: Array.isArray(d.pages) ? d.pages.length : typeof d.pages === 'number' ? d.pages : undefined, look: d.look, updated: ago(d.updated), owner: d.owner }));
  }, () => SAMPLE_DASHBOARDS);

type RawDb = { name?: string; databaseName?: string } | string;
type RawTable = { name?: string; table_type?: string | null; provider?: string | null; owner?: string | null; created?: number | null };

export const getCatalog = () =>
  attempt<TableRow[]>(async () => {
    const dbs = await apiGet<RawDb[]>('/api/catalog/databases', 8000);
    const names = dbs.map((d) => (typeof d === 'string' ? d : d.name || d.databaseName || '')).filter(Boolean).slice(0, 12);
    const tables = await Promise.all(names.map(async (db) => {
      try {
        const t = await apiGet<RawTable[]>(`/api/catalog/databases/${encodeURIComponent(db)}/tables`, 8000);
        return t.map((x) => ({ db, name: x.name || '?', type: x.provider || x.table_type || undefined, rows: null, updated: ago(x.created ?? undefined) }));
      } catch {
        return [];
      }
    }));
    return tables.flat();
  }, () => SAMPLE_TABLES);

type RawUser = { id?: string | number; username: string; name?: string; email?: string; role: string; last_login?: number | null; active?: number | boolean };

export const getUsers = () =>
  attempt<UserRow[]>(async () => {
    const r = await apiGet<RawUser[] | { users: RawUser[] }>('/api/users');
    const list = Array.isArray(r) ? r : r.users || [];
    return list.map((u) => ({ id: String(u.id ?? u.username), username: u.username, name: u.name, email: u.email, role: u.role, lastLogin: ago(u.last_login) ?? 'never', active: u.active == null ? true : !!u.active }));
  }, () => SAMPLE_USERS);

export async function getMe(): Promise<Me | null> {
  try {
    const r = await apiGet<{ user?: { username: string; name?: string; role?: string } | null }>('/api/auth/me', 4000);
    return r.user ? { username: r.user.username, name: r.user.name, role: r.user.role } : null;
  } catch {
    return null;
  }
}

/** feature flags for the signed-in user ({key: on}); missing key = on, like the workspace */
export async function getFeatures(): Promise<Record<string, boolean>> {
  try {
    const r = await apiGet<{ features?: Record<string, boolean> }>('/api/features/me', 4000);
    return r.features && typeof r.features === 'object' ? r.features : {};
  } catch {
    return {};
  }
}

export { SAMPLE_TABLES };
