import { Router } from "express";
import { listMyMealPlans, getMealPlan, updateMealPlan, deleteMealPlan } from "../controllers/mealPlan.controller";
import { requireAuth } from "../middleware/auth";
import { requireMongoId } from "../middleware/validateObjectId";
import { validate } from "../middleware/validate";
import { updateMealPlanSchema } from "../validators/mealPlan.schema";

const router = Router();

router.use(requireAuth);

router.get("/mine", listMyMealPlans);
router.get("/:id", requireMongoId("id"), getMealPlan);
router.patch("/:id", requireMongoId("id"), validate(updateMealPlanSchema), updateMealPlan);
router.delete("/:id", requireMongoId("id"), deleteMealPlan);

export default router;
