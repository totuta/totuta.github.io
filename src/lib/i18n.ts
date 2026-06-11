import type { CollectionEntry } from 'astro:content';

export const defaultLocale = 'ko' as const;
export const locales = ['ko', 'en', 'ja', 'zh'] as const;

export type Locale = (typeof locales)[number];
export type BlogPost = CollectionEntry<'blog'>;
export type LanguageLink = {
  locale: Locale;
  label: string;
  href: string;
  current: boolean;
};

export const localeLabels: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  zh: '中文',
};

export const ui = {
  ko: {
    siteTitle: 'Totuta',
    siteDescription: 'AI, 컴퓨터 과학, 머신러닝, 시스템, 소프트웨어 엔지니어링을 다루는 기술 블로그',
    home: '홈',
    blog: '블로그',
    about: '소개',
    projects: '프로젝트',
    tags: '태그',
    latestPosts: '최근 글',
    readMore: '읽기',
    noPosts: '아직 공개된 글이 없습니다.',
  },
  en: {
    siteTitle: 'Totuta',
    siteDescription: 'A technical blog about AI, computer science, machine learning, systems, and software engineering.',
    home: 'Home',
    blog: 'Blog',
    about: 'About',
    projects: 'Projects',
    tags: 'Tags',
    latestPosts: 'Latest posts',
    readMore: 'Read',
    noPosts: 'No published posts yet.',
  },
  ja: {
    siteTitle: 'Totuta',
    siteDescription: 'AI、コンピュータサイエンス、機械学習、システム、ソフトウェアエンジニアリングの技術ブログ',
    home: 'ホーム',
    blog: 'ブログ',
    about: '紹介',
    projects: 'プロジェクト',
    tags: 'タグ',
    latestPosts: '最近の記事',
    readMore: '読む',
    noPosts: '公開済みの記事はまだありません。',
  },
  zh: {
    siteTitle: 'Totuta',
    siteDescription: '关于 AI、计算机科学、机器学习、系统和软件工程的技术博客',
    home: '首页',
    blog: '博客',
    about: '关于',
    projects: '项目',
    tags: '标签',
    latestPosts: '最新文章',
    readMore: '阅读',
    noPosts: '还没有已发布的文章。',
  },
} satisfies Record<Locale, Record<string, string>>;

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export function getLocalizedPath(locale: Locale, path = '') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (locale === defaultLocale) return normalizedPath;
  return `/${locale}${normalizedPath === '/' ? '' : normalizedPath}`;
}

export function getSlugFromId(id: string) {
  return id.split('/').slice(0, -1).join('/');
}

export function getLangFromId(id: string): Locale {
  return id.split('/').at(-1) as Locale;
}

export function isPublished(post: BlogPost) {
  return !post.data.draft || import.meta.env.DEV;
}

export function sortPosts(posts: BlogPost[]) {
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function pickPostForLocale(posts: BlogPost[], slug: string, locale: Locale) {
  const sameSlug = posts.filter((post) => getSlugFromId(post.id) === slug);
  const translationKey = sameSlug[0]?.data.translationKey;
  const sameTranslation = translationKey ? posts.filter((post) => post.data.translationKey === translationKey) : sameSlug;

  return (
    sameTranslation.find((post) => post.data.lang === locale) ??
    sameTranslation.find((post) => post.data.lang === defaultLocale) ??
    sameSlug.find((post) => post.data.lang === defaultLocale)
  );
}

export function getLanguageLinksForPost(posts: BlogPost[], currentPost: BlogPost, currentLocale: Locale): LanguageLink[] {
  const translations = posts.filter((post) => post.data.translationKey === currentPost.data.translationKey);

  return locales.map((locale) => {
    const targetPost =
      translations.find((post) => post.data.lang === locale) ??
      translations.find((post) => post.data.lang === defaultLocale) ??
      currentPost;

    return {
      locale,
      label: localeLabels[locale],
      href: getLocalizedPath(locale, `/blog/${getSlugFromId(targetPost.id)}`),
      current: locale === currentLocale,
    };
  });
}

export function formatDate(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
