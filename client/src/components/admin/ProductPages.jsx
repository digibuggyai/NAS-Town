import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ExternalLink, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { api, formatInr } from '../../lib/api.js';
import { ItemEditor } from './CatalogueTable.jsx';

/* Which product is listed on which page. One row per NAS model, one column per page;
 * every tick saves immediately and is recorded in the change log. "On site" hides the
 * model everywhere (including its own page), and "Rent" is the model's rentable flag. */

const short = (label) => label.replace(/^For /, '');

export default function ProductPages() {
  const [state, setState] = useState({ models: null, pages: [], schema: null, error: null });
  const [editing, setEditing] = useState(null); // a model, or {} to add one
  const [saving, setSaving] = useState(null);
  const [msg, setMsg] = useState('');

  const load = useCallback(() => api.catalogue()
    .then(({ models, pages, schema }) => setState({ models, pages, schema: schema.models, error: null }))
    .catch((error) => setState({ models: null, pages: [], schema: null, error })), []);
  useEffect(() => { load(); }, [load]);

  const { models, pages, schema, error } = state;
  if (error) return <p className="text-error">{error.message}</p>;
  if (!models) return <Loader2 className="size-5 animate-spin text-muted" />;

  const listing = pages.filter((p) => !p.key.startsWith('solution:'));
  const solutions = pages.filter((p) => p.key.startsWith('solution:'));
  const columns = [
    { key: 'active', label: 'On site', has: (m) => m.active !== false, patch: (m, on) => ({ active: on }) },
    ...listing.map((p) => pageColumn(p)),
    { key: 'rent', label: 'Rent', path: '/rent', has: (m) => Boolean(m.rentable), patch: (m, on) => ({ rentable: on }) },
    ...solutions.map((p) => pageColumn(p)),
  ];

  async function toggle(m, col) {
    const on = !col.has(m);
    const id = `${m.id}:${col.key}`;
    setSaving(id);
    setMsg('');
    try {
      const updated = await api.updateItem('models', m.id, col.patch(m, on));
      setState((s) => ({ ...s, models: s.models.map((x) => (x.id === m.id ? updated : x)) }));
    } catch (err) {
      setMsg(`${m.brand} ${m.model}: ${err.message}`);
    } finally {
      setSaving(null);
    }
  }

  async function remove(m) {
    const name = `${m.brand} ${m.model}`;
    if (!window.confirm(`Delete ${name} permanently?\n\nIt disappears from every page, the configurator and quotes. To take it down for now, untick "On site" instead.`)) return;
    setSaving(`${m.id}:delete`);
    setMsg('');
    try {
      await api.deleteItem('models', m.id);
      setState((s) => ({ ...s, models: s.models.filter((x) => x.id !== m.id) }));
      setMsg(`Deleted ${name}.`);
    } catch (err) {
      setMsg(`${name}: ${err.message}`);
    } finally {
      setSaving(null);
    }
  }

  function saved(m) {
    if (!editing?.id) setMsg(`Added ${m.brand} ${m.model}. It's on NAS Products and its brand page; tick any other pages below.`);
    load();
  }

  const count = (col) => models.filter((m) => m.active !== false && col.has(m)).length;

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Product pages</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted">
            Add, edit or remove products, and tick where each NAS is listed. Changes go live immediately and are recorded in the change log.
            Prices and floors can also be edited in <Link to="/admin" className="link">Pricing</Link>.
          </p>
        </div>
        <button onClick={() => { setMsg(''); setEditing({}); }} className="btn btn-primary !px-4 !py-2 !text-xs">
          <Plus className="size-3.5" /> Add product
        </button>
      </div>
      {msg && <p role="status" className="mt-4 text-sm text-muted">{msg}</p>}

      <div className="mt-6 overflow-x-auto rounded-lg ring-1 ring-line">
        <table className="w-full text-sm">
          <thead className="bg-surface text-xs text-muted">
            <tr>
              <th rowSpan={2} className="sticky left-0 z-10 bg-surface px-4 py-3 text-left font-normal">Product</th>
              <th colSpan={columns.length - solutions.length} className="border-l border-line px-2 pt-3 pb-1 font-medium text-fg">Listing pages</th>
              <th colSpan={solutions.length} className="border-l border-line px-2 pt-3 pb-1 font-medium text-fg">Solution pages</th>
            </tr>
            <tr>
              {columns.map((c, i) => (
                <th key={c.key} className={`px-2 pb-3 font-normal whitespace-nowrap ${i === 0 || i === columns.length - solutions.length ? 'border-l border-line' : ''}`}>
                  {c.path && c.key !== 'brand' ? (
                    <a href={c.path} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-fg">
                      {c.label} <ExternalLink className="size-3" aria-hidden />
                    </a>
                  ) : c.label}
                  <span className="block text-subtle">{count(c)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {models.map((m) => {
              const live = m.active !== false;
              return (
                <tr key={m.id} className="border-t border-line">
                  <th scope="row" className="sticky left-0 z-10 bg-raised py-2.5 pr-2 pl-4 text-left font-normal whitespace-nowrap">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className={live ? 'font-medium' : 'font-medium text-subtle line-through'}>{m.brand} {m.model}</span>
                        <span className="block text-xs text-subtle">{m.bays}-bay · {formatInr(m.quotePrice)}{!live && ' · hidden from site'}</span>
                      </div>
                      <div className="flex">
                        <button onClick={() => { setMsg(''); setEditing(m); }} disabled={saving != null} aria-label={`Edit ${m.brand} ${m.model}`} className="rounded-full p-2 text-muted hover:bg-surface hover:text-fg">
                          <Pencil className="size-3.5" />
                        </button>
                        <button onClick={() => remove(m)} disabled={saving != null} aria-label={`Delete ${m.brand} ${m.model}`} className="rounded-full p-2 text-subtle hover:bg-error/10 hover:text-error">
                          {saving === `${m.id}:delete` ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                        </button>
                      </div>
                    </div>
                  </th>
                  {columns.map((c, i) => {
                    const id = `${m.id}:${c.key}`;
                    return (
                      <td key={c.key} className={`px-2 py-2.5 text-center ${i === 0 || i === columns.length - solutions.length ? 'border-l border-line' : ''} ${!live && c.key !== 'active' ? 'opacity-40' : ''}`}>
                        {saving === id ? (
                          <Loader2 className="mx-auto size-4 animate-spin text-muted" />
                        ) : (
                          <input
                            type="checkbox"
                            checked={c.has(m)}
                            disabled={saving != null}
                            onChange={() => toggle(m, c)}
                            aria-label={`${m.brand} ${m.model} on ${c.key === 'brand' ? `the ${m.brand} brand page` : c.label}`}
                            className="size-4 cursor-pointer accent-accent"
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-subtle">
        Counts are live products only. Brand page = the page for that product's own brand. On every page, products are sorted by bay count, then price.
      </p>
      {schema && <ItemEditor collection="models" schema={schema} editing={editing} onClose={() => setEditing(null)} onSaved={saved} />}
    </section>
  );
}

function pageColumn(p) {
  return {
    key: p.key,
    label: p.key === 'brand' ? 'Brand page' : short(p.label),
    path: p.path,
    has: (m) => (m.pages ?? []).includes(p.key),
    patch: (m, on) => ({ pages: on ? [...(m.pages ?? []), p.key] : (m.pages ?? []).filter((k) => k !== p.key) }),
  };
}
