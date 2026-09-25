// Site-wide motion: GSAP plugins, Lenis smooth scroll, magnetic buttons and card tilt.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
gsap.defaults({ ease: 'expo.out', duration: 1.1 });

export { gsap, ScrollTrigger, SplitText, useGSAP };

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export let lenis = null;

export function initMotion() {
  if (!reducedMotion()) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), wheelMultiplier: 0.95 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    // Keep GSAP's default lag smoothing: without it, load-time jank makes intro animations skip ahead.
  }
  // Layout can shift once web fonts arrive; re-measure trigger positions then.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  if (finePointer() && !reducedMotion()) {
    initMagnetic();
    initTilt();
  }
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true });
  else window.scrollTo(0, 0);
}

export function scrollToEl(el) {
  if (lenis) lenis.scrollTo(el, { offset: -96 });
  else el.scrollIntoView({ behavior: 'smooth' });
}

export function lockScroll(locked) {
  if (lenis) (locked ? lenis.stop() : lenis.start());
  document.body.style.overflow = locked ? 'hidden' : '';
}

// Elements with .magnetic drift toward the cursor and spring back on leave.
function initMagnetic() {
  let active = null;
  const movers = new WeakMap();
  const getMover = (el) => {
    if (!movers.has(el)) {
      movers.set(el, {
        x: gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' }),
        y: gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' }),
      });
    }
    return movers.get(el);
  };
  const release = (el) => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });

  document.addEventListener('pointermove', (e) => {
    const el = e.target instanceof Element ? e.target.closest('.magnetic') : null;
    if (active && active !== el) release(active);
    active = el;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const m = getMover(el);
    m.x((e.clientX - (r.left + r.width / 2)) * 0.28);
    m.y((e.clientY - (r.top + r.height / 2)) * 0.35);
  }, { passive: true });
  document.addEventListener('pointerleave', () => active && release(active));
}

// Elements with .tilt lean toward the cursor in 3D and lift slightly.
function initTilt() {
  let active = null;
  const tilters = new WeakMap();
  const getTilter = (el) => {
    if (!tilters.has(el)) {
      gsap.set(el, { transformPerspective: 1100, transformOrigin: 'center' });
      tilters.set(el, {
        rx: gsap.quickTo(el, 'rotationX', { duration: 0.8, ease: 'power3.out' }),
        ry: gsap.quickTo(el, 'rotationY', { duration: 0.8, ease: 'power3.out' }),
      });
    }
    return tilters.get(el);
  };
  const release = (el) => gsap.to(el, { rotationX: 0, rotationY: 0, y: 0, duration: 1, ease: 'power3.out', overwrite: 'auto' });

  document.addEventListener('pointermove', (e) => {
    const el = e.target instanceof Element ? e.target.closest('.tilt') : null;
    if (active && active !== el) release(active);
    if (el && el !== active) gsap.to(el, { y: -5, duration: 0.6, ease: 'power3.out' });
    active = el;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    const strength = Number(el.dataset.tilt || 7);
    const t = getTilter(el);
    t.rx(-py * strength);
    t.ry(px * strength);
  }, { passive: true });
}
