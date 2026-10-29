import type { WidgetId } from '../types';

/** Overview widgets in reading order. A domain lists the ones that make sense for it. */
export const ALL_WIDGETS: WidgetId[] = ['kpis', 'globe', 'performance', 'top', 'distribution', 'categories', 'health', 'events', 'insights'];

export const WIDGET_LABELS: Record<WidgetId, string> = {
  kpis: 'KPI cards',
  globe: 'Global overview (3D globe)',
  performance: 'Performance chart',
  top: 'Top locations',
  distribution: 'Distribution donut',
  categories: 'Revenue by category',
  health: 'System health',
  events: 'Recent events',
  insights: 'AI insights',
};
