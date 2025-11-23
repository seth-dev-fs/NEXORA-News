export default function CategoryLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Title Skeleton */}
      <div className="mb-8 animate-pulse">
        <div className="h-10 bg-card rounded w-64" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl shadow-md overflow-hidden animate-pulse">
            {/* Image Skeleton */}
            <div className="relative w-full h-52 sm:h-56 bg-gradient-to-br from-primary/5 to-primary/10" />

            {/* Content Skeleton */}
            <div className="p-5 sm:p-6 space-y-4">
              {/* Title Skeleton */}
              <div className="space-y-2">
                <div className="h-5 bg-background rounded w-full" />
                <div className="h-5 bg-background rounded w-4/5" />
              </div>

              {/* Description Skeleton */}
              <div className="space-y-2">
                <div className="h-4 bg-background rounded w-full" />
                <div className="h-4 bg-background rounded w-3/4" />
              </div>

              {/* Footer Skeleton */}
              <div className="pt-4 border-t border-border flex justify-between">
                <div className="h-4 bg-background rounded w-24" />
                <div className="h-4 bg-background rounded w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
