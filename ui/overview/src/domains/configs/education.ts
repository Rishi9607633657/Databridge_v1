import type { DomainConfig } from '../types';
import { ALL_WIDGETS } from './shared';

export const education: DomainConfig = {
  id: 'education',
  label: 'Education',
  icon: 'graduation',
  hue: 'sky',
  description: 'Campuses, enrolments, learners and programs',
  entity: { singular: 'Campus', plural: 'Campuses', building: 'campus' },
  series: {
    primary: { label: 'Fee collection', noun: 'fee collection', format: 'currency' },
    secondary: { label: 'Enrolments', noun: 'enrolments', format: 'count' },
    people: { label: 'Active learners', noun: 'active learners', format: 'count', unique: true },
  },
  kpis: [
    { id: 'fees', kind: 'sum', series: 'primary', label: 'Fee Collection', icon: 'chart', hue: 'green' },
    { id: 'enrol', kind: 'sum', series: 'secondary', label: 'New Enrolments', icon: 'graduation', hue: 'blue' },
    { id: 'active', kind: 'active', label: 'Active Campuses', icon: 'school', hue: 'violet' },
    { id: 'attendance', kind: 'rate', label: 'Attendance', icon: 'users', hue: 'orange', rate: { label: 'Attendance', mean: 0.87, spread: 0.04, higherIsBetter: true } },
    { id: 'forecast', kind: 'forecast', series: 'primary', label: 'Fee Forecast', icon: 'target', hue: 'rose', horizonDays: 7 },
  ],
  segments: {
    title: 'Learner Mix',
    noun: 'learners',
    items: [
      { id: 'ug', label: 'Undergraduate', share: 0.42, icon: 'graduation', hue: 'blue' },
      { id: 'pg', label: 'Postgraduate', share: 0.2, icon: 'book', hue: 'violet' },
      { id: 'online', label: 'Online', share: 0.16, icon: 'laptop', hue: 'sky' },
      { id: 'diploma', label: 'Diploma', share: 0.14, icon: 'school', hue: 'orange' },
      { id: 'exec', label: 'Executive', share: 0.08, icon: 'briefcase', hue: 'rose' },
    ],
  },
  categories: {
    title: 'Fees by Program',
    items: [
      { id: 'eng', label: 'Engineering', share: 0.3, icon: 'cpu', hue: 'blue' },
      { id: 'mgmt', label: 'Management', share: 0.24, icon: 'briefcase', hue: 'green' },
      { id: 'sci', label: 'Sciences', share: 0.18, icon: 'flask', hue: 'violet' },
      { id: 'arts', label: 'Arts & Humanities', share: 0.14, icon: 'palette', hue: 'rose' },
      { id: 'online', label: 'Online courses', share: 0.14, icon: 'monitor', hue: 'orange' },
    ],
  },
  scale: { count: 20, primaryPerDay: 320000, ticket: 26000, peoplePerTxn: 6, countryWeights: { IN: 0.75, AE: 0.1, SG: 0.05, GB: 0.05, AU: 0.05 } },
  events: [
    { type: 'customer', text: 'New enrolment - {category}', weight: 5 },
    { type: 'payment', text: 'Fee payment received - {city}', weight: 4 },
    { type: 'inventory', text: 'Attendance uploaded - {entity}', weight: 3 },
    { type: 'order', text: 'Exam results published - {category}', weight: 2 },
    { type: 'sync', text: 'LMS sync completed - {entity}', weight: 2 },
    { type: 'alert', text: 'Attendance below 75% - {entity}', weight: 1 },
  ],
  widgets: ALL_WIDGETS,
  searchHint: 'Search campuses, programs, reports…',
};
