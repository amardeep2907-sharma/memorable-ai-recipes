"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Utensils, Compass } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { useLocale } from "@/context/LocaleContext";

const POPULAR_TAGS = ["Biryani", "Paneer Tikka", "Pasta", "Quick Breakfast", "Soups"];

const INGREDIENT_TEXTURE = [
  "rice", "onion", "tomato", "garlic", "ginger", "basil", "chili", "cumin",
  "lemon", "olive oil", "paneer", "coconut", "coriander", "eggs", "butter",
  "yogurt", "turmeric", "mint", "potato", "spinach",
];

export default function HomeHero() {
  const { t } = useLocale();

  return (
    <section className="relative overflow-hidden border-b border-line/60 bg-paper/50 py-16 sm:py-24">
      {/* Background Subtle Floating Mesh */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex flex-wrap content-start gap-4 p-6 opacity-[0.08] blur-[0.3px]">
        {INGREDIENT_TEXTURE.map((ing) => (
          <span 
            key={ing} 
            className="rounded-full border border-ink/20 px-3 py-1 font-mono text-xs uppercase tracking-widest text-ink select-none"
          >
            {ing}
          </span>
        ))}
      </div>

      {/* Main Container - Width expanded to 7xl with proper padding */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          
          {/* Left Column: Core Messaging & Search */}
          <div className="flex flex-col items-start lg:col-span-7">
            {/* Badge */}
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-plum/10 px-3.5 py-1.5 text-xs font-semibold text-plum ring-1 ring-inset ring-plum/20">
              <Sparkles className="h-3.5 w-3.5" />
              {t("home.badge")}
            </span>

            {/* Main Headline */}
            <h1 className="font-display text-4xl italic tracking-tight text-ink sm:text-6xl sm:leading-[1.1] lg:text-7xl">
              {t("home.heroTitle1")}{" "}
              <span className="not-italic text-plum font-sans font-extrabold block sm:inline">
                {t("home.heroTitle2")}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-xl text-base text-ink/75 sm:text-lg leading-relaxed">
              {t("home.heroSubtitle")}
            </p>

            {/* Search Bar Wrapper */}
            <div className="mt-8 w-full max-w-xl">
              <SearchBar />
            </div>

            {/* Popular Search Tags / AI Link Below Search */}
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
              <span className="font-medium text-ink/50">Popular:</span>
              <div className="flex flex-wrap items-center gap-2">
                {POPULAR_TAGS.map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?q=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-ink/5 px-3 py-1 text-ink/80 transition-all hover:bg-plum/10 hover:text-plum"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Link to AI */}
            <div className="mt-6 pt-2 border-t border-line/40 w-full max-w-xl">
              <Link 
                href="/ai-tools" 
                className="inline-flex items-center gap-2 text-sm font-medium text-plum hover:underline group"
              >
                <span>{t("home.askAssistant")}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Decorative Hero Card (Fills up empty right space) */}
          <div className="hidden lg:col-span-5 lg:block">
            <div className="relative mx-auto w-full max-w-md">
              {/* Soft Background Glow */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-plum/20 to-amber-200/30 blur-2xl" />

              {/* Glassmorphism Showcase Card */}
              <div className="relative rounded-3xl border border-line bg-paper/80 p-8 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-line/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-plum/10 text-plum">
                      <Utensils className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink text-sm">Smart Chef AI</h3>
                      <p className="text-xs text-ink/60">Ingredient Matcher</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                    Live Assistant
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="rounded-2xl bg-ink/5 p-3.5 text-xs text-ink/80">
                    <p className="font-medium text-ink">What's in your fridge?</p>
                    <p className="mt-1 text-ink/60">Enter ingredients and get personalized recipes instantly.</p>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <div className="flex -space-x-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-[10px] ring-2 ring-paper">🧄</span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-[10px] ring-2 ring-paper">🍅</span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-[10px] ring-2 ring-paper">🥬</span>
                    </div>
                    <span className="text-[11px] font-medium text-ink/60">+ 1,000+ combinations</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link 
                    href="/ai-tools"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-plum py-3 text-xs font-semibold text-white transition-all hover:bg-plum/90"
                  >
                    <Compass className="h-4 w-4" /> Try AI Kitchen Tool
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}