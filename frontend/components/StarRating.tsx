"use client";

import { useState } from "react";
import { Star } from "lucide-react";

// Read-only display: pass `value` (can be a fractional average) only.
// Interactive: pass `onChange` too - renders clickable, hoverable stars.
export default function StarRating({
  value,
  onChange,
  size = "h-4 w-4",
}: {
  value: number;
  onChange?: (rating: number) => void;
  size?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const interactive = !!onChange;
  const display = hovered ?? value;

  return (
    <div
      className="flex items-center gap-0.5"
      onMouseLeave={() => setHovered(null)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= Math.round(display);

        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => interactive && setHovered(star)}
            className={`transition-transform duration-150 ${
              interactive
                ? "cursor-pointer hover:scale-115 active:scale-95 focus:outline-none"
                : "cursor-default"
            }`}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              className={`${size} transition-colors duration-200 ${
                isFilled
                  ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                  : "fill-ink/5 text-line/80 hover:text-amber-300"
              }`}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
}