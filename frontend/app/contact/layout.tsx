import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact us — Memorable",
  description: "Question, bug report, or feedback for the Memorable team.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
