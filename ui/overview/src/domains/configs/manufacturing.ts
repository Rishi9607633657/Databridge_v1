import type { DomainConfig } from '../types';
import { ALL_WIDGETS } from './shared';

export const manufacturing: DomainConfig = {
  id: 'manufacturing',
  label: 'Manufacturing',
  icon: 'factory',
  hue: 'orange',
  description: 'Plants, output, product lines and equipment effectiveness',
  entity: { singular: 'Plant', plural: 'Plants', building: 'factory' },
  series: {
    primary: { label: 'Production value', noun: 'production value', format: 'currency' },
    secondary: { label: 'Units produced', noun: 'units', format: 'count' },
    people: { label: 'Orders shipped', noun: 'orders shipped', format: 'count' },
  },
  kpis: [
    { id: 'value', kind: 'sum', series: 'primary', label: 'Production Value', icon: 'chart', hue: 'green' },
    { id: 'units', kind: 'sum', series: 'secondary', label: 'Units Produced', icon: 'package', hue: 'blue' },
    { id: 'active', kind: 'active', label: 'Active Plants', icon: 'factory', hue: 'violet' },
    { id: 'oee', kind: 'rate', label: 'OEE', icon: 'gauge', hue: 'orange', rate: { label: 'OEE', mean: 0.78, spread: 0.05, higherIsBetter: true } },
    { id: 'forecast', kind: 'forecast', series: 'primary', label: 'Output Forecast', icon: 'target', hue: 'rose', horizonDays: 7 },
  ],
  segments: {
    title: 'Order Mix',
    noun: 'orders',
    items: [
      { id: 'domestic', label: 'Domestic', share: 0.44, icon: 'truck', hue: 'blue' },
      { id: 'export', label: 'Export', share: 0.24, icon: 'plane', hue: 'sky' },
      { id: 'oem', label: 'OEM', share: 0.16, icon: 'factory', hue: 'violet' },
      { id: 'after', label: 'Aftermarket', share: 0.1, icon: 'wrench', hue: 'orange' },
      { id: 'gov', label: 'Government', share: 0.06, icon: 'landmark', hue: 'rose' },
    ],
  },
  categories: {
    title: 'Output by Product Line',
    items: [
      { id: 'auto', label: 'Auto components', share: 0.31, icon: 'car', hue: 'blue' },
      { id: 'elec', label: 'Electricals', share: 0.23, icon: 'zap', hue: 'green' },
      { id: 'machinery', label: 'Machinery', share: 0.2, icon: 'cog', hue: 'violet' },
      { id: 'packaging', label: 'Packaging', share: 0.14, icon: 'box', hue: 'rose' },
      { id: 'spares', label: 'Spares & service', share: 0.12, icon: 'wrench', hue: 'orange' },
    ],
  },
  scale: { count: 16, primaryPerDay: 1800000, ticket: 1150, peoplePerTxn: 0.012, countryWeights: { IN: 0.62, DE: 0.12, US: 0.1, AE: 0.08, CA: 0.08 } },
  events: [
    { type: 'order', text: 'Batch completed - {entity}', weight: 5 },
    { type: 'inventory', text: 'Quality check passed - {category}', weight: 4 },
    { type: 'payment', text: 'Dispatch shipped - {city}', weight: 3 },
    { type: 'customer', text: 'Maintenance scheduled - {entity}', weight: 2 },
    { type: 'sync', text: 'ERP sync completed - {entity}', weight: 2 },
    { type: 'alert', text: 'Unplanned downtime - {entity}', weight: 1 },
  ],
  widgets: ALL_WIDGETS,
  searchHint: 'Search plants, product lines, reports…',
};
