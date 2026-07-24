import type { Metadata } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

// A server-only layout wrapping the client recipe-detail page below - this
// is how dynamic per-recipe <title>/<meta description> get generated
// without having to turn the interactive page itself into a server
// component (Next.js merges layout metadata with the page it wraps).
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`${API_URL}/recipes/${params.id}`, { next: { revalidate: 60 } });
    if (!res.ok) return { title: "Recipe — Memorable" };
    const { data: recipe } = await res.json();
    return {
      title: `${recipe.title} — Memorable`,
      description: recipe.description || `A ${recipe.cuisine?.[0] ?? ""} recipe on Memorable.`,
      openGraph: {
        title: recipe.title,
        description: recipe.description,
        images: recipe.imageUrl ? [recipe.imageUrl] : undefined,
      },
    };
  } catch {
    return { title: "Recipe — Memorable" };
  }
}

export default function RecipeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
