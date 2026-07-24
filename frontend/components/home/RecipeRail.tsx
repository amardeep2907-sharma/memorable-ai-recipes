"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import RecipeCard from "@/components/RecipeCard";
import { useLocale } from "@/context/LocaleContext";
import { Recipe } from "@/types/recipe";

export default function RecipeRail({
  titleKey,
  subtitleKey,
  titleVars,
  recipes,
}: {
  titleKey: string;
  subtitleKey: string;
  titleVars?: Record<string, string>;
  recipes: Recipe[];
}) {
  const { t } = useLocale();

  if (!recipes || recipes.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-2 py-6 sm:px-4 lg:px-6">
      {/* Rail Header */}
      <div className="mb-4 flex items-end justify-between px-1">
        <div>
          <h2 className="font-display text-2xl font-semibold italic text-ink sm:text-3xl">
            {t(titleKey, titleVars)}
          </h2>
          {subtitleKey && (
            <p className="mt-1 text-xs text-ink/60 sm:text-sm">
              {t(subtitleKey)}
            </p>
          )}
        </div>

        <Link
          href="/search"
          className="group flex items-center gap-1 text-xs font-semibold text-plum hover:underline sm:text-sm"
        >
          <span>{t("common.seeAll")}</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Grid Layout: Full width stretch with tight gaps */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-4 lg:gap-6">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe._id} recipe={recipe} />
        ))}
      </div>
    </section>
  );
}