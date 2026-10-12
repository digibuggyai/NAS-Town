import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import Button from './Button.jsx';

/**
 * The configurator is the main way to get a price, so inner pages carry this strip.
 * `query` pre-fills it (e.g. "?target=20" on the 20 TB page, "?model=…" on a product).
 */
export default function ConfiguratorBand({ title = 'Price your exact NAS', body = 'Pick a size or a budget: the unit, drives, RAID level and a GST-inclusive total follow instantly.', query = '', cta = 'Build your NAS', className = '' }) {
  return (
    <section className={`mx-auto max-w-7xl px-4 sm:px-6 ${className}`}>
      <div className="flex flex-col gap-5 rounded-2xl bg-fg px-6 py-6 text-white shadow-[0_24px_50px_-30px_rgb(15_23_42/0.7)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-white"><SlidersHorizontal className="size-5" aria-hidden /></span>
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-white/60 uppercase">NAS Configurator</p>
            <h2 className="mt-1 text-xl font-semibold text-white">{title}</h2>
            <p className="mt-1 max-w-xl text-[0.95rem] text-white/75">{body}</p>
          </div>
        </div>
        <Button to={`/tools/configurator${query}`} className="shrink-0">{cta} <ArrowRight className="size-4" /></Button>
      </div>
    </section>
  );
}
