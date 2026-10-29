/* Select-style dropdown with listbox semantics and full keyboard support. */
import { useId, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Popover } from './Popover';

export interface Option<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  hint?: string;
  disabled?: boolean;
}

interface DropdownProps<T extends string> {
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
  label: string; // accessible name, e.g. "Region"
  className?: string;
  align?: 'start' | 'end';
  icon?: ReactNode;
  footer?: (close: () => void) => ReactNode;
}

export function Dropdown<T extends string>({ value, options, onChange, label, className = '', align = 'end', icon, footer }: DropdownProps<T>) {
  const current = options.find((o) => o.value === value) ?? options[0];
  const [active, setActive] = useState(() => Math.max(0, options.findIndex((o) => o.value === value)));
  const uid = useId();
  return (
    <Popover
      align={align}
      role="listbox"
      onOpenChange={(o) => o && setActive(Math.max(0, options.findIndex((x) => x.value === value)))}
      trigger={(p, open) => (
        <button type="button" {...p} className={`dd-btn ${open ? 'open' : ''} ${className}`} aria-label={`${label}: ${current?.label ?? ''}`}>
          {icon ?? current?.icon}
          <span className="dd-val">{current?.label}</span>
          <ChevronDown size={15} aria-hidden="true" className="dd-chev" />
        </button>
      )}
    >
      {(close) => {
        const move = (d: number) => {
          let i = active;
          for (let k = 0; k < options.length; k++) {
            i = (i + d + options.length) % options.length;
            if (!options[i].disabled) break;
          }
          goto(i);
        };
        const goto = (i: number) => {
          setActive(i);
          document.getElementById(`${uid}-opt-${i}`)?.focus();
        };
        const onKey = (e: KeyboardEvent) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
          else if (e.key === 'Home') { e.preventDefault(); goto(0); }
          else if (e.key === 'End') { e.preventDefault(); goto(options.length - 1); }
        };
        return (
          <div className="dd-list" role="listbox" aria-label={label} onKeyDown={onKey}>
            {options.map((o, i) => (
              <button
                key={o.value}
                id={`${uid}-opt-${i}`}
                type="button"
                role="option"
                aria-selected={o.value === value}
                disabled={o.disabled}
                tabIndex={i === active ? 0 : -1}
                className={`dd-opt ${o.value === value ? 'sel' : ''}`}
                onClick={() => {
                  onChange(o.value);
                  close();
                }}
              >
                {o.icon && <span className="dd-ico">{o.icon}</span>}
                <span className="dd-text">
                  <span>{o.label}</span>
                  {o.hint && <small>{o.hint}</small>}
                </span>
                {o.value === value && <Check size={15} aria-hidden="true" className="dd-check" />}
              </button>
            ))}
            {footer?.(close)}
          </div>
        );
      }}
    </Popover>
  );
}
