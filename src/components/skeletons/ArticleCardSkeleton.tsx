// File: src/components/skeletons/ArticleCardSkeleton.tsx
// Description: Skeleton loader for ArticleCard with shimmer animation - matches exact dimensions

export default function ArticleCardSkeleton() {
  return (
    <article className="group/card h-full" aria-busy="true" aria-label="Carregando artigo...">
      <div
        className="
          flex flex-col h-full
          bg-card rounded-2xl overflow-hidden
          shadow-elevation-1
        "
      >
        {/* Image Skeleton with Shimmer - aspect-[16/9] matches ArticleCard */}
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/5 via-card to-primary/10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/30 to-transparent animate-shimmer-skeleton" />

          {/* Category Badge Skeleton (top-4 left-4 matches ArticleCard) */}
          <div className="absolute top-4 left-4 z-10">
            <div className="
              w-24 h-7
              bg-primary/20 rounded-full
              animate-pulse-soft
            " />
          </div>

          {/* NEW/HOT Badge Skeleton (top-4 right-4 matches ArticleCard) */}
          <div className="absolute top-4 right-4 z-10">
            <div className="
              w-20 h-7
              bg-gradient-to-r from-gray-300/40 to-gray-400/40 dark:from-gray-600/40 dark:to-gray-700/40 rounded-full
              animate-pulse-soft
            " />
          </div>

          {/* Reading Time Badge Skeleton (below NEW/HOT) */}
          <div className="absolute top-16 right-4 z-10">
            <div className="
              w-16 h-6
              bg-background/30 backdrop-blur-sm rounded-full
              animate-pulse-soft
            " />
          </div>
        </div>

        {/* Content Section - matches p-6 sm:p-7 from ArticleCard */}
        <div className="flex flex-col flex-1 p-6 sm:p-7">
          {/* Title Skeleton - min-h-[3.5rem] matches ArticleCard */}
          <div className="mb-3 min-h-[3.5rem] space-y-2.5">
            <div className="h-7 bg-muted/20 rounded-lg w-full animate-pulse-soft" />
            <div className="h-7 bg-muted/20 rounded-lg w-4/5 animate-pulse-soft" />
          </div>

          {/* Description Skeleton - min-h-[3rem] matches ArticleCard */}
          <div className="mb-5 min-h-[3rem] flex-1 space-y-2">
            <div className="h-5 bg-muted/15 rounded-md w-full animate-pulse-soft" />
            <div className="h-5 bg-muted/15 rounded-md w-11/12 animate-pulse-soft" />
          </div>

          {/* Metadata Footer - matches pt-5 border-t from ArticleCard */}
          <div className="flex items-center justify-between pt-5 border-t border-border/50">
            {/* Date Skeleton */}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted/20 rounded animate-pulse-soft" />
              <div className="h-4 bg-muted/20 rounded w-24 animate-pulse-soft" />
            </div>

            {/* Read More CTA Skeleton */}
            <div className="h-4 bg-primary/20 rounded w-20 animate-pulse-soft" />
          </div>
        </div>
      </div>
    </article>
  );
}
