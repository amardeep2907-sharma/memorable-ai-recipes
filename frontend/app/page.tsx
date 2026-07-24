import type { Metadata } from "next";
import { Recipe } from "@/types/recipe";
import { FeaturedCreator } from "@/types/admin-extra";
import { getCurrentSeason } from "@/lib/utils";
import HeroCarousel from "@/components/HeroCarousel";
import HomeHero from "@/components/home/HomeHero";
import BrowseByMood from "@/components/home/BrowseByMood";
import RecipeRail from "@/components/home/RecipeRail";
import FeaturedCreatorsSection from "@/components/home/FeaturedCreatorsSection";
import AIFeatureStrip from "@/components/home/AIFeatureStrip";
import NewsletterSection from "@/components/home/NewsletterSection";

export const metadata: Metadata = {
  title: "Memorable — Recipes worth remembering",
  description:
    "Discover, cook, and share recipes with an AI sous-chef that knows what's in your fridge.",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

// Server-side fetch helper for the homepage rails - revalidates every 60s
async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const currentSeason = getCurrentSeason();
  const [trending, recentlyAdded, topRated, communityPicks, seasonal, featuredCreators] = await Promise.all([
    fetchJson<{ data: Recipe[] }>("/recipes?sort=trending&limit=4"),
    fetchJson<{ data: Recipe[] }>("/recipes?sort=recent&limit=4"),
    fetchJson<{ data: Recipe[] }>("/recipes?sort=topRated&limit=4"),
    fetchJson<{ data: Recipe[] }>("/recipes?sort=mostSaved&limit=4"),
    fetchJson<{ data: Recipe[] }>(`/recipes?season=current&sort=trending&limit=4`),
    fetchJson<{ data: FeaturedCreator[] }>("/users/featured"),
  ]);

  return (
    <div className="w-full bg-paper/30 pb-12">
      {/* 
        HeroCarousel Wrapper: 
        Pehle yahan max-w-6xl tha jo card ko bohot squeezed/narrow kar raha tha.
        Isko humne wider layout (max-w-7xl) aur tight side padding (px-2 sm:px-4 lg:px-6) de di hai.
      */}
      <section className="mx-auto max-w-7xl px-3  sm:px-4 lg:px-6">
        <HeroCarousel />
      </section>

      {/* Main Home Hero */}
      <HomeHero />

      {/* Browse By Mood */}
      <BrowseByMood />

      {/* Recipe Rails Section */}
      <div className="space-y-4 sm:space-y-8">
        <RecipeRail
          titleKey="home.seasonalPicks"
          titleVars={{ season: currentSeason }}
          subtitleKey="home.seasonalPicksSub"
          recipes={seasonal?.data ?? []}
        />
        <RecipeRail 
          titleKey="home.trending" 
          subtitleKey="home.trendingSub" 
          recipes={trending?.data ?? []} 
        />
        <RecipeRail 
          titleKey="home.recentlyAdded" 
          subtitleKey="home.recentlyAddedSub" 
          recipes={recentlyAdded?.data ?? []} 
        />
        <RecipeRail 
          titleKey="home.topRated" 
          subtitleKey="home.topRatedSub" 
          recipes={topRated?.data ?? []} 
        />
        <RecipeRail 
          titleKey="home.communityPicks" 
          subtitleKey="home.communityPicksSub" 
          recipes={communityPicks?.data ?? []} 
        />
      </div>

      {/* Bottom Features & Community */}
      <div className="mt-8 sm:mt-12">
        <FeaturedCreatorsSection creators={featuredCreators?.data ?? []} />
      </div>

      <AIFeatureStrip />
      <NewsletterSection />
    </div>
  );
}