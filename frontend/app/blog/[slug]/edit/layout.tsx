import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit post — Memorable",
  robots: { index: false, follow: false },
};

export default function EditBlogPostLayout({ children }: { children: React.ReactNode }) {
  return children;
}
