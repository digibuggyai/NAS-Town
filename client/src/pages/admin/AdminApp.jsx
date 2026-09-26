import { useCallback, useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router';
import { Download, Eye, EyeOff, Loader2, LogOut } from 'lucide-react';
import { Logo } from '../../components/Navbar.jsx';
import CatalogueTable, { SettingsForm } from '../../components/admin/CatalogueTable.jsx';
import Configurator from '../../components/configurator/Configurator.jsx';
import { api } from '../../lib/api.js';
import { useAuth } from '../../lib/useAuth.js';

/* Staff area. Nothing here is linked from the public site, and every API call it
 * makes is role-checked on the server; the UI only decides what to draw. */

export default function AdminApp() {
  const auth = useAuth();

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <title>Staff | NASTOWN</title>
      {auth.loading ? (
        <div className="grid min-h-screen place-items-center"><Loader2 className="size-6 animate-spin text-muted" /></div>
      ) : !auth.user ? (
        <Login onLogin={auth.login} />
      ) : (
        <Shell user={auth.user} onLogout={auth.logout} />
      )}
    </>
  );
}

function Login({ onLogin }) {
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

function Shell({ user, onLogout }) {
  const admin = user.role === 'admin';
  const tabs = [
    admin && ['Pricing', '/admin'],
    ['Sales configurator', '/admin/configurator'],
    ['Leads', '/admin/leads'],
    admin && ['Change log', '/admin/log'],
    admin && ['Users', '/admin/users'],
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <header className="glass flex flex-wrap items-center justify-between gap-4 rounded-full py-2 pr-2 pl-5">
        <div className="flex items-center gap-4">
          <Logo />
          <span className="hidden rounded-full bg-surface px-2.5 py-1 text-[0.65rem] tracking-wide text-muted uppercase sm:inline">Staff · {user.role}</span>
        </div>
        <nav className="order-3 flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto">
          {tabs.map(([label, to]) => (
            <NavLink key={to} to={to} end className={({ isActive }) => `rounded-full px-3 py-1.5 text-[0.8rem] whitespace-nowrap transition-colors ${isActive ? 'bg-fg text-bg' : 'text-muted hover:bg-surface hover:text-fg'}`}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted md:inline">{user.email}</span>
          <button onClick={onLogout} className="btn btn-secondary !p-2" aria-label="Sign out"><LogOut className="size-4" /></button>
        </div>
      </header>

      <main className="mt-8">
        <Routes>
          <Route index element={admin ? <Pricing /> : <Navigate to="/admin/configurator" replace />} />
          <Route path="configurator" element={<SalesConfigurator />} />
          <Route path="leads" element={<Leads />} />
          {admin && <Route path="log" element={<ChangeLog />} />}
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
          <CatalogueTable key={tab} collection={tab} rows={data[tab]} schema={data.schema[tab]} onChanged={reload} />
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

function Leads() {
  const { data, error } = useLoad(api.enquiries);
  if (error) return <p className="text-error">{error.message}</p>;
  if (!data) return <Loader2 className="size-5 animate-spin text-muted" />;
  return (
    <section>
      <h1 className="text-2xl font-medium tracking-tight">Leads</h1>
      <p className="mt-1 text-sm text-muted">Every form on the site, newest first.</p>
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
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function ChangeLog() {
  const { data, error } = useLoad(api.changeLog);
  if (error) return <p className="text-error">{error.message}</p>;
  if (!data) return <Loader2 className="size-5 animate-spin text-muted" />;
  return (
    <section>
      <h1 className="text-2xl font-medium tracking-tight">Change log</h1>
      <p className="mt-1 text-sm text-muted">Every price, spec, visibility and account change.</p>
      <div className="mt-6 overflow-x-auto rounded-lg ring-1 ring-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs text-muted">
            <tr>{['When', 'Who', 'What', 'Field', 'Before', 'After'].map((h) => <th key={h} className="px-4 py-3 font-normal">{h}</th>)}</tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id} className="border-t border-line">
                <td className="px-4 py-2.5 whitespace-nowrap text-muted">{new Date(c.createdAt).toLocaleString('en-IN')}</td>
                <td className="px-4 py-2.5">{c.editor}</td>
                <td className="px-4 py-2.5">{c.itemLabel ?? c.collection}</td>
                <td className="px-4 py-2.5 text-muted">{c.field}</td>
                <td className="px-4 py-2.5 text-muted">{c.before ?? '—'}</td>
                <td className="px-4 py-2.5">{c.after ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <p className="p-4 text-muted">No changes yet.</p>}
      </div>
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
        <p className="mt-1 text-sm text-muted">Admins edit prices. Sales can use the internal configurator and see leads.</p>
        <ul className="mt-6 grid gap-2">
          {data?.map((u) => (
            <li key={u.id} className="glass flex items-center gap-3 rounded-lg px-4 py-3 text-sm">
              <span className="rounded-full bg-surface px-2 py-0.5 text-xs capitalize">{u.role}</span>
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
          <select name="role" defaultValue="sales" className="field !py-2 text-sm">
            <option value="sales">Sales</option>
            <option value="admin">Admin</option>
          </select>
          <input name="password" type="password" required minLength={10} placeholder="Temporary password (10+ characters)" autoComplete="new-password" className="field !py-2 text-sm" />
        </div>
        {msg && <p className="mt-3 text-sm text-muted">{msg}</p>}
        <button className="btn btn-primary mt-4 !py-2">Create account</button>
      </form>
    </section>
  );
}

