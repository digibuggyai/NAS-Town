import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { brands } from '../data/site.js';

export default function Brands() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-28 sm:px-6">
      <SectionHeading eyebrow="Different platforms. One destination." title="Leading NAS *Brands.*">
        Explore trusted brands and find the right NAS for your needs.
      </SectionHeading>
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {brands.map((b, i) => (
          <Reveal key={b.slug} delay={i * 60}>
            <Link to={`/brands/${b.slug}`} className="tilt glass liquid group flex h-48 flex-col justify-between rounded-3xl p-7">
              <ArrowUpRight className="size-5 self-end text-white/30 transition-colors group-hover:text-white" />
              <div>
                <p className="text-2xl font-semibold tracking-tight">{b.name}</p>
                <p className="mt-1.5 text-sm text-muted">{b.tagline}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
      <div className="mt-12 text-center">
        <Link to="/brands/synology" className="btn btn-glass">Explore All Brands <ArrowRight className="size-4" /></Link>
      </div>
    </section>
  );
}
