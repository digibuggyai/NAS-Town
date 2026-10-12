import Reveal from '../components/Reveal.jsx';
import { customers } from '../config/siteContent.js';

/** Customer logo wall: grey until hovered, each linking to the customer's site.
 *  Hidden until real customers are listed in config/siteContent.js. */
export default function TrustedBy() {
  if (!customers.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
      <Reveal>
        <p className="eyebrow text-center">Trusted by</p>
        <ul className="mt-8 grid grid-cols-2 items-center gap-x-8 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          {customers.map((c) => (
            <li key={c.name} className="flex justify-center">
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="group grid min-h-12 place-items-center px-2" title={c.name}>
                <img
                  src={c.logo}
                  alt={c.name}
                  loading="lazy"
                  decoding="async"
                  className="max-h-10 w-auto max-w-36 object-contain opacity-70 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0 group-focus-visible:opacity-100 group-focus-visible:grayscale-0"
                />
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
