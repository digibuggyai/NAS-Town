import { useEffect, useMemo, useState } from 'react';
import { Check, Loader2, Search, Trash2, X } from 'lucide-react';
import { api, formatInr } from '../../lib/api.js';

/* Admin → Coupons: which customer has which code, from the configurator popups.
 * One row per customer (one code per email). Quote and message show N/A when not given.
 * Staff mark each one "Deal done" or "Not interested" (click again to reopen); admins can
 * delete. Every status change and delete is recorded in the change log. */

const NA = <span className="text-subtle">N/A</span>;
const when = (iso) => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

const VIEWS = [['all', 'All'], ['issued', 'Open'], ['deal_done', 'Deal done'], ['not_interested', 'Not interested']];

export default function CouponsPanel({ canDelete }) {
  const [state, setState] = useState({ rows: null, error: null });
  const [q, setQ] = useState('');
  const [view, setView] = useState('all');
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.coupons().then((rows) => setState({ rows, error: null })).catch((error) => setState({ rows: null, error }));
  }, []);

  const rows = useMemo(() => {
    if (!state.rows) return null;
    const needle = q.trim().toLowerCase();
    return state.rows.filter((c) =>
      (view === 'all' || c.status === view) &&
      (!needle || [c.code, c.name, c.company, c.email, c.phone].some((v) => v?.toLowerCase().includes(needle))));
  }, [state.rows, q, view]);

  // Clicking the active outcome again sets the coupon back to Open.
  async function setStatus(c, status) {
    const next = c.status === status ? 'issued' : status;
    setBusy(c.id);
    setMsg('');
    try {
      const updated = await api.setCouponStatus(c.id, next);
      setState((s) => ({ ...s, rows: s.rows.map((x) => (x.id === c.id ? updated : x)) }));
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(null);
    }
  }

  async function remove(c) {
    if (!window.confirm(`Delete coupon ${c.code} (${c.name || c.email})?\n\nA copy is kept in the change log. If this customer asks again, they get a new code.`)) return;
    setBusy(c.id);
    setMsg('');
    try {
      await api.deleteCoupon(c.id);
      setState((s) => ({ ...s, rows: s.rows.filter((x) => x.id !== c.id) }));
      setMsg(`Deleted ${c.code}.`);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(null);
    }
  }

  if (state.error) return <p className="text-error">{state.error.message}</p>;
  if (!rows) return <Loader2 className="size-5 animate-spin text-muted" />;
  const count = (k) => (k === 'all' ? state.rows.length : state.rows.filter((c) => c.status === k).length);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Coupons</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Codes issued by the configurator popups: one per customer, {formatInr(2000)} off their quotation. Each request also appears in Leads;
            status changes and deletions are recorded in the change log.
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

      <div className="mt-6 flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
        {VIEWS.map(([k, label]) => (
          <button key={k} onClick={() => setView(k)} aria-pressed={view === k} className="chip !py-1.5 !text-xs">
            {label} <span className="opacity-60">{count(k)}</span>
          </button>
        ))}
      </div>
      {msg && <p role="status" className="mt-3 text-sm text-muted">{msg}</p>}

      <div className="mt-4 overflow-x-auto rounded-lg ring-1 ring-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs text-muted">
            <tr>{['Code', 'Customer', 'Contact', 'Quote', 'Message', 'Issued', 'Outcome'].map((h) => <th key={h} className="px-4 py-3 font-normal whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className={`border-t border-line align-top ${c.status === 'not_interested' ? 'opacity-60' : ''}`}>
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
                <td className="min-w-44 px-4 py-3">
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
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <OutcomeButton active={c.status === 'deal_done'} disabled={busy != null} onClick={() => setStatus(c, 'deal_done')} tone="success" icon={Check}>
                      Deal done
                    </OutcomeButton>
                    <OutcomeButton active={c.status === 'not_interested'} disabled={busy != null} onClick={() => setStatus(c, 'not_interested')} tone="muted" icon={X}>
                      Not interested
                    </OutcomeButton>
                    {canDelete && (
                      <button
                        onClick={() => remove(c)}
                        disabled={busy != null}
                        aria-label={`Delete coupon ${c.code}`}
                        title="Delete"
                        className="rounded-full p-2 text-subtle transition-colors hover:bg-error/10 hover:text-error disabled:opacity-40"
                      >
                        {busy === c.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-4 text-muted">{state.rows.length ? 'No coupons match.' : 'No coupons issued yet.'}</p>}
      </div>
    </section>
  );
}

/** A tick-style toggle: outlined when off, filled when it's the coupon's outcome. */
function OutcomeButton({ active, disabled, onClick, tone, icon: Icon, children }) {
  const on = tone === 'success' ? 'bg-success text-white ring-success' : 'bg-fg text-bg ring-fg';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs whitespace-nowrap ring-1 transition-colors disabled:opacity-50 ${
        active ? on : 'text-muted ring-line hover:bg-surface hover:text-fg'
      }`}
    >
      <Icon className="size-3.5" strokeWidth={2.5} /> {children}
    </button>
  );
}
