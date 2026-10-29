/* Reports: CSV downloads built from the current numbers (domain, dates and region apply), preview, and a
   schedule switch that is stored in this browser only (no emails are sent in the demo). */
import { useState } from 'react';
import { Download, Eye, Info } from 'lucide-react';
import { useApp } from '../app/state';
import { useData } from '../app/data';
import { PageHeader } from '../components/ui/PageHeader';
import { Modal } from '../components/ui/Modal';
import { CardSkeleton, SourceTag } from '../components/ui/States';
import { REPORTS, type ReportDef } from './reportDefs';
import { downloadCsv } from '../lib/csv';
import { isoOf } from '../lib/dates';
import { load, save } from '../lib/storage';

export default function ReportsPage() {
  const { domain, resolved } = useApp();
  const { overview } = useData();
  const [preview, setPreview] = useState<ReportDef | null>(null);
  const [sched, setSched] = useState<Record<string, boolean>>(() => load<Record<string, boolean>>('dbx.schedules', {}));
  const toggle = (id: string) => {
    const n = { ...sched, [id]: !sched[id] };
    setSched(n);
    save('dbx.schedules', n);
  };
  const file = (r: ReportDef) => `${domain.id}-${r.id}-${isoOf(resolved.from)}_${isoOf(resolved.to)}`;
  const rows = preview && overview ? preview.rows(overview, domain) : [];
  return (
    <>
      <PageHeader title="Reports" sub={`Exports for ${domain.label} · ${resolved.text}. The current region filter applies.`} actions={<SourceTag source={domain.live ? 'live' : 'demo'} />} />
      <p className="notice">
        <Info size={18} aria-hidden="true" />
        <span>Downloads are real CSV files built from the numbers on screen. Scheduling is saved in this browser only; the demo does not send emails.</span>
      </p>
      {!overview ? (
        <CardSkeleton lines={6} />
      ) : (
        <div className="tiles">
          {REPORTS.map((r) => (
            <article key={r.id} className="tile">
              <div className="tile-head">
                <h3>{r.name}</h3>
                <span className="badge info">{r.cadence}</span>
              </div>
              <p>{r.description}</p>
              <p className="muted small">{r.rows(overview, domain).length - 1} rows</p>
              <div className="tile-foot">
                <label className="chk">
                  <input type="checkbox" checked={!!sched[r.id]} onChange={() => toggle(r.id)} />
                  <span>Schedule {r.cadence.toLowerCase()}</span>
                </label>
                <span className="page-actions">
                  <button type="button" className="btn sm" onClick={() => setPreview(r)}>
                    <Eye size={14} aria-hidden="true" /> Preview
                  </button>
                  <button type="button" className="btn sm primary" onClick={() => downloadCsv(file(r), r.rows(overview, domain))}>
                    <Download size={14} aria-hidden="true" /> CSV
                  </button>
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title={preview?.name ?? ''}
        sub={`First rows · ${resolved.text}`}
        wide
        footer={preview && overview ? <button type="button" className="btn primary" onClick={() => downloadCsv(file(preview), preview.rows(overview, domain))}><Download size={15} aria-hidden="true" /> Download CSV</button> : undefined}
      >
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>{rows[0]?.map((h, i) => <th key={i} scope="col">{String(h)}</th>)}</tr>
            </thead>
            <tbody>
              {rows.slice(1, 13).map((r, i) => (
                <tr key={i}>{r.map((c, j) => <td key={j} className={typeof c === 'number' ? 'num' : ''}>{c == null ? '—' : typeof c === 'number' ? c.toLocaleString('en-IN') : c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </>
  );
}
