import type { Metadata } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`${API_URL}/users/${params.id}`, { next: { revalidate: 300 } });
    if (!res.ok) return { title: "Profile — Memorable" };
    const { data } = await res.json();
    return {
      title: `${data.user.name} — Memorable`,
      description: data.user.bio || `${data.user.name}'s recipes on Memorable.`,
    };
  } catch {
    return { title: "Profile — Memorable" };
  }
}

export default function UserProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
