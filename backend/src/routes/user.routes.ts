import { Router } from "express";
import {
  getMe, updateMe, getPublicProfile, getMyRecipes, getSavedRecipes, moveSavedRecipe,
  getLikedRecipes, followUser, unfollowUser, getNotifications, markNotificationRead,
  getFeaturedCreators, getMySearchHistory, getActivityFeed,
} from "../controllers/user.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { updateMeSchema } from "../validators/user.schema";

const router = Router();

// Specific paths before the generic "/:id".
router.get("/featured", getFeaturedCreators);

router.get("/me", requireAuth, getMe);
router.patch("/me", requireAuth, validate(updateMeSchema), updateMe);
router.get("/me/recipes", requireAuth, getMyRecipes);
router.get("/me/saved", requireAuth, getSavedRecipes);
router.patch("/me/saved/:recipeId", requireAuth, moveSavedRecipe);
router.get("/me/liked", requireAuth, getLikedRecipes);
router.get("/me/search-history", requireAuth, getMySearchHistory);
router.get("/me/notifications", requireAuth, getNotifications);
router.patch("/me/notifications/:id/read", requireAuth, markNotificationRead);
router.get("/me/feed", requireAuth, getActivityFeed);

router.get("/:id", getPublicProfile);
router.post("/:id/follow", requireAuth, followUser);
router.delete("/:id/follow", requireAuth, unfollowUser);

export default router;
