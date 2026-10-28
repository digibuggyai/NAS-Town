import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { inr, RAID_LEVELS } from '../../lib/nas/logic.js';
import { Dialog } from '../configurator/parts.jsx';

const COLUMNS = {
  models: ['model', 'brand', 'bays', 'quotePrice', 'minPrice', 'featured', 'rentable'],
  drives: ['drive', 'partNumber', 'quotePrice', 'minPrice'], // 'drive' = name + specs, see DriveCell
  driveLines: ['name', 'brand', 'driveClass', 'workloadTbYear', 'warrantyYears'],
  upgrades: ['sku', 'category', 'name', 'quotePrice', 'minPrice'],
};

const LABELS = {
  quotePrice: 'Quote ₹', minPrice: 'Floor ₹', capacityTb: 'Capacity (TB)', partNumber: 'Part number', rpm: 'RPM', cache: 'Cache', drive: 'Drive', m2Slots: 'M.2 slots', maxDriveTb: 'Max drive TB',
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

/** A price in the table that edits in place: click, type, Enter (or click away) saves, Esc cancels.
 * An empty floor shows as "Set floor" so missing floors stand out. Saves go through the same
 * admin API as the edit form, so every change lands in the change log. */
function MoneyCell({ k, row, collection, onChanged }) {
  const [draft, setDraft] = useState(null); // null = not editing
  const [busy, setBusy] = useState(false);
  const floor = k === 'minPrice';

  async function save() {
    const text = String(draft ?? '').replace(/[^\d]/g, '');
    const value = text === '' ? null : Number(text);
    setDraft(null);
    if (value === (row[k] ?? null)) return;
    if (!floor && value == null) return alert('A quote price is required.');
    if (floor && value != null && row.quotePrice != null && value > row.quotePrice
      && !confirm(`The floor (${inr(value)}) is higher than the quote (${inr(row.quotePrice)}). Save anyway?`)) return;
    setBusy(true);
    try { await api.updateItem(collection, row.id, { [k]: value }); onChanged(); } catch (e) { alert(e.message); }
    setBusy(false);
  }

  if (draft != null) {
    return (
      <input
        autoFocus
        inputMode="numeric"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') setDraft(null); }}
        aria-label={label(k)}
        className="field !w-28 !py-1 !text-sm"
      />
    );
  }
  const value = row[k];
  return (
    <button
      type="button"
      onClick={() => setDraft(value ?? '')}
      disabled={busy}
      title="Click to edit"
      className={`rounded-md px-1.5 py-0.5 -mx-1.5 hover:bg-surface ${floor ? 'text-warning' : ''} ${busy ? 'opacity-50' : ''}`}
    >
      {value != null ? inr(value) : floor ? <span className="rounded-full border border-dashed border-warning/60 px-2 py-0.5 text-xs">Set floor</span> : <span className="text-subtle">—</span>}
    </button>
  );
}

/** A drive row: full name plus the specs that identify it. Exact per-drive RPM/cache win
 * over the line's ranges from Drive specs. */
function DriveCell({ row, line }) {
  if (!line) {
    return (
      <>
        <span className="font-medium">{row.line} {row.capacityTb} TB</span>
        <span className="block text-xs text-warning">No specs: add "{row.line}" in the Drive specs tab</span>
      </>
    );
  }
  const rpm = row.rpm || line.rpm;
  const cache = row.cache || line.cache;
  const specs = [
    line.driveClass && `${line.driveClass} drive`,
    rpm && `${rpm} rpm`,
    cache && `${cache} cache`,
    line.recording,
    line.workloadTbYear,
    line.warrantyYears && `${line.warrantyYears}-year warranty`,
  ].filter(Boolean);
  return (
    <>
      <span className="font-medium">{line.brand && <span className="font-normal text-muted">{line.brand} · </span>}{row.line} {row.capacityTb} TB</span>
      <span className="block text-xs whitespace-normal text-subtle">{specs.join(' · ')}</span>
    </>
  );
}

export default function CatalogueTable({ collection, rows, schema, onChanged, lines = [] }) {
  const [editing, setEditing] = useState(null); // row, or {} for new
  const cols = COLUMNS[collection];
  const hasActive = 'active' in schema.fields;
  const missingFloors = rows.filter((r) => r.minPrice == null && (!hasActive || r.active)).length;

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

  return (
    <div>
      {cols.includes('minPrice') && missingFloors > 0 && (
        <p className="mb-3 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
          {missingFloors} of {rows.length} items have no floor price. Click "Set floor" in the table to add one.
        </p>
      )}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted">{rows.length} items{hasActive ? ` · ${rows.filter((r) => r.active).length} in the configurator` : ''}</p>
        <button onClick={() => { setEditing({}); }} className="btn btn-primary !px-4 !py-2 !text-xs"><Plus className="size-3.5" /> Add</button>
      </div>
      <div className="overflow-x-auto rounded-lg ring-1 ring-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs text-muted">
            <tr>
              {cols.map((k) => (
                <th key={k} className={`px-4 py-3 font-normal whitespace-nowrap ${k === 'minPrice' ? 'text-warning' : ''}`}>{label(k)}</th>
              ))}
              {hasActive && <th className="px-4 py-3 font-normal whitespace-nowrap">In configurator</th>}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={`border-t border-line ${hasActive && !r.active ? 'opacity-50' : ''}`}>
                {cols.map((k) => (
                  <td key={k} className={`px-4 py-2.5 whitespace-nowrap ${k === 'minPrice' ? 'text-warning' : ''} ${k === 'drive' ? 'min-w-72' : ''}`}>
                    {k === 'drive' ? <DriveCell row={r} line={lines.find((l) => l.name === r.line)} />
                      : isMoney(k) ? <MoneyCell k={k} row={r} collection={collection} onChanged={onChanged} />
                      : cell(k, r[k])}
                  </td>
                ))}
                {hasActive && (
                  <td className="px-4 py-2.5">
                    <button onClick={() => toggleActive(r)} role="switch" aria-checked={r.active} aria-label="In configurator" className={`relative h-5 w-9 rounded-full transition-colors ${r.active ? 'bg-fg' : 'bg-line-strong'}`}>
                      <span className={`absolute top-0.5 size-4 rounded-full transition-all ${r.active ? 'left-4.5 bg-bg' : 'left-0.5 bg-raised'}`} />
                    </button>
                  </td>
                )}
                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                  <button onClick={() => { setEditing(r); }} aria-label="Edit" className="rounded-full p-2 text-muted hover:bg-surface hover:text-fg"><Pencil className="size-3.5" /></button>
                  <button onClick={() => remove(r)} aria-label="Delete" className="rounded-full p-2 text-subtle hover:bg-error/10 hover:text-error"><Trash2 className="size-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ItemEditor collection={collection} schema={schema} editing={editing} onClose={() => setEditing(null)} onSaved={onChanged} lines={lines} />
    </div>
  );
}

/** Add/edit form for one catalogue item. Shared by the price manager and Product pages. */
export function ItemEditor({ collection, schema, editing, onClose, onSaved, lines = [] }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { setError(''); }, [editing]);

  async function save(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {};
    for (const [k, type] of Object.entries(schema.fields)) {
      if (k === 'active' || k === 'pages') continue; // pages are managed in Product pages
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
      const saved = editing.id
        ? (Object.keys(changes).length ? await api.updateItem(collection, editing.id, changes) : editing)
        : await api.createItem(collection, changes);
      onClose();
      onSaved(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={editing != null} onClose={onClose} title={editing?.id ? `Edit ${schema.label.toLowerCase()}` : `Add to ${schema.label.toLowerCase()}`}>
      {editing && (
        <form onSubmit={save} className="grid gap-3 pb-2 sm:grid-cols-2">
          {Object.entries(schema.fields).filter(([k]) => k !== 'active' && k !== 'pages').map(([k, type]) => {
            const required = schema.required.includes(k);
            if (k === 'raid') {
              return (
                <fieldset key={k} className="sm:col-span-2">
                  <legend className="mb-1.5 text-xs text-muted">RAID levels supported</legend>
                  <div className="flex flex-wrap gap-3 text-sm">
                    {RAID_LEVELS.map((r) => (
                      <label key={r} className="flex items-center gap-1.5">
                        <input type="checkbox" name="raid" value={r} defaultChecked={editing.raid?.includes(r)} className="accent-fg" /> {r.replace('RAID', 'RAID ')}
                      </label>
                    ))}
                  </div>
                </fieldset>
              );
            }
            if (type === 'bool') {
              return (
                <label key={k} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name={k} defaultChecked={Boolean(editing[k])} className="accent-fg" /> {label(k)}
                </label>
              );
            }
            // A drive's line must match a row in Drive specs, so pick it from a list.
            if (collection === 'drives' && k === 'line' && lines.length) {
              const names = lines.map((l) => l.name);
              if (editing.line && !names.includes(editing.line)) names.push(editing.line);
              return (
                <label key={k}>
                  <span className="mb-1 block text-xs text-muted">Line *</span>
                  <select name={k} required defaultValue={editing.line ?? ''} className="field !py-2 text-sm">
                    <option value="" disabled>Choose a drive line</option>
                    {names.map((n) => {
                      const l = lines.find((x) => x.name === n);
                      return <option key={n} value={n}>{l?.brand && !n.startsWith(l.brand) ? `${l.brand} ${n}` : n}</option>;
                    })}
                  </select>
                </label>
              );
            }
            const hint = collection === 'drives' && {
              partNumber: 'Model number on the drive label / invoice, e.g. ST4000VN006',
              rpm: 'For this capacity, e.g. 5,400 (blank = the line’s range)',
              cache: 'For this capacity, e.g. 256 MB (blank = the line’s range)',
            }[k];
            const wide = ['summary', 'specsUrl', 'extras', 'bestFor', 'network', 'networkUpgrade', 'partNumber'].includes(k);
            return (
              <label key={k} className={wide ? 'sm:col-span-2' : ''}>
                <span className={`mb-1 block text-xs ${k === 'minPrice' ? 'text-warning' : 'text-muted'}`}>
                  {label(k)}{required ? ' *' : ''}{k === 'minPrice' ? ' (internal, never shown publicly)' : ''}
                </span>
                <input
                  name={k}
                  type={type === 'int' || type === 'num' ? 'number' : 'text'}
                  step={type === 'num' ? 'any' : 1}
                  min={type === 'int' || type === 'num' ? 0 : undefined}
                  required={required}
                  defaultValue={editing[k] ?? ''}
                  placeholder={hint || undefined}
                  className="field !py-2 text-sm"
                />
              </label>
            );
          })}
          {error && <p role="alert" className="text-sm text-error sm:col-span-2">{error}</p>}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button type="button" onClick={onClose} className="btn btn-secondary !py-2">Cancel</button>
            <button disabled={busy} className="btn btn-primary !py-2">{busy ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      )}
    </Dialog>
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
          <span className={`mb-1 block text-xs ${floor ? 'text-warning' : 'text-muted'}`}>{text}</span>
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

