/* Anchored panel that closes on outside click / Escape and returns focus to its trigger. */
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';

interface TriggerProps {
  ref: (el: HTMLButtonElement | null) => void;
  onClick: () => void;
  'aria-expanded': boolean;
  'aria-controls': string;
  'aria-haspopup': 'dialog' | 'listbox' | 'menu';
}

interface PopoverProps {
  trigger: (p: TriggerProps, open: boolean) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: 'start' | 'end';
  role?: 'dialog' | 'listbox' | 'menu';
  className?: string;
  label?: string;
  onOpenChange?: (open: boolean) => void;
}

export function Popover({ trigger, children, align = 'start', role = 'dialog', className = '', label, onOpenChange }: PopoverProps) {
  const [open, setOpenRaw] = useState(false);
  const id = useId();
  const btn = useRef<HTMLButtonElement | null>(null);
  const panel = useRef<HTMLDivElement | null>(null);
  const wrap = useRef<HTMLDivElement | null>(null);
  const setOpen = useCallback(
    (v: boolean) => {
      setOpenRaw(v);
      onOpenChange?.(v);
    },
    [onOpenChange],
  );
  const close = useCallback(() => {
    setOpen(false);
    btn.current?.focus();
  }, [setOpen]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    const f = panel.current?.querySelector<HTMLElement>('[data-autofocus], [aria-selected="true"], button, input, [tabindex="0"]');
    f?.focus();
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close, setOpen]);

  return (
    <div className={`pop-wrap ${className}`} ref={wrap}>
      {trigger({ ref: (el) => (btn.current = el), onClick: () => setOpen(!open), 'aria-expanded': open, 'aria-controls': id, 'aria-haspopup': role }, open)}
      {open && (
        <div className={`pop pop-${align}`} id={id} ref={panel} role={role === 'dialog' ? 'dialog' : undefined} aria-label={label}>
          {children(close)}
        </div>
      )}
    </div>
  );
}
