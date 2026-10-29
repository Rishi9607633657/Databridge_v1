/* Change indicator: arrow + value + colour, plus words for screen readers (colour is never the only cue). */
import { formatDelta, formatPoints } from '../../lib/format';

interface DeltaProps {
  value: number | null | undefined;
  kind?: 'ratio' | 'points';
  good?: boolean | null; // override: is this change good?
  size?: 'sm' | 'md';
}

export function Delta({ value, kind = 'ratio', good, size = 'md' }: DeltaProps) {
  if (value == null || !Number.isFinite(value)) return <span className="delta neutral">—</span>;
  const upDir = value >= 0;
  const isGood = good ?? upDir;
  const flat = Math.abs(value) < 0.0005;
  const text = kind === 'points' ? formatPoints(value) : formatDelta(value);
  return (
    <span className={`delta ${flat ? 'neutral' : isGood ? 'pos' : 'neg'} ${size}`}>
      <span aria-hidden="true">{flat ? '■' : upDir ? '▲' : '▼'}</span>
      <span className="sr-only">{flat ? 'unchanged' : upDir ? 'up' : 'down'}</span> {text}
    </span>
  );
}
