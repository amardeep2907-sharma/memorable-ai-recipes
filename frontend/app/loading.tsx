import Skeleton from "@/components/skeletons/Skeleton";
import RecipeGridSkeleton from "@/components/skeletons/RecipeGridSkeleton";

// Next.js shows this automatically while the home page's async server
// component (fetching trending/recent/top-rated/etc. rails) is in flight -
// e.g. navigating back to "/" from another page.
export default function HomeLoading() {
  return (
    <div>
      <section className="border-b border-line px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <Skeleton className="h-6 w-40 rounded-full" />
          <Skeleton className="mt-6 h-12 w-2/3 max-w-xl" />
          <Skeleton className="mt-3 h-12 w-1/2 max-w-md" />
          <Skeleton className="mt-6 h-4 w-full max-w-md" />
          <Skeleton className="mt-10 h-12 w-full max-w-xl rounded-full" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <Skeleton className="h-7 w-40" />
        <div className="mt-6">
          <RecipeGridSkeleton count={4} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" />
        </div>
      </section>
    </div>
  );
}
