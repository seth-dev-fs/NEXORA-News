export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-background">
      <div className="text-center">
        {/* Spinner */}
        <div className="inline-flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>

        {/* Loading Text */}
        <p className="mt-6 text-lg font-semibold text-muted animate-pulse">
          A carregar...
        </p>
      </div>
    </div>
  );
}
