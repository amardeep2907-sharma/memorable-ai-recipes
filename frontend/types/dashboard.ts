import { Recipe } from "./recipe";

export interface SavedRecipeEntry {
  _id: string;
  recipe: Recipe;
  collectionName: string;
  createdAt: string;
}

export interface LikedRecipeEntry {
  _id: string;
  recipe: Recipe;
  createdAt: string;
}

export type NotificationType =
  | "recipe_approved" | "recipe_liked" | "new_follower" | "new_comment"
  | "weekly_ai_recommendation" | "blog_post_approved";

export interface Notification {
  _id: string;
  type: NotificationType;
  message: string;
  relatedRecipe?: string;
  relatedUser?: string;
  isRead: boolean;
  createdAt: string;
}

export type AIInteractionType =
  | "recommendation" | "cooking_assistant" | "ingredient_substitute"
  | "meal_plan" | "recipe_summary" | "nutrition_explainer";

export interface AIHistoryItem {
  _id: string;
  type: AIInteractionType;
  prompt: string;
  response: string;
  createdAt: string;
}
