import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import PostCard from '../components/PostCard.jsx';
import { api } from '../lib/api.js';

// Latest posts, managed in Admin → Blog. The newest is featured large, the next two beside it.
export default function BlogSection() {
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    let alive = true;
    api.blog({ limit: 3 }).then((p) => alive && setPosts(p)).catch(() => alive && setPosts([]));
    return () => { alive = false; };
  }, []);

  // Nothing published yet (or the API is down): leave the section out rather than show an empty band.
  if (posts && posts.length === 0) return null;
  const [lead, ...rest] = posts ?? [];

  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow mb-3">From the blog</p>
            <h2 className="h-section">Latest from the NASTOWN Blog</h2>
            <p className="mt-4 text-lg leading-relaxed">Storage tips, buying advice and practical NAS know-how from our team.</p>
          </div>
          <Link to="/resources/blog" className="link inline-flex items-center gap-1">
            View all posts <ChevronRight className="size-4" />
          </Link>
        </Reveal>

        {!posts ? (
          <div className="mt-10 grid gap-12 lg:grid-cols-[1.35fr_1fr]" aria-hidden>
            <div className="aspect-[16/10] animate-pulse rounded-[20px] bg-line/60" />
            <div className="grid content-start gap-8">
              <div className="h-40 animate-pulse rounded-[20px] bg-line/60" />
              <div className="h-40 animate-pulse rounded-[20px] bg-line/60" />
            </div>
          </div>
        ) : (
          <div className={`mt-10 grid gap-12 ${rest.length ? 'lg:grid-cols-[1.35fr_1fr] lg:gap-14' : ''}`}>
            <Reveal><PostCard post={lead} variant="feature" /></Reveal>
            {rest.length > 0 && (
              <div className="grid content-start gap-8 lg:border-l lg:border-line lg:pl-14">
                {rest.map((p, i) => (
                  <Reveal key={p.slug} delay={100 + i * 80} className={i > 0 ? 'border-t border-line pt-8' : ''}>
                    <PostCard post={p} variant="row" />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
