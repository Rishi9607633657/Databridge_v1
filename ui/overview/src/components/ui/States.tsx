import type { ReactNode } from 'react';
import { CircleAlert, Inbox } from 'lucide-react';

export function Skeleton({ h = 16, w = '100%', r = 8 }: { h?: number | string; w?: number | string; r?: number }) {
  return <span className="skel" style={{ height: h, width: w, borderRadius: r }} aria-hidden="true" />;
}

export function CardSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="skel-card" role="status" aria-label="Loading">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} h={i === 0 ? 22 : 14} w={i === 0 ? '45%' : `${90 - i * 12}%`} />
      ))}
    </div>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      <Inbox size={26} aria-hidden="true" />
      <strong>{title}</strong>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty err" role="alert">
      <CircleAlert size={26} aria-hidden="true" />
      <strong>{title}</strong>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

/** Small pill that says where numbers come from. */
export function SourceTag({ source, title }: { source: 'demo' | 'live' | 'simulated'; title?: string }) {
  const label = source === 'live' ? 'Live' : source === 'simulated' ? 'Simulated' : 'Demo data';
  return (
    <span className={`src-tag ${source}`} title={title}>
      <span className="dot" aria-hidden="true" />
      {label}
    </span>
  );
}
