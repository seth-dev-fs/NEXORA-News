const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

const axios = require('axios');
const cheerio = require('cheerio');
const { fetchFeed } = require('./helpers/fetchFeed');
const { log } = require('./helpers/logger');

// --- CONFIGURATION ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("CRITICAL: GEMINI_API_KEY environment variable is not set.");
  process.exit(1);
}

const REVALIDATE_TOKEN = process.env.REVALIDATE_TOKEN;
const REVALIDATE_BASE_URL = process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000';

if (!REVALIDATE_TOKEN) {
  console.error("CRITICAL: REVALIDATE_TOKEN environment variable is not set. Revalidation will not occur.");
}

// CORRECT MODEL: gemini-2.5-flash (confirmed available via API)
// Verified via: curl "https://generativelanguage.googleapis.com/v1beta/models?key=..."
const GEMINI_MODEL = "gemini-2.5-flash";

// Unsplash configuration for fallback images
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

const ARTICLES_DIR = path.join(__dirname, '../content/posts');
const LOGS_DIR = path.join(__dirname, '../content/logs');
const RSS_FEEDS = [
    'http://feeds.arstechnica.com/arstechnica/gadgets',
    'https://www.theverge.com/rss/index.xml',
    'https://techcrunch.com/feed/',
    'https://www.engadget.com/rss.xml',
    'https://www.phonearena.com/feed',
    'https://www.androidauthority.com/feed/',
    'https://9to5mac.com/feed/',
    'https://www.sammobile.com/feed/',
    'https://www.techradar.com/rss',
    'https://9to5linux.com/feed/',
    'https://itsfoss.com/feed/',
    'https://www.omgubuntu.co.uk/feed',
    'https://www.gsmarena.com/rss-news-reviews.php3',
    'https://www.xataka.com/feedburner.xml',
    'https://www.notebookcheck.net/News.152.100.html',
];

// --- NORMALIZED CATEGORIES (CRITICAL: Use slugs only) ---
const NORMALIZED_CATEGORIES = [
    'ai-futuro',
    'audio',
    'ciencia',
    'computadores',
    'entretenimento-gaming',
    'gaming',
    'internet-apps',
    'mobilidade',
    'smartphones',
    'wearables',
    'home'
];

// Category mapping for common English terms to Portuguese slugs
const CATEGORY_MAP = {
    'phones': 'smartphones',
    'phone': 'smartphones',
    'mobile': 'smartphones',
    'games': 'gaming',
    'entertainment': 'entretenimento-gaming',
    'ai': 'ai-futuro',
    'future': 'ai-futuro',
    'artificial intelligence': 'ai-futuro',
    'computer': 'computadores',
    'computers': 'computadores',
    'pc': 'computadores',
    'internet': 'internet-apps',
    'apps': 'internet-apps',
    'web': 'internet-apps',
    'science': 'ciencia',
    'mobility': 'mobilidade',
    'transport': 'mobilidade',
    'wearable': 'wearables',
    'audio-tech': 'audio',
    'sound': 'audio',
    'headphones': 'audio'
};

// --- HELPER FUNCTIONS ---
function normalizeTitle(title) {
    return title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
}

function getTitleSimilarity(titleA, titleB) {
    const wordsA = new Set(normalizeTitle(titleA));
    const wordsB = new Set(normalizeTitle(titleB));

    if (wordsA.size === 0 || wordsB.size === 0) return 0;

    const intersection = new Set([...wordsA].filter(word => wordsB.has(word)));
    const union = new Set([...wordsA, ...wordsB]);

    return intersection.size / union.size;
}

function removeSimilarArticles(articles, similarityThreshold = 0.5) {
    const uniqueArticles = [];
    const titles = new Set();

    for (const article of articles) {
        let isUnique = true;
        for (const existingTitle of titles) {
            if (getTitleSimilarity(article.title, existingTitle) > similarityThreshold) {
                isUnique = false;
                log(`[INFO] Skipping similar article: "${article.title}" is too similar to "${existingTitle}"`);
                break;
            }
        }
        if (isUnique) {
            uniqueArticles.push(article);
            titles.add(article.title);
        }
    }
    return uniqueArticles;
}

function normalizeUrl(url) {
    if (!url) return '';
    try {
        const urlObj = new URL(url);
        urlObj.protocol = 'https:';
        urlObj.searchParams.forEach((value, key) => {
            if (['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'source'].includes(key)) {
                urlObj.searchParams.delete(key);
            }
        });
        let normalized = urlObj.toString();
        if (normalized.endsWith('/') && urlObj.pathname !== '/') {
            normalized = normalized.slice(0, -1);
        }
        return normalized;
    } catch (e) {
        log(`[WARN] Failed to normalize URL: ${url} - ${e.message}`, 'warn');
        return url;
    }
}

function ensureDirExists(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

const slugify = (text) => text ? text.toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '') : '';

function getExistingArticleUrls() {
    if (!fs.existsSync(ARTICLES_DIR)) return new Set();
    const urls = new Set();
    fs.readdirSync(ARTICLES_DIR).forEach(file => {
        if (file.endsWith('.md')) {
            const content = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf8');
            const urlMatch = content.match(/^source_url:\s*"(.*?)"/m);
            if (urlMatch && urlMatch[1]) urls.add(normalizeUrl(urlMatch[1]));
        }
    });
    return urls;
}

/**
 * Validates if an image URL is accessible and returns valid image format
 * @param {string} imageUrl - URL to validate
 * @returns {Promise<boolean>} - true if image is accessible
 */
async function validateImageUrl(imageUrl) {
    if (!imageUrl) return false;

    try {
        const response = await axios.head(imageUrl, {
            timeout: 5000,
            validateStatus: (status) => status < 400
        });

        const contentType = response.headers['content-type'];
        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

        return validImageTypes.some(type => contentType?.includes(type));
    } catch (error) {
        log(`[WARN] Image validation failed for ${imageUrl}: ${error.message}`, 'warn');
        return false;
    }
}

/**
 * Fetches a fallback image from Unsplash based on keywords
 * @param {string} keywords - Search keywords for Unsplash
 * @returns {Promise<string|null>} - Unsplash image URL or null
 */
async function getUnsplashImage(keywords) {
    if (!UNSPLASH_ACCESS_KEY) {
        log('[WARN] UNSPLASH_ACCESS_KEY not configured. Skipping Unsplash fallback.', 'warn');
        return null;
    }

    try {
        const searchQuery = keywords || 'technology';
        const response = await axios.get('https://api.unsplash.com/photos/random', {
            params: {
                query: searchQuery,
                orientation: 'landscape',
                client_id: UNSPLASH_ACCESS_KEY
            },
            timeout: 8000
        });

        if (response.data?.urls?.regular) {
            log(`[INFO] Fetched Unsplash image for keywords: "${searchQuery}"`);
            return response.data.urls.regular;
        }

        return null;
    } catch (error) {
        log(`[WARN] Failed to fetch Unsplash image: ${error.message}`, 'warn');
        return null;
    }
}

/**
 * ROBUST IMAGE FETCHING WITH MULTI-TIER FALLBACK
 * Priority: RSS feed → Open Graph/Twitter scraping → Unsplash → Placeholder
 *
 * @param {Object} rssItem - RSS feed item
 * @param {string} articleTitle - Article title for Unsplash search
 * @returns {Promise<string>} - Always returns a valid image URL
 */
async function getImageUrl(rssItem, articleTitle = '') {
    let imageUrl = null;

    // TIER 1: Check RSS enclosure
    if (rssItem.enclosure?.url && rssItem.enclosure.type?.startsWith('image')) {
        const isValid = await validateImageUrl(rssItem.enclosure.url);
        if (isValid) {
            log(`[SUCCESS] Found valid image in RSS enclosure: ${rssItem.enclosure.url}`);
            return rssItem.enclosure.url;
        } else {
            log(`[WARN] RSS enclosure image failed validation: ${rssItem.enclosure.url}`, 'warn');
        }
    }

    // TIER 2: Check media:content
    if (rssItem['media:content']?.$?.url) {
        const mediaUrl = rssItem['media:content'].$.url;
        const isValid = await validateImageUrl(mediaUrl);
        if (isValid) {
            log(`[SUCCESS] Found valid image in RSS media:content: ${mediaUrl}`);
            return mediaUrl;
        } else {
            log(`[WARN] RSS media:content image failed validation: ${mediaUrl}`, 'warn');
        }
    }

    // TIER 3: Scrape for og:image and twitter:image
    if (rssItem.link) {
        try {
            const { data: html } = await axios.get(rssItem.link, { timeout: 10000 });
            const $ = cheerio.load(html);

            const ogImage = $('meta[property="og:image"]').attr('content');
            if (ogImage) {
                const isValid = await validateImageUrl(ogImage);
                if (isValid) {
                    log(`[SUCCESS] Found valid og:image by scraping: ${ogImage}`);
                    return ogImage;
                } else {
                    log(`[WARN] Scraped og:image failed validation: ${ogImage}`, 'warn');
                }
            }

            const twitterImage = $('meta[name="twitter:image"]').attr('content');
            if (twitterImage) {
                const isValid = await validateImageUrl(twitterImage);
                if (isValid) {
                    log(`[SUCCESS] Found valid twitter:image by scraping: ${twitterImage}`);
                    return twitterImage;
                } else {
                    log(`[WARN] Scraped twitter:image failed validation: ${twitterImage}`, 'warn');
                }
            }
        } catch (error) {
            log(`[WARN] Failed to scrape ${rssItem.link}: ${error.message}`, 'warn');
        }
    }

    // TIER 4: Try Unsplash fallback with article title as keywords
    log(`[INFO] No valid image found in RSS/scraping for "${rssItem.title}". Trying Unsplash...`);
    const unsplashImage = await getUnsplashImage(articleTitle || rssItem.title);
    if (unsplashImage) {
        return unsplashImage;
    }

    // TIER 5: Ultimate fallback - placeholder
    log(`[WARN] All image sources failed for "${rssItem.title}". Using placeholder.`, 'warn');
    return 'https://via.placeholder.com/1200x630/1a1a2e/eaeaea?text=NEXORA+News';
}

async function generateArticleFromItem(item) {
    const { title, link, contentSnippet, isoDate } = item;

    log(`Processing article: "${title}"`);

    // Fetch image with robust fallback system
    const image = await getImageUrl(item, title);

    const prompt = `Your task is to act as a tech journalist for a Portuguese (pt-PT) news website called NEXORA News. Rewrite the following article information into a new, original news article.

CRITICAL RULES:

- The language must be Portuguese from Portugal (pt-PT).
- The article must be between 400 and 900 words.
- The tone should be simple, informative, and engaging.
- DO NOT invent facts or information not present in the source material. Stick to the provided title and snippet.
- Your entire response MUST BE ONLY a valid JSON object. Do not include any other text or markdown formatting.

**CATEGORY REQUIREMENTS (CRITICAL):**
- The 'category' MUST be EXACTLY ONE of these normalized slugs: ${NORMALIZED_CATEGORIES.join(', ')}
- Use ONLY the slug format (lowercase, hyphenated)
- Examples: "ai-futuro" NOT "AI / Futuro", "smartphones" NOT "Smartphones"
- If the topic fits multiple categories, choose the MOST specific one
- If uncertain, default to 'home'

- The 'tags' MUST be an array of strings, even if empty.

SOURCE MATERIAL:
- Original Title: "${title}"
- Original Snippet: "${contentSnippet}"

Generate a JSON object with this exact structure:
{
  "title": "A compelling and clear title in Portuguese for the article",
  "date": "The publication date in ISO 8601 format (e.g., 2025-01-01T12:00:00Z). Use the current date and time if not specified.",
  "category": "EXACTLY ONE normalized slug from: ${NORMALIZED_CATEGORIES.join(', ')}",
  "tags": ["tag1", "tag2"],
  "image": "URL of the primary image (will be overridden by system)",
  "image_source": "Source of the image if different from image URL, otherwise empty string",
  "description": "A concise summary in Portuguese (1-2 sentences) for meta description.",
  "source_url": "The original source URL of the article.",
  "needs_review": "true or false. Set to 'true' if you defaulted the category or are unsure about any information.",
  "content": "The full, detailed article content in GFM markdown format (at least 400 words)."
}
`;

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        let articleData;
        try {
            // Extract JSON from response
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
            let jsonString = text;

            if (jsonMatch && jsonMatch[1]) {
                jsonString = jsonMatch[1];
            } else {
                const braceMatch = text.match(/\{[\s\S]*\}/);
                if (braceMatch && braceMatch[0]) {
                    jsonString = braceMatch[0];
                }
            }

            articleData = JSON.parse(jsonString);
        } catch (jsonError) {
            log(`[ERROR] Failed to parse JSON from Gemini for "${title}": ${jsonError.message}`, 'ERROR');
            log(`[DEBUG] Raw Gemini response: ${text}`, 'ERROR');
            return { status: 'failed_json_parse', error: jsonError.message };
        }

        if (!articleData.title || !articleData.content || !articleData.category || !articleData.date || !articleData.description || !articleData.source_url) {
            throw new Error("Generated JSON is missing required frontmatter fields.");
        }

        // --- FRONTMATTER PROCESSING WITH NORMALIZED CATEGORIES ---
        let finalCategory = articleData.category;
        let needsReview = articleData.needs_review === 'true' || articleData.needs_review === true;

        // Normalize category to slug format
        if (Array.isArray(finalCategory)) {
            finalCategory = finalCategory.find(cat =>
                NORMALIZED_CATEGORIES.includes(cat.toLowerCase().trim()) ||
                CATEGORY_MAP[cat.toLowerCase().trim()]
            ) || 'home';
            if (finalCategory === 'home') needsReview = true;
        } else {
            const normalizedCat = finalCategory.toLowerCase().trim();

            // Check if it's already a valid normalized category
            if (!NORMALIZED_CATEGORIES.includes(normalizedCat)) {
                // Try to map from English to Portuguese slug
                if (CATEGORY_MAP[normalizedCat]) {
                    finalCategory = CATEGORY_MAP[normalizedCat];
                } else {
                    // Default to home if unknown
                    finalCategory = 'home';
                    needsReview = true;
                    log(`[WARN] Unknown category "${finalCategory}" defaulted to "home". Needs review.`, 'warn');
                }
            } else {
                finalCategory = normalizedCat;
            }
        }

        // Process tags
        let finalTags = Array.isArray(articleData.tags) ? articleData.tags.map(tag => tag.trim()) : [];
        if (typeof articleData.tags === 'string') {
            finalTags = articleData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
        }

        // Use system-fetched image (always valid due to fallback)
        const finalImage = image;
        const finalImageSource = articleData.image_source || image;

        // Normalize source URL
        const finalSourceUrl = normalizeUrl(articleData.source_url || link);

        const frontmatter = {
            title: articleData.title,
            date: new Date(articleData.date || isoDate || Date.now()).toISOString(),
            category: finalCategory,
            tags: finalTags,
            image: finalImage,
            image_source: finalImageSource,
            description: articleData.description,
            source_url: finalSourceUrl,
            draft: true, // CRITICAL: Always set draft to true for new articles
            needs_review: needsReview,
        };

        // --- Slug Uniqueness ---
        let slug = slugify(articleData.title);
        let currentFilePath = path.join(ARTICLES_DIR, `${slug}.md`);
        let counter = 1;

        while (fs.existsSync(currentFilePath)) {
            log(`[WARN] Duplicate slug found: ${slug}. Trying ${slug}-${counter}.`);
            slug = `${slugify(articleData.title)}-${counter}`;
            currentFilePath = path.join(ARTICLES_DIR, `${slug}.md`);
            counter++;
        }

        // --- Frontmatter to YAML ---
        let yamlFrontmatter = '---\n';
        for (const key in frontmatter) {
            const value = frontmatter[key];
            if (Array.isArray(value)) {
                yamlFrontmatter += `${key}:\n`;
                value.forEach(item => {
                    yamlFrontmatter += `  - ${item}\n`;
                });
            } else if (typeof value === 'boolean') {
                yamlFrontmatter += `${key}: ${value ? 'true' : 'false'}\n`;
            } else {
                yamlFrontmatter += `${key}: ${JSON.stringify(value)}\n`;
            }
        }
        yamlFrontmatter += '---\n\n';

        // --- Traceability Comment ---
        const generatedAt = new Date().toISOString();
        const traceabilityComment = `<!-- generated_by: gemini, model: ${GEMINI_MODEL}, generated_at: ${generatedAt} -->\n`;

        fs.writeFileSync(currentFilePath, traceabilityComment + yamlFrontmatter + articleData.content, 'utf8');

        log(`SUCCESS: Article saved -> ${currentFilePath}`);

        // Trigger revalidation for the new article's page
        if (REVALIDATE_TOKEN) {
            log(`Attempting to revalidate individual article page: /noticias/${slug}`);

            try {
                const revalidateArticleUrl = `${REVALIDATE_BASE_URL}/api/revalidate?secret=${REVALIDATE_TOKEN}&path=/noticias/${slug}`;
                const response = await axios.get(revalidateArticleUrl);

                if (response.status === 200 && response.data.revalidated) {
                    log(`SUCCESS: Article page /noticias/${slug} revalidated successfully.`);
                } else {
                    log(`[WARN] Article page /noticias/${slug} revalidation failed: Status ${response.status}, Data: ${JSON.stringify(response.data)}`);
                }
            } catch (revalidateError) {
                log(`[ERROR] Failed to call revalidate API for /noticias/${slug}: ${revalidateError.message}`, "error");
            }
        } else {
            log("[WARN] REVALIDATE_TOKEN not set. Skipping individual article page revalidation.");
        }

        return { status: 'generated' };

    } catch (error) {
        log(`Failed during generation for "${title}": ${error.message}`, 'ERROR');
        return { status: 'failed' };
    }
}

async function main() {
    log("--- STARTING ARTICLE GENERATION RUN ---");
    log(`[INFO] Using Gemini model: ${GEMINI_MODEL}`);
    log(`[INFO] Normalized categories: ${NORMALIZED_CATEGORIES.join(', ')}`);

    try {
        const existingUrls = getExistingArticleUrls();
        let candidatePool = [];

        for (const feedUrl of RSS_FEEDS) {
            const items = await fetchFeed(feedUrl);
            const newItems = items.filter(item => !existingUrls.has(normalizeUrl(item.link)));
            const top3Items = newItems.slice(0, 3).map(item => ({ ...item, feedUrl }));
            candidatePool.push(...top3Items);
        }

        log(`Created a candidate pool with ${candidatePool.length} articles from all feeds.`);

        // Sort by date before similarity check to prioritize newest articles
        candidatePool.sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));

        const uniqueArticles = removeSimilarArticles(candidatePool);
        const articlesToGenerate = uniqueArticles.slice(0, 10);

        log(`Selected ${articlesToGenerate.length} unique articles for generation.`);

        for (const item of articlesToGenerate) {
            await generateArticleFromItem(item);
        }

        log("--- ARTICLE GENERATION RUN COMPLETE ---");

        // --- Trigger Revalidation ---
        if (REVALIDATE_TOKEN) {
            log("Attempting to trigger Next.js revalidation...");
            try {
                const revalidateUrl = `${REVALIDATE_BASE_URL}/api/revalidate?secret=${REVALIDATE_TOKEN}`;
                const response = await axios.get(revalidateUrl);
                if (response.status === 200 && response.data.revalidated) {
                    log("SUCCESS: Next.js revalidation triggered successfully.");
                } else {
                    log(`[WARN] Next.js revalidation failed: Status ${response.status}, Data: ${JSON.stringify(response.data)}`);
                }
            } catch (revalidateError) {
                log(`[ERROR] Failed to call revalidate API: ${revalidateError.message}`, "error");
            }
        } else {
            log("[WARN] REVALIDATE_TOKEN not set. Skipping Next.js revalidation.");
        }

    } catch (error) {
        log(`[FATAL] A critical, unhandled error occurred: ${error.message}`, "error");
        process.exit(1);
    }
}

main().catch(e => {
    log(`A critical, unhandled error occurred: ${e.message}`, 'FATAL');
    process.exit(1);
});
