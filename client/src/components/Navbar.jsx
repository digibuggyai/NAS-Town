import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { ChevronDown, Menu, MessageCircle, X } from 'lucide-react';
import { digibuggy, nav } from '../data/site.js';
import { lockScroll } from '../lib/motion.js';

/** Bee mark + wordmark. The bee image is white, so it's inverted on light backgrounds. */
export function Logo({ onDark = false }) {
  return (
    <Link to="/" className="flex items-center gap-2 text-[0.95rem] font-semibold tracking-[0.14em]" aria-label="NASTOWN home">
      <img src="/digibuggy-bee.png" alt="" width="128" height="128" className={`size-6 ${onDark ? '' : 'invert'}`} />
      NASTOWN
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => lockScroll(open), [open]);

  // A hairline appears once the page scrolls; the bar tucks away while reading down, returns on the way up.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      setHidden(y > 320 && y > last);
      last = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 px-3 pt-3 transition-transform duration-300 sm:px-5 ${hidden && !open ? '-translate-y-[120%]' : ''}`}
    >
      {/* Capsule: a floating rounded-full bar that gains a stronger shadow once the page scrolls. */}
      <div
        className={`mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 rounded-full border border-line bg-raised/90 pr-2 pl-5 backdrop-blur-md transition-shadow duration-300 ${
          scrolled || open ? 'shadow-[0_10px_30px_-12px_rgb(15_23_42/0.25)]' : 'shadow-[0_4px_16px_-10px_rgb(15_23_42/0.18)]'
        }`}
      >
        <Logo />

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center">
            {nav.map(({ label, to, children }) => (
              <li key={label} className="group relative">
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2 text-[0.875rem] transition-colors hover:bg-accent-soft hover:text-fg ${isActive ? 'text-fg' : 'text-muted'}`
                  }
                >
                  {label}
                  {children && <ChevronDown className="size-3.5 opacity-60 transition-transform duration-200 group-hover:rotate-180" />}
                </NavLink>
                {children && (
                  <div className="invisible absolute top-full left-0 min-w-56 translate-y-1 pt-2 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <ul className="rounded-lg border border-line bg-raised p-1.5 shadow-[0_12px_32px_-12px_rgb(27_27_25/0.25)]">
                      {children.map((c) => (
                        <li key={c.to}>
                          <Link to={c.to} className="block rounded-md px-3 py-2 text-[0.875rem] text-muted transition-colors hover:bg-surface hover:text-fg">
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a href={digibuggy.whatsappHref} target="_blank" rel="noopener" className="hidden items-center gap-1.5 whitespace-nowrap px-2 text-[0.875rem] text-muted transition-colors hover:text-fg 2xl:inline-flex">
            <MessageCircle className="size-4" /> WhatsApp us
          </a>
          <Link to="/finder" className="btn btn-primary hidden !min-h-10 !py-2 !text-[0.875rem] sm:inline-flex">Find My NAS</Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid size-11 place-items-center rounded-md text-fg transition-colors hover:bg-surface xl:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      
      {open && (
        <div id="mobile-menu" className="mx-auto mt-2 max-h-[calc(100svh-6rem)] max-w-7xl overflow-y-auto rounded-3xl border border-line bg-raised px-5 pb-8 shadow-[0_16px_40px_-16px_rgb(15_23_42/0.3)] xl:hidden">
          <ul className="rule-list">
            {nav.map(({ label, to, children }) => (
              <li key={label}>
                {children ? (
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-lg">
                      {label}
                      <ChevronDown className="size-5 text-subtle transition-transform group-open:rotate-180" />
                    </summary>
                    <ul className="grid pb-4">
                      {children.map((c) => (
                        <li key={c.to}><Link to={c.to} className="block py-2 text-muted hover:text-fg">{c.label}</Link></li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <Link to={to} className="block py-4 text-lg">{label}</Link>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-6 grid gap-2">
            <Link to="/finder" className="btn btn-primary">Find My NAS</Link>
            <a href={digibuggy.whatsappHref} target="_blank" rel="noopener" className="btn btn-secondary"><MessageCircle className="size-4" /> WhatsApp {digibuggy.whatsapp}</a>
          </div>
          <p className="mt-6 text-sm text-subtle">Showroom: {digibuggy.addressShort}</p>
        </div>
      )}
    </header>
  );
}
