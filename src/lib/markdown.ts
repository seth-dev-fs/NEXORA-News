import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export interface ArticleMeta {
  slug: string;
  title: string;
  date: string;
  category: string;
  description: string;
  image: string | null; // Image can be null
  draft: boolean;
  contentHtml: string;
}

let allPostsCache: ArticleMeta[] | null = null;

function fetchAllPosts(includeDrafts: boolean = false): ArticleMeta[] {
  // Return from cache if available and drafts status matches
  if (allPostsCache && !includeDrafts) {
    return allPostsCache;
  }

  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);

  const allPostsData: ArticleMeta[] = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      
      const { data, content } = matter(fileContents);
      
      const processedContent = remark().use(html).processSync(content);

      return {
        slug,
        contentHtml: processedContent.toString(),
        title: data.title || 'No Title',
        date: data.date || new Date().toISOString(),
        category: data.category || 'home',
        description: data.description || '',
        image: data.image || null,
        draft: data.draft === true, // Explicitly check for true
      };
    });

  const sortedPosts = allPostsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (!includeDrafts) {
    const publishedPosts = sortedPosts.filter(p => !p.draft);
    allPostsCache = publishedPosts; // Cache only published posts
    return publishedPosts;
  }

  return sortedPosts; // Return all posts including drafts
}

/**
 * Returns metadata for all PUBLISHED articles, sorted by date descending.
 */
export function getSortedArticlesData(): ArticleMeta[] {
  return fetchAllPosts(false);
}

/**
 * Returns metadata for ALL articles including drafts.
 * Intended for admin/dev use.
 */
export function getAllArticlesIncludingDrafts(): ArticleMeta[] {
    return fetchAllPosts(true);
}

/**
 * Finds and returns the metadata for a single article by its slug.
 * Will find drafts as well.
 */
export function getArticleBySlug(slug: string): ArticleMeta | null {
  return fetchAllPosts(true).find(p => p.slug === slug) || null;
}

/**
 * Returns all PUBLISHED articles that belong to a specific category.
 */
export function getArticlesByCategory(categorySlug: string): ArticleMeta[] {
  if (categorySlug === 'home') {
    return [];
  }
  return fetchAllPosts(false).filter(post => post.category.toLowerCase() === categorySlug.toLowerCase());
}
