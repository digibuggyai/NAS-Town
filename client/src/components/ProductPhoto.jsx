import { useRef } from 'react';
import NasVisual from './NasVisual.jsx';
import { productPhoto } from '../data/productImages.js';

/** The unit's real photo, or the NAS drawing when there's no photo for that model. */
export default function ProductPhoto({ model, bays, alt, className = '', eager = false }) {
  const photo = productPhoto(model);
  if (!photo) return <NasVisual bays={bays} className={className} />;
  return (
    <img
      src={photo.src}
      width={photo.width}
      height={photo.height}
      alt={alt ?? `${model} NAS`}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={`object-contain ${className}`}
    />
  );
}

/**
 * Cursor-follow hover for a product's photo plate. Spread the returned handlers on the element
 * that receives the pointer (a card whose whole area is a link), and give `plateRef` to the plate.
 * The plate tilts towards the cursor and a soft light follows it (styles: .tilt in index.css).
 * Mouse only, and off for people who prefer reduced motion.
 */
export function useTilt() {
  const plateRef = useRef(null);
  const frame = useRef(0);

  const onPointerMove = (e) => {
    const el = plateRef.current;
    if (!el || e.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
      const y = Math.min(1, Math.max(0, (clientY - r.top) / r.height));
      el.style.setProperty('--tilt-x', `${((0.5 - y) * 10).toFixed(2)}deg`);
      el.style.setProperty('--tilt-y', `${((x - 0.5) * 14).toFixed(2)}deg`);
      el.style.setProperty('--shift-x', `${((x - 0.5) * 12).toFixed(1)}px`);
      el.style.setProperty('--glow-x', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--glow-y', `${(y * 100).toFixed(1)}%`);
      el.dataset.tilting = '';
    });
  };
  const onPointerLeave = () => {
    const el = plateRef.current;
    cancelAnimationFrame(frame.current);
    if (!el) return;
    delete el.dataset.tilting;
    for (const v of ['--tilt-x', '--tilt-y', '--shift-x']) el.style.removeProperty(v);
  };
  return { plateRef, handlers: { onPointerMove, onPointerLeave } };
}
