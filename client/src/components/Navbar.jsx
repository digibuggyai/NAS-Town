import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { ChevronDown, Headset, Menu, X } from 'lucide-react';
import { nav } from '../data/site.js';
import { gsap, lockScroll, reducedMotion, ScrollTrigger, useGSAP } from '../lib/motion.js';

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

// Each group of the navbar is its own floating glass pill.
function Pill({ className = '', scrolled, children }) {
  return (
    <div className={`nav-pill glass flex h-12 items-center !overflow-visible rounded-full transition-colors duration-500 ${scrolled ? '!bg-black/45' : ''} ${className}`}>
      {children}
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const header = useRef(null);
  const drawer = useRef(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => lockScroll(open), [open]);

  // Pills drop in on first load; the bar tucks away while scrolling down and returns on scroll up.
  useGSAP(() => {
    if (reducedMotion()) return;
    gsap.from('.nav-pill', { y: -28, autoAlpha: 0, duration: 1.2, stagger: 0.08, delay: 0.1 });
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const hide = self.direction === 1 && self.scroll() > 240;
        gsap.to(header.current, { yPercent: hide ? -130 : 0, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
      },
    });
  }, { scope: header });

  useGSAP(() => {
    if (!open || reducedMotion()) return;
    gsap.from(drawer.current, { autoAlpha: 0, y: -12, scale: 0.98, transformOrigin: 'top right', duration: 0.5, ease: 'power3.out' });
    gsap.from(drawer.current.querySelectorAll('details, .drawer-cta'), { autoAlpha: 0, y: 10, duration: 0.6, stagger: 0.03, delay: 0.05 });
  }, { dependencies: [open] });

  return (
    <header ref={header} className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-2.5">
        {/* 1. Logo */}
        <Pill scrolled={scrolled} className="px-5">
          <Logo />
        </Pill>

        {/* 2. Primary navigation */}
        <Pill scrolled={scrolled} className="hidden px-1.5 xl:flex">
          <ul className="flex items-center">
            {nav.map(({ label, to, icon: Icon, children }) => (
              <li key={label} className="group relative">
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 rounded-full px-2.5 py-2 text-[0.8rem] font-medium transition-colors hover:bg-white/[0.07] hover:text-white ${
                      isActive ? 'bg-white/[0.06] text-white' : 'text-white/70'
                    }`
                  }
                >
                  {Icon && <Icon className="size-3.5 opacity-80" strokeWidth={1.75} />}
                  {label}
                  {children && <ChevronDown className="-ml-0.5 size-3 opacity-50 transition-transform group-hover:rotate-180" />}
                </NavLink>
                {children && (
                  <div className="invisible absolute top-full left-1/2 w-60 -translate-x-1/2 translate-y-1 pt-3 opacity-0 transition-all duration-300 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="glass rounded-2xl !bg-black/60 p-2">
                      {children.map((c) => (
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
        </Pill>

        <div className="flex items-center gap-2.5">
          {/* 3. Actions */}
          <Pill scrolled={scrolled} className="hidden gap-1.5 px-1.5 sm:flex">
            <Link to="/about#contact" className="btn hidden !px-4 !py-2 !text-[0.8rem] text-white/80 hover:bg-white/[0.07] hover:text-white 2xl:inline-flex">
              Talk to an Expert
            </Link>
            <Link to="/finder" className="magnetic btn btn-primary !px-4 !py-2 !text-[0.8rem]">Find My NAS</Link>
          </Pill>

          {/* 4. Menu + support */}
          <Pill scrolled={scrolled} className="gap-1 px-1.5">
            <button
              onClick={() => setOpen((o) => !o)}
              className="grid size-9 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
            <span className="h-5 w-px bg-white/10" aria-hidden />
            <Link
              to="/about#contact"
              aria-label="Support"
              className="grid size-9 place-items-center rounded-full bg-white/[0.08] text-white/80 ring-1 ring-white/10 transition-colors hover:bg-white/15 hover:text-white"
            >
              <Headset className="size-4" />
            </Link>
          </Pill>
        </div>
      </div>

      {/* Full menu: a drawer on mobile, a right-aligned panel on desktop */}
      {open && (
        <>
          <button aria-label="Close menu" onClick={() => setOpen(false)} className="fixed inset-0 -z-10 cursor-default bg-black/40 backdrop-blur-[2px]" />
          <div ref={drawer} className="glass fixed inset-x-3 top-[4.25rem] max-h-[calc(100svh-5.5rem)] overflow-y-auto rounded-3xl !bg-black/80 p-4 sm:right-5 sm:left-auto sm:w-96">
            {nav.map(({ label, to, icon: Icon, children }) => (
              <details key={label} className="group border-b border-line last:border-0">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-2 py-3 text-[0.95rem]">
                  {Icon && <Icon className="size-4 text-accent" strokeWidth={1.75} />}
                  {children ? <span className="flex-1">{label}</span> : <Link to={to} className="flex-1">{label}</Link>}
                  {children && <ChevronDown className="size-4 opacity-60 transition-transform group-open:rotate-180" />}
                </summary>
                {children && (
                  <div className="grid pb-3 pl-7">
                    {children.map((c) => (
                      <Link key={c.to} to={c.to} className="rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white">{c.label}</Link>
                    ))}
                  </div>
                )}
              </details>
            ))}
            <div className="drawer-cta mt-5 grid grid-cols-2 gap-2">
              <Link to="/finder" className="btn btn-primary">Find My NAS</Link>
              <Link to="/tools/configurator" className="btn btn-glass">Build My NAS</Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
