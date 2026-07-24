export type Season = "Spring" | "Summer" | "Autumn" | "Winter";
export type Hemisphere = "northern" | "southern";

// Meteorological seasons (not astronomical) - simpler month-boundary logic,
// close enough for a "what's in season" recommendation feature.
// We have no reliable signal for which hemisphere a visitor is in (no
// location data is collected anywhere in this app), so this defaults to
// northern and accepts an explicit override for callers that somehow know
// better. This is a known simplification, documented here rather than
// silently assumed.
export function getCurrentSeason(date: Date = new Date(), hemisphere: Hemisphere = "northern"): Season {
  const month = date.getMonth(); // 0 = January

  const northernSeason: Season =
    month === 11 || month <= 1 ? "Winter" :
    month <= 4 ? "Spring" :
    month <= 7 ? "Summer" :
    "Autumn";

  if (hemisphere === "northern") return northernSeason;

  const opposite: Record<Season, Season> = {
    Winter: "Summer",
    Summer: "Winter",
    Spring: "Autumn",
    Autumn: "Spring",
  };
  return opposite[northernSeason];
}
