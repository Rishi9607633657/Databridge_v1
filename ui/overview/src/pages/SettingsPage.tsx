/* Settings: appearance, motion, number format, default domain, overview widgets, reset. Saved in this browser. */
import { useState } from 'react';
import { useApp, DEFAULT_SETTINGS, type MotionSetting, type ThemeSetting } from '../app/state';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Segmented } from '../components/ui/Segmented';
import { Dropdown } from '../components/ui/Dropdown';
import { CustomDomainDialog } from '../components/layout/CustomDomainDialog';
import { WIDGET_LABELS, ALL_WIDGETS } from '../domains/configs/shared';
import { listDomains } from '../domains/registry';
import type { DomainId } from '../domains/types';
import { remove } from '../lib/storage';
import { formatValue } from '../lib/format';
import { BoardSettings } from '../board/BoardSettings';

export default function SettingsPage() {
  const { settings, updateSettings, custom, fo, board } = useApp();
  const [editing, setEditing] = useState(false);
  const hidden = new Set(settings.hiddenWidgets);
  const toggleWidget = (w: (typeof ALL_WIDGETS)[number]) => {
    const n = new Set(hidden);
    if (n.has(w)) n.delete(w);
    else n.add(w);
    updateSettings({ hiddenWidgets: [...n] });
  };
  return (
    <>
      <PageHeader title="Settings" sub={board ? 'Board data is saved for everyone; the rest is saved in this browser.' : 'Saved in this browser.'} />
      <Card>
        {board && <BoardSettings key={board.payload.id + board.payload.loadedAt} />}
        <section className="settings-sec" aria-labelledby="s-look">
          <div>
            <h2 id="s-look">Appearance</h2>
            <p>Light is the default. Dark works everywhere, including the 3D globe.</p>
          </div>
          <div className="set-rows">
            <div className="set-row">
              <span>Theme</span>
              <Segmented label="Theme" variant="tabs" value={settings.theme} onChange={(v: ThemeSetting) => updateSettings({ theme: v })} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'system', label: 'System' }]} />
            </div>
            <div className="set-row">
              <span>
                Motion
                <small>Reduce stops the globe spinning, pulses and chart animations.</small>
              </span>
              <Segmented label="Motion" variant="tabs" value={settings.motion} onChange={(v: MotionSetting) => updateSettings({ motion: v })} options={[{ value: 'system', label: 'System' }, { value: 'reduce', label: 'Reduce' }, { value: 'full', label: 'Full' }]} />
            </div>
            <label className="set-row chk">
              <span>
                Rotate the globe slowly
                <small>It always pauses while your pointer is over it.</small>
              </span>
              <input type="checkbox" checked={settings.autoRotate} onChange={(e) => updateSettings({ autoRotate: e.target.checked })} />
            </label>
          </div>
        </section>
        <section className="settings-sec" aria-labelledby="s-num">
          <div>
            <h2 id="s-num">Numbers</h2>
            <p>
              Example: {formatValue(2843500, 'currency', fo)} · {formatValue(18542, 'count', fo)} · {formatValue(185420, 'count', fo)}
            </p>
          </div>
          <div className="set-rows">
            <div className="set-row">
              <span>Number style</span>
              <Segmented label="Number style" variant="tabs" value={settings.numberSystem} onChange={(v) => updateSettings({ numberSystem: v })} options={[{ value: 'indian', label: 'Lakh / Crore' }, { value: 'international', label: 'Thousand / Million' }]} />
            </div>
            <div className="set-row">
              <span>Currency symbol</span>
              <Dropdown label="Currency" value={settings.currency} onChange={(v) => updateSettings({ currency: v })} options={['₹', '$', '€', '£', 'AED ', 'S$'].map((c) => ({ value: c, label: c.trim() }))} />
            </div>
          </div>
        </section>
        {!board && <section className="settings-sec" aria-labelledby="s-dom">
          <div>
            <h2 id="s-dom">Domain</h2>
            <p>The domain sets the labels, KPIs, charts, categories and the buildings in 3D.</p>
          </div>
          <div className="set-rows">
            <div className="set-row">
              <span>Open with</span>
              <Dropdown label="Default domain" value={settings.defaultDomain} onChange={(v) => updateSettings({ defaultDomain: v as DomainId })} options={listDomains(custom).map((d) => ({ value: d.id, label: d.label }))} />
            </div>
            <div className="set-row">
              <span>
                Custom domain
                <small>
                  “{custom.label}”: {custom.entityPlural}, {custom.primaryLabel}, {custom.peopleLabel}
                </small>
              </span>
              <button type="button" className="btn" onClick={() => setEditing(true)}>Edit labels</button>
            </div>
          </div>
        </section>}
        <section className="settings-sec" aria-labelledby="s-w">
          <div>
            <h2 id="s-w">Overview widgets</h2>
            <p>Hide the ones that do not fit your business.</p>
          </div>
          <div className="checks">
            {ALL_WIDGETS.map((w) => (
              <label key={w} className="chk">
                <input type="checkbox" checked={!hidden.has(w)} onChange={() => toggleWidget(w)} />
                <span>{WIDGET_LABELS[w]}</span>
              </label>
            ))}
          </div>
        </section>
        <section className="settings-sec" aria-labelledby="s-reset">
          <div>
            <h2 id="s-reset">Reset</h2>
            <p>Clears the choices saved in this browser (theme, domain, dates, custom labels, integrations).</p>
          </div>
          <div className="set-rows">
            <div className="set-row">
              <span>Start fresh</span>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  remove(['dbx.settings', 'dbx.domain', 'dbx.range', 'dbx.region', 'dbx.custom', 'dbx.integrations', 'dbx.schedules']);
                  updateSettings(DEFAULT_SETTINGS);
                  location.reload();
                }}
              >
                Reset settings
              </button>
            </div>
          </div>
        </section>
      </Card>
      <CustomDomainDialog open={editing} onClose={() => setEditing(false)} />
    </>
  );
}
