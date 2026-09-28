import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import NasVisual from '../components/NasVisual.jsx';
import { useProducts } from '../lib/hooks.js';
import { formatInr } from '../lib/api.js';
import { brandName } from '../data/site.js';
import { featured } from '../data/home.js';

const speed = (ports = '') => {
  const top = Math.max(0, ...[...String(ports).matchAll(/(\d+(?:\.\d+)?)\s*GbE/gi)].map((m) => Number(m[1])));
  return top >= 10 ? '10GbE' : top >= 2.5 ? '2.5GbE' : '1GbE';
};

const ROWS = [
  ['Drive bays', (p) => (p.bays_with_expansion ? `${p.bays} (up to ${p.bays_with_expansion})` : p.bays)],
  ['Processor', (p) => p.cpu],
  ['Memory', (p) => p.memory],
  ['Network', (p) => `${speed(p.network)}${p.networkUpgrade ? ', upgradable' : ''}`],
  ['Largest drive', (p) => (p.max_drive_tb ? `${p.max_drive_tb} TB per bay` : '—')],
  ['RAID levels', (p) => p.raid?.map((r) => r.replace('RAID', '')).join(' / ')],
  ['Best for', (p) => p.best_for?.split('•').map((s) => s.trim()).join(', ')],
  ['Price', (p) => <span className="font-semibold text-fg">{formatInr(p.price_inr)}</span>],
];

// Side-by-side comparison of the featured models; the middle one is highlighted.
export default function CompareTable() {
  const { data, loading, error } = useProducts({ featured: true });
  const models = (data ?? []).slice(0, 3);
  const hi = models.length === 3 ? 1 : 0;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-20">
      <Reveal className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="eyebrow mb-3">{featured.eyebrow}</p>
          <h2 className="h-section">{featured.title}</h2>
          <p className="mt-4 text-lg leading-relaxed">{featured.body}</p>
        </div>
        <Link to="/products" className="link inline-flex items-center gap-1">
          {featured.cta} <ChevronRight className="size-4" />
        </Link>
      </Reveal>

      <Reveal delay={100} className="mt-10 overflow-x-auto rounded-2xl border border-line bg-white shadow-[0_12px_32px_-20px_rgb(15_23_42/0.25)]">
        {loading && <div className="h-96 animate-pulse bg-surface" />}
        {error && <p className="p-8 text-muted">Products can't be loaded right now. Please refresh in a moment.</p>}
        {models.length > 0 && (
          <table className="w-full min-w-[720px] border-collapse text-left text-[0.95rem]">
            <thead>
              <tr>
                <th scope="col" className="w-[22%] border-b border-line bg-surface px-5 py-4 align-bottom font-semibold text-fg">Feature</th>
                {models.map((p, i) => (
                  <th key={p.slug} scope="col" className={`border-b border-l border-line px-5 py-4 text-center align-bottom ${i === hi ? 'bg-accent-soft' : 'bg-surface'}`}>
                    <NasVisual bays={p.bays} className="mx-auto h-16 w-auto" />
                    <span className="mt-2 block text-xs font-medium text-subtle">{brandName(p.brand)} · {p.bays}-bay</span>
                    <span className={`block font-display text-[1.05rem] font-semibold ${i === hi ? 'text-accent' : 'text-fg'}`}>{p.shortModel ?? p.model}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([label, get]) => (
                <tr key={label}>
                  <th scope="row" className="border-b border-line px-5 py-4 font-semibold text-fg">{label}</th>
                  {models.map((p, i) => (
                    <td key={p.slug} className={`border-b border-l border-line px-5 py-4 text-center text-body ${i === hi ? 'bg-[#f5f8ff]' : ''}`}>
                      {get(p) ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="px-5 py-4" />
                {models.map((p, i) => (
                  <td key={p.slug} className={`border-l border-line px-5 py-4 text-center ${i === hi ? 'bg-[#f5f8ff]' : ''}`}>
                    <div className="flex flex-col items-center gap-2">
                      <Link to={`/tools/configurator?model=${p.slug}`} className={`btn !min-h-9 !px-4 !py-2 !text-sm ${i === hi ? 'btn-primary' : 'btn-secondary'}`}>Configure</Link>
                      <Link to={`/products/${p.slug}`} className="link text-sm">View details</Link>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        )}
      </Reveal>
      <p className="mt-3 text-xs text-subtle">Diskless unit prices, GST inclusive. Add drives, installation and AMC in the configurator.</p>
    </section>
  );
}
