'use client';

import { useEffect } from 'react';
import { trackArticleView } from '@/lib/viewTracking';

interface ArticleViewTrackerProps {
  slug: string;
}

/**
 * Client-side component that tracks article views
 * Should be used once per article page
 */
export default function ArticleViewTracker({ slug }: ArticleViewTrackerProps) {
  useEffect(() => {
    // Track view after a small delay to ensure it's a real read
    // (not just someone quickly clicking through)
    const timer = setTimeout(() => {
      trackArticleView(slug);
    }, 3000); // 3 seconds delay

    return () => {
      clearTimeout(timer);
    };
  }, [slug]);

  // This component doesn't render anything
  return null;
}
