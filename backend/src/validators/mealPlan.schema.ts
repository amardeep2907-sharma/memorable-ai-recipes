import { z } from "zod";

const mealDaySchema = z.object({
  day: z.number(),
  breakfast: z.string().max(300).optional().default(""),
  lunch: z.string().max(300).optional().default(""),
  dinner: z.string().max(300).optional().default(""),
});

export const updateMealPlanSchema = z.object({
  body: z.object({
    goal: z.string().trim().min(1).max(150).optional(),
    days: z.array(mealDaySchema).optional(),
  }),
});
