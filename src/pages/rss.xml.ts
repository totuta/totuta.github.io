import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getAllBlogPosts, getPostsForLocale } from '@lib/posts';
import { getSlugFromId, ui } from '@lib/i18n';

export async function GET(context: APIContext) {
  const locale = 'ko';
  const posts = getPostsForLocale(await getAllBlogPosts(), locale);

  return rss({
    title: ui[locale].siteTitle,
    description: ui[locale].siteDescription,
    site: context.site ?? 'https://totuta.github.io',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${getSlugFromId(post.id)}`,
      categories: post.data.tags,
    })),
  });
}
