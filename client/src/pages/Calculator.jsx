import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import PageHero from '../components/PageHero.jsx';
import Reveal from '../components/Reveal.jsx';
import { useProducts } from '../lib/hooks.js';
import { formatInr } from '../lib/api.js';
import { defaultRaid, raidLevels } from '../lib/raid.js';

const videoPresets = [
  ['1080p H.264', 15],
  ['4K H.265', 45],
  ['4K H.264', 90],
  ['4K ProRes 422', 330],
];
const driveSizes = [4, 8, 12, 16, 20];
const bayOptions = [2, 4, 5, 8];

function Slider({ label, value, onChange, min, max, step = 1, suffix = '' }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-mono">{value.toLocaleString('en-IN')}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-3 w-full accent-white" />
    </label>
  );
}

function NumberField({ label, value, onChange, prefix }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      <div className="relative">
        {prefix && <span className="absolute top-1/2 left-4 -translate-y-1/2 text-muted">{prefix}</span>}
        <input type="number" min={0} value={value} onChange={(e) => onChange(Number(e.target.value))} className={`field ${prefix ? 'pl-8' : ''}`} />
      </div>
    </label>
  );
}

export default function Calculator() {
  const [existingTb, setExistingTb] = useState(4);
  const [photosPerYear, setPhotosPerYear] = useState(20000);
  const [photoMb, setPhotoMb] = useState(30);
  const [videoHours, setVideoHours] = useState(40);
  const [videoPreset, setVideoPreset] = useState(1);
  const [devices, setDevices] = useState(3);
  const [deviceGb, setDeviceGb] = useState(500);
  const [years, setYears] = useState(3);
  // ROI assumptions, editable by the visitor.
  const [cloudPerTb, setCloudPerTb] = useState(350);
  const [drivePerTb, setDrivePerTb] = useState(1800);

  const { data: products } = useProducts();

  const r = useMemo(() => {
    const yearlyTb = (photosPerYear * photoMb) / 1e6 + (videoHours * videoPresets[videoPreset][1]) / 1000;
    const backupTb = (devices * deviceGb) / 1000;
    const base = existingTb + backupTb + yearlyTb * years;
    const needTb = Math.ceil(base * 1.2 * 10) / 10; // 20% headroom for versions and snapshots

    // Smallest bay count and drive size that covers the need with the default RAID level.
    let plan = null;
    for (const bays of bayOptions) {
      for (const size of driveSizes) {
        const raid = defaultRaid(bays);
        const usable = raidLevels[raid].usable(bays, size);
        if (usable >= needTb) { plan = { bays, size, raid, usable, raw: bays * size }; break; }
      }
      if (plan) break;
    }

    const nas = plan && products?.filter((p) => p.bays >= plan.bays && p.price_inr).sort((a, b) => a.price_inr - b.price_inr)[0];
    const nasCost = plan ? (nas?.price_inr ?? 0) + plan.raw * drivePerTb : null;
    const cloudMonthly = needTb * cloudPerTb;
    const cloudTotal = cloudMonthly * 12 * years;
    const breakEvenMonths = nasCost && cloudMonthly ? Math.ceil(nasCost / cloudMonthly) : null;

    return { yearlyTb, needTb, plan, nas, nasCost, cloudMonthly, cloudTotal, breakEvenMonths };
  }, [existingTb, photosPerYear, photoMb, videoHours, videoPreset, devices, deviceGb, years, cloudPerTb, drivePerTb, products]);

  return (
    <>
      <title>NAS ROI Calculator | NASTOWN</title>
      <PageHero
        eyebrow="NAS Tools · ROI Calculator"
        title="How Much Storage Do You Actually Need?"
        intro="Guessing your storage needs usually means buying too little, or paying for too much. Use our NAS Calculator to get a clear estimate based on your files, backup needs, and future growth."
      />
      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-24 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
        <Reveal className="glass rounded-[2rem] p-6 sm:p-8">
          <h2 className="text-xl font-medium">Your data</h2>
          <div className="mt-6 grid gap-7">
            <Slider label="Data you already have" value={existingTb} onChange={setExistingTb} min={0} max={100} suffix=" TB" />
            <Slider label="Photos per year" value={photosPerYear} onChange={setPhotosPerYear} min={0} max={200000} step={1000} />
            <Slider label="Average photo size" value={photoMb} onChange={setPhotoMb} min={2} max={120} suffix=" MB" />
            <Slider label="Hours of video per year" value={videoHours} onChange={setVideoHours} min={0} max={1000} step={5} suffix=" h" />
            <div>
              <p className="mb-3 text-sm text-muted">Video format</p>
              <div className="flex flex-wrap gap-2">
                {videoPresets.map(([label, gbh], i) => (
                  <button key={label} className="chip" aria-pressed={videoPreset === i} onClick={() => setVideoPreset(i)}>
                    {label} <span className="opacity-60">· {gbh} GB/h</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-7 sm:grid-cols-2">
              <Slider label="Devices to back up" value={devices} onChange={setDevices} min={0} max={50} />
              <Slider label="Per device" value={deviceGb} onChange={setDeviceGb} min={64} max={4000} step={64} suffix=" GB" />
            </div>
            <Slider label="Plan ahead for" value={years} onChange={setYears} min={1} max={5} suffix={years > 1 ? ' years' : ' year'} />
          </div>
          <h2 className="mt-10 text-xl font-medium">Cost assumptions</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField label="Cloud storage, per TB / month" value={cloudPerTb} onChange={setCloudPerTb} prefix="₹" />
            <NumberField label="NAS hard drive, per TB" value={drivePerTb} onChange={setDrivePerTb} prefix="₹" />
          </div>
        </Reveal>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal delay={100} className="glass liquid rounded-[2rem] p-6 sm:p-8">
            <p className="eyebrow">You need about</p>
            <p className="mt-3 text-5xl font-semibold tracking-tight">{r.needTb.toLocaleString('en-IN')} <span className="text-2xl text-muted">TB</span></p>
            <p className="mt-2 text-sm text-muted">Includes {years} {years > 1 ? 'years' : 'year'} of growth (≈ {r.yearlyTb.toFixed(1)} TB/yr) and 20% headroom for snapshots.</p>

            {r.plan ? (
              <div className="mt-8 grid grid-cols-2 gap-3">
                {[
                  ['Suggested', `${r.plan.bays}-bay NAS`],
                  ['Drives', `${r.plan.bays} × ${r.plan.size} TB`],
                  ['Protection', raidLevels[r.plan.raid].label],
                  ['Usable', `≈ ${r.plan.usable} TB`],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
                    <p className="text-xs text-subtle">{k}</p>
                    <p className="mt-1 font-medium">{v}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-8 rounded-2xl bg-white/[0.04] p-4 text-sm ring-1 ring-white/10">
                That's beyond a single 8-bay system. Talk to us about expansion units or enterprise storage.
              </p>
            )}

            {r.nasCost != null && (
              <div className="mt-8 border-t border-line pt-6">
                <p className="eyebrow mb-4">NAS vs cloud over {years} {years > 1 ? 'years' : 'year'}</p>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted">NAS + drives (one-time)</span><span>{formatInr(r.nasCost)}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Cloud ({formatInr(r.cloudMonthly)}/mo)</span><span>{formatInr(r.cloudTotal)}</span></div>
                </div>
                {r.breakEvenMonths && (
                  <p className="mt-4 text-base">
                    The NAS pays for itself in about <span className="font-semibold">{r.breakEvenMonths} months</span>.
                  </p>
                )}
                <p className="mt-2 text-xs text-subtle">Estimate only. Based on {r.nas ? r.nas.model : 'an indicative NAS price'} and your assumptions above.</p>
              </div>
            )}
            <div className="mt-8 grid gap-2 sm:grid-cols-2">
              <Link to="/tools/configurator" className="btn btn-primary">Build This NAS</Link>
              <Link to="/about#contact" className="btn btn-glass">Talk to an Expert</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
