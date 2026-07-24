"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { blogApi } from "@/lib/api";
import { BlogPost, BlogPostSummary } from "@/types/blog";
import Skeleton from "@/components/skeletons/Skeleton";
import { useAuth } from "@/context/AuthContext";
import {
  Pencil,
  Newspaper,
  ArrowLeft,
  Clock,
  Calendar,
  Share2,
  Sparkles,
  Check,
  BookOpen,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery<{ data: BlogPost }>({
    queryKey: ["blog", params.slug],
    queryFn: () => blogApi.getBySlug(params.slug),
  });

  const relatedQuery = useQuery<{ data: BlogPostSummary[] }>({
    queryKey: ["blog", "related", params.slug],
    queryFn: () => blogApi.list(),
    enabled: !!data?.data,
  });

  const relatedPosts = (relatedQuery.data?.data ?? [])
    .filter((p) => p.slug !== params.slug)
    .slice(0, 4);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <article className="lg:col-span-8">
            <Skeleton className="h-4 w-28 rounded-full" />
            <Skeleton className="mt-6 h-12 w-4/5 rounded-lg" />
            <Skeleton className="mt-6 aspect-[16/9] w-full rounded-3xl" />
            <div className="mt-8 space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full rounded" />
              ))}
            </div>
          </article>
          <aside className="lg:col-span-4">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <div className="mt-6 space-y-4">
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-28 w-full rounded-2xl" />
            </div>
          </aside>
        </div>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-plum/10 text-plum">
          <Newspaper className="h-8 w-8" />
        </div>
        <h2 className="mt-4 font-display text-2xl italic text-ink">Post Not Found</h2>
        <p className="mt-2 text-sm text-ink/60">
          The article you are looking for might have been moved or removed.
        </p>
        <Link
          href="/blog"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-plum px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-transform hover:scale-105"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Articles
        </Link>
      </div>
    );
  }

  const post = data.data;

  // Defensive Image URL Check (Backend me key 'coverImage' ya 'coverImageUrl' dono ho sakti hai)
  const coverImageSrc =
    (post as any).coverImage ||
    post.coverImageUrl ||
    (post as any).imageUrl ||
    null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Action Bar */}
      <div className="mb-8 flex items-center justify-between border-b border-line/60 pb-4">
        <Link
          href="/blog"
          className="group inline-flex items-center gap-2 text-xs font-medium text-ink/60 transition-colors hover:text-plum"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Articles
        </Link>

        <div className="flex items-center gap-3">
          {user?._id === post.author?._id && (
            <Link
              href={`/blog/${post.slug}/edit`}
              className="inline-flex items-center gap-1.5 rounded-full bg-plum/10 px-3.5 py-1.5 text-xs font-semibold text-plum transition-all hover:bg-plum hover:text-white"
            >
              <Pencil className="h-3 w-3" /> Edit Article
            </Link>
          )}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink/70 transition-all hover:bg-plum/10 hover:text-plum"
            title="Share Article"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied!
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" /> Share
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout (Article Left, Related Posts Right) */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Left Main Article Column */}
        <article className="lg:col-span-8">
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-plum/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-plum"
                >
                  <Sparkles className="h-2.5 w-2.5" /> {tag}
                </span>
              ))}
            </div>
          )}

          {/* Post Title */}
          <h1 className="mt-4 font-display text-3xl font-semibold italic leading-tight text-ink sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>

          {/* Summary / Excerpt */}
          {(post.summary || post.excerpt) && (
            <p className="mt-4 text-base leading-relaxed text-ink/75 sm:text-lg">
              {post.summary || post.excerpt}
            </p>
          )}

          {/* Author Metadata Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-card/50 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-line bg-line">
                <Image
                  src={
                    post.author?.avatarUrl ||
                    `https://i.pravatar.cc/150?u=${post.author?._id || "author"}`
                  }
                  alt={post.author?.name || "Author"}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-ink">
                  {post.author?.name || "Editorial Team"}
                </p>
                <p className="text-[11px] text-ink/50">Culinary Specialist</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-ink/60">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-plum" />
                {new Date(post.publishedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-plum" />
                {post.readTimeMinutes || 6} min read
              </span>
            </div>
          </div>

          {/* Main Cover Image */}
          {coverImageSrc && (
            <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-3xl border border-line/80 bg-line shadow-lg">
              <Image
                src={coverImageSrc}
                alt={post.title}
                fill
                priority
                className="object-cover transition-transform duration-700 hover:scale-102"
              />
            </div>
          )}

          {/* Styled Article Content Body */}
          <div className="mt-10 border-t border-line/40 pt-8 text-ink/90">
            <div className="prose prose-plum max-w-none text-[16px] leading-8 text-ink/85 sm:text-[17px]
              [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:italic [&_h2]:text-ink [&_h2]:border-b [&_h2]:border-line/40 [&_h2]:pb-2
              [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:italic [&_h3]:text-ink
              [&_p]:mb-5 [&_p]:leading-relaxed
              [&_strong]:font-semibold [&_strong]:text-ink
              [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2
              [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2
              [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-plum [&_blockquote]:bg-plum/5 [&_blockquote]:px-5 [&_blockquote]:py-3.5 [&_blockquote]:italic [&_blockquote]:rounded-r-xl [&_blockquote]:text-ink/90
              [&_table]:my-6 [&_table]:w-full [&_table]:overflow-x-auto [&_table]:rounded-xl [&_table]:border [&_table]:border-line [&_th]:bg-plum/5 [&_th]:p-3 [&_th]:text-left [&_th]:font-semibold [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider [&_td]:border-t [&_td]:border-line/60 [&_td]:p-3 [&_td]:text-sm
              [&_hr]:my-8 [&_hr]:border-line/60
              whitespace-pre-line">
              {post.content}
            </div>
          </div>

          {/* Author Footer Card */}
          <div className="mt-14 rounded-3xl border border-line bg-gradient-to-br from-plum/5 via-paper to-paper p-6 shadow-sm">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-plum/30">
                <Image
                  src={
                    post.author?.avatarUrl ||
                    `https://i.pravatar.cc/150?u=${post.author?._id || "author"}`
                  }
                  alt={post.author?.name || "Author"}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold italic text-ink">
                  Written by {post.author?.name || "Memorable Editorial Team"}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-ink/70">
                  {post.author?.bio ||
                    "Passionate about culinary traditions, food chemistry, and weeknight recipes."}
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Right Sidebar Column (Related Articles) */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-3xl border border-line/80 bg-paper p-6 shadow-sm">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold italic text-ink border-b border-line/60 pb-3">
                <Newspaper className="h-4 w-4 text-plum" />
                {t("blog.relatedPosts") || "Related Articles"}
              </h2>

              {relatedPosts.length === 0 ? (
                <p className="mt-4 text-xs text-ink/50">No related posts found.</p>
              ) : (
                <div className="mt-5 space-y-4">
                  {relatedPosts.map((related) => {
                    const relImage =
                      (related as any).coverImage ||
                      related.coverImageUrl ||
                      (related as any).imageUrl ||
                      null;

                    return (
                      <Link
                        key={related._id}
                        href={`/blog/${related.slug}`}
                        className="group flex items-start gap-3 rounded-2xl border border-line/40 bg-card p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-plum/40 hover:shadow-md"
                      >
                        {/* Thumbnail */}
                        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-line">
                          {relImage ? (
                            <Image
                              src={relImage}
                              alt={related.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-plum/10 text-[10px] text-plum">
                              <BookOpen className="h-4 w-4" />
                            </div>
                          )}
                        </div>

                        {/* Title & Info */}
                        <div className="flex flex-1 flex-col justify-between">
                          <h3 className="line-clamp-2 font-display text-xs font-semibold italic leading-snug text-ink transition-colors group-hover:text-plum">
                            {related.title}
                          </h3>
                          <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-ink/40">
                            <span>{related.readTimeMinutes || 5} min</span>
                            <span className="text-plum group-hover:underline">Read →</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Back to All Articles Card */}
            <div className="rounded-3xl border border-plum/20 bg-gradient-to-br from-plum/10 via-paper to-paper p-5 text-center">
              <h4 className="font-display text-sm font-semibold italic text-ink">
                Explore Culinary Journal
              </h4>
              <p className="mt-1 text-[11px] text-ink/60">
                Discover more recipes, guides, and kitchen notes from our community.
              </p>
              <Link
                href="/blog"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-plum px-4 py-2 text-xs font-semibold text-white shadow-sm transition-transform hover:scale-105"
              >
                Browse All Articles
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}