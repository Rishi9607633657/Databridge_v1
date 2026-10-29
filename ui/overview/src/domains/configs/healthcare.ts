import type { DomainConfig } from '../types';
import { ALL_WIDGETS } from './shared';

export const healthcare: DomainConfig = {
  id: 'healthcare',
  label: 'Healthcare',
  icon: 'hospital',
  hue: 'teal',
  description: 'Hospitals and clinics: visits, patients, departments',
  entity: { singular: 'Facility', plural: 'Facilities', building: 'hospital' },
  series: {
    primary: { label: 'Revenue', noun: 'revenue', format: 'currency' },
    secondary: { label: 'Patient visits', noun: 'patient visits', format: 'count' },
    people: { label: 'Patients', noun: 'patients', format: 'count', unique: true },
  },
  kpis: [
    { id: 'revenue', kind: 'sum', series: 'primary', label: 'Total Revenue', icon: 'chart', hue: 'green' },
    { id: 'visits', kind: 'sum', series: 'secondary', label: 'Patient Visits', icon: 'stethoscope', hue: 'blue' },
    { id: 'active', kind: 'active', label: 'Active Facilities', icon: 'hospital', hue: 'violet' },
    { id: 'occupancy', kind: 'rate', label: 'Bed Occupancy', icon: 'bed', hue: 'orange', rate: { label: 'Bed occupancy', mean: 0.81, spread: 0.06, higherIsBetter: true } },
    { id: 'forecast', kind: 'forecast', series: 'primary', label: 'Revenue Forecast', icon: 'target', hue: 'rose', horizonDays: 7 },
  ],
  segments: {
    title: 'Patient Mix',
    noun: 'patients',
    items: [
      { id: 'opd', label: 'Outpatient', share: 0.46, icon: 'stethoscope', hue: 'blue' },
      { id: 'ipd', label: 'Inpatient', share: 0.2, icon: 'bed', hue: 'violet' },
      { id: 'er', label: 'Emergency', share: 0.14, icon: 'ambulance', hue: 'rose' },
      { id: 'tele', label: 'Telehealth', share: 0.12, icon: 'video', hue: 'sky' },
      { id: 'day', label: 'Day care', share: 0.08, icon: 'heart', hue: 'amber' },
    ],
  },
  categories: {
    title: 'Revenue by Department',
    items: [
      { id: 'cardio', label: 'Cardiology', share: 0.28, icon: 'heart', hue: 'rose' },
      { id: 'ortho', label: 'Orthopedics', share: 0.21, icon: 'bone', hue: 'blue' },
      { id: 'diag', label: 'Diagnostics', share: 0.19, icon: 'microscope', hue: 'violet' },
      { id: 'pharmacy', label: 'Pharmacy', share: 0.18, icon: 'pill', hue: 'green' },
      { id: 'general', label: 'General Medicine', share: 0.14, icon: 'stethoscope', hue: 'orange' },
    ],
  },
  scale: { count: 24, primaryPerDay: 160000, ticket: 1450, peoplePerTxn: 0.9, countryWeights: { IN: 0.7, AE: 0.12, SG: 0.06, GB: 0.06, US: 0.06 } },
  events: [
    { type: 'customer', text: 'Patient admitted - {entity}', weight: 4 },
    { type: 'order', text: 'Appointment booked - {category}', weight: 5 },
    { type: 'inventory', text: 'Lab results published - {city}', weight: 3 },
    { type: 'payment', text: 'Insurance claim approved - {amount}', weight: 3 },
    { type: 'sync', text: 'EHR sync completed - {entity}', weight: 2 },
    { type: 'alert', text: 'Bed occupancy above 90% - {entity}', weight: 1 },
  ],
  widgets: ALL_WIDGETS,
  searchHint: 'Search facilities, departments, reports…',
};
