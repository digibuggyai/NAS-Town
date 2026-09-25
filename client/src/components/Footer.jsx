import { Link } from 'react-router';
import { MessageCircle } from 'lucide-react';
import { Logo } from './Navbar.jsx';
import { digibuggy, productLinks, solutions } from '../data/site.js';

// Lucide no longer ships brand marks, so these are simple outline glyphs.
const glyph = (children) =>
  function Glyph({ className }) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
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
  return (
    <footer className="px-3 pb-3 sm:px-5 sm:pb-5">
      <div className="glass mx-auto max-w-7xl rounded-[2rem] px-6 py-12 sm:px-10">
        <div className="flex flex-col justify-between gap-8 border-b border-line pb-10 md:flex-row md:items-end">
          <div>
            <Logo />
            <p className="mt-5 text-xl font-medium leading-snug text-white/90">Smart Storage for Every Need.</p>
            <a href={digibuggy.site} target="_blank" rel="noopener" className="group mt-4 inline-flex items-center gap-2.5 text-xs text-muted">
              A company of
              <img src="/digibuggy-logo.svg" alt="Digibuggy" width="218" height="25" className="h-3.5 w-auto opacity-80 transition-opacity group-hover:opacity-100" />
            </a>
          </div>
          <div className="flex flex-wrap gap-2">
            {digibuggy.socials.map(({ label, href }) => {
              const Icon = ICONS[label];
              return (
                <a key={label} href={href} target="_blank" rel="noopener" aria-label={`Digibuggy on ${label}`} title={label} className="magnetic btn btn-glass !p-2.5">
                  <Icon className="size-4" />
                </a>
              );
            })}
          </div>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-10 pt-10 sm:grid-cols-3 lg:grid-cols-6">
          {columns.map(([title, items]) => (
            <div key={title}>
              <p className="text-xs font-medium tracking-wide text-white uppercase">{title}</p>
              <ul className="mt-4 grid gap-2.5">
                {items.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-white/55 transition-colors hover:text-white">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NASTOWN. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms &amp; Conditions</Link>
            <Link to="/sitemap" className="hover:text-white">Sitemap</Link>
            <Link to="/admin" rel="nofollow" className="hover:text-white">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
