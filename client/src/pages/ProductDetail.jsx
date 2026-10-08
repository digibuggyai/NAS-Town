import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import ProductPhoto, { useTilt } from '../components/ProductPhoto.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';
import Reveal from '../components/Reveal.jsx';
import { api, formatInr } from '../lib/api.js';
import { brandName } from '../data/site.js';
import NotFound from './NotFound.jsx';
import Seo, { SITE_URL } from '../components/Seo.jsx';
import { productMeta } from '../lib/seo.js';
import { preloaded } from '../lib/preload.js';

export default function ProductDetail() {
  const { slug } = useParams();
  const [state, setState] = useState(() => ({ product: preloaded(`/products/${encodeURIComponent(slug)}`) ?? null, error: null }));
  const { plateRef, handlers } = useTilt(); // photo follows the cursor

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
      <Seo {...productMeta(p, SITE_URL)} />
      <section className="mx-auto max-w-7xl px-4 pt-32 pb-20 sm:px-6 md:pt-40">
        <Link to="/products" className="-my-2 inline-flex items-center gap-2 py-2.5 text-sm text-muted hover:text-fg"><ArrowLeft className="size-4" /> All products</Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          {/* The photo stays in view while the specification list scrolls past (desktop). */}
          <Reveal className="glass self-start overflow-hidden rounded-xl lg:sticky lg:top-28">
            <div ref={plateRef} {...handlers} className="tilt grid h-80 place-items-center p-10 sm:h-[26rem]">
              <ProductPhoto model={p.shortModel ?? p.model} bays={p.bays} alt={p.model} eager className="tilt-media h-full w-full max-w-md" />
            </div>
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
