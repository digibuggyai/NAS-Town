import { Link } from 'react-router';
import { ChevronRight, ImageOff } from 'lucide-react';
import { formatPostDate, mediaUrl } from '../lib/api.js';

const Meta = ({ post, className = '' }) => (
  <p className={`text-sm text-subtle ${className}`}>
    {post.category && <><span className="font-semibold text-accent">{post.category}</span> · </>}
    {formatPostDate(post.publishedAt)} · {post.readMins} min read
  </p>
);

const Cover = ({ post, className = '' }) => (
  <div className={`overflow-hidden rounded-[20px] bg-surface ${className}`}>
    {post.coverImage ? (
      <img
        src={mediaUrl(post.coverImage)}
        alt={post.coverAlt || ''}
        loading="lazy"
        decoding="async"
        className="size-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
      />
    ) : (
      <div className="grid size-full place-items-center text-subtle"><ImageOff className="size-6" /></div>
    )}
  </div>
);

const ReadLink = ({ small }) => (
  <span className={`link inline-flex items-center gap-1 ${small ? 'mt-3 text-sm' : 'mt-4'}`}>
    Read article <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
  </span>
);

/**
 * Blog post card. Variants:
 *  - default: cover, meta, title, excerpt (grids)
 *  - feature: the highlighted newest post, large cover and headline
 *  - row: compact horizontal item beside the featured post
 */
export default function PostCard({ post, variant = 'default' }) {
  const href = `/blog/${post.slug}`;

  if (variant === 'feature') {
    return (
      <article className="group relative flex h-full flex-col">
        <div className="relative">
          <Cover post={post} className="aspect-[16/10]" />
          <span className="absolute top-4 left-4 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">Latest</span>
        </div>
        <Meta post={post} className="mt-6" />
        <h3 className="h-section mt-2 !leading-tight">
          <Link to={href} className="after:absolute after:inset-0">{post.title}</Link>
        </h3>
        {post.excerpt && <p className="mt-3 max-w-xl text-lg leading-relaxed">{post.excerpt}</p>}
        <ReadLink />
      </article>
    );
  }

  if (variant === 'row') {
    return (
      <article className="group relative grid grid-cols-[38%_1fr] items-start gap-5">
        <Cover post={post} className="aspect-square" />
        <div>
          <Meta post={post} className="!text-xs" />
          <h3 className="mt-2 text-lg leading-snug">
            <Link to={href} className="after:absolute after:inset-0">{post.title}</Link>
          </h3>
          {post.excerpt && <p className="mt-2 line-clamp-3 text-[0.95rem] leading-relaxed">{post.excerpt}</p>}
          <ReadLink small />
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col">
      <Cover post={post} className="aspect-[16/10]" />
      <Meta post={post} className="mt-5" />
      <h3 className="mt-2 text-xl leading-snug">
        <Link to={href} className="after:absolute after:inset-0">{post.title}</Link>
      </h3>
      {post.excerpt && <p className="mt-2 leading-relaxed">{post.excerpt}</p>}
      <ReadLink />
    </article>
  );
}
