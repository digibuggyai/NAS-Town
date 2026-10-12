import { Link } from 'react-router';
import PageHero from '../components/PageHero.jsx';
import { siteMap } from '../data/site.js';
import Seo from '../components/Seo.jsx';

export default function SitemapPage() {
  return (
    <>
      <Seo />
      <PageHero eyebrow="Sitemap" title="Everything on NASTOWN" />
      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-28 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="glass rounded-xl p-6">
          <Link to="/" className="font-medium">Home</Link>
        </div>
        {siteMap.map(([title, items]) => (
          <div key={title} className="glass rounded-xl p-6">
            <h2 className="font-medium">{title}</h2>
            <ul className="mt-3 grid gap-1.5">
              {items.map(([label, to]) => (
                <li key={label}><Link to={to} className="text-sm text-muted hover:text-fg">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </>
  );
}
