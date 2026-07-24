import Skeleton from "./Skeleton";

// Generic avatar-circle + text-lines row, used anywhere a list of
// comments/reviews/feed items/notifications is loading.
export function ListRowSkeleton() {
  return (
    <div className="card flex items-center gap-3 p-4">
      <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export default function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <ListRowSkeleton key={i} />
      ))}
    </div>
  );
}
