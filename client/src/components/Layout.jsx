import { useRef } from 'react';
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
    if (hash) {
      requestAnimationFrame(() => {
        const el = document.getElementById(hash.slice(1));
        if (el) scrollToEl(el);
      });
    } else {
      scrollToTop();
    }
    if (!reducedMotion()) gsap.fromTo(main.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: 'power1.out' });
    const id = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => clearTimeout(id);
  }, { dependencies: [pathname, hash] });

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <Navbar />
      <main id="main" ref={main} className="overflow-x-clip">
        <Outlet />
      </main>
      <Footer />
      {/* Floating WhatsApp, always one tap from a person. */}
      <a
        href={digibuggy.whatsappHref}
        target="_blank"
        rel="noopener"
        aria-label={`Chat on WhatsApp: ${digibuggy.whatsapp}`}
        className="fixed right-5 bottom-5 z-40 grid size-14 place-items-center rounded-full bg-[#25d366] text-white shadow-[0_10px_24px_-8px_rgb(37_211_102/0.6)] transition-transform hover:scale-105"
      >
        <MessageCircle className="size-7" strokeWidth={2} />
      </a>
    </>
  );
}
