import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

const STATIC_ROUTES = ["", "/search", "/ai-tools", "/login", "/register", "/about", "/blog", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  // Best-effort: an unreachable API shouldn't break sitemap generation,
  // it should just ship the static routes.
  try {
    const [recipesRes, blogRes] = await Promise.all([
      fetch(`${API_URL}/recipes?limit=50&sort=recent`, { next: { revalidate: 3600 } }),
      fetch(`${API_URL}/blog?limit=50`, { next: { revalidate: 3600 } }),
    ]);

    const recipeEntries: MetadataRoute.Sitemap = recipesRes.ok
      ? (await recipesRes.json()).data.map((recipe: { _id: string; updatedAt?: string }) => ({
          url: `${SITE_URL}/recipes/${recipe._id}`,
          lastModified: recipe.updatedAt ? new Date(recipe.updatedAt) : new Date(),
        }))
      : [];

    const blogEntries: MetadataRoute.Sitemap = blogRes.ok
      ? (await blogRes.json()).data.map((post: { slug: string; publishedAt?: string }) => ({
          url: `${SITE_URL}/blog/${post.slug}`,
          lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
        }))
      : [];

    return [...staticEntries, ...recipeEntries, ...blogEntries];
  } catch {
    return staticEntries;
  }
}
