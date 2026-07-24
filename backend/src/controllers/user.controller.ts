import { Response } from "express";
import User from "../models/User";
import Recipe from "../models/Recipe";
import SavedRecipe from "../models/SavedRecipe";
import Like from "../models/Like";
import Comment from "../models/Comment";
import Review from "../models/Review";
import Notification from "../models/Notification";
import SearchHistory from "../models/SearchHistory";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthedRequest } from "../middleware/auth";

export const getMe = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const user = await User.findById(req.user!.userId);
  if (!user) throw ApiError.notFound("User not found");
  res.json({ success: true, data: user });
});

export const updateMe = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { name, bio, avatarUrl, preferences } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user!.userId,
    { $set: { name, bio, avatarUrl, preferences } },
    { new: true, runValidators: true }
  );
  res.json({ success: true, data: user });
});

export const getPublicProfile = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const user = await User.findById(req.params.id).select("name avatarUrl bio followers following createdAt");
  if (!user) throw ApiError.notFound("User not found");
  const recipes = await Recipe.find({ author: user.id, status: "published" }).sort({ createdAt: -1 });
  res.json({ success: true, data: { user, recipes } });
});

export const getMyRecipes = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const recipes = await Recipe.find({ author: req.user!.userId }).sort({ createdAt: -1 });
  res.json({ success: true, data: recipes });
});

export const getSavedRecipes = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const saved = await SavedRecipe.find({ user: req.user!.userId }).populate("recipe");
  res.json({ success: true, data: saved });
});

// PATCH /api/users/me/saved/:recipeId  { collectionName: "Weeknight dinners" }
export const moveSavedRecipe = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { collectionName } = req.body;
  if (!collectionName || !String(collectionName).trim()) throw ApiError.badRequest("collectionName is required");

  const saved = await SavedRecipe.findOneAndUpdate(
    { user: req.user!.userId, recipe: req.params.recipeId },
    { collectionName: String(collectionName).trim() },
    { new: true }
  );
  if (!saved) throw ApiError.notFound("Saved recipe not found");
  res.json({ success: true, data: saved });
});

// GET /api/users/me/search-history
export const getMySearchHistory = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const history = await SearchHistory.find({ user: req.user!.userId })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ success: true, data: history });
});

export const getLikedRecipes = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const liked = await Like.find({ user: req.user!.userId }).populate("recipe");
  res.json({ success: true, data: liked });
});

export const followUser = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const targetId = req.params.id;
  if (targetId === req.user!.userId) throw ApiError.badRequest("You can't follow yourself");

  await User.findByIdAndUpdate(req.user!.userId, { $addToSet: { following: targetId } });
  await User.findByIdAndUpdate(targetId, { $addToSet: { followers: req.user!.userId } });
  await Notification.create({
    user: targetId,
    type: "new_follower",
    message: "You have a new follower",
    relatedUser: req.user!.userId,
  });

  res.json({ success: true, message: "Followed" });
});

export const unfollowUser = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const targetId = req.params.id;
  await User.findByIdAndUpdate(req.user!.userId, { $pull: { following: targetId } });
  await User.findByIdAndUpdate(targetId, { $pull: { followers: req.user!.userId } });
  res.json({ success: true, message: "Unfollowed" });
});

export const getNotifications = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const notifications = await Notification.find({ user: req.user!.userId }).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, data: notifications });
});

export const markNotificationRead = asyncHandler(async (req: AuthedRequest, res: Response) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user!.userId }, { isRead: true });
  res.json({ success: true });
});

// GET /api/users/featured - top authors by published recipe count and total
// likes across those recipes, for the home page's "Featured Creators" rail.
export const getFeaturedCreators = asyncHandler(async (_req: AuthedRequest, res: Response) => {
  const featured = await Recipe.aggregate([
    { $match: { status: "published", author: { $ne: null } } },
    {
      $group: {
        _id: "$author",
        recipeCount: { $sum: 1 },
        totalLikes: { $sum: "$likesCount" },
      },
    },
    { $sort: { totalLikes: -1, recipeCount: -1 } },
    { $limit: 6 },
    {
      $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: "$user._id",
        name: "$user.name",
        avatarUrl: "$user.avatarUrl",
        bio: "$user.bio",
        recipeCount: 1,
        totalLikes: 1,
      },
    },
  ]);

  res.json({ success: true, data: featured });
});

// GET /api/users/me/feed - a chronological feed of what the people you
// follow have been up to: new recipes, likes, comments, reviews. Built as
// a read-only merge across existing collections rather than a new
// "Activity" model, since every event it shows already has a natural home
// (Recipe/Like/Comment/Review) - duplicating that into a write-on-every-
// action feed table isn't worth the complexity for this scaffold's scale.
export const getActivityFeed = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const viewer = await User.findById(req.user!.userId).select("following");
  const following = viewer?.following ?? [];

  if (following.length === 0) {
    return res.json({ success: true, data: [] });
  }

  const PER_TYPE_LIMIT = 15;
  const recipeSelect = "title imageUrl";
  const userSelect = "name avatarUrl";

  const [recipes, likes, comments, reviews] = await Promise.all([
    Recipe.find({ author: { $in: following }, status: "published" })
      .sort({ createdAt: -1 })
      .limit(PER_TYPE_LIMIT)
      .populate("author", userSelect)
      .select(`${recipeSelect} author createdAt`),
    Like.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .limit(PER_TYPE_LIMIT)
      .populate("user", userSelect)
      .populate("recipe", recipeSelect),
    Comment.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .limit(PER_TYPE_LIMIT)
      .populate("user", userSelect)
      .populate("recipe", recipeSelect),
    Review.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .limit(PER_TYPE_LIMIT)
      .populate("user", userSelect)
      .populate("recipe", recipeSelect),
  ]);

  const feed = [
    ...recipes
      .filter((r) => r.author)
      .map((r) => ({
        id: `recipe:${r.id}`,
        type: "recipe_published" as const,
        actor: r.author,
        recipe: { _id: r.id, title: r.title, imageUrl: r.imageUrl },
        createdAt: r.createdAt,
      })),
    ...likes
      .filter((l) => l.user && l.recipe)
      .map((l) => ({
        id: `like:${l.id}`,
        type: "recipe_liked" as const,
        actor: l.user,
        recipe: l.recipe,
        createdAt: l.createdAt,
      })),
    ...comments
      .filter((c) => c.user && c.recipe)
      .map((c) => ({
        id: `comment:${c.id}`,
        type: "comment_added" as const,
        actor: c.user,
        recipe: c.recipe,
        text: c.text,
        createdAt: c.createdAt,
      })),
    ...reviews
      .filter((rv) => rv.user && rv.recipe)
      .map((rv) => ({
        id: `review:${rv.id}`,
        type: "review_added" as const,
        actor: rv.user,
        recipe: rv.recipe,
        rating: rv.rating,
        text: rv.text,
        createdAt: rv.createdAt,
      })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 40);

  res.json({ success: true, data: feed });
});
