/* Drill-down for one entity (store, facility, branch, plant, campus…): opened from the 3D buildings,
   the Top list, search or the Locations table. */
import { useNavigate } from 'react-router-dom';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { useApp } from '../../app/state';
import { useData } from '../../app/data';
import { Modal } from '../ui/Modal';
import { Delta } from '../ui/Delta';
import { EntityThumb } from '../misc/EntityThumb';
import { Flag } from '../misc/Flag';
import { countryName, regionHue, regionLabel } from '../../domains/places';
import { hue } from '../../lib/palette';
import { formatValue } from '../../lib/format';
import { fmtDay } from '../../lib/dates';
import { useChartTheme } from '../../lib/hooks';

export function EntityDrawer() {
  const { selectedEntityId, setSelectedEntityId, domain, fo, resolved, setRegion } = useApp();
  const { overview } = useData();
  const nav = useNavigate();
  const ct = useChartTheme();
  const x = overview?.allEntities.find((e) => e.entity.id === selectedEntityId);
  const close = () => setSelectedEntityId(null);
  if (!x || !overview) return <Modal open={false} onClose={close} title="">{null}</Modal>;
  const e = x.entity;
  const h = hue(regionHue(e.region));
  const P = domain.series.primary;
  const live = !!domain.live;
  const has = (k: 'secondary' | 'people') => !domain.metrics || domain.metrics.includes(k);
  const status = live
    ? x.openToday ? 'Reporting' : e.status === 'inactive' ? 'No recent data' : 'No data on the last day'
    : !x.openToday ? (e.status === 'inactive' ? 'Closed' : 'Closed today') : e.status === 'maintenance' ? 'Maintenance' : 'Open';
  const chart = x.daily.map((v, i) => ({ day: resolved.from + i, v }));
  const cats = domain.categories.items
    .map((c, i) => ({ c, v: x.catValues ? x.catValues[i] ?? 0 : x.value * (e.categoryMix[i] ?? 0) }))
    .filter((c) => c.v > 0 || !live)
    .sort((a, b) => b.v - a.v);
  const cmax = Math.max(...cats.map((c) => c.v), 1);
  return (
    <Modal
      open
      variant="drawer"
      onClose={close}
      title={
        <span className="ed-title">
          <EntityThumb kind={domain.entity.building} color={h.base} size={44} />
          <span>{e.name}</span>
        </span>
      }
      sub={
        <span className="ed-sub">
          {e.country && <Flag code={e.country} size={18} />} {domain.entity.singular} · {e.city.name}{e.country ? `, ${countryName(e.country)}` : ''} · <span className={`badge ${x.openToday ? 'ok' : 'warn'}`}>{status}</span>
        </span>
      }
      footer={
        <>
          <button type="button" className="btn" onClick={() => { setRegion(e.region); close(); }}>Show {regionLabel(e.region)} only</button>
          <button type="button" className="btn primary" onClick={() => { close(); nav(`/analytics?tab=locations&q=${encodeURIComponent(e.name)}`); }}>Open in Analytics</button>
        </>
      }
    >
      <dl className="ed-stats">
        <div>
          <dt>{P.label}</dt>
          <dd><strong>{formatValue(x.value, P.format, fo)}</strong> <Delta value={x.growth} size="sm" /></dd>
        </div>
        {has('secondary') && (
          <div>
            <dt>{domain.series.secondary.label}</dt>
            <dd><strong>{formatValue(x.secondary, domain.series.secondary.format, fo)}</strong></dd>
          </div>
        )}
        {has('people') && (
          <div>
            <dt>{domain.series.people.label}</dt>
            <dd><strong>{formatValue(x.people, domain.series.people.format, fo)}</strong></dd>
          </div>
        )}
        <div>
          <dt>Rank</dt>
          <dd><strong>#{x.rank}</strong> <span className="muted">of {overview.allEntities.length} · {(x.share * 100).toFixed(1)}% of {P.noun}</span></dd>
        </div>
      </dl>
      <h3 className="ed-h">{P.label} per day · {resolved.text}</h3>
      <div className="ed-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chart} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="edg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={h.base} stopOpacity={0.3} />
                <stop offset="1" stopColor={h.base} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" hide />
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <div className="chart-tip" style={{ background: ct.tipBg, color: ct.tipText }}>
                    <span className="tip-date">{fmtDay(Number(payload[0].payload.day), { weekday: true })}</span>
                    <strong>{formatValue(Number(payload[0].value), P.format, fo)}</strong>
                  </div>
                ) : null
              }
            />
            <Area type="monotone" dataKey="v" stroke={h.base} strokeWidth={2} fill="url(#edg)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {cats.length > 0 && <h3 className="ed-h">{domain.categories.title}</h3>}
      <ul className="cat-list compact">
        {cats.map(({ c, v }) => {
          const ch = hue(c.hue);
          return (
            <li key={c.id} className="cat-row">
              <span className="cat-name">{c.label}</span>
              <span className="cat-bar" aria-hidden="true"><span style={{ width: `${(v / cmax) * 100}%`, background: `linear-gradient(90deg, ${ch.from}, ${ch.to})` }} /></span>
              <span className="cat-val">{formatValue(v, P.format, fo)}</span>
            </li>
          );
        })}
      </ul>
      <p className="card-note">
        {live ? `From ${domain.live?.table} · first data ${fmtDay(e.opened, { year: true })}` : `Demo data · opened ${e.opened < overview.today - 400 ? 'over a year ago' : fmtDay(e.opened, { year: true })}`}
      </p>
    </Modal>
  );
}
