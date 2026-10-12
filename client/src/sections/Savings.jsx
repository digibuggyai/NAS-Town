import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import Button from '../components/Button.jsx';
import { formatInr } from '../lib/api.js';
import { usePricing } from '../lib/nas/usePricing.js';
import { RAID_INFO, autoBuildableSizes, suggestAutoBuilds } from '../lib/nas/logic.js';

/* "See what you save": the NAS against cloud storage and external drives over the years.
 * Pre-filled from the Finder (storage needed and its top pick); works on its own too.
 * Hardware prices come from the live price list. The cloud price is the visitor's own
 * assumption (editable), and external drives are priced from the same drive list. */

const videoPresets = [['1080p H.264', 15], ['4K H.265', 45], ['4K H.264', 90], ['4K ProRes 422', 330]];

function Slider({ label, value, onChange, min, max, step = 1, suffix = '' }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-mono">{value.toLocaleString('en-IN')}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-3 w-full accent-fg" />
    </label>
  );
}

/** The old storage calculator, now optional: works out how much you need from your files. */
function Estimator({ onEstimate }) {
  const [existingTb, setExistingTb] = useState(4);
  const [photosPerYear, setPhotosPerYear] = useState(20000);
  const [photoMb, setPhotoMb] = useState(30);
  const [videoHours, setVideoHours] = useState(40);
  const [videoPreset, setVideoPreset] = useState(1);
  const [devices, setDevices] = useState(3);
  const [deviceGb, setDeviceGb] = useState(500);
  const [growthYears, setGrowthYears] = useState(3);
  const yearlyTb = (photosPerYear * photoMb) / 1e6 + (videoHours * videoPresets[videoPreset][1]) / 1000;
  const needTb = Math.ceil((existingTb + (devices * deviceGb) / 1000 + yearlyTb * growthYears) * 1.2); // 20% headroom for snapshots
  return (
    <div className="grid gap-6 pt-5">
      <Slider label="Data you already have" value={existingTb} onChange={setExistingTb} min={0} max={100} suffix=" TB" />
      <div className="grid gap-6 sm:grid-cols-2">
        <Slider label="Photos per year" value={photosPerYear} onChange={setPhotosPerYear} min={0} max={200000} step={1000} />
        <Slider label="Average photo size" value={photoMb} onChange={setPhotoMb} min={2} max={120} suffix=" MB" />
      </div>
      <Slider label="Hours of video per year" value={videoHours} onChange={setVideoHours} min={0} max={1000} step={5} suffix=" h" />
      <div>
        <p className="mb-3 text-sm text-muted">Video format</p>
        <div className="flex flex-wrap gap-2">
          {videoPresets.map(([label, gbh], i) => (
            <button key={label} type="button" className="chip !text-[0.8125rem]" aria-pressed={videoPreset === i} onClick={() => setVideoPreset(i)}>{label} <span className="opacity-60">· {gbh} GB/h</span></button>
          ))}
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Slider label="Devices to back up" value={devices} onChange={setDevices} min={0} max={50} />
        <Slider label="Per device" value={deviceGb} onChange={setDeviceGb} min={64} max={4000} step={64} suffix=" GB" />
      </div>
      <Slider label="Plan for growth over" value={growthYears} onChange={setGrowthYears} min={1} max={5} suffix={growthYears > 1 ? ' years' : ' year'} />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 ring-1 ring-line">
        <p className="text-sm">You need about <span className="font-semibold">{needTb} TB</span> <span className="text-subtle">(≈ {yearlyTb.toFixed(1)} TB/yr growth, +20% headroom)</span></p>
        <Button size="sm" onClick={() => onEstimate(Math.max(2, needTb))}>Use {needTb} TB</Button>
      </div>
    </div>
  );
}

export default function Savings({ preset }) {
  const { pricing: P, error: pricingError } = usePricing('public');
  const [needTb, setNeedTb] = useState(preset?.targetTB ?? 20);
  const [years, setYears] = useState(5);
  const [cloudPerTb, setCloudPerTb] = useState(350); // ₹ per TB per month: the visitor's assumption
  const [estimating, setEstimating] = useState(false);

  // A new Finder answer re-fills the savings with its size.
  useEffect(() => { if (preset?.targetTB) setNeedTb(preset.targetTB); }, [preset]);

  const r = useMemo(() => {
    if (!P) return null;
    const catalogue = { models: P.models, hddPricing: P.hddPricing, capacities: P.capacities, brand: 'any', bays: null, expandableOnly: false };
    // The Finder's pick if it covers the need, else the best-value protected build from the price list.
    let build = preset?.build && preset.build.totalUsable >= needTb ? preset.build : null;
    if (!build) {
      const target = autoBuildableSizes(catalogue).find((s) => s >= needTb);
      build = target ? suggestAutoBuilds({ targetTB: target, ...catalogue })[0] ?? null : null;
    }
    // External drives: the data plus a second copy (one drive has no protection), at the
    // cheapest per-TB drive on the same price list. USB enclosures are extra.
    const perTb = Math.min(...Object.entries(P.hddPricing).flatMap(([cap, lines]) => Object.values(lines).map((d) => d.quote / Number(cap))));
    const external = Math.round(needTb * 2 * perTb);
    const cloudMonthly = needTb * cloudPerTb;
    const cloud = cloudMonthly * 12 * years;
    const nas = build?.totalQuote ?? null;
    return { build, nas, cloud, cloudMonthly, external, perTb, breakEven: nas && cloudMonthly ? Math.ceil(nas / cloudMonthly) : null };
  }, [P, preset, needTb, years, cloudPerTb]);

  const rows = r ? [
    { key: 'nas', label: 'NAS + drives', note: r.build ? `$${r.build.model.brand} ${r.build.model.model}, ${r.build.drivesPerUnit} × ${r.build.driveCap} TB, ${RAID_INFO[r.build.raid].title} · one-time, GST incl.` : 'Beyond what we quote online', value: r.nas },
    { key: 'cloud', label: 'Cloud subscription', note: `${formatInr(r.cloudMonthly)}/month for ${years} ${years > 1 ? 'years' : 'year'}, at your price per TB`, value: r.cloud },
    { key: 'ext', label: 'External drives', note: `Two copies of ${needTb} TB at ${formatInr(Math.round(r.perTb))}/TB (our drive list); no RAID, no remote access`, value: r.external },
  ] : [];
  const max = Math.max(1, ...rows.map((x) => x.value ?? 0));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
      <div className="glass rounded-xl p-6 sm:p-8">
        <h3 className="text-xl font-medium">Your numbers</h3>
        <div className="mt-6 grid gap-7">
          <div>
            <Slider label="Storage you need" value={needTb} onChange={setNeedTb} min={2} max={150} suffix=" TB" />
            {preset?.targetTB && <p className="mt-2 text-xs text-subtle">Filled in from your Finder answers. Change it freely.</p>}
          </div>
          <div>
            <p className="mb-3 text-sm text-muted">Compare over</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Years">
              {[3, 4, 5].map((y) => <button key={y} type="button" className="chip" aria-pressed={years === y} onClick={() => setYears(y)}>{y} years</button>)}
            </div>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm text-muted">Cloud storage price you pay, per TB per month</span>
            <div className="relative max-w-56">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-muted">₹</span>
              <input type="number" min={0} value={cloudPerTb} onChange={(e) => setCloudPerTb(Math.max(0, Number(e.target.value)))} className="field pl-8" />
            </div>
          </label>
        </div>
        <div className="mt-8 border-t border-line pt-5">
          <button type="button" onClick={() => setEstimating((v) => !v)} aria-expanded={estimating} className="flex min-h-11 w-full items-center justify-between text-left font-medium">
            <span className="inline-flex items-center gap-2"><SlidersHorizontal className="size-4 text-accent" aria-hidden /> Not sure how much you need? Estimate it from your files</span>
            <ChevronDown className={`size-5 text-subtle transition-transform ${estimating ? 'rotate-180' : ''}`} aria-hidden />
          </button>
          {estimating && <Estimator onEstimate={(tb) => { setNeedTb(tb); setEstimating(false); }} />}
        </div>
      </div>

      <div className="glass rounded-xl p-6 sm:p-8 lg:sticky lg:top-28 lg:self-start">
        <p className="eyebrow">Over {years} years, {needTb} TB costs about</p>
        {!r ? (
          <p className="mt-6 text-sm text-muted">{pricingError ? 'Pricing is unavailable right now. Please try again shortly.' : 'Loading prices…'}</p>
        ) : (
          <>
            <ul className="mt-6 grid gap-5">
              {rows.map((row) => (
                <li key={row.key}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-medium">{row.label}</span>
                    <span className="text-lg font-semibold tabular-nums">{row.value != null ? formatInr(row.value) : '—'}</span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface ring-1 ring-line">
                    <div className={`h-full rounded-full transition-[width] duration-500 ${row.key === 'nas' ? 'bg-accent' : 'bg-line-strong'}`} style={{ width: `${((row.value ?? 0) / max) * 100}%` }} />
                  </div>
                  <p className="mt-1.5 text-xs text-subtle">{row.note}</p>
                </li>
              ))}
            </ul>
            {r.nas != null && r.cloud > r.nas && (
              <p className="mt-6 rounded-xl bg-accent-soft px-4 py-3 text-accent-strong">
                The NAS costs <span className="font-semibold">{formatInr(r.cloud - r.nas)}</span> less than the cloud over {years} years, and pays for itself in about <span className="font-semibold">{r.breakEven} months</span>.
              </p>
            )}
            <p className="mt-4 text-xs text-subtle">Estimate only. NAS and drive prices are from our current price list (GST incl.); the cloud price is yours to set. Installation and AMC are optional extras in the configurator.</p>
            {r.build && (
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                <Button to={`/tools/configurator?model=${r.build.model.slug}&target=${r.build.totalUsable}&raid=${r.build.raid}`}>Configure this NAS</Button>
                <Button variant="secondary" to={`/products/${r.build.model.slug}`}>View details</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
