import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ExternalLink, Loader2 } from 'lucide-react';
import { api, formatInr } from '../../lib/api.js';

/* Which product is listed on which page. One row per NAS model, one column per page;
 * every tick saves immediately and is recorded in the change log. "On site" hides the
 * model everywhere (including its own page), and "Rent" is the model's rentable flag. */

const short = (label) => label.replace(/^For /, '');

export default function ProductPages() {
  const [state, setState] = useState({ models: null, pages: [], error: null });
  const [saving, setSaving] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.catalogue()
      .then(({ models, pages }) => setState({ models, pages, error: null }))
      .catch((error) => setState({ models: null, pages: [], error }));
  }, []);

  const { models, pages, error } = state;
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

  const count = (col) => models.filter((m) => m.active !== false && col.has(m)).length;

  return (
    <section>
      <h1 className="text-2xl font-medium tracking-tight">Product pages</h1>
      <p className="mt-1 max-w-3xl text-sm text-muted">
        Tick where each NAS is listed. Changes go live immediately and are recorded in the change log.
        To add a new product or remove one for good, use <Link to="/admin" className="link">Pricing → NAS models</Link>.
      </p>
      {msg && <p role="alert" className="mt-4 text-sm text-error">{msg}</p>}

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
                  <th scope="row" className="sticky left-0 z-10 bg-raised px-4 py-2.5 text-left font-normal whitespace-nowrap">
                    <span className={live ? 'font-medium' : 'font-medium text-subtle line-through'}>{m.brand} {m.model}</span>
                    <span className="block text-xs text-subtle">{m.bays}-bay · {formatInr(m.quotePrice)}{!live && ' · hidden from site'}</span>
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
