/* Board settings: which column of the table plays which role, and the words shown on the cards.
   Saved on the server for everyone who opens the board; the numbers reload right after. */
import { useMemo, useState } from 'react';
import { useApp } from '../app/state';
import { apiSend, ApiError } from '../services/apiClient';

type Kind = 'date' | 'place' | 'num' | 'any' | 'cat';
const ROLES: { key: string; label: string; hint: string; kind: Kind; required?: boolean }[] = [
  { key: 'date', label: 'Date', hint: 'The day of each row: trends, comparisons and date filters use it.', kind: 'date', required: true },
  { key: 'site', label: 'Location', hint: 'Store, outlet, branch, plant… one building each on the globe and in the rankings.', kind: 'any' },
  { key: 'city', label: 'City', hint: 'Places the locations on the globe.', kind: 'place' },
  { key: 'state', label: 'State / province', hint: 'Used for the regions when everything is in one country.', kind: 'place' },
  { key: 'country', label: 'Country', hint: '', kind: 'place' },
  { key: 'lat', label: 'Latitude', hint: 'Exact positions (optional; city is enough).', kind: 'num' },
  { key: 'lon', label: 'Longitude', hint: '', kind: 'num' },
  { key: 'measure', label: 'Main measure', hint: 'Added up: sales, revenue, amount…', kind: 'num' },
  { key: 'orders', label: 'Orders / count', hint: 'A count measure (added up) or an order id (distinct ids are counted).', kind: 'any' },
  { key: 'customers', label: 'Customers', hint: 'A people measure, or a customer id (distinct per day).', kind: 'any' },
  { key: 'rate', label: 'Rate', hint: 'Averaged: margin %, occupancy, conversion…', kind: 'num' },
  { key: 'category', label: 'Category', hint: 'The category card splits the main measure by it.', kind: 'cat' },
  { key: 'segment', label: 'Segment', hint: 'The distribution card: customer type, channel…', kind: 'cat' },
];
const WORDS: { key: string; label: string }[] = [
  { key: 'entity', label: 'One location is a' },
  { key: 'entities', label: 'Several are' },
  { key: 'primary', label: 'Main measure name' },
  { key: 'secondary', label: 'Count name' },
  { key: 'people', label: 'People name' },
];

export function BoardSettings() {
  const { board, refreshBoard, me } = useApp();
  const p = board?.payload;
  const readOnly = !!me && me.role === 'viewer';
  const [map, setMap] = useState<Record<string, string>>(() => Object.fromEntries(Object.entries(p?.board.map ?? {}).map(([k, v]) => [k, v == null ? '' : String(v)])));
  const [words, setWords] = useState<Record<string, string>>(() => Object.fromEntries(WORDS.map((w) => [w.key, String((p?.board.labels as unknown as Record<string, unknown>)?.[w.key] ?? '')])));
  const [name, setName] = useState(p?.name ?? '');
  const [state, setState] = useState<{ busy: boolean; msg: string | null; err: boolean }>({ busy: false, msg: null, err: false });
  const cols = useMemo(() => p?.columns ?? [], [p]);
  if (!p) return null;
  const fits = (kind: Kind, c: { kind: string }) =>
    kind === 'any' ? true : kind === 'date' ? c.kind === 'date' : kind === 'num' ? c.kind === 'num' || c.kind === 'id' : kind === 'cat' ? c.kind === 'cat' || c.kind === 'text' : c.kind === 'cat' || c.kind === 'text';
  const save = async () => {
    setState({ busy: true, msg: null, err: false });
    try {
      const body = { name, map: Object.fromEntries(ROLES.map((r) => [r.key, map[r.key] || null])), labels: Object.fromEntries(WORDS.map((w) => [w.key, words[w.key] || null])) };
      await apiSend('PUT', `/api/dashboards/${encodeURIComponent(p.id)}/board`, body);
      setState({ busy: false, msg: 'Saved. Reloading the numbers…', err: false });
      refreshBoard();
    } catch (e) {
      setState({ busy: false, msg: e instanceof ApiError ? e.message : 'Could not save', err: true });
    }
  };
  return (
    <section className="settings-sec board-set" aria-labelledby="s-board">
      <div>
        <h2 id="s-board">Board data</h2>
        <p>
          This board reads <code>{p.board.table}</code>. Pick which column plays which role; the words come from the column names unless you change them. Saved for
          everyone who opens the board.
        </p>
      </div>
      <form
        className="set-rows"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <label className="fld">
          <span>Board name</span>
          <input className="inp" value={name} onChange={(e) => setName(e.target.value)} disabled={readOnly} maxLength={80} />
        </label>
        <div className="role-grid">
          {ROLES.map((r) => (
            <label key={r.key} className="fld" title={r.hint}>
              <span>
                {r.label}
                {r.required ? ' *' : ''}
              </span>
              <select className="inp" value={map[r.key] ?? ''} onChange={(e) => setMap({ ...map, [r.key]: e.target.value })} disabled={readOnly} required={r.required}>
                {!r.required && <option value="">— none —</option>}
                {cols.filter((c) => fits(r.kind, c) || c.name === map[r.key]).map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              {r.hint && <small>{r.hint}</small>}
            </label>
          ))}
        </div>
        <div className="role-grid words">
          {WORDS.map((w) => (
            <label key={w.key} className="fld">
              <span>{w.label}</span>
              <input className="inp" value={words[w.key] ?? ''} onChange={(e) => setWords({ ...words, [w.key]: e.target.value })} disabled={readOnly} maxLength={60} />
            </label>
          ))}
        </div>
        {!readOnly && (
          <div className="set-actions">
            <button type="submit" className="btn primary" disabled={state.busy}>
              {state.busy ? 'Saving…' : 'Save board'}
            </button>
            {state.msg && <span className={state.err ? 'err-text' : 'muted small'} role="status">{state.msg}</span>}
          </div>
        )}
      </form>
    </section>
  );
}
