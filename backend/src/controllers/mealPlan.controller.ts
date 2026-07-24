import { Response } from "express";
import MealPlan from "../models/MealPlan";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthedRequest } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";

// GET /api/meal-plans/mine
export const listMyMealPlans = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const plans = await MealPlan.find({ user: req.user!.userId }).sort({ createdAt: -1 });
  res.json({ success: true, data: plans });
});

// GET /api/meal-plans/:id  (owner only)
export const getMealPlan = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const plan = await MealPlan.findById(req.params.id);
  if (!plan) throw ApiError.notFound("Meal plan not found");
  if (plan.user.toString() !== req.user!.userId) throw ApiError.forbidden();
  res.json({ success: true, data: plan });
});

// PATCH /api/meal-plans/:id  { goal?, days? }  (owner only - lets someone
// tweak a day's meals after generation without regenerating the whole plan)
export const updateMealPlan = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const plan = await MealPlan.findById(req.params.id);
  if (!plan) throw ApiError.notFound("Meal plan not found");
  if (plan.user.toString() !== req.user!.userId) throw ApiError.forbidden();

  const { goal, days } = req.body;
  if (goal !== undefined) plan.goal = goal;
  if (days !== undefined) plan.days = days;
  await plan.save();

  res.json({ success: true, data: plan });
});

// DELETE /api/meal-plans/:id  (owner only)
export const deleteMealPlan = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const plan = await MealPlan.findById(req.params.id);
  if (!plan) throw ApiError.notFound("Meal plan not found");
  if (plan.user.toString() !== req.user!.userId) throw ApiError.forbidden();
  await plan.deleteOne();
  res.json({ success: true, message: "Meal plan deleted" });
});
