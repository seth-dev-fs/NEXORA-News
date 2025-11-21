import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'content', 'posts');

// Define the structure of the article metadata
export interface ArticleMeta {
  slug: string;
  title: string;
  date: string;
  categories: string[];
  tags: string[];
  featured_image: string;
  meta_description: string;
  pontos_chave: string[];
  source_url: string;
  contentHtml: string;
}

// Helper function to safely process raw frontmatter data
function processFrontmatter(slug: string, data: { [key: string]: any }): Omit<ArticleMeta, 'contentHtml'> {
  return {
    slug: slug,
    title: data.title || 'Sem Título',
    date: data.date || new Date().toISOString(),
    categories: data.categories || [],
    tags: data.tags || [],
    featured_image: data.featured_image || '/placeholder.jpg', // Provide a default placeholder
    meta_description: data.meta_description || '',
    pontos_chave: data.pontos_chave || [],
    source_url: data.source_url || '',
  };
}

// Internal function to get all posts, reducing redundant file reads
let allPostsCache: ArticleMeta[] | null = null;

function fetchAllPosts(): ArticleMeta[] {
  if (allPostsCache) {
    return allPostsCache;
  }

  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);

  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      const { data, content } = matter(fileContents);
      const processedFrontmatter = processFrontmatter(slug, data);

      const processedContent = remark().use(html).process(content);
      const contentHtml = processedContent.toString();

      return {
        ...processedFrontmatter,
        contentHtml,
      };
    });

  const sortedPosts = allPostsData.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  allPostsCache = sortedPosts;
  return sortedPosts;
}


// --- EXPORTED FUNCTIONS ---

/**
 * Returns metadata for all articles, sorted by date descending.
 */
export function getSortedArticlesData(): ArticleMeta[] {
  return fetchAllPosts();
}

/**
 * Finds and returns the metadata for a single article by its slug.
 * Returns null if not found.
 */
export function getArticleBySlug(slug: string): ArticleMeta | null {
  const allPosts = fetchAllPosts();
  const article = allPosts.find(p => p.slug === slug);
  return article || null;
}

/**
 * Returns all articles that belong to a specific category.
 */
export function getArticlesByCategory(category: string): ArticleMeta[] {
  const allPosts = fetchAllPosts();
  const categorySlug = category.toLowerCase();
  
  return allPosts.filter(post => {
    // Safely check categories array
    if (!post.categories || !Array.isArray(post.categories)) {
      return false;
    }
    // Check if any of the post's categories match the requested category slug
    return post.categories.some(cat => cat.toLowerCase() === categorySlug);
  });
}