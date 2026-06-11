import { getCollection } from 'astro:content';
import { defaultLocale, isPublished, type BlogPost, type Locale, sortPosts } from './i18n';

export async function getAllBlogPosts() {
  return sortPosts((await getCollection('blog')).filter(isPublished));
}

export function getPostsForLocale(posts: BlogPost[], locale: Locale) {
  const byTranslationKey = new Map<string, BlogPost[]>();

  for (const post of posts) {
    const key = post.data.translationKey;
    byTranslationKey.set(key, [...(byTranslationKey.get(key) ?? []), post]);
  }

  return sortPosts(
    [...byTranslationKey.values()].map((translations) => {
      return (
        translations.find((post) => post.data.lang === locale) ??
        translations.find((post) => post.data.lang === defaultLocale) ??
        translations[0]
      );
    }),
  );
}

export function getTagsForLocale(posts: BlogPost[], locale: Locale) {
  const counts = new Map<string, number>();

  for (const post of getPostsForLocale(posts, locale)) {
    for (const tag of post.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
}
