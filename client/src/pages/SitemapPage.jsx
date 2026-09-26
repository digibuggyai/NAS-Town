import { Link } from 'react-router';
import PageHero from '../components/PageHero.jsx';
import { nav } from '../data/site.js';

export default function SitemapPage() {
  return (
    <>
      <title>Sitemap | NASTOWN</title>
      <PageHero eyebrow="Sitemap" title="Everything on NASTOWN" />
      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-28 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="glass rounded-xl p-6">
          <Link to="/" className="font-medium">Home</Link>
        </div>
        {nav.map((item) => (
          <div key={item.label} className="glass rounded-xl p-6">
            <Link to={item.to} className="font-medium">{item.label}</Link>
            {item.children && (
              <ul className="mt-3 grid gap-1.5">
                {item.children.map((c) => (
                  <li key={c.to}><Link to={c.to} className="text-sm text-muted hover:text-fg">{c.label}</Link></li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    </>
  );
}
