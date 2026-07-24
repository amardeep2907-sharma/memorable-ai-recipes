"use client";

import { Languages } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  const isHindi = locale === "hi";

  return (
    <div className="flex items-center gap-2 rounded-full border border-line/80 bg-paper/90 px-2 py-1 shadow-sm backdrop-blur-md">
      <Languages className="h-3.5 w-3.5 text-plum" />

      <button
        onClick={() => setLocale(isHindi ? "en" : "hi")}
        aria-label="Toggle language"
        className={`relative h-5 w-9 rounded-full transition-colors duration-300 ${
          isHindi ? "bg-plum" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ${
            isHindi ? "translate-x-4.5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}