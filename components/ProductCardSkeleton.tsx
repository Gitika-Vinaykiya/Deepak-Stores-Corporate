export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-surface-200 overflow-hidden animate-pulse">
      <div className="aspect-square bg-surface-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-surface-200 rounded w-3/4" />
        <div className="h-3 bg-surface-200 rounded w-1/2" />
        <div className="h-3 bg-surface-200 rounded w-1/3" />
        <div className="h-3 bg-surface-200 rounded w-1/4" />
      </div>
      <div className="px-4 pb-4">
        <div className="h-10 bg-surface-200 rounded-xl" />
      </div>
    </div>
  );
}
