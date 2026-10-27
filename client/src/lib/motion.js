// Motion: GSAP for all animation. Scrolling is the browser's own: instant and smooth on
// every device (an eased scroll library made the page trail behind the wheel).
// Animation is switched off for people who prefer reduced motion.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
gsap.defaults({ ease: 'power3.out', duration: 0.8 });

export { gsap, ScrollTrigger, SplitText, useGSAP };

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Anchored sections stay clear of the fixed navbar through their own scroll-mt-* margin.
export function initMotion() {
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
  window.scrollTo({ top: 0, behavior: 'instant' });
}

export function scrollToEl(el, instant = false) {
  el.scrollIntoView({ behavior: instant || reducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

export function lockScroll(locked) {
  document.body.style.overflow = locked ? 'hidden' : '';
}
