import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI sous-chef — Memorable",
  description: "Cooking assistant, ingredient substitutes, meal planning, and more, powered by AI.",
};

export default function AIToolsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
