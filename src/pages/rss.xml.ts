import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts');

  const sortedPosts = posts.sort((a, b) =>
    b.data.date.getTime() - a.data.date.getTime()
  ).slice(0, 20);

  return rss({
    title: "Viet Hung's blog",
    description: "Viet Hung's blog",
    site: context.site || 'https://viethung.space/blog/',
    items: sortedPosts.map(post => {
      // Use original filename (from id) to preserve URL casing
      const originalSlug = post.id.replace(/\.md$/, '');
      return {
        title: post.data.title,
        pubDate: post.data.date,
        link: `/blog/${originalSlug}/`,
      };
    }),
  });
}
