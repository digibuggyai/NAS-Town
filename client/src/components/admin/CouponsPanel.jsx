import { useEffect, useMemo, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { api, formatInr } from '../../lib/api.js';

/* Admin → Coupons: which customer has which code, from the configurator popups.
 * One row per customer (one code per email). Quote and message show N/A when not given. */

const NA = <span className="text-subtle">N/A</span>;
const when = (iso) => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

export default function CouponsPanel() {
  const [state, setState] = useState({ rows: null, error: null });
  const [q, setQ] = useState('');

  useEffect(() => {
    api.coupons().then((rows) => setState({ rows, error: null })).catch((error) => setState({ rows: null, error }));
  }, []);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle || !state.rows) return state.rows;
    return state.rows.filter((c) => [c.code, c.name, c.company, c.email, c.phone].some((v) => v?.toLowerCase().includes(needle)));
  }, [state.rows, q]);

  if (state.error) return <p className="text-error">{state.error.message}</p>;
  if (!rows) return <Loader2 className="size-5 animate-spin text-muted" />;

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Coupons</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Codes issued by the configurator popups: one per customer, {formatInr(2000)} off their quotation. Each request also appears in Leads.
          </p>
        </div>
        <label className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Code, name, email or phone"
            aria-label="Search coupons"
            className="field !py-2 !pl-9 text-sm"
          />
        </label>
      </div>

      <p className="mt-6 text-sm text-muted">{rows.length} of {state.rows.length} {state.rows.length === 1 ? 'coupon' : 'coupons'}</p>
      <div className="mt-2 overflow-x-auto rounded-lg ring-1 ring-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs text-muted">
            <tr>{['Code', 'Customer', 'Contact', 'Quote', 'Message', 'Issued'].map((h) => <th key={h} className="px-4 py-3 font-normal whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t border-line align-top">
                <td className="px-4 py-3">
                  <span className="font-mono font-semibold tracking-wider whitespace-nowrap">{c.code}</span>
                  <span className="block text-xs text-subtle">{formatInr(c.valueInr)} off</span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium whitespace-nowrap">{c.name || NA}</span>
                  <span className="block text-xs text-muted">{c.company || NA}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <a href={`mailto:${c.email}`} className="link">{c.email}</a>
                  <span className="block text-xs">{c.phone ? <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="link">{c.phone}</a> : NA}</span>
                </td>
                <td className="min-w-48 px-4 py-3">
                  {c.quoteTotal ? (
                    <>
                      <span className="font-medium whitespace-nowrap">{formatInr(c.quoteTotal)}</span>
                      <span className="block text-xs text-subtle whitespace-nowrap">{formatInr(Math.max(0, c.quoteTotal - c.valueInr))} with coupon</span>
                      {c.quoteSummary && (
                        <details className="mt-1">
                          <summary className="cursor-pointer text-xs text-accent">Configuration</summary>
                          <pre className="mt-2 rounded-lg bg-surface p-2.5 font-sans text-xs leading-relaxed whitespace-pre-wrap">{c.quoteSummary}</pre>
                        </details>
                      )}
                    </>
                  ) : NA}
                </td>
                <td className="max-w-xs px-4 py-3 whitespace-pre-wrap">{c.message || NA}</td>
                <td className="px-4 py-3 whitespace-nowrap text-muted">
                  {when(c.createdAt)}
                  <span className="block text-xs text-subtle">{c.source === 'quote' ? 'Quote popup' : 'Help popup'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-4 text-muted">{state.rows.length ? 'No coupons match that search.' : 'No coupons issued yet.'}</p>}
      </div>
    </section>
  );
}
