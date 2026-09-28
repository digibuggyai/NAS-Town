import { Link, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import PostCard from '../components/PostCard.jsx';
import FinalCta from '../sections/FinalCta.jsx';
import { formatPostDate, postBySlug, posts } from '../data/blog.js';
import NotFound from './NotFound.jsx';

export default function BlogPost() {
  const { slug } = useParams();
  const post = postBySlug(slug);
  if (!post) return <NotFound title="Post not found" intro="That article doesn't exist or has moved." />;
  const more = posts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <title>{`${post.title} | NASTOWN Blog`}</title>
      <meta name="description" content={post.excerpt} />
      <article className="mx-auto max-w-3xl px-4 pt-28 pb-12 sm:px-6 md:pt-32">
        <Link to="/resources/blog" className="link inline-flex items-center gap-1.5 text-sm"><ArrowLeft className="size-4" /> All posts</Link>
        <Reveal>
          <p className="mt-8 text-sm text-subtle">
            <span className="font-semibold text-fg">{post.category}</span> · {formatPostDate(post.date)} · {post.readMins} min read
          </p>
          <h1 className="display mt-3 !text-[clamp(2rem,4vw,2.9rem)]">{post.title}</h1>
          <p className="mt-5 text-lg leading-relaxed">{post.excerpt}</p>
        </Reveal>
        <Reveal delay={100} className="mt-10 overflow-hidden rounded-[24px]">
          <img src={post.image} alt={post.alt} width="900" height="600" className="aspect-[16/9] w-full object-cover" />
        </Reveal>
        <div className="mt-10 space-y-5 text-[1.0625rem] leading-[1.8]">
          {post.body.map((block) =>
            block.startsWith('## ')
              ? <h2 key={block} className="!mt-10 text-2xl">{block.slice(3)}</h2>
              : <p key={block}>{block}</p>,
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
