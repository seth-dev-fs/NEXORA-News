import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'content/posts');

/**
 * Normalizes a category name to a consistent slug format.
 * Handles multiple variations of the same category.
 */
export function normalizeCategoryToSlug(category: string): string {
  if (!category) return 'home';

  // Convert to lowercase and trim
  const normalized = category.toLowerCase().trim();

  // Replace special characters and spaces with hyphens
  return normalized
    .replace(/\s*\/\s*/g, '-') // Replace " / " with "-"
    .replace(/\s*&\s*/g, '-')  // Replace " & " with "-"
    .replace(/\s+/g, '-')      // Replace spaces with "-"
    .replace(/[áàâã]/g, 'a')   // Remove accents
    .replace(/[éèê]/g, 'e')
    .replace(/[íì]/g, 'i')
    .replace(/[óòôõ]/g, 'o')
    .replace(/[úù]/g, 'u')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9-]/g, '') // Remove any remaining special chars
    .replace(/-+/g, '-')       // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');    // Remove leading/trailing hyphens
}

export function getAllArticles(): ArticleMeta[] {
  if (!fs.existsSync(postsDirectory)) {
    console.warn(`Posts directory not found: ${postsDirectory}`);
    return [];
  }

  let fileNames: string[];
  try {
    fileNames = fs.readdirSync(postsDirectory);
  } catch (error) {
    console.error(`Error reading posts directory: ${error}`);
    return [];
  }

  const allArticlesData: ArticleMeta[] = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      try {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(postsDirectory, fileName);

        let fileContents: string;
        try {
          fileContents = fs.readFileSync(fullPath, 'utf8');
        } catch (error) {
          console.error(`Error reading file ${fileName}: ${error}`);
          return null;
        }

        // Strip HTML comments before frontmatter to ensure gray-matter can parse correctly
        // Article generator adds <!-- generated_by: ... --> before frontmatter
        fileContents = fileContents.replace(/^<!--[\s\S]*?-->\n/, '');

        let data: any;
        let content: string;
        try {
          const parsed = matter(fileContents);
          data = parsed.data;
          content = parsed.content;
        } catch (error) {
          console.error(`Error parsing frontmatter in ${fileName}: ${error}`);
          return null;
        }

        let processedContent: string;
        try {
          const result = remark().use(html).processSync(content);
          processedContent = result.toString();
        } catch (error) {
          console.error(`Error processing markdown in ${fileName}: ${error}`);
          processedContent = content; // Fallback to raw content
        }

        // Fallback for date, use file mtime
        let articleDate = new Date().toISOString();
        if (data.date) {
          try {
            const parsedDate = new Date(data.date);
            if (!isNaN(parsedDate.getTime())) {
              articleDate = parsedDate.toISOString();
            } else {
              console.warn(`Invalid date in ${fileName}: ${data.date}. Using file mtime.`);
              articleDate = new Date(fs.statSync(fullPath).mtime).toISOString();
            }
          } catch (e) {
            console.warn(`Error parsing date in ${fileName}: ${data.date}. Using file mtime.`);
            articleDate = new Date(fs.statSync(fullPath).mtime).toISOString();
          }
        } else {
          try {
            articleDate = new Date(fs.statSync(fullPath).mtime).toISOString();
          } catch (error) {
            console.warn(`Error getting file stats for ${fileName}. Using current time.`);
          }
        }

        // Normalize the category to slug format for consistency
        const categorySlug = normalizeCategoryToSlug(data.category || 'home');

        return {
          slug,
          contentHtml: processedContent,
          title: data.title || 'Sem Título',
          date: articleDate,
          category: categorySlug,
          tags: Array.isArray(data.tags) ? data.tags : [],
          image: data.image || null,
          image_source: data.image_source || data.image || '',
          description: data.description || '',
          source_url: data.source_url || '',
          needs_review: data.needs_review === true,
          draft: data.draft === true,
        };
      } catch (error) {
        console.error(`Unexpected error processing ${fileName}: ${error}`);
        return null;
      }
    })
    .filter((article): article is ArticleMeta => article !== null);

  return allArticlesData;
}

export interface ArticleMeta {
  slug: string;
  title: string;
  date: string; // ISO string
  category: string;
  tags: string[];
  image: string | null;
  image_source: string;
  description: string;
  source_url: string;
  needs_review: boolean;
  draft: boolean;
  contentHtml: string;
}

  
/**
 * Returns all articles, sorted by date descending.
 * Optionally filters by published status and applies a limit.
 */
export function getArticlesSortedByDate(limit?: number): ArticleMeta[] {
  const allArticles = getAllArticles()
    .filter(article => !article.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return limit ? allArticles.slice(0, limit) : allArticles;
}

/**
 * Finds and returns the metadata for a single article by its slug.
 * Excludes drafts.
 */
export function getArticleBySlug(slug: string): ArticleMeta | null {
  return getAllArticles().filter(article => !article.draft).find(p => p.slug === slug) || null;
}

/**
 * Returns all PUBLISHED articles that belong to a specific category.
 * Optionally applies a limit.
 */
export function getArticlesByCategory(categorySlug: string, limit?: number): ArticleMeta[] {
  // Normalize the input category slug for comparison
  const normalizedInputSlug = normalizeCategoryToSlug(categorySlug);

  const articlesInCategory = getAllArticles()
    .filter(article => !article.draft && article.category === normalizedInputSlug)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return limit ? articlesInCategory.slice(0, limit) : articlesInCategory;
}

/**
 * Returns all unique category slugs from published articles.
 */
export function getAllCategories(): string[] {
  const allArticles = getAllArticles().filter(article => !article.draft);
  const categorySet = new Set<string>();

  allArticles.forEach(article => {
    if (article.category) {
      categorySet.add(article.category);
    }
  });

  return Array.from(categorySet).sort();
}
