import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import PostCard from '../components/PostCard.jsx';
import FinalCta from '../sections/FinalCta.jsx';
import { api, bodyBlocks, formatPostDate, mediaUrl } from '../lib/api.js';
import NotFound from './NotFound.jsx';

export default function BlogPost() {
  const { slug } = useParams();
  const [state, setState] = useState({ post: null, more: [], error: null });

  useEffect(() => {
    let alive = true;
    setState({ post: null, more: [], error: null });
    Promise.all([api.blogPost(slug), api.blog({ limit: 4 }).catch(() => [])])
      .then(([post, list]) => alive && setState({ post, more: list.filter((p) => p.slug !== slug).slice(0, 3), error: null }))
      .catch((error) => alive && setState({ post: null, more: [], error }));
    return () => { alive = false; };
  }, [slug]);

  const { post, more, error } = state;
  if (error) return <NotFound title="Post not found" intro="That article doesn't exist or has moved." />;
  if (!post) return <div className="mx-auto h-[70vh] max-w-3xl px-4 pt-32"><div className="h-full animate-pulse rounded-[24px] bg-surface" /></div>;

  return (
    <>
      <title>{`${post.title} | NASTOWN Blog`}</title>
      {post.excerpt && <meta name="description" content={post.excerpt} />}
      <article className="mx-auto max-w-3xl px-4 pt-28 pb-12 sm:px-6 md:pt-32">
        <Link to="/resources/blog" className="link -my-2 inline-flex items-center gap-1.5 py-2.5 text-sm"><ArrowLeft className="size-4" /> All posts</Link>
        <Reveal>
          <p className="mt-8 text-sm text-subtle">
            {post.category && <><span className="font-semibold text-accent">{post.category}</span> · </>}
            {formatPostDate(post.publishedAt)} · {post.readMins} min read
          </p>
          <h1 className="display mt-3 !text-[clamp(2rem,4vw,2.9rem)]">{post.title}</h1>
          {post.excerpt && <p className="mt-5 text-lg leading-relaxed">{post.excerpt}</p>}
        </Reveal>
        {post.coverImage && (
          <Reveal delay={100} className="mt-10 overflow-hidden rounded-[24px]">
            <img src={mediaUrl(post.coverImage)} alt={post.coverAlt || ''} className="aspect-[16/9] w-full object-cover" />
          </Reveal>
        )}
        <div className="mt-10 space-y-5 text-[1.0625rem] leading-[1.8]">
          {bodyBlocks(post.body).map((block, i) =>
            block.startsWith('## ')
              ? <h2 key={i} className="!mt-10 text-2xl">{block.slice(3)}</h2>
              : <p key={i} className="whitespace-pre-line">{block}</p>,
          )}
        </div>
      </article>

      {more.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h2 className="h-section">Keep reading</h2>
          <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((p) => <PostCard key={p.slug} post={p} />)}
          </div>
        </section>
      )}
      <FinalCta />
    </>
  );
}
