import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meal plan — Memorable",
  robots: { index: false, follow: false },
};

export default function MealPlanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
