"use client";

import { Search, Loader2, X, Clock, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { recipeApi } from "@/lib/api";
import { Recipe } from "@/types/recipe";

export default function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Recipe[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await recipeApi.search({ query, limit: 5 });
        setSuggestions(res.data);
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/search?query=${encodeURIComponent(query)}`);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        
        {/* Main Search Box */}
        <div className="flex flex-1 items-center gap-2.5 rounded-full border border-line/80 bg-paper/90 px-4 py-3 shadow-lg shadow-black/5 backdrop-blur-md transition-all focus-within:border-plum/60 focus-within:ring-2 focus-within:ring-plum/10">
          <Search className="h-4 w-4 shrink-0 text-plum" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder="Search by dish, ingredient, or cuisine..."
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none"
            autoComplete="off"
          />

          {/* Quick Clear Input Action */}
          {query && !loading && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                setOpen(false);
              }}
              className="rounded-full p-1 text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-plum" />}
        </div>

        {/* Submit Action Button */}
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-full bg-plum px-5 py-3 text-xs font-semibold text-white shadow-md transition-all hover:bg-plum/90 hover:scale-105 active:scale-95 shrink-0"
        >
          <span>Search</span>
        </button>
      </form>

      {/* Floating Suggestions Dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-3xl border border-line/60 bg-paper/95 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="border-b border-line/40 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-ink/40">
            Quick Suggestions
          </div>

          <div className="divide-y divide-line/30">
            {suggestions.map((recipe) => (
              <Link
                key={recipe._id}
                href={`/recipes/${recipe._id}`}
                onClick={() => setOpen(false)}
                className="group flex items-center justify-between px-4 py-3 transition-colors hover:bg-plum/5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-line/60 bg-line/40">
                    {recipe.imageUrl ? (
                      <Image
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-plum/10 font-display text-xs italic text-plum">
                        Preview
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink transition-colors group-hover:text-plum">
                      {recipe.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 font-mono text-[11px] text-ink/50">
                      {recipe.cuisine[0] && <span>{recipe.cuisine[0]}</span>}
                      {recipe.prepTimeMinutes && (
                        <span className="flex items-center gap-0.5">
                          • <Clock className="h-3 w-3 text-amber-500" />
                          {recipe.prepTimeMinutes + (recipe.cookTimeMinutes || 0)}m
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 shrink-0 text-ink/30 transition-transform group-hover:translate-x-1 group-hover:text-plum" />
              </Link>
            ))}
          </div>

          {/* Footer Direct Jump Link */}
          <button
            type="button"
            onClick={handleSubmit}
            className="flex w-full items-center justify-center gap-1.5 border-t border-line/60 bg-ink/5 py-2.5 text-xs font-semibold text-plum hover:bg-plum/10"
          >
            <span>See all results for "{query}"</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}