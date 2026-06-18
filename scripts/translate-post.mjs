import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const BLOG_ROOT = path.join(ROOT, 'src', 'content', 'blog');
const TARGET_LANGS = ['en', 'ja', 'zh'];
const MODEL = process.env.OPENAI_MODEL || 'gpt-5.5';

function usage() {
  console.error('Usage: npm run translate:post -- <post-slug>');
  console.error('Example: npm run translate:post -- grokking_qkv');
}

function parseFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error('Expected MDX file with YAML frontmatter.');
  }

  const [, rawFrontmatter, body] = match;
  const lines = rawFrontmatter.split('\n');
  const data = {};

  for (const line of lines) {
    const separator = line.indexOf(':');
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    data[key] = value;
  }

  return { data, body };
}

function stringifyFrontmatter(frontmatter, body) {
  const lines = [
    '---',
    `title: ${frontmatter.title}`,
    `description: ${frontmatter.description}`,
    `date: ${frontmatter.date}`,
    `updated: ${frontmatter.updated}`,
    `lang: ${frontmatter.lang}`,
    `translationKey: ${frontmatter.translationKey}`,
    `tags: ${frontmatter.tags}`,
    `draft: ${frontmatter.draft}`,
    '---',
    '',
    body.trim(),
    '',
  ];

  return lines.join('\n');
}

async function translateText({ instructions, input }) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set.');
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      reasoning: { effort: 'low' },
      input: [
        { role: 'developer', content: instructions },
        { role: 'user', content: input },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${text}`);
  }

  const json = await response.json();
  const text = json.output_text?.trim();
  if (!text) {
    throw new Error('OpenAI API returned empty output.');
  }

  return text;
}

async function createTranslation({ slug, sourceFrontmatter, sourceBody, lang }) {
  const languageNames = {
    en: 'English',
    ja: 'Japanese',
    zh: 'Simplified Chinese',
  };

  const instructions = [
    `You translate Korean technical blog posts into ${languageNames[lang]}.`,
    'Return valid JSON only. No markdown fences. No extra commentary.',
    'Preserve all MDX, math blocks, code fences, image tags, and HTML tags.',
    'Translate prose, headings, title, description, figcaptions, and alt text.',
    'Do not change dates, tags, draft, or translationKey.',
    'Keep tone clear and technical.',
    'JSON schema:',
    '{"title":"...","description":"...","body":"..."}',
  ].join(' ');

  const payload = JSON.stringify(
    {
      slug,
      source: {
        title: sourceFrontmatter.title,
        description: sourceFrontmatter.description,
        body: sourceBody.trim(),
      },
      targetLang: lang,
    },
    null,
    2,
  );

  const translated = await translateText({ instructions, input: payload });
  let parsed;

  try {
    parsed = JSON.parse(translated);
  } catch (error) {
    throw new Error(`Failed to parse translation JSON for ${lang}: ${error.message}`);
  }

  const frontmatter = {
    ...sourceFrontmatter,
    title: JSON.stringify(parsed.title),
    description: JSON.stringify(parsed.description),
    lang,
  };

  return stringifyFrontmatter(frontmatter, parsed.body);
}

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    usage();
    process.exit(1);
  }

  const postDir = path.join(BLOG_ROOT, slug);
  const sourcePath = path.join(postDir, 'ko.mdx');
  const source = await fs.readFile(sourcePath, 'utf8');
  const { data, body } = parseFrontmatter(source);

  for (const required of ['title', 'description', 'date', 'updated', 'lang', 'translationKey', 'tags', 'draft']) {
    if (!(required in data)) {
      throw new Error(`Missing frontmatter field: ${required}`);
    }
  }

  if (data.lang !== 'ko') {
    throw new Error(`Expected ko.mdx to have lang: ko, received ${data.lang}`);
  }

  for (const lang of TARGET_LANGS) {
    const translated = await createTranslation({
      slug,
      sourceFrontmatter: data,
      sourceBody: body,
      lang,
    });

    const targetPath = path.join(postDir, `${lang}.mdx`);
    await fs.writeFile(targetPath, translated, 'utf8');
    console.log(`Wrote ${path.relative(ROOT, targetPath)}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
