import { useEffect, useRef } from 'react';
import { Info, X } from 'lucide-react';

export function Step({ n, title, hint, children, aside }) {
  return (
    <section className="glass rounded-[1.75rem] p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-accent">{String(n).padStart(2, '0')}</span>
          <div>
            <h2 className="text-[1.05rem] font-medium tracking-tight">{title}</h2>
            {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
          </div>
        </div>
        {aside}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Selectable pill. Impossible options are greyed with a reason, never hidden. */
export function Choice({ active, disabled, onClick, children, sub, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-disabled={disabled || undefined}
      title={title}
      className={`chip flex flex-col items-start !rounded-2xl !px-3.5 !py-2 text-left ${disabled && !active ? 'opacity-35 hover:!bg-white/[0.04]' : ''}`}
    >
      <span>{children}</span>
      {sub && <span className={`text-[0.7rem] ${active ? 'text-black/60' : 'text-white/45'}`}>{sub}</span>}
    </button>
  );
}

export function Toggle({ checked, onChange, label, sub }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl p-3 ring-1 ring-white/10 transition-colors hover:bg-white/[0.03]">
      <span className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-white' : 'bg-white/15'}`}>
        <span className={`absolute top-0.5 size-4 rounded-full transition-all ${checked ? 'left-4.5 bg-black' : 'left-0.5 bg-white/70'}`} />
      </span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {sub && <span className="block text-xs text-muted">{sub}</span>}
      </span>
    </label>
  );
}

export function InfoButton({ onClick, label }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="grid size-7 shrink-0 place-items-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white">
      <Info className="size-4" />
    </button>
  );
}

/** Modal built on <dialog>, for specifications. */
export function Dialog({ open, onClose, title, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[min(92vw,34rem)] rounded-[1.75rem] border border-white/10 bg-[#0b0c0f]/95 p-0 text-white shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <h3 className="font-medium">{title}</h3>
        <button onClick={onClose} aria-label="Close" className="grid size-8 place-items-center rounded-full hover:bg-white/10"><X className="size-4" /></button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto px-6 py-4">{children}</div>
    </dialog>
  );
}

export function SpecTable({ rows }) {
  return (
    <dl className="divide-y divide-white/10 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-6 py-2.5">
          <dt className="text-muted">{k}</dt>
          <dd className="text-right">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
