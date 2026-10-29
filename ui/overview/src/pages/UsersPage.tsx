/* Users: real DataBridge users for admins inside DataBridge; sample people otherwise. */
import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Info } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { CardSkeleton, EmptyState, SourceTag } from '../components/ui/States';
import { getUsers, type Sourced, type UserRow } from '../services/platformService';

const ROLE_LABEL: Record<string, string> = { super_admin: 'Super admin', admin: 'Admin', editor: 'Editor', viewer: 'Viewer' };

export default function UsersPage() {
  const [res, setRes] = useState<Sourced<UserRow[]> | null>(null);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('all');
  useEffect(() => {
    getUsers().then(setRes);
  }, []);
  const live = res?.source === 'live';
  const roles = useMemo(() => [...new Set((res?.data ?? []).map((u) => u.role))], [res]);
  const list = (res?.data ?? []).filter((u) => (role === 'all' || u.role === role) && `${u.name ?? ''} ${u.username} ${u.email ?? ''}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="Users" sub="People who can sign in and what they can do." actions={res && <SourceTag source={live ? 'live' : 'demo'} title={res.note} />} />
      {res && !live && (
        <p className="notice">
          <Info size={18} aria-hidden="true" />
          <span>Showing sample people ({res.note}). Admins see real users here when this page runs inside DataBridge.</span>
        </p>
      )}
      <Card title="People" sub={res ? `${list.length} of ${res.data.length}` : undefined} actions={live ? <a className="btn sm" href="/#/admin">Manage in Admin <ExternalLink size={14} aria-hidden="true" /></a> : undefined}>
        <div className="toolbar">
          <input className="inp" type="search" placeholder="Search name, user name or email" aria-label="Search users" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="chips" role="group" aria-label="Role">
            {['all', ...roles].map((r) => (
              <button key={r} type="button" className={role === r ? 'on' : ''} aria-pressed={role === r} onClick={() => setRole(r)}>
                {r === 'all' ? 'All roles' : ROLE_LABEL[r] || r}
              </button>
            ))}
          </div>
        </div>
        {!res ? (
          <CardSkeleton lines={5} />
        ) : !list.length ? (
          <EmptyState title="No people match" />
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th scope="col">Person</th>
                  <th scope="col">User name</th>
                  <th scope="col">Role</th>
                  <th scope="col">Last sign-in</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {list.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <span className="cell-main">
                        <span className="avatar sm" aria-hidden="true">{(u.name || u.username).charAt(0).toUpperCase()}</span>
                        <span>
                          <strong>{u.name || u.username}</strong>
                          {u.email && <small>{u.email}</small>}
                        </span>
                      </span>
                    </td>
                    <td>{u.username}</td>
                    <td><span className={`badge ${u.role.includes('admin') ? 'info' : ''}`}>{ROLE_LABEL[u.role] || u.role}</span></td>
                    <td>{u.lastLogin || '—'}</td>
                    <td><span className={`badge ${u.active === false ? 'warn' : 'ok'}`}>{u.active === false ? 'Disabled' : 'Active'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
