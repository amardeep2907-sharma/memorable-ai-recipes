interface ListSkeletonProps {
  rows?: number;
}

export default function ListSkeleton({ rows = 3 }: ListSkeletonProps) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex gap-4 p-4 rounded-xl bg-gray-100 dark:bg-gray-800"
        >
          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-gray-300 dark:bg-gray-700" />
            <div className="h-3 w-full rounded bg-gray-300 dark:bg-gray-700" />
            <div className="h-3 w-2/3 rounded bg-gray-300 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
}
