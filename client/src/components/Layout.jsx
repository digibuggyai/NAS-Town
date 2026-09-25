import { useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import Background from './Background.jsx';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import { gsap, reducedMotion, scrollToEl, scrollToTop, ScrollTrigger, useGSAP } from '../lib/motion.js';

export default function Layout() {
  const { pathname, hash } = useLocation();
  const main = useRef(null);

  // On every route change: jump to top (or the #hash), fade the new page in, re-measure triggers.
  useGSAP(() => {
    if (hash) {
      requestAnimationFrame(() => {
        const el = document.getElementById(hash.slice(1));
        if (el) scrollToEl(el);
      });
    } else {
      scrollToTop();
    }
    if (!reducedMotion()) gsap.fromTo(main.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' });
    const id = setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => clearTimeout(id);
  }, { dependencies: [pathname, hash] });

  return (
    <>
      <Background />
      <Navbar />
      <main ref={main} className="overflow-x-clip">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
