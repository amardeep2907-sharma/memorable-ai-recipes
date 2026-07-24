import { Router } from "express";
import {
  getDashboardStats, listUsers, setUserRole, listPendingRecipes, approveRecipe, deleteAnyRecipe,
  listCategories, createCategory, deleteCategory,
  listAllComments, adminDeleteComment,
  listAllReviews, adminDeleteReview,
  listAllNotifications,
} from "../controllers/admin.controller";
import { listReports, updateReportStatus } from "../controllers/report.controller";
import { listSubscribers } from "../controllers/newsletter.controller";
import { listContactMessages, updateContactMessageStatus } from "../controllers/contact.controller";
import { adminListPosts, adminListPending, approvePost, adminUpdatePost, adminDeletePost } from "../controllers/blog.controller";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { adminUpdateBlogPostSchema } from "../validators/blog.schema";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/stats", getDashboardStats);

router.get("/users", listUsers);
router.patch("/users/:id/role", setUserRole);

router.get("/recipes/pending", listPendingRecipes);
router.patch("/recipes/:id/approve", approveRecipe);
router.delete("/recipes/:id", deleteAnyRecipe);

router.get("/categories", listCategories);
router.post("/categories", createCategory);
router.delete("/categories/:id", deleteCategory);

router.get("/comments", listAllComments);
router.delete("/comments/:id", adminDeleteComment);

router.get("/reviews", listAllReviews);
router.delete("/reviews/:id", adminDeleteReview);

router.get("/reports", listReports);
router.patch("/reports/:id", updateReportStatus);

router.get("/notifications", listAllNotifications);

router.get("/newsletter/subscribers", listSubscribers);

router.get("/contact-messages", listContactMessages);
router.patch("/contact-messages/:id", updateContactMessageStatus);

router.get("/blog", adminListPosts);
router.get("/blog/pending", adminListPending);
router.patch("/blog/:id/approve", approvePost);
router.patch("/blog/:id", validate(adminUpdateBlogPostSchema), adminUpdatePost);
router.delete("/blog/:id", adminDeletePost);

export default router;
