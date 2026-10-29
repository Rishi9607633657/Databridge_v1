import { Activity, BookOpen, ChartColumn, Database, FileText, House, LayoutGrid, Plug, Settings, Sparkles, UserRound, type LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  keywords?: string;
}

export const NAV: NavItem[] = [
  { to: '/', label: 'Overview', icon: House, keywords: 'home kpi summary globe' },
  { to: '/sources', label: 'Data Sources', icon: Database, keywords: 'connections sync ingestion pipelines' },
  { to: '/analytics', label: 'Analytics', icon: ChartColumn, keywords: 'trend breakdown locations compare' },
  { to: '/dashboards', label: 'Dashboards', icon: LayoutGrid, keywords: 'boards charts' },
  { to: '/reports', label: 'Reports', icon: FileText, keywords: 'export csv download schedule' },
  { to: '/insights', label: 'AI Insights', icon: Sparkles, keywords: 'anomaly forecast growth' },
  { to: '/catalog', label: 'Data Catalog', icon: BookOpen, keywords: 'tables datasets schema' },
  { to: '/monitoring', label: 'Monitoring', icon: Activity, keywords: 'health events cpu memory alerts' },
  { to: '/users', label: 'Users', icon: UserRound, keywords: 'people roles access' },
  { to: '/integrations', label: 'Integrations', icon: Plug, keywords: 'connectors slack power bi' },
  { to: '/settings', label: 'Settings', icon: Settings, keywords: 'theme currency widgets custom domain' },
];
