// scripts/generate-articles.js
// Complete, production-ready script to generate articles from RSS,
// rewrite via Gemini API and save Markdown files to /content/posts.
//
// Requirements:
// - npm install rss-parser axios
// - /scripts/helpers/{slugify,saveMarkdown,fetchArticle} exist and are CommonJS modules
// - process.env.GEMINI_API_KEY must be set (GitHub Secrets or local env)
// - run: node scripts/generate-articles.js

const Parser = require('rss-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { slugify } = require('./helpers/slugify');
const { saveMarkdown } = require('./helpers/saveMarkdown');
const { fetchArticle } = require('./helpers/fetchArticle');

const parser = new Parser();

const FEEDS = [
  'https://www.theverge.com/rss/index.xml',
  'https://techcrunch.com/feed/',
  'https://www.wired.com/feed/rss',
  'https://www.engadget.com/rss.xml',
];

const OUT_DIR = path.join(process.cwd(), 'content', 'posts');
const LOGS_DIR = path.join(process.cwd(), 'content', 'logs');
const ERR_LOG = path.join(LOGS_DIR, 'errors.log');

const KEYWORDS = [
  'AI',
  'artificial intelligence',
  'Portugal',
  'EU',
  'security',
  'privacy',
  'startup',
  'smartphone',
  'Apple',
  'Samsung',
];

const MAX_ARTICLES_PER_RUN = 5;

// Ensure directories exist
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });

// Helper to append error logs
function logError(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(ERR_LOG, line);
  console.error(message);
}

// Read GEMINI API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  logError('Error: GEMINI_API_KEY environment variable is not set.');
  process.exit(1);
}

// Gemini API endpoint (Generative Language)
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

async function callGemini(promptString) {
  try {
    const resp = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        // use the "messages" shape with parts as specified earlier
        contents: [
          {
            role: 'user',
            parts: [{ text: promptString }],
          },
        ],
        // set a reasonable temperature / max tokens if supported
        // The API surface may vary; include sensible defaults
        maxOutputTokens: 1024,
        temperature: 0.3,
      },
      {
        timeout: 120000, // 2 minutes
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Defensive extraction: the response shape can vary between models/SDKs
    // Typical path used earlier: response.data.candidates[0].content.parts[0].text
    if (
      resp.data &&
      resp.data.candidates &&
      resp.data.candidates[0] &&
      resp.data.candidates[0].content &&
      Array.isArray(resp.data.candidates[0].content.parts) &&
      resp.data.candidates[0].content.parts[0] &&
      typeof resp.data.candidates[0].content.parts[0].text === 'string'
    ) {
      return resp.data.candidates[0].content.parts[0].text;
    }

    // Alternate shape (some SDKs return `output[0].content[0].text` or similar)
    if (
      resp.data &&
      resp.data.output &&
      Array.isArray(resp.data.output) &&
      resp.data.output[0] &&
      resp.data.output[0].content &&
      Array.isArray(resp.data.output[0].content) &&
      resp.data.output[0].content[0] &&
      typeof resp.data.output[0].content[0].text === 'string'
    ) {
      return resp.data.output[0].content[0].text;
    }

    // As a last resort, try stringifying the whole response
    return JSON.stringify(resp.data);
  } catch (err) {
    logError(`Gemini API error: ${err.message}`);
    if (err.response && err.response.data) {
      logError(`Gemini response data: ${JSON.stringify(err.response.data)}`);
    }
    throw err;
  }
}

// Build the internal rewrite prompt (kept as a template)
function buildRewritePrompt(originalUrl, sourceTitle, rawContent) {
  // rawContent should be plain text or HTML (preferably plain text excerpt)
  // We'll provide the original URL and some extracted content as context.
  return `
You are now the Senior Editor of the Portuguese tech publication NEXORA.
Rewrite the following article into European Portuguese (pt-PT), with a simple, light, friendly, guiding tone. Do a deep rewrite; do not copy text verbatim.

Original source URL: ${originalUrl}
Original source: ${sourceTitle}

Here is the source content or excerpt:
"""${rawContent}"""

Instructions:
- Output full valid Markdown only.
- Begin with YAML frontmatter with the exact fields:
  title: (string)
  subtitle: (string or empty)
  date: (ISO 8601 date)
  categories: (array)
  tags: (array)
  featured_image: (URL string or empty)
  pontos_chave: (array of 3 strings)
  meta_description: (max 155 chars)
  source_url: (original URL)
  needs_review: true

- After the YAML frontmatter:
  1) Provide a lead of 2 short sentences.
  2) Provide a main article body of 400-600 words (in Portuguese PT-PT).
  3) Add a section "Pontos-chave" as an unordered list with 3 bullets.
  4) End with a final attribution line: "_Fonte original: ORIGINAL_URL_"

Tone and safety:
- Paraphrase deeply; do not reproduce long verbatim excerpts.
- Keep paragraphs short and readable.
- Explain technical terms briefly if used.
- Do not invent facts; if information is uncertain, flag it in parentheses.
- Use pt-PT spelling and idioms.

Return only the Markdown document (with YAML frontmatter and the article).
`;
}

// Check for duplicates by filename OR by source URL recorded in existing files
function markdownExistsForSlug(slug) {
  const filePath = path.join(OUT_DIR, `${slug}.md`);
  return fs.existsSync(filePath);
}

// If you want additional duplicate protection by source URL, you can scan existing frontmatters
function sourceUrlAlreadySaved(sourceUrl) {
  try {
    const files = fs.readdirSync(OUT_DIR);
    for (const f of files) {
      if (!f.endsWith('.md')) continue;
      const content = fs.readFileSync(path.join(OUT_DIR, f), 'utf8');
      // naive check: look for source_url: in frontmatter
      if (content.includes(`source_url: ${sourceUrl}`) || content.includes(`source_url: "${sourceUrl}"`)) {
        return true;
      }
    }
  } catch (err) {
    // ignore
  }
  return false;
}

async function runOnce() {
  try {
    const allItems = [];

    for (const feedUrl of FEEDS) {
      try {
        const feed = await parser.parseURL(feedUrl);
        if (feed && Array.isArray(feed.items)) {
          feed.items.forEach((i) => allItems.push({ ...i, feedUrl, source: feed.title || '' }));
        }
      } catch (err) {
        logError(`Failed to parse feed ${feedUrl}: ${err.message}`);
      }
    }

    // normalize and filter by keywords
    const normalized = allItems.map((it) => {
      return {
        title: (it.title || '').trim(),
        link: it.link || it.guid || '',
        snippet: (it.contentSnippet || it.summary || '').trim(),
        date: it.isoDate || it.pubDate || null,
        source: it.source || it.feedUrl || '',
      };
    });

    const relevant = normalized.filter((item) => {
      const t = `${item.title} ${item.snippet}`.toLowerCase();
      return KEYWORDS.some((k) => t.includes(k.toLowerCase()));
    });

    // Deduplicate by link
    const uniqueByLink = [];
    const seen = new Set();
    for (const it of relevant) {
      if (!it.link) continue;
      if (seen.has(it.link)) continue;
      seen.add(it.link);
      uniqueByLink.push(it);
    }

    const selected = uniqueByLink.slice(0, MAX_ARTICLES_PER_RUN);

    for (const it of selected) {
      try {
        if (!it.link) {
          console.log('Skipping item with no link:', it.title);
          continue;
        }

        if (sourceUrlAlreadySaved(it.link)) {
          console.log('Source URL already saved, skipping:', it.link);
          continue;
        }

        const slug = slugify(it.title || it.link);
        if (markdownExistsForSlug(slug)) {
          console.log('Markdown exists for slug, skipping:', slug);
          continue;
        }

        console.log(`Processing: ${it.title} -> ${slug}`);

        // Fetch full article content (helper is placeholder or real extractor)
        const fetched = await fetchArticle(it.link);
        const rawContent = (fetched && (fetched.content || fetched.text || fetched.excerpt)) || it.snippet || '';

        if (!rawContent || rawContent.length < 50) {
          console.log('Insufficient content extracted, skipping:', it.link);
          continue;
        }

        // Build the rewrite prompt for Gemini
        const rewritePrompt = buildRewritePrompt(it.link, it.source || '', rawContent);

        // Call Gemini
        const generated = await callGemini(rewritePrompt);

        if (!generated || typeof generated !== 'string' || generated.trim().length === 0) {
          logError(`Empty response from Gemini for ${it.link}`);
          continue;
        }

        // Save to markdown
        saveMarkdown(slug, generated);
        console.log(`Saved article for ${slug}`);
      } catch (err) {
        logError(`Error processing item ${it.link} - ${err.message}`);
        continue;
      }
    }

    console.log('Run completed.');
  } catch (err) {
    logError(`Fatal error in runOnce: ${err.message}`);
    throw err;
  }
}

(async () => {
  try {
    await runOnce();
    process.exit(0);
  } catch (err) {
    logError(`Unhandled error: ${err.message}`);
    process.exit(1);
  }
})();