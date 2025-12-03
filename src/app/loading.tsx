// File: src/app/loading.tsx
// Description: Homepage loading state with skeleton cards for perceived performance

import ArticleCardSkeleton from '@/components/skeletons/ArticleCardSkeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        {/* Featured Article Skeleton */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <div className="relative w-full h-[500px] sm:h-[600px] lg:h-[700px] overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-card to-primary/5">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/30 to-transparent animate-shimmer-skeleton" />

            {/* Content overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-10 lg:p-12 bg-gradient-to-t from-background via-background/95 to-transparent">
              <div className="max-w-4xl space-y-4">
                <div className="w-28 h-7 bg-primary/20 rounded-full animate-pulse-soft" />
                <div className="space-y-3">
                  <div className="h-10 sm:h-12 lg:h-14 bg-muted/30 rounded-xl w-full animate-pulse-soft" />
                  <div className="h-10 sm:h-12 lg:h-14 bg-muted/30 rounded-xl w-3/4 animate-pulse-soft" />
                </div>
                <div className="space-y-2">
                  <div className="h-6 bg-muted/20 rounded-lg w-full animate-pulse-soft" />
                  <div className="h-6 bg-muted/20 rounded-lg w-5/6 animate-pulse-soft" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Articles Grid */}
        <div className="mb-12 sm:mb-16">
          <div className="h-10 w-64 bg-muted/20 rounded-lg mb-8 animate-pulse-soft" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[...Array(9)].map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
