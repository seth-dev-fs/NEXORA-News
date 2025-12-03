'use client';

const STORAGE_KEY = 'nexora_article_views';

/**
 * Interface for view tracking data
 */
export interface ViewData {
  [slug: string]: {
    count: number;
    lastViewed: string; // ISO timestamp
  };
}

/**
 * Retrieves all article view data from localStorage
 */
export function getArticleViews(): ViewData {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading view tracking data:', error);
    return {};
  }
}

/**
 * Tracks a view for a specific article
 * Increments view count and updates last viewed timestamp
 */
export function trackArticleView(slug: string): void {
  if (typeof window === 'undefined') return;

  try {
    const views = getArticleViews();
    const currentData = views[slug] || { count: 0, lastViewed: new Date().toISOString() };

    views[slug] = {
      count: currentData.count + 1,
      lastViewed: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
  } catch (error) {
    console.error('Error tracking article view:', error);
  }
}

/**
 * Gets the view count for a specific article
 */
export function getArticleViewCount(slug: string): number {
  const views = getArticleViews();
  return views[slug]?.count || 0;
}

/**
 * Gets trending articles based on view counts
 * Returns an array of slugs sorted by view count (descending)
 */
export function getTrendingSlugs(limit: number = 5): string[] {
  const views = getArticleViews();

  return Object.entries(views)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([slug]) => slug);
}

/**
 * Checks if an article was viewed recently (within last 7 days)
 */
export function wasViewedRecently(slug: string): boolean {
  const views = getArticleViews();
  const articleData = views[slug];

  if (!articleData) return false;

  const lastViewed = new Date(articleData.lastViewed);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return lastViewed > sevenDaysAgo;
}

/**
 * Clears all view tracking data (useful for testing or user privacy)
 */
export function clearViewData(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing view tracking data:', error);
  }
}
