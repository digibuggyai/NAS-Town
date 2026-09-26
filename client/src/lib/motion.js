// Motion, kept deliberately small. Native scrolling (no scroll hijacking), and
// animation only where it explains something: content arriving, state changing.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
gsap.defaults({ ease: 'power3.out', duration: 0.8 });

export { gsap, ScrollTrigger, SplitText, useGSAP };

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initMotion() {
  // Layout can shift once web fonts arrive; re-measure trigger positions then.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'instant' });
}

export function scrollToEl(el) {
  el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

export function lockScroll(locked) {
  document.body.style.overflow = locked ? 'hidden' : '';
}
