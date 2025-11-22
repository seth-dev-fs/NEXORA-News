# NEXORA News - Content Pipeline Documentation

## Overview

This document provides technical details about the content generation pipeline for NEXORA News, including architecture, workflows, and troubleshooting.

---

## Architecture

### Pipeline Flow

```
RSS Feeds → Fetch Articles → Filter Duplicates → Fetch Images (Multi-tier Fallback)
    → Generate Content (Gemini AI) → Validate Categories → Save Markdown → Revalidate Next.js
```

---

## Core Components

### 1. Article Generation Script

**Location:** `/scripts/generate-articles.js`

**Purpose:** Main orchestration script that fetches, processes, and generates articles.

**Key Features:**
- Multi-RSS feed aggregation (15 tech news sources)
- Duplicate detection using title similarity (Jaccard index)
- Robust image fetching with 5-tier fallback system
- AI-powered content generation using Google Gemini
- Automatic category normalization to slugs
- Frontmatter validation and YAML generation
- Next.js ISR revalidation trigger

---

### 2. Image Fallback System (CRITICAL)

The pipeline implements a **5-tier fallback strategy** to ensure every article has a valid image:

#### Tier 1: RSS Feed Enclosure
- Checks `<enclosure>` tags in RSS feed
- Validates image URL and content-type
- **Fastest** but not always available

#### Tier 2: Media:Content Tag
- Checks `<media:content>` tags
- Common in media-rich feeds (TechCrunch, The Verge)

#### Tier 3: Open Graph / Twitter Card Scraping
- Scrapes article URL for `og:image` and `twitter:image` meta tags
- Uses Cheerio for HTML parsing
- **Most reliable** for modern news sites

#### Tier 4: Unsplash API Fallback
- Fetches random image based on article title keywords
- Requires `UNSPLASH_ACCESS_KEY` environment variable
- **Optional** but recommended for production

#### Tier 5: Placeholder Image
- Ultimate fallback: `https://via.placeholder.com/1200x630/1a1a2e/eaeaea?text=NEXORA+News`
- **Always succeeds** - guarantees no broken images

**Implementation:**
```javascript
async function getImageUrl(rssItem, articleTitle = '') {
  // TIER 1-5 cascade with validation
  // Returns: Always a valid image URL (never null)
}
```

---

### 3. Category Normalization System

**CRITICAL:** All articles MUST use normalized category slugs.

#### Normalized Categories (Slugs):
```
ai-futuro
audio
ciencia
computadores
entretenimento-gaming
gaming
internet-apps
mobilidade
smartphones
wearables
home
```

#### Category Mapping:
The system maps common English terms to Portuguese slugs:
```javascript
{
  'phones' → 'smartphones',
  'ai' → 'ai-futuro',
  'computer' → 'computadores',
  'science' → 'ciencia',
  // ... etc
}
```

#### Validation Flow:
1. Gemini generates category in prompt response
2. System normalizes to lowercase and trims whitespace
3. Checks if category exists in `NORMALIZED_CATEGORIES`
4. If not found, checks `CATEGORY_MAP` for mapping
5. If still not found, defaults to `'home'` and sets `needs_review: true`

---

### 4. Gemini AI Configuration

**Model:** `gemini-2.0-flash-exp` (experimental, high performance)

**Alternative Models:**
- `gemini-1.5-pro` (stable, production-ready)
- `gemini-1.5-flash` (fast, cost-effective)

**Why gemini-2.0-flash-exp?**
- Latest features and improved performance
- Native tool use and 1M token context window
- Better JSON structured output
- **Note:** Experimental models may have lower rate limits

**Prompt Engineering:**
- Instructs Gemini to generate ONLY JSON (no markdown wrappers)
- Explicitly lists all allowed categories
- Requires 400-900 word articles in Portuguese (pt-PT)
- Enforces factual accuracy (no invention)

---

### 5. Frontmatter Schema

Generated articles have the following frontmatter structure:

```yaml
---
title: "Article Title in Portuguese"
date: "2025-11-22T12:00:00.000Z"
category: "smartphones"  # ALWAYS a normalized slug
tags:
  - tag1
  - tag2
image: "https://valid-image-url.com/image.jpg"
image_source: "https://source-url.com"
description: "Meta description in Portuguese (1-2 sentences)"
source_url: "https://original-article-url.com"
draft: true  # ALWAYS true for new articles
needs_review: false  # true if category defaulted to 'home'
---
```

---

## Helper Functions

### 1. `fetchFeed.js`
- Uses `rss-parser` library
- Returns empty array on failure (resilient)
- Timeout: Default RSS parser timeout

### 2. `logger.js`
- Simple ISO timestamp logger
- Levels: INFO, WARN, ERROR, FATAL
- Format: `[2025-11-22T12:00:00.000Z] [LEVEL] message`

### 3. `slugify.js`
- Converts titles to URL-friendly slugs
- Handles Portuguese characters (NFD normalization)
- Removes accents and special characters
- **Not used directly** (inline slugify in main script)

### 4. `fetchArticle.js`
- **Placeholder** - not currently used
- Reserved for future full-text extraction

### 5. `saveMarkdown.js`
- **Not used** - saving is done inline in main script
- Reserved for future refactoring

---

## Configuration

### Environment Variables

See `.env.example` for full details.

**Required:**
- `GEMINI_API_KEY` - Google Gemini API key (CRITICAL)
- `REVALIDATE_TOKEN` - Next.js revalidation secret

**Optional:**
- `UNSPLASH_ACCESS_KEY` - Unsplash API for fallback images
- `NEXT_PUBLIC_VERCEL_URL` - Deployment URL (auto-detected on Vercel)

### RSS Feeds

Current sources (15 feeds):
- Ars Technica, The Verge, TechCrunch, Engadget
- PhoneArena, Android Authority, 9to5Mac, SamMobile
- TechRadar, 9to5Linux, It's FOSS, OMG Ubuntu
- GSMArena, Xataka, Notebookcheck

**Adding new feeds:**
Edit `RSS_FEEDS` array in `scripts/generate-articles.js`

---

## Workflow

### Article Generation Process

1. **Feed Aggregation:**
   - Fetches top 3 newest articles from each RSS feed
   - Creates candidate pool of up to 45 articles

2. **Deduplication:**
   - Checks existing articles by `source_url`
   - Removes similar titles using Jaccard similarity (threshold: 0.5)
   - Selects top 10 unique articles sorted by date

3. **Image Fetching:**
   - Executes 5-tier fallback for each article
   - Validates image URLs (HEAD request with timeout)
   - Always succeeds (placeholder as final fallback)

4. **Content Generation:**
   - Sends prompt to Gemini with source title and snippet
   - Extracts JSON from response (handles markdown wrappers)
   - Validates required fields

5. **Category Normalization:**
   - Applies category mapping and validation
   - Sets `needs_review: true` if defaulted to 'home'

6. **Frontmatter Generation:**
   - Constructs YAML frontmatter with all metadata
   - **Always sets `draft: true`** for new articles
   - Adds traceability comment with model and timestamp

7. **Slug Uniqueness:**
   - Generates slug from title
   - Increments counter if slug already exists
   - Example: `article-title.md` → `article-title-1.md`

8. **File Writing:**
   - Saves to `/content/posts/[slug].md`
   - Format: Traceability comment + Frontmatter + Content

9. **Revalidation:**
   - Triggers Next.js ISR for individual article page
   - Triggers global revalidation after all articles complete

---

## Troubleshooting

### Common Issues

#### 1. "GEMINI_API_KEY environment variable is not set"
**Solution:** Create `.env.local` and add your Gemini API key.

#### 2. All images are placeholders
**Causes:**
- Unsplash API key not set (expected if not configured)
- Network issues preventing image validation
- All RSS feeds lack image data

**Solution:**
- Add `UNSPLASH_ACCESS_KEY` to `.env.local`
- Check network connectivity
- Verify RSS feeds are accessible

#### 3. Categories defaulting to 'home'
**Cause:** Gemini generating categories not in `NORMALIZED_CATEGORIES`

**Solution:**
- Review Gemini prompt to ensure categories are clear
- Expand `CATEGORY_MAP` with common terms
- Check `needs_review: true` flag in generated articles

#### 4. JSON parsing errors from Gemini
**Cause:** Gemini returning conversational text instead of pure JSON

**Solution:**
- Script already handles markdown wrappers (```json)
- Check raw response in logs
- Consider adjusting prompt clarity
- Switch to `gemini-1.5-pro` if persistent

#### 5. Duplicate slugs
**Cause:** Multiple articles with identical titles

**Solution:**
- Script auto-increments counter (`article-title-1.md`)
- Check logs for WARN messages about duplicate slugs

---

## Performance Optimization

### Current Limits
- Processes **10 articles per run** (configurable in `main()`)
- Timeout per image validation: **5 seconds**
- Timeout per scraping request: **10 seconds**
- Timeout per Unsplash request: **8 seconds**

### Bottlenecks
1. **Image scraping** - Can be slow for unresponsive sites
2. **Gemini API calls** - Rate limits apply (check quota)
3. **Article similarity comparison** - O(n²) complexity

### Optimization Strategies
- Increase article batch size (line 527 in `main()`)
- Cache validated image URLs to avoid re-checking
- Parallelize Gemini API calls (currently sequential)
- Implement Redis/database for deduplication

---

## Error Handling

### Error Boundaries

Each stage has isolated error handling:
- Feed fetch failures → logged, continue with other feeds
- Image validation failures → cascade to next tier
- Gemini errors → logged, article skipped
- Revalidation errors → logged, doesn't block completion

### Logging Strategy
- **INFO:** Normal operations, successful steps
- **WARN:** Fallback actions, skipped items
- **ERROR:** Failed operations, missing data
- **FATAL:** Unrecoverable errors (exits process)

---

## Next.js Integration

### Revalidation API

**Endpoint:** `/api/revalidate`

**Parameters:**
- `secret` - Must match `REVALIDATE_TOKEN`
- `path` - Optional, specific path to revalidate

**Triggers:**
1. Individual article page: `/noticias/[slug]`
2. Global revalidation (after all articles generated)

**Why revalidation?**
- Next.js uses ISR (Incremental Static Regeneration)
- New articles require cache invalidation
- Ensures fresh content appears immediately

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor logs for ERROR/FATAL messages
- Check `needs_review: true` articles

**Weekly:**
- Review Gemini API usage and costs
- Verify RSS feeds are still active

**Monthly:**
- Update `CATEGORY_MAP` based on common misclassifications
- Review and adjust similarity threshold if needed

### Code Updates

**Before modifying:**
1. Test changes with a single article first
2. Backup `/content/posts/` directory
3. Verify category normalization still works
4. Check frontmatter YAML validity

**After modifying:**
1. Run `npm run generate-articles` and check logs
2. Verify generated markdown files manually
3. Confirm images load in Next.js dev server
4. Check category pages display articles correctly

---

## Security Considerations

### API Keys
- **Never commit** `.env.local` to version control
- Use different API keys for development/production
- Rotate keys if exposed

### Content Validation
- Gemini output is **not** sanitized (assumed safe)
- Source URLs are normalized but not validated
- Consider implementing content security policy (CSP)

### Rate Limiting
- Gemini API has quotas (check Google Cloud Console)
- Unsplash has rate limits (50 requests/hour free tier)
- RSS feeds may block excessive requests

---

## Future Enhancements

### Planned Improvements
1. **Retry logic with exponential backoff** for API calls
2. **Database integration** for better deduplication
3. **Image CDN caching** to reduce external requests
4. **Full-text extraction** using `fetchArticle.js`
5. **Multi-language support** (currently pt-PT only)
6. **Automated testing** for pipeline stages
7. **Webhook triggers** for on-demand generation

### Technical Debt
- `fetchArticle.js` and `saveMarkdown.js` are placeholders
- Inline slugify function should use helper
- Error messages could be more actionable
- No unit tests for pipeline components

---

## Support

For issues or questions about the content pipeline:
1. Check this documentation first
2. Review logs in `/content/logs/` (if implemented)
3. Verify environment variables in `.env.local`
4. Check Gemini API quotas and status
5. Test with a single article to isolate issues

---

**Last Updated:** 2025-11-22
**Pipeline Version:** 2.0 (Multi-tier fallback + Category normalization)
**Maintained by:** NEXORA News Content Pipeline Team
