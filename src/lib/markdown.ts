import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'content', 'posts');

export interface ArticleMeta {
  slug: string;
  title: string;
  date: string;
  category: string;
  featured_image: string;
  description: string;
  contentHtml: string;
}

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
      
      const processedContent = remark().use(html).processSync(content);
      const contentHtml = processedContent.toString();

      return {
        slug,
        contentHtml,
        title: data.title || 'No Title',
        date: data.date || new Date().toISOString(),
        category: data.category || 'Uncategorized',
        featured_image: data.featured_image || '/placeholder.jpg',
        description: data.description || '',
      };
    });

  const sortedPosts = allPostsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  allPostsCache = sortedPosts;
  return sortedPosts;
}

export function getSortedArticlesData(): ArticleMeta[] {
  return fetchAllPosts();
}

export function getArticleBySlug(slug: string): ArticleMeta | null {
  return fetchAllPosts().find(p => p.slug === slug) || null;
}

export function getArticlesByCategory(categorySlug: string): ArticleMeta[] {
  return fetchAllPosts().filter(post => {
    if (!post.category) return false;
    const postCategorySlug = post.category.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
    return postCategorySlug === categorySlug;
  });
}
