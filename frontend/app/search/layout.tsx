import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search recipes — Memorable",
  description: "Search recipes by name, ingredient, cuisine, or diet — or ask the AI cooking assistant.",
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
