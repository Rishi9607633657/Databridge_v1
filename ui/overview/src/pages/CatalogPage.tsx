/* Data Catalog: real DataBridge schemas and tables when available, sample datasets otherwise. */
import { Fragment, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink, Info, Table2 } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { CardSkeleton, EmptyState, SourceTag } from '../components/ui/States';
import { getCatalog, type Sourced, type TableRow } from '../services/platformService';

export default function CatalogPage() {
  const [res, setRes] = useState<Sourced<TableRow[]> | null>(null);
  const [q, setQ] = useState('');
  const [db, setDb] = useState('all');
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    getCatalog().then(setRes);
  }, []);
  const live = res?.source === 'live';
  const dbs = useMemo(() => [...new Set((res?.data ?? []).map((t) => t.db))], [res]);
  const list = (res?.data ?? []).filter((t) => (db === 'all' || t.db === db) && `${t.db}.${t.name}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="Data Catalog" sub="Schemas and tables available to dashboards, notebooks and SQL." actions={res && <SourceTag source={live ? 'live' : 'demo'} title={res.note} />} />
      {res && !live && (
        <p className="notice">
          <Info size={18} aria-hidden="true" />
          <span>Showing sample datasets ({res.note}). Inside DataBridge this lists your real schemas and tables.</span>
        </p>
      )}
      <Card title="Tables" sub={res ? `${list.length} of ${res.data.length}` : undefined} actions={live ? <a className="btn sm" href="/#/catalog">Open full catalog <ExternalLink size={14} aria-hidden="true" /></a> : undefined}>
        <div className="toolbar">
          <input className="inp" type="search" placeholder="Search tables" aria-label="Search tables" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="chips" role="group" aria-label="Schema">
            {['all', ...dbs].map((d) => (
              <button key={d} type="button" className={db === d ? 'on' : ''} aria-pressed={db === d} onClick={() => setDb(d)}>
                {d === 'all' ? 'All schemas' : d}
              </button>
            ))}
          </div>
        </div>
        {!res ? (
          <CardSkeleton lines={6} />
        ) : !list.length ? (
          <EmptyState title="No tables match" />
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th scope="col">Table</th>
                  <th scope="col">Schema</th>
                  <th scope="col">Format</th>
                  <th scope="col" className="num">Rows</th>
                  <th scope="col">Updated</th>
                </tr>
              </thead>
              <tbody>
                {list.map((t) => {
                  const id = `${t.db}.${t.name}`;
                  const isOpen = open === id;
                  return (
                    <Fragment key={id}>
                      <tr>
                        <td>
                          <button type="button" className="cell-main link-plain" aria-expanded={t.columns ? isOpen : undefined} onClick={() => t.columns && setOpen(isOpen ? null : id)}>
                            {t.columns ? isOpen ? <ChevronDown size={15} aria-hidden="true" /> : <ChevronRight size={15} aria-hidden="true" /> : <Table2 size={15} aria-hidden="true" />}
                            <strong>{t.name}</strong>
                          </button>
                        </td>
                        <td>{t.db}</td>
                        <td>{t.type || '—'}</td>
                        <td className="num">{t.rows != null ? t.rows.toLocaleString('en-IN') : '—'}</td>
                        <td>{t.updated || '—'}</td>
                      </tr>
                      {isOpen && t.columns && (
                        <tr>
                          <td colSpan={5}>
                            <ul className="cols">
                              {t.columns.map((c) => (
                                <li key={c.name}>
                                  <code>{c.name}</code> <span className="muted">{c.type}</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
