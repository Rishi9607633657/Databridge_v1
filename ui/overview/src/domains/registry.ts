/* Domain registry: the only place that knows which domains exist. */
import type { CustomDomainInput, DomainConfig, DomainId } from './types';
import { retail } from './configs/retail';
import { healthcare } from './configs/healthcare';
import { finance } from './configs/finance';
import { manufacturing } from './configs/manufacturing';
import { education } from './configs/education';
import { buildCustomDomain } from './configs/custom';

const BUILT_IN: Record<Exclude<DomainId, 'custom'>, DomainConfig> = { retail, healthcare, finance, manufacturing, education };

export const DOMAIN_IDS: DomainId[] = ['retail', 'healthcare', 'finance', 'manufacturing', 'education', 'custom'];

export function getDomain(id: DomainId, custom?: Partial<CustomDomainInput> | null): DomainConfig {
  if (id === 'custom') return buildCustomDomain(custom);
  return BUILT_IN[id] ?? retail;
}

export function listDomains(custom?: Partial<CustomDomainInput> | null): DomainConfig[] {
  return DOMAIN_IDS.map((id) => getDomain(id, custom));
}

export const isDomainId = (s: unknown): s is DomainId => typeof s === 'string' && (DOMAIN_IDS as string[]).includes(s);
