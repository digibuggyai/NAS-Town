import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { ChevronDown, Menu, X } from 'lucide-react';
import { nav } from '../data/site.js';

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 text-[0.8rem] font-semibold tracking-[0.18em]" aria-label="NASTOWN home">
      <span className="relative grid size-6 place-items-center rounded-md bg-white/10 ring-1 ring-white/20">
        <span className="size-1.5 rounded-full bg-accent shadow-[0_0_12px_var(--color-accent)]" />
      </span>
      NASTOWN
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-3">
      <nav
        className={`glass mx-auto flex max-w-6xl items-center justify-between gap-4 !overflow-visible rounded-full py-1.5 pr-1.5 pl-4 transition-all duration-500 ${
          scrolled ? '!bg-black/40' : ''
        }`}
      >
        <Logo />

        <ul className="hidden items-center gap-0.5 xl:flex">
          {nav.map((item) => (
            <li key={item.label} className="group relative">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[0.8rem] transition-colors hover:bg-white/[0.07] hover:text-white ${
                    isActive ? 'text-white' : 'text-white/70'
                  }`
                }
              >
                {item.label}
                {item.children && <ChevronDown className="size-3 opacity-60 transition-transform group-hover:rotate-180" />}
              </NavLink>
              {item.children && (
                <div className="invisible absolute top-full left-1/2 w-60 -translate-x-1/2 translate-y-1 pt-2.5 opacity-0 transition-all duration-300 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="glass rounded-2xl !bg-black/60 p-2">
                    {item.children.map((c) => (
                      <Link key={c.to} to={c.to} className="block rounded-xl px-3 py-2 text-[0.8rem] text-white/75 transition-colors hover:bg-white/[0.08] hover:text-white">
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link to="/finder" className="btn btn-primary hidden !px-4 !py-2 !text-[0.8rem] sm:inline-flex">Find My NAS</Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className="btn btn-glass !p-2 xl:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="glass fixed inset-x-3 top-16 bottom-3 overflow-y-auto rounded-3xl !bg-black/70 p-4 xl:hidden">
          {nav.map((item) => (
            <details key={item.label} className="group border-b border-line last:border-0">
              <summary className="flex cursor-pointer list-none items-center justify-between px-2 py-3.5 text-base">
                {item.children ? item.label : <Link to={item.to} className="flex-1">{item.label}</Link>}
                {item.children && <ChevronDown className="size-4 transition-transform group-open:rotate-180" />}
              </summary>
              {item.children && (
                <div className="grid pb-3">
                  {item.children.map((c) => (
                    <Link key={c.to} to={c.to} className="rounded-xl px-3 py-2.5 text-white/70 hover:bg-white/5 hover:text-white">{c.label}</Link>
                  ))}
                </div>
              )}
            </details>
          ))}
          <div className="mt-6 grid gap-2">
            <Link to="/finder" className="btn btn-primary">Find My NAS</Link>
            <Link to="/tools/configurator" className="btn btn-glass">Build My NAS</Link>
          </div>
        </div>
      )}
    </header>
  );
}
