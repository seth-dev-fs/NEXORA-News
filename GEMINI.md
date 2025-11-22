# GEMINI.md - Project Overview and Development Guide

This document provides a comprehensive overview of the NEXORA News project, its architecture, and development conventions. It is intended to be used as a context file for future AI-assisted development sessions.

## 1. Project Overview

NEXORA News is an automated news website built with Next.js and deployed on Vercel. Its primary purpose is to generate technology-focused news articles in Portuguese by pulling content from various RSS feeds and using the Google Gemini API for content generation.

### Core Technologies
- **Framework:** Next.js (v14+) with React
- **Language:** TypeScript
- **Styling:** Tailwind CSS with the Typography plugin
- **Content Generation:** Google Gemini (`gemini-2.5-flash`) via the `@google/generative-ai` SDK
- **Automation:** A GitHub Action workflow automates the entire content pipeline.

### Architecture & Data Flow
The project follows a decoupled content generation and rendering architecture:

1.  **Automation Trigger:** A GitHub Action defined in `.github/workflows/generate.yml` runs on a schedule (every 2 hours) or can be triggered manually.
2.  **Content Generation:** The action executes the `scripts/generate-articles.js` script. This script:
    *   Fetches recent articles from a predefined list of RSS feeds.
    *   Identifies a suitable category for each article based on keywords.
    *   Calls the Gemini API to rewrite and expand the article content.
    *   Finds a suitable header image using a multi-tier fallback system (article's image, Unsplash API, or a default placeholder).
    *   Saves the generated articles as individual Markdown files in the `content/posts/` directory, with the frontmatter flag `draft: true` set by default.
3.  **Pull Request Creation:** After generating articles, the GitHub Action automatically creates a new Pull Request with the new content, allowing for manual review and approval before the articles go live.
4.  **Data Fetching:** The Next.js application uses a data-fetching utility at `src/lib/markdown.ts`. This utility reads the Markdown files from the `content/posts/` directory, parses frontmatter using `gray-matter`, and converts markdown to HTML using `remark`. Crucially, all public-facing data-fetching functions in this module explicitly filter out articles where `draft: true`, preventing them from appearing on the live site. It uses an in-memory cache for performance.
5.  **Rendering:** The Next.js pages (built with the App Router) use Static Site Generation (SSG) via `generateStaticParams` to pre-render all article pages at build time. This ensures fast load times. The pages also use Incremental Static Revalidation (`revalidate`) to periodically refresh content, ensuring that updates become visible without requiring a full site redeployment.

## 2. Building and Running

### Environment Variables
The project requires the following environment variables to be set, especially for the content generation script:

-   `GEMINI_API_KEY`: Your API key for the Google Gemini service.
-   `UNSPLASH_API_KEY`: (Optional) Your API key for Unsplash to enable the image search feature.

These should be configured as **Repository Secrets** in the GitHub project settings for the Action to work.

### Key Commands
The primary commands are defined in `package.json`:

-   **`npm run dev`**: Starts the Next.js development server.
-   **`npm run build`**: Creates an optimized production build of the application. This is the command Vercel runs.
-   **`npm run start`**: Starts the production server after a build.
-   **`npm run lint`**: Lints the codebase for errors.
-   **`npm run generate-articles`**: Manually triggers the content generation script on your local machine. This is useful for testing and requires the `GEMINI_API_KEY` to be set in your local environment.

## 3. Development Conventions

-   **Routing:** The project uses the Next.js App Router.
    -   The homepage is `src/app/page.tsx`.
    -   All articles are rendered via the dynamic route `src/app/noticias/[slug]/page.tsx`.
    -   All category listing pages are handled by the dynamic route `src/app/categoria/[slug]/page.tsx`.
-   **Content as Data:** All articles are stored as `.md` files in `content/posts/`. The frontmatter of these files serves as the database for the articles.
-   **Styling:** Styling is done exclusively with Tailwind CSS. The `tailwind.config.ts` file contains the project's custom color palette and theme. Content from Markdown is styled using the `@tailwindcss/typography` plugin (the `prose` classes).
-   **Publishing Workflow:** The process of generating and publishing content involves both automation and manual review:
    1.  **Automated Generation:** The GitHub Action runs, generating new articles as Markdown files with `draft: true` in the frontmatter.
    2.  **Pull Request Creation:** The action creates a Pull Request containing the new draft articles.
    3.  **Manual Curation & Publishing:** A developer reviews the generated drafts. To publish an article, the developer must manually edit its Markdown file and change the frontmatter to `draft: false`.
    4.  **Deployment:** The developer commits the changes (setting `draft` to `false`) and merges the Pull Request into the `main` branch. This merge triggers an automatic production deployment on Vercel, making the new articles publicly visible.
-   **Code Formatting:** The project uses the default Next.js and Prettier configurations for code style.
