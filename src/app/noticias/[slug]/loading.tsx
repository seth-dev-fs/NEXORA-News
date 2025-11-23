export default function ArticleLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Skeleton */}
      <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden mb-8 sm:mb-12 bg-gradient-to-br from-card to-background animate-pulse" />

      {/* Content Skeleton */}
      <article className="container mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
        <div className="max-w-4xl mx-auto -mt-24 sm:-mt-32 relative z-10">
          {/* Header Skeleton */}
          <div className="bg-background/95 backdrop-blur-sm p-6 sm:p-8 lg:p-10 rounded-2xl shadow-2xl mb-8 sm:mb-12 animate-pulse">
            {/* Category Badge Skeleton */}
            <div className="mb-4 sm:mb-6">
              <div className="inline-block h-7 w-24 bg-card rounded-full" />
            </div>

            {/* Title Skeleton */}
            <div className="space-y-3 mb-6">
              <div className="h-8 bg-card rounded w-full" />
              <div className="h-8 bg-card rounded w-5/6" />
            </div>

            {/* Description Skeleton */}
            <div className="space-y-2 mb-8">
              <div className="h-5 bg-card rounded w-full" />
              <div className="h-5 bg-card rounded w-4/5" />
            </div>

            {/* Metadata Skeleton */}
            <div className="flex items-center gap-4 pt-6 border-t border-border">
              <div className="h-4 bg-card rounded w-32" />
              <div className="w-1 h-1 rounded-full bg-card" />
              <div className="h-4 bg-card rounded w-24" />
            </div>
          </div>

          {/* Body Content Skeleton */}
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-card rounded w-full" />
            <div className="h-4 bg-card rounded w-full" />
            <div className="h-4 bg-card rounded w-11/12" />
            <div className="h-4 bg-card rounded w-full" />
            <div className="h-4 bg-card rounded w-5/6" />

            <div className="py-6" />

            <div className="h-4 bg-card rounded w-full" />
            <div className="h-4 bg-card rounded w-full" />
            <div className="h-4 bg-card rounded w-3/4" />
          </div>
        </div>
      </article>
    </div>
  );
}
