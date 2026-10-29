/* Integrations: demo catalogue with connect / disconnect (a flag in this browser; no credentials involved). */
import { Info } from 'lucide-react';
import { useApp } from '../app/state';
import { PageHeader } from '../components/ui/PageHeader';
import { SourceTag } from '../components/ui/States';
import { iconOf } from '../components/ui/icons';
import { INTEGRATIONS, type IntegrationDef } from '../data/demo/integrations';
import { servedByDataBridge } from '../services/apiClient';

const GROUPS: IntegrationDef['group'][] = ['Databases', 'Streaming', 'Storage', 'Business apps', 'BI & sharing', 'Messaging'];

export default function IntegrationsPage() {
  const { connected, setConnected } = useApp();
  const n = Object.values(connected).filter(Boolean).length;
  return (
    <>
      <PageHeader title="Integrations" sub={`${n} of ${INTEGRATIONS.length} connected`} actions={<SourceTag source="demo" />} />
      <p className="notice">
        <Info size={18} aria-hidden="true" />
        <span>
          Demo catalogue: connecting only flips a switch in this browser and no credentials are asked for or stored.{' '}
          {servedByDataBridge() ? <a href="/#/datahub">Set up real connections in Data Hub</a> : 'Real connections are set up in DataBridge → Data Hub.'}
        </span>
      </p>
      {GROUPS.map((g) => (
        <section key={g} className="int-group" aria-labelledby={`g-${g}`}>
          <h2 id={`g-${g}`} className="sec-h">{g}</h2>
          <div className="tiles">
            {INTEGRATIONS.filter((i) => i.group === g).map((i) => {
              const Icon = iconOf(i.icon);
              const on = !!connected[i.id];
              return (
                <article key={i.id} className="tile">
                  <div className="tile-head">
                    <span className="chip-ico" style={{ ['--c' as string]: on ? '#12B76A' : '#94A3B8' }} aria-hidden="true"><Icon size={17} /></span>
                    <h3>{i.name}</h3>
                  </div>
                  <p>{i.description}</p>
                  <div className="tile-foot">
                    <span className={`badge ${on ? 'ok' : ''}`}>{on ? 'Connected' : 'Not connected'}</span>
                    <button type="button" className={`btn sm ${on ? '' : 'primary'}`} onClick={() => setConnected(i.id, !on)} aria-pressed={on}>
                      {on ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
