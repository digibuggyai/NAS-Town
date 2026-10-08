import { useEffect, useState } from 'react';
import PostCard from './PostCard.jsx';
import { api } from '../lib/api.js';
import { blogPath, preloaded } from '../lib/preload.js';

// All published posts, newest first. Used on the Blog page.
export default function BlogList() {
  const [posts, setPosts] = useState(() => preloaded(blogPath()) ?? null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.blog().then(setPosts).catch(() => setError(true));
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      {error && <p className="text-muted">Posts can't be loaded right now. Please refresh in a moment.</p>}
      {posts && posts.length === 0 && <p className="text-muted">No posts yet. Check back soon.</p>}
      <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {!posts && !error && Array.from({ length: 3 }).map((_, i) => <div key={i} className="aspect-[16/10] animate-pulse rounded-[20px] bg-surface" />)}
        {posts?.map((p) => <PostCard key={p.slug} post={p} />)}
      </div>
    </section>
  );
}
