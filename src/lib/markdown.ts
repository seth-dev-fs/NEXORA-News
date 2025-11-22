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
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);

  const allArticlesData: ArticleMeta[] = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      const { data, content } = matter(fileContents);

      const processedContent = remark().use(html).processSync(content);

      // Fallback for date, use file mtime
      let articleDate = new Date().toISOString();
      if (data.date) {
        try {
          articleDate = new Date(data.date).toISOString();
        } catch (e) {
          console.warn(`Invalid date in ${fileName}: ${data.date}. Using file mtime.`);
          articleDate = new Date(fs.statSync(fullPath).mtime).toISOString();
        }
      } else {
        articleDate = new Date(fs.statSync(fullPath).mtime).toISOString();
      }

      // Normalize the category to slug format for consistency
      const categorySlug = normalizeCategoryToSlug(data.category || 'home');

      return {
        slug,
        contentHtml: processedContent.toString(),
        title: data.title || 'No Title',
        date: articleDate,
        category: categorySlug, // Store normalized category slug
        tags: Array.isArray(data.tags) ? data.tags : [],
        image: data.image || null,
        image_source: data.image_source || data.image || '',
        description: data.description || '',
        source_url: data.source_url || '',
        needs_review: data.needs_review === true,
        draft: data.draft === true,
      };
    });

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
