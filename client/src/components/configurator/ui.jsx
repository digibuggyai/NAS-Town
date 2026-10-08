import { Check, Info } from 'lucide-react';

/* The configurator's building blocks (same inventory as DGB India's: Step, Tile, CheckTile,
 * Badge, hover info), drawn in NASTOWN's design. Selection is shown with the soft accent
 * tint; the solid accent is kept for the one primary action on screen. */

/** A numbered step card: circled number, title, one line of explanation, then content.
 *  `locked` greys it out (and makes it unclickable) until the storage step is answered. */
export function StepCard({ n, title, hint, aside, wide = false, locked = false, id, children }) {
  return (
    <section
      id={id}
      inert={locked || undefined}
      aria-disabled={locked || undefined}
      className={`scroll-mt-28 rounded-2xl border border-line bg-raised p-5 shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition-opacity sm:p-6 ${wide ? 'xl:col-span-2' : ''} ${locked ? 'opacity-50 select-none' : ''}`}
    >
      {/* Half-width cards stack the aside under the title so long titles never get squeezed. */}
      <header className={`flex flex-col gap-3 ${wide ? 'sm:flex-row sm:items-start sm:justify-between' : 'sm:flex-row sm:items-start sm:justify-between xl:flex-col xl:items-stretch'}`}>
        <div className="flex min-w-0 gap-3">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-fg text-xs font-semibold text-white tabular-nums">{n}</span>
          <div className="min-w-0">
            <h2 className="text-[1.05rem] leading-7 font-semibold tracking-tight">{title}</h2>
            {(locked || hint) && <p className="mt-0.5 text-sm leading-relaxed text-muted">{locked ? 'Choose your storage first. We suggest this for you.' : hint}</p>}
          </div>
        </div>
        {aside}
      </header>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** A radio choice drawn as a card. Impossible options are greyed with a reason, never hidden. */
export function Tile({ active, disabled, onClick, title, sub, aside, className = '', children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-disabled={disabled || undefined}
      className={`group relative flex w-full min-w-0 items-start justify-between gap-2 rounded-xl px-3.5 py-2.5 text-left ring-1 transition-[background-color,box-shadow,color] duration-150 ${
        active
          ? 'bg-accent-soft ring-2 ring-accent'
          : disabled
            ? 'bg-surface text-subtle ring-line'
            : 'bg-raised ring-line hover:bg-surface hover:ring-line-strong'
      } ${className}`}
    >
      <span className="min-w-0">
        <span className={`block text-sm font-medium ${active ? 'text-accent-strong' : disabled ? 'text-subtle' : 'text-fg'}`}>{title}</span>
        {sub && <span className={`mt-0.5 block text-xs leading-snug ${active ? 'text-accent' : 'text-subtle'}`}>{sub}</span>}
        {children}
      </span>
      {aside}
    </button>
  );
}

/** A switch drawn as a card, for installation and AMC. */
export function CheckTile({ checked, onChange, title, sub, price, priceSub }) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-xl p-4 ring-1 transition-colors ${checked ? 'bg-accent-soft ring-2 ring-accent' : 'bg-raised ring-line hover:bg-surface'}`}>
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md ring-1 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-accent ${checked ? 'bg-accent text-white ring-accent' : 'bg-raised ring-line-strong'}`}>
        {checked && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        {sub && <span className="mt-0.5 block text-xs leading-snug text-muted">{sub}</span>}
      </span>
      {price && (
        <span className="text-right">
          <span className="block text-sm font-semibold tabular-nums">{price}</span>
          {priceSub && <span className="block text-xs text-subtle">{priceSub}</span>}
        </span>
      )}
    </label>
  );
}

const BADGE = {
  outline: 'text-muted ring-1 ring-line',
  tint: 'bg-accent-soft text-accent-strong',
  accent: 'bg-accent text-white',
  dark: 'bg-fg text-white',
  success: 'bg-success/10 text-success',
};
export function Badge({ tone = 'outline', children }) {
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide whitespace-nowrap uppercase ${BADGE[tone]}`}>{children}</span>;
}

/** The ⓘ: hover or focus shows the key specifications; a click opens the full dialog.
 *  It sits inside clickable tiles, so its own clicks must not select the tile underneath. */
export function InfoHover({ label, specs, onOpen, align = 'right' }) {
  return (
    <span className="group/info relative inline-flex" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <span
        role="button"
        tabIndex={0}
        aria-label={label}
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); onOpen(); }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
        className="grid size-7 cursor-pointer place-items-center rounded-full text-subtle transition-colors hover:bg-surface hover:text-accent focus-visible:text-accent"
      >
        <Info className="size-4" />
      </span>
      {specs?.length > 0 && (
        <span
          role="tooltip"
          className={`pointer-events-none invisible absolute top-full z-30 mt-1 w-64 rounded-xl border border-line bg-raised p-3 text-left opacity-0 shadow-[0_18px_40px_-16px_rgb(15_23_42/0.35)] transition-opacity group-hover/info:visible group-hover/info:opacity-100 group-focus-within/info:visible group-focus-within/info:opacity-100 ${align === 'left' ? 'left-0' : 'right-0'}`}
        >
          <span className="block text-xs font-semibold tracking-wide text-subtle uppercase">{label.replace(/ specifications$/, '')}</span>
          <span className="mt-2 grid gap-1.5">
            {specs.map((s) => (
              <span key={s.label} className="grid grid-cols-[6.5rem_1fr] gap-2 text-xs">
                <span className="text-subtle">{s.label}</span>
                <span className="text-fg">{s.value}</span>
              </span>
            ))}
          </span>
          <span className="mt-2 block text-[0.7rem] text-accent">Click for full specifications</span>
        </span>
      )}
    </span>
  );
}

/** Label / value rows for the specification dialogs. */
export function SpecList({ specs }) {
  return (
    <dl className="divide-y divide-line text-sm">
      {specs.map((s) => (
        <div key={s.label} className="flex justify-between gap-6 py-2.5">
          <dt className="text-muted">{s.label}</dt>
          <dd className="text-right">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
