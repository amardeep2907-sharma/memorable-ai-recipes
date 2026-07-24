"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { ChefHat, Heart, MessageCircle, Star, Users, ArrowRight, Sparkles, Clock } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { userApi } from "@/lib/api";
import { FeedItem } from "@/types/feed";
import { timeAgo } from "@/lib/utils";
import ListSkeleton from "@/components/skeletons/ListSkeleton";

export default function FeedPage() {
  return (
    <ProtectedRoute>
      <FeedContent />
    </ProtectedRoute>
  );
}

const ICONS = {
  recipe_published: { icon: ChefHat, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  recipe_liked: { icon: Heart, color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
  comment_added: { icon: MessageCircle, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  review_added: { icon: Star, color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
};

function activityLine(item: FeedItem): string {
  switch (item.type) {
    case "recipe_published":
      return "published a new recipe";
    case "recipe_liked":
      return "liked a recipe";
    case "comment_added":
      return "left a comment on";
    case "review_added":
      return `rated ${"★".repeat(item.rating ?? 0)}${"☆".repeat(5 - (item.rating ?? 0))} on`;
  }
}

function FeedContent() {
  const { data, isLoading } = useQuery<{ data: FeedItem[] }>({
    queryKey: ["feed"],
    queryFn: () => userApi.feed(),
  });

  const items = data?.data ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Header Banner */}
      <div className="mx-auto max-w-3xl text-center">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-plum/20 bg-plum/10 px-3.5 py-1 text-xs font-semibold text-plum">
          <Users className="h-3.5 w-3.5" />
          Kitchen Circle Activity
        </span>
        <h1 className="font-display text-3xl font-semibold italic text-ink sm:text-4xl lg:text-5xl">
          What your circle is cooking
        </h1>
        <p className="mt-3 text-sm text-ink/70 sm:text-base">
          Real-time updates, new recipes, reviews, and culinary inspiration from creators you follow.
        </p>
      </div>

      {/* Main Activity Timeline Column */}
      <div className="mx-auto mt-10 max-w-3xl">
        {isLoading && (
          <div className="space-y-4">
            <ListSkeleton rows={5} />
          </div>
        )}

        {/* Premium Empty State */}
        {!isLoading && items.length === 0 && (
          <div className="relative overflow-hidden rounded-3xl border border-line/60 bg-paper/80 p-8 text-center shadow-lg backdrop-blur-md sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-plum/10 text-plum mb-4">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="font-display text-2xl italic font-semibold text-ink">Your feed is quiet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink/60">
              Follow talented home chefs and recipe authors to see their latest dishes, reviews, and recommendations here.
            </p>
            <div className="mt-6">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-full bg-plum px-6 py-3 text-xs font-semibold text-white shadow-md transition-all hover:bg-plum/90 hover:scale-105"
              >
                <span>Discover Creators & Recipes</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Timeline Items */}
        {!isLoading && items.length > 0 && (
          <div className="relative space-y-4 before:absolute before:left-6 before:top-3 before:h-[calc(100%-2rem)] before:w-0.5 before:bg-line/60">
            {items.map((item) => {
              const meta = ICONS[item.type];
              const Icon = meta.icon;

              return (
                <div
                  key={item.id}
                  className="group relative flex items-start gap-4 rounded-3xl border border-line/60 bg-paper/80 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-plum/30 hover:shadow-md"
                >
                  {/* Left Avatar / Type Icon Badge */}
                  <div className="relative shrink-0">
                    <Link href={`/users/${item.actor._id}`} className="block">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-plum/10 to-plum/5 font-display text-lg italic font-semibold text-plum shadow-inner ring-2 ring-paper">
                        {item.actor.name.charAt(0).toUpperCase()}
                      </div>
                    </Link>
                    {/* Activity Badge Overlay */}
                    <div
                      className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-paper ${meta.color} shadow-sm`}
                    >
                      <Icon className="h-3 w-3" />
                    </div>
                  </div>

                  {/* Main Content Area */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-sm text-ink/80">
                      <Link
                        href={`/users/${item.actor._id}`}
                        className="font-semibold text-ink transition-colors hover:text-plum"
                      >
                        {item.actor.name}
                      </Link>
                      <span className="text-ink/60 font-normal">{activityLine(item)}</span>
                      <Link
                        href={`/recipes/${item.recipe._id}`}
                        className="font-display italic font-semibold text-plum transition-all hover:underline"
                      >
                        "{item.recipe.title}"
                      </Link>
                    </div>

                    {/* Blockquote Comment / Review Snippet */}
                    {(item.type === "comment_added" || item.type === "review_added") && item.text && (
                      <div className="mt-2.5 rounded-2xl bg-ink/5 p-3 text-xs leading-relaxed italic text-ink/80 border-l-2 border-plum/40">
                        "{item.text}"
                      </div>
                    )}

                    {/* Time Ago Footer */}
                    <div className="mt-3 flex items-center gap-1.5 font-mono text-[11px] font-medium text-ink/40">
                      <Clock className="h-3 w-3" />
                      <span>{timeAgo(item.createdAt)}</span>
                    </div>
                  </div>

                  {/* Recipe Image Thumbnail */}
                  {item.recipe.imageUrl && (
                    <Link
                      href={`/recipes/${item.recipe._id}`}
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-line/60 bg-line/40 transition-transform duration-300 group-hover:scale-105"
                    >
                      <Image
                        src={item.recipe.imageUrl}
                        alt={item.recipe.title}
                        fill
                        className="object-cover"
                      />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}