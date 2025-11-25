import { NextResponse } from 'next/server';
import { getArticlesSortedByDate } from '@/lib/markdown';

// Cache for 1 hour
export const revalidate = 3600;

export async function GET() {
  try {
    const articles = getArticlesSortedByDate();

    // Return only necessary fields for search to reduce payload size
    const searchData = articles.map(article => ({
      slug: article.slug,
      title: article.title,
      description: article.description,
      category: article.category,
      tags: article.tags,
      date: article.date,
    }));

    return NextResponse.json(searchData, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}
