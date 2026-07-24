import { z } from "zod";

export const cookingAssistantSchema = z.object({
  body: z.object({
    ingredients: z.string().trim().min(1, "ingredients is required"),
    dietaryNotes: z.string().optional(),
  }),
});

export const substituteSchema = z.object({
  body: z.object({
    missingIngredient: z.string().trim().min(1, "missingIngredient is required"),
    context: z.string().optional(),
  }),
});

export const mealPlanSchema = z.object({
  body: z.object({
    goal: z.string().trim().min(1, "goal is required"),
    days: z.number().min(1).max(30).optional().default(7),
  }),
});

export const summarizeSchema = z.object({
  body: z.object({
    recipeText: z.string().trim().min(1, "recipeText is required"),
  }),
});

export const nutritionExplainerSchema = z.object({
  body: z.object({
    nutritionFacts: z.string().trim().min(1, "nutritionFacts is required"),
  }),
});

export const smartSearchSchema = z.object({
  body: z.object({
    query: z.string().trim().min(1, "query is required"),
  }),
});

export const chatSchema = z.object({
  body: z.object({
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().trim().min(1).max(2000),
        })
      )
      .min(1, "messages must include at least one entry")
      .max(30, "conversation is too long for a single request"),
  }),
});
