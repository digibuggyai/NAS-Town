import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { api } from '../lib/api.js';
import { usePricing } from '../lib/nas/usePricing.js';
import { RAID_INFO, bestBuildPerModel, inr, networkFor, suggestBuilds } from '../lib/nas/logic.js';
import NasVisual from './NasVisual.jsx';

const steps = [
  {
    key: 'storing', title: 'What are you storing?',
    options: [['photos', 'Photos'], ['videos', 'Videos'], ['business', 'Business Files'], ['backup', 'Backups'], ['surveillance', 'Surveillance']],
  },
  {
    key: 'capacity', title: 'How much storage do you need?',
    options: [['10tb', 'Up to 10 TB'], ['20tb', '10–20 TB'], ['50tb', '20–50 TB'], ['50plus', '50 TB+']],
  },
  {
    key: 'work_style', title: 'How will you use it?',
    options: [['home', 'Home'], ['creator', 'Creator'], ['business', 'Business'], ['enterprise', 'Enterprise']],
  },
];

// Each band is sized to its upper end; 50 TB+ starts at 60 TB and the configurator can go higher.
const TARGET = { '10tb': 10, '20tb': 20, '50tb': 50, '50plus': 60 };

/** Answers → the three best-value complete builds from the live price list. */
function recommend(P, { storing, capacity, work_style }) {
  const targetTB = TARGET[capacity] ?? 10;
  // Enterprise gets two-drive protection; small home setups may use a simple mirror.
  const raids = work_style === 'enterprise' ? ['RAID6'] : work_style === 'home' && targetTB <= 20 ? ['RAID1', 'RAID5'] : ['RAID5'];
  const catalogue = { models: P.models, hddPricing: P.hddPricing, capacities: P.capacities, brand: 'any', bays: null, expandableOnly: false };
  let builds = raids.flatMap((raid) => suggestBuilds({ targetTB, raid, ...catalogue }));
  // Video work wants fast networking; prefer 2.5GbE+ units when any qualify.
  if (storing === 'videos') {
    const fast = builds.filter((b) => /2\.5GbE|10GbE/.test(b.model.network));
    if (fast.length) builds = fast;
  }
  builds.sort((a, b) => a.totalQuote - b.totalQuote || a.units - b.units);
  return { targetTB, builds: bestBuildPerModel(builds).slice(0, 3) };
}

export default function Finder() {
  const { pricing, error: pricingError } = usePricing('public');
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const complete = steps.every((s) => answers[s.key]);

  function submit() {
    if (!pricing) return;
    const r = recommend(pricing, answers);
    setResult(r);
    api.logFinder({ ...answers, recommended: r.builds.map((b) => b.model.slug) }).catch(() => {});
  }

  if (result) {
    return (
      <div>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Your matches</p>
            <h3 className="mt-3 text-2xl font-medium tracking-tight">We'd start with these.</h3>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setAnswers({}); setResult(null); }} className="btn btn-secondary"><RotateCcw className="size-4" /> Start over</button>
            <Link to="/about#contact" className="btn btn-primary">Talk to an Expert</Link>
          </div>
        </div>
        {result.builds.length === 0 ? (
          <p className="glass rounded-xl p-8 text-muted">Nothing on our list reaches that size in one setup. Our team can plan a larger deployment for you.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {result.builds.map((b, i) => (
              <article key={b.model.id} className="glass flex flex-col rounded-xl p-5">
                <div className="rounded-lg bg-surface px-6 pt-5 pb-1">
                  <NasVisual bays={b.model.bays} className="mx-auto h-32 w-auto" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="eyebrow !text-[0.62rem]">{b.model.brand}</span>
                  {i === 0 && <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[0.65rem] text-accent">Best value</span>}
                </div>
                <h4 className="mt-2 text-lg font-medium">{b.units > 1 ? `${b.units} × ` : ''}{b.model.model}</h4>
                <p className="mt-1 text-sm text-muted">
                  {b.drivesPerUnit * b.units} × {b.driveCap} TB {b.driveLine} · {RAID_INFO[b.raid].title}
                </p>
                <p className="text-sm text-muted">{b.totalUsable} TB usable · {networkFor(b.model).speed}</p>
                <p className="mt-auto pt-4 text-xl font-medium">{inr(b.totalQuote)}</p>
                <p className="text-xs text-subtle">Hardware, GST inclusive</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link to={`/products/${b.model.slug}`} className="btn btn-secondary !px-3 !py-2.5 !text-sm">Details</Link>
                  <Link to={`/tools/configurator?model=${b.model.slug}&target=${result.targetTB}&raid=${b.raid}`} className="btn btn-primary !px-3 !py-2.5 !text-sm">Configure</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 sm:p-10">
      <ol className="grid gap-8 lg:grid-cols-3 lg:gap-6">
        {steps.map((step, i) => {
          const active = i === 0 || answers[steps[i - 1].key];
          return (
            <li key={step.key} className={`transition-opacity duration-500 ${active ? '' : 'opacity-35'}`}>
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm text-accent">0{i + 1}</span>
                <h3 className="text-base font-medium">{step.title}</h3>
              </div>
              <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={step.title}>
                {step.options.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    disabled={!active}
                    aria-pressed={answers[step.key] === value}
                    onClick={() => setAnswers((a) => ({ ...a, [step.key]: value }))}
                    className="chip disabled:cursor-not-allowed"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-10 flex flex-col items-start gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {pricingError ? 'Pricing is unavailable right now. Please try again shortly.' : complete ? 'All set. Let’s find your NAS.' : `${steps.filter((s) => answers[s.key]).length} of 3 answered`}
        </p>
        <button onClick={submit} disabled={!complete || !pricing} className="btn btn-primary disabled:opacity-40">
          Find My NAS <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
