import { useCallback, useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useSearchParams } from 'react-router';
import { Download, Eye, EyeOff, Loader2, LogOut, Trash2 } from 'lucide-react';
import { Logo } from '../../components/Navbar.jsx';
import CatalogueTable, { SettingsForm } from '../../components/admin/CatalogueTable.jsx';
import Configurator from '../../components/configurator/Configurator.jsx';
import BlogManager from '../../components/admin/BlogManager.jsx';
import ReviewsManager from '../../components/admin/ReviewsManager.jsx';
import ProductPages from '../../components/admin/ProductPages.jsx';
import CouponsPanel from '../../components/admin/CouponsPanel.jsx';
import { api } from '../../lib/api.js';
import { useAuth } from '../../lib/useAuth.js';
import Seo from '../../components/Seo.jsx';

/* Staff area. Nothing here is linked from the public site, and every API call it
 * makes is role-checked on the server; the UI only decides what to draw. */

export default function AdminApp() {
  const auth = useAuth();

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <Seo title="Staff | NASTOWN" description="NASTOWN staff area." noindex />
      {auth.loading ? (
        <div className="grid min-h-screen place-items-center"><Loader2 className="size-6 animate-spin text-muted" /></div>
      ) : !auth.user ? (
        <Login onLogin={auth.login} expired={auth.expired} />
      ) : (
        <Shell user={auth.user} onLogout={auth.logout} />
      )}
    </>
  );
}

function Login({ onLogin, expired }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  async function submit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    try { await onLogin(f.get('email'), f.get('password')); } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <form onSubmit={submit} className="glass w-full max-w-sm rounded-xl p-7">
        <Logo />
        <h1 className="mt-6 text-xl font-medium">Staff sign in</h1>
        <p className="mt-1 text-sm text-muted">Price manager and sales configurator.</p>
        {expired && !error && <p role="status" className="mt-4 rounded-lg bg-surface px-3 py-2 text-sm text-muted">Your session ended. Please sign in again.</p>}
        <label className="mt-6 block">
          <span className="mb-1.5 block text-sm text-muted">Email</span>
          <input name="email" type="email" required autoComplete="username" className="field" />
        </label>
        <label className="mt-3 block">
          <span className="mb-1.5 block text-sm text-muted">Password</span>
          <span className="relative block">
            <input name="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" className="field pr-11" />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-subtle transition-colors hover:bg-surface hover:text-fg"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </span>
        </label>
        {error && <p role="alert" className="mt-3 text-sm text-error">{error}</p>}
        <button disabled={busy} className="btn btn-primary mt-6 w-full">{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}

// What each staff role can open. The server enforces the same rules on every request.
const ROLE_INFO = {
  admin: { label: 'Admin', help: 'Everything: prices, products, leads, blog, users.' },
  sales: { label: 'Sales admin', help: 'Sales configurator (with floor prices) and leads.' },
  blog: { label: 'Blog admin', help: 'The blog only: write, edit, publish and delete posts.' },
};

function Shell({ user, onLogout }) {
  const admin = user.role === 'admin';
  const sales = admin || user.role === 'sales';
  const blog = admin || user.role === 'blog';
  const home = admin ? null : sales ? '/admin/configurator' : '/admin/blog';
  const tabs = [
    admin && ['Pricing', '/admin'],
    admin && ['Product pages', '/admin/pages'],
    sales && ['Sales configurator', '/admin/configurator'],
    sales && ['Leads', '/admin/leads'],
    sales && ['Coupons', '/admin/coupons'],
    admin && ['Change log', '/admin/log'],
    blog && ['Blog', '/admin/blog'],
    admin && ['Reviews', '/admin/reviews'],
    admin && ['Users', '/admin/users'],
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <header className="glass flex flex-wrap items-center justify-between gap-4 rounded-full py-2 pr-2 pl-5">
        <div className="flex items-center gap-4">
          <Logo />
          <span className="hidden rounded-full bg-surface px-2.5 py-1 text-xs tracking-wide text-muted uppercase sm:inline">Staff · {ROLE_INFO[user.role]?.label ?? user.role}</span>
        </div>
        <nav className="order-3 flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto">
          {tabs.map(([label, to]) => (
            <NavLink key={to} to={to} end className={({ isActive }) => `rounded-full px-3 py-1.5 text-[0.8rem] whitespace-nowrap transition-colors ${isActive ? 'bg-fg text-bg' : 'text-muted hover:bg-surface hover:text-fg'}`}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={onLogout} className="btn btn-secondary !p-2" aria-label={`Sign out (${user.email})`} title={`Signed in as ${user.email}. Sign out`}><LogOut className="size-4" /></button>
        </div>
      </header>

      <main className="mt-8">
        <Routes>
          <Route index element={admin ? <Pricing /> : <Navigate to={home} replace />} />
          {sales && <Route path="configurator" element={<SalesConfigurator />} />}
          {sales && <Route path="leads" element={<Leads canDelete={admin} />} />}
          {sales && <Route path="coupons" element={<CouponsPanel canDelete={admin} />} />}
          {admin && <Route path="pages" element={<ProductPages />} />}
          {admin && <Route path="log" element={<ChangeLog />} />}
          {blog && <Route path="blog" element={<BlogManager />} />}
          {admin && <Route path="reviews" element={<ReviewsManager />} />}
          {admin && <Route path="users" element={<Users me={user} />} />}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function useLoad(fn) {
  const [state, setState] = useState({ data: null, error: null });
  const load = useCallback(() => {
    fn().then((data) => setState({ data, error: null })).catch((error) => setState({ data: null, error }));
  }, [fn]);
  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}

const PRICING_TABS = [['models', 'NAS models'], ['drives', 'Drives'], ['driveLines', 'Drive specs'], ['upgrades', 'Upgrades'], ['settings', 'Installation & AMC']];

function Pricing() {
  const { data, error, reload } = useLoad(api.catalogue);
  const [tab, setTab] = useState('models');
  if (error) return <p className="text-error">{error.message}</p>;
  if (!data) return <Loader2 className="size-5 animate-spin text-muted" />;
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Price manager</h1>
          <p className="mt-1 text-sm text-muted">All prices GST inclusive. Floors (amber) are internal and never reach the public site. Changes go live immediately.</p>
        </div>
        <button onClick={() => api.downloadPriceSheet().catch((e) => alert(e.message))} className="btn btn-secondary !py-2 !text-xs">
          <Download className="size-3.5" /> Price sheet (internal CSV)
        </button>
      </div>
      <div className="mt-6 flex flex-wrap gap-1.5">
        {PRICING_TABS.map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} aria-pressed={tab === k} className="chip !py-1.5 !text-xs">{label}</button>
        ))}
      </div>
      <div className="glass mt-4 rounded-xl p-4 sm:p-5">
        {tab === 'settings' ? (
          <SettingsForm settings={data.settings} onChanged={reload} />
        ) : (
          <CatalogueTable key={tab} collection={tab} rows={data[tab]} schema={data.schema[tab]} onChanged={reload} lines={data.driveLines} />
        )}
      </div>
    </section>
  );
}

function SalesConfigurator() {
  return (
    <section>
      <h1 className="text-2xl font-medium tracking-tight">Sales configurator</h1>
      <p className="mt-1 mb-6 text-sm text-muted">The public configurator with the floor beside every line. Don't screen-share the floor column with customers.</p>
      <Configurator source="sales" />
    </section>
  );
}

function Leads({ canDelete }) {
  const { data, error, reload } = useLoad(api.enquiries);
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState('');
  async function remove(e) {
    if (!window.confirm(`Delete the ${e.type} lead from ${e.name}? A copy is kept in the change log.`)) return;
    setBusy(e.id);
    setMsg('');
    try {
      await api.deleteEnquiry(e.id);
      setMsg(`Deleted ${e.name}'s lead.`);
      reload();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(null);
    }
  }
  if (error) return <p className="text-error">{error.message}</p>;
  if (!data) return <Loader2 className="size-5 animate-spin text-muted" />;
  return (
    <section>
      <h1 className="text-2xl font-medium tracking-tight">Leads</h1>
      <p className="mt-1 text-sm text-muted">
        Every form on the site, newest first.
        {canDelete && <> Deleted leads are recorded in the <NavLink to="/admin/log?view=leads" className="link">change log</NavLink>.</>}
      </p>
      {msg && <p role="status" className="mt-4 text-sm text-muted">{msg}</p>}
      <div className="mt-6 grid gap-3">
        {data.length === 0 && <p className="text-muted">No leads yet.</p>}
        {data.map((e) => (
          <details key={e.id} className="glass rounded-lg">
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-1 p-4 text-sm">
              <span className="rounded-full bg-surface px-2 py-0.5 text-xs capitalize">{e.type}</span>
              <span className="font-medium">{e.name}</span>
              <span className="text-muted">{e.email || e.phone}</span>
              <span className="ml-auto text-xs text-subtle">{new Date(e.createdAt).toLocaleString('en-IN')}</span>
            </summary>
            <div className="border-t border-line p-4 text-sm">
              {e.phone && <p className="text-muted">Phone: {e.phone}</p>}
              {e.message && <p className="mt-2 whitespace-pre-wrap">{e.message}</p>}
              {e.payload?.summary && <pre className="mt-3 overflow-x-auto rounded-xl bg-surface p-3 font-mono text-xs whitespace-pre-wrap">{e.payload.summary}</pre>}
              {canDelete && (
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => remove(e)}
                    disabled={busy === e.id}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs text-error ring-1 ring-line transition-colors hover:bg-error/10 disabled:opacity-50"
                  >
                    <Trash2 className="size-3.5" /> {busy === e.id ? 'Deleting…' : 'Delete lead'}
                  </button>
                </div>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

// Each filter is one or more log areas, filtered on the server so older entries are reachable too.
const LOG_VIEWS = [
  ['all', 'All changes', null],
  ['catalogue', 'Prices & products', 'models,drives,driveLines,upgrades,settings,exports'],
  ['leads', 'Leads', 'leads'],
  ['coupons', 'Coupons', 'coupons'],
  ['reviews', 'Reviews', 'reviews'],
  ['blog', 'Blog', 'blog'],
  ['users', 'Users & sign-ins', 'users,sign-ins'],
];

/* The change log is permanent: the database refuses to edit or delete any entry (schema.sql),
 * so this page has no delete either. Pages of 200, newest first; "Load older" goes back to the start. */
function ChangeLog() {
  const [params, setParams] = useSearchParams();
  const view = LOG_VIEWS.find(([k]) => k === params.get('view')) ?? LOG_VIEWS[0];
  const [state, setState] = useState({ entries: null, more: false, error: null, loading: false });

  const load = useCallback(async (before) => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const page = await api.changeLog({ before, areas: view[2] });
      setState((s) => ({ entries: before ? [...(s.entries ?? []), ...page.entries] : page.entries, more: page.more, error: null, loading: false }));
    } catch (error) {
      setState((s) => ({ ...s, error, loading: false }));
    }
  }, [view]);
  useEffect(() => { setState({ entries: null, more: false, error: null, loading: false }); load(null); }, [load]);

  const { entries, more, error, loading } = state;
  if (error) return <p className="text-error">{error.message}</p>;
  return (
    <section>
      <h1 className="text-2xl font-medium tracking-tight">Change log</h1>
      <p className="mt-1 max-w-3xl text-sm text-muted">
        Every change made in this admin panel: prices, products, pages, leads, coupons, reviews, blog, users and sign-ins.
        The log is permanent: entries can never be edited or deleted.
      </p>
      <div className="mt-6 flex flex-wrap gap-1.5">
        {LOG_VIEWS.map(([k, label]) => (
          <button key={k} onClick={() => setParams(k === 'all' ? {} : { view: k })} aria-pressed={view[0] === k} className="chip !py-1.5 !text-xs">{label}</button>
        ))}
      </div>
      {!entries ? <Loader2 className="mt-6 size-5 animate-spin text-muted" /> : (
        <>
          <div className="mt-4 overflow-x-auto rounded-lg ring-1 ring-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs text-muted">
                <tr>{['When', 'Who', 'What', 'Field', 'Before', 'After'].map((h) => <th key={h} className="px-4 py-3 font-normal">{h}</th>)}</tr>
              </thead>
              <tbody>
                {entries.map((c) => (
                  <tr key={c.id} className="border-t border-line align-top">
                    <td className="px-4 py-2.5 whitespace-nowrap text-muted">{new Date(c.createdAt).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2.5">{c.editor}</td>
                    <td className="px-4 py-2.5">{c.itemLabel ?? c.collection}</td>
                    <td className="px-4 py-2.5 text-muted">{c.field}</td>
                    <td className="max-w-md px-4 py-2.5 whitespace-pre-line text-muted">{c.before ?? '—'}</td>
                    <td className={`px-4 py-2.5 ${c.after === 'deleted' || c.field === '(failed sign-in)' ? 'text-error' : ''}`}>{c.after ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {entries.length === 0 && <p className="p-4 text-muted">Nothing recorded here yet.</p>}
          </div>
          <div className="mt-4 flex items-center gap-3 text-sm text-muted">
            <span>Showing {entries.length} {entries.length === 1 ? 'entry' : 'entries'}{!more && entries.length ? ', back to the very first one' : ''}.</span>
            {more && (
              <button onClick={() => load(entries[entries.length - 1].id)} disabled={loading} className="btn btn-secondary !py-2 !text-xs">
                {loading && <Loader2 className="size-3.5 animate-spin" />}Load older
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function Users({ me }) {
  const { data, error, reload } = useLoad(api.users);
  const [msg, setMsg] = useState('');
  async function add(e) {
    e.preventDefault();
    const form = e.currentTarget;
    try {
      await api.createUser(Object.fromEntries(new FormData(form)));
      form.reset();
      setMsg('Account created.');
      reload();
    } catch (err) { setMsg(err.message); }
  }
  async function remove(u) {
    if (!confirm(`Remove ${u.email}?`)) return;
    try { await api.deleteUser(u.id); reload(); } catch (err) { alert(err.message); }
  }
  if (error) return <p className="text-error">{error.message}</p>;
  return (
    <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Users</h1>
        <ul className="mt-2 grid gap-1 text-sm text-muted">
          {Object.entries(ROLE_INFO).map(([k, r]) => <li key={k}><span className="font-medium text-fg">{r.label}:</span> {r.help}</li>)}
        </ul>
        <ul className="mt-6 grid gap-2">
          {data?.map((u) => (
            <li key={u.id} className="glass flex items-center gap-3 rounded-lg px-4 py-3 text-sm">
              <span className="rounded-full bg-surface px-2 py-0.5 text-xs whitespace-nowrap">{ROLE_INFO[u.role]?.label ?? u.role}</span>
              <span className="flex-1">{u.email}{u.name ? <span className="text-muted"> · {u.name}</span> : null}</span>
              {u.id !== me.id && <button onClick={() => remove(u)} className="text-xs text-subtle hover:text-error">Remove</button>}
            </li>
          ))}
        </ul>
      </div>
      <form onSubmit={add} className="glass h-fit rounded-xl p-5">
        <h2 className="font-medium">Add a user</h2>
        <div className="mt-4 grid gap-3">
          <input name="email" type="email" required placeholder="Email" className="field !py-2 text-sm" />
          <input name="name" placeholder="Name (optional)" className="field !py-2 text-sm" />
          <label className="grid gap-1">
            <span className="text-xs text-muted">Access</span>
            <select name="role" defaultValue="sales" className="field !py-2 text-sm">
              {Object.entries(ROLE_INFO).map(([k, r]) => <option key={k} value={k}>{r.label}: {r.help}</option>)}
            </select>
          </label>
          <input name="password" type="password" required minLength={10} placeholder="Temporary password (10+ characters)" autoComplete="new-password" className="field !py-2 text-sm" />
        </div>
        {msg && <p className="mt-3 text-sm text-muted">{msg}</p>}
        <button className="btn btn-primary mt-4 !py-2">Create account</button>
      </form>
    </section>
  );
}

