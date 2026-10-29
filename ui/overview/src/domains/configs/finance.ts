import type { DomainConfig } from '../types';
import { ALL_WIDGETS } from './shared';

export const finance: DomainConfig = {
  id: 'finance',
  label: 'Finance',
  icon: 'landmark',
  hue: 'violet',
  description: 'Branches, transactions, accounts and products',
  entity: { singular: 'Branch', plural: 'Branches', building: 'bank' },
  series: {
    primary: { label: 'Revenue', noun: 'revenue', format: 'currency' },
    secondary: { label: 'Transactions', noun: 'transactions', format: 'count' },
    people: { label: 'Active accounts', noun: 'active accounts', format: 'count', unique: true },
  },
  kpis: [
    { id: 'revenue', kind: 'sum', series: 'primary', label: 'Total Revenue', icon: 'chart', hue: 'green' },
    { id: 'txns', kind: 'sum', series: 'secondary', label: 'Transactions', icon: 'exchange', hue: 'blue' },
    { id: 'active', kind: 'active', label: 'Active Branches', icon: 'landmark', hue: 'violet' },
    { id: 'accounts', kind: 'sum', series: 'people', label: 'Active Accounts', icon: 'users', hue: 'orange' },
    { id: 'forecast', kind: 'forecast', series: 'primary', label: 'Revenue Forecast', icon: 'target', hue: 'rose', horizonDays: 7 },
  ],
  segments: {
    title: 'Account Segments',
    noun: 'accounts',
    items: [
      { id: 'retail', label: 'Retail banking', share: 0.48, icon: 'users', hue: 'blue' },
      { id: 'sme', label: 'SME', share: 0.2, icon: 'briefcase', hue: 'sky' },
      { id: 'corporate', label: 'Corporate', share: 0.14, icon: 'building', hue: 'violet' },
      { id: 'wealth', label: 'Wealth', share: 0.1, icon: 'crown', hue: 'orange' },
      { id: 'nri', label: 'NRI', share: 0.08, icon: 'plane', hue: 'rose' },
    ],
  },
  categories: {
    title: 'Revenue by Product',
    items: [
      { id: 'loans', label: 'Loans', share: 0.34, icon: 'coins', hue: 'blue' },
      { id: 'cards', label: 'Cards', share: 0.2, icon: 'card', hue: 'green' },
      { id: 'deposits', label: 'Deposits', share: 0.18, icon: 'piggy', hue: 'violet' },
      { id: 'insurance', label: 'Insurance', share: 0.15, icon: 'shield', hue: 'rose' },
      { id: 'invest', label: 'Investments', share: 0.13, icon: 'trend', hue: 'orange' },
    ],
  },
  scale: { count: 48, primaryPerDay: 85000, ticket: 95, peoplePerTxn: 0.55, countryWeights: { IN: 0.72, AE: 0.1, SG: 0.06, GB: 0.06, US: 0.06 } },
  events: [
    { type: 'order', text: 'Loan approved - {entity}', weight: 3 },
    { type: 'payment', text: 'Card payments settled - {amount}', weight: 5 },
    { type: 'customer', text: 'New account opened - {segment}', weight: 4 },
    { type: 'inventory', text: 'KYC verified - {city}', weight: 3 },
    { type: 'sync', text: 'Core banking sync completed', weight: 2 },
    { type: 'alert', text: 'Unusual transaction pattern flagged - {entity}', weight: 1 },
  ],
  widgets: ALL_WIDGETS,
  searchHint: 'Search branches, products, reports…',
};
