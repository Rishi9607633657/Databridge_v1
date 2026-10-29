import type { ReactNode } from 'react';

interface CardProps {
  title?: ReactNode;
  sub?: ReactNode;
  actions?: ReactNode;
  className?: string;
  bodyClass?: string;
  children?: ReactNode;
  id?: string;
  labelledBy?: string;
}

/** White surface with a title row. Sections are labelled by their title for screen readers. */
export function Card({ title, sub, actions, className = '', bodyClass = '', children, id }: CardProps) {
  const hid = id ? `${id}-title` : undefined;
  return (
    <section className={`card ${className}`} aria-labelledby={hid} id={id}>
      {(title || actions) && (
        <header className="card-head">
          <div className="card-titles">
            {title && <h2 className="card-title" id={hid}>{title}</h2>}
            {sub && <p className="card-sub">{sub}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </header>
      )}
      <div className={`card-body ${bodyClass}`}>{children}</div>
    </section>
  );
}

export function LinkButton({ children, onClick, label }: { children: ReactNode; onClick: () => void; label?: string }) {
  return (
    <button type="button" className="link-btn" onClick={onClick} aria-label={label}>
      {children}
    </button>
  );
}
