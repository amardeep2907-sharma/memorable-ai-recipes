"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Flame, Heart, Star, Bookmark } from "lucide-react";
import { Recipe } from "@/types/recipe";
import { formatMinutes } from "@/lib/utils";

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const totalTime = (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-line/60 bg-paper transition-all duration-300 hover:-translate-y-1.5 hover:border-plum/30 hover:shadow-xl hover:shadow-plum/5">
      
      {/* Top Media Container */}
      <Link href={`/recipes/${recipe._id}`} className="relative aspect-[4/3] w-full overflow-hidden bg-line/40">
        {recipe.imageUrl ? (
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-plum/5 text-plum/40 font-display italic">
            No Image
          </div>
        )}

        {/* Dark Vignette Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-80" />

        {/* Top Badges: Diet Tag & Bookmark Button */}
        <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
          {recipe.diets?.[0] ? (
            <span className="rounded-full border border-white/20 bg-paper/80 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink backdrop-blur-md shadow-sm">
              {recipe.diets[0]}
            </span>
          ) : (
            <span />
          )}

          {/* Quick Action Bookmark */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              // Bookmark logic handle kar sakte hain yahan
            }}
            aria-label="Save Recipe"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-paper/80 text-ink/70 backdrop-blur-md transition-all hover:bg-plum hover:text-white active:scale-90"
          >
            <Bookmark className="h-4 w-4" />
          </button>
        </div>

        {/* Bottom Image Overlay Info: Prep Time & Calories */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
          {totalTime > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
              <Clock className="h-3.5 w-3.5 text-amber-300" />
              {formatMinutes(totalTime)}
            </span>
          )}

          {recipe.nutrition?.calories && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
              <Flame className="h-3.5 w-3.5 text-orange-400" />
              {recipe.nutrition.calories} kcal
            </span>
          )}
        </div>
      </Link>

      {/* Card Body Content */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          {/* Rating or Likes Row */}
          <div className="flex items-center justify-between text-xs text-ink/60 mb-2">
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>4.9</span>
              <span className="text-ink/40 font-normal">(128)</span>
            </div>

            <div className="flex items-center gap-1 text-rose-500 font-medium">
              <Heart className="h-3.5 w-3.5 fill-rose-500/20 text-rose-500" />
              <span>{recipe.likesCount ?? 0}</span>
            </div>
          </div>

          {/* Recipe Title */}
          <Link href={`/recipes/${recipe._id}`} className="group/title">
            <h3 className="font-display text-xl font-semibold italic leading-snug text-ink transition-colors group-hover/title:text-plum line-clamp-1">
              {recipe.title}
            </h3>
          </Link>

          {/* Recipe Description */}
          {recipe.description && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink/70">
              {recipe.description}
            </p>
          )}
        </div>

        {/* Card Footer: View Details CTA */}
        <div className="mt-5 border-t border-line/40 pt-3 flex items-center justify-between">
          <span className="text-[11px] font-medium text-ink/50 uppercase tracking-wider">
            {recipe.servings ? `${recipe.servings} Servings` : "Easy Prep"}
          </span>

          <Link
            href={`/recipes/${recipe._id}`}
            className="text-xs font-semibold text-plum transition-all hover:translate-x-0.5 hover:underline"
          >
            View Recipe →
          </Link>
        </div>
      </div>
    </div>
  );
}