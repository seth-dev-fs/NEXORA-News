// File: src/app/categoria/[slug]/loading.tsx
// Description: Category page loading state with skeleton cards

import ArticleCardSkeleton from '@/components/skeletons/ArticleCardSkeleton';

export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        {/* Category Header Skeleton */}
        <div className="mb-10 sm:mb-12 space-y-4">
          {/* Category Title */}
          <div className="h-12 sm:h-14 bg-muted/20 rounded-xl w-72 animate-pulse-soft" />

          {/* Category Description */}
          <div className="space-y-2">
            <div className="h-5 bg-muted/15 rounded-lg w-full max-w-2xl animate-pulse-soft" />
            <div className="h-5 bg-muted/15 rounded-lg w-3/4 max-w-xl animate-pulse-soft" />
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[...Array(9)].map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
