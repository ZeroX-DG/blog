import type { CollectionEntry } from 'astro:content';

interface RelatedPostOptions {
  maxCount?: number;
}

export function getRelatedPosts(
  currentPost: CollectionEntry<'posts'>,
  allPosts: CollectionEntry<'posts'>[],
  options: RelatedPostOptions = {}
): CollectionEntry<'posts'>[] {
  const { maxCount = 5 } = options;

  // Get current post's tags
  const currentTags = new Set(currentPost.data.tags || []);

  // Filter out current post and calculate weights
  const postsWithWeight = allPosts
    .filter(post => post.slug !== currentPost.slug)
    .map(post => {
      const postTags = post.data.tags || [];
      let weight = 0;

      postTags.forEach(tag => {
        if (currentTags.has(tag)) {
          weight++;
        }
      });

      return { post, weight };
    });

  // Sort by weight (desc), then by date (desc)
  postsWithWeight.sort((a, b) => {
    if (b.weight !== a.weight) {
      return b.weight - a.weight;
    }
    return b.post.data.date.getTime() - a.post.data.date.getTime();
  });

  // Return top posts
  return postsWithWeight.slice(0, maxCount).map(p => p.post);
}
