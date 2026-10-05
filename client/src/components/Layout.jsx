import { Suspense, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import { MessageCircle } from 'lucide-react';
import { digibuggy } from '../data/site.js';
import { gsap, reducedMotion, scrollToEl, scrollToTop, ScrollTrigger, useGSAP } from '../lib/motion.js';

export default function Layout() {
  const { pathname, hash } = useLocation();
  const main = useRef(null);

  // On route change: go to the top (or the #hash), fade the new page in, re-measure scroll triggers.
  useGSAP(() => {
    let frame;
    if (hash) {
      // The page may still be loading its code, so look for the target for up to ~2s.
      let tries = 120;
      const find = () => {
        const el = document.getElementById(hash.slice(1));
        if (el) scrollToEl(el);
        else if (--tries > 0) frame = requestAnimationFrame(find);
      };
      frame = requestAnimationFrame(find);
    } else {
      scrollToTop();
    }
    if (!reducedMotion()) gsap.fromTo(main.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: 'power1.out' });
    const id = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => { clearTimeout(id); cancelAnimationFrame(frame); };
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
