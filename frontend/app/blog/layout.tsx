import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Memorable",
  description: "Cooking tips, ingredient deep-dives, and notes from the Memorable team.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
