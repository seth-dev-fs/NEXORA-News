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
 * Triggers a download event on Unsplash (REQUIRED by Unsplash API Guidelines)
 * This must be called when an Unsplash image is used in the application
 * @param {string} downloadLocation - The download_location URL from Unsplash API response
 */
async function triggerUnsplashDownload(downloadLocation) {
    if (!downloadLocation || !UNSPLASH_ACCESS_KEY) {
        return;
    }

    try {
        await axios.get(downloadLocation, {
            params: {
                client_id: UNSPLASH_ACCESS_KEY
            },
            timeout: 5000
        });
        log('[INFO] Unsplash download event triggered successfully');
    } catch (error) {
        log(`[WARN] Failed to trigger Unsplash download: ${error.message}`, 'warn');
    }
}

/**
 * Fetches a fallback image from Unsplash based on keywords
 * @param {string} keywords - Search keywords for Unsplash
 * @returns {Promise<Object|null>} - Unsplash image data with attribution or null
 * @returns {Object.imageUrl} - The image URL
 * @returns {Object.photographerName} - Photographer's name
 * @returns {Object.photographerUrl} - Photographer's Unsplash profile URL with UTM
 * @returns {Object.downloadLocation} - Download trigger endpoint
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
            const data = response.data;

            // Build photographer URL with required UTM parameters
            const photographerUrl = `${data.user.links.html}?utm_source=nexora_news&utm_medium=referral`;

            log(`[INFO] Fetched Unsplash image for keywords: "${searchQuery}" by ${data.user.name}`);

            return {
                imageUrl: data.urls.regular,
                photographerName: data.user.name,
                photographerUrl: photographerUrl,
                downloadLocation: data.links.download_location,
                imageProvider: 'unsplash'
            };
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
 * @returns {Promise<Object>} - Always returns an object with image data and attribution
 * @returns {Object.imageUrl} - The image URL
 * @returns {Object.photographerName} - Photographer name (only for Unsplash)
 * @returns {Object.photographerUrl} - Photographer URL (only for Unsplash)
 * @returns {Object.downloadLocation} - Download trigger URL (only for Unsplash)
 * @returns {Object.imageProvider} - Source of the image: 'rss', 'unsplash', or 'placeholder'
 */
async function getImageUrl(rssItem, articleTitle = '') {
    // TIER 1: Check RSS enclosure
    if (rssItem.enclosure?.url && rssItem.enclosure.type?.startsWith('image')) {
        const isValid = await validateImageUrl(rssItem.enclosure.url);
        if (isValid) {
            log(`[SUCCESS] Found valid image in RSS enclosure: ${rssItem.enclosure.url}`);
            return {
                imageUrl: rssItem.enclosure.url,
                photographerName: null,
                photographerUrl: null,
                downloadLocation: null,
                imageProvider: 'rss'
            };
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
            return {
                imageUrl: mediaUrl,
                photographerName: null,
                photographerUrl: null,
                downloadLocation: null,
                imageProvider: 'rss'
            };
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
                    return {
                        imageUrl: ogImage,
                        photographerName: null,
                        photographerUrl: null,
                        downloadLocation: null,
                        imageProvider: 'rss'
                    };
                } else {
                    log(`[WARN] Scraped og:image failed validation: ${ogImage}`, 'warn');
                }
            }

            const twitterImage = $('meta[name="twitter:image"]').attr('content');
            if (twitterImage) {
                const isValid = await validateImageUrl(twitterImage);
                if (isValid) {
                    log(`[SUCCESS] Found valid twitter:image by scraping: ${twitterImage}`);
                    return {
                        imageUrl: twitterImage,
                        photographerName: null,
                        photographerUrl: null,
                        downloadLocation: null,
                        imageProvider: 'rss'
                    };
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
        // CRITICAL: Trigger download event as required by Unsplash API Guidelines
        await triggerUnsplashDownload(unsplashImage.downloadLocation);
        return unsplashImage;
    }

    // TIER 5: Ultimate fallback - placeholder (local SVG image)
    log(`[WARN] All image sources failed for "${rssItem.title}". Using placeholder.`, 'warn');
    return {
        imageUrl: '/images/placeholder.svg',
        photographerName: null,
        photographerUrl: null,
        downloadLocation: null,
        imageProvider: 'placeholder'
    };
}

async function generateArticleFromItem(item) {
    const { title, link, contentSnippet, isoDate } = item;

    log(`Processing article: "${title}"`);

    // Fetch image with robust fallback system
    const image = await getImageUrl(item, title);

    const prompt = `You are a professional tech journalist writing for NEXORA News, a premium Portuguese technology news website based in Portugal. Your mission is to transform English tech news into high-quality, naturally-written Portuguese articles that engage Portuguese readers.

=== CRITICAL OUTPUT FORMAT ===
Your ENTIRE response MUST be ONLY a valid JSON object. No explanations, no markdown formatting, no comments - just pure JSON.

JSON VALIDATION RULES:
- Use double quotes (") for all strings, never single quotes (')
- No trailing commas before closing braces } or brackets ]
- Escape quotes inside strings: "He said \\"hello\\""
- No comments or explanations outside the JSON structure
- Test your JSON mentally before outputting

=== LANGUAGE: PORTUGUESE PT-PT (PORTUGAL) ===
CRITICAL: Write in natural, authentic Portuguese from Portugal - NOT translated Portuguese.

WRITING STYLE GUIDE:
✓ Use Portuguese expressions: "de facto", "aliás", "na verdade", "ao que parece"
✓ Natural flow: "A Samsung prepara-se para lançar..." (NOT "A Samsung está se preparando...")
✓ Colloquial where appropriate: "Este smartphone promete dar que falar"
✓ Portuguese market context: Reference EU regulations, European pricing when relevant
✗ Avoid: Literal translations, anglicisms unless necessary, Brazilian Portuguese constructions

TONE: Professional tech journalism that's informative yet conversational - like Observador Tecnologia or Exame Informática.

=== AUDIENCE: PORTUGUESE READERS (CRITICAL) ===

TARGET MARKET: Portugal and Portuguese-speaking Europe

When dealing with content about promotions, sales, or product availability:
✓ ADAPT US-centric content for Portuguese/European context
✓ If promotion is US-only: Mention it's not available in Portugal OR focus on the product/tech itself, not the deal
✓ Replace US store names (Best Buy, Target, Walmart) with context: "em lojas online" or "no mercado europeu"
✓ Convert USD prices to EUR when relevant (use approximate conversions)
✓ Emphasize EU availability, European release dates, CE regulations

✗ DO NOT write articles that are only about US-specific deals with no Portuguese relevance
✗ DO NOT make Portuguese readers feel excluded by focusing on unavailable promotions
✗ DO NOT use phrases like "available at Best Buy" without context

EXAMPLES:
❌ BAD: "Black Friday: iPhone 15 com 30% de desconto na Best Buy"
✅ GOOD: "iPhone 15 com descontos significativos na Black Friday europeia"

❌ BAD: "Target oferece Galaxy S24 por $599"
✅ GOOD: "Galaxy S24 com preços mais competitivos no mercado global"

=== ARTICLE REQUIREMENTS ===

**LENGTH: 350-600 words (aim for 400-500 for optimal engagement)**

WRITING PRINCIPLE: Be concise and engaging. Portuguese readers prefer quality over quantity.
- Get to the point quickly in the introduction
- Each section should add value, not padding
- Avoid repetition and unnecessary elaboration
- If you can say it in 400 words well, don't stretch to 600

**STRUCTURE (Use ## for headings in markdown):**
1. **Introduction (1-2 paragraphs)**: Hook the reader with the news angle, provide context
2. **Development (2-4 sections with ## headings)**:
   - Key details and features
   - Technical specifications when relevant
   - Market implications
   - Expert quotes or analysis (if in source material)
3. **Conclusion (1 paragraph)**: Summarize key takeaways, mention what's next/expected

**CONTENT QUALITY:**
- Write in active voice: "Apple lançou" NOT "Foi lançado pela Apple"
- Use specific facts from the source material - DO NOT invent information
- Add Portuguese market context where relevant (EU laws, local availability, pricing in EUR)
- Subheadings should be descriptive: "Bateria de 5.200 mAh promete autonomia recorde" NOT just "Bateria"
- Balance technical depth with accessibility for general tech readers

=== FRONTMATTER FIELD REQUIREMENTS ===

**1. TITLE (CRITICAL FOR SEO)**
- Length: 50-70 characters (ideal: 60)
- Include primary keyword naturally
- Make it engaging, not just descriptive
- Format examples:
  ✓ "Galaxy S26 Ultra com bateria de 5.200 mAh à vista"
  ✓ "iPhone 16 Pro: Apple aposta em IA e nova câmara"
  ✗ "Samsung Galaxy S26 Ultra: Rumores Indicam Bateria Melhorada" (too formal/long)

**2. DESCRIPTION (SEO META - CRITICAL)**
- **EXACTLY 150-160 characters** (count carefully!)
- Must include main keyword
- Compelling call-to-action or value proposition
- End with period or relevant punctuation
- TECHNIQUE: Write 155 characters, then adjust to 150-160 range
Example: "O próximo topo de gama da Samsung poderá surpreender com bateria de 5.200 mAh. Conhece todos os rumores sobre o Galaxy S26 Ultra que chega em 2026." (157 chars)

**3. CATEGORY (CRITICAL - VALIDATION REQUIRED)**
Choose EXACTLY ONE category from this list (use the exact slug):
${NORMALIZED_CATEGORIES.join(', ')}

Category selection guide:
- "smartphones" → News about mobile phones, Android, iOS devices
- "ai-futuro" → AI, machine learning, automation, future tech
- "computadores" → Laptops, desktops, PC hardware, processors
- "wearables" → Smartwatches, fitness trackers, AR/VR headsets
- "gaming" → Video games, consoles, game reviews, esports
- "home" → Default fallback ONLY if none of the above fit

SET "needs_review" to true ONLY if you had to default to 'home' or are uncertain about category fit.

**4. TAGS**
- Provide 3-5 relevant tags in Portuguese
- Mix of broad and specific tags
- Format: ["Samsung", "smartphones", "Galaxy S26", "bateria", "Android"]
- Must be a valid JSON array of strings

**5. SOURCE_URL (CRITICAL - NEVER LEAVE EMPTY)**
The original article link will be provided in the SOURCE MATERIAL section below.
- Use that exact URL in the "source_url" field
- NEVER leave empty, NEVER use placeholder text
- This is the attribution link to the original source
- Format: Must be a valid HTTP/HTTPS URL starting with http

**6. IMAGE & IMAGE_SOURCE**
- "image": This will be overridden by the system - use empty string ""
- "image_source": Use empty string "" (system handles this)

=== SOURCE MATERIAL ===
Original Title: "${title}"
Original Content Snippet: "${contentSnippet}"
Original Source URL: "${link}"

IMPORTANT: The "source_url" field in your JSON output MUST be: "${link}"

=== JSON OUTPUT STRUCTURE ===
Generate ONLY this JSON object (no other text):

{
  "title": "Engaging title in Portuguese, 50-70 chars, with main keyword",
  "date": "CURRENT_DATE_PLACEHOLDER",
  "category": "EXACTLY ONE slug from: ${NORMALIZED_CATEGORIES.join(', ')}",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "image": "",
  "image_source": "",
  "description": "SEO meta description in Portuguese, EXACTLY 150-160 characters with keyword",
  "source_url": "${link}",
  "needs_review": false,
  "content": "Full article content in GFM markdown with ## subheadings (350-600 words, aim 400-500). Write naturally in PT-PT Portuguese with professional journalistic tone. Use active voice. Include context for Portuguese readers. Adapt US-centric content to European/Portuguese market. Structure: intro paragraph(s), 2-4 sections with ## headings, conclusion paragraph."
}

=== FINAL CHECKLIST BEFORE OUTPUTTING ===
☐ JSON is valid (test it mentally: quotes, commas, braces)
☐ Title is 50-70 characters
☐ Description is EXACTLY 150-160 characters
☐ Category is one of the valid slugs
☐ Tags array has 3-5 items
☐ source_url is "${link}" (not empty, not placeholder)
☐ Content is 350-600 words in natural PT-PT Portuguese
☐ Content has ## subheadings and proper structure
☐ Content adapted for Portuguese/European audience (no US-only promotions)
☐ needs_review is true only if defaulted category to 'home'

Now generate the article:`;

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        let articleData;
        try {
            // ROBUST JSON EXTRACTION - handles multiple formats from Gemini
            let jsonString = text.trim();

            // Step 1: Try to extract from ```json blocks (with or without newlines)
            const jsonMatch = jsonString.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
            if (jsonMatch && jsonMatch[1]) {
                jsonString = jsonMatch[1].trim();
            }
            // Step 2: Try to extract just the JSON object
            else {
                const braceMatch = jsonString.match(/\{[\s\S]*\}/);
                if (braceMatch && braceMatch[0]) {
                    jsonString = braceMatch[0];
                }
            }

            // Step 3: Clean up common JSON issues
            jsonString = jsonString
                .trim()
                // Remove trailing commas before closing braces/brackets
                .replace(/,(\s*[}\]])/g, '$1')
                // Fix unescaped quotes in strings (basic)
                .replace(/:\s*"([^"]*)"([^",}\]]*?)"/g, ':"$1\\"$2"');

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
        // image is now an object with imageUrl, photographerName, photographerUrl, imageProvider
        const finalImage = image.imageUrl;
        const finalImageSource = image.imageProvider;

        // Normalize source URL - ALWAYS use the RSS link if Gemini returns invalid/empty source_url
        let finalSourceUrl = link; // Default to RSS feed link
        if (articleData.source_url &&
            articleData.source_url !== '' &&
            articleData.source_url !== 'The original source URL of the article.' &&
            articleData.source_url.startsWith('http')) {
            finalSourceUrl = articleData.source_url;
        }

        // CRITICAL: Additional validation to catch placeholder URLs from Gemini
        if (finalSourceUrl.includes('example.com') ||
            finalSourceUrl.includes('placeholder') ||
            finalSourceUrl.includes('source-url-here') ||
            !finalSourceUrl.startsWith('http')) {
            finalSourceUrl = link; // Force RSS link
            log(`[CRITICAL] Invalid source_url detected from Gemini. Forcing RSS link: ${link}`, 'error');
            needsReview = true;
        }

        finalSourceUrl = normalizeUrl(finalSourceUrl);

        // CRITICAL: Validate and enforce description length for SEO (150-160 characters)
        let finalDescription = articleData.description || '';

        if (finalDescription.length < 150 || finalDescription.length > 160) {
            log(`[WARN] Description length is ${finalDescription.length} chars (should be 150-160). Auto-correcting...`, 'warn');

            if (finalDescription.length > 160) {
                // Truncate to 157 chars + "..." = 160 chars total
                finalDescription = finalDescription.substring(0, 157) + '...';
                log(`[INFO] Description truncated to 160 chars.`);
            } else if (finalDescription.length < 150 && finalDescription.length > 0) {
                // Try to extend with first sentence from content
                const contentFirstSentence = articleData.content.split('.')[0] + '.';
                const extended = `${finalDescription} ${contentFirstSentence}`;

                if (extended.length >= 150 && extended.length <= 160) {
                    finalDescription = extended;
                    log(`[INFO] Description extended to ${extended.length} chars using content.`);
                } else if (extended.length > 160) {
                    // Truncate extended version
                    finalDescription = extended.substring(0, 157) + '...';
                    log(`[INFO] Description extended and truncated to 160 chars.`);
                } else {
                    // Still too short even with extension - flag for review
                    needsReview = true;
                    log(`[WARN] Description too short (${finalDescription.length}) even after extension. Flagged for review.`, 'warn');
                }
            }
        }

        const frontmatter = {
            title: articleData.title,
            date: new Date().toISOString(), // CRITICAL: Always use current date for published articles
            category: finalCategory,
            tags: finalTags,
            image: finalImage,
            image_source: finalImageSource,
            description: finalDescription,
            source_url: finalSourceUrl,
            draft: false, // CRITICAL: Automatic publication - no human review needed
            needs_review: needsReview,
            // Unsplash attribution (only present if image is from Unsplash)
            photographer_name: image.photographerName || undefined,
            photographer_url: image.photographerUrl || undefined,
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
        yamlFrontmatter += '---\n';

        // --- Traceability Comment (placed AFTER frontmatter to avoid gray-matter parsing issues) ---
        const generatedAt = new Date().toISOString();
        const traceabilityComment = `\n<!-- generated_by: gemini, model: ${GEMINI_MODEL}, generated_at: ${generatedAt} -->\n\n`;

        fs.writeFileSync(currentFilePath, yamlFrontmatter + traceabilityComment + articleData.content, 'utf8');

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
