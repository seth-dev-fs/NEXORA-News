// File: src/components/skeletons/SearchResultsSkeleton.tsx
// Description: Skeleton loader for search results - compact card format

export default function SearchResultsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Carregando resultados...">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="
            flex gap-4 p-4
            bg-card rounded-xl
            shadow-soft
            border border-border/30
          "
        >
          {/* Thumbnail Skeleton */}
          <div className="
            flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32
            bg-gradient-to-br from-primary/5 via-card to-primary/10
            rounded-lg
            animate-shimmer-skeleton
          " />

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Category Badge */}
            <div className="w-20 h-5 bg-primary/20 rounded-full animate-pulse-soft" />

            {/* Title */}
            <div className="space-y-2">
              <div className="h-5 bg-muted/20 rounded w-full animate-pulse-soft" />
              <div className="h-5 bg-muted/20 rounded w-3/4 animate-pulse-soft" />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="h-4 bg-muted/15 rounded w-full animate-pulse-soft" />
              <div className="h-4 bg-muted/15 rounded w-5/6 animate-pulse-soft" />
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3">
              <div className="h-3 w-20 bg-muted/20 rounded animate-pulse-soft" />
              <div className="w-1 h-1 rounded-full bg-muted/20" />
              <div className="h-3 w-16 bg-muted/20 rounded animate-pulse-soft" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
