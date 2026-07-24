import { Response } from "express";
import { geminiService } from "../services/gemini.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthedRequest } from "../middleware/auth";
import AIRecommendationHistory from "../models/AIRecommendationHistory";
import Recipe from "../models/Recipe";
import User from "../models/User";
import SavedRecipe from "../models/SavedRecipe";
import Like from "../models/Like";
import Notification from "../models/Notification";
import MealPlan from "../models/MealPlan";
import { ApiError } from "../utils/ApiError";

async function logAndReturn(
  res: Response,
  userId: string,
  type: "recommendation" | "cooking_assistant" | "ingredient_substitute" | "meal_plan" | "recipe_summary" | "nutrition_explainer",
  prompt: string,
  response: string
) {
  await AIRecommendationHistory.create({ user: userId, type, prompt, response });
  res.json({ success: true, data: { response } });
}

// Static knowledge about how the site works, so the chat widget can double
// as support/help - "how do I save a recipe" shouldn't need a human.
// Keep this in sync with the actual features as the app grows.
const SITE_HELP = `
How Memorable works, for answering "how do I..." questions:
- Search recipes by name/ingredient/cuisine/diet/meal type at /search, with filter chips and infinite scroll.
- Every recipe page has Like, Save (into a named collection), a 1-5 star review, and comments.
- "Share a recipe" (/create-recipe) lets any signed-in user publish their own recipe with ingredients, steps, photo, and optional video. They can edit it later from the recipe's own page (Edit button, visible only to its author).
- The AI tools hub (/ai-tools) has five one-off tools: cooking assistant, ingredient substitute, meal planner, recipe summarizer, nutrition explainer. This chat does all of that conversationally too.
- The dashboard (/dashboard) has tabs: My recipes, Saved (grouped into collections), Liked, AI history, Notifications.
- /settings has profile info (name, bio, avatar) and cooking preferences (favorite cuisines/diets/allergies), which personalize recipe recommendations.
- Users can follow each other from a public profile page (/users/:id) to keep track of favorite recipe authors.
- Sign-in supports email/password and Google. A "Report" button on recipes and comments flags content for admin review.
- Admins (not regular users) have an additional dashboard for moderation - regular users won't see or need this.
`.trim();

// Pulls a short, current snapshot of the signed-in user's own activity so
// the chat can answer personalized questions ("how many recipes have I
// saved?") with real numbers instead of guessing. Kept intentionally
// read-only - the assistant can describe the user's account, not change it.
async function buildUserContext(userId: string): Promise<string> {
  const [user, recipeCount, savedCount, likedCount, unreadNotifications] = await Promise.all([
    User.findById(userId).select("name preferences"),
    Recipe.countDocuments({ author: userId }),
    SavedRecipe.countDocuments({ user: userId }),
    Like.countDocuments({ user: userId }),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  if (!user) return "";

  return [
    `Signed-in user: ${user.name}.`,
    `Preferred cuisines: ${user.preferences?.cuisines?.join(", ") || "none set"}.`,
    `Preferred diets: ${user.preferences?.diets?.join(", ") || "none set"}.`,
    `Allergies: ${user.preferences?.allergies?.join(", ") || "none set"}.`,
    `They've published ${recipeCount} recipe(s), saved ${savedCount}, and liked ${likedCount}.`,
    `They have ${unreadNotifications} unread notification(s).`,
    "Use these facts only if the question is actually about their account or activity - don't volunteer them unprompted.",
  ].join(" ");
}

export const cookingAssistant = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { ingredients, dietaryNotes } = req.body;
  if (!ingredients) throw ApiError.badRequest("ingredients is required");
  const response = await geminiService.cookingAssistant(ingredients, dietaryNotes);
  await logAndReturn(res, req.user!.userId, "cooking_assistant", ingredients, response);
});

export const ingredientSubstitute = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { missingIngredient, context } = req.body;
  if (!missingIngredient) throw ApiError.badRequest("missingIngredient is required");
  const response = await geminiService.ingredientSubstitute(missingIngredient, context);
  await logAndReturn(res, req.user!.userId, "ingredient_substitute", missingIngredient, response);
});

export const mealPlan = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { goal, days } = req.body;
  if (!goal) throw ApiError.badRequest("goal is required");

  const generatedDays = await geminiService.mealPlan(goal, days);
  if (generatedDays.length === 0) {
    throw ApiError.internal("The AI couldn't generate a meal plan just now - please try again");
  }

  const plan = await MealPlan.create({ user: req.user!.userId, goal, days: generatedDays });

  await AIRecommendationHistory.create({
    user: req.user!.userId,
    type: "meal_plan",
    prompt: goal,
    response: `Generated a ${generatedDays.length}-day meal plan (saved to your dashboard).`,
  });

  res.status(201).json({ success: true, data: plan });
});

export const recipeSummary = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { recipeText } = req.body;
  if (!recipeText) throw ApiError.badRequest("recipeText is required");
  const response = await geminiService.recipeSummary(recipeText);
  await logAndReturn(res, req.user!.userId, "recipe_summary", recipeText, response);
});

export const nutritionExplainer = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { nutritionFacts } = req.body;
  if (!nutritionFacts) throw ApiError.badRequest("nutritionFacts is required");
  const response = await geminiService.nutritionExplainer(nutritionFacts);
  await logAndReturn(res, req.user!.userId, "nutrition_explainer", nutritionFacts, response);
});

export const getAIHistory = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const history = await AIRecommendationHistory.find({ user: req.user!.userId }).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, data: history });
});

// POST /api/ai/chat  { messages: [{ role: "user"|"assistant", content: string }] }
// Backs the floating chat widget - one conversational endpoint instead of
// forcing the person to pick which of the five single-purpose tools they
// want; the system prompt covers all of them and the model figures out
// what's actually being asked from context.
export const chat = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { messages } = req.body;
  const userContext = await buildUserContext(req.user!.userId);

  const { reply, recipes } = await geminiService.chat(
    messages,
    `${SITE_HELP}\n\n${userContext}`,
    async (args) => {
      const dbFilter: Record<string, unknown> = { status: "published" };
      if (args.keywords) dbFilter.$text = { $search: args.keywords };
      if (args.cuisine) dbFilter.cuisine = args.cuisine;
      if (args.diet) dbFilter.diets = args.diet;
      if (args.mealType) dbFilter.mealType = args.mealType;
      return Recipe.find(dbFilter).limit(6).sort({ likesCount: -1 });
    }
  );

  const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === "user");
  await AIRecommendationHistory.create({
    user: req.user!.userId,
    type: "chat",
    prompt: lastUserMessage?.content ?? "",
    response: reply,
    relatedRecipes: recipes.map((r) => r._id),
  });

  res.json({ success: true, data: { response: reply, recipes } });
});

// POST /api/ai/smart-search  { query: "something spicy and quick, no meat" }
// Turns natural language into structured filters and runs the normal
// recipe search against them, returning both so the UI can show what the
// AI understood as well as the results.
export const smartSearch = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { query } = req.body;
  if (!query) throw ApiError.badRequest("query is required");

  const filters = await geminiService.smartSearchFilters(query);

  const dbFilter: Record<string, unknown> = { status: "published" };
  if (filters.keywords) dbFilter.$text = { $search: filters.keywords };
  if (filters.cuisine) dbFilter.cuisine = filters.cuisine;
  if (filters.diet) dbFilter.diets = filters.diet;
  if (filters.mealType) dbFilter.mealType = filters.mealType;

  const recipes = await Recipe.find(dbFilter).limit(20).sort({ likesCount: -1 });

  await AIRecommendationHistory.create({
    user: req.user!.userId,
    type: "recommendation",
    prompt: query,
    response: JSON.stringify(filters),
    relatedRecipes: recipes.map((r) => r.id),
  });

  res.json({ success: true, data: { filters, recipes } });
});
