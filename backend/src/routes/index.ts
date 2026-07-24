import { Router } from "express";
import authRoutes from "./auth.routes";
import recipeRoutes from "./recipe.routes";
import userRoutes from "./user.routes";
import aiRoutes from "./ai.routes";
import adminRoutes from "./admin.routes";
import uploadRoutes from "./upload.routes";
import reportRoutes from "./report.routes";
import analyticsRoutes from "./analytics.routes";
import newsletterRoutes from "./newsletter.routes";
import contactRoutes from "./contact.routes";
import blogRoutes from "./blog.routes";
import mealPlanRoutes from "./mealPlan.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/recipes", recipeRoutes);
router.use("/users", userRoutes);
router.use("/ai", aiRoutes);
router.use("/admin", adminRoutes);
router.use("/uploads", uploadRoutes);
router.use("/reports", reportRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/newsletter", newsletterRoutes);
router.use("/contact", contactRoutes);
router.use("/blog", blogRoutes);
router.use("/meal-plans", mealPlanRoutes);

export default router;
