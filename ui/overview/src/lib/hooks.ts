import { useEffect, useState, type RefObject } from 'react';
import { useApp } from '../app/state';

export function useMedia(query: string): boolean {
  const get = () => (typeof matchMedia === 'function' ? matchMedia(query).matches : false);
  const [m, setM] = useState(get);
  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const mq = matchMedia(query);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return m;
}

/** true while the element is on screen (3D scenes stop rendering when it is not) */
export function useInView(ref: RefObject<Element>, margin = '120px'): boolean {
  const [v, setV] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver !== 'function') return;
    const io = new IntersectionObserver(([e]) => setV(e.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return v;
}

export function usePageVisible(): boolean {
  const [v, setV] = useState(() => (typeof document === 'undefined' ? true : !document.hidden));
  useEffect(() => {
    const on = () => setV(!document.hidden);
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  return v;
}

/** concrete colours for SVG charts (so they work in both themes without relying on CSS variables in attributes) */
export function useChartTheme() {
  const { theme } = useApp();
  return theme === 'dark'
    ? { grid: '#22304A', axis: '#8A9BB5', text: '#E6EAF2', muted: '#94A3B8', surface: '#111A2C', primary: '#5B8CFF', prev: '#64748B', tipBg: '#0B1220', tipText: '#F1F5F9', track: '#1D2A42' }
    : { grid: '#E8EDF4', axis: '#7A8699', text: '#101828', muted: '#667085', surface: '#FFFFFF', primary: '#2F6BFF', prev: '#A7B2C3', tipBg: '#0F1B3D', tipText: '#FFFFFF', track: '#EEF2F7' };
}
