/* Edit the Custom domain: names for the entity, metrics, categories and segments (saved in this browser). */
import { useEffect, useState } from 'react';
import { useApp } from '../../app/state';
import { Modal } from '../ui/Modal';
import { CUSTOM_DEFAULTS } from '../../domains/configs/custom';
import type { BuildingKind, CustomDomainInput } from '../../domains/types';
import { EntityThumb } from '../misc/EntityThumb';

const KINDS: { value: BuildingKind; label: string }[] = [
  { value: 'office', label: 'Office tower' },
  { value: 'store', label: 'Store' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'bank', label: 'Bank' },
  { value: 'factory', label: 'Factory' },
  { value: 'campus', label: 'Campus' },
];

export function CustomDomainDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { custom, setCustom, setDomainId } = useApp();
  const [f, setF] = useState<CustomDomainInput>(custom);
  useEffect(() => {
    if (open) setF(custom);
  }, [open, custom]);
  const set = (k: keyof CustomDomainInput) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));
  const field = (k: keyof CustomDomainInput, label: string, hint?: string) => (
    <label className="fld">
      <span>{label}</span>
      <input value={f[k]} onChange={set(k)} maxLength={k === 'categories' || k === 'segments' ? 160 : 40} />
      {hint && <small>{hint}</small>}
    </label>
  );
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Customize your domain"
      sub="Name things the way your business does. The dashboard, KPIs, charts and 3D buildings follow these labels."
      wide
      footer={
        <>
          <button type="button" className="btn" onClick={() => setF(CUSTOM_DEFAULTS)}>Reset</button>
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              setCustom(f);
              setDomainId('custom');
              onClose();
            }}
          >
            Save and switch
          </button>
        </>
      }
    >
      <div className="form-grid">
        {field('label', 'Domain name', 'Shown in the domain switcher')}
        {field('entitySingular', 'One location is a…', 'e.g. Site, Warehouse, Clinic')}
        {field('entityPlural', 'Several are…', 'e.g. Sites, Warehouses')}
        {field('primaryLabel', 'Main money metric', 'e.g. Revenue, Billing, GMV')}
        {field('secondaryLabel', 'Main count metric', 'e.g. Transactions, Shipments')}
        {field('peopleLabel', 'People', 'e.g. Customers, Members, Tenants')}
        {field('categories', 'Categories', 'Comma separated, up to 7')}
        {field('segments', 'Segments', 'Comma separated, up to 7')}
      </div>
      <fieldset className="kind-pick">
        <legend>Building shown in 3D</legend>
        {KINDS.map((k) => (
          <label key={k.value} className={f.building === k.value ? 'on' : ''}>
            <input type="radio" name="kind" value={k.value} checked={f.building === k.value} onChange={() => setF((x) => ({ ...x, building: k.value }))} />
            <EntityThumb kind={k.value} color="#2F6BFF" size={44} />
            <span>{k.label}</span>
          </label>
        ))}
      </fieldset>
    </Modal>
  );
}
