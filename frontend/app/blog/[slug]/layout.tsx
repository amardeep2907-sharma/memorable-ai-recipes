import type { Metadata } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`${API_URL}/blog/${params.slug}`, { next: { revalidate: 300 } });
    if (!res.ok) return { title: "Blog — Memorable" };
    const { data: post } = await res.json();
    return {
      title: `${post.title} — Memorable Blog`,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
      },
    };
  } catch {
    return { title: "Blog — Memorable" };
  }
}

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return children;
}
