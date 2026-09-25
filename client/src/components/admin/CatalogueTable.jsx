import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { inr, RAID_LEVELS } from '../../lib/nas/logic.js';
import { Dialog } from '../configurator/parts.jsx';

const COLUMNS = {
  models: ['model', 'brand', 'bays', 'quotePrice', 'minPrice', 'featured', 'rentable'],
  drives: ['capacityTb', 'line', 'quotePrice', 'minPrice'],
  driveLines: ['name', 'brand', 'driveClass', 'workloadTbYear', 'warrantyYears'],
  upgrades: ['sku', 'category', 'name', 'quotePrice', 'minPrice'],
};

const LABELS = {
  quotePrice: 'Quote ₹', minPrice: 'Floor ₹', capacityTb: 'TB', m2Slots: 'M.2 slots', maxDriveTb: 'Max drive TB',
  baysWithExpansion: 'Bays with expansion', maxRawTb: 'Max raw TB', networkUpgrade: 'Network upgrade', memoryMax: 'Max memory',
  cpuCores: 'CPU cores', usbPorts: 'USB ports', weightKg: 'Weight kg', specsUrl: 'Specs URL', driveClass: 'Class',
  madeForBrand: 'Made for brand', workloadTbYear: 'Workload', warrantyYears: 'Warranty (years)', bestFor: 'Best for', sortOrder: 'Sort order',
};
const label = (k) => LABELS[k] ?? k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
const isMoney = (k) => k === 'quotePrice' || k === 'minPrice';

function cell(k, v) {
  if (v == null || v === '') return <span className="text-subtle">—</span>;
  if (typeof v === 'boolean') return v ? 'Yes' : <span className="text-subtle">No</span>;
  if (isMoney(k)) return inr(v);
  return String(v);
}

export default function CatalogueTable({ collection, rows, schema, onChanged }) {
  const [editing, setEditing] = useState(null); // row, or {} for new
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const cols = COLUMNS[collection];
  const hasActive = 'active' in schema.fields;

  async function toggleActive(row) {
    try {
      await api.updateItem(collection, row.id, { active: !row.active });
      onChanged();
    } catch (e) { alert(e.message); }
  }

  async function remove(row) {
    if (!confirm(`Delete this item permanently? Use "In configurator" to hide it instead.`)) return;
    try {
      await api.deleteItem(collection, row.id);
      onChanged();
    } catch (e) { alert(e.message); }
  }

  async function save(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {};
    for (const [k, type] of Object.entries(schema.fields)) {
      if (k === 'active') continue;
      if (type === 'bool') data[k] = form.get(k) === 'on';
      else if (k === 'raid') data[k] = form.getAll('raid');
      else data[k] = form.get(k) ?? '';
    }
    // Only send what changed on edit.
    const changes = editing.id
      ? Object.fromEntries(Object.entries(data).filter(([k, v]) => String(v ?? '') !== String(Array.isArray(editing[k]) ? editing[k] : editing[k] ?? '')))
      : data;
    setBusy(true);
    setError('');
    try {
      if (editing.id) { if (Object.keys(changes).length) await api.updateItem(collection, editing.id, changes); }
      else await api.createItem(collection, changes);
      setEditing(null);
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted">{rows.length} items{hasActive ? ` · ${rows.filter((r) => r.active).length} in the configurator` : ''}</p>
        <button onClick={() => { setError(''); setEditing({}); }} className="btn btn-primary !px-4 !py-2 !text-xs"><Plus className="size-3.5" /> Add</button>
      </div>
      <div className="overflow-x-auto rounded-2xl ring-1 ring-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.03] text-xs text-muted">
            <tr>
              {cols.map((k) => (
                <th key={k} className={`px-4 py-3 font-normal whitespace-nowrap ${k === 'minPrice' ? 'text-amber-200/80' : ''}`}>{label(k)}</th>
              ))}
              {hasActive && <th className="px-4 py-3 font-normal whitespace-nowrap">In configurator</th>}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={`border-t border-line ${hasActive && !r.active ? 'opacity-50' : ''}`}>
                {cols.map((k) => (
                  <td key={k} className={`px-4 py-2.5 whitespace-nowrap ${k === 'minPrice' ? 'text-amber-200/80' : ''}`}>{cell(k, r[k])}</td>
                ))}
                {hasActive && (
                  <td className="px-4 py-2.5">
                    <button onClick={() => toggleActive(r)} role="switch" aria-checked={r.active} aria-label="In configurator" className={`relative h-5 w-9 rounded-full transition-colors ${r.active ? 'bg-white' : 'bg-white/15'}`}>
                      <span className={`absolute top-0.5 size-4 rounded-full transition-all ${r.active ? 'left-4.5 bg-black' : 'left-0.5 bg-white/70'}`} />
                    </button>
                  </td>
                )}
                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                  <button onClick={() => { setError(''); setEditing(r); }} aria-label="Edit" className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"><Pencil className="size-3.5" /></button>
                  <button onClick={() => remove(r)} aria-label="Delete" className="rounded-full p-2 text-white/40 hover:bg-red-500/15 hover:text-red-300"><Trash2 className="size-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={editing != null} onClose={() => setEditing(null)} title={editing?.id ? `Edit ${schema.label.toLowerCase()}` : `Add to ${schema.label.toLowerCase()}`}>
        {editing && (
          <form onSubmit={save} className="grid gap-3 pb-2 sm:grid-cols-2">
            {Object.entries(schema.fields).filter(([k]) => k !== 'active').map(([k, type]) => {
              const required = schema.required.includes(k);
              if (k === 'raid') {
                return (
                  <fieldset key={k} className="sm:col-span-2">
                    <legend className="mb-1.5 text-xs text-muted">RAID levels supported</legend>
                    <div className="flex flex-wrap gap-3 text-sm">
                      {RAID_LEVELS.map((r) => (
                        <label key={r} className="flex items-center gap-1.5">
                          <input type="checkbox" name="raid" value={r} defaultChecked={editing.raid?.includes(r)} className="accent-white" /> {r.replace('RAID', 'RAID ')}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                );
              }
              if (type === 'bool') {
                return (
                  <label key={k} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name={k} defaultChecked={Boolean(editing[k])} className="accent-white" /> {label(k)}
                  </label>
                );
              }
              const wide = ['summary', 'specsUrl', 'extras', 'bestFor', 'network', 'networkUpgrade'].includes(k);
              return (
                <label key={k} className={wide ? 'sm:col-span-2' : ''}>
                  <span className={`mb-1 block text-xs ${k === 'minPrice' ? 'text-amber-200/80' : 'text-muted'}`}>
                    {label(k)}{required ? ' *' : ''}{k === 'minPrice' ? ' (internal, never shown publicly)' : ''}
                  </span>
                  <input
                    name={k}
                    type={type === 'int' || type === 'num' ? 'number' : 'text'}
                    step={type === 'num' ? 'any' : 1}
                    min={type === 'int' || type === 'num' ? 0 : undefined}
                    required={required}
                    defaultValue={editing[k] ?? ''}
                    className="field !py-2 text-sm"
                  />
                </label>
              );
            })}
            {error && <p role="alert" className="text-sm text-red-300 sm:col-span-2">{error}</p>}
            <div className="flex justify-end gap-2 sm:col-span-2">
              <button type="button" onClick={() => setEditing(null)} className="btn btn-glass !py-2">Cancel</button>
              <button disabled={busy} className="btn btn-primary !py-2">{busy ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}

export function SettingsForm({ settings, onChanged }) {
  const [msg, setMsg] = useState('');
  async function save(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await api.updateSettings(data);
      setMsg('Saved.');
      onChanged();
    } catch (err) { setMsg(err.message); }
  }
  const fields = [
    ['installQuote', 'Installation & setup, per unit (₹)', false],
    ['installMin', 'Installation floor (₹)', true],
    ['amcQuotePercent', 'AMC, % of hardware', false],
    ['amcMinPercent', 'AMC floor, %', true],
  ];
  return (
    <form onSubmit={save} className="grid max-w-xl gap-3 sm:grid-cols-2">
      {fields.map(([k, text, floor]) => (
        <label key={k}>
          <span className={`mb-1 block text-xs ${floor ? 'text-amber-200/80' : 'text-muted'}`}>{text}</span>
          <input name={k} type="number" step="any" min={0} defaultValue={settings[k] ?? ''} className="field !py-2 text-sm" />
        </label>
      ))}
      <div className="flex items-center gap-3 sm:col-span-2">
        <button className="btn btn-primary !py-2">Save</button>
        {msg && <span className="text-sm text-muted">{msg}</span>}
      </div>
    </form>
  );
}

