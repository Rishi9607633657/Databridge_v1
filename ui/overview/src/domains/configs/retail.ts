import type { DomainConfig } from '../types';
import { ALL_WIDGETS } from './shared';

export const retail: DomainConfig = {
  id: 'retail',
  label: 'Retail',
  icon: 'store',
  hue: 'blue',
  description: 'Stores, orders and shoppers across cities',
  entity: { singular: 'Store', plural: 'Stores', building: 'store' },
  series: {
    primary: { label: 'Sales', noun: 'sales', format: 'currency' },
    secondary: { label: 'Orders', noun: 'orders', format: 'count' },
    people: { label: 'Customers', noun: 'customers', format: 'count', unique: true },
  },
  kpis: [
    { id: 'sales', kind: 'sum', series: 'primary', label: 'Total Sales', icon: 'chart', hue: 'green' },
    { id: 'orders', kind: 'sum', series: 'secondary', label: 'Total Orders', icon: 'cart', hue: 'blue' },
    { id: 'active', kind: 'active', label: 'Active Stores', icon: 'store', hue: 'violet' },
    { id: 'customers', kind: 'sum', series: 'people', label: 'Total Customers', icon: 'users', hue: 'orange' },
    { id: 'forecast', kind: 'forecast', series: 'primary', label: 'Sales Forecast', icon: 'target', hue: 'rose', horizonDays: 7 },
  ],
  segments: {
    title: 'Customer Distribution',
    noun: 'customers',
    items: [
      { id: 'regular', label: 'Regular', share: 0.45, icon: 'users', hue: 'blue' },
      { id: 'new', label: 'New', share: 0.25, icon: 'userPlus', hue: 'rose' },
      { id: 'vip', label: 'VIP', share: 0.15, icon: 'crown', hue: 'orange' },
      { id: 'inactive', label: 'Inactive', share: 0.1, icon: 'userX', hue: 'amber' },
      { id: 'others', label: 'Others', share: 0.05, icon: 'dashed', hue: 'slate' },
    ],
  },
  categories: {
    title: 'Revenue by Category',
    items: [
      { id: 'apparel', label: 'Apparel & Footwear', share: 0.32, icon: 'shirt', hue: 'blue' },
      { id: 'electronics', label: 'Electronics', share: 0.24, icon: 'phone', hue: 'green' },
      { id: 'grocery', label: 'Grocery', share: 0.19, icon: 'basket', hue: 'violet' },
      { id: 'home', label: 'Home & Living', share: 0.15, icon: 'sofa', hue: 'rose' },
      { id: 'beauty', label: 'Beauty & Care', share: 0.1, icon: 'sparkles', hue: 'orange' },
    ],
  },
  scale: { count: 60, primaryPerDay: 16000, ticket: 640, peoplePerTxn: 0.82, countryWeights: { IN: 0.6, US: 0.1, GB: 0.05, DE: 0.04, AE: 0.09, SG: 0.04, AU: 0.05, CA: 0.03 } },
  events: [
    { type: 'order', text: 'New order received - {city}', weight: 6 },
    { type: 'payment', text: 'Payment processed - {city}', weight: 4 },
    { type: 'inventory', text: 'Inventory updated - {entity}', weight: 3 },
    { type: 'customer', text: 'New customer registered - {city}', weight: 3 },
    { type: 'sync', text: 'Data sync completed - POS feed', weight: 2 },
    { type: 'alert', text: 'Low stock: {category} at {entity}', weight: 1 },
  ],
  widgets: ALL_WIDGETS,
  searchHint: 'Search stores, categories, reports…',
};
