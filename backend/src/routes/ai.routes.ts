import { Router } from "express";
import {
  cookingAssistant, ingredientSubstitute, mealPlan, recipeSummary, nutritionExplainer,
  getAIHistory, smartSearch, chat,
} from "../controllers/ai.controller";
import { requireAuth } from "../middleware/auth";
import { aiLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import {
  cookingAssistantSchema, substituteSchema, mealPlanSchema, summarizeSchema,
  nutritionExplainerSchema, smartSearchSchema, chatSchema,
} from "../validators/ai.schema";

const router = Router();

router.use(requireAuth, aiLimiter);

router.post("/cooking-assistant", validate(cookingAssistantSchema), cookingAssistant);
router.post("/substitute", validate(substituteSchema), ingredientSubstitute);
router.post("/meal-plan", validate(mealPlanSchema), mealPlan);
router.post("/summarize", validate(summarizeSchema), recipeSummary);
router.post("/nutrition-explainer", validate(nutritionExplainerSchema), nutritionExplainer);
router.post("/smart-search", validate(smartSearchSchema), smartSearch);
router.post("/chat", validate(chatSchema), chat);
router.get("/history", getAIHistory);

export default router;
