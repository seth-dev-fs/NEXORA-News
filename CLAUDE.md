# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NEXORA News is an automated news website built with Next.js 14+ that generates technology news articles in Portuguese using the Google Gemini API. Articles are automatically generated from RSS feeds every 2 hours via GitHub Actions, creating PRs for human review before publication.

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
                            # Requires GEMINI_API_KEY and UNSPLASH_API_KEY in .env.local
```

### Environment Variables
Required in `.env.local`:
- `GEMINI_API_KEY` - Google Gemini API key for article generation
- `UNSPLASH_API_KEY` - Unsplash API key for image search
- `REVALIDATE_TOKEN` - Secret token for cache revalidation API

## Architecture

### Content Pipeline
1. **GitHub Action** (`.github/workflows/generate.yml`) runs every 2 hours
2. **Article Generator** (`scripts/generate-articles.js`) fetches RSS feeds and generates drafts
3. **PR Creation** - New articles are committed as drafts and opened as PR
4. **Human Review** - Articles are reviewed and published by changing `draft: false`
5. **Deployment** - Merging to `main` triggers Vercel deployment

### File Structure
```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Homepage (shows latest 10 articles)
│   ├── noticias/[slug]/     # Dynamic article pages
│   ├── categoria/[slug]/    # Category pages
│   ├── admin/drafts/        # Draft article preview
│   └── api/
│       ├── newsletter/      # Newsletter signup endpoint
│       └── revalidate/      # ISR revalidation endpoint
├── components/              # React components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ArticleCard.tsx
│   └── NewsletterSignup.tsx
└── lib/
    └── markdown.ts          # Core article data layer

content/posts/               # Markdown articles with frontmatter
scripts/
├── generate-articles.js     # Main article generation script
└── helpers/                 # Utility modules
```

### Key Patterns

#### Article Data Layer (`src/lib/markdown.ts`)
Central module for all article operations:
- `getAllArticles()` - Returns all articles including drafts
- `getArticlesSortedByDate(limit?)` - Published articles sorted by date descending
- `getArticleBySlug(slug)` - Single article by slug (excludes drafts)
- `getArticlesByCategory(category, limit?)` - Filtered by category

**Important**: All functions exclude drafts by default except `getAllArticles()`. The draft filtering happens at the data layer, not in components.

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

#### Static Site Generation
- Article pages use `generateStaticParams()` at build time
- ISR (Incremental Static Regeneration) with 60-second revalidation
- Manual revalidation via `/api/revalidate?secret=TOKEN&path=/`
- Revalidation without path triggers homepage + all category pages

#### Image Handling
`next.config.js` whitelists remote image domains. When adding new RSS feeds that introduce new image domains, update `remotePatterns` array.

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

### Styling

Tailwind CSS with custom theme (`tailwind.config.ts`):
- Apple-inspired design (clean, minimal)
- Custom colors: primary blue (#0071e3), light backgrounds
- Typography plugin for article content rendering
- Uses CSS variables and semantic color names

### Common Workflows

#### Adding a New RSS Feed
1. Add feed URL to `RSS_FEEDS` array in `scripts/generate-articles.js`
2. Test locally: `npm run generate-articles`
3. Check if new image domains need whitelisting in `next.config.js`

#### Publishing Draft Articles
1. Navigate to generated PR from GitHub Action
2. Review articles in `content/posts/`
3. Change `draft: true` to `draft: false` in frontmatter
4. Merge PR to main branch
5. Vercel auto-deploys

#### Adding New Categories
Categories are dynamic based on frontmatter. No code changes needed - just use a new category value in article frontmatter and the category page will be generated automatically.

#### Debugging Build Failures
1. Run `npm run build` locally to reproduce
2. Common issues:
   - Missing `generateStaticParams()` in dynamic routes
   - Image domains not whitelisted in `next.config.js`
   - TypeScript errors in components
   - Invalid frontmatter in markdown files

## Important Notes

- All articles are in Portuguese, generated from English tech news sources
- The site uses Next.js App Router (not Pages Router)
- Path aliases use `@/*` for `src/*` (see `tsconfig.json`)
- Node.js version requirement: >=20.9.0
- Draft articles are accessible via `/admin/drafts` for preview
- Gemini model used: `gemini-2.5-flash` (configured in generation script)
