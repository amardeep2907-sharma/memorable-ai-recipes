import en from "./en";
import hi from "./hi";
import type { Translations } from "./en";

export type Locale = "en" | "hi";

export const dictionaries: Record<Locale, Translations> = { en, hi };

export const LOCALE_LABELS: Record<Locale, string> = { en: "English", hi: "हिंदी" };

// Resolves a dotted key path ("nav.discover") against a dictionary and
// interpolates {placeholders} from vars. Falls back to the key itself if
// nothing matches, so a missing translation is visible/obvious rather than
// silently blank.
export function resolveKey(dict: Translations, key: string, vars?: Record<string, string | number>): string {
  const value = key.split(".").reduce<unknown>((obj, part) => {
    if (obj && typeof obj === "object" && part in obj) {
      return (obj as Record<string, unknown>)[part];
    }
    return undefined;
  }, dict);

  if (typeof value !== "string") return key;
  if (!vars) return value;

  return Object.entries(vars).reduce((str, [k, v]) => str.replace(`{${k}}`, String(v)), value);
}
