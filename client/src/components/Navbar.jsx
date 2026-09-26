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
      className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-300 ${
        hidden && !open ? '-translate-y-full' : ''
      } ${scrolled || open ? 'border-b border-line bg-bg/92 backdrop-blur-md' : 'border-b border-transparent'}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {nav.map(({ label, to, children }) => (
              <li key={label} className="group relative">
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-1 rounded-md px-3 py-2 text-[0.9rem] transition-colors hover:text-fg ${isActive ? 'text-fg' : 'text-muted'}`
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
          <a href={digibuggy.whatsappHref} target="_blank" rel="noopener" className="hidden items-center gap-1.5 px-2 text-[0.875rem] text-muted transition-colors hover:text-fg lg:inline-flex">
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

      {/* Below xl: a full-height sheet, designed for thumbs rather than a shrunken desktop menu. */}
      {open && (
        <div id="mobile-menu" className="h-[calc(100svh-4rem)] overflow-y-auto border-t border-line bg-bg px-4 pb-10 sm:px-6 xl:hidden">
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
