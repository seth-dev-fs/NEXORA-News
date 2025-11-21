const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');
const axios = require('axios');

// --- CONFIGURATION ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("CRITICAL: GEMINI_API_KEY environment variable is not set.");
    process.exit(1);
}

const GEMINI_MODEL = "gemini-2.5-flash";
const DATE_OVERRIDE = "2025-11-08T12:00:00Z";
const BATCH_SIZE = 10;

const ARTICLES_DIR = path.join(__dirname, '../content/posts');
const LOGS_DIR = path.join(__dirname, '../content/logs');
const FEEDS = ['http://feeds.arstechnica.com/arstechnica/index/', 'http://www.theverge.com/rss/index.xml', 'https://techcrunch.com/feed/', 'https://www.wired.com/feed/rss', 'https://www.engadget.com/rss.xml'];

// --- HELPER FUNCTIONS ---
const log = (message, level = 'INFO') => console.log(`[${new Date().toISOString()}] [${level}] ${message}`);
const ensureDirExists = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };
const slugify = (text) => text ? text.toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') : '';

function getExistingArticleUrls() {
    if (!fs.existsSync(ARTICLES_DIR)) return new Set();
    const urls = new Set();
    fs.readdirSync(ARTICLES_DIR).forEach(file => {
        if (file.endsWith('.md')) {
            const content = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf8');
            const urlMatch = content.match(/^source_url:\s*"(.*)"/m);
            if (urlMatch && urlMatch[1]) urls.add(urlMatch[1]);
        }
    });
    return urls;
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

async function scrapeOgImage(url) {
    try {
        log(`Scraping for og:image at: ${url}`, 'INFO');
        const { data: html } = await axios.get(url, { timeout: 10000 });
        const match = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/);
        if (match && match[1]) {
            log(`Found og:image: ${match[1]}`, 'INFO');
            return match[1];
        }
    } catch (error) {
        log(`Failed to scrape ${url}: ${error.message}`, 'WARN');
    }
    return null;
}

async function getImageUrl(rssItem, slug) {
    // Tier 1: Check RSS enclosure
    if (rssItem.enclosure && rssItem.enclosure.url && rssItem.enclosure.type.startsWith('image/')) {
        log('Found image in RSS enclosure', 'INFO');
        return rssItem.enclosure.url;
    }
    // Tier 2: Check RSS media:content
    if (rssItem['media:content'] && rssItem['media:content'].$.url) {
        log('Found image in RSS media:content', 'INFO');
        return rssItem['media:content'].$.url;
    }
    // Tier 3: Scrape the webpage for og:image meta tag
    if (rssItem.link) {
        const scrapedImage = await scrapeOgImage(rssItem.link);
        if (scrapedImage) {
            return scrapedImage;
        }
    }
    // Tier 4: Fallback to placeholder
    log('Falling back to placeholder image.', 'WARN');
    return `https://picsum.photos/seed/${slug}/1000/600`;
}

async function saveArticle(slug, frontMatter, content) {
    const filePath = path.join(ARTICLES_DIR, `${slug}.md`);
    if (fs.existsSync(filePath)) {
        log(`Skipping existing slug: ${slug}`, 'WARN');
        return false;
    }
    let frontMatterString = '---\n';
    Object.entries(frontMatter).forEach(([key, value]) => {
        frontMatterString += `${key}: ${JSON.stringify(value)}
`;
    });
    frontMatterString += '---\n\n';
    fs.writeFileSync(filePath, frontMatterString + content, 'utf8');
    log(`SUCCESS: Article saved -> ${filePath}`);
    return true;
}

async function generateArticleFromItem(item) {
    const { title, link, contentSnippet, isoDate } = item;
    log(`Processing article: "${title}"`);

    const prompt = `Analyze the following article information and generate a new, original news article in Portuguese (pt-PT). The tone should be simple and informative. The article must be comprehensive, at least 500 words long, and structured with a clear introduction, multiple body paragraphs with markdown subheadings. Your entire response must be ONLY a valid JSON object.

Original Title: "${title}"
Original Snippet: "${contentSnippet}"

JSON structure to generate:
{
  "title": "A compelling and clear title in Portuguese",
  "description": "A concise summary in Portuguese (1-2 sentences)",
  "category": "You MUST choose ONLY ONE category from this exact list: [Smartphones, Wearables, Audio, Computadores, Internet & Apps, Mobilidade, Ciência, Entretenimento / Gaming, AI / Futuro]",
  "tags": ["A list of 3-5 relevant keywords in Portuguese"],
  "content": "The full, detailed article content in GFM markdown format as described above."
}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanedResponse = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const articleData = JSON.parse(cleanedResponse);

        if (!articleData.title || !articleData.content) throw new Error("Generated JSON is missing title or content.");
        
        const slug = slugify(articleData.title);
        const imageUrl = await getImageUrl(item, slug);
        
        const articleDate = DATE_OVERRIDE || new Date(isoDate || Date.now()).toISOString();

        const frontmatter = {
            slug: slug,
            title: articleData.title,
            description: articleData.description || '',
            category: articleData.category || 'Tecnologia',
            tags: articleData.tags || [],
            date: articleDate,
            featured_image: imageUrl,
            meta_description: articleData.description || '',
            source_url: link
        };

        if (saveArticle(slug, frontmatter, articleData.content)) {
            return { status: 'generated' };
        }
        return { status: 'skipped' };
    } catch (error) {
        log(`Failed during generation for "${title}": ${error.message}`, 'ERROR');
        return { status: 'failed' };
    }
}

async function main() {
    log('--- STARTING ARTICLE GENERATION RUN ---');
    ensureDirExists(ARTICLES_DIR);
  
    const parser = new Parser({ customFields: { item: [['media:content', 'media:content']] } });
    const existingUrls = getExistingArticleUrls();
    let allItems = [];

    for (const feedUrl of FEEDS) {
        try {
            const parsedFeed = await parser.parseURL(feedUrl);
            if (parsedFeed.items) {
                const newItems = parsedFeed.items.filter(item => item.link && !existingUrls.has(item.link));
                allItems.push(...newItems);
            }
        } catch (error) {
            log(`Failed to fetch feed ${feedUrl}: ${error.message}`, 'WARN');
        }
    }

    allItems.sort((a, b) => new Date(b.isoDate || 0).getTime() - new Date(a.date || 0).getTime());
  
    const itemsToProcess = allItems.slice(0, BATCH_SIZE);
    log(`Found ${allItems.length} new items. Processing a batch of ${itemsToProcess.length}.`);

    if (itemsToProcess.length === 0) {
        log('No new articles to generate.', 'INFO');
    } else {
        for (const item of itemsToProcess) {
            await generateArticleFromItem(item);
        }
    }
  
    log('--- ARTICLE GENERATION RUN FINISHED ---');
}

main().catch(e => {
    log(`A critical, unhandled error occurred in the main function: ${e.message}`, 'FATAL');
    process.exit(1);
});
