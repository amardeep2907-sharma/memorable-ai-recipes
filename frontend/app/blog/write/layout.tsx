import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Write a post — Memorable",
  robots: { index: false, follow: false },
};

export default function WriteBlogPostLayout({ children }: { children: React.ReactNode }) {
  return children;
}
