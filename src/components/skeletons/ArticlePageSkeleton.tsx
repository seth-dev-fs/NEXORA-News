// File: src/components/skeletons/ArticlePageSkeleton.tsx
// Description: Skeleton loader for article page with hero image and content - matches exact layout

export default function ArticlePageSkeleton() {
  return (
    <div className="min-h-screen bg-background" aria-busy="true" aria-label="Carregando artigo...">
      {/* Hero Image Skeleton - matches h-[400px] sm:h-[500px] lg:h-[600px] */}
      <div className="relative w-full mb-12 sm:mb-16 lg:mb-20">
        <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-card to-primary/5 animate-shimmer-skeleton" />

          {/* Gradient Overlay - matches article page */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-transparent" />

          {/* Unsplash Attribution Skeleton */}
          <div className="absolute top-4 right-4 z-20">
            <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg">
              <div className="h-3 w-32 bg-white/20 rounded animate-pulse-soft" />
            </div>
          </div>
        </div>
      </div>

      {/* Article Content - matches container structure */}
      <article className="container mx-auto px-4 sm:px-6 pb-20 sm:pb-24 lg:pb-28">
        <div className="max-w-4xl mx-auto -mt-32 sm:-mt-40 lg:-mt-48 relative z-10">
          {/* Article Header - matches premium card with backdrop */}
          <header className="
            bg-background/98 dark:bg-background/95 backdrop-blur-xl
            p-8 sm:p-10 lg:p-12 rounded-3xl shadow-elevation-4
            mb-12 sm:mb-16
            animate-fade-in-up
          ">
            {/* Category Badge Skeleton */}
            <div className="mb-5 sm:mb-6">
              <div className="
                inline-flex items-center gap-2
                px-4 py-2 h-8
                bg-primary/10 rounded-full border-2 border-primary/20
                w-32
                animate-pulse-soft
              " />
            </div>

            {/* Title Skeleton - matches premium typography */}
            <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
              <div className="h-10 sm:h-12 lg:h-14 xl:h-16 bg-muted/20 rounded-xl w-full animate-pulse-soft" />
              <div className="h-10 sm:h-12 lg:h-14 xl:h-16 bg-muted/20 rounded-xl w-11/12 animate-pulse-soft" />
              <div className="h-10 sm:h-12 lg:h-14 xl:h-16 bg-muted/20 rounded-xl w-4/5 animate-pulse-soft" />
            </div>

            {/* Description Skeleton */}
            <div className="mb-8 sm:mb-10 space-y-3">
              <div className="h-7 sm:h-8 lg:h-9 bg-muted/15 rounded-lg w-full animate-pulse-soft" />
              <div className="h-7 sm:h-8 lg:h-9 bg-muted/15 rounded-lg w-11/12 animate-pulse-soft" />
              <div className="h-7 sm:h-8 lg:h-9 bg-muted/15 rounded-lg w-9/12 animate-pulse-soft" />
            </div>

            {/* Metadata Skeleton - matches border-t-2 design */}
            <div className="
              flex flex-wrap items-center gap-4 sm:gap-6
              pt-6 sm:pt-8
              border-t-2 border-border/30
            ">
              {/* Date Skeleton */}
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 bg-primary/20 rounded animate-pulse-soft" />
                <div className="h-4 w-28 bg-muted/20 rounded animate-pulse-soft" />
              </div>

              {/* Separator Dot */}
              <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />

              {/* Reading Time Skeleton */}
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 bg-primary/20 rounded animate-pulse-soft" />
                <div className="h-4 w-24 bg-muted/20 rounded animate-pulse-soft" />
              </div>
            </div>
          </header>

          {/* Article Body Skeleton */}
          <div className="animate-fade-in space-y-6 sm:space-y-8">
            {/* Paragraphs */}
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 bg-muted/10 rounded w-full animate-pulse-soft" />
                <div className="h-6 bg-muted/10 rounded w-full animate-pulse-soft" />
                <div className="h-6 bg-muted/10 rounded w-11/12 animate-pulse-soft" />
                <div className="h-6 bg-muted/10 rounded w-full animate-pulse-soft" />
                <div className="h-6 bg-muted/10 rounded w-10/12 animate-pulse-soft" />
              </div>
            ))}

            {/* Image Placeholder in Content */}
            <div className="my-10 w-full h-80 sm:h-96 bg-gradient-to-br from-primary/5 via-card to-primary/10 rounded-2xl shadow-elevation-3 animate-shimmer-skeleton" />

            {/* More Paragraphs */}
            {[...Array(4)].map((_, i) => (
              <div key={`p2-${i}`} className="space-y-3">
                <div className="h-6 bg-muted/10 rounded w-full animate-pulse-soft" />
                <div className="h-6 bg-muted/10 rounded w-full animate-pulse-soft" />
                <div className="h-6 bg-muted/10 rounded w-9/12 animate-pulse-soft" />
              </div>
            ))}
          </div>

          {/* Article Footer Skeleton */}
          <footer className="mt-16 sm:mt-20 pt-10 sm:pt-12 border-t-2 border-border/30 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8">
              {/* Back Button Skeleton */}
              <div className="h-12 w-52 bg-primary/10 rounded-full animate-pulse-soft" />

              {/* Share Buttons Skeleton */}
              <div className="flex items-center gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-11 h-11 bg-muted/20 rounded-full animate-pulse-soft" />
                ))}
              </div>
            </div>
          </footer>

          {/* Related Articles Section Skeleton */}
          <div className="mt-16 sm:mt-20">
            <div className="mb-8">
              <div className="h-8 w-64 bg-muted/20 rounded-lg animate-pulse-soft" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-96 bg-card rounded-2xl shadow-elevation-1 animate-pulse-soft" />
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
