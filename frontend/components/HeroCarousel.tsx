"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowUpRight, Sparkles } from "lucide-react";

interface Slide {
  imageUrl: string;
  eyebrow: string;
  title: string;
  ctaLabel: string;
  ctaHref: string;
}

const SLIDES: Slide[] = [
  {
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80&auto=format&fit=crop",
    eyebrow: "Fresh & Vibrant",
    title: "Salads worth building a full meal around",
    ctaLabel: "Explore healthy recipes",
    ctaHref: "/search?query=salad",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1600&q=80&auto=format&fit=crop",
    eyebrow: "Weekend Favorite",
    title: "Artisanal pizza night, done right at home",
    ctaLabel: "Find pizza recipes",
    ctaHref: "/search?query=pizza",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1600&q=80&auto=format&fit=crop",
    eyebrow: "Spice It Up",
    title: "Rich curries from every corner of the world",
    ctaLabel: "Discover curry recipes",
    ctaHref: "/search?query=curry",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1600&q=80&auto=format&fit=crop",
    eyebrow: "Handheld & Fast",
    title: "Ten-minute weeknight gourmet tacos",
    ctaLabel: "Get quick recipes",
    ctaHref: "/search?query=tacos",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1600&q=80&auto=format&fit=crop",
    eyebrow: "Ask the AI",
    title: "Not sure what to cook tonight? Just ask.",
    ctaLabel: "Try AI assistant",
    ctaHref: "/ai-tools",
  },
];

const AUTO_ADVANCE_MS = 5000;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [broken, setBroken] = useState<Record<number, boolean>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused]);

  function goTo(i: number) {
    setIndex((i + SLIDES.length) % SLIDES.length);
  }

  return (
    
    <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden">
      <div
        className="group relative h-[32rem] w-full bg-ink sm:h-[40rem] lg:h-[46rem]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {SLIDES.map((slide, i) => (
          <div
            key={slide.imageUrl}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              i === index ? "scale-100 opacity-100" : "pointer-events-none scale-105 opacity-0"
            }`}
          >
            {!broken[i] ? (
              <Image
                src={slide.imageUrl}
                alt={slide.title}
                fill
                priority={i === 0}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                onError={() => setBroken((b) => ({ ...b, [i]: true }))}
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-plum/40 via-ink to-amber-900/30" />
            )}

            {/* Gradient Overlays for readable text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 sm:bg-gradient-to-r sm:from-black/85 sm:via-black/40 sm:to-transparent" />

            {/* Content Container aligned nicely inside the full width */}
            <div className="absolute inset-0 mx-auto flex max-w-7xl flex-col justify-end p-6 sm:p-12 lg:p-16">
              <div className="sm:max-w-2xl">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/20 px-3.5 py-1 font-mono text-xs font-semibold tracking-wider text-white backdrop-blur-md">
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    {slide.eyebrow}
                  </span>
                </div>

                <h2 className="font-display text-3xl italic font-medium leading-tight text-white sm:text-5xl lg:text-6xl tracking-tight">
                  {slide.title}
                </h2>

                <div className="mt-6">
                  <Link
                    href={slide.ctaHref}
                    className="inline-flex items-center gap-2 rounded-full bg-paper px-6 py-3.5 text-xs font-semibold text-ink shadow-xl backdrop-blur transition-all duration-200 hover:bg-plum hover:text-white hover:scale-105 active:scale-95"
                  >
                    <span>{slide.ctaLabel}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Floating Controls (Left / Right Arrows) */}
        <button
          onClick={() => goTo(index - 1)}
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition-all hover:bg-white hover:text-ink active:scale-90 sm:left-8"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => goTo(index + 1)}
          aria-label="Next slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition-all hover:bg-white hover:text-ink active:scale-90 sm:right-8"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Bottom Progress Bars */}
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 z-10">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.imageUrl}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}