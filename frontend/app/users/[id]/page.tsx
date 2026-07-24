"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  UserPlus,
  UserMinus,
  ChefHat,
  Sparkles,
  Search,
  BookOpen,
  Users,
  UserCheck,
  AlertCircle,
  ArrowUpDown,
} from "lucide-react";
import { userApi } from "@/lib/api";
import { PublicProfileResult } from "@/types/profile";
import { useAuth } from "@/context/AuthContext";
import RecipeCard from "@/components/RecipeCard";

export default function PublicProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: currentUser, isAuthenticated } = useAuth();

  const [pending, setPending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");

  const { data, isLoading } = useQuery<PublicProfileResult>({
    queryKey: ["profile", params.id],
    queryFn: () => userApi.getPublicProfile(params.id),
  });

  async function handleFollowToggle() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!data) return;

    const isFollowing = data.data.user.followers.includes(currentUser!._id);
    setPending(true);

    const previous = data;
    const followers = isFollowing
      ? data.data.user.followers.filter((id) => id !== currentUser!._id)
      : [...data.data.user.followers, currentUser!._id];

    queryClient.setQueryData<PublicProfileResult>(["profile", params.id], {
      data: { ...data.data, user: { ...data.data.user, followers } },
    });

    try {
      await (isFollowing ? userApi.unfollow(params.id) : userApi.follow(params.id));
    } catch {
      queryClient.setQueryData(["profile", params.id], previous);
    } finally {
      setPending(false);
    }
  }

  const { user, recipes } = data?.data || {};

  // Pure frontend search & sorting without touching backend APIs
  const filteredRecipes = useMemo(() => {
    if (!recipes) return [];
    let list = recipes.filter((recipe: any) =>
      recipe.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortBy === "oldest") {
      list = [...list].reverse();
    }
    return list;
  }, [recipes, searchQuery, sortBy]);

  // Loading Skeleton View
  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="animate-pulse space-y-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-2">
                <div className="h-6 w-40 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-60 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
            <div className="h-10 w-28 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="mt-12 space-y-4">
            <div className="h-8 w-32 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not Found View
  if (!data?.data || !user) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-950/30">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-xl font-bold">User Not Found</h2>
        <p className="mt-1 text-sm text-ink/60">
          The profile you are looking for doesn&apos;t exist or has been removed.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 rounded-full bg-plum px-6 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === user._id;
  const isFollowing = currentUser ? user.followers.includes(currentUser._id) : false;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Header Profile Section */}
      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-plum/5 via-transparent to-transparent p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* User Avatar with subtle Neumorphic shadow */}
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white text-3xl font-bold text-plum shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] dark:bg-slate-900 dark:shadow-[4px_4px_10px_#000000]">
              <span className="font-display italic">{user.name.charAt(0).toUpperCase()}</span>
              {isOwnProfile && (
                <span className="absolute bottom-0 right-0 rounded-full bg-plum p-1.5 text-white ring-2 ring-white">
                  <Sparkles className="h-3 w-3" />
                </span>
              )}
            </div>

            {/* Profile Info */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold italic tracking-tight sm:text-3xl">
                  {user.name}
                </h1>
                {isOwnProfile && (
                  <span className="rounded-full bg-plum/10 px-2.5 py-0.5 text-xs font-semibold text-plum">
                    You
                  </span>
                )}
              </div>

              {user.bio ? (
                <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-ink/70">
                  {user.bio}
                </p>
              ) : (
                <p className="mt-1.5 text-xs italic text-ink/40">No bio provided</p>
              )}

              {/* Stats Metrics Grid */}
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-1 text-xs font-medium text-ink/70 shadow-sm backdrop-blur dark:bg-slate-800">
                  <Users className="h-3.5 w-3.5 text-plum" />
                  <span>{user.followers.length} Followers</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-1 text-xs font-medium text-ink/70 shadow-sm backdrop-blur dark:bg-slate-800">
                  <UserCheck className="h-3.5 w-3.5 text-plum" />
                  <span>{user.following.length} Following</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-1 text-xs font-medium text-ink/70 shadow-sm backdrop-blur dark:bg-slate-800">
                  <BookOpen className="h-3.5 w-3.5 text-plum" />
                  <span>{recipes?.length || 0} Recipes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Follow Button Action */}
          {!isOwnProfile && (
            <button
              onClick={handleFollowToggle}
              disabled={pending}
              className={`inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 ${
                isFollowing
                  ? "border border-plum/40 bg-plum/5 text-plum hover:bg-plum/10"
                  : "bg-plum text-white shadow-md hover:bg-plum/90"
              }`}
            >
              {isFollowing ? (
                <>
                  <UserMinus className="mr-2 h-4 w-4" /> Following
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" /> Follow
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Recipes Section */}
      <div className="mt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold italic">
            <ChefHat className="h-5 w-5 text-plum" strokeWidth={2} /> Published Recipes
          </h2>

          {/* Search & Sort Controls (Frontend Only) */}
          {recipes && recipes.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/40" />
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-44 rounded-full border border-slate-200 bg-white/80 pl-8 pr-3 text-xs outline-none focus:border-plum dark:border-slate-800 dark:bg-slate-900 sm:w-56"
                />
              </div>

              <button
                onClick={() => setSortBy(sortBy === "latest" ? "oldest" : "latest")}
                className="inline-flex h-9 items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-3 text-xs font-medium text-ink/70 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
              >
                <ArrowUpDown className="h-3 w-3" />
                {sortBy === "latest" ? "Latest" : "Oldest"}
              </button>
            </div>
          )}
        </div>

        {/* Content Section */}
        {!recipes || recipes.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-12 text-center dark:border-slate-800">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-plum/10 text-plum">
              <ChefHat className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-medium text-ink/70">No published recipes yet</p>
            <p className="mt-1 text-xs text-ink/40">
              When {user.name} publishes recipes, they will show up here.
            </p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="mt-8 py-10 text-center text-sm text-ink/50">
            No recipes matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRecipes.map((recipe: any) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}