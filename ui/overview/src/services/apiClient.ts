/* Small client for the DataBridge API (same origin, signed-in cookie). Every call has a timeout and
   reports failures to the caller, which then falls back to demo data and says so in the UI.
   No credentials or API keys live in this browser code. */

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const BASE = (import.meta.env.VITE_DATABRIDGE_API as string | undefined)?.replace(/\/$/, '') || '';

export async function apiGet<T>(path: string, timeoutMs = 6000): Promise<T> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const r = await fetch(`${BASE}${path}`, { credentials: 'same-origin', signal: ctl.signal, headers: { Accept: 'application/json' } });
    if (!r.ok) throw new ApiError(r.status, r.status === 401 ? 'Sign in to DataBridge to see live data' : r.status === 403 ? 'Your role cannot see this' : `Request failed (${r.status})`);
    const type = r.headers.get('content-type') || '';
    if (!type.includes('json')) throw new ApiError(0, 'Not a DataBridge API response');
    return (await r.json()) as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(0, (e as Error)?.name === 'AbortError' ? 'DataBridge did not answer in time' : 'DataBridge API not reachable');
  } finally {
    clearTimeout(t);
  }
}

/** true when this page is served by DataBridge (so live endpoints can exist) */
export const servedByDataBridge = () => typeof location !== 'undefined' && /^https?:$/.test(location.protocol) && location.pathname.includes('/static/overview');

/** PUT / POST JSON to the DataBridge API (same origin, signed-in cookie). */
export async function apiSend<T>(method: 'PUT' | 'POST', path: string, body: unknown, timeoutMs = 60000): Promise<T> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const r = await fetch(`${BASE}${path}`, { method, credentials: 'same-origin', signal: ctl.signal, headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) });
    const data = await r.json().catch(() => null);
    if (!r.ok) throw new ApiError(r.status, (data && (data as { detail?: string }).detail) || `Request failed (${r.status})`);
    return data as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(0, (e as Error)?.name === 'AbortError' ? 'DataBridge did not answer in time' : 'DataBridge API not reachable');
  } finally {
    clearTimeout(t);
  }
}
