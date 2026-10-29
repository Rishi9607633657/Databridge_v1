/* Date range: presets or a custom range. Changing it recomputes every number on the page. */
import { useState } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { useApp } from '../../app/state';
import { Popover } from '../ui/Popover';
import { PRESETS, isoOf, type PresetId } from '../../lib/dates';

export function DateRangePicker() {
  const { range, setRange, resolved, minDay, today, domain } = useApp();
  const coarse = domain.live && domain.live.grain !== 'day';
  const presets = PRESETS.filter((x) => x.id !== 'custom' && !(coarse && ['today', '7d', '28d', '30d'].includes(x.id)));
  const [from, setFrom] = useState(range.from || isoOf(resolved.from));
  const [to, setTo] = useState(range.to || isoOf(resolved.to));
  return (
    <Popover
      align="end"
      label="Date range"
      onOpenChange={(o) => {
        if (o) {
          setFrom(isoOf(resolved.from));
          setTo(isoOf(resolved.to));
        }
      }}
      trigger={(p) => (
        <button type="button" {...p} className="date-btn" aria-label={`Date range: ${resolved.text} (${resolved.label}). Change`}>
          <CalendarDays size={20} aria-hidden="true" />
          <span className="date-text">
            <strong>{resolved.text}</strong>
            <small>{resolved.label}</small>
          </span>
          <ChevronDown size={16} aria-hidden="true" />
        </button>
      )}
    >
      {(close) => (
        <div className="date-pop">
          <div className="date-presets" role="radiogroup" aria-label="Presets">
            {presets.map((x) => (
              <button
                key={x.id}
                type="button"
                role="radio"
                aria-checked={range.preset === x.id}
                className={range.preset === x.id ? 'on' : ''}
                onClick={() => {
                  setRange({ preset: x.id as PresetId });
                  close();
                }}
              >
                {x.label}
              </button>
            ))}
          </div>
          <form
            className="date-custom"
            onSubmit={(e) => {
              e.preventDefault();
              if (from && to) {
                setRange({ preset: 'custom', from, to });
                close();
              }
            }}
          >
            <p className="side-h">Custom range</p>
            <label>
              <span>From</span>
              <input type="date" value={from} min={isoOf(minDay)} max={isoOf(today)} onChange={(e) => setFrom(e.target.value)} required />
            </label>
            <label>
              <span>To</span>
              <input type="date" value={to} min={isoOf(minDay)} max={isoOf(today)} onChange={(e) => setTo(e.target.value)} required />
            </label>
            <button type="submit" className="btn primary sm">Apply</button>
            <small className="muted">{domain.live ? `Your data covers ${isoOf(minDay)} to ${isoOf(today)}.` : `Demo data covers ${isoOf(minDay)} to today.`}</small>
          </form>
        </div>
      )}
    </Popover>
  );
}
