// Motion: GSAP for all animation, Lenis for smooth wheel scrolling on desktop.
// Touch devices keep native scrolling (it already has momentum and feels right),
// and everything is switched off for people who prefer reduced motion.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
gsap.defaults({ ease: 'power3.out', duration: 0.8 });

export { gsap, ScrollTrigger, SplitText, useGSAP };

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export let lenis = null;
const NAV_OFFSET = -96; // keep anchored sections clear of the floating navbar

export function initMotion() {
  if (!reducedMotion()) {
    lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 3.2), wheelMultiplier: 1, syncTouch: false, anchors: { offset: NAV_OFFSET } });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
  }
  // Layout can shift once web fonts arrive; re-measure trigger positions then.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  // Sections that load data (blog, products, reviews) change the page height after
  // triggers were measured; re-measure whenever the height settles.
  let lastH = 0;
  let t;
  new ResizeObserver(([entry]) => {
    const h = Math.round(entry.contentRect.height);
    if (h === lastH) return;
    lastH = h;
    clearTimeout(t);
    t = setTimeout(() => ScrollTrigger.refresh(), 200);
  }).observe(document.body);
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true });
  else window.scrollTo({ top: 0, behavior: 'instant' });
}

export function scrollToEl(el) {
  if (lenis) lenis.scrollTo(el, { offset: NAV_OFFSET, duration: 1.2 });
  else el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

export function lockScroll(locked) {
  if (lenis) (locked ? lenis.stop() : lenis.start());
  document.body.style.overflow = locked ? 'hidden' : '';
}
