"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Bookmark,
  Heart,
  Sparkles,
  Bell,
  Plus,
  Newspaper,
  CalendarDays,
  Trash2,
  FolderHeart,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Send,
  ChefHat
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import RecipeCard from "@/components/RecipeCard";
import RecipeGridSkeleton from "@/components/skeletons/RecipeGridSkeleton";
import ListSkeleton from "@/components/skeletons/ListSkeleton";
import { useAuth } from "@/context/AuthContext";
import { userApi, aiApi, blogApi, mealPlanApi } from "@/lib/api";
import { SavedRecipeEntry, LikedRecipeEntry, Notification, AIHistoryItem } from "@/types/dashboard";
import { Recipe } from "@/types/recipe";
import { BlogPost } from "@/types/blog";
import { MealPlan } from "@/types/mealPlan";
import { useLocale } from "@/context/LocaleContext";

type Tab = "recipes" | "posts" | "mealplans" | "saved" | "liked" | "ai" | "notifications";
const VALID_TABS: Tab[] = ["recipes", "posts", "mealplans", "saved", "liked", "ai", "notifications"];

const TABS: { id: Tab; labelKey: string; icon: typeof BookOpen }[] = [
  { id: "recipes", labelKey: "dashboard.myRecipes", icon: BookOpen },
  { id: "posts", labelKey: "dashboard.myPosts", icon: Newspaper },
  { id: "mealplans", labelKey: "dashboard.mealPlans", icon: CalendarDays },
  { id: "saved", labelKey: "dashboard.saved", icon: Bookmark },
  { id: "liked", labelKey: "dashboard.liked", icon: Heart },
  { id: "ai", labelKey: "dashboard.aiHistory", icon: Sparkles },
  { id: "notifications", labelKey: "dashboard.notifications", icon: Bell },
];

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={null}>
        <DashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab") as Tab | null;
  const [tab, setTab] = useState<Tab>(requestedTab && VALID_TABS.includes(requestedTab) ? requestedTab : "recipes");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Premium Hero Header Box */}
      <div className="relative overflow-hidden rounded-3xl border border-line/60 bg-gradient-to-b from-plum/10 via-paper to-paper p-6 shadow-xl sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-plum/10 blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-plum font-display text-2xl italic font-bold text-white shadow-lg ring-4 ring-paper">
              {user?.name?.charAt(0).toUpperCase() ?? "C"}
            </div>
            <div>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-plum">
                <ChefHat className="h-3.5 w-3.5" /> Kitchen Workspace
              </span>
              <h1 className="font-display text-3xl font-semibold italic text-ink sm:text-4xl">
                {user ? t("dashboard.welcomeBack", { name: user.name.split(" ")[0] }) : t("dashboard.title")}
              </h1>
              <p className="mt-1 text-xs text-ink/60 sm:text-sm">{t("dashboard.subtitle")}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/create-recipe"
              className="inline-flex items-center gap-1.5 rounded-full bg-plum px-5 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-plum/90 hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4" /> {t("dashboard.newRecipe")}
            </Link>
            <Link
              href="/blog/write"
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-5 py-2.5 text-xs font-semibold text-ink shadow-sm transition-all hover:bg-ink/5 hover:scale-105 active:scale-95"
            >
              <Newspaper className="h-4 w-4 text-plum" /> {t("dashboard.writePost")}
            </Link>
          </div>
        </div>
      </div>

      {/* Glassmorphic Tab Bar Navigation */}
      <div className="mt-8 flex overflow-x-auto pb-2 [scrollbar-width:none]">
        <div className="flex items-center gap-2 rounded-2xl border border-line/60 bg-paper/80 p-1.5 shadow-sm backdrop-blur-md">
          {TABS.map(({ id, labelKey, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all duration-200 ${
                  active
                    ? "bg-plum text-white shadow-md shadow-plum/20"
                    : "text-ink/70 hover:bg-ink/5 hover:text-ink"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-white" : "text-plum"}`} />
                <span>{t(labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Panels Container */}
      <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {tab === "recipes" && <MyRecipesPanel />}
        {tab === "posts" && <MyPostsPanel />}
        {tab === "mealplans" && <MealPlansPanel />}
        {tab === "saved" && <SavedPanel />}
        {tab === "liked" && <LikedPanel />}
        {tab === "ai" && <AIHistoryPanel />}
        {tab === "notifications" && <NotificationsPanel />}
      </div>
    </div>
  );
}

function EmptyState({ title, description, actionHref, actionText }: { title: string; description: string; actionHref?: string; actionText?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-line/60 bg-paper/60 p-12 text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-plum/10 text-plum mb-3">
        <Sparkles className="h-6 w-6" />
      </div>
      <h3 className="font-display text-xl font-semibold italic text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-ink/60 leading-relaxed">{description}</p>
      {actionHref && actionText && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-plum px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-plum/90"
        >
          {actionText} <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function MyRecipesPanel() {
  const { data, isLoading } = useQuery<{ data: Recipe[] }>({
    queryKey: ["dashboard", "my-recipes"],
    queryFn: () => userApi.myRecipes(),
  });

  if (isLoading) return <RecipeGridSkeleton count={6} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" />;
  const recipes = data?.data ?? [];
  
  if (recipes.length === 0) {
    return (
      <EmptyState
        title="No Published Recipes Yet"
        description="Share your signature culinary creations with the world and inspire other home chefs."
        actionHref="/create-recipe"
        actionText="Create Your First Recipe"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <div key={recipe._id} className="relative group">
          {recipe.status !== "published" && (
            <span className="absolute right-3 top-3 z-20 rounded-full border border-white/20 bg-ink/80 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-paper backdrop-blur-md">
              {recipe.status}
            </span>
          )}
          <RecipeCard recipe={recipe} />
        </div>
      ))}
    </div>
  );
}

function MyPostsPanel() {
  const { data, isLoading } = useQuery<{ data: BlogPost[] }>({
    queryKey: ["dashboard", "my-posts"],
    queryFn: () => blogApi.mine(),
  });

  if (isLoading) return <ListSkeleton rows={4} />;
  const posts = data?.data ?? [];

  if (posts.length === 0) {
    return (
      <EmptyState
        title="No Journal Posts Written"
        description="Write culinary stories, kitchen tips, or restaurant reviews for the community."
        actionHref="/blog/write"
        actionText="Write a Post"
      />
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <Link
          key={post._id}
          href={post.status === "published" ? `/blog/${post.slug}` : `/blog/${post.slug}/edit`}
          className="group flex items-center justify-between gap-4 rounded-2xl border border-line/60 bg-paper p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-plum/30 hover:shadow-md"
        >
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-semibold italic text-ink group-hover:text-plum line-clamp-1">
              {post.title}
            </h3>
            <p className="mt-1 flex items-center gap-1 font-mono text-[11px] text-ink/40">
              <Clock className="h-3 w-3" /> {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider ${
              post.status === "published"
                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                : "bg-plum/10 text-plum border border-plum/20"
            }`}
          >
            {post.status === "published" ? "Live" : "Pending Review"}
          </span>
        </Link>
      ))}
    </div>
  );
}

function MealPlansPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<{ data: MealPlan[] }>({
    queryKey: ["dashboard", "meal-plans"],
    queryFn: () => mealPlanApi.mine(),
  });

  async function handleDelete(id: string) {
    await mealPlanApi.delete(id);
    queryClient.invalidateQueries({ queryKey: ["dashboard", "meal-plans"] });
  }

  if (isLoading) return <ListSkeleton rows={3} />;
  const plans = data?.data ?? [];

  if (plans.length === 0) {
    return (
      <EmptyState
        title="No Saved Meal Plans"
        description="Generate custom weekly meal plans tailored to your diet with our AI assistant."
        actionHref="/ai-tools"
        actionText="Generate Meal Plan"
      />
    );
  }

  return (
    <div className="space-y-3">
      {plans.map((plan) => (
        <div
          key={plan._id}
          className="group flex items-center justify-between gap-4 rounded-2xl border border-line/60 bg-paper p-5 shadow-sm transition-all duration-200 hover:border-plum/30 hover:shadow-md"
        >
          <Link href={`/meal-plans/${plan._id}`} className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-semibold italic text-ink group-hover:text-plum line-clamp-1">
              {plan.goal}
            </h3>
            <p className="mt-1 font-mono text-[11px] text-ink/50">
              {plan.days.length} Days Plan · Generated {new Date(plan.createdAt).toLocaleDateString()}
            </p>
          </Link>
          <button
            onClick={() => handleDelete(plan._id)}
            className="rounded-full p-2 text-ink/40 transition-colors hover:bg-rose-50 hover:text-rose-600"
            aria-label="Delete meal plan"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function SavedPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<{ data: SavedRecipeEntry[] }>({
    queryKey: ["dashboard", "saved"],
    queryFn: () => userApi.saved(),
  });
  const [movingId, setMovingId] = useState<string | null>(null);

  async function moveToCollection(recipeId: string, collectionName: string) {
    if (!collectionName.trim()) return;
    await userApi.moveSaved(recipeId, collectionName.trim());
    queryClient.invalidateQueries({ queryKey: ["dashboard", "saved"] });
    setMovingId(null);
  }

  if (isLoading) return <RecipeGridSkeleton count={6} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" />;
  const entries = data?.data ?? [];

  if (entries.length === 0) {
    return (
      <EmptyState
        title="No Bookmarked Recipes"
        description="Bookmark recipes as you explore to organize them into custom collections."
        actionHref="/search"
        actionText="Explore Recipes"
      />
    );
  }

  const collections = Array.from(new Set(entries.map((e) => e.collectionName || "Saved")));

  return (
    <div className="space-y-10">
      {collections.map((collectionName) => {
        const group = entries.filter((e) => (e.collectionName || "Saved") === collectionName);
        return (
          <div key={collectionName} className="rounded-3xl border border-line/60 bg-paper/40 p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-line/60 pb-3">
              <FolderHeart className="h-4 w-4 text-plum" />
              <h2 className="font-display text-xl font-semibold italic text-ink">
                {collectionName}
              </h2>
              <span className="rounded-full bg-plum/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-plum">
                {group.length}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((entry) => (
                <div key={entry._id} className="relative flex flex-col justify-between">
                  <RecipeCard recipe={entry.recipe} />
                  
                  <div className="mt-2">
                    {movingId === entry.recipe._id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const input = e.currentTarget.elements.namedItem("collection") as HTMLInputElement;
                          moveToCollection(entry.recipe._id, input.value);
                        }}
                        className="flex items-center gap-1.5"
                      >
                        <input
                          name="collection"
                          autoFocus
                          defaultValue={collectionName}
                          placeholder="Collection name"
                          className="flex-1 rounded-xl border border-line bg-paper px-3 py-1 text-xs text-ink focus:border-plum focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="rounded-xl bg-plum px-3 py-1 text-xs font-semibold text-white shadow-sm"
                        >
                          Save
                        </button>
                      </form>
                    ) : (
                      <button
                        onClick={() => setMovingId(entry.recipe._id)}
                        className="text-xs font-medium text-ink/50 transition-colors hover:text-plum hover:underline"
                      >
                        Move to collection...
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LikedPanel() {
  const { data, isLoading } = useQuery<{ data: LikedRecipeEntry[] }>({
    queryKey: ["dashboard", "liked"],
    queryFn: () => userApi.liked(),
  });

  if (isLoading) return <RecipeGridSkeleton count={6} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" />;
  const entries = data?.data ?? [];

  if (entries.length === 0) {
    return (
      <EmptyState
        title="No Liked Recipes"
        description="Show appreciation to creators by hearting recipes you love."
        actionHref="/search"
        actionText="Browse Recipes"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <RecipeCard key={entry._id} recipe={entry.recipe} />
      ))}
    </div>
  );
}

const AI_TYPE_LABELS: Record<string, string> = {
  cooking_assistant: "Cooking Assistant",
  ingredient_substitute: "Ingredient Substitute",
  meal_plan: "Meal Plan",
  recipe_summary: "Recipe Summary",
  nutrition_explainer: "Nutrition Explainer",
  recommendation: "Recommendation",
};

function AIHistoryPanel() {
  const { data, isLoading } = useQuery<{ data: AIHistoryItem[] }>({
    queryKey: ["dashboard", "ai-history"],
    queryFn: () => aiApi.history(),
  });

  if (isLoading) return <ListSkeleton rows={3} />;
  const items = data?.data ?? [];

  if (items.length === 0) {
    return (
      <EmptyState
        title="No AI History"
        description="Interact with our culinary AI assistant for recipes, pantry recommendations, and nutritional tips."
        actionHref="/ai-tools"
        actionText="Ask AI Assistant"
      />
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item._id}
          className="rounded-3xl border border-line/60 bg-paper p-6 shadow-sm backdrop-blur-md"
        >
          <div className="flex items-center justify-between border-b border-line/60 pb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-plum/10 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-plum">
              <Sparkles className="h-3.5 w-3.5" />
              {AI_TYPE_LABELS[item.type] ?? item.type}
            </span>
            <span className="font-mono text-[11px] text-ink/40">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="mt-4 rounded-2xl bg-ink/5 p-3.5 text-xs text-ink/80">
            <span className="font-semibold text-ink">You Asked:</span> {item.prompt}
          </div>

          <p className="mt-3 whitespace-pre-line text-xs sm:text-sm leading-relaxed text-ink/80">
            {item.response}
          </p>
        </div>
      ))}
    </div>
  );
}

function NotificationsPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<{ data: Notification[] }>({
    queryKey: ["dashboard", "notifications"],
    queryFn: () => userApi.notifications(),
  });

  async function markRead(id: string) {
    await userApi.markNotificationRead(id);
    queryClient.invalidateQueries({ queryKey: ["dashboard", "notifications"] });
  }

  if (isLoading) return <ListSkeleton rows={4} />;
  const notifications = data?.data ?? [];

  if (notifications.length === 0) {
    return (
      <EmptyState
        title="All Caught Up!"
        description="You have no unread notifications at the moment."
      />
    );
  }

  return (
    <div className="space-y-2.5">
      {notifications.map((n) => (
        <button
          key={n._id}
          onClick={() => !n.isRead && markRead(n._id)}
          className={`group flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left text-xs sm:text-sm transition-all ${
            n.isRead
              ? "border-line/60 bg-paper/60 text-ink/60"
              : "border-plum/30 bg-plum/5 text-ink shadow-sm"
          }`}
        >
          <div className="flex items-center gap-3">
            {!n.isRead && <span className="h-2 w-2 rounded-full bg-plum animate-pulse" />}
            <span>{n.message}</span>
          </div>
          <span className="shrink-0 font-mono text-[11px] text-ink/40">
            {new Date(n.createdAt).toLocaleDateString()}
          </span>
        </button>
      ))}
    </div>
  );
}