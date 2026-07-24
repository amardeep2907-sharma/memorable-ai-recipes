"use client";

import { ChefHat, Mail, Sparkles, CheckCircle2 } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import NewsletterForm from "@/components/NewsletterForm";

export default function NewsletterSection() {
  const { t } = useLocale();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Premium Outer Glass Box */}
      <div className="relative overflow-hidden rounded-3xl border border-line/60 bg-gradient-to-b from-plum/10 via-paper to-paper p-8 shadow-xl sm:p-12 lg:p-16">
        
        {/* Subtle Ambient Glow Effect */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-plum/20 blur-3xl" />
        
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          
          {/* Top Badge Tag */}
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-plum/20 bg-plum/10 px-3.5 py-1 text-xs font-semibold text-plum">
            <Mail className="h-3.5 w-3.5" />
            {t("home.newsletterBadge") ?? "Weekly Digest"}
          </span>

          {/* Section Icon with Soft Container */}
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-plum/10 text-plum shadow-inner">
            <ChefHat className="h-7 w-7" strokeWidth={1.75} />
          </div>

          {/* Heading */}
          <h2 className="font-display text-3xl italic font-semibold leading-tight text-ink sm:text-4xl lg:text-5xl">
            {t("home.newsletterTitle")}
          </h2>

          {/* Subtitle */}
          <p className="mt-3 text-sm text-ink/70 sm:text-base leading-relaxed">
            {t("home.newsletterSub")}
          </p>

          {/* Form Container */}
          <div className="mt-8 w-full max-w-md">
            <NewsletterForm />
          </div>

          {/* Trust / Benefit Badges below form */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-ink/50">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Weekly curated recipes
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              No spam ever
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Unsubscribe anytime
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}