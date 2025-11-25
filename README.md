# NEXORA News

NEXORA News is a modern, automated news website built with Next.js and deployed on Vercel. It leverages the power of the Google Gemini API to generate engaging technology news articles by pulling and reimagining content from a curated list of high-quality RSS feeds.

## ✨ Features

- **Automated Content Pipeline:** A GitHub Action runs on a schedule to fetch new content from top tech news sources, uses the Gemini API to generate fresh articles, and creates a Pull Request for review.
- **Dynamic Image Sourcing:** The system automatically finds the best image for an article, looking first in the RSS feed, then searching Unsplash for a relevant photo, and finally using a placeholder if needed.
- **Robust Tech Stack:** Built with Next.js 14+, React, and TypeScript for a fast, modern, and type-safe web experience.
- **Beautifully Styled:** Styled with Tailwind CSS, including a custom theme and the `@tailwindcss/typography` plugin for clean, readable article content.
- **Static & Fast:** Generates fully static pages for articles and categories, ensuring top performance and SEO.

## 🚀 Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

-   Node.js (version 20.9.0 or higher)
-   npm (or your preferred package manager)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/seth-dev-fs/NEXORA-News.git
    cd NEXORA-News
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    The article generation script requires an API key from Google Gemini. Create a `.env.local` file in the root of the project and add your key:
    ```
    GEMINI_API_KEY="your_google_gemini_api_key"
    ```
    For the image search feature, you also need an Unsplash API key:
    ```
    UNSPLASH_API_KEY="your_unsplash_access_key"
    ```

    For optional Google Analytics tracking:
    ```
    NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
    ```

### Running the Project

-   **To run the development server:**
    ```sh
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

-   **To run a production build locally:**
    ```sh
    npm run build
    npm run start
    ```

## ⚙️ How It Works: The Content Pipeline

This project is not a standard blog; its primary feature is its automated content generation.

1.  **Trigger:** A GitHub Action defined in `.github/workflows/generate.yml` runs every 2 hours.
2.  **Generate:** It executes the `scripts/generate-articles.js` script, which fetches new items from RSS feeds.
3.  **AI Content:** For each new item, it prompts the Gemini API to write a new, detailed article in Portuguese.
4.  **Create PR:** The action then bundles all new articles and creates a Pull Request on GitHub.
5.  **Review & Merge:** A human user reviews the generated articles and merges the Pull Request into the `main` branch.
6.  **Deploy:** Merging into `main` automatically triggers a new deployment on Vercel, publishing the articles to the live site.

To manually generate articles on your local machine for testing, you can run:
```sh
npm run generate-articles
```
*(This will create `.md` files in the `content/posts` directory.)*
