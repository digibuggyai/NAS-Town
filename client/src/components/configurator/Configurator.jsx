import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Check, Copy, Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { usePricing } from '../../lib/nas/usePricing.js';
import { RAID_INFO, RAID_LEVELS, inr, networkFor } from '../../lib/nas/logic.js';
import {
  BUDGET_PRESETS, CAPACITY_PRESETS, INITIAL_ANSWERS, derive, estimateLines, feasibleOptions, leadSummary, priceFor,
} from '../../lib/nas/configure.js';
import { compareRows, compatibilityNotes, driveLineRows, modelSpecRows } from '../../lib/nas/specs.js';
import EnquiryForm from '../EnquiryForm.jsx';
import { Choice, Dialog, InfoButton, SpecTable, Step, Toggle } from './parts.jsx';

/** Answers seeded from the URL: ?model=slug&target=20&raid=RAID5 */
function initialAnswers(P, params) {
  const a = { ...INITIAL_ANSWERS };
  const target = Number(params?.get('target'));
  if (target > 0) a.targetTB = target;
  const raid = params?.get('raid');
  if (RAID_LEVELS.includes(raid)) a.raid = raid;
  const model = P.models.find((m) => m.slug === params?.get('model'));
  if (model) {
    a.modelId = model.id;
    a.autoPick = false;
    if (!model.raid.includes(a.raid)) a.raid = model.bays >= 3 ? 'RAID5' : 'RAID1';
  }
  return a;
}

export default function Configurator({ source = 'public', params }) {
  const { pricing, error, loading, reload } = usePricing(source);

  if (loading) {
    return (
      <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        <div className="grid gap-4">{[0, 1, 2].map((i) => <div key={i} className="glass h-40 animate-pulse rounded-[1.75rem]" />)}</div>
        <div className="glass h-96 animate-pulse rounded-[1.75rem]" />
      </div>
    );
  }
  if (error || !pricing) {
    return (
      <div className="glass mx-auto max-w-lg rounded-[1.75rem] p-8 text-center">
        <AlertTriangle className="mx-auto size-8 text-amber-200" />
        <h2 className="mt-4 text-xl font-medium">Pricing is unavailable right now</h2>
        <p className="mt-2 text-sm text-muted">{error?.status === 401 || error?.status === 403 ? 'Please sign in again.' : "We don't quote from old price lists. Try again in a moment, or talk to our team."}</p>
        <button onClick={reload} className="btn btn-primary mt-6"><RotateCcw className="size-4" /> Try again</button>
      </div>
    );
  }
  return <ConfiguratorLoaded P={pricing} sales={source === 'sales'} params={params} />;
}

function ConfiguratorLoaded({ P, sales, params }) {
  const [a, setAnswers] = useState(() => initialAnswers(P, params));
  const set = (patch) => setAnswers((prev) => ({ ...prev, ...patch }));

  const d = useMemo(() => derive(a, P), [a, P]);
  const price = useMemo(() => priceFor(d.build, a, P), [d.build, a, P]);
  const can = useMemo(() => feasibleOptions(a, P, d), [a, P, d]);
  const lines = useMemo(() => estimateLines(d.build, price, a, P), [d.build, price, a, P]);

  const [dialog, setDialog] = useState(null); // { kind: 'model' | 'line', item }
  const [compare, setCompare] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  const build = d.build;
  const brands = useMemo(() => [...new Set(P.models.map((m) => m.brand))].sort(), [P]);
  const bayTiers = useMemo(() => [...new Set(P.models.map((m) => m.bays))].sort((x, y) => x - y), [P]);
  const pricedLines = useMemo(() => [...new Set(Object.values(P.hddPricing).flatMap((l) => Object.keys(l)))], [P]);
  const lineSpec = (name) => P.driveLines.find((l) => l.name === name);
  const bayHint = (tier) => {
    const b = can.bayPool.find((x) => x.model.bays === tier);
    return b ? `${b.drivesPerUnit}× ${b.driveCap} TB` : 'not for this target';
  };
  const ram = P.upgrades.filter((u) => u.category === 'RAM');
  const nic = P.upgrades.filter((u) => u.category === 'NIC');

  // Mobile: a sticky bar appears once the estimate panel scrolls out of view.
  const panelRef = useRef(null);
  const [panelVisible, setPanelVisible] = useState(true);
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setPanelVisible(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hasFloor = sales && price?.floor;
  const room = hasFloor ? price.total - price.floor.total : null;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
      <div className="grid content-start gap-4">
        {/* 01 Storage */}
        <Step
          n={1}
          title="How much storage?"
          hint={a.storageMode === 'capacity' ? 'Usable space after RAID protection.' : 'The budget covers the whole quote, including installation and AMC if ticked.'}
          aside={
            <div className="flex rounded-full bg-white/[0.05] p-1 text-xs ring-1 ring-white/10">
              {[['capacity', 'By capacity'], ['budget', 'By budget']].map(([mode, label]) => (
                <button key={mode} onClick={() => set({ storageMode: mode })} className={`rounded-full px-3 py-1.5 transition-colors ${a.storageMode === mode ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}>
                  {label}
                </button>
              ))}
            </div>
          }
        >
          {a.storageMode === 'capacity' ? (
            <>
              <div className="flex flex-wrap gap-2">
                {CAPACITY_PRESETS.map((tb) => (
                  <Choice key={tb} active={d.targetTB === tb} onClick={() => set({ targetTB: tb })}>{tb} TB</Choice>
                ))}
                <select
                  aria-label="Exact usable size"
                  value={d.sizes.includes(d.targetTB) ? d.targetTB : ''}
                  onChange={(e) => set({ targetTB: Number(e.target.value) })}
                  className="field !w-auto !rounded-full !py-2 text-sm"
                >
                  <option value="" disabled>Other size</option>
                  {d.sizes.map((s) => <option key={s} value={s}>{s} TB</option>)}
                </select>
              </div>
              {d.movedFrom != null && (
                <p className="mt-3 text-sm text-amber-100/80">
                  Showing {d.targetTB} TB: {d.movedFrom} TB can't be built from whole drives at {RAID_INFO[d.raid].title}.
                </p>
              )}
            </>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {BUDGET_PRESETS.map((b) => (
                  <Choice key={b} active={a.budget === b} onClick={() => set({ budget: b })}>{inr(b)}</Choice>
                ))}
              </div>
              <label className="mt-3 flex max-w-xs items-center gap-2">
                <span className="text-sm text-muted">₹</span>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={a.budget ?? ''}
                  onChange={(e) => set({ budget: e.target.value === '' ? null : Number(e.target.value) })}
                  className="field !py-2"
                  aria-label="Budget in rupees"
                />
              </label>
            </>
          )}
        </Step>

        {/* 02 RAID */}
        <Step n={2} title="Protection (RAID)" hint={RAID_INFO[d.raid].blurb}>
          <div className="flex flex-wrap gap-2">
            {a.storageMode === 'budget' && (
              <Choice active={a.raidAuto} onClick={() => set({ raidAuto: true })} sub="most space, with protection">
                <span className="inline-flex items-center gap-1.5"><Sparkles className="size-3.5" /> Let us choose</span>
              </Choice>
            )}
            {RAID_LEVELS.map((r) => (
              <Choice
                key={r}
                active={(a.storageMode === 'capacity' || !a.raidAuto) && a.raid === r}
                onClick={() => set({ raid: r, raidAuto: false })}
                sub={RAID_INFO[r].tolerance === 0 ? 'no protection' : RAID_INFO[r].tolerance === 2 ? 'survives 2 failures' : 'survives 1 failure'}
              >
                {RAID_INFO[r].title}
              </Choice>
            ))}
          </div>
          {a.storageMode === 'budget' && a.raidAuto && !d.error && (
            <p className="mt-3 text-sm text-muted">We chose <span className="text-white">{RAID_INFO[d.raid].title}</span>: the most usable space this budget buys{d.redundant ? ' with protection.' : '.'}</p>
          )}
          {d.raid === 'RAID0' && !d.error && (
            <p className="mt-3 flex items-start gap-2 text-sm text-amber-100/90"><AlertTriangle className="mt-0.5 size-4 shrink-0" /> RAID 0 has no redundancy: one failed drive loses all data.</p>
          )}
        </Step>

        {/* 03 Bays · 04 Brand · 05 Expand */}
        <Step n={3} title="Drive bays, brand and room to grow">
          <p className="mb-2 text-xs tracking-wide text-muted uppercase">Bays</p>
          <div className="flex flex-wrap gap-2">
            <Choice active={a.bays == null} onClick={() => set({ bays: null })} sub="best value">Auto</Choice>
            {bayTiers.map((t) => (
              <Choice key={t} active={a.bays === t} disabled={!can.bays.has(t)} onClick={() => set({ bays: t })} sub={bayHint(t)}>
                {t}-bay
              </Choice>
            ))}
          </div>
          <p className="mt-5 mb-2 text-xs tracking-wide text-muted uppercase">Brand</p>
          <div className="flex flex-wrap gap-2">
            <Choice active={a.brand === 'any'} onClick={() => set({ brand: 'any' })}>Any</Choice>
            {brands.map((b) => <Choice key={b} active={a.brand === b} onClick={() => set({ brand: b })}>{b}</Choice>)}
          </div>
          <div className="mt-5 max-w-sm">
            <Toggle checked={a.expandable} onChange={(v) => set({ expandable: v })} label="Room to expand" sub="Only units that take an expansion enclosure" />
          </div>
        </Step>

        {d.error ? (
          <div className="glass flex items-start gap-3 rounded-[1.75rem] p-6 text-sm">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-200" />
            <p>{d.error}</p>
          </div>
        ) : (
          <>
            {/* 06 Recommended unit */}
            <Step
              n={4}
              title="Recommended unit"
              hint="Best value first. Each option is the cheapest way that unit reaches your storage."
              aside={d.options.length > 1 && (
                <button onClick={() => setCompare((c) => !c)} className="text-xs text-white/60 underline-offset-4 hover:text-white hover:underline">
                  {compare ? 'Hide comparison' : 'Compare'}
                </button>
              )}
            >
              <ul className="grid gap-2">
                {d.options.slice(0, 6).map((b, i) => {
                  const selected = build?.model.id === b.model.id;
                  return (
                    <li key={b.model.id}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => set({ modelId: b.model.id, autoPick: false })}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), set({ modelId: b.model.id, autoPick: false }))}
                        aria-pressed={selected}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl p-3.5 ring-1 transition-colors ${selected ? 'bg-white/[0.08] ring-white/40' : 'ring-white/10 hover:bg-white/[0.04]'}`}
                      >
                        <span className={`grid size-5 shrink-0 place-items-center rounded-full ring-1 ${selected ? 'bg-white text-black ring-white' : 'ring-white/25'}`}>
                          {selected && <Check className="size-3" strokeWidth={3} />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-center gap-2 font-medium">
                            {b.model.brand} {b.model.model}
                            {i === 0 && <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[0.65rem] text-accent">Best value</span>}
                          </p>
                          <p className="text-xs text-muted">
                            {b.units > 1 ? `${b.units} units · ` : ''}{b.model.bays}-bay · {b.drivesPerUnit * b.units} × {b.driveCap} TB {b.driveLine} · {b.totalUsable} TB usable
                          </p>
                        </div>
                        <span className="text-sm font-medium whitespace-nowrap">{inr(b.totalQuote)}</span>
                        <InfoButton label={`${b.model.model} specifications`} onClick={(e) => { e.stopPropagation(); setDialog({ kind: 'model', item: b.model }); }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
              {!d.autoPick && (
                <button onClick={() => set({ autoPick: true, modelId: null })} className="mt-3 inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white">
                  <RotateCcw className="size-3" /> Back to the recommendation
                </button>
              )}
              {compare && (
                <div className="mt-4 overflow-x-auto rounded-2xl ring-1 ring-white/10">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-line">
                        <th className="p-3 font-normal text-muted" />
                        {d.options.slice(0, 4).map((b) => <th key={b.model.id} className="p-3 font-medium whitespace-nowrap">{b.model.model}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {compareRows(d.options.slice(0, 4), (b) => inr(b.totalQuote)).map(([label, ...vals]) => (
                        <tr key={label} className="border-b border-line last:border-0">
                          <td className="p-3 text-muted">{label}</td>
                          {vals.map((v, i) => <td key={i} className="p-3">{v}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Step>

            {/* 07 Network (shown, not asked) + 08 Drives */}
            {build && (
              <Step n={5} title="Drives" hint={`Network on the ${build.model.model}: ${networkFor(build.model).ports}${build.model.networkUpgrade ? ` · upgradable: ${build.model.networkUpgrade}` : ''}`}>
                <p className="mb-2 text-xs tracking-wide text-muted uppercase">Drive size</p>
                <div className="flex flex-wrap gap-2">
                  <Choice active={a.driveCap == null} onClick={() => set({ driveCap: null })}>Auto</Choice>
                  {P.capacities.map((c) => (
                    <Choice key={c} active={a.driveCap === c} disabled={!can.caps.has(c)} onClick={() => set({ driveCap: c })}>{c} TB</Choice>
                  ))}
                </div>
                <p className="mt-5 mb-2 text-xs tracking-wide text-muted uppercase">Drive line</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Choice active={a.driveLine == null} onClick={() => set({ driveLine: null })}>Auto</Choice>
                  {pricedLines.map((l) => (
                    <Choice key={l} active={a.driveLine === l} disabled={!can.lines.has(l)} onClick={() => set({ driveLine: l })} sub={lineSpec(l)?.driveClass}>
                      {l}
                    </Choice>
                  ))}
                </div>
                <div className="mt-5 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm">
                      <span className="font-medium">{build.drivesPerUnit * build.units} × {build.driveCap} TB {build.driveLine}</span>
                      <span className="text-muted"> · {inr(build.drive.quote)} each</span>
                    </p>
                    {lineSpec(build.driveLine) && <InfoButton label={`${build.driveLine} specifications`} onClick={() => setDialog({ kind: 'line', item: lineSpec(build.driveLine) })} />}
                  </div>
                  <ul className="mt-2 grid gap-1.5">
                    {compatibilityNotes(build, lineSpec(build.driveLine)).map((note) => (
                      <li key={note} className="text-xs leading-relaxed text-muted">· {note}</li>
                    ))}
                  </ul>
                </div>
              </Step>
            )}

            {/* 09 Upgrades: hidden entirely when nothing is priced */}
            {P.upgrades.length > 0 && (
              <Step n={6} title="RAM & network upgrades" hint="Charged per unit.">
                <div className="grid gap-3 sm:grid-cols-2">
                  {[['RAM', ram, 'ramSku'], ['Network card', nic, 'nicSku']].map(([label, items, key]) => items.length > 0 && (
                    <label key={key}>
                      <span className="mb-1.5 block text-sm text-muted">{label}</span>
                      <select value={a[key] ?? ''} onChange={(e) => set({ [key]: e.target.value || null })} className="field">
                        <option value="">None</option>
                        {items.map((u) => <option key={u.sku} value={u.sku}>{u.name} · {inr(u.quote)}</option>)}
                      </select>
                    </label>
                  ))}
                </div>
              </Step>
            )}

            {/* 10 Services */}
            <Step n={P.upgrades.length ? 7 : 6} title="Installation & support">
              <div className="grid gap-2 sm:grid-cols-2">
                <Toggle checked={a.includeInstall} onChange={(v) => set({ includeInstall: v })} label="Installation & setup" sub={`${inr(P.install.quote)} per unit`} />
                <Toggle checked={a.includeAMC} onChange={(v) => set({ includeAMC: v })} label="AMC, first year" sub={`${Math.round(P.amcRate.quote * 100)}% of hardware`} />
              </div>
            </Step>
          </>
        )}
      </div>

      {/* Estimate: sticky on desktop */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div ref={panelRef} className="glass liquid rounded-[1.75rem] p-6">
          <div className="flex items-center justify-between">
            <p className="eyebrow">{sales ? 'Internal estimate' : 'Your estimate'}</p>
            {sales && <span className="rounded-full bg-amber-300/15 px-2.5 py-1 text-[0.65rem] text-amber-200">Floors visible</span>}
          </div>
          {build && price ? (
            <>
              <h3 className="mt-4 text-xl font-medium tracking-tight">{build.units > 1 ? `${build.units} × ` : ''}{build.model.brand} {build.model.model}</h3>
              <p className="mt-1 text-sm text-muted">
                {build.drivesPerUnit * build.units} × {build.driveCap} TB {build.driveLine} · {RAID_INFO[build.raid].title} · <span className="text-white">{build.totalUsable} TB usable</span>
              </p>
              <table className="mt-5 w-full text-sm">
                {hasFloor && (
                  <thead>
                    <tr className="text-xs text-subtle"><th /><th className="pb-2 text-right font-normal">Quote</th><th className="pb-2 text-right font-normal">Floor</th></tr>
                  </thead>
                )}
                <tbody>
                  {lines.map((l) => (
                    <tr key={l.key} className={l.total ? 'border-t border-white/20 text-base font-medium' : l.subtotal ? 'border-t border-line' : ''}>
                      <td className="py-2 pr-3">
                        <span className={l.subtotal || l.total ? '' : 'text-white/80'}>{l.label}</span>
                        {l.basis && <span className="block text-xs text-subtle">{l.basis}</span>}
                      </td>
                      <td className="py-2 text-right whitespace-nowrap">{inr(l.quote)}</td>
                      {hasFloor && <td className="py-2 pl-3 text-right whitespace-nowrap text-amber-200/80">{inr(l.floor)}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-xs text-subtle">
                {inr(price.perTB)} per usable TB · all prices GST inclusive
              </p>
              {hasFloor && (
                <p className="mt-3 rounded-xl bg-amber-300/10 px-3 py-2 text-sm text-amber-100">
                  Room to negotiate: <span className="font-medium">{inr(room)}</span> ({((room / price.total) * 100).toFixed(1)}%)
                </p>
              )}
              {sales && !price.floor && (
                <p className="mt-3 text-xs text-amber-100/80">No floor on record for this unit or drive, so no floor is shown.</p>
              )}
              {sales ? (
                <CopySummary text={leadSummary(build, price, a, d)} />
              ) : (
                <button onClick={() => { setQuoteOpen(true); requestAnimationFrame(() => document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })); }} className="magnetic btn btn-primary mt-5 w-full">
                  Request this quote
                </button>
              )}
            </>
          ) : (
            <p className="mt-4 text-sm text-muted">{d.error ?? 'Choose your storage to see an estimate.'}</p>
          )}
        </div>

        {!sales && quoteOpen && build && (
          <div id="quote-form" className="mt-4">
            <EnquiryForm
              type="configurator"
              title="Get this quote"
              submitLabel="Send Request"
              payload={{
                summary: leadSummary(build, price, a, d),
                configuration: {
                  model: build.model.model, brand: build.model.brand, units: build.units, drives: build.drivesPerUnit * build.units,
                  driveCap: build.driveCap, driveLine: build.driveLine, raid: build.raid, usableTB: build.totalUsable,
                  install: a.includeInstall, amc: a.includeAMC, ramSku: a.ramSku, nicSku: a.nicSku,
                },
                estimate: { hardware: price.hardware, total: Math.round(price.total) },
              }}
            />
          </div>
        )}
      </div>

      {/* Mobile bar when the estimate is off screen */}
      {build && price && !panelVisible && (
        <div className="glass fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-3 rounded-full !bg-black/70 py-2 pr-2 pl-5 lg:hidden">
          <div className="min-w-0 text-sm">
            <p className="truncate font-medium">{build.model.model} · {build.totalUsable} TB</p>
            <p className="text-xs text-muted">{inr(price.total)} GST incl.</p>
          </div>
          <button onClick={() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="btn btn-primary !py-2 !text-xs">View estimate</button>
        </div>
      )}

      <Dialog open={dialog?.kind === 'model'} onClose={() => setDialog(null)} title={dialog?.kind === 'model' ? `${dialog.item.brand} ${dialog.item.model}` : ''}>
        {dialog?.kind === 'model' && (
          <>
            {dialog.item.summary && <p className="mb-3 text-sm text-muted">{dialog.item.summary}</p>}
            <SpecTable rows={modelSpecRows(dialog.item)} />
          </>
        )}
      </Dialog>
      <Dialog open={dialog?.kind === 'line'} onClose={() => setDialog(null)} title={dialog?.kind === 'line' ? dialog.item.name : ''}>
        {dialog?.kind === 'line' && (
          <>
            {dialog.item.bestFor && <p className="mb-3 text-sm text-muted">Best for: {dialog.item.bestFor}</p>}
            <SpecTable rows={driveLineRows(dialog.item)} />
          </>
        )}
      </Dialog>
    </div>
  );
}

function CopySummary({ text }) {
  const [state, setState] = useState('idle');
  return (
    <button
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); setState('done'); } catch { setState('fail'); }
        setTimeout(() => setState('idle'), 2000);
      }}
      className="btn btn-glass mt-5 w-full"
    >
      {state === 'done' ? <Check className="size-4" /> : state === 'fail' ? <Loader2 className="size-4" /> : <Copy className="size-4" />}
      {state === 'done' ? 'Copied' : state === 'fail' ? 'Copy failed' : 'Copy summary for the customer'}
    </button>
  );
}
