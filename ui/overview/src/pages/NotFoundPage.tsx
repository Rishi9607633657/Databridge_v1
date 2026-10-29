import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="nf">
      <h1 className="page-head-title">This page does not exist</h1>
      <p className="muted">The link may be old. Everything is reachable from the menu on the left.</p>
      <Link to="/" className="btn primary">Go to Overview</Link>
    </div>
  );
}
