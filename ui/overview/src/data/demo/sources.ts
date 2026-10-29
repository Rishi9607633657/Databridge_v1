/* DEMO data sources for the Data Sources page (names are generic, statuses are simulated). */
import type { DomainConfig } from '../../domains/types';
import { rngFrom } from '../../lib/random';

export type SourceStatus = 'healthy' | 'delayed' | 'failed' | 'syncing';

export interface SourceRow {
  id: string;
  name: string;
  system: string;
  kind: 'Database' | 'Stream' | 'API' | 'Files' | 'SaaS';
  schedule: string;
  records24h: number;
  lastSync: number; // ms epoch
  status: SourceStatus;
  note?: string;
}

const CORE: Record<DomainConfig['id'], string> = {
  retail: 'POS & e-commerce',
  healthcare: 'Hospital information system',
  finance: 'Core banking',
  manufacturing: 'MES & ERP',
  education: 'Student information system',
  custom: 'Your application',
};

export function demoSources(domain: DomainConfig): SourceRow[] {
  const rng = rngFrom(`sources:${domain.id}`);
  const now = Date.now();
  const base: Omit<SourceRow, 'records24h' | 'lastSync' | 'status'>[] = [
    { id: 'core', name: `${CORE[domain.id]} database`, system: 'PostgreSQL · CDC', kind: 'Database', schedule: 'Streaming (CDC)' },
    { id: 'events', name: `${domain.series.secondary.label} events`, system: 'Kafka topic', kind: 'Stream', schedule: 'Streaming' },
    { id: 'erp', name: 'Finance & inventory', system: 'ERP · OData', kind: 'API', schedule: 'Every 15 min' },
    { id: 'crm', name: `${domain.series.people.label} CRM`, system: 'CRM · REST API', kind: 'SaaS', schedule: 'Hourly' },
    { id: 'lake', name: 'Lakehouse (bronze → gold)', system: 'ADLS Gen2 · Delta', kind: 'Files', schedule: 'Every 30 min' },
    { id: 'partner', name: 'Partner file drop', system: 'SFTP · CSV', kind: 'Files', schedule: 'Daily 02:00' },
    { id: 'web', name: 'Web & app analytics', system: 'Events API', kind: 'API', schedule: 'Hourly' },
    { id: 'hr', name: 'Staff rosters', system: 'HR system · REST', kind: 'SaaS', schedule: 'Daily 06:00' },
  ];
  return base.map((b, i) => {
    const status: SourceStatus = i === 5 ? 'delayed' : i === 7 ? 'failed' : 'healthy';
    const minutesAgo = status === 'failed' ? 380 + rng() * 200 : status === 'delayed' ? 160 + rng() * 60 : b.schedule.startsWith('Stream') ? rng() * 2 : 3 + rng() * 40;
    return {
      ...b,
      status,
      lastSync: now - minutesAgo * 60000,
      records24h: Math.round((b.kind === 'Stream' ? 2.4e6 : b.kind === 'Database' ? 6.8e5 : 4.2e4) * (0.6 + rng())),
      note: status === 'failed' ? 'Authentication expired: re-enter the credentials in Data Hub' : status === 'delayed' ? 'File arrived late from the partner' : undefined,
    };
  });
}
