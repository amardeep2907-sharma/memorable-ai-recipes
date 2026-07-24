import { Response } from "express";
import User from "../models/User";
import Recipe from "../models/Recipe";
import Notification from "../models/Notification";
import AIRecommendationHistory from "../models/AIRecommendationHistory";
import Category from "../models/Category";
import Comment from "../models/Comment";
import Review from "../models/Review";
import PageView from "../models/PageView";
import NewsletterSubscriber from "../models/NewsletterSubscriber";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthedRequest } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";

export const getDashboardStats = asyncHandler(async (_req: AuthedRequest, res: Response) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers, totalRecipes, spoonacularRecipes, userRecipes, aiUsageCount,
    dailyVisitors, weeklyVisitors, newsletterSubscribers,
  ] = await Promise.all([
    User.countDocuments(),
    Recipe.countDocuments(),
    Recipe.countDocuments({ source: "spoonacular" }),
    Recipe.countDocuments({ source: "user" }),
    AIRecommendationHistory.countDocuments(),
    PageView.countDocuments({ createdAt: { $gte: startOfToday } }),
    PageView.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    NewsletterSubscriber.countDocuments({ isActive: true }),
  ]);

  res.json({
    success: true,
    data: {
      totalUsers, totalRecipes, spoonacularRecipes, userRecipes, aiUsageCount,
      dailyVisitors, weeklyVisitors, newsletterSubscribers,
    },
  });
});

export const listUsers = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { page = "1", limit = "20" } = req.query as Record<string, string>;
  const users = await User.find().skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).sort({ createdAt: -1 });
  res.json({ success: true, data: users });
});

export const setUserRole = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { role } = req.body;
  if (!["user", "admin"].includes(role)) throw ApiError.badRequest("role must be 'user' or 'admin'");
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) throw ApiError.notFound("User not found");
  res.json({ success: true, data: user });
});

export const listPendingRecipes = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const recipes = await Recipe.find({ status: "draft" }).populate("author", "name email").sort({ createdAt: -1 });
  res.json({ success: true, data: recipes });
});

export const approveRecipe = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const recipe = await Recipe.findByIdAndUpdate(req.params.id, { status: "published" }, { new: true });
  if (!recipe) throw ApiError.notFound("Recipe not found");

  if (recipe.author) {
    await Notification.create({
      user: recipe.author,
      type: "recipe_approved",
      message: `Your recipe "${recipe.title}" was approved and is now live.`,
      relatedRecipe: recipe.id,
    });
  }

  res.json({ success: true, data: recipe });
});

export const deleteAnyRecipe = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const recipe = await Recipe.findByIdAndDelete(req.params.id);
  if (!recipe) throw ApiError.notFound("Recipe not found");
  res.json({ success: true, message: "Recipe removed" });
});

// --- Categories -----------------------------------------------------------

export const listCategories = asyncHandler(async (_req: AuthedRequest, res: Response) => {
  const categories = await Category.find().sort({ type: 1, name: 1 });
  res.json({ success: true, data: categories });
});

export const createCategory = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { name, type, imageUrl } = req.body;
  if (!name || !type) throw ApiError.badRequest("name and type are required");

  const slug = String(name).trim().toLowerCase().replace(/\s+/g, "-");
  const category = await Category.create({ name, type, imageUrl, slug });
  res.status(201).json({ success: true, data: category });
});

export const deleteCategory = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw ApiError.notFound("Category not found");
  res.json({ success: true, message: "Category removed" });
});

// --- Comments moderation ----------------------------------------------------

export const listAllComments = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { page = "1", limit = "30" } = req.query as Record<string, string>;
  const comments = await Comment.find()
    .populate("user", "name email")
    .populate("recipe", "title")
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));
  res.json({ success: true, data: comments });
});

export const adminDeleteComment = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const comment = await Comment.findByIdAndDelete(req.params.id);
  if (!comment) throw ApiError.notFound("Comment not found");
  res.json({ success: true, message: "Comment removed" });
});

// --- Reviews moderation ------------------------------------------------------

export const listAllReviews = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { page = "1", limit = "30" } = req.query as Record<string, string>;
  const reviews = await Review.find()
    .populate("user", "name email")
    .populate("recipe", "title")
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));
  res.json({ success: true, data: reviews });
});

export const adminDeleteReview = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) throw ApiError.notFound("Review not found");

  const stats = await Review.aggregate([
    { $match: { recipe: review.recipe } },
    { $group: { _id: "$recipe", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  await Recipe.findByIdAndUpdate(review.recipe, {
    averageRating: stats[0]?.avg ?? 0,
    ratingsCount: stats[0]?.count ?? 0,
  });

  res.json({ success: true, message: "Review removed" });
});

// --- Notifications overview (read-only oversight) --------------------------

export const listAllNotifications = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { page = "1", limit = "30" } = req.query as Record<string, string>;
  const notifications = await Notification.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));
  res.json({ success: true, data: notifications });
});
