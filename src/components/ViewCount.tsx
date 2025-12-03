'use client';

import { useEffect, useState } from 'react';
import { getArticleViewCount } from '@/lib/viewTracking';

interface ViewCountProps {
  slug: string;
  className?: string;
  showIcon?: boolean;
}

/**
 * Client-side component that displays the view count for an article
 * Reads data from localStorage via viewTracking utility
 */
export default function ViewCount({ slug, className = '', showIcon = true }: ViewCountProps) {
  const [viewCount, setViewCount] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Get initial view count
    const updateViewCount = () => {
      setViewCount(getArticleViewCount(slug));
    };

    updateViewCount();

    // Listen for storage changes (if user opens multiple tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'nexora_article_views') {
        updateViewCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [slug]);

  // Don't render during SSR to avoid hydration mismatch
  if (!isMounted) {
    return null;
  }

  // Don't show if no views yet (optional - cleaner UI)
  if (viewCount === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`} title={`${viewCount} visualização${viewCount !== 1 ? 'ões' : ''}`}>
      {showIcon && (
        <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
      <span className="text-xs sm:text-sm font-medium">
        {viewCount} {viewCount === 1 ? 'visualização' : 'visualizações'}
      </span>
    </div>
  );
}
