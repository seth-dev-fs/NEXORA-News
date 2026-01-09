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
    // International Sources
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

    // Portuguese Sources - PRIORITY (better PT context)
    'https://pplware.sapo.pt/feed/',
    'https://tek.sapo.pt/feed',
    'https://4gnews.pt/feed/',
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

/**
 * Pre-generation filter: Reject low-quality articles BEFORE spending Gemini tokens
 * Returns: true = GENERATE | false = REJECT
 */
function shouldGenerateArticle(item) {
    const title = item.title.toLowerCase();
    const snippet = (item.contentSnippet || '').toLowerCase();
    const combined = title + ' ' + snippet;

    // FILTER 1: RED FLAGS (reject immediately)
    const redFlags = [
        'rumor', 'rumour', 'leak', 'leaked',
        'allegedly', 'supostamente', 'especulação',
        'clickbait', 'you won\'t believe',
        'shocking', 'chocante', 'viral',
        'best buy', 'walmart', 'target', // US stores
        'black friday deal at', 'cyber monday' // Deal-only articles
    ];

    for (const flag of redFlags) {
        if (combined.includes(flag)) {
            log(`[FILTER] ❌ REJECTED: "${item.title}" (red flag: "${flag}")`);
            return false;
        }
    }

    // FILTER 2: Content too short (likely low quality)
    if (snippet.length < 150) {
        log(`[FILTER] ❌ REJECTED: "${item.title}" (snippet too short: ${snippet.length} chars)`);
        return false;
    }

    // FILTER 3: Title length validation
    if (title.length < 20 || title.length > 150) {
        log(`[FILTER] ❌ REJECTED: "${item.title}" (title length: ${title.length})`);
        return false;
    }

    // FILTER 4: HIGH PRIORITY brands (always accept)
    const highPriorityBrands = [
        'apple', 'samsung', 'google', 'microsoft',
        'intel', 'amd', 'nvidia', 'meta', 'amazon',
        'openai', 'anthropic', 'gemini', 'deepmind'
    ];

    for (const brand of highPriorityBrands) {
        if (combined.includes(brand)) {
            log(`[FILTER] ✅ PRIORITY ACCEPT: "${item.title}" (brand: ${brand})`);
            return true;
        }
    }

    // FILTER 5: PT/EU relevance bonus
    const ptRelevant = [
        'portugal', 'portuguesa', 'português',
        'europa', 'european union', 'ue',
        'gdpr', 'euro', 'eur', 'disponível em portugal',
        'pplware', 'zwame', 'tek sapo'
    ];

    let relevanceScore = 0;
    for (const keyword of ptRelevant) {
        if (combined.includes(keyword)) {
            relevanceScore++;
        }
    }

    if (relevanceScore >= 2) {
        log(`[FILTER] ✅ PT RELEVANT ACCEPT: "${item.title}" (score: ${relevanceScore})`);
        return true;
    }

    // Default: accept but log
    log(`[FILTER] ✅ DEFAULT ACCEPT: "${item.title}"`);
    return true;
}

/**
 * Checks if image URL likely contains logos/watermarks
 * Simple pattern matching - fast and free
 */
function hasLogoInImageUrl(imageUrl) {
    if (!imageUrl) return false;

    const urlLower = imageUrl.toLowerCase();
    const logoPatterns = [
        'logo', 'watermark', 'brand', 'badge',
        'techcrunch', 'theverge', 'engadget',
        'arstechnica', 'wired', 'cnet', 'zdnet',
        'gizmodo', 'verge', 'mashable'
    ];

    for (const pattern of logoPatterns) {
        if (urlLower.includes(pattern)) {
            return true;
        }
    }

    return false;
}

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
        const hasLogo = hasLogoInImageUrl(rssItem.enclosure.url);

        if (isValid && !hasLogo) {
            log(`[SUCCESS] Found valid image in RSS enclosure: ${rssItem.enclosure.url}`);
            return {
                imageUrl: rssItem.enclosure.url,
                photographerName: null,
                photographerUrl: null,
                downloadLocation: null,
                imageProvider: 'rss'
            };
        } else if (hasLogo) {
            log(`[WARN] RSS enclosure image has logo, skipping: ${rssItem.enclosure.url}`, 'warn');
        } else {
            log(`[WARN] RSS enclosure image failed validation: ${rssItem.enclosure.url}`, 'warn');
        }
    }

    // TIER 2: Check media:content
    if (rssItem['media:content']?.$?.url) {
        const mediaUrl = rssItem['media:content'].$.url;
        const isValid = await validateImageUrl(mediaUrl);
        const hasLogo = hasLogoInImageUrl(mediaUrl);

        if (isValid && !hasLogo) {
            log(`[SUCCESS] Found valid image in RSS media:content: ${mediaUrl}`);
            return {
                imageUrl: mediaUrl,
                photographerName: null,
                photographerUrl: null,
                downloadLocation: null,
                imageProvider: 'rss'
            };
        } else if (hasLogo) {
            log(`[WARN] RSS media:content image has logo, skipping: ${mediaUrl}`, 'warn');
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
                const hasLogo = hasLogoInImageUrl(ogImage);

                if (isValid && !hasLogo) {
                    log(`[SUCCESS] Found valid og:image by scraping: ${ogImage}`);
                    return {
                        imageUrl: ogImage,
                        photographerName: null,
                        photographerUrl: null,
                        downloadLocation: null,
                        imageProvider: 'rss'
                    };
                } else if (hasLogo) {
                    log(`[WARN] Scraped og:image has logo, skipping: ${ogImage}`, 'warn');
                } else {
                    log(`[WARN] Scraped og:image failed validation: ${ogImage}`, 'warn');
                }
            }

            const twitterImage = $('meta[name="twitter:image"]').attr('content');
            if (twitterImage) {
                const isValid = await validateImageUrl(twitterImage);
                const hasLogo = hasLogoInImageUrl(twitterImage);

                if (isValid && !hasLogo) {
                    log(`[SUCCESS] Found valid twitter:image by scraping: ${twitterImage}`);
                    return {
                        imageUrl: twitterImage,
                        photographerName: null,
                        photographerUrl: null,
                        downloadLocation: null,
                        imageProvider: 'rss'
                    };
                } else if (hasLogo) {
                    log(`[WARN] Scraped twitter:image has logo, skipping: ${twitterImage}`, 'warn');
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

    const prompt = `És jornalista tech especializado no mercado português/europeu escrevendo para NEXORA News.

FONTE:
Título: "${title}"
Conteúdo: "${contentSnippet}"
URL: "${link}"

TAREFA: Artigo 800-1000 palavras em português europeu (PT-PT).

ESTRUTURA OBRIGATÓRIA:
1. Intro (2 parágrafos: o quê + porquê importa para PT/UE)
2. Desenvolvimento (3-4 secções com ## headings, cada uma 2-3 parágrafos)
3. Conclusão (1 parágrafo: impacto para mercado português)

CONTEXTO PT/UE OBRIGATÓRIO EM CADA ARTIGO:
✓ Disponibilidade em Portugal/Europa (quando lançar, onde comprar)
✓ Preço em EUR (converter USD se necessário, ~0.92 ratio)
✓ Alternativas disponíveis em PT (marcas/produtos locais)
✓ Impacto regulatório UE (GDPR, DSA, DMA se relevante)
✓ Comparação com mercado português (ex: "Em Portugal, X é mais popular que Y")

EXEMPLOS CONTEXTO PT:
✓ "O produto chegará a Portugal em Março por €999, disponível na Worten e Fnac"
✓ "Comparado com o Galaxy S24 (€849 em Portugal), o preço é competitivo"
✓ "A regulação GDPR da UE obriga a que..."
✗ "Available at Best Buy for $799" (SEM contexto PT)

TOM:
✓ Profissional mas acessível
✓ Crítico quando necessário (sem hype gratuito)
✓ Baseado em factos, não especulação
✓ Natural PT-PT: "prepara-se para", "de facto", "ao que parece"
✗ Sem tradução literal inglês
✗ Sem "pode ser interessante" (vago)
✗ Sem clickbait ou sensacionalismo

IMAGENS NO CONTEÚDO (NOVO - CRÍTICO):
- Adicionar 2-3 imagens relevantes intercaladas no corpo do artigo
- Usar markdown: ![descrição alt](URL_imagem)
- Fontes sugeridas:
  * Unsplash (grátis): https://images.unsplash.com/photo-XXXXXXX?w=1200
  * Imagens do artigo original (se disponíveis)
- Colocar imagens APÓS secções para quebrar texto
- Alt text descritivo em português

EXEMPLO ESTRUTURA COM IMAGENS:
## Primeira Secção
Texto aqui... 2-3 parágrafos.

![iPhone 16 Pro em destaque com câmara visível](https://images.unsplash.com/photo-1234567890?w=1200)

## Segunda Secção
Texto aqui... 2-3 parágrafos.

![Comparação de smartphones lado a lado](https://images.unsplash.com/photo-0987654321?w=1200)

RESPONDE APENAS COM JSON (sem \`\`\`json, sem explicações):
{
  "title": "Título SEO 50-70 chars com keyword",
  "description": "Meta description 150-160 chars COM keyword e contexto PT",
  "category": "uma de: ${NORMALIZED_CATEGORIES.join(', ')}",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "source_url": "${link}",
  "needs_review": false,
  "content": "ARTIGO COMPLETO 800-1000 palavras em markdown com ## headings, imagens ![](URL) intercaladas, e contexto PT/UE obrigatório"
}

CHECKLIST ANTES DE RESPONDER:
☐ Artigo tem 800-1000 palavras
☐ Tem 2-3 imagens intercaladas no texto
☐ Contexto PT/UE presente (preços EUR, disponibilidade, regulação)
☐ JSON válido (quotes, commas corretas)
☐ Description 150-160 chars
☐ source_url é "${link}"`;


    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        let articleData;
        try {
            // ROBUST JSON EXTRACTION - handles multiple formats from Gemini
            let jsonString = text.trim();

            // Step 1: Try to extract from ```json blocks (with or without newlines/extra chars)
            // Match everything between ``` markers, even if there are extra characters
            const jsonMatch = jsonString.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
            if (jsonMatch && jsonMatch[1]) {
                jsonString = jsonMatch[1].trim();
            }
            // Step 2: Try to extract just the JSON object
            else {
                const braceMatch = jsonString.match(/(\{[\s\S]*\})/);
                if (braceMatch && braceMatch[1]) {
                    jsonString = braceMatch[1];
                }
            }

            // Step 3: Clean up common JSON issues
            jsonString = jsonString
                .trim()
                // Remove any trailing non-JSON characters after final }
                .replace(/\}[^}]*$/, '}')
                // Remove trailing commas before closing braces/brackets
                .replace(/,(\s*[}\]])/g, '$1')

            articleData = JSON.parse(jsonString);
        } catch (jsonError) {
            log(`[ERROR] Failed to parse JSON from Gemini for "${title}": ${jsonError.message}`, 'ERROR');
            log(`[DEBUG] Raw Gemini response: ${text}`, 'ERROR');
            return { status: 'failed_json_parse', error: jsonError.message };
        }

        // Validate required fields (date is auto-generated, not from Gemini)
        if (!articleData.title || !articleData.content || !articleData.category || !articleData.description || !articleData.source_url) {
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

        // Apply quality filter BEFORE generating (saves tokens!)
        const filteredArticles = uniqueArticles.filter(shouldGenerateArticle);
        log(`After quality filtering: ${filteredArticles.length} articles passed (${uniqueArticles.length - filteredArticles.length} rejected)`);

        // Limit to 8 high-quality articles (better than 10 mediocre ones)
        const articlesToGenerate = filteredArticles.slice(0, 8);

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
