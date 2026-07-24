/**
 * One-off / cron-able script that pulls recipes from Spoonacular and
 * upserts them into the local `recipes` collection, so search doesn't
 * have to hit the third-party API on every request.
 *
 * Run manually:   npx ts-node src/scripts/importSpoonacular.ts
 * Run on a cron:  0 3 * * * cd /path/to/backend && npx ts-node src/scripts/importSpoonacular.ts
 *
 * Needs MONGODB_URI and SPOONACULAR_API_KEY set in .env.
 */
import { connectDB } from "../config/db";
import Recipe from "../models/Recipe";
import { spoonacularService } from "../services/spoonacular.service";
import mongoose from "mongoose";

// A handful of broad terms keeps this within Spoonacular's free-tier quota
// while still covering the cuisines/diets the UI filters on. Adjust freely.
const SEARCH_TERMS = ["curry", "pasta", "salad", "soup", "stir fry", "tacos", "dessert", "breakfast"];

interface SpoonacularSearchResult {
  results: Array<{
    id: number;
    title: string;
    image?: string;
    summary?: string;
    readyInMinutes?: number;
    servings?: number;
    cuisines?: string[];
    dishTypes?: string[];
    diets?: string[];
    nutrition?: { nutrients?: Array<{ name: string; amount: number }> };
  }>;
}

function extractNutrient(nutrients: Array<{ name: string; amount: number }> | undefined, name: string) {
  return nutrients?.find((n) => n.name.toLowerCase() === name.toLowerCase())?.amount;
}

async function importTerm(term: string) {
  const result = (await spoonacularService.searchRecipes({ query: term, number: 10 })) as SpoonacularSearchResult;

  for (const item of result.results ?? []) {
    const nutrients = item.nutrition?.nutrients;

    await Recipe.findOneAndUpdate(
      { spoonacularId: item.id },
      {
        title: item.title,
        description: (item.summary ?? "").replace(/<[^>]+>/g, "").slice(0, 500),
        imageUrl: item.image ?? "",
        source: "spoonacular",
        spoonacularId: item.id,
        cuisine: item.cuisines ?? [],
        mealType: item.dishTypes ?? [],
        diets: item.diets ?? [],
        prepTimeMinutes: 0,
        cookTimeMinutes: item.readyInMinutes ?? 0,
        servings: item.servings ?? 2,
        nutrition: {
          calories: extractNutrient(nutrients, "Calories"),
          protein: extractNutrient(nutrients, "Protein"),
          carbs: extractNutrient(nutrients, "Carbohydrates"),
          fat: extractNutrient(nutrients, "Fat"),
        },
        status: "published",
      },
      { upsert: true, new: true }
    );
  }

  console.log(`[import-spoonacular] "${term}": upserted ${result.results?.length ?? 0} recipes`);
}

async function run() {
  await connectDB();
  for (const term of SEARCH_TERMS) {
    try {
      await importTerm(term);
    } catch (err) {
      console.error(`[import-spoonacular] failed on "${term}":`, err);
    }
  }
  await mongoose.disconnect();
  console.log("[import-spoonacular] done");
}

run();
