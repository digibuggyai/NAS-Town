import { Link } from 'react-router';
import { MessageCircle } from 'lucide-react';
import { Logo } from './Navbar.jsx';
import { digibuggy, productLinks, solutions, trackRecord } from '../data/site.js';

// Lucide no longer ships brand marks, so these are simple outline glyphs.
const glyph = (children) =>
  function Glyph({ className }) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
        {children}
      </svg>
    );
  };
const Instagram = glyph(<><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></>);
const Youtube = glyph(<><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 5 3-5 3z" fill="currentColor" /></>);
const Linkedin = glyph(<><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" /></>);
const Facebook = glyph(<path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6.5v3.5H9V21h3.5v-7.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z" />);
const XLogo = glyph(<path d="M4 4l16 16M20 4 4 20" />);

const ICONS = { WhatsApp: MessageCircle, Instagram, YouTube: Youtube, LinkedIn: Linkedin, Facebook, X: XLogo };

// Footer columns (optimised content). UGREEN is left out: it isn't in the catalogue.
const columns = [
  ['Products', productLinks.map(({ label, to }) => [label === 'All NAS Products' ? 'NAS Products' : label, to])],
  ['Solutions', solutions.map((s) => [`NAS for ${s.name}`, `/solutions/${s.slug}`])],
  ['Brands', [['Synology', '/brands/synology'], ['QNAP', '/brands/qnap'], ['Other NAS Brands', '/brands/other']]],
  ['Services', [
    ['NAS Installation', '/services/installation'], ['Data Migration', '/services/migration'], ['NAS Repair', '/services/repair'],
    ['NAS Upgrade', '/services/upgrade'], ['RAID Setup', '/services/raid-setup'], ['AMC', '/services/amc'],
    ['Remote Support', '/services/remote-support'], ['On-Site Support', '/services/on-site-support'],
  ]],
  ['Resources', [
    ['NAS Guides', '/resources/guides'], ['NAS Comparisons', '/resources/comparisons'], ['NAS Reviews', '/resources/reviews'],
    ['How-To Guides', '/resources/how-to'], ['NAS Blog', '/resources/blog'], ['FAQs', '/resources/faq'],
  ]],
  ['Company', [['About NASTOWN', '/about'], ['Contact Us', '/about#contact']]],
];

export default function Footer() {
  const figures = trackRecord.filter((f) => String(f.value).trim());
  return (
    <footer className="theme-dark">
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-6 sm:px-6">
        {/* Track record: only figures filled in data/site.js appear. */}
        {figures.length > 0 && (
          <dl className="mb-10 grid grid-cols-2 gap-x-6 gap-y-6 border-b border-line pb-10 md:grid-cols-4">
            {figures.map((f) => (
              // Label first in the markup (read as "label: value"), shown under the number.
              <div key={f.label} className="flex flex-col-reverse justify-end">
                <dt className="mt-2 text-[0.8125rem] text-muted">{f.label}</dt>
                <dd className="font-display text-[clamp(1.75rem,3.2vw,2.5rem)] leading-none font-semibold tracking-tight text-fg tabular-nums">{f.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="grid gap-10 border-b border-line pb-10 lg:grid-cols-[minmax(0,15rem)_1fr] lg:gap-12">
          {/* Who we are and how to reach a person */}
          <div>
            <Logo onDark />
            <p className="mt-3 text-[0.95rem] leading-snug text-fg">Smart Storage for Every Need.</p>
            <dl className="mt-5 grid gap-2.5 text-[0.8125rem]">
              <div>
                <dt className="eyebrow !text-xs">Showroom</dt>
                <dd className="mt-0.5 text-muted">
                  <a href={digibuggy.mapsHref} target="_blank" rel="noopener" className="hover:text-fg">{digibuggy.address}</a>
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2.5">
                <div>
                  <dt className="eyebrow !text-xs">WhatsApp</dt>
                  <dd className="mt-0.5"><a href={digibuggy.whatsappHref} target="_blank" rel="noopener" className="link">{digibuggy.whatsapp}</a></dd>
                </div>
                <div>
                  <dt className="eyebrow !text-xs">Email</dt>
                  <dd className="mt-0.5"><a href={`mailto:${digibuggy.email}`} className="link">{digibuggy.email}</a></dd>
                </div>
              </div>
            </dl>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-[repeat(6,auto)] lg:justify-between lg:gap-x-6">
            {columns.map(([title, items]) => (
              <div key={title}>
                <p className="font-display text-sm font-semibold text-fg">{title}</p>
                <ul className="mt-3 grid gap-1.5">
                  {items.map(([label, to]) => (
                    <li key={label}>
                      <Link to={to} className="whitespace-nowrap text-[0.8125rem] leading-snug text-muted transition-colors hover:text-fg">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4 pt-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <a href={digibuggy.site} target="_blank" rel="noopener" className="group inline-flex items-center gap-2.5 text-xs text-subtle">
              A company of
              <img src="/digibuggy-logo.svg" alt="Digibuggy" width="218" height="25" className="h-3.5 w-auto opacity-80 transition-opacity group-hover:opacity-100" />
            </a>
            <ul className="flex gap-1">
              {digibuggy.socials.map(({ label, href }) => {
                const Icon = ICONS[label];
                return (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener" aria-label={`Digibuggy on ${label}`} title={label} className="grid size-8 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-fg">
                      <Icon className="size-4" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 pr-20 text-xs text-subtle [&>a]:py-2.5 md:[&>a]:py-1">
            <span>© {new Date().getFullYear()} NASTOWN. All rights reserved.</span>
            <Link to="/privacy" className="hover:text-fg">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-fg">Terms &amp; Conditions</Link>
            <Link to="/sitemap" className="hover:text-fg">Sitemap</Link>
            <Link to="/admin" rel="nofollow" className="hover:text-fg">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
