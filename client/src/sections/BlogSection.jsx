import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import PostCard from '../components/PostCard.jsx';
import { posts } from '../data/blog.js';
import { resources } from '../data/site.js';

const blog = resources.find((r) => r.slug === 'blog');

// Highlighted blog band: deep green (#0B3D2E), with the newest post featured large and the
// next two beside it as compact items.
export default function BlogSection() {
  const [lead, ...rest] = [...posts].sort((a, b) => b.date.localeCompare(a.date));
  if (!lead) return null;

  return (
    <section className="theme-dark !bg-[#0b3d2e]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow mb-3">From the blog</p>
            <h2 className="h-section">{blog.h1}</h2>
            <p className="mt-4 text-lg leading-relaxed">{blog.intro}</p>
          </div>
          <Link to="/resources/blog" className="btn btn-primary">
            View all posts <ChevronRight className="size-4" />
          </Link>
        </Reveal>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
          <Reveal>
            <PostCard post={lead} variant="feature" />
          </Reveal>
          <div className="grid content-start gap-8 lg:border-l lg:border-line lg:pl-14">
            {rest.slice(0, 2).map((p, i) => (
              <Reveal key={p.slug} delay={100 + i * 80} className={i > 0 ? 'border-t border-line pt-8' : ''}>
                <PostCard post={p} variant="row" />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
