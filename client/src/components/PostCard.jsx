import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { formatPostDate } from '../data/blog.js';

const Meta = ({ post, className = '' }) => (
  <p className={`text-sm text-subtle ${className}`}>
    <span className="font-semibold text-fg">{post.category}</span> · {formatPostDate(post.date)} · {post.readMins} min read
  </p>
);

const Photo = ({ post, className }) => (
  <div className={`overflow-hidden rounded-[20px] bg-raised ${className ?? ''}`}>
    <img
      src={post.image}
      alt={post.alt}
      width="800"
      height="600"
      loading="lazy"
      decoding="async"
      className="size-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
    />
  </div>
);

/**
 * Blog post card. Variants:
 *  - default: photo, meta, title, excerpt, link (grids)
 *  - feature: the highlighted lead post, large photo and headline
 *  - row: compact horizontal item with a thumbnail, beside the lead post
 */
export default function PostCard({ post, variant = 'default' }) {
  const href = `/blog/${post.slug}`;

  if (variant === 'feature') {
    return (
      <article className="group relative flex h-full flex-col">
        <div className="relative">
          <Photo post={post} className="aspect-[16/10]" />
          <span className="absolute top-4 left-4 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-on-accent">Featured</span>
        </div>
        <Meta post={post} className="mt-6" />
        <h3 className="h-section mt-2 !leading-tight">
          <Link to={href} className="after:absolute after:inset-0">{post.title}</Link>
        </h3>
        <p className="mt-3 max-w-xl text-lg leading-relaxed">{post.excerpt}</p>
        <span className="link mt-5 inline-flex items-center gap-1">
          Read article <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </article>
    );
  }

  if (variant === 'row') {
    return (
      <article className="group relative grid grid-cols-[38%_1fr] items-start gap-5">
        <Photo post={post} className="aspect-square" />
        <div>
          <Meta post={post} className="!text-xs" />
          <h3 className="mt-2 text-lg leading-snug">
            <Link to={href} className="after:absolute after:inset-0">{post.title}</Link>
          </h3>
          <p className="mt-2 line-clamp-3 text-[0.95rem] leading-relaxed">{post.excerpt}</p>
          <span className="link mt-3 inline-flex items-center gap-1 text-sm">
            Read article <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col">
      <Photo post={post} className="aspect-[16/10]" />
      <Meta post={post} className="mt-5" />
      <h3 className="mt-2 text-xl leading-snug">
        <Link to={href} className="after:absolute after:inset-0">{post.title}</Link>
      </h3>
      <p className="mt-2 leading-relaxed">{post.excerpt}</p>
      <span className="link mt-4 inline-flex items-center gap-1">
        Read article <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </article>
  );
}
