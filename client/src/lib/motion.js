import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
gsap.defaults({ ease: 'power3.out', duration: 0.8 });

export { gsap, ScrollTrigger, SplitText, useGSAP };

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initMotion() {
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
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
