import { Link, useParams } from 'react-router';
import { ArrowRight, Check } from 'lucide-react';
import PageHero from '../components/PageHero.jsx';
import Reveal from '../components/Reveal.jsx';
import Seo from '../components/Seo.jsx';
import FinalCta from '../sections/FinalCta.jsx';
import { brandName, capacityPages } from '../data/site.js';
import { formatInr } from '../lib/api.js';
import { RAID_INFO } from '../lib/nas/logic.js';
import { usePricing } from '../lib/nas/usePricing.js';
import { capacityOptions, recommended, whatFits } from '../lib/nas/capacity.js';
import NotFound from './NotFound.jsx';

const unitName = (m) => `${brandName(m.brand)} ${m.model}`;
const drivesText = (b) => `${b.drivesPerUnit * b.units} × ${b.driveCap} TB ${b.driveLine}`;
const configureHref = (b, target) => `/tools/configurator?target=${target}&raid=${b.raid}&model=${b.model.slug}`;

// "NAS for 50TB" / "50TB NAS price" landing page: real builds and prices for one capacity.
export default function CapacityPage() {
  const { size } = useParams();
  const page = capacityPages.find((c) => `${c.tb}tb` === size);
  const { pricing: P, error } = usePricing('public');
  if (!page) return <NotFound />;

  const { tb } = page;
  const options = P ? capacityOptions(P, tb) : [];
  const { lead, picks } = recommended(options, tb);
  const from = options.length ? Math.min(...options.map((o) => o.builds[0].totalQuote)) : null;

  return (
    <>
      <Seo />
      <PageHero
        eyebrow={`NAS by capacity · ${tb}TB`}
        title={`${tb}TB NAS Storage: *Setup & Price* in India`}
        intro={`Need a NAS for ${tb}TB of data? ${page.who}`}
      >
        <a href="#builds" className="btn btn-primary">See {tb}TB builds</a>
        <Link to={`/tools/configurator?target=${tb}`} className="btn btn-secondary">Build my {tb}TB NAS</Link>
      </PageHero>

      {/* Sense of scale */}
      <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6">
        <Reveal>
          <h2 className="h-section">How much is {tb}TB?</h2>
          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            {whatFits(tb).map(([n, what, note]) => (
              // Label first in the markup, shown under the number.
              <div key={what} className="glass flex flex-col-reverse justify-end rounded-xl p-6">
                <dt className="mt-1 text-muted">{what} <span className="text-sm text-subtle">({note})</span></dt>
                <dd className="mono font-display text-3xl font-semibold text-fg">≈ {n.toLocaleString('en-IN')}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      {/* Recommended builds, live from the price list */}
      <section id="builds" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-16 sm:px-6">
        <Reveal>
          <h2 className="h-section">Recommended {tb}TB NAS builds</h2>
          <p className="measure mt-4 text-muted">{page.tip}</p>
        </Reveal>

        {error && <p className="mt-8 text-muted">Live prices are unavailable right now. <Link to="/about#contact" className="link">Ask our team</Link> for a {tb}TB quote.</p>}
        {!P && !error && <div className="mt-8 grid gap-5 md:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="glass h-64 animate-pulse rounded-xl" />)}</div>}

        {lead && (
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {picks.map((b, i) => (
              <Reveal key={b.model.id} delay={i * 80} className="glass flex flex-col rounded-xl p-6">
                <p className="eyebrow !text-xs">{i === 0 ? 'Best value' : `${b.model.bays}-bay option`}</p>
                <h3 className="mt-3 text-xl">
                  <Link to={`/products/${b.model.slug}`} className="hover:text-accent">{unitName(b.model)}</Link>
                  {b.units > 1 && <span className="text-muted"> × {b.units}</span>}
                </h3>
                <ul className="mt-4 grid gap-2 text-sm">
                  {[drivesText(b), `${RAID_INFO[b.raid].title}: ${b.totalUsable} TB usable`, `${b.model.bays} bays${b.spareBays > 0 ? `, ${b.spareBays} free to grow` : ''}`].map((t) => (
                    <li key={t} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-accent" /> {t}</li>
                  ))}
                </ul>
                <p className="mt-6 text-2xl font-semibold text-fg">{formatInr(b.totalQuote)}</p>
                <p className="text-xs text-subtle">NAS + drives, GST inclusive</p>
                <Link to={configureHref(b, lead.target)} className="btn btn-primary mt-6 self-start">
                  Configure this build <ArrowRight className="size-4" />
                </Link>
              </Reveal>
            ))}
          </div>
        )}
        {P && !lead && <p className="mt-8 text-muted">This size is specified per project. <Link to="/about#contact" className="link">Talk to our team</Link> for a {tb}TB quote.</p>}
      </section>

      {/* Price by protection level */}
      {options.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <Reveal>
            <h2 className="h-section">{tb}TB NAS price by RAID level</h2>
            <p className="measure mt-4 text-muted">
              More protection needs more drives for the same usable space. These are the lowest current prices for at least {tb}TB usable at each level.
            </p>
            {/* Phones: one card per level. */}
            <ul className="mt-8 grid gap-3 sm:hidden">
              {options.map(({ raid, builds: [b] }) => (
                <li key={raid} className="glass rounded-xl p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-medium text-fg">{RAID_INFO[raid].title}</span>
                    <span className="mono font-semibold text-fg">{formatInr(b.totalQuote)}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted">{drivesText(b)} · {b.totalUsable} TB usable · survives {RAID_INFO[raid].tolerance} drive failure{RAID_INFO[raid].tolerance > 1 ? 's' : ''}</p>
                </li>
              ))}
            </ul>
            <div className="glass mt-8 hidden overflow-x-auto rounded-xl sm:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface text-subtle">
                  <tr>{['Protection', 'Survives', 'Drives', 'Usable', 'From'].map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {options.map(({ raid, builds }) => {
                    const b = builds[0];
                    return (
                      <tr key={raid}>
                        <td className="px-5 py-3.5 font-medium text-fg">{RAID_INFO[raid].title}</td>
                        <td className="px-5 py-3.5">{RAID_INFO[raid].tolerance} drive failure{RAID_INFO[raid].tolerance > 1 ? 's' : ''}</td>
                        <td className="px-5 py-3.5">{drivesText(b)}</td>
                        <td className="px-5 py-3.5">{b.totalUsable} TB</td>
                        <td className="mono px-5 py-3.5 font-semibold text-fg">{formatInr(b.totalQuote)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Reveal>
        </section>
      )}

      {/* Questions people search for at this size */}
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <h2 className="h-section">{tb}TB NAS: common questions</h2>
        <div className="mt-6 grid gap-6">
          <div>
            <h3 className="text-lg">How much does a {tb}TB NAS cost in India?</h3>
            <p className="mt-2 text-muted">
              {from
                ? `A complete ${tb}TB NAS (unit and drives, GST inclusive) currently starts at ${formatInr(from)}. Installation and an AMC plan can be added in the configurator for a full quote.`
                : `It depends on the unit, the drives and the RAID level. Our team can quote a complete ${tb}TB setup, including installation.`}
            </p>
          </div>
          <div>
            <h3 className="text-lg">How many drives do I need for {tb}TB?</h3>
            <p className="mt-2 text-muted">
              {lead
                ? `Our best-value ${tb}TB build uses ${drivesText(picks[0])} in ${RAID_INFO[lead.raid].title}, giving ${picks[0].totalUsable} TB usable. With RAID, some space goes to protection, so you always need more raw capacity than usable space.`
                : 'It depends on the drive size and RAID level. With RAID, some space goes to protection, so you need more raw capacity than usable space.'}
            </p>
          </div>
          <div>
            {/* Small sizes choose between a mirror and RAID 5; big ones between RAID 5 and 6. */}
            {tb <= 10 ? (
              <>
                <h3 className="text-lg">RAID 1 or RAID 5 for {tb}TB?</h3>
                <p className="mt-2 text-muted">
                  RAID 1 mirrors two drives: simple, and a full copy survives if one fails. RAID 5 needs at least three drives but gives more usable
                  space per rupee as you grow. Both survive one drive failure. Either way, RAID is not a backup: keep a second copy off the NAS.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg">RAID 5 or RAID 6 for {tb}TB?</h3>
                <p className="mt-2 text-muted">
                  RAID 5 survives one drive failure and keeps the most usable space. RAID 6 survives two, at the cost of one more drive. The larger the
                  drives, the longer a rebuild takes, so for big arrays and data you can't replace, RAID 6 is the safer choice. Either way, RAID is not a
                  backup: keep a second copy off the NAS.
                </p>
              </>
            )}
          </div>
          <div>
            <h3 className="text-lg">Can you set up a {tb}TB NAS for me?</h3>
            <p className="mt-2 text-muted">
              Yes. We install the drives, build and verify the RAID array, and set up users, shared folders, backups and remote access.{' '}
              <Link to="/services/installation" className="link">See NAS installation</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* Other sizes: internal links for people and for search engines */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <p className="eyebrow mb-5">Other capacities</p>
        <div className="flex flex-wrap gap-2">
          {capacityPages.filter((c) => c.tb !== tb).map((c) => (
            <Link key={c.tb} to={`/nas/${c.tb}tb`} className="chip">{c.tb}TB NAS</Link>
          ))}
          <Link to="/tools/calculator" className="chip">Not sure? Calculate your storage</Link>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
