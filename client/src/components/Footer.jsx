import { Link } from 'react-router';
import { MessageCircle } from 'lucide-react';
import { Logo } from './Navbar.jsx';

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

const links = [
  ['Products', '/products'],
  ['Solutions', '/solutions/photographers'],
  ['Brands', '/brands/synology'],
  ['Rent a NAS', '/rent'],
  ['Services', '/services/installation'],
  ['Tools', '/tools/configurator'],
  ['Resources', '/resources/guides'],
  ['About', '/about'],
  ['Contact', '/about#contact'],
];

// Social URLs are placeholders until the real handles are provided.
const socials = [
  { label: 'WhatsApp', icon: MessageCircle, href: '#' },
  { label: 'Instagram', icon: Instagram, href: '#' },
  { label: 'YouTube', icon: Youtube, href: '#' },
  { label: 'LinkedIn', icon: Linkedin, href: '#' },
];

export default function Footer() {
  return (
    <footer className="px-3 pb-3 sm:px-5 sm:pb-5">
      <div className="glass mx-auto max-w-7xl rounded-[2rem] px-6 py-12 sm:px-10">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-5 text-xl font-medium leading-snug text-white/90">Storage for a smarter tomorrow.</p>
            <p className="mt-3 text-sm text-muted">A Digibuggy company.</p>
            <div className="mt-6 flex gap-2">
              {socials.map(({ label, icon: Icon, href }) => (
                <a key={label} href={href} aria-label={label} className="btn btn-glass !p-2.5">
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-3 sm:grid-cols-3">
            {links.map(([label, to]) => (
              <Link key={label} to={to} className="text-sm text-white/65 transition-colors hover:text-white">{label}</Link>
            ))}
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NASTOWN. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/sitemap" className="hover:text-white">Sitemap</Link>
            <Link to="/admin" rel="nofollow" className="hover:text-white">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
