"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  Clock, 
  Flame, 
  Users, 
  Heart, 
  Bookmark, 
  Pencil, 
  ChefHat, 
  Share2, 
  Sparkles, 
  Check, 
  Star,
  UtensilsCrossed,
  Info
} from "lucide-react";
import { recipeApi } from "@/lib/api";
import { RecipeDetailResult } from "@/types/recipe";
import { formatMinutes } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import CommentSection from "@/components/CommentSection";
import ReviewSection from "@/components/ReviewSection";
import ReportButton from "@/components/ReportButton";
import RecipeDetailSkeleton from "@/components/skeletons/RecipeDetailSkeleton";
import { useLocale } from "@/context/LocaleContext";

export default function RecipeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const { t } = useLocale();

  const { data, isLoading } = useQuery<RecipeDetailResult>({
    queryKey: ["recipe", params.id],
    queryFn: () => recipeApi.getById(params.id),
  });

  const [pending, setPending] = useState<"like" | "save" | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});

  async function handleToggle(action: "like" | "save") {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!data) return;

    const previous = data;
    const wasActive = action === "like" ? data.viewerState.liked : data.viewerState.saved;
    const countKey = action === "like" ? "likesCount" : "savesCount";
    const stateKey = action === "like" ? "liked" : "saved";

    queryClient.setQueryData<RecipeDetailResult>(["recipe", params.id], {
      ...data,
      data: { ...data.data, [countKey]: data.data[countKey] + (wasActive ? -1 : 1) },
      viewerState: { ...data.viewerState, [stateKey]: !wasActive },
    });

    setPending(action);
    try {
      await (action === "like" ? recipeApi.like(params.id) : recipeApi.save(params.id));
    } catch {
      queryClient.setQueryData(["recipe", params.id], previous);
    } finally {
      setPending(null);
    }
  }

  const toggleIngredientCheck = (index: number) => {
    setCheckedIngredients((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (isLoading) return <RecipeDetailSkeleton />;
  if (!data?.data) return <div className="mx-auto max-w-7xl px-4 py-16 text-sm text-ink/50">Recipe not found.</div>;

  const recipe = data.data;
  const { viewerState } = data;
  const allImages = [recipe.imageUrl, ...(recipe.images ?? [])].filter(Boolean);
  const totalTime = (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);

  return (
    <article className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Editorial Page Header */}
      <div className="relative overflow-hidden rounded-3xl border border-line/60 bg-gradient-to-b from-plum/10 via-paper to-paper p-6 shadow-xl sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-plum/10 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-plum/20 bg-plum/10 px-3.5 py-1 font-mono text-xs font-semibold text-plum">
              <ChefHat className="h-3.5 w-3.5" />
              {recipe.cuisine.join(" · ") || "Gourmet Dish"}
            </span>

            {recipe.diets?.[0] && (
              <span className="rounded-full border border-line bg-paper/80 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-ink/70">
                {recipe.diets[0]}
              </span>
            )}
          </div>

          <h1 className="font-display text-3xl font-semibold italic leading-tight text-ink sm:text-5xl lg:text-6xl max-w-4xl">
            {recipe.title}
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink/70 sm:text-base">
            {recipe.description}
          </p>

          {/* Author Badge & Rating Row */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line/60 pt-4">
            {recipe.author ? (
              <Link
                href={`/users/${recipe.author._id}`}
                className="group flex items-center gap-3 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-plum font-display text-sm italic font-bold text-white shadow-md">
                  {recipe.author.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-medium text-ink/50">Created by</p>
                  <p className="text-sm font-semibold text-ink group-hover:text-plum">{recipe.author.name}</p>
                </div>
              </Link>
            ) : <div />}

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-2">
              {totalTime > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3.5 py-1.5 font-mono text-xs font-medium text-ink shadow-sm">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  {formatMinutes(totalTime)}
                </span>
              )}
              {recipe.nutrition?.calories && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3.5 py-1.5 font-mono text-xs font-medium text-ink shadow-sm">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  {recipe.nutrition.calories} kcal
                </span>
              )}
              {recipe.servings && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3.5 py-1.5 font-mono text-xs font-medium text-ink shadow-sm">
                  <Users className="h-3.5 w-3.5 text-blue-500" />
                  Serves {recipe.servings}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout Grid */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Left Column: Gallery, Video, Actions, Steps, Reviews (8 Cols) */}
        <div className="space-y-8 lg:col-span-8">
          
          {/* Media Showcase Section */}
          {allImages.length > 0 && (
            <div className="overflow-hidden rounded-3xl border border-line/60 bg-paper p-3 shadow-sm">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-line/40">
                <Image
                  src={allImages[selectedImage]}
                  alt={recipe.title}
                  fill
                  priority
                  className="object-cover transition-all duration-500"
                />
              </div>

              {/* Thumbnails Row */}
              {allImages.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                  {allImages.map((src, i) => (
                    <button
                      key={src + i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                        i === selectedImage ? "border-plum scale-105 shadow-sm" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                      aria-label={`View photo ${i + 1}`}
                    >
                      <Image src={src} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Video Section */}
          {recipe.videoUrl && (
            <div className="overflow-hidden rounded-3xl border border-line/60 bg-paper p-3 shadow-sm">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video src={recipe.videoUrl} controls className="aspect-video w-full rounded-2xl" />
            </div>
          )}

          {/* Primary Action Buttons */}
          {recipe.source === "user" ? (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line/60 bg-paper/80 p-4 shadow-sm backdrop-blur-md">
              <button
                onClick={() => handleToggle("like")}
                disabled={pending === "like"}
                className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold transition-all ${
                  viewerState.liked
                    ? "border-plum bg-plum text-white shadow-md"
                    : "border-line bg-paper text-ink hover:bg-ink/5"
                }`}
              >
                <Heart className={`h-4 w-4 ${viewerState.liked ? "fill-white" : ""}`} />
                <span>{recipe.likesCount} {recipe.likesCount === 1 ? t("recipeDetail.like") : t("recipeDetail.likes")}</span>
              </button>

              <button
                onClick={() => handleToggle("save")}
                disabled={pending === "save"}
                className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold transition-all ${
                  viewerState.saved
                    ? "border-plum bg-plum text-white shadow-md"
                    : "border-line bg-paper text-ink hover:bg-ink/5"
                }`}
              >
                <Bookmark className={`h-4 w-4 ${viewerState.saved ? "fill-white" : ""}`} />
                <span>{viewerState.saved ? t("recipeDetail.saved") : t("recipeDetail.save")}</span>
              </button>

              {user?._id === recipe.author?._id && (
                <Link
                  href={`/recipes/${recipe._id}/edit`}
                  className="flex items-center gap-1.5 rounded-full border border-line bg-paper px-4 py-2.5 text-xs font-semibold text-ink transition-all hover:bg-ink/5"
                >
                  <Pencil className="h-3.5 w-3.5 text-plum" /> {t("recipeDetail.edit")}
                </Link>
              )}

              <ReportButton targetType="recipe" targetId={recipe._id} className="ml-auto" />
            </div>
          ) : (
            <p className="rounded-2xl border border-line/60 bg-paper/60 p-4 font-mono text-xs text-ink/60">
              {t("recipeDetail.externalNotice")}
            </p>
          )}

          {/* Step-By-Step Cooking Directions */}
          <section className="rounded-3xl border border-line/60 bg-paper p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-2 border-b border-line/60 pb-4">
              <UtensilsCrossed className="h-5 w-5 text-plum" />
              <h2 className="font-display text-2xl font-semibold italic text-ink">
                {t("recipeDetail.steps")}
              </h2>
            </div>

            <ol className="mt-6 space-y-6">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-4 group">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-plum/10 font-mono text-xs font-bold text-plum transition-colors group-hover:bg-plum group-hover:text-white">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="pt-1">
                    <p className="text-sm leading-relaxed text-ink/80 sm:text-base">{step}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Social Reviews & Comments */}
          {recipe.source === "user" && (
            <div className="space-y-8">
              <ReviewSection
                recipeId={recipe._id}
                averageRating={recipe.averageRating}
                ratingsCount={recipe.ratingsCount}
                myRating={viewerState.myRating}
              />
              <CommentSection recipeId={recipe._id} />
            </div>
          )}
        </div>

        {/* Right Column: Sticky Ingredients & Nutrition Sidebar (4 Cols) */}
        <aside className="lg:col-span-4">
          <div className="sticky top-20 space-y-6">
            
            {/* Ingredients Checklist Card */}
            <div className="rounded-3xl border border-line/60 bg-paper/90 p-6 shadow-sm backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-line/60 pb-4">
                <h2 className="font-display text-xl font-semibold italic text-ink">
                  {t("recipeDetail.ingredients")}
                </h2>
                <span className="font-mono text-xs font-bold text-plum bg-plum/10 px-2.5 py-0.5 rounded-full">
                  {recipe.ingredients.length} items
                </span>
              </div>

              <ul className="mt-4 space-y-2.5">
                {recipe.ingredients.map((ing, i) => {
                  const isChecked = !!checkedIngredients[i];
                  return (
                    <li
                      key={i}
                      onClick={() => toggleIngredientCheck(i)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl p-2.5 text-xs transition-all ${
                        isChecked ? "bg-plum/5 text-ink/40 line-through" : "hover:bg-ink/5 text-ink"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
                            isChecked ? "border-plum bg-plum text-white" : "border-line bg-paper"
                          }`}
                        >
                          {isChecked && <Check className="h-3 w-3" />}
                        </div>
                        <span className="font-medium sm:text-sm">{ing.name}</span>
                      </div>
                      <span className="font-mono text-ink/60">
                        {ing.quantity} {ing.unit}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Nutrition Information Card */}
            {recipe.nutrition && (
              <div className="rounded-3xl border border-line/60 bg-paper/80 p-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-line/60 pb-3">
                  <Info className="h-4 w-4 text-plum" />
                  <h3 className="font-display text-lg font-semibold italic text-ink">Nutritional Values</h3>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                  {recipe.nutrition.calories !== undefined && (
                    <div className="rounded-2xl border border-line/60 bg-ink/5 p-3">
                      <span className="font-mono text-xs text-ink/50 uppercase">Calories</span>
                      <p className="font-mono text-lg font-bold text-ink mt-0.5">{recipe.nutrition.calories} <span className="text-xs font-normal">kcal</span></p>
                    </div>
                  )}
                  {recipe.nutrition.protein !== undefined && (
                    <div className="rounded-2xl border border-line/60 bg-ink/5 p-3">
                      <span className="font-mono text-xs text-ink/50 uppercase">Protein</span>
                      <p className="font-mono text-lg font-bold text-ink mt-0.5">{recipe.nutrition.protein} <span className="text-xs font-normal">g</span></p>
                    </div>
                  )}
                  {recipe.nutrition.carbs !== undefined && (
                    <div className="rounded-2xl border border-line/60 bg-ink/5 p-3">
                      <span className="font-mono text-xs text-ink/50 uppercase">Carbs</span>
                      <p className="font-mono text-lg font-bold text-ink mt-0.5">{recipe.nutrition.carbs} <span className="text-xs font-normal">g</span></p>
                    </div>
                  )}
                  {recipe.nutrition.fat !== undefined && (
                    <div className="rounded-2xl border border-line/60 bg-ink/5 p-3">
                      <span className="font-mono text-xs text-ink/50 uppercase">Fat</span>
                      <p className="font-mono text-lg font-bold text-ink mt-0.5">{recipe.nutrition.fat} <span className="text-xs font-normal">g</span></p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </aside>

      </div>
    </article>
  );
}