/* Tabs / toggle group. Arrow keys move between options (roving tabindex). */
import { useRef, type KeyboardEvent, type ReactNode } from 'react';

interface SegProps<T extends string> {
  value: T;
  options: { value: T; label: ReactNode; title?: string }[];
  onChange: (v: T) => void;
  label: string;
  variant?: 'pill' | 'tabs';
  className?: string;
}

export function Segmented<T extends string>({ value, options, onChange, label, variant = 'tabs', className = '' }: SegProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const onKey = (e: KeyboardEvent) => {
    const i = options.findIndex((o) => o.value === value);
    let n = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % options.length;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + options.length) % options.length;
    if (n < 0) return;
    e.preventDefault();
    onChange(options[n].value);
    requestAnimationFrame(() => ref.current?.querySelectorAll<HTMLButtonElement>('[role=tab]')[n]?.focus());
  };
  return (
    <div className={`seg seg-${variant} ${className}`} role="tablist" aria-label={label} ref={ref} onKeyDown={onKey}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={o.value === value}
          tabIndex={o.value === value ? 0 : -1}
          title={o.title}
          className={o.value === value ? 'on' : ''}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
