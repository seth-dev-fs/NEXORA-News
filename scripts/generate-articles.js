const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');
const axios = require('axios');

// --- CONFIGURATION ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY;
if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY environment variable is not set.");

const GEMINI_MODEL = "gemini-2.5-flash";
const DATE_OVERRIDE = "2025-11-08"; // Set to a specific date string "YYYY-MM-DD" or null to disable

const ARTICLES_DIR = path.join(__dirname, '../content/posts');
const LOGS_DIR = path.join(__dirname, '../content/logs');
const FEEDS = ['http://feeds.arstechnica.com/arstechnica/index/', 'http://www.theverge.com/rss/index.xml', 'https://techcrunch.com/feed/', 'https://www.wired.com/feed/rss', 'https://www.engadget.com/rss.xml'];
const BATCH_SIZE = 5;

// --- HELPER FUNCTIONS ---
function log(message, level = 'INFO') { console.log(`[${new Date().toISOString()}] [${level}] ${message}`); }
function ensureDirExists(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }
function slugify(text) {
  if (!text) return '';
  return text.toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

function getExistingArticleUrls() {
    if (!fs.existsSync(ARTICLES_DIR)) return new Set();
    const files = fs.readdirSync(ARTICLES_DIR);
    const existingUrls = new Set();
    for (const file of files) {
        if (file.endsWith('.md')) {
            const content = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf8');
            const urlMatch = content.match(/^source_url:\s*"(.*)"/m);
            if (urlMatch && urlMatch[1]) existingUrls.add(urlMatch[1]);
        }
    }
    return existingUrls;
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

async function getImageUrl(rssItem, title, slug) {
    // 1. Check RSS feed for an image
    if (rssItem.enclosure && rssItem.enclosure.url && rssItem.enclosure.type.startsWith('image/')) {
        log(`Found image in RSS feed: ${rssItem.enclosure.url}`, 'INFO');
        return rssItem.enclosure.url;
    }
    if (rssItem['media:content'] && rssItem['media:content'].$.url) {
        log(`Found image in RSS media:content: ${rssItem['media:content'].$.url}`, 'INFO');
        return rssItem['media:content'].$.url;
    }

    // 2. Search Unsplash API
    if (UNSPLASH_API_KEY) {
        try {
            log(`Searching Unsplash for image with query: "${title}"`, 'INFO');
            const response = await axios.get('https://api.unsplash.com/search/photos', {
                headers: { 'Authorization': `Client-ID ${UNSPLASH_API_KEY}` },
                params: { query: title, per_page: 1, orientation: 'landscape' }
            });
            if (response.data.results && response.data.results.length > 0) {
                const imageUrl = response.data.results[0].urls.regular;
                log(`Found image on Unsplash: ${imageUrl}`, 'INFO');
                return imageUrl;
            }
        } catch (error) {
            log(`Unsplash API error: ${error.message}`, 'WARN');
        }
    } else {
        log('UNSPLASH_API_KEY not set. Skipping Unsplash search.', 'WARN');
    }
    
    // 3. Fallback to Picsum
    log('Falling back to picsum.photos for image.', 'INFO');
    return `https://picsum.photos/seed/${slug}/1000/600`;
}

async function saveArticle(slug, frontMatter, content) {
    const filePath = path.join(ARTICLES_DIR, `${slug}.md`);
    if (fs.existsSync(filePath)) {
        log(`Article with slug "${slug}" already exists. Skipping.`, 'WARN');
        return false;
    }
    let frontMatterString = '---\n';
    for (const [key, value] of Object.entries(frontMatter)) {
        frontMatterString += `${key}: ${JSON.stringify(value)}
`;
    }
    frontMatterString += '---\n\n';
    fs.writeFileSync(filePath, frontMatterString + content, 'utf8');
    log(`Article saved: ${filePath}`);
    return true;
}

async function generateArticleFromItem(item) {
    const { title, link, contentSnippet, isoDate } = item;
    log(`Generating article for: "${title}"`);
    const prompt = `Analyze the following article information and generate a new, original news article in Portuguese (pt-PT). The tone should be simple, light, and informative. The article must be detailed, comprehensive, and at least 500 words long, structured with an introduction, multiple body paragraphs with markdown subheadings, and a conclusion.

Provide ONLY a valid JSON object with the following structure:
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

        if (!articleData.title || !articleData.content) throw new Error("Generated data is missing title or content.");
        
        const slug = slugify(articleData.title);
        const imageUrl = await getImageUrl(item, articleData.title, slug);
        
        // Use the date override if it exists, otherwise use the feed date or now.
        const articleDate = DATE_OVERRIDE ? new Date(DATE_OVERRIDE).toISOString() : new Date(isoDate || Date.now()).toISOString();

        const frontmatter = {
            slug: slug,
            title: articleData.title,
            description: articleData.description || '',
            category: articleData.category || 'Geral',
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
        log(`Failed to generate or save article for "${title}": ${error.message}`, 'ERROR');
        return { status: 'failed' };
    }
}

async function main() {
    log('Starting article generation script...');
    ensureDirExists(ARTICLES_DIR);
    ensureDirExists(LOGS_DIR);
  
    const parser = new Parser({ customFields: { item: [['media:content', 'media:content']] } });
    const existingUrls = getExistingArticleUrls();
    let allItems = [];

    for (const feedUrl of FEEDS) {
        try {
            const feed = await parser.parseURL(feedUrl);
            if (feed.items) {
                allItems.push(...feed.items.filter(item => item.link && !existingUrls.has(item.link)));
            }
        } catch (error) {
            log(`Failed to fetch feed ${feedUrl}: ${error.message}`, 'WARN');
        }
    }

    allItems.sort((a, b) => new Date(b.isoDate || 0).getTime() - new Date(a.date || 0).getTime());
  
    const itemsToProcess = allItems.slice(0, BATCH_SIZE);
    log(`Found ${allItems.length} new items. Processing the latest ${itemsToProcess.length}.`);

    if (itemsToProcess.length === 0) {
        log('No new articles to generate.', 'INFO');
        return;
    }
  
    for (const item of itemsToProcess) {
        await generateArticleFromItem(item);
    }
  
    log('Article generation script finished.');
}

main().catch(e => {
    log(`Critical error in main function: ${e.message}`, 'ERROR');
    process.exit(1);
});
