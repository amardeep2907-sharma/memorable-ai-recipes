import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChefHat, Sparkles, Users, Heart, ArrowRight, Newspaper, Search, MessageCircle } from "lucide-react";
import { BlogPostSummary } from "@/types/blog";
import { FeaturedCreator } from "@/types/admin-extra";

export const metadata: Metadata = {
  title: "About us — Memorable",
  description: "Why we built Memorable: real recipes, a real community, and an AI that actually helps you cook.",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

// Same pattern as the homepage's rails: best-effort server-side fetch that
// degrades to an empty state rather than breaking the page if the API is
// unreachable.
async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const VALUES = [
  {
    icon: ChefHat,
    title: "Real recipes, real cooks",
    copy: "Every recipe on Memorable either comes from our library or was published by someone who actually cooked it. No content farms, no recycled listicles.",
  },
  {
    icon: Sparkles,
    title: "AI that assists, not replaces",
    copy: "Our AI assistant helps you use what's already in your kitchen, plan a week of meals, or understand nutrition facts — it's a tool for cooking more, not a substitute for it.",
  },
  {
    icon: Users,
    title: "Built around a community",
    copy: "Follow the cooks whose food you love, save recipes into your own collections, and see what your kitchen circle is making next.",
  },
  {
    icon: Heart,
    title: "Food worth remembering",
    copy: "The best recipes are the ones you come back to. Memorable is built to help you find those, keep them, and share them.",
  },
];

const PILLARS = [
  { icon: Search, title: "Discover", copy: "Search a growing library of real recipes.", href: "/search" },
  { icon: Sparkles, title: "Ask AI", copy: "Get suggestions from what's in your kitchen.", href: "/ai-tools" },
  { icon: Users, title: "Follow", copy: "Keep up with the cooks you love.", href: "/feed" },
  { icon: Newspaper, title: "Read", copy: "Stories and tips from the community.", href: "/blog" },
];

export default async function AboutPage() {
  const [recipesMeta, blogRes, creatorsRes] = await Promise.all([
    fetchJson<{ meta: { total: number } }>("/recipes?limit=1"),
    fetchJson<{ data: BlogPostSummary[] }>("/blog?limit=3"),
    fetchJson<{ data: FeaturedCreator[] }>("/users/featured"),
  ]);

  const recipeCount = recipesMeta?.meta?.total ?? 0;
  const posts = blogRes?.data ?? [];
  const creators = creatorsRes?.data ?? [];

  return (
    <div>
      {/* Hero - same ingredient-texture motif as the homepage, for brand
          consistency, plus a live stat pulled from the real recipe count. */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 flex flex-wrap content-start gap-3 p-8 opacity-[0.10]">
          {["mission", "community", "cooking", "AI", "recipes", "kitchen", "share", "discover", "taste", "memory"].map((w) => (
            <span key={w} className="font-mono text-xs uppercase tracking-widest text-ink">{w}</span>
          ))}
        </div>
        <div className="relative mx-auto max-w-3xl px-6 py-24">
          <p className="font-mono text-xs uppercase tracking-widest text-plum">About us</p>
          <h1 className="mt-3 font-display text-5xl italic leading-[1.05] sm:text-6xl">
            Cooking is better
            <br />
            when it's shared.
          </h1>
          <p className="mt-6 max-w-xl text-ink/70">
            Memorable started from a simple frustration: most recipe sites are built for search engines,
            not for cooks. We wanted a place that combined a real recipe library with the people actually
            using it — and an AI that helps you cook with what's already in your kitchen, instead of
            sending you out for one more ingredient.
          </p>
          {recipeCount > 0 && (
            <p className="mt-8 font-mono text-sm text-ink/50">
              <span className="text-2xl text-plum">{recipeCount.toLocaleString()}</span> recipes and counting
            </p>
          )}
        </div>
      </section>

      {/* Four pillars - directly ties the "about" story to the actual
          product surfaces, including the blog. */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {PILLARS.map(({ icon: Icon, title, copy, href }) => (
            <Link key={title} href={href} className="card p-5 transition-transform hover:-translate-y-0.5">
              <Icon className="h-5 w-5 text-plum" strokeWidth={1.75} />
              <h3 className="mt-3 font-display text-lg">{title}</h3>
              <p className="mt-1 text-xs text-ink/60">{copy}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Values - numbered like a recipe card's steps, tying into the
          site's "index card" motif. */}
      <section className="border-y border-line bg-white/40">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="font-display text-2xl italic">What we care about</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {VALUES.map(({ icon: Icon, title, copy }, i) => (
              <div key={title} className="flex gap-4">
                <span className="font-mono text-xs text-plum">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-plum" strokeWidth={1.75} />
                    <h3 className="font-display text-lg">{title}</h3>
                  </div>
                  <p className="mt-1 text-sm text-ink/65">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest from the blog - real, live posts, not a static mention. */}
      {posts.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex items-baseline justify-between">
            <h2 className="flex items-center gap-2 font-display text-2xl italic">
              <Newspaper className="h-5 w-5 text-plum" strokeWidth={1.75} /> Latest from the blog
            </h2>
            <Link href="/blog" className="text-sm text-plum hover:underline">Read the blog</Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {posts.map((post) => (
              <Link key={post._id} href={`/blog/${post.slug}`} className="card group block overflow-hidden">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-line">
                  {post.coverImageUrl && (
                    <Image
                      src={post.coverImageUrl}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-display text-base leading-snug">{post.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-ink/60">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured creators - puts real people behind the "community" value. */}
      {creators.length > 0 && (
        <section className="border-t border-line bg-white/40">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <h2 className="flex items-center gap-2 font-display text-2xl italic">
              <Users className="h-5 w-5 text-plum" strokeWidth={1.75} /> Cooked up by the community
            </h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {creators.map((creator) => (
                <Link
                  key={creator._id}
                  href={`/users/${creator._id}`}
                  className="card flex items-center gap-2 px-3 py-2 transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-plum/10 font-display text-sm italic text-plum">
                    {creator.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm">{creator.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Closing CTA */}
      <section className="mx-auto max-w-2xl px-6 py-20 text-center">
        <p className="font-display text-2xl italic">Have a question, a bug to report, or feedback?</p>
        <p className="mt-2 text-sm text-ink/60">We'd genuinely like to hear it.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/contact" className="btn-primary">
            Get in touch <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
          <Link href="/blog" className="btn-secondary">
            <MessageCircle className="mr-1.5 h-4 w-4" /> Read the blog
          </Link>
        </div>
      </section>
    </div>
  );
}
