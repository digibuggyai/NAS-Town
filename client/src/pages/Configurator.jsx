import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import PageHero from '../components/PageHero.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';
import NasVisual from '../components/NasVisual.jsx';
import Reveal from '../components/Reveal.jsx';
import { useProducts } from '../lib/hooks.js';
import { formatInr } from '../lib/api.js';
import { defaultRaid, raidLevels, raidValid } from '../lib/raid.js';

const driveSizes = [4, 8, 12, 16, 20, 24];
const useCases = ['Home', 'Photography', 'Video editing', 'Business', 'Surveillance', 'Backup'];
const addOns = ['Installation', 'RAID Setup', 'Data Migration', 'AMC', 'On-Site Support'];

function Step({ n, title, children }) {
  return (
    <Reveal className="glass rounded-[2rem] p-6 sm:p-8">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-sm text-accent">0{n}</span>
        <h2 className="text-xl font-medium">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </Reveal>
  );
}

export default function Configurator() {
  const [params] = useSearchParams();
  const { data: products } = useProducts();
  const [slug, setSlug] = useState(params.get('model'));
  const [drives, setDrives] = useState(4);
  const [size, setSize] = useState(8);
  const [raid, setRaid] = useState('raid5');
  const [useCase, setUseCase] = useState('Business');
  const [extras, setExtras] = useState(['Installation', 'RAID Setup']);

  const product = products?.find((p) => p.slug === slug) ?? products?.[0];

  // Keep drive count and RAID level valid when the chosen NAS changes.
  useEffect(() => {
    if (!product) return;
    setDrives(product.bays);
    setRaid(defaultRaid(product.bays));
  }, [product?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!raidValid(raid, drives)) setRaid(defaultRaid(drives));
  }, [drives, raid]);

  const summary = useMemo(() => {
    const level = raidLevels[raid];
    return {
      raw: drives * size,
      usable: raidValid(raid, drives) ? level.usable(drives, size) : 0,
      tolerance: level.tolerance,
      label: level.label,
      note: level.note,
    };
  }, [drives, size, raid]);

  const toggleExtra = (x) => setExtras((e) => (e.includes(x) ? e.filter((y) => y !== x) : [...e, x]));
  const config = product && {
    product: product.slug, model: product.model, drives, drive_size_tb: size, raid: summary.label,
    raw_tb: summary.raw, usable_tb: summary.usable, use_case: useCase, add_ons: extras,
  };

  return (
    <>
      <title>NAS Configurator | NASTOWN</title>
      <PageHero
        eyebrow="NAS Tools · Configurator"
        title="Build Your Perfect NAS Setup"
        intro="Answer a few questions about your use case, budget, and performance needs, and our NAS Configurator will recommend the right system and drive setup for you."
      />
      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-24 sm:px-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-5">
          <Step n={1} title="What will it do?">
            <div className="flex flex-wrap gap-2">
              {useCases.map((u) => <button key={u} className="chip" aria-pressed={useCase === u} onClick={() => setUseCase(u)}>{u}</button>)}
            </div>
          </Step>

          <Step n={2} title="Choose your NAS">
            {!products ? (
              <div className="h-24 animate-pulse rounded-2xl bg-white/5" />
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {products.map((p) => (
                  <button
                    key={p.slug}
                    onClick={() => setSlug(p.slug)}
                    aria-pressed={product?.slug === p.slug}
                    className="rounded-2xl p-4 text-left ring-1 ring-white/10 transition-all hover:bg-white/5 aria-pressed:bg-white aria-pressed:text-black aria-pressed:ring-white"
                  >
                    <p className="font-medium">{p.model}</p>
                    <p className="mt-0.5 text-sm opacity-60">{p.key_spec} · {formatInr(p.price_inr)}</p>
                  </button>
                ))}
              </div>
            )}
          </Step>

          <Step n={3} title="Drives">
            <p className="mb-3 text-sm text-muted">How many drives</p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: product?.bays ?? 4 }, (_, i) => i + 1).map((n) => (
                <button key={n} className="chip min-w-12" aria-pressed={drives === n} onClick={() => setDrives(n)}>{n}</button>
              ))}
            </div>
            <p className="mt-6 mb-3 text-sm text-muted">Size of each drive</p>
            <div className="flex flex-wrap gap-2">
              {driveSizes.map((s) => <button key={s} className="chip" aria-pressed={size === s} onClick={() => setSize(s)}>{s} TB</button>)}
            </div>
          </Step>

          <Step n={4} title="Protection (RAID)">
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(raidLevels).map(([key, r]) => {
                const ok = raidValid(key, drives);
                return (
                  <button
                    key={key}
                    disabled={!ok}
                    onClick={() => setRaid(key)}
                    aria-pressed={raid === key}
                    className="rounded-2xl p-4 text-left ring-1 ring-white/10 transition-all hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30 aria-pressed:bg-white aria-pressed:text-black aria-pressed:ring-white"
                  >
                    <p className="font-medium">{r.label}</p>
                    <p className="mt-0.5 text-sm opacity-60">{ok ? r.note : `Needs ${r.even ? 'an even number of' : `at least ${r.min}`} drives`}</p>
                  </button>
                );
              })}
            </div>
          </Step>

          <Step n={5} title="Add services">
            <div className="flex flex-wrap gap-2">
              {addOns.map((a) => <button key={a} className="chip" aria-pressed={extras.includes(a)} onClick={() => toggleExtra(a)}>{a}</button>)}
            </div>
          </Step>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal delay={100} className="glass liquid rounded-[2rem] p-6 sm:p-8">
            <p className="eyebrow">Your build</p>
            <NasVisual bays={product?.bays ?? 4} className="mx-auto mt-4 w-2/3" />
            <h3 className="mt-4 text-xl font-semibold">{product?.model ?? '–'}</h3>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                ['Raw', `${summary.raw} TB`],
                ['Usable', `≈ ${summary.usable} TB`],
                ['RAID', summary.label],
                ['Survives', summary.tolerance ? `${summary.tolerance} drive failure${summary.tolerance > 1 ? 's' : ''}` : 'No failures'],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
                  <p className="text-xs text-subtle">{k}</p>
                  <p className="mt-1 font-medium">{v}</p>
                </div>
              ))}
            </div>
            {summary.tolerance === 0 && <p className="mt-4 text-sm text-amber-200/90">RAID 0 has no protection: one drive failure loses everything.</p>}
            <p className="mt-6 text-sm text-muted">NAS from {formatInr(product?.price_inr)} (indicative). We'll quote drives and services with your build.</p>
          </Reveal>
        </div>
      </section>

      {config && (
        <section className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
          <EnquiryForm type="configurator" title="Get a quote for this build" payload={{ config }} submitLabel="Request Quote" />
        </section>
      )}
    </>
  );
}
