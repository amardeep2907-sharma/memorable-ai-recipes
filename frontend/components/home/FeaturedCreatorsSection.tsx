"use client";

import Link from "next/link";
import { Award, ChefHat, Sparkles, ArrowRight } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { FeaturedCreator } from "@/types/admin-extra";

export default function FeaturedCreatorsSection({ creators }: { creators: FeaturedCreator[] }) {
  const { t } = useLocale();
  if (creators.length === 0) return null;

  return (
    <section className="border-y border-line/60 bg-gradient-to-b from-paper/40 via-paper to-plum/5 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-200/50 bg-amber-100/50 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-amber-600">
              <Sparkles className="h-3 w-3" /> Community Stars
            </span>
            <h2 className="font-display text-3xl italic tracking-tight text-ink sm:text-4xl">
              {t("home.featuredCreators")}
            </h2>
            <p className="mt-2 text-sm text-ink/60 max-w-lg">
              {t("home.featuredCreatorsSub")}
            </p>
          </div>

          {/* Optional: Explore All Button (If you have a creators page) */}
          <Link 
            href="/search?type=creators" 
            className="group hidden items-center gap-1.5 text-xs font-semibold text-plum hover:underline sm:flex"
          >
            Explore all <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Creators Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {creators.map((creator) => (
            <Link
              key={creator._id}
              href={`/users/${creator._id}`}
              className="group relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-line/60 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-plum/40 hover:shadow-xl hover:shadow-plum/10"
            >
              {/* Premium Avatar Container */}
              <div className="relative mb-4">
                {/* Hover Glow Effect behind avatar */}
                <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-plum/40 via-amber-200/40 to-transparent opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
                
                {/* Main Avatar */}
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-plum/10 to-plum/5 font-display text-2xl font-semibold italic text-plum shadow-md transition-transform duration-300 group-hover:scale-105">
                  {creator.name.charAt(0).toUpperCase()}
                </div>

                {/* Featured Verified Badge */}
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-plum text-white shadow-sm transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
                  <Award className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Creator Info */}
              <h3 className="font-display text-base font-semibold text-ink transition-colors group-hover:text-plum line-clamp-1 w-full">
                {creator.name}
              </h3>
              
              <div className="mt-1.5 flex items-center justify-center gap-1.5 rounded-full bg-ink/5 px-2.5 py-1">
                <ChefHat className="h-3 w-3 text-ink/40" />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ink/60">
                  {creator.recipeCount} Recipes
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}