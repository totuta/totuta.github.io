# Translation Workflow

This repository supports a semi-automatic translation workflow for blog posts.

## What it does

Run the translation script against a Korean source post:

```sh
npm run translate:post -- grokking_qkv
```

It reads:

```text
src/content/blog/<post-slug>/ko.mdx
```

and generates or updates:

```text
src/content/blog/<post-slug>/en.mdx
src/content/blog/<post-slug>/ja.mdx
src/content/blog/<post-slug>/zh.mdx
```

The script preserves MDX structure and translates prose, headings, captions, and alt text.

## Environment variables

Set the OpenAI API key:

```sh
export OPENAI_API_KEY=your_api_key_here
```

Optional model override:

```sh
export OPENAI_MODEL=gpt-5.5
```

## Recommended usage

1. Write or edit the Korean post.
2. Run the translation script for that slug.
3. Review the generated English, Japanese, and Chinese drafts.
4. Tweak terminology manually before publishing.

## Notes

This is a draft-generation workflow, not a substitute for editorial review.
Use the generated files as a starting point, especially for technical terms and idioms.
