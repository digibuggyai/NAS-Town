import { Link } from 'react-router';
import { CalendarCheck, MessageCircle } from 'lucide-react';
import { Logo } from './Navbar.jsx';
import { digibuggy, siteMap, waLink } from '../data/site.js';
import { experienceZone, parentCompany, stats } from '../config/siteContent.js';

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

export default function Footer() {
  return (
    <footer className="theme-dark">
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-24 sm:px-6 lg:pb-6">{/* phones: room for the floating buttons */}
        {/* Contact block sits beside the link columns only on wide screens; at laptop/tablet width it stacks above. */}
        <div className="grid gap-10 border-b border-line pb-10 xl:grid-cols-[minmax(0,15rem)_1fr] xl:gap-12">
          {/* Who we are and how to reach a person */}
          <div>
            <Logo onDark />
            <p className="mt-3 text-[0.95rem] leading-snug text-fg">Smart Storage for Every Need.</p>
            {/* Track record (config/siteContent.js), on every page. */}
            {stats.some((s) => s.value) && (
              <dl className="mt-5 grid max-w-xs grid-cols-3 gap-3">
                {stats.filter((s) => s.value).map((s) => (
                  <div key={s.label} className="flex flex-col-reverse">
                    <dt className="text-[0.7rem] leading-tight text-muted">{s.label}</dt>
                    <dd className="font-display text-lg leading-tight font-semibold text-fg">{s.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {/* A <dl> may hold dt/dd or one level of <div>, so each group is its own list. */}
            <div className="mt-5 grid gap-2.5 text-[0.8125rem]">
              <dl>
                <dt className="eyebrow !text-xs">{experienceZone.name}</dt>
                <dd className="mt-0.5 text-muted">
                  <a href={digibuggy.mapsHref} target="_blank" rel="noopener noreferrer" className="hover:text-fg">{digibuggy.address}</a>
                  <a href={waLink(experienceZone.bookVisitText)} target="_blank" rel="noopener noreferrer" className="link mt-1.5 flex items-center gap-1.5">
                    <CalendarCheck className="size-3.5" aria-hidden /> Book a visit
                  </a>
                </dd>
              </dl>
              <dl className="flex flex-wrap gap-x-6 gap-y-2.5">
                <div>
                  <dt className="eyebrow !text-xs">WhatsApp</dt>
                  <dd className="mt-0.5"><a href={digibuggy.whatsappHref} target="_blank" rel="noopener" className="link">{digibuggy.whatsapp}</a></dd>
                </div>
                <div>
                  <dt className="eyebrow !text-xs">Email</dt>
                  <dd className="mt-0.5"><a href={`mailto:${digibuggy.email}`} className="link">{digibuggy.email}</a></dd>
                </div>
              </dl>
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-[repeat(7,auto)] lg:justify-between lg:gap-x-6">
            {siteMap.map(([title, items]) => (
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
            {/* The group, spelled out: NASTOWN is a DigiBuggy company, and DigiBuggy is DGB India. */}
            <p className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-subtle">
              <span className="font-medium text-muted">NASTOWN</span> · A
              <a href={parentCompany.site} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center" aria-label="DigiBuggy">
                <img src="/digibuggy-logo.svg" alt="DigiBuggy" width="218" height="25" loading="lazy" decoding="async" className="h-3.5 w-auto opacity-80 transition-opacity group-hover:opacity-100" />
              </a>
              <span>(<a href={parentCompany.dgbSite} target="_blank" rel="noopener noreferrer" className="hover:text-fg">{parentCompany.alsoKnownAs}</a>)</span> company
            </p>
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
