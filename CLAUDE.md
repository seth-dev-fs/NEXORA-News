# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NEXORA News is an automated news website built with Next.js 14+ that generates technology news articles in Portuguese using the Google Gemini API. Articles are automatically generated from RSS feeds every 2 hours via GitHub Actions and committed directly to the main branch as drafts.

## Development Commands

### Core Commands
```bash
npm run dev              # Start development server (localhost:3000)
npm run build            # Build for production (validates static generation)
npm run start            # Start production server
npm run lint             # Run Next.js linting
npm test                 # Run Jest tests
```

### Content Generation
```bash
npm run generate-articles    # Generate articles locally from RSS feeds
                            # Creates markdown files in content/posts/
                            # Requires GEMINI_API_KEY in .env.local
                            # UNSPLASH_ACCESS_KEY is optional
```

### Environment Variables
Required in `.env.local`:
- `GEMINI_API_KEY` - Google Gemini API key for article generation (REQUIRED)
- `UNSPLASH_ACCESS_KEY` - Unsplash API key for fallback image search (OPTIONAL)
- `REVALIDATE_TOKEN` - Secret token for cache revalidation API (REQUIRED for production)
- `NEXT_PUBLIC_GA_ID` - Google Analytics 4 Measurement ID (OPTIONAL, format: G-XXXXXXXXXX)
- `NEXT_PUBLIC_VERCEL_URL` - Base URL for deployment (auto-detected on Vercel)

## Architecture

### Content Pipeline
1. **GitHub Action** (`.github/workflows/generate.yml`) runs every 2 hours or via manual trigger
2. **Article Generator** (`scripts/generate-articles.js`) fetches RSS feeds and generates drafts
3. **Direct Commit** - New articles are committed directly to `main` branch (no PR workflow)
4. **Auto-Deployment** - Push to `main` triggers automatic Vercel deployment
5. **Manual Publishing** - Change `draft: false` in frontmatter to publish articles on site

### File Structure
```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Homepage (shows latest 10 articles)
│   ├── noticias/[slug]/     # Dynamic article pages
│   ├── categoria/[slug]/    # Category pages
│   ├── admin/drafts/        # Draft article preview
│   └── api/
│       ├── articles/        # JSON API endpoint for search functionality
│       ├── newsletter/      # Newsletter signup endpoint
│       └── revalidate/      # ISR revalidation endpoint
├── components/              # React components
│   ├── Header.tsx           # Site header with search and dark mode
│   ├── Footer.tsx
│   ├── ArticleCard.tsx      # Article preview with reading time
│   ├── NewsletterSignup.tsx
│   ├── SearchBar.tsx        # Client-side search with keyboard nav
│   ├── ShareButtons.tsx     # Social sharing (WhatsApp, Facebook, etc.)
│   ├── DarkModeToggle.tsx   # Theme switcher (Light/Dark/System)
│   ├── ThemeProvider.tsx    # next-themes wrapper
│   ├── GoogleAnalytics.tsx  # GA4 tracking component
│   └── RelatedArticles.tsx  # Shows 3 related articles
└── lib/
    ├── markdown.ts          # Core article data layer with caching
    └── categories.ts        # Category utilities and mappings

content/posts/               # Markdown articles with frontmatter
scripts/
├── generate-articles.js     # Main article generation script
└── helpers/                 # Utility modules
    ├── fetchFeed.js        # RSS feed fetching
    └── logger.js           # Logging utilities
```

### Key Patterns

#### Article Data Layer (`src/lib/markdown.ts`)
Central module for all article operations with built-in caching:
- `getAllArticles()` - Returns all articles including drafts
- `getArticlesSortedByDate(limit?)` - Published articles sorted by date descending
- `getArticleBySlug(slug)` - Single article by slug (excludes drafts)
- `getArticlesByCategory(category, limit?)` - Filtered by category
- `getRelatedArticles(slug, limit?)` - Returns related articles based on category
- `invalidateArticlesCache()` - Manually clear cache (auto-called by revalidation API)

**Important**:
- All functions exclude drafts by default except `getAllArticles()`
- Draft filtering happens at the data layer, not in components
- Articles are cached in production (infinite TTL) and development (60s TTL)
- Each article includes `readingTime` field (calculated from word count at 200 WPM)

#### Article Frontmatter
Every markdown file in `content/posts/` must have:
```yaml
---
title: "Article Title"
date: "2025-11-22T11:31:00.000Z"  # ISO format
category: "smartphones"            # Used for categorization
description: "Brief description"
image: "https://..."              # Main image URL
source_url: "https://..."         # Original source article
draft: true                       # Set to false to publish
---
```

#### Static Site Generation & Caching
- Article pages use `generateStaticParams()` at build time
- ISR (Incremental Static Regeneration) with 60-second revalidation
- Manual revalidation via `/api/revalidate?secret=TOKEN&path=/`
- Revalidation without path triggers homepage + all category pages + cache invalidation
- `/api/articles` endpoint has 1-hour cache (`revalidate: 3600`)
- In-memory article cache (infinite in prod, 60s in dev)

#### Image Handling
`next.config.js` whitelists remote image domains. When adding new RSS feeds that introduce new image domains, update `remotePatterns` array. The config includes 30+ pre-whitelisted domains from common tech news sources.

#### Security & Headers
Production deployment includes security headers configured in `next.config.js`:
- Content Security Policy (CSP) allows Google Analytics scripts
- HSTS, X-Frame-Options, X-Content-Type-Options
- Referrer-Policy, Permissions-Policy
- Image optimization with AVIF and WebP formats

### Article Generation Process

The `scripts/generate-articles.js` script:
1. Fetches from 15+ RSS feeds (tech news sources)
2. Normalizes URLs and removes duplicates
3. Uses Gemini API to generate Portuguese articles from English sources
4. Searches for images (RSS feed → Unsplash → placeholder)
5. Creates markdown files with `draft: true`
6. Articles are saved to `content/posts/` with slugified filenames

**Duplicate Detection**: Uses title similarity algorithm (Jaccard index) with 0.5 threshold to avoid duplicate articles from different feeds covering the same story.

### Testing

Jest configured with Next.js preset:
- Test files: `*.test.ts` or `*.test.tsx`
- Example: `src/lib/markdown.test.ts`
- Run single test: `npm test -- markdown.test.ts`

### Styling & Features

Tailwind CSS with custom theme (`tailwind.config.ts`):
- Apple-inspired design (clean, minimal)
- Custom colors: primary blue (#0071e3), light backgrounds
- Typography plugin for article content rendering
- Dark mode support via `next-themes` (Light/Dark/System)
- Uses CSS variables for theme switching
- WCAG 2.1 AA compliant (nearly AAA)

**Modern Features**:
- Real-time client-side search with keyboard navigation (↑↓ Enter Esc)
- Social sharing (WhatsApp, Facebook, Twitter/X, LinkedIn, Copy-to-clipboard)
- Reading time indicators on articles
- Related articles section (3 articles, same category priority)
- Google Analytics 4 integration (optional, production-only)

### Common Workflows

#### Adding a New RSS Feed
1. Add feed URL to `RSS_FEEDS` array in `scripts/generate-articles.js`
2. Test locally: `npm run generate-articles`
3. Check if new image domains need whitelisting in `next.config.js`

#### Publishing Draft Articles
1. Articles are automatically committed to `main` branch by GitHub Action
2. Review new articles in `content/posts/` directory
3. Edit article frontmatter: change `draft: true` to `draft: false`
4. Commit and push changes to `main`
5. Vercel auto-deploys and article appears on site

#### Adding New Categories
Categories are defined in `scripts/generate-articles.js` in the `NORMALIZED_CATEGORIES` array. To add a new category:
1. Add the category slug to `NORMALIZED_CATEGORIES` array
2. Optionally add category mappings in `CATEGORY_MAP` for English → Portuguese slug conversion
3. Category pages are automatically generated at build time via `generateStaticParams()`

#### Manual Article Generation Workflow
Run GitHub Action manually via:
```bash
gh workflow run "Generate NEXORA Articles"
# Or use GitHub UI: Actions → Generate NEXORA Articles → Run workflow
```

The action will:
1. Fetch latest RSS feed items
2. Generate Portuguese articles via Gemini API
3. Commit directly to `main` if new articles found
4. Skip commit if no new unique content

#### Debugging Build Failures
1. Run `npm run build` locally to reproduce
2. Common issues:
   - Missing `generateStaticParams()` in dynamic routes
   - Image domains not whitelisted in `next.config.js`
   - TypeScript errors in components
   - Invalid frontmatter in markdown files
   - Malformed YAML (HTML comments before `---` delimiters)
3. Check logs: `content/logs/` contains generation logs

## Important Notes

### Content & Localization
- All articles are in **Portuguese (PT-PT)**, generated from English tech news sources
- Content is adapted for European/Portuguese audience (not USA-centric)
- Articles target 400-500 words for conciseness and readability

### Technical Stack
- **Next.js App Router** (not Pages Router)
- **Gemini model**: `gemini-2.5-flash` (configured in generation script)
- **Node.js requirement**: >=20.9.0
- **Path aliases**: `@/*` maps to `src/*` (see `tsconfig.json`)

### Workflow Notes
- Draft articles are accessible via `/admin/drafts` for preview
- GitHub Action commits directly to `main` (no PR workflow)
- Duplicate detection uses Jaccard index with 0.5 threshold
- 15+ RSS feeds monitored every 2 hours
- Production uses infinite article cache; dev uses 60s TTL
