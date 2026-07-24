import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatMinutes(total: number): string {
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  const units: [number, string][] = [
    [60, "s"], [60, "m"], [24, "h"], [7, "d"], [4.35, "w"], [12, "mo"], [Infinity, "y"],
  ];
  let value = seconds;
  for (const [step, label] of units) {
    if (value < step) return `${Math.max(1, Math.floor(value))}${label} ago`;
    value = value / step;
  }
  return dateStr;
}

export type Season = "Spring" | "Summer" | "Autumn" | "Winter";

// Mirrors backend/src/utils/season.ts - kept in sync manually since the two
// codebases don't share code. Defaults to Northern Hemisphere; there's no
// location data collected anywhere in this app to do better than that.
export function getCurrentSeason(date: Date = new Date()): Season {
  const month = date.getMonth();
  if (month === 11 || month <= 1) return "Winter";
  if (month <= 4) return "Spring";
  if (month <= 7) return "Summer";
  return "Autumn";
}
