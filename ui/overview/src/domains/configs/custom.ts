/* The Custom domain is built from a few labels the person types in Settings (stored in this browser). */
import type { CustomDomainInput, DomainConfig, Hue, ShareDef } from '../types';
import type { IconKey } from '../../components/ui/icons';
import { ALL_WIDGETS } from './shared';

export const CUSTOM_DEFAULTS: CustomDomainInput = {
  label: 'Custom',
  entitySingular: 'Site',
  entityPlural: 'Sites',
  building: 'office',
  primaryLabel: 'Revenue',
  secondaryLabel: 'Transactions',
  peopleLabel: 'Customers',
  categories: 'Products, Services, Subscriptions, Support, Other',
  segments: 'New, Returning, Key accounts, Partners, Other',
};

const CAT_ICONS: IconKey[] = ['box', 'briefcase', 'layers', 'wrench', 'dashed', 'sparkles', 'cog'];
const SEG_ICONS: IconKey[] = ['userPlus', 'users', 'crown', 'building', 'dashed', 'briefcase', 'plane'];
const CAT_HUES: Hue[] = ['blue', 'green', 'violet', 'rose', 'orange', 'teal', 'amber'];
const SEG_HUES: Hue[] = ['blue', 'rose', 'orange', 'violet', 'slate', 'teal', 'amber'];

function shares(list: string, icons: IconKey[], hues: Hue[]): ShareDef[] {
  const names = list.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 7);
  const items = names.length ? names : ['Other'];
  const weights = items.map((_, i) => 1 / (i + 1.4));
  const sum = weights.reduce((s, x) => s + x, 0);
  return items.map((label, i) => ({ id: `c${i}`, label, share: weights[i] / sum, icon: icons[i % icons.length], hue: hues[i % hues.length] }));
}

const clean = (s: string, fallback: string) => (s || '').trim().slice(0, 40) || fallback;

export function buildCustomDomain(input: Partial<CustomDomainInput> | null | undefined): DomainConfig {
  const c = { ...CUSTOM_DEFAULTS, ...(input || {}) };
  const one = clean(c.entitySingular, 'Site');
  const many = clean(c.entityPlural, `${one}s`);
  const primary = clean(c.primaryLabel, 'Revenue');
  const secondary = clean(c.secondaryLabel, 'Transactions');
  const people = clean(c.peopleLabel, 'Customers');
  return {
    id: 'custom',
    label: clean(c.label, 'Custom'),
    icon: 'building',
    hue: 'slate',
    description: 'Your own labels and categories',
    entity: { singular: one, plural: many, building: c.building || 'office' },
    series: {
      primary: { label: primary, noun: primary.toLowerCase(), format: 'currency' },
      secondary: { label: secondary, noun: secondary.toLowerCase(), format: 'count' },
      people: { label: people, noun: people.toLowerCase(), format: 'count', unique: true },
    },
    kpis: [
      { id: 'primary', kind: 'sum', series: 'primary', label: `Total ${primary}`, icon: 'chart', hue: 'green' },
      { id: 'secondary', kind: 'sum', series: 'secondary', label: secondary, icon: 'exchange', hue: 'blue' },
      { id: 'active', kind: 'active', label: `Active ${many}`, icon: 'building', hue: 'violet' },
      { id: 'people', kind: 'sum', series: 'people', label: people, icon: 'users', hue: 'orange' },
      { id: 'forecast', kind: 'forecast', series: 'primary', label: `${primary} Forecast`, icon: 'target', hue: 'rose', horizonDays: 7 },
    ],
    segments: { title: `${people} Distribution`, noun: people.toLowerCase(), items: shares(c.segments, SEG_ICONS, SEG_HUES) },
    categories: { title: `${primary} by Category`, items: shares(c.categories, CAT_ICONS, CAT_HUES) },
    scale: { count: 30, primaryPerDay: 40000, ticket: 1200, peoplePerTxn: 0.7, countryWeights: { IN: 0.55, US: 0.12, GB: 0.08, DE: 0.05, AE: 0.08, SG: 0.04, AU: 0.05, CA: 0.03 } },
    events: [
      { type: 'order', text: `New ${secondary.toLowerCase().replace(/s$/, '')} recorded - {city}`, weight: 5 },
      { type: 'payment', text: 'Payment received - {amount}', weight: 4 },
      { type: 'customer', text: `New ${people.toLowerCase().replace(/s$/, '')} added - {segment}`, weight: 3 },
      { type: 'inventory', text: 'Record updated - {entity}', weight: 2 },
      { type: 'sync', text: 'Data sync completed - {entity}', weight: 2 },
      { type: 'alert', text: 'Threshold crossed - {entity}', weight: 1 },
    ],
    widgets: ALL_WIDGETS,
    searchHint: `Search ${many.toLowerCase()}, categories, reports…`,
  };
}
