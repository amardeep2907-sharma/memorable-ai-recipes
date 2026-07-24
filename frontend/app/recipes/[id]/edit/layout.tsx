import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit recipe — Memorable",
  robots: { index: false, follow: false },
};

export default function EditRecipeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
