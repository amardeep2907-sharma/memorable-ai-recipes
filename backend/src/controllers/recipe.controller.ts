import { Response } from "express";
import Recipe from "../models/Recipe";
import Like from "../models/Like";
import SavedRecipe from "../models/SavedRecipe";
import Review from "../models/Review";
import SearchHistory from "../models/SearchHistory";
import User from "../models/User";
import Notification from "../models/Notification";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthedRequest } from "../middleware/auth";
import { spoonacularService, normalizeRecipe } from "../services/spoonacular.service";
import { getCurrentSeason } from "../utils/season";

const SORTS: Record<string, Record<string, 1 | -1>> = {
  recent: { createdAt: -1 },
  trending: { likesCount: -1, createdAt: -1 },
  topRated: { averageRating: -1, ratingsCount: -1 },
  mostSaved: { savesCount: -1, createdAt: -1 },
};

export const searchRecipes = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { query = "", cuisine, diet, mealType, season, ingredients, page = "1", limit = "20", sort = "recent" } =
    req.query as Record<string, string>;

  const filter: Record<string, unknown> = { status: "published" };
  if (query) filter.$text = { $search: query };
  if (cuisine) filter.cuisine = cuisine;
  if (diet) filter.diets = diet;
  if (mealType) filter.mealType = mealType;
  if (season) {
    // "current" resolves server-side so the frontend doesn't need to
    // duplicate the month->season logic just to hit this endpoint.
    filter.seasons = season === "current" ? getCurrentSeason() : season;
  }
  if (ingredients) {
    // "rice,onion,tomato" -> recipes containing at least one of these
    // ingredient names (case-insensitive). Powers "what can I make with
    // what I have" style search separately from the AI cooking assistant.
    const names = ingredients.split(",").map((s) => s.trim()).filter(Boolean);
    if (names.length) {
      filter["ingredients.name"] = { $in: names.map((n) => new RegExp(n, "i")) };
    }
  }

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Number(limit), 50);
  const sortSpec = SORTS[sort] ?? SORTS.recent;

  const [results, total] = await Promise.all([
    Recipe.find(filter).skip((pageNum - 1) * limitNum).limit(limitNum).sort(sortSpec),
    Recipe.countDocuments(filter),
  ]);

 if (req.user && query.trim()) {
  await SearchHistory.create({
    user: req.user.userId,
    query: query.trim(),
    filters: { cuisine, diet, mealType },
  });
}

  // Only page 1 pulls in live Spoonacular results (merged after local
  // ones) - past that, pagination against a second, differently-paginated
  // source gets messy fast, and the local library should surface first
  // anyway since those are the recipes this community actually made.
  let combined: unknown[] = results;
  if (query && pageNum === 1) {
    const spoonacularResults = await spoonacularService.searchNormalized({
      query,
      cuisine,
      diet,
      type: mealType,
      number: Math.max(limitNum - results.length, 5),
    });
    combined = [...results, ...spoonacularResults];
  }

  res.json({ success: true, data: combined, meta: { page: pageNum, limit: limitNum, total } });
});

export const getRecipeById = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { id } = req.params;

  if (id.startsWith("spoonacular:")) {
    const spoonacularId = Number(id.split(":")[1]);
    const raw = await spoonacularService.getRecipeById(spoonacularId);
    // Spoonacular recipes are read-only here (no local Like/SavedRecipe/
    // Review documents reference them), so the viewer state is always
    // empty rather than looked up.
    return res.json({
      success: true,
      data: normalizeRecipe(raw),
      viewerState: { liked: false, saved: false, myRating: null },
    });
  }

  const recipe = await Recipe.findById(id).populate("author", "name avatarUrl");
  if (!recipe) throw ApiError.notFound("Recipe not found");

  let viewerState = { liked: false, saved: false, myRating: null as number | null };
  if (req.user) {
    const [liked, saved, review] = await Promise.all([
      Like.exists({ user: req.user.userId, recipe: recipe.id }),
      SavedRecipe.exists({ user: req.user.userId, recipe: recipe.id }),
      Review.findOne({ user: req.user.userId, recipe: recipe.id }).select("rating"),
    ]);
    viewerState = { liked: !!liked, saved: !!saved, myRating: review?.rating ?? null };
  }

  res.json({ success: true, data: recipe, viewerState });
});

export const createRecipe = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const recipe = await Recipe.create({ ...req.body, source: "user", author: req.user!.userId });
  res.status(201).json({ success: true, data: recipe });
});

export const updateRecipe = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) throw ApiError.notFound("Recipe not found");
  if (recipe.author?.toString() !== req.user!.userId) throw ApiError.forbidden();

  Object.assign(recipe, req.body);
  await recipe.save();
  res.json({ success: true, data: recipe });
});

export const deleteRecipe = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) throw ApiError.notFound("Recipe not found");
  if (recipe.author?.toString() !== req.user!.userId && req.user!.role !== "admin") throw ApiError.forbidden();
  await recipe.deleteOne();
  res.json({ success: true, message: "Recipe deleted" });
});

export const toggleLike = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const existing = await Like.findOne({ user: req.user!.userId, recipe: req.params.id });
  if (existing) {
    await existing.deleteOne();
    await Recipe.findByIdAndUpdate(req.params.id, { $inc: { likesCount: -1 } });
    return res.json({ success: true, data: { liked: false } });
  }
  await Like.create({ user: req.user!.userId, recipe: req.params.id });
  const recipe = await Recipe.findByIdAndUpdate(req.params.id, { $inc: { likesCount: 1 } }, { new: true });

  if (recipe?.author && recipe.author.toString() !== req.user!.userId) {
    await Notification.create({
      user: recipe.author,
      type: "recipe_liked",
      message: `Someone liked your recipe "${recipe.title}".`,
      relatedRecipe: recipe.id,
      relatedUser: req.user!.userId,
    });
  }

  res.json({ success: true, data: { liked: true } });
});

export const toggleSave = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const existing = await SavedRecipe.findOne({ user: req.user!.userId, recipe: req.params.id });
  if (existing) {
    await existing.deleteOne();
    await Recipe.findByIdAndUpdate(req.params.id, { $inc: { savesCount: -1 } });
    return res.json({ success: true, data: { saved: false } });
  }
  const collectionName = typeof req.body?.collectionName === "string" && req.body.collectionName.trim()
    ? req.body.collectionName.trim()
    : "Saved";
  await SavedRecipe.create({ user: req.user!.userId, recipe: req.params.id, collectionName });
  await Recipe.findByIdAndUpdate(req.params.id, { $inc: { savesCount: 1 } });
  res.json({ success: true, data: { saved: true } });
});

export const addReview = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { rating, text } = req.body;
  if (!rating || rating < 1 || rating > 5) throw ApiError.badRequest("rating must be 1-5");

  const review = await Review.findOneAndUpdate(
    { user: req.user!.userId, recipe: req.params.id },
    { rating, text },
    { upsert: true, new: true }
  );

  const stats = await Review.aggregate([
    { $match: { recipe: review.recipe } },
    { $group: { _id: "$recipe", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  if (stats[0]) {
    await Recipe.findByIdAndUpdate(req.params.id, { averageRating: stats[0].avg, ratingsCount: stats[0].count });
  }

  res.status(201).json({ success: true, data: review });
});

export const listReviews = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const reviews = await Review.find({ recipe: req.params.id })
    .populate("user", "name avatarUrl")
    .sort({ createdAt: -1 });
  res.json({ success: true, data: reviews });
});

// GET /api/recipes/recommended - blends the viewer's stated preferences and
// recent search terms with an overall-trending fallback so the list is
// never empty for a brand-new account.
export const getRecommendedRecipes = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const user = await User.findById(req.user!.userId).select("preferences");
  const recentSearches = await SearchHistory.find({ user: req.user!.userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("query");

  const preferredCuisines = user?.preferences?.cuisines ?? [];
  const preferredDiets = user?.preferences?.diets ?? [];
  const searchTerms = recentSearches.map((s) => s.query).filter(Boolean);

  const personalizedFilter: Record<string, unknown> = { status: "published" };
  const orClauses: Record<string, unknown>[] = [];
  if (preferredCuisines.length) orClauses.push({ cuisine: { $in: preferredCuisines } });
  if (preferredDiets.length) orClauses.push({ diets: { $in: preferredDiets } });
  if (searchTerms.length) orClauses.push({ $text: { $search: searchTerms.join(" ") } });
  if (orClauses.length) personalizedFilter.$or = orClauses;

  let recipes = orClauses.length
    ? await Recipe.find(personalizedFilter).sort({ likesCount: -1 }).limit(12)
    : [];

  if (recipes.length < 6) {
    const excludeIds = recipes.map((r) => r.id);
    const trending = await Recipe.find({ status: "published", _id: { $nin: excludeIds } })
      .sort({ likesCount: -1, createdAt: -1 })
      .limit(12 - recipes.length);
    recipes = [...recipes, ...trending];
  }

  res.json({ success: true, data: recipes });
});

export const getSimilarRecipes = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const recipe = await Recipe.findById(req.params.id);
  if (recipe) {
    const similar = await Recipe.find({
      _id: { $ne: recipe.id },
      cuisine: { $in: recipe.cuisine },
      status: "published",
    }).limit(6);
    return res.json({ success: true, data: similar });
  }
  res.json({ success: true, data: [] });
});
