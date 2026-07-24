"use client";

import Link from "next/link";
import { ArrowUpRight, Clock, Dumbbell, HeartHandshake, Leaf } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

interface MoodConfig {
  key: string;
  icon: React.ElementType;
  gradient: string;
  accentColor: string;
  description: string;
}

const MOOD_DATA: MoodConfig[] = [
  {
    key: "moodWeeknight",
    icon: Clock,
    gradient: "from-amber-500/15 via-orange-500/5 to-transparent",
    accentColor: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    description: "Ready in under 30 minutes",
  },
  {
    key: "moodHighProtein",
    icon: Dumbbell,
    gradient: "from-blue-500/15 via-indigo-500/5 to-transparent",
    accentColor: "text-blue-600 bg-blue-500/10 border-blue-500/20",
    description: "Fuel your day with power",
  },
  {
    key: "moodComfort",
    icon: HeartHandshake,
    gradient: "from-rose-500/15 via-pink-500/5 to-transparent",
    accentColor: "text-rose-600 bg-rose-500/10 border-rose-500/20",
    description: "Warm, cozy & delicious",
  },
  {
    key: "moodPlantBased",
    icon: Leaf,
    gradient: "from-emerald-500/15 via-teal-500/5 to-transparent",
    accentColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    description: "Fresh & wholesome green eats",
  },
];

export default function BrowseByMood() {
  const { t } = useLocale();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <span className="text-xs font-semibold tracking-widest text-plum uppercase">
            Curated Collections
          </span>
          <h2 className="font-display text-3xl italic tracking-tight text-ink sm:text-4xl">
            {t("home.browseByMood")}
          </h2>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MOOD_DATA.map((mood) => {
          const label = t(`home.${mood.key}`);
          const Icon = mood.icon;

          return (
            <Link
              key={mood.key}
              href={`/search?query=${encodeURIComponent(label)}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-line/60 bg-paper p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-plum/40 hover:shadow-xl hover:shadow-plum/5"
            >
              {/* Dynamic Mood Background Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${mood.gradient} opacity-60 transition-opacity duration-300 group-hover:opacity-100`}
              />

              {/* Card Header: Icon & Hover CTA */}
              <div className="relative z-10 flex items-center justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${mood.accentColor} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Floating Arrow Badge */}
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 text-ink/60 transition-all duration-300 group-hover:bg-plum group-hover:text-white group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>

              {/* Card Bottom: Content Label & Subtext */}
              <div className="relative z-10 mt-8">
                <h3 className="font-display text-xl italic font-semibold text-ink transition-colors group-hover:text-plum">
                  {label}
                </h3>
                <p className="mt-1 text-xs text-ink/60 font-medium">
                  {mood.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}