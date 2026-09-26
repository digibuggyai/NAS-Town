import { useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
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
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-md focus:bg-fg focus:px-4 focus:py-2 focus:text-bg">
        Skip to content
      </a>
      <Navbar />
      <main id="main" ref={main} className="overflow-x-clip">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
