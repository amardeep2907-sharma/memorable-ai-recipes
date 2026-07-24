import { Router } from "express";
import {
  searchRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe,
  toggleLike, toggleSave, addReview, listReviews, getSimilarRecipes,
  getRecommendedRecipes,
} from "../controllers/recipe.controller";
import { requireAuth, optionalAuth } from "../middleware/auth";
import { requireMongoId } from "../middleware/validateObjectId";
import { listComments, addComment, deleteComment } from "../controllers/comment.controller";
import { validate } from "../middleware/validate";
import { createRecipeSchema, updateRecipeSchema, reviewSchema } from "../validators/recipe.schema";
import { addCommentSchema } from "../validators/comment.schema";

const router = Router();

// Order matters: specific paths before the generic "/:id" so they aren't
// swallowed by it.
router.get("/recommended", requireAuth, getRecommendedRecipes);
router.get("/", optionalAuth, searchRecipes);
router.get("/:id", optionalAuth, getRecipeById);
router.get("/:id/similar", getSimilarRecipes);
router.post("/", requireAuth, validate(createRecipeSchema), createRecipe);
router.patch("/:id", requireAuth, validate(updateRecipeSchema), updateRecipe);
router.delete("/:id", requireAuth, deleteRecipe);

router.post("/:id/like", requireAuth, requireMongoId("id"), toggleLike);
router.post("/:id/save", requireAuth, requireMongoId("id"), toggleSave);
router.post("/:id/reviews", requireAuth, requireMongoId("id"), validate(reviewSchema), addReview);
router.get("/:id/reviews", listReviews);

router.get("/:recipeId/comments", listComments);
router.post("/:recipeId/comments", requireAuth, requireMongoId("recipeId"), validate(addCommentSchema), addComment);
router.delete("/comments/:id", requireAuth, deleteComment);

export default router;
