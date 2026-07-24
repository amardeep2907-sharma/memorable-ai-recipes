"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  Newspaper,
  Plus,
  Sparkles,
  ArrowRight,
  Clock,
  Calendar,
  BookOpen,
} from "lucide-react";
import { blogApi } from "@/lib/api";
import { BlogPostSummary } from "@/types/blog";
import RecipeGridSkeleton from "@/components/skeletons/RecipeGridSkeleton";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";

export default function BlogPage() {
  const { isAuthenticated } = useAuth();
  const { t } = useLocale();

  const { data, isLoading } = useQuery<{ data: BlogPostSummary[] }>({
    queryKey: ["blog"],
    queryFn: () => blogApi.list(),
  });

  const posts = data?.data ?? [];
  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-line/60 bg-gradient-to-b from-plum/10 via-paper to-paper p-6 shadow-xl sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-plum/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-12 h-64 w-64 rounded-full bg-plum/5 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-plum/20 bg-plum/10 px-3.5 py-1 text-xs font-semibold text-plum">
              <Newspaper className="h-3.5 w-3.5" />
              {t("blog.title") ?? "Culinary Journal"}
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold italic text-ink sm:text-4xl lg:text-5xl">
              {t("blog.heading") ?? "Stories, Guides & Kitchen Notes"}
            </h1>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-ink/70 sm:text-sm">
              Discover professional cooking techniques, ingredient deep-dives,
              seasonal recommendations, and notes from our global community.
            </p>
          </div>

          {isAuthenticated && (
            <Link
              href="/blog/write"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-plum px-6 py-3 text-xs font-semibold text-white shadow-md transition-all hover:scale-105 hover:bg-plum/90 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>{t("blog.writePost") ?? "Write Article"}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Blog Workspace */}
      <div className="mt-10">
        {/* Loading Skeletons */}
        {isLoading && (
          <RecipeGridSkeleton
            count={6}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          />
        )}

        {/* Empty State */}
        {!isLoading && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-line/60 bg-paper/60 p-12 text-center shadow-sm">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-plum/10 text-plum">
              <Sparkles className="h-7 w-7" />
            </div>
            <h3 className="font-display text-xl font-semibold italic text-ink">
              No articles published yet
            </h3>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-ink/60">
              {t("blog.noPosts") ??
                "Be the first home chef to share a culinary guide with our community!"}
            </p>
            {isAuthenticated && (
              <Link
                href="/blog/write"
                className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-plum px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-plum/90"
              >
                <Plus className="h-4 w-4" /> Write First Article
              </Link>
            )}
          </div>
        )}

        {/* Posts Render */}
        {!isLoading && posts.length > 0 && (
          <div className="space-y-12">
            {/* Featured Article Banner (First Post) */}
            {featuredPost && (
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="group relative grid grid-cols-1 overflow-hidden rounded-3xl border border-line/60 bg-paper p-4 shadow-md transition-all duration-500 hover:-translate-y-1 hover:border-plum/40 hover:shadow-xl lg:grid-cols-12 lg:gap-8 lg:p-6"
              >
                {/* Cover Image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-line/40 lg:col-span-7 lg:aspect-[16/10]">
                  {(featuredPost as any).coverImage || featuredPost.coverImageUrl ? (
                    <Image
                      src={
                        (featuredPost as any).coverImage ||
                        featuredPost.coverImageUrl ||
                        ""
                      }
                      alt={featuredPost.title}
                      fill
                      priority
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-plum/5 font-display text-lg italic text-plum/40">
                      Featured Cover
                    </div>
                  )}
                  <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-paper/85 px-3.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-plum shadow-sm backdrop-blur-md">
                    Featured Story
                  </span>
                </div>

                {/* Content Details */}
                <div className="flex flex-col justify-between p-4 lg:col-span-5 lg:py-2 lg:pr-2">
                  <div>
                    <div className="mb-3 flex items-center gap-3 font-mono text-xs text-ink/50">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-plum" />
                        {new Date(featuredPost.publishedAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-plum" />
                        {(featuredPost as any).readTimeMinutes || 6} min read
                      </span>
                    </div>

                    <h2 className="font-display text-2xl font-semibold italic leading-tight text-ink transition-colors group-hover:text-plum sm:text-3xl">
                      {featuredPost.title}
                    </h2>

                    <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-ink/70 sm:text-sm">
                      {(featuredPost as any).summary || (featuredPost as any).excerpt}
                    </p>
                  </div>

                  {/* Author & CTA Footer */}
                  <div className="mt-6 flex items-center justify-between border-t border-line/40 pt-4">
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-8 w-8 overflow-hidden rounded-full border border-line bg-line">
                        <Image
                          src={
                            featuredPost.author?.avatarUrl ||
                            `https://i.pravatar.cc/150?u=${featuredPost.author?._id || "author"}`
                          }
                          alt={featuredPost.author?.name || "Author"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-xs font-medium text-ink">
                        {featuredPost.author?.name || "Editorial Team"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-plum">
                      <span>Read Story</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Remaining Articles Grid */}
            {remainingPosts.length > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {remainingPosts.map((post) => {
                  const coverSrc =
                    (post as any).coverImage || post.coverImageUrl || "";
                  const postExcerpt =
                    (post as any).summary || (post as any).excerpt;
                  const readTime = (post as any).readTimeMinutes || 5;

                  return (
                    <Link
                      key={post._id}
                      href={`/blog/${post.slug}`}
                      className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-line/60 bg-paper transition-all duration-300 hover:-translate-y-1.5 hover:border-plum/30 hover:shadow-xl hover:shadow-plum/5"
                    >
                      <div>
                        {/* Thumbnail Cover */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-line/40">
                          {coverSrc ? (
                            <Image
                              src={coverSrc}
                              alt={post.title}
                              fill
                              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-plum/5 font-display text-sm italic text-plum/40">
                              No Cover
                            </div>
                          )}

                          <div className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 font-mono text-[10px] text-white backdrop-blur-md">
                            {readTime} min read
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-5">
                          <div className="mb-2 flex items-center gap-2 font-mono text-[11px] text-ink/50">
                            <span>
                              {new Date(post.publishedAt).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                            {post.author?.name && (
                              <>
                                <span>•</span>
                                <span className="line-clamp-1">
                                  {post.author.name}
                                </span>
                              </>
                            )}
                          </div>

                          <h3 className="line-clamp-2 font-display text-xl font-semibold italic leading-snug text-ink transition-colors group-hover:text-plum">
                            {post.title}
                          </h3>

                          {postExcerpt && (
                            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink/70">
                              {postExcerpt}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Footer Row */}
                      <div className="flex items-center justify-between border-t border-line/40 px-5 py-3.5 text-xs font-semibold text-plum">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5" /> Read Article
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
