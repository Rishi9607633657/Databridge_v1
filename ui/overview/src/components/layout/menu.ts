/* The one DataBridge menu. When this app is served by DataBridge, its sidebar shows the same groups, order and
   icons as the workspace sidebar (frontend/index.html): workspace pages are plain links into the main app,
   Overview pages are routes of this app. Keep both lists in the same order. */
import { useMemo } from 'react';
import { useApp } from '../../app/state';
import { servedByDataBridge } from '../../services/apiClient';
import type { Me } from '../../services/platformService';
import type { DbIconName } from '../ui/dbIcons';

export interface MenuItem {
  label: string;
  icon: DbIconName;
  /** a page of this app */
  to?: string;
  /** a page of the DataBridge workspace */
  href?: string;
  /** admins only, like the workspace's Admin and Governance */
  admin?: boolean;
  /** hidden when the feature is turned off for this user (any of these) */
  feature?: string | string[];
  /** a tab of the item above it (indented) */
  sub?: boolean;
  keywords?: string;
}

export interface MenuGroup {
  label: string;
  items: MenuItem[];
}

export const MENU: MenuGroup[] = [
  {
    label: 'Analytics',
    items: [
      { label: 'Home', icon: 'home', href: '/#/home', keywords: 'start recent' },
      { label: 'Dashboards', icon: 'chart', href: '/#/dashboards', feature: 'dashboards', keywords: 'boards charts bi' },
      { label: 'Business Overview', icon: 'overview', to: '/', keywords: 'kpi summary globe home' },
      /* the Overview's own tabs, shown under it (the workspace sidebar shows only "Business Overview") */
      { label: 'Analytics', icon: 'analytics', to: '/analytics', sub: true, keywords: 'trend breakdown locations compare' },
      { label: 'AI Insights', icon: 'spark', to: '/insights', sub: true, keywords: 'anomaly forecast growth' },
      { label: 'Reports', icon: 'report', to: '/reports', sub: true, keywords: 'export csv download schedule' },
      { label: 'Ask data', icon: 'chat', href: '/#/ask', feature: 'ask_data', keywords: 'question natural language' },
    ],
  },
  {
    label: 'Build',
    items: [
      { label: 'Workspace', icon: 'folder', href: '/#/workspace', keywords: 'notebooks files folders' },
      { label: 'SQL Editor', icon: 'term', href: '/#/sql', feature: 'sql_editor', keywords: 'query spark sql' },
      { label: 'Workflows', icon: 'flow', href: '/#/workflows', feature: ['jobs', 'airflow', 'pipelines'], keywords: 'jobs pipelines airflow schedule' },
      { label: 'Machine learning', icon: 'flask', href: '/#/ml', feature: 'ml', keywords: 'models experiments mlflow' },
    ],
  },
  {
    label: 'Data',
    items: [
      { label: 'Catalog', icon: 'db', href: '/#/catalog', feature: 'catalog', keywords: 'tables schemas databases' },
      { label: 'Data Hub', icon: 'hub', href: '/#/datahub', feature: ['data_hub', 'airbyte'], keywords: 'connectors ingestion airbyte' },
      { label: 'Data Sources', icon: 'sources', to: '/sources', keywords: 'connections sync status' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Compute', icon: 'cpu', href: '/#/compute', feature: 'compute', keywords: 'clusters spark kubernetes' },
      { label: 'Monitoring', icon: 'pulse', to: '/monitoring', keywords: 'health events cpu memory' },
      { label: 'Alerts', icon: 'bell', href: '/#/alerts', feature: 'alerts', keywords: 'notifications rules' },
      { label: 'Logs', icon: 'logs', href: '/#/logs', feature: 'logs', keywords: 'audit events' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { label: 'Governance', icon: 'shield', href: '/#/governance', admin: true, keywords: 'access policies lineage quality' },
      { label: 'Users', icon: 'user', to: '/users', admin: true, keywords: 'people roles access' },
      { label: 'Integrations', icon: 'plug', to: '/integrations', keywords: 'slack power bi connectors' },
      { label: 'Admin', icon: 'gear', href: '/#/admin', admin: true, keywords: 'settings tenants features look' },
      { label: 'Settings', icon: 'sliders', to: '/settings', keywords: 'theme currency widgets custom domain' },
    ],
  },
];

export const isAdminRole = (role?: string) => role === 'admin' || role === 'super_admin';

/** the menu this viewer may use (same rules as the workspace sidebar) */
export function visibleMenu(me: Me | null, features: Record<string, boolean>): MenuGroup[] {
  const on = (k: string) => features[k] !== false;
  const ok = (i: MenuItem) =>
    (!i.admin || !me || isAdminRole(me.role)) && (!i.feature || (Array.isArray(i.feature) ? i.feature.some(on) : on(i.feature)));
  return MENU.map((g) => ({ ...g, items: g.items.filter(ok) })).filter((g) => g.items.length > 0);
}

/** the shared menu when served by DataBridge; null when this app runs on its own (it then uses NAV) */
export function useMenu(): MenuGroup[] | null {
  const { me, features } = useApp();
  return useMemo(() => (servedByDataBridge() ? visibleMenu(me, features) : null), [me, features]);
}

/** the workspace sidebar width the viewer chose by dragging (shared through localStorage), else the default */
export function workspaceSidebarWidth(): number {
  try {
    const w = Number(JSON.parse(localStorage.getItem('databridge-sizes') || '{}').sidebar);
    return Number.isFinite(w) && w >= 200 && w <= 380 ? w : 232;
  } catch {
    return 232;
  }
}
