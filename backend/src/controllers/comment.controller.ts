import { Response } from "express";
import Comment from "../models/Comment";
import Notification from "../models/Notification";
import Recipe from "../models/Recipe";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthedRequest } from "../middleware/auth";

export const listComments = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const comments = await Comment.find({ recipe: req.params.recipeId }).populate("user", "name avatarUrl").sort({ createdAt: -1 });
  res.json({ success: true, data: comments });
});

export const addComment = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { text, parentComment } = req.body;
  if (!text) throw ApiError.badRequest("text is required");

  const recipe = await Recipe.findById(req.params.recipeId);
  if (!recipe) throw ApiError.notFound("Recipe not found");

  const comment = await Comment.create({
    user: req.user!.userId,
    recipe: recipe.id,
    text,
    parentComment: parentComment || null,
  });

  if (recipe.author && recipe.author.toString() !== req.user!.userId) {
    await Notification.create({
      user: recipe.author,
      type: "new_comment",
      message: "Someone commented on your recipe",
      relatedRecipe: recipe.id,
      relatedUser: req.user!.userId,
    });
  }

  res.status(201).json({ success: true, data: comment });
});

export const deleteComment = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw ApiError.notFound("Comment not found");
  if (comment.user.toString() !== req.user!.userId && req.user!.role !== "admin") throw ApiError.forbidden();
  await comment.deleteOne();
  res.json({ success: true, message: "Comment deleted" });
});
