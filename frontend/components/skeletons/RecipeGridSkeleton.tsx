import RecipeCardSkeleton from "./RecipeCardSkeleton";

export default function RecipeGridSkeleton({
  count = 8,
  className = "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </div>
  );
}
