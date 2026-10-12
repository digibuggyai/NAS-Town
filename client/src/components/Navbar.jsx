import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { MapPin, Menu, MessageCircle, SlidersHorizontal, X } from 'lucide-react';
import { digibuggy, nav, waLink } from '../data/site.js';
import { experienceZone, quoteText } from '../config/siteContent.js';
import { gsap, lockScroll, reducedMotion, useGSAP } from '../lib/motion.js';

/** NASTOWN mark (house of drives) + wordmark. The mark is a transparent PNG; on dark
 * backgrounds (the footer) it sits on a small white tile, because its navy would vanish on black.
 * The full stacked logo with the name underneath is /nastown-logo-full.png (for print, social, etc.). */
export function Logo({ onDark = false }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 text-[0.95rem] font-semibold tracking-[0.14em] ${onDark ? 'text-white' : ''}`} aria-label="NASTOWN home">
      <span className={onDark ? 'grid size-10 place-items-center rounded-xl bg-white' : ''}>
        <img src="/nastown-logo-sm.png" alt="" width="123" height="128" className={onDark ? 'h-7 w-auto' : 'h-9 w-auto'} />
      </span>
      NASTOWN
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { pathname, key } = useLocation();
  const header = useRef(null);
  const menu = useRef(null);

  // Desktop dropdowns open on hover or keyboard focus. After a menu link is clicked the
  // focus stays on it, which would keep the dropdown open on the new page, so drop it.
  const closeDropdowns = () => {
    if (header.current?.contains(document.activeElement)) document.activeElement.blur();
  };

  useEffect(() => setOpen(false), [pathname]);
  useEffect(closeDropdowns, [key]); // every navigation, including ?filter changes
  useEffect(() => { if (hidden) closeDropdowns(); }, [hidden]); // bar tucked away: nothing left hanging
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

  // GSAP: the bar glides out of the way while reading down and back on the way up.
  useGSAP(() => {
    gsap.to(header.current, { yPercent: hidden && !open ? -130 : 0, duration: reducedMotion() ? 0 : 0.55, ease: 'power3.out', overwrite: true });
  }, { dependencies: [hidden, open] });

  // GSAP: the phone menu drops in, then its rows cascade.
  useGSAP(() => {
    if (!open || !menu.current || reducedMotion()) return;
    gsap.fromTo(menu.current, { autoAlpha: 0, y: -10, scale: 0.98, transformOrigin: 'top center' }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' });
    gsap.from(menu.current.querySelectorAll('li, .menu-cta'), { autoAlpha: 0, y: 12, duration: 0.45, stagger: 0.035, delay: 0.08, ease: 'power3.out' });
  }, { dependencies: [open] });

  return (
    <header ref={header} className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      {/* Capsule: a floating rounded-full bar that gains a stronger shadow once the page scrolls. */}
      <div
        className={`mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 rounded-full border border-line bg-raised/90 pr-2 pl-5 backdrop-blur-md transition-shadow duration-300 ${
          scrolled || open ? 'shadow-[0_10px_30px_-12px_rgb(15_23_42/0.25)]' : 'shadow-[0_4px_16px_-10px_rgb(15_23_42/0.18)]'
        }`}
      >
        <Logo />

        <nav aria-label="Main" className="hidden xl:block">
          {/* Flat links, no dropdowns. The Configurator is drawn as a pill: it's where people get a price. */}
          <ul className="flex items-center gap-0.5">
            {nav.map(({ label, to, highlight }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/products'}
                  className={({ isActive }) =>
                    highlight
                      ? 'nav-glow mx-1 inline-flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2 text-[0.875rem] font-medium transition-colors'
                      : `inline-flex whitespace-nowrap rounded-full px-2.5 py-2 text-[0.875rem] transition-colors hover:bg-accent-soft hover:text-fg ${isActive ? 'font-medium text-fg' : 'text-muted'}`
                  }
                >
                  {highlight && <SlidersHorizontal className="size-3.5" aria-hidden />}
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {/* Primary action: a quote from a person, on WhatsApp. */}
          <a href={waLink(quoteText)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp hidden !min-h-10 !py-2 !text-[0.875rem] sm:inline-flex">
            <MessageCircle className="size-4" /> Get a quote
          </a>
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
        <div id="mobile-menu" ref={menu} className="mx-auto mt-2 max-h-[calc(100svh-6rem)] max-w-7xl overflow-y-auto rounded-3xl border border-line bg-raised px-5 pb-8 shadow-[0_16px_40px_-16px_rgb(15_23_42/0.3)] xl:hidden">
          {/* With no dropdowns, the phone menu is one flat list. */}
          <ul className="rule-list">
            {nav.map(({ label, to, highlight }) => (
              <li key={to}>
                <Link to={to} className={highlight ? 'nav-glow my-2 flex min-h-12 items-center justify-center gap-2 px-5 py-3 text-lg font-medium' : 'flex min-h-12 items-center gap-2 py-3 text-lg'}>
                  {highlight && <SlidersHorizontal className="size-4" aria-hidden />}
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="menu-cta mt-6 grid gap-2">
            <a href={waLink(quoteText)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp"><MessageCircle className="size-4" /> Get a free quote on WhatsApp</a>
          </div>
          <a href={digibuggy.mapsHref} target="_blank" rel="noopener noreferrer" className="mt-6 flex items-center gap-2 text-sm text-subtle hover:text-fg">
            <MapPin className="size-4" aria-hidden /> {experienceZone.name}: {digibuggy.addressShort}
          </a>
        </div>
      )}
    </header>
  );
}
