# totuta.github.io

Personal technical blog built with Astro for GitHub Pages.

## Local Development

Install dependencies:

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

Build the site:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

## Content Structure

Blog posts use Astro Content Collections and live under:

```text
src/content/blog/<post-slug>/<lang>.mdx
```

Supported locales:

- `ko` default, no URL prefix
- `en`
- `ja`
- `zh`

Example URLs:

- `/blog/hello-astro`
- `/en/blog/hello-astro`
- `/ja/blog/hello-astro`
- `/zh/blog/hello-astro`

If a translation does not exist, the localized route falls back to the Korean post.

## Add a New Post

Create a Korean MDX file first:

```text
src/content/blog/my-post/ko.mdx
```

Use this frontmatter:

```yaml
---
title: "글 제목"
description: "짧은 설명"
date: 2026-06-10
updated: 2026-06-10
lang: ko
translationKey: my-post
tags: ["ai", "systems"]
draft: false
---
```

Draft posts are included during local development and excluded from production builds.

## Add Translations

Add translated files next to the Korean original:

```text
src/content/blog/my-post/en.mdx
src/content/blog/my-post/ja.mdx
src/content/blog/my-post/zh.mdx
```

Keep the same `translationKey` across all translations. Set `lang` to the matching locale.

## Semi-Automatic Translation

See [docs/translation-workflow.md](./docs/translation-workflow.md) for the full workflow, environment variables, and recommended usage.

The key name is `OPENAI_API_KEY` in the script. `OPEN_API_KEY` is a typo.

## Images and Captions

Put static images in `public/images` and reference them with absolute paths:

```mdx
<figure>
  <img src="/images/example.png" alt="Description of the image" />
  <figcaption>Caption text</figcaption>
</figure>
```

## Math

Inline math:

```md
$E = mc^2$
```

Block math:

```md
$$
\int_a^b f(x)\,dx
$$
```

Math is rendered with `remark-math`, `rehype-katex`, and KaTeX CSS.

## Deployment

The site is configured with:

```js
site: 'https://totuta.github.io'
```

GitHub Actions deploys the `dist` output to GitHub Pages on pushes to `main`.

In the GitHub repository settings, set Pages source to **GitHub Actions**.
