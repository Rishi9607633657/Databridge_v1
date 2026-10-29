/* DEMO integration catalogue for the Integrations page. Connecting one here only flips a flag in this browser:
   no credentials are asked for or stored. Real connections are made in DataBridge → Data Hub. */
import type { IconKey } from '../../components/ui/icons';

export interface IntegrationDef {
  id: string;
  name: string;
  group: 'Databases' | 'Streaming' | 'Storage' | 'Business apps' | 'BI & sharing' | 'Messaging';
  icon: IconKey;
  description: string;
  connected: boolean; // default in the demo
}

export const INTEGRATIONS: IntegrationDef[] = [
  { id: 'postgres', name: 'PostgreSQL', group: 'Databases', icon: 'layers', description: 'Operational database (CDC or scheduled sync)', connected: true },
  { id: 'mysql', name: 'MySQL', group: 'Databases', icon: 'layers', description: 'Read replicas and nightly snapshots', connected: false },
  { id: 'sqlserver', name: 'SQL Server', group: 'Databases', icon: 'layers', description: 'ERP and finance systems', connected: true },
  { id: 'clickhouse', name: 'ClickHouse', group: 'Databases', icon: 'zap', description: 'Fast serving layer for dashboards', connected: true },
  { id: 'kafka', name: 'Kafka', group: 'Streaming', icon: 'activity', description: 'Event streams (orders, payments, IoT)', connected: true },
  { id: 'eventhubs', name: 'Event Hubs', group: 'Streaming', icon: 'activity', description: 'Azure event ingestion', connected: false },
  { id: 'adls', name: 'ADLS Gen2', group: 'Storage', icon: 'boxes', description: 'Lakehouse storage (Delta tables)', connected: true },
  { id: 's3', name: 'Amazon S3', group: 'Storage', icon: 'boxes', description: 'Files and exports', connected: false },
  { id: 'sftp', name: 'SFTP', group: 'Storage', icon: 'box', description: 'Partner file drops', connected: true },
  { id: 'salesforce', name: 'Salesforce', group: 'Business apps', icon: 'briefcase', description: 'Accounts, leads and opportunities', connected: false },
  { id: 'erp', name: 'ERP (OData)', group: 'Business apps', icon: 'factory', description: 'Finance and inventory over OData', connected: true },
  { id: 'rest', name: 'REST APIs', group: 'Business apps', icon: 'sync', description: 'Any JSON API with paging', connected: true },
  { id: 'powerbi', name: 'Power BI', group: 'BI & sharing', icon: 'chart', description: 'Publish gold tables to Power BI', connected: true },
  { id: 'excel', name: 'Excel', group: 'BI & sharing', icon: 'chart', description: 'Live tables in Excel via OData', connected: true },
  { id: 'slack', name: 'Slack', group: 'Messaging', icon: 'bulb', description: 'Alerts and daily digests', connected: true },
  { id: 'teams', name: 'Microsoft Teams', group: 'Messaging', icon: 'users', description: 'Alerts to channels', connected: false },
  { id: 'email', name: 'Email (SMTP)', group: 'Messaging', icon: 'bag', description: 'Scheduled reports', connected: true },
];
