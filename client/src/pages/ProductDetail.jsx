import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import NasVisual from '../components/NasVisual.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';
import Reveal from '../components/Reveal.jsx';
import { api, formatInr } from '../lib/api.js';
import { brandName } from '../data/site.js';
import NotFound from './NotFound.jsx';

export default function ProductDetail() {
  const { slug } = useParams();
  const [state, setState] = useState({ product: null, error: null });

  useEffect(() => {
    setState({ product: null, error: null });
    api.product(slug).then((product) => setState({ product, error: null })).catch((error) => setState({ product: null, error }));
  }, [slug]);

  if (state.error) return <NotFound />;
  const p = state.product;
  if (!p) return <div className="mx-auto h-[70vh] max-w-7xl px-4 pt-40"><div className="glass h-full animate-pulse rounded-xl" /></div>;

  const specs = [
    ['Brand', brandName(p.brand)],
    ['Drive bays', p.bays_with_expansion ? `${p.bays} (${p.bays_with_expansion} with expansion)` : p.bays],
    ['RAID levels', p.raid?.map((r) => r.replace('RAID', '')).join(' / ')],
    ['Processor', p.cpu],
    ['Memory', p.memory],
    ['M.2 slots', p.m2_slots || 'None'],
    ['Networking', p.network],
    ['Network upgrade', p.networkUpgrade],
    ['Largest drive', p.max_drive_tb ? `${p.max_drive_tb} TB per bay` : null],
    ['Max raw capacity', p.max_raw_tb ? `${p.max_raw_tb} TB` : null],
    ['Warranty', p.warranty],
  ].filter(([, v]) => v != null && v !== '');

  return (
    <>
      <title>{`${p.model} | NASTOWN`}</title>
      <section className="mx-auto max-w-7xl px-4 pt-32 pb-20 sm:px-6 md:pt-40">
        <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg"><ArrowLeft className="size-4" /> All products</Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <Reveal className="glass grid place-items-center rounded-xl p-10">
            <NasVisual bays={p.bays} className="w-full max-w-md" />
          </Reveal>
          <Reveal delay={120}>
            <p className="eyebrow">{brandName(p.brand)} · {p.bays}-bay</p>
            <h1 className="heading mt-4 text-3xl sm:text-4xl">{p.model}</h1>
            <p className="mt-5 text-base text-muted">{p.summary}</p>
            <p className="mt-8 text-2xl font-semibold">{formatInr(p.price_inr)}</p>
            <p className="mt-1 text-xs text-subtle">Diskless unit price, GST inclusive. Build it with drives in the configurator for a complete quote.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={`/tools/configurator?model=${p.slug}`} className="btn btn-primary">Configure this NAS</Link>
              {p.rentable && <Link to="/rent" className="btn btn-secondary">Rent this NAS</Link>}
              <a href="#enquire" className="btn btn-secondary">Ask an Expert</a>
            </div>
            <dl className="glass mt-10 divide-y divide-line rounded-xl px-6">
              {specs.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 py-3.5 text-sm">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
        <div id="enquire" className="mx-auto mt-24 max-w-3xl scroll-mt-28">
          <EnquiryForm type="contact" title={`Ask about the ${p.model}`} payload={{ product: p.slug }} />
        </div>
      </section>
    </>
  );
}
