import { useEffect, useRef } from 'react';
import { ArrowUpRight, Play } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import { instagramFollowers, instagramHandle, reels } from '../data/site.js';
import { reducedMotion } from '../lib/motion.js';

/* Our Instagram reels about NAS. Each video plays silently and on loop while it's on screen
 * (paused off screen to save data); tapping a reel opens it on Instagram, where the sound
 * and comments are. Reels are listed in data/site.js; with none listed the section is hidden. */

const InstagramIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
);

/** A reel given only as a link: Instagram's own embedded player. */
function EmbeddedReel({ reel, index }) {
  const id = reel.url.match(/instagram\.com\/(?:reel|p)\/([\w-]+)/)?.[1];
  if (!id) return null;
  return (
    <Reveal as="li" delay={(index % 4) * 70} className="w-[68vw] shrink-0 snap-start sm:w-[38vw] lg:w-auto">
      <iframe
        src={`https://www.instagram.com/reel/${id}/embed`}
        title={reel.caption || 'NASTOWN reel on Instagram'}
        loading="lazy"
        allowFullScreen
        className="aspect-[9/16] w-full overflow-hidden rounded-2xl border-0 bg-raised ring-1 ring-line"
      />
    </Reveal>
  );
}

function Reel({ reel, index }) {
  const video = useRef(null);
  const still = reducedMotion(); // people who prefer less motion see the poster, no autoplay

  useEffect(() => {
    const v = video.current;
    if (!v || still) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.35 });
    io.observe(v);
    return () => io.disconnect();
  }, [still]);

  return (
    <Reveal as="li" delay={(index % 4) * 70} className="w-[68vw] shrink-0 snap-start sm:w-[38vw] lg:w-auto">
      <a
        href={reel.url}
        target="_blank"
        rel="noopener"
        className="group relative block aspect-[9/16] overflow-hidden rounded-2xl bg-fg ring-1 ring-line"
        aria-label={`${reel.caption || 'NASTOWN reel'}: watch on Instagram (opens in a new tab)`}
      >
        <video
          ref={video}
          src={reel.video}
          poster={reel.poster}
          muted
          loop
          playsInline
          preload={still ? 'none' : 'metadata'}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {/* Readable caption over any video */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-4 pt-16 text-white">
          {reel.caption && <p className="line-clamp-2 text-sm font-medium">{reel.caption}</p>}
          <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/85">
            <InstagramIcon className="size-4" /> Watch on Instagram <ArrowUpRight className="size-3.5" />
          </span>
        </div>
        {still && (
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-14 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm"><Play className="size-6 fill-current" /></span>
          </span>
        )}
      </a>
    </Reveal>
  );
}

export default function InstaReels() {
  const profile = `https://www.instagram.com/${instagramHandle}/`;
  return (
    <section className={reels.length ? 'py-16 md:py-24' : 'pt-16 md:pt-24'}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow mb-4">On Instagram</p>
            <h2 className="h-section">{reels.length ? 'NAS, explained in 60 seconds' : 'Follow us on Instagram'}</h2>
            <p className="measure mt-5 text-muted">Reels on storage, RAID, backups and builds from our team. Join <b className="text-fg">{instagramFollowers} followers</b> on @{instagramHandle}.</p>
          </div>
          <a href={profile} target="_blank" rel="noopener" className="btn btn-secondary">
            <InstagramIcon className="size-4" /> Follow @{instagramHandle}
          </a>
        </Reveal>
      </div>
      {/* Phones: swipe sideways like a reels tray. Desktop: a row of four. */}
      {reels.length > 0 && <ul className="mx-auto mt-10 flex max-w-7xl snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:scroll-px-6 sm:px-6 lg:grid lg:grid-cols-4 lg:overflow-visible">
        {reels.map((r, i) => (r.video ? <Reel key={r.url} reel={r} index={i} /> : <EmbeddedReel key={r.url} reel={r} index={i} />))}
      </ul>}
    </section>
  );
}
