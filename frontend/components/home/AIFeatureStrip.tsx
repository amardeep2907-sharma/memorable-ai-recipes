"use client";

import Link from "next/link";
import { Sparkles, Wand2, UtensilsCrossed, ArrowRight } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

interface AIFeatureConfig {
  key: string;
  icon: React.ElementType;
  tag: string;
}

const FEATURE_CONFIGS: AIFeatureConfig[] = [
  {
    key: "aiFeature1",
    icon: Wand2,
    tag: "Smart Match",
  },
  {
    key: "aiFeature2",
    icon: UtensilsCrossed,
    tag: "Pantry AI",
  },
  {
    key: "aiFeature3",
    icon: Sparkles,
    tag: "Nutritionist",
  },
];

export default function AIFeatureStrip() {
  const { t } = useLocale();

  return (
    <section className="relative overflow-hidden border-y border-line/60 bg-gradient-to-b from-plum/5 via-paper to-paper py-16 sm:py-20">
      {/* Background Ambient Glow FX */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-plum/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 flex flex-col items-center text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-plum/20 bg-plum/10 px-3.5 py-1 text-xs font-semibold text-plum">
            <Sparkles className="h-3.5 w-3.5" />
            {t("home.aiFeatureLabel")}
          </span>
          <h2 className="font-display text-3xl italic tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Powered by Next-Gen Cooking Intelligence
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURE_CONFIGS.map(({ key, icon: Icon, tag }) => (
            <div
              key={key}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-line/60 bg-paper/80 p-8 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-plum/40 hover:shadow-xl hover:shadow-plum/5"
            >
              <div>
                {/* Top Icon Badge */}
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-plum/10 text-plum transition-transform duration-300 group-hover:scale-110 group-hover:bg-plum group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink/40">
                    {tag}
                  </span>
                </div>

                {/* Title & Copy */}
                <h3 className="font-display text-xl font-semibold italic text-ink transition-colors group-hover:text-plum">
                  {t(`home.${key}Title`)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">
                  {t(`home.${key}Copy`)}
                </p>
              </div>

              {/* Bottom Subtle Action Link */}
              <div className="mt-8 pt-4 border-t border-line/40">
                <Link
                  href="/ai-tools"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-plum hover:underline"
                >
                  <span>Explore AI Tool</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}