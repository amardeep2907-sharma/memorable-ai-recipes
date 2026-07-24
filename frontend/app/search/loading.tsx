import RecipeGridSkeleton from "@/components/skeletons/RecipeGridSkeleton";

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <RecipeGridSkeleton count={8} />
    </div>
  );
}
