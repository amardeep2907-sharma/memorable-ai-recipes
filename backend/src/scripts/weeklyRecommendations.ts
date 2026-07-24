/**
 * Cron-able script: for every user, ask the AI to explain why a short list
 * of recipes suits their stated preferences, log it to
 * AIRecommendationHistory, and drop a "weekly_ai_recommendation"
 * notification so it shows up in their dashboard.
 *
 * Run manually:   npx ts-node src/scripts/weeklyRecommendations.ts
 * Run on a cron:  0 8 * * 1 cd /path/to/backend && npx ts-node src/scripts/weeklyRecommendations.ts
 *
 * Needs MONGODB_URI and OPENAI_API_KEY set in .env.
 */
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import User from "../models/User";
import Recipe from "../models/Recipe";
import Notification from "../models/Notification";
import AIRecommendationHistory from "../models/AIRecommendationHistory";
import { geminiService } from "../services/gemini.service";

async function recommendForUser(userId: string, preferences: { cuisines: string[]; diets: string[] }) {
  const filter: Record<string, unknown> = { status: "published" };
  const orClauses: Record<string, unknown>[] = [];
  if (preferences.cuisines?.length) orClauses.push({ cuisine: { $in: preferences.cuisines } });
  if (preferences.diets?.length) orClauses.push({ diets: { $in: preferences.diets } });
  if (orClauses.length) filter.$or = orClauses;

  const recipes = orClauses.length
    ? await Recipe.find(filter).sort({ likesCount: -1 }).limit(3)
    : await Recipe.find({ status: "published" }).sort({ likesCount: -1, createdAt: -1 }).limit(3);

  if (recipes.length === 0) return;

  const profileSummary = `Preferred cuisines: ${preferences.cuisines?.join(", ") || "none stated"}. ` +
    `Preferred diets: ${preferences.diets?.join(", ") || "none stated"}. ` +
    `Candidate recipes: ${recipes.map((r) => r.title).join(", ")}.`;

  const reasoning = await geminiService.personalizedRecommendationReasoning(profileSummary);

  await AIRecommendationHistory.create({
    user: userId,
    type: "recommendation",
    prompt: profileSummary,
    response: reasoning,
    relatedRecipes: recipes.map((r) => r.id),
  });

  await Notification.create({
    user: userId,
    type: "weekly_ai_recommendation",
    message: `This week's picks for you: ${recipes.map((r) => r.title).join(", ")}.`,
  });
}

async function run() {
  await connectDB();
  const users = await User.find().select("_id preferences");

  for (const user of users) {
    try {
      await recommendForUser(user.id, user.preferences);
    } catch (err) {
      console.error(`[weekly-recommendations] failed for user ${user.id}:`, err);
    }
  }

  await mongoose.disconnect();
  console.log(`[weekly-recommendations] done for ${users.length} users`);
}

run();
