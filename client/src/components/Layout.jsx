import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import { MessageCircle, SlidersHorizontal } from 'lucide-react';
import { digibuggy } from '../data/site.js';
import { gsap, reducedMotion, scrollToEl, scrollToTop, ScrollTrigger, useGSAP } from '../lib/motion.js';

export default function Layout() {
  const { pathname, hash } = useLocation();
  const main = useRef(null);

  // The phones' floating "Build your NAS" button appears after the first screen.
  const [scrolledPast, setScrolledPast] = useState(false);
  useEffect(() => {
    const on = () => setScrolledPast(window.scrollY > 560);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const showBuild = scrolledPast && !pathname.startsWith('/tools/configurator');

  // On route change: go to the top (or the #hash), fade the new page in, re-measure scroll triggers.
  useGSAP(() => {
    let frame;
    let settle;
    if (hash) {
      // The page may still be loading its code, so look for the target for up to ~2s.
      // Content above it (photos, prices) can still be arriving and push it down, which also
      // cuts a smooth scroll short, so check again once the page has settled.
      let tries = 120;
      const find = () => {
        const el = document.getElementById(hash.slice(1));
        if (!el) { if (--tries > 0) frame = requestAnimationFrame(find); return; }
        scrollToEl(el);
        settle = setTimeout(() => { if (Math.abs(el.getBoundingClientRect().top - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0)) > 24) scrollToEl(el, true); }, 900);
      };
      frame = requestAnimationFrame(find);
    } else {
      scrollToTop();
    }
    if (!reducedMotion()) gsap.fromTo(main.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: 'power1.out' });
    const id = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => { clearTimeout(id); clearTimeout(settle); cancelAnimationFrame(frame); };
  }, { dependencies: [pathname, hash] });

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <Navbar />
      <main id="main" ref={main} className="overflow-x-clip">
        {/* Pages load on first visit; hold their space meanwhile so the footer doesn't jump up. */}
        <Suspense fallback={<div className="min-h-svh" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      {/* Phones: once the hero's buttons have scrolled away, "Build your NAS" stays one tap away
          (not on the configurator itself, which has its own price bar). */}
      {showBuild && (
        <Link
          to="/tools/configurator"
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-5 text-[0.9375rem] font-medium text-white shadow-[0_12px_28px_-10px_rgb(58_103_255/0.75)] lg:hidden"
        >
          <SlidersHorizontal className="size-4" aria-hidden /> Build your NAS
        </Link>
      )}
      {/* Floating WhatsApp, always one tap from a person. */}
      <a
        href={digibuggy.whatsappHref}
        target="_blank"
        rel="noopener"
        aria-label={`Chat on WhatsApp: ${digibuggy.whatsapp}`}
        className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 grid size-12 place-items-center rounded-full bg-[#25d366] text-white shadow-[0_10px_24px_-8px_rgb(37_211_102/0.6)] transition-transform hover:scale-105 sm:right-5 sm:bottom-5 sm:size-14"
      >
        <MessageCircle className="size-6 sm:size-7" strokeWidth={2} />
      </a>
    </>
  );
}
