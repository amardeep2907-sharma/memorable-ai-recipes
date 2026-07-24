import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

const BASE_URL = "https://api.spoonacular.com/recipes";

async function spoonacularFetch<T>(path: string, params: Record<string, string | number | undefined>): Promise<T> {
  if (!env.spoonacularApiKey) throw ApiError.internal("SPOONACULAR_API_KEY is not configured");

  const query = new URLSearchParams({
    apiKey: env.spoonacularApiKey,
    ...Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]),
  });

  const res = await fetch(`${BASE_URL}${path}?${query.toString()}`);
  if (!res.ok) throw new ApiError(res.status, `Spoonacular request failed: ${res.statusText}`);
  return (await res.json()) as T;
}

export interface RecipeSearchParams {
  query?: string;
  cuisine?: string;
  diet?: string;
  type?: string;
  maxReadyTime?: number;
  number?: number;
  offset?: number;
}

// Spoonacular's raw response fields (only what we actually read) - kept
// loose/partial since the API returns far more than we use.
interface SpoonacularRawRecipe {
  id: number;
  title: string;
  image?: string;
  summary?: string;
  readyInMinutes?: number;
  preparationMinutes?: number;
  cookingMinutes?: number;
  servings?: number;
  cuisines?: string[];
  dishTypes?: string[];
  diets?: string[];
  aggregateLikes?: number;
  extendedIngredients?: Array<{ name?: string; amount?: number; unit?: string; original?: string }>;
  analyzedInstructions?: Array<{ steps: Array<{ step: string }> }>;
  nutrition?: { nutrients?: Array<{ name: string; amount: number }> };
}

function stripHtml(html?: string): string {
  return (html ?? "").replace(/<[^>]+>/g, "").trim();
}

function findNutrient(nutrients: Array<{ name: string; amount: number }> | undefined, name: string) {
  return nutrients?.find((n) => n.name.toLowerCase() === name.toLowerCase())?.amount;
}

// Maps a raw Spoonacular recipe onto the same shape our own Recipe model
// produces, so the frontend (and any endpoint returning "a recipe") never
// has to know or care whether a given recipe came from Spoonacular or our
// own database. This is what fixes Spoonacular recipes rendering blank/
// broken on the recipe detail page - the raw API shape doesn't match our
// Recipe interface at all (extendedIngredients vs ingredients, etc.).
export function normalizeRecipe(raw: SpoonacularRawRecipe) {
  const steps = raw.analyzedInstructions?.[0]?.steps.map((s) => s.step) ?? [];
  const ingredients = (raw.extendedIngredients ?? []).map((ing) => ({
    name: ing.name ?? ing.original ?? "",
    quantity: ing.amount !== undefined ? String(ing.amount) : "",
    unit: ing.unit ?? "",
  }));
  const nutrients = raw.nutrition?.nutrients;

  return {
    _id: `spoonacular:${raw.id}`,
    title: raw.title,
    description: stripHtml(raw.summary).slice(0, 500),
    imageUrl: raw.image ?? "",
    videoUrl: "",
    source: "spoonacular" as const,
    spoonacularId: raw.id,
    author: undefined,
    ingredients,
    steps,
    cuisine: raw.cuisines ?? [],
    mealType: raw.dishTypes ?? [],
    diets: raw.diets ?? [],
    prepTimeMinutes: raw.preparationMinutes ?? 0,
    cookTimeMinutes: raw.cookingMinutes ?? raw.readyInMinutes ?? 0,
    servings: raw.servings ?? 2,
    difficulty: "medium" as const,
    nutrition: {
      calories: findNutrient(nutrients, "Calories"),
      protein: findNutrient(nutrients, "Protein"),
      carbs: findNutrient(nutrients, "Carbohydrates"),
      fat: findNutrient(nutrients, "Fat"),
    },
    status: "published" as const,
    likesCount: raw.aggregateLikes ?? 0,
    savesCount: 0,
    averageRating: 0,
    ratingsCount: 0,
    createdAt: new Date().toISOString(),
  };
}

export const spoonacularService = {
  searchRecipes(params: RecipeSearchParams) {
    return spoonacularFetch<{ results: SpoonacularRawRecipe[]; totalResults: number }>("/complexSearch", {
      query: params.query,
      cuisine: params.cuisine,
      diet: params.diet,
      type: params.type,
      maxReadyTime: params.maxReadyTime,
      number: params.number ?? 20,
      offset: params.offset ?? 0,
      addRecipeInformation: "true",
      addRecipeNutrition: "true",
    });
  },
  // Same as searchRecipes, but already mapped onto our own Recipe shape -
  // this is what the recipe search controller actually wants, so callers
  // don't have to know about SpoonacularRawRecipe at all.
  async searchNormalized(params: RecipeSearchParams) {
    try {
      const { results } = await this.searchRecipes(params);
      return results.map(normalizeRecipe);
    } catch {
      // A Spoonacular outage or bad/missing key shouldn't break the whole
      // search - it should just mean fewer results (the local DB results
      // still come back).
      return [];
    }
  },
  getRecipeById(id: number) {
    return spoonacularFetch<SpoonacularRawRecipe>(`/${id}/information`, { includeNutrition: "true" });
  },
  getSimilarRecipes(id: number) {
    return spoonacularFetch(`/${id}/similar`, {});
  },
  getRandomRecipes(number = 8) {
    return spoonacularFetch("/random", { number });
  },
  searchByIngredients(ingredients: string[], number = 10) {
    return spoonacularFetch("/findByIngredients", { ingredients: ingredients.join(","), number, ranking: 1 });
  },
};
