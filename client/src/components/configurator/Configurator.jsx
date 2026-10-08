import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Check, CheckCircle2, Copy, Download, Info, Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { usePricing } from '../../lib/nas/usePricing.js';
import { RAID_INFO, RAID_LEVELS, bestNetworkAmong, inr } from '../../lib/nas/logic.js';
import {
  BUDGET_PRESETS, CAPACITY_PRESETS, INITIAL_ANSWERS, derive, estimateLines, estimateRef, feasibleOptions, leadSummary, priceFor, speedFor,
} from '../../lib/nas/configure.js';
import {
  buildSpecs, classLabel, compareRows, driveLineSpecs, driveNotes, expansionBadge, findLine, keyDriveSpecs, keySpecs, modelSpecs,
} from '../../lib/nas/specs.js';
import { openEstimatePdf } from '../../lib/nas/estimatePdf.js';
import { api } from '../../lib/api.js';
import { Dialog } from './parts.jsx';
import { Badge, CheckTile, InfoHover, SpecList, StepCard, Tile } from './ui.jsx';
import { IntroPopup, QuoteOfferPopup } from './OfferPopups.jsx';

/* The NAS configurator: the same engine and question order as the DGB India configurator,
 * in NASTOWN's design. One Answers object in, everything else derived on every change.
 * `source="public"` reads the public price list; `source="sales"` (admin) reads the staff
 * payload and shows the floor beside every line. */

const SHORTLIST = 5;

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
  const [openedAt] = useState(() => Date.now()); // popup timings count from page open

  if (loading) {
    return (
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-4 xl:grid-cols-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-surface" />)}</div>
        <div className="h-[28rem] animate-pulse rounded-2xl bg-surface" />
      </div>
    );
  }
  if (error || !pricing) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-line bg-raised p-8 text-center">
        <AlertTriangle className="mx-auto size-8 text-warning" />
        <h2 className="mt-4 text-xl font-semibold">Pricing is unavailable right now</h2>
        <p className="mt-2 text-sm text-muted">{error?.status === 401 || error?.status === 403 ? 'Please sign in again.' : "We don't quote from old price lists. Try again in a moment, or talk to our team."}</p>
        <button onClick={reload} className="btn btn-primary mt-6"><RotateCcw className="size-4" /> Try again</button>
      </div>
    );
  }
  return <ConfiguratorLoaded P={pricing} sales={source === 'sales'} params={params} openedAt={openedAt} />;
}

function ConfiguratorLoaded({ P, sales, params, openedAt }) {
  const [a, setAnswers] = useState(() => initialAnswers(P, params));
  const [interacted, setInteracted] = useState(false);
  const set = (patch) => { setAnswers((prev) => ({ ...prev, ...patch })); setInteracted(true); };

  const d = useMemo(() => derive(a, P), [a, P]);
  const price = useMemo(() => priceFor(d.build, a, P), [d.build, a, P]);
  const can = useMemo(() => feasibleOptions(a, P, d), [a, P, d]);
  const lines = useMemo(() => estimateLines(d.build, price, a, P), [d.build, price, a, P]);
  const { net, speed } = useMemo(() => speedFor(d.build, price?.nicItem), [d.build, price]);
  const [ref] = useState(() => estimateRef());
  const build = d.build;
  const started = !d.pending; // nothing is selected or priced until a size or budget is chosen
  const summary = build && price ? leadSummary(d, build, price, speed, a, P, ref) : '';

  const [dialog, setDialog] = useState(null); // { kind: 'model' | 'line' | 'compare', item }
  const [showAll, setShowAll] = useState(false);
  const [quoteSent, setQuoteSent] = useState(false);
  const [pdfBlocked, setPdfBlocked] = useState(false);

  const brands = useMemo(() => [...new Set(P.models.map((m) => m.brand))].sort(), [P]);
  const bayTiers = useMemo(() => [...new Set(P.models.map((m) => m.bays))].sort((x, y) => x - y), [P]);
  const pricedLines = useMemo(() => {
    const priced = new Set(Object.values(P.hddPricing).flatMap((l) => Object.keys(l)));
    const order = (name) => P.driveLines.find((l) => l.name === name)?.sortOrder ?? 999;
    return [...priced].sort((x, y) => order(x) - order(y) || x.localeCompare(y));
  }, [P]);
  const lineSpec = (name) => findLine(P.driveLines, name);
  const expandableCount = P.models.filter((m) => m.expandable).length;
  const mostBays = Math.max(0, ...P.models.map((m) => m.baysWithExpansion ?? 0));
  const bayHint = (tier) => {
    const b = can.bayPool.find((x) => x.model.bays === tier);
    return b ? `${b.drivesPerUnit}× ${b.driveCap} TB${b.units > 1 ? ` · ${b.units} units` : ''}` : "Can't reach the target";
  };
  const ram = P.upgrades.filter((u) => u.category === 'RAM');
  const nic = P.upgrades.filter((u) => u.category === 'NIC');
  const options = showAll ? d.options : d.options.slice(0, SHORTLIST);
  const better = useMemo(() => {
    const best = bestNetworkAmong(d.options);
    return best && net && best.topGb > net.topGb ? best : null;
  }, [d.options, net]);

  // Mobile: a bar with the running total appears once the estimate panel is out of view.
  const panelRef = useRef(null);
  const [panelVisible, setPanelVisible] = useState(true);
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setPanelVisible(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const [quoteOpen, setQuoteOpen] = useState(false); // the formal-quotation form, in a popup
  const downloadPdf = () => {
    if (!build || !price) return;
    setPdfBlocked(!openEstimatePdf({ ref, build, price, lines, raid: d.raid, speed, mode: d.mode, targetTB: d.targetTB, budget: a.budget }));
  };

  const { popup, closePopup, offer, setOffer } = useOfferPopups({ enabled: !sales, interacted, quoteReady: Boolean(build && price), quoteSent, openedAt });
  const hasFloor = sales && price?.floor;
  const room = hasFloor ? price.total - price.floor.total : null;
  let n = 0; // step numbers, so a hidden step doesn't leave a gap

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="grid gap-4 xl:grid-cols-2">
        {/* 1 Storage */}
        <StepCard
          n={++n}
          title="How much storage do you need?"
          hint={a.storageMode === 'capacity' ? 'Usable space after RAID protection.' : 'Your budget covers the whole quote, including installation and AMC if ticked.'}
          aside={
            <div className="flex shrink-0 self-start rounded-full bg-surface p-1 text-xs ring-1 ring-line" role="group" aria-label="Size by">
              {[['capacity', 'By capacity'], ['budget', 'By budget']].map(([mode, label]) => (
                <button key={mode} onClick={() => set({ storageMode: mode })} aria-pressed={a.storageMode === mode} className={`rounded-full px-3 py-1.5 font-medium whitespace-nowrap transition-colors ${a.storageMode === mode ? 'bg-fg text-white' : 'text-muted hover:text-fg'}`}>
                  {label}
                </button>
              ))}
            </div>
          }
        >
          {a.storageMode === 'capacity' ? (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  aria-label="Usable storage"
                  value={d.sizes.includes(d.targetTB) ? d.targetTB : ''}
                  onChange={(e) => set({ targetTB: Number(e.target.value) })}
                  className="field !w-auto min-w-36 !py-2.5 text-base font-semibold"
                >
                  {!started && <option value="" disabled>Select size</option>}
                  {d.sizes.map((s) => <option key={s} value={s}>{s} TB</option>)}
                </select>
                <span className="text-sm text-muted">{started ? <>usable at {RAID_INFO[a.raid].title}</> : 'Pick a size, or tap one below'}</span>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {CAPACITY_PRESETS.map((tb) => <Tile key={tb} active={d.targetTB === tb} onClick={() => set({ targetTB: tb })} title={`${tb} TB`} className="justify-center text-center" />)}
              </div>
              {d.movedFrom != null ? (
                <p className="mt-3 flex gap-2 text-sm text-warning"><Info className="mt-0.5 size-4 shrink-0" /> Showing {d.targetTB} TB: {d.movedFrom} TB can't be built from whole drives at {RAID_INFO[a.raid].title}.</p>
              ) : started && (
                <p className="mt-3 text-xs text-subtle">{d.sizes.length} sizes can be built at {RAID_INFO[a.raid].title}. Other figures can't be made from whole drives.</p>
              )}
            </>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 xl:grid-cols-3 2xl:grid-cols-5">
                {BUDGET_PRESETS.map((b) => <Tile key={b} active={a.budget === b} onClick={() => set({ budget: b })} title={inr(b)} className="justify-center text-center" />)}
              </div>
              <label className="mt-3 flex max-w-xs items-center gap-2">
                <span className="text-sm whitespace-nowrap text-muted">Or enter ₹</span>
                <input type="number" min={0} step={5000} value={a.budget ?? ''} onChange={(e) => set({ budget: e.target.value === '' ? null : Number(e.target.value) })} className="field !py-2" aria-label="Budget in rupees" />
              </label>
            </>
          )}
        </StepCard>

        {/* 2 RAID */}
        <StepCard n={++n} locked={!started} title="RAID Protection" hint="How drives are arranged: how much raw capacity is usable, and how many drive failures the array survives.">
          <div className="grid gap-2">
            {a.storageMode === 'budget' && (
              <Tile active={started && a.raidAuto} onClick={() => set({ raidAuto: true })} title={<span className="inline-flex items-center gap-1.5"><Sparkles className="size-3.5" /> Let us choose</span>} aside={<span className="shrink-0 pt-0.5 text-xs text-subtle">Most space, with protection</span>} />
            )}
            {RAID_LEVELS.map((r) => (
              <Tile
                key={r}
                active={started && (a.storageMode === 'capacity' || !a.raidAuto) && a.raid === r}
                onClick={() => set({ raid: r, raidAuto: false })}
                title={RAID_INFO[r].title}
                aside={<span className="shrink-0 pt-0.5 text-xs text-subtle">{RAID_INFO[r].sub}</span>}
              />
            ))}
          </div>
          {a.storageMode === 'budget' && a.raidAuto && !d.error && (
            <p className="mt-3 text-sm text-muted">We chose <span className="font-medium text-fg">{RAID_INFO[d.raid].title}</span>: the most usable space this budget buys{d.redundant ? ', with protection.' : '.'}</p>
          )}
          {d.raid === 'RAID0' && !d.error && (
            <p className="mt-3 flex items-start gap-2 text-sm text-warning"><AlertTriangle className="mt-0.5 size-4 shrink-0" /> RAID 0 has no redundancy: one failed drive loses all data.</p>
          )}
        </StepCard>

        {/* 3 Bays */}
        <StepCard n={++n} locked={!started} title="Drive bays" hint="How many drives the unit holds. Auto picks the size that fits best.">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Tile active={started && a.bays == null} onClick={() => set({ bays: null })} title="Auto" sub="Best fit" />
            {bayTiers.map((t) => (
              <Tile key={t} active={a.bays === t} disabled={started && !can.bays.has(t)} onClick={() => set({ bays: t })} title={`${t}-bay`} sub={started ? bayHint(t) : undefined} />
            ))}
          </div>
        </StepCard>

        {/* 4 Brand */}
        <StepCard n={++n} locked={!started} title="Brand" hint="Leave it open unless you have a preference: it widens what we can recommend.">
          <div className="grid grid-cols-3 gap-2">
            <Tile active={started && a.brand === 'any'} onClick={() => set({ brand: 'any' })} title="Any" sub="Recommend from all" />
            {brands.map((b) => <Tile key={b} active={a.brand === b} onClick={() => set({ brand: b })} title={b} sub={`${P.models.filter((m) => m.brand === b).length} units`} />)}
          </div>
        </StepCard>

        {/* 5 Room to expand */}
        <StepCard n={++n} wide locked={!started} title="Room to expand" hint="Optional. Some units take an expansion enclosure for more drives later.">
          <div className="grid items-center gap-3 sm:grid-cols-2">
            <CheckTile checked={a.expandable} onChange={(v) => set({ expandable: v })} title="I want room to expand later" sub="Only recommend units that take an expansion unit" />
            <p className="text-sm text-muted">{expandableCount} of {P.models.length} units take an expansion unit{mostBays ? <>, the largest growing to {mostBays} bays</> : null}.</p>
          </div>
        </StepCard>

        {d.error ? (
          <div className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/5 p-5 text-sm xl:col-span-2">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
            <p>{d.error}</p>
          </div>
        ) : build && (
          <>
            {/* 6 Recommended unit */}
            <StepCard n={++n} wide title="Recommended NAS" hint="Worked out from your choices: unit, drives and drive count together, best value first.">
              <p className="mb-3 text-sm text-muted">
                {d.mode === 'budget'
                  ? <>The most storage {inr(a.budget)} buys at {RAID_INFO[d.raid].title}.</>
                  : <>Our recommendation for {d.targetTB} TB at {RAID_INFO[d.raid].title}.</>} Pick another if you prefer.
              </p>
              <ul className="grid gap-2">
                {options.map((b, i) => {
                  const selected = build.model.id === b.model.id;
                  const exp = expansionBadge(b.model);
                  return (
                    <li key={b.model.id}>
                      <div
                        role="button"
                        tabIndex={0}
                        aria-pressed={selected}
                        onClick={() => set({ modelId: b.model.id, autoPick: false })}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), set({ modelId: b.model.id, autoPick: false }))}
                        className={`flex cursor-pointer flex-col gap-3 rounded-xl p-4 ring-1 transition-colors sm:flex-row sm:items-center ${selected ? 'bg-accent-soft ring-2 ring-accent' : 'ring-line hover:bg-surface'}`}
                      >
                        <span className={`hidden size-5 shrink-0 place-items-center rounded-full ring-1 sm:grid ${selected ? 'bg-accent text-white ring-accent' : 'ring-line-strong'}`}>
                          {selected && <Check className="size-3" strokeWidth={3} />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-center gap-1.5">
                            <span className="font-semibold">{b.model.model}</span>
                            <Badge>{b.model.brand}</Badge>
                            {i === 0 && <Badge tone="accent">Recommended</Badge>}
                            {exp && <Badge tone="tint">{exp}</Badge>}
                            <InfoHover label={`${b.model.brand} ${b.model.model} specifications`} specs={keySpecs(b.model)} onOpen={() => setDialog({ kind: 'model', item: b })} align="left" />
                          </p>
                          <p className="mt-1 text-sm text-muted">
                            {b.units > 1 && `${b.units} units · `}{b.drivesPerUnit * b.units}× {b.driveCap} TB {b.driveLine} in {b.model.bays} bays · {b.totalUsable} TB usable · {b.spareBays * b.units} spare {b.spareBays * b.units === 1 ? 'bay' : 'bays'}
                          </p>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-lg font-semibold tabular-nums">{inr(b.totalQuote)}</p>
                          <p className="text-xs text-subtle">Unit + drives, incl. GST</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                {d.options.length > SHORTLIST && (
                  <button onClick={() => setShowAll((v) => !v)} className="py-2 font-medium text-accent hover:underline">
                    {showAll ? 'Show fewer units' : `Show ${d.options.length - SHORTLIST} more units`}
                  </button>
                )}
                {options.length > 1 && (
                  <button onClick={() => setDialog({ kind: 'compare' })} className="py-2 font-medium text-accent hover:underline">Compare {Math.min(options.length, 6)} units side by side</button>
                )}
                {!d.autoPick && (
                  <button onClick={() => set({ autoPick: true, modelId: null })} className="inline-flex items-center gap-1.5 py-2 text-muted hover:text-fg"><RotateCcw className="size-3.5" /> Back to the recommendation</button>
                )}
              </div>
            </StepCard>

            {/* 7 Network: shown, never asked */}
            <StepCard n={++n} title="Network speed" hint="What the recommended unit connects at out of the box.">
              <p className="text-sm"><span className="font-medium">{build.model.model}</span> ships with <span className="font-medium">{build.model.network || 'no network ports on record'}</span>.</p>
              {better && <p className="mt-1 text-sm text-muted">Need more throughput? The {better.model.model} has {better.builtIn} built in.</p>}
              <div className="mt-4 rounded-xl bg-surface p-4 ring-1 ring-line">
                <p className="text-xs font-semibold tracking-wide text-subtle uppercase">Connects at</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">{speed ?? '—'}</p>
                <p className="text-xs text-muted">{build.model.network} built in</p>
                {build.model.networkUpgrade && <p className="mt-2 border-t border-line pt-2 text-xs text-muted">Can be upgraded: {build.model.networkUpgrade}</p>}
              </div>
            </StepCard>

            {/* 8 Drives */}
            <StepCard n={++n} title="Drives" hint="We pick these for you. Choose a size or drive line and the recommendation updates.">
              <p className="text-sm">Recommended: <span className="font-medium">{price.totalDrives}× {build.driveCap} TB {build.driveLine}</span> <span className="text-muted">· {inr(build.drive.quote)} each</span></p>
              <p className="mt-4 mb-2 text-xs font-semibold tracking-wide text-subtle uppercase">Drive size</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                <Tile active={a.driveCap == null} onClick={() => set({ driveCap: null })} title="Auto" />
                {P.capacities.map((c) => <Tile key={c} active={a.driveCap === c} disabled={!can.caps.has(c)} onClick={() => set({ driveCap: c })} title={`${c} TB`} />)}
              </div>
              <p className="mt-5 mb-2 text-xs font-semibold tracking-wide text-subtle uppercase">Drive line</p>
              <div className="grid grid-cols-2 gap-2">
                <Tile active={a.driveLine == null} onClick={() => set({ driveLine: null })} title="Auto" sub="Best value" />
                {pricedLines.map((l) => {
                  const spec = lineSpec(l);
                  return (
                    <Tile
                      key={l}
                      active={a.driveLine === l}
                      disabled={!can.lines.has(l)}
                      onClick={() => set({ driveLine: l })}
                      title={l}
                      sub={classLabel(spec) ?? undefined}
                      aside={spec && <InfoHover label={`${l} specifications`} specs={keyDriveSpecs(spec)} onOpen={() => setDialog({ kind: 'line', item: spec })} />}
                    />
                  );
                })}
              </div>
              <ul className="mt-4 grid gap-2">
                {driveNotes(build.model, lineSpec(build.driveLine), build.drivesPerUnit).map((note) => (
                  <li key={note.text} className={`flex gap-2 rounded-lg px-3 py-2 text-xs leading-relaxed ${note.tone === 'warn' ? 'bg-warning/10 text-warning' : 'bg-surface text-muted'}`}>
                    {note.tone === 'warn' ? <AlertTriangle className="mt-0.5 size-3.5 shrink-0" /> : <Info className="mt-0.5 size-3.5 shrink-0" />}
                    {note.text}
                  </li>
                ))}
              </ul>
            </StepCard>

            {/* 9 Upgrades: hidden entirely when nothing is priced */}
            {P.upgrades.length > 0 && (
              <StepCard n={++n} title="RAM & network upgrades" hint="Charged per unit.">
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
              </StepCard>
            )}

            {/* 10 Installation & support */}
            <StepCard n={++n} wide={P.upgrades.length === 0} title="Installation & support" hint="Both optional.">
              <div className="grid gap-2 sm:grid-cols-2">
                <CheckTile checked={a.includeInstall} onChange={(v) => set({ includeInstall: v })} title="On-site installation & setup" sub="Racking, RAID configuration and network setup. Charged per NAS unit." price={inr(P.install.quote)} priceSub="per unit" />
                <CheckTile checked={a.includeAMC} onChange={(v) => set({ includeAMC: v })} title="Annual maintenance (AMC)" sub="Ongoing support, charged on the hardware value. Installation isn't included." price={`${Math.round(P.amcRate.quote * 100)}%`} priceSub="of hardware" />
              </div>
            </StepCard>

          </>
        )}
      </div>

      {/* Estimate: sticky on desktop */}
      <aside ref={panelRef} className="lg:sticky lg:top-24" aria-label="Your estimate">
        <div className="overflow-hidden rounded-2xl border border-line bg-raised shadow-[0_18px_40px_-24px_rgb(15_23_42/0.35)]">
          <div className="bg-fg px-5 py-5 text-white">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold tracking-[0.14em] text-white/60 uppercase">{sales ? 'Internal estimate' : 'Your estimate'}</p>
              {sales && <span className="rounded-full bg-warning px-2.5 py-0.5 text-[0.7rem] font-semibold text-white">Floors visible</span>}
            </div>
            {build && price ? (
              <>
                <p className="mt-2 font-display text-2xl leading-tight font-semibold text-white">{build.units > 1 ? `${build.units} × ` : ''}{build.model.model}</p>
                <p className="text-sm text-white/70">{build.model.brand} · {build.model.bays}-bay NAS</p>
              </>
            ) : <p className="mt-2 text-sm text-white/70">{started ? 'Adjust your choices to see an estimate.' : 'Nothing selected yet.'}</p>}
          </div>

          {build && price ? (
            <div className="p-5">
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-line ring-1 ring-line">
                {[['Usable', `${build.totalUsable} TB`], ['RAID', RAID_INFO[d.raid].title], ['Drives', `${price.totalDrives} × ${build.driveCap} TB`], ['Network', speed ?? '—']].map(([k, v]) => (
                  <div key={k} className="bg-raised px-3 py-2.5">
                    <dt className="text-[0.7rem] font-semibold tracking-wide text-subtle uppercase">{k}</dt>
                    <dd className="text-sm font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>

              <table className="mt-4 w-full text-sm">
                {hasFloor && (
                  <thead><tr className="text-xs text-subtle"><th /><th className="pb-2 text-right font-normal">Quote</th><th className="pb-2 pl-3 text-right font-normal">Floor</th></tr></thead>
                )}
                <tbody>
                  {lines.filter((l) => !l.total).map((l) => (
                    <tr key={l.key} className={l.subtotal ? 'border-t border-line' : ''}>
                      <td className="py-2 pr-3">
                        <span className={l.subtotal ? 'text-muted' : 'font-medium'}>{l.key === 'nas' ? 'NAS unit' : l.key === 'hdd' ? 'Hard drives' : l.label}</span>
                        {l.basis && <span className="block text-xs text-subtle">{l.basis}</span>}
                      </td>
                      <td className="py-2 text-right whitespace-nowrap tabular-nums">{inr(l.quote)}</td>
                      {hasFloor && <td className="py-2 pl-3 text-right whitespace-nowrap text-warning tabular-nums">{inr(l.floor)}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2 flex items-baseline justify-between border-t-2 border-fg pt-3">
                <span className="text-sm font-semibold">Total <span className="font-normal text-subtle">incl. GST</span></span>
                <span className="font-display text-2xl font-semibold tabular-nums">{inr(price.total)}</span>
              </div>
              {hasFloor && <p className="mt-1 text-right text-xs text-warning tabular-nums">Floor {inr(price.floor.total)}</p>}
              <p className="mt-1 text-xs text-subtle">{inr(price.perTB)} per usable TB</p>

              {hasFloor && (
                <p className="mt-3 rounded-xl bg-warning/10 px-3 py-2 text-sm text-warning">Room to negotiate: <span className="font-semibold">{inr(room)}</span> ({((room / price.total) * 100).toFixed(1)}%)</p>
              )}
              {sales && !price.floor && <p className="mt-3 text-xs text-warning">No floor on record for this unit or drive, so no floor is shown.</p>}

              <div className="mt-5 grid gap-2">
                {sales ? <CopySummary text={summary} /> : (
                  <button onClick={() => setQuoteOpen(true)} className="btn btn-primary w-full">{quoteSent ? <><CheckCircle2 className="size-4" /> Quotation requested</> : 'Request formal quotation'}</button>
                )}
                <button onClick={downloadPdf} className="btn btn-secondary w-full"><Download className="size-4" /> Download estimate (PDF)</button>
                {pdfBlocked && <p className="text-xs text-warning">Your browser blocked the estimate window. Allow pop-ups for this site and try again.</p>}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-subtle">
                Prices include GST and come from our live price list. This is an estimate: availability and final pricing are confirmed in your formal quotation. Ref {ref}.
              </p>
            </div>
          ) : (
            <p className="p-5 text-sm text-muted">{d.error ?? 'Choose how much storage you need, or your budget. We then suggest the NAS, drives and RAID level, and the price builds up here.'}</p>
          )}
        </div>
      </aside>

      {/* Mobile bar when the estimate panel is off screen */}
      {build && price && !panelVisible && (
        <div className="fixed bottom-3 left-3 right-[5.25rem] z-40 flex items-center justify-between gap-3 rounded-2xl bg-fg py-2.5 pr-2.5 pl-4 text-white shadow-2xl lg:hidden">
          <div className="min-w-0 text-sm">
            <p className="truncate font-semibold">{build.model.model} · {build.totalUsable} TB</p>
            <p className="text-xs text-white/70 tabular-nums">{inr(price.total)} incl. GST</p>
          </div>
          <button onClick={() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="btn !bg-white !py-2 !text-xs !text-fg">View estimate</button>
        </div>
      )}

      {/* Specifications and comparison */}
      <Dialog open={dialog?.kind === 'model'} onClose={() => setDialog(null)} title={dialog?.kind === 'model' ? `${dialog.item.model.brand} ${dialog.item.model.model}` : ''}>
        {dialog?.kind === 'model' && (
          <>
            {dialog.item.model.summary && <p className="mb-3 text-sm text-muted">{dialog.item.model.summary}</p>}
            <p className="mb-1 text-xs font-semibold tracking-wide text-subtle uppercase">This configuration</p>
            <SpecList specs={buildSpecs(dialog.item, d.raid)} />
            <p className="mt-5 mb-1 text-xs font-semibold tracking-wide text-subtle uppercase">The unit</p>
            <SpecList specs={modelSpecs(dialog.item.model)} />
            {dialog.item.model.specsUrl && <a href={dialog.item.model.specsUrl} target="_blank" rel="noopener" className="link mt-4 inline-block text-sm">Manufacturer's specifications</a>}
          </>
        )}
      </Dialog>
      <Dialog open={dialog?.kind === 'line'} onClose={() => setDialog(null)} title={dialog?.kind === 'line' ? `${dialog.item.name} drives` : ''}>
        {dialog?.kind === 'line' && (
          <>
            {dialog.item.bestFor && <p className="mb-3 text-sm text-muted">{dialog.item.bestFor}</p>}
            <SpecList specs={driveLineSpecs(dialog.item)} />
            {dialog.item.specsUrl && <a href={dialog.item.specsUrl} target="_blank" rel="noopener" className="link mt-4 inline-block text-sm">Manufacturer's specifications</a>}
          </>
        )}
      </Dialog>
      <Dialog wide open={dialog?.kind === 'compare'} onClose={() => setDialog(null)} title="Compare units">
        {dialog?.kind === 'compare' && <CompareTable builds={options.slice(0, 6)} raid={d.raid} selectedId={build?.model.id} onPick={(id) => { set({ modelId: id, autoPick: false }); setDialog(null); }} />}
      </Dialog>

      {!sales && build && price && (
        <Dialog open={quoteOpen} onClose={() => setQuoteOpen(false)} title="Get a formal quotation">
          <div className="pb-2">
            <p className="text-sm text-muted">Send us this configuration and our team will confirm availability and final pricing.</p>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 text-sm ring-1 ring-line">
              <span className="min-w-0"><span className="font-semibold">{build.units > 1 ? `${build.units} × ` : ''}{build.model.brand} {build.model.model}</span><span className="block text-xs text-muted">{price.totalDrives} × {build.driveCap} TB {build.driveLine} · {RAID_INFO[d.raid].title} · {build.totalUsable} TB usable</span></span>
              <span className="font-semibold whitespace-nowrap tabular-nums">{inr(price.total)}</span>
            </div>
            <div className="mt-5">
              <QuoteForm refCode={ref} summary={summary} build={build} price={price} a={a} d={d} sent={quoteSent} onSent={() => setQuoteSent(true)} onDone={() => setQuoteOpen(false)} />
            </div>
          </div>
        </Dialog>
      )}

      {!sales && (
        <>
          <IntroPopup open={popup === 'intro'} onClose={closePopup} offer={offer} onOffer={setOffer} />
          <QuoteOfferPopup open={popup === 'quote'} onClose={closePopup} build={build} price={price} summary={summary} offer={offer} onOffer={setOffer} />
        </>
      )}
    </div>
  );
}

function CompareTable({ builds, raid, selectedId, onPick }) {
  const rows = compareRows(builds, raid);
  return (
    <div className="-mx-6 overflow-x-auto px-6">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="sticky left-0 bg-raised py-3 pr-4 font-normal text-subtle" />
            {builds.map((b) => (
              <th key={b.model.id} className="px-3 py-3 align-bottom">
                <span className="block font-semibold">{b.model.model}</span>
                <button onClick={() => onPick(b.model.id)} className={`mt-1.5 rounded-full px-2.5 py-1 text-xs ${b.model.id === selectedId ? 'bg-accent text-white' : 'text-accent ring-1 ring-accent/40 hover:bg-accent-soft'}`}>
                  {b.model.id === selectedId ? 'Selected' : 'Choose this'}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-line last:border-0">
              <td className="sticky left-0 bg-raised py-2.5 pr-4 text-subtle">{r.label}</td>
              {r.values.map((v, i) => <td key={i} className={`px-3 py-2.5 ${r.label === 'Unit + drives' ? 'font-semibold tabular-nums' : ''}`}>{v}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The inline formal-quotation request: files a lead with the full configuration. */
function QuoteForm({ refCode, summary, build, price, a, d, sent, onSent, onDone }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setError('');
    try {
      await api.enquire({
        type: 'configurator',
        name: f.name,
        email: f.email,
        phone: f.phone,
        message: [f.company && `Company: ${f.company}`, f.city && `City: ${f.city}`].filter(Boolean).join('\n'),
        payload: {
          ref: refCode,
          company: f.company || null,
          city: f.city || null,
          summary,
          configuration: {
            model: build.model.model, brand: build.model.brand, units: build.units, drives: price.totalDrives,
            driveCap: build.driveCap, driveLine: build.driveLine, raid: d.raid, usableTB: build.totalUsable,
            install: a.includeInstall, amc: a.includeAMC, ramSku: a.ramSku, nicSku: a.nicSku,
          },
          estimate: { hardware: Math.round(price.hardware), total: Math.round(price.total) },
        },
      });
      onSent();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  if (sent) {
    return (
      <div role="status">
        <div className="flex items-start gap-3 rounded-xl bg-success/10 p-4 text-sm">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
          <p>Thank you. We've received your configuration (ref <span className="font-semibold">{refCode}</span>) and will send your formal quotation shortly.</p>
        </div>
        <button type="button" onClick={onDone} className="btn btn-secondary mt-4 w-full">Back to the configurator</button>
      </div>
    );
  }
  const field = 'field !py-2.5';
  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <label><span className="mb-1.5 block text-sm text-muted">Your name <span className="text-error">*</span></span><input name="name" required autoComplete="name" placeholder="Full name" className={field} /></label>
      <label><span className="mb-1.5 block text-sm text-muted">Company</span><input name="company" autoComplete="organization" placeholder="Company name (optional)" className={field} /></label>
      <label><span className="mb-1.5 block text-sm text-muted">Email <span className="text-error">*</span></span><input name="email" type="email" required autoComplete="email" placeholder="you@company.com" className={field} /></label>
      <label><span className="mb-1.5 block text-sm text-muted">Phone</span><input name="phone" type="tel" autoComplete="tel" placeholder="Phone number" className={field} /></label>
      <label className="sm:col-span-2"><span className="mb-1.5 block text-sm text-muted">City</span><input name="city" autoComplete="address-level2" placeholder="City" className={field} /></label>
      {error && <p role="alert" className="text-sm text-error sm:col-span-2">{error}</p>}
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button disabled={busy} className="btn btn-primary">{busy && <Loader2 className="size-4 animate-spin" />}Request formal quotation</button>
        <p className="text-xs text-subtle">Your configuration and estimate ({inr(price.total)}) are sent with the request.</p>
      </div>
    </form>
  );
}

function CopySummary({ text }) {
  const [state, setState] = useState('idle');
  async function copy() {
    try { await navigator.clipboard.writeText(text); setState('done'); } catch { setState('fail'); }
    setTimeout(() => setState('idle'), 2000);
  }
  return (
    <button onClick={copy} className="btn btn-primary w-full">
      {state === 'done' ? <Check className="size-4" /> : <Copy className="size-4" />}
      {state === 'done' ? 'Copied' : state === 'fail' ? 'Copy failed' : 'Copy summary for the customer'}
    </button>
  );
}

/* Offer popups, at most two per visit:
 *   'intro': 10 s after the configurator opens, if the visitor hasn't touched anything yet.
 *   'quote': 10 s after they start configuring (it shows their own quote).
 * Neither opens once they've requested the formal quotation. */
const OFFER_DELAY_MS = 10000;

function useOfferPopups({ enabled, interacted, quoteReady, quoteSent, openedAt }) {
  const [popup, setPopup] = useState(null);
  const [offer, setOffer] = useState(null);
  const shown = useRef(new Set());
  const now = useRef({});
  now.current = { interacted, quoteReady, quoteSent };

  const show = (kind) => {
    if (shown.current.has(kind) || shown.current.size >= 2 || now.current.quoteSent) return;
    shown.current.add(kind);
    setPopup(kind);
  };

  useEffect(() => {
    if (!enabled) return;
    const t = setTimeout(() => !now.current.interacted && show('intro'), Math.max(0, OFFER_DELAY_MS - (Date.now() - openedAt)));
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !interacted) return;
    const t = setTimeout(() => now.current.quoteReady && show('quote'), OFFER_DELAY_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, interacted]);

  return { popup, closePopup: () => setPopup(null), offer, setOffer };
}
