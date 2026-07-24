"use client";

import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Sparkles, Loader2, Wand2, X, Filter, RotateCcw } from "lucide-react";
import RecipeCard from "@/components/RecipeCard";
import RecipeGridSkeleton from "@/components/skeletons/RecipeGridSkeleton";
import RecipeCardSkeleton from "@/components/skeletons/RecipeCardSkeleton";
import { recipeApi, aiApi } from "@/lib/api";
import { RecipeSearchResult, Recipe } from "@/types/recipe";

const FILTERS = {
  cuisine: ["Indian", "Italian", "Mexican", "Chinese", "Thai"],
  diet: ["Vegetarian", "Vegan", "Keto", "Gluten Free", "High Protein"],
  mealType: ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"],
  season: ["Spring", "Summer", "Autumn", "Winter"],
};

const PAGE_SIZE = 12;
const DEBOUNCE_MS = 350;

export default function SearchPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [inputValue, setInputValue] = useState(params.get("query") ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(inputValue);
  const [cuisine, setCuisine] = useState<string>();
  const [diet, setDiet] = useState<string>();
  const [mealType, setMealType] = useState<string>();
  const [season, setSeason] = useState<string>();
  const [ingredients, setIngredients] = useState("");
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [smartOpen, setSmartOpen] = useState(false);
  const [smartQuery, setSmartQuery] = useState("");
  const [smartLoading, setSmartLoading] = useState(false);
  const [smartError, setSmartError] = useState<string | null>(null);
  const [smartResults, setSmartResults] = useState<{
    recipes: Recipe[];
    filters: { keywords?: string; cuisine?: string; diet?: string; mealType?: string };
  } | null>(null);

  async function runSmartSearch() {
    if (!smartQuery.trim()) return;
    setSmartLoading(true);
    setSmartError(null);
    try {
      const res = await aiApi.smartSearch(smartQuery.trim());
      setSmartResults({ recipes: res.data.recipes, filters: res.data.filters });
    } catch {
      setSmartError("Sign in to use AI-powered search.");
    } finally {
      setSmartLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue);
      const next = new URLSearchParams(params.toString());
      if (inputValue) next.set("query", inputValue);
      else next.delete("query");
      router.replace(`/search?${next.toString()}`, { scroll: false });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery<RecipeSearchResult>({
    queryKey: ["recipes", debouncedQuery, cuisine, diet, mealType, season],
    queryFn: ({ pageParam }) =>
      recipeApi.search({
        query: debouncedQuery,
        cuisine,
        diet,
        mealType,
        season,
        page: pageParam as number,
        limit: PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.meta.page * lastPage.meta.limit;
      return loaded < lastPage.meta.total ? lastPage.meta.page + 1 : undefined;
    },
  });

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  async function askAssistant() {
    if (!ingredients) return;
    setAiLoading(true);
    try {
      const res = await aiApi.cookingAssistant(ingredients);
      setAiResult(res.data.response);
    } catch {
      setAiResult("Sign in to use the AI cooking assistant.");
    } finally {
      setAiLoading(false);
    }
  }

  const recipes = data?.pages.flatMap((p) => p.data) ?? [];
  const activeFilterCount = [cuisine, diet, mealType, season].filter(Boolean).length;

  const clearAllFilters = () => {
    setCuisine(undefined);
    setDiet(undefined);
    setMealType(undefined);
    setSeason(undefined);
    setInputValue("");
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-8">
      {/* Header Search Section */}
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-plum/10 px-3 py-1 text-xs font-semibold text-plum">
          <Sparkles className="h-3.5 w-3.5" /> Recipe Discovery Engine
        </span>
        <h1 className="font-display text-3xl font-semibold italic text-ink sm:text-4xl">
          Find your next favorite meal
        </h1>

        <div className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-line/80 bg-paper/90 px-4 py-3.5 shadow-lg shadow-black/5 backdrop-blur-md focus-within:border-plum/50">
          <Search className="h-5 w-5 text-plum" />
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search by dish, ingredient, or cuisine..."
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none"
          />
          {inputValue && (
            <button
              onClick={() => setInputValue("")}
              className="rounded-full p-1 text-ink/40 hover:bg-ink/5 hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setSmartOpen((v) => !v)}
          className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-plum hover:underline"
        >
          <Wand2 className="h-3.5 w-3.5" />
          {smartOpen ? "Close AI natural search" : "Or describe what you want in your own words"}
        </button>

        {smartOpen && (
          <div className="mt-3 w-full animate-in fade-in duration-200">
            <div className="flex items-center gap-2 rounded-2xl border border-plum/30 bg-plum/5 p-2">
              <Sparkles className="ml-2 h-4 w-4 shrink-0 text-plum" />
              <input
                value={smartQuery}
                onChange={(e) => setSmartQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSmartSearch()}
                placeholder="e.g. something spicy and quick for dinner..."
                className="w-full bg-transparent px-2 text-xs text-ink placeholder:text-ink/40 focus:outline-none sm:text-sm"
              />
              <button
                onClick={runSmartSearch}
                disabled={smartLoading}
                className="flex items-center gap-1.5 rounded-xl bg-plum px-4 py-2 text-xs font-semibold text-white"
              >
                {smartLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Ask AI"}
              </button>
            </div>
            {smartError && <p className="mt-2 text-xs text-rose-600">{smartError}</p>}
          </div>
        )}
      </div>

      {/* AI Smart Search Result Banner */}
      {smartResults && (
        <section className="mt-8 rounded-3xl border border-plum/20 bg-plum/5 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-plum/10 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-lg italic font-semibold text-plum">AI Picks</span>
              {smartResults.filters.keywords && (
                <span className="rounded-full bg-paper px-3 py-1 font-mono text-xs text-ink border border-line">
                  {smartResults.filters.keywords}
                </span>
              )}
              {smartResults.filters.cuisine && (
                <span className="rounded-full bg-paper px-3 py-1 font-mono text-xs text-ink border border-line">
                  {smartResults.filters.cuisine}
                </span>
              )}
            </div>
            <button
              onClick={() => setSmartResults(null)}
              className="flex items-center gap-1 rounded-full bg-paper px-3 py-1 text-xs text-ink/60 hover:text-plum border border-line"
            >
              <X className="h-3.5 w-3.5" /> Clear AI Results
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {smartResults.recipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        </section>
      )}

      {/* Main Grid Section: Sidebar + Expanded Card Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        
        {/* Fixed & Internally Scrollable Left Sidebar */}
        <aside className="space-y-5 rounded-3xl border border-line/60 bg-paper/80 p-5 shadow-sm lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-3 [scrollbar-width:thin]">
          <div className="flex items-center justify-between border-b border-line/60 pb-3">
            <span className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-ink">
              <Filter className="h-3.5 w-3.5 text-plum" /> Filters
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:underline"
              >
                <RotateCcw className="h-3 w-3" /> Reset ({activeFilterCount})
              </button>
            )}
          </div>

          {Object.entries(FILTERS).map(([group, options]) => (
            <div key={group}>
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink/50 mb-2">
                {group}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {options.map((opt) => {
                  const current = { cuisine, diet, mealType, season }[group];
                  const active = current === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => {
                        const setters = {
                          cuisine: setCuisine,
                          diet: setDiet,
                          mealType: setMealType,
                          season: setSeason,
                        };
                        const setter = setters[group as keyof typeof setters];
                        setter((prev) => (prev === opt ? undefined : opt));
                      }}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                        active
                          ? "bg-plum text-white shadow-sm"
                          : "border border-line/80 bg-paper/80 text-ink/70 hover:border-plum/40 hover:text-ink"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Pantry Assistant Widget */}
          <div className="rounded-2xl border border-plum/20 bg-gradient-to-b from-plum/10 to-transparent p-3.5">
            <p className="flex items-center gap-1.5 font-display text-sm font-semibold italic text-plum">
              <Sparkles className="h-4 w-4" /> Pantry Assistant
            </p>
            <p className="mt-1 text-[11px] text-ink/60">Type available ingredients:</p>
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="rice, onion, tomato, eggs..."
              rows={3}
              className="mt-2 w-full rounded-xl border border-line/80 bg-paper p-2 text-xs text-ink focus:border-plum focus:outline-none shadow-inner"
            />
            <button
              onClick={askAssistant}
              disabled={aiLoading}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-plum py-2 text-xs font-semibold text-white transition-all hover:bg-plum/90"
            >
              {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Suggest recipes"}
            </button>
            {aiResult && (
              <p className="mt-2.5 whitespace-pre-line text-xs leading-relaxed text-ink/80 bg-paper p-2 rounded-xl border border-line">
                {aiResult}
              </p>
            )}
          </div>
        </aside>

        {/* Recipe Cards Grid Section */}
        <div className="w-full">
          {isLoading && (
            <RecipeGridSkeleton
              count={9}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3"
            />
          )}

          {!isLoading && recipes.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-line/60 bg-paper/60 py-16 text-center">
              <Search className="h-10 w-10 text-ink/30 mb-3" />
              <p className="font-display text-xl italic font-semibold text-ink">No recipes matched</p>
              <p className="mt-1 text-xs text-ink/60 max-w-sm">
                Try adjusting your search query or clear some filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-4 rounded-full bg-plum px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-plum/90"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {!isLoading && recipes.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          )}

          <div ref={sentinelRef} className="h-4" />

          {isFetchingNextPage && (
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3">
              <RecipeCardSkeleton />
              <RecipeCardSkeleton />
              <RecipeCardSkeleton />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}