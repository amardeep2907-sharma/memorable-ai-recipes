import { z } from "zod";

const ingredientSchema = z.object({
  name: z.string().trim().min(1),
  quantity: z.string().trim().optional(),
  unit: z.string().trim().optional(),
});

export const createRecipeSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Title is required").max(150),
    description: z.string().max(1000).optional().default(""),
    imageUrl: z.string().optional().default(""),
    images: z.array(z.string()).optional().default([]),
    videoUrl: z.string().optional().default(""),
    cuisine: z.array(z.string()).optional().default([]),
    mealType: z.array(z.string()).optional().default([]),
    diets: z.array(z.string()).optional().default([]),
    seasons: z.array(z.enum(["Spring", "Summer", "Autumn", "Winter"])).optional().default([]),
    prepTimeMinutes: z.number().min(0).optional().default(0),
    cookTimeMinutes: z.number().min(0).optional().default(0),
    servings: z.number().min(1).optional().default(2),
    difficulty: z.enum(["easy", "medium", "hard"]).optional().default("easy"),
    ingredients: z.array(ingredientSchema).min(1, "At least one ingredient is required"),
    steps: z.array(z.string().min(1)).min(1, "At least one step is required"),
    nutrition: z
      .object({
        calories: z.number().min(0).optional(),
        protein: z.number().min(0).optional(),
        carbs: z.number().min(0).optional(),
        fat: z.number().min(0).optional(),
      })
      .optional()
      .default({}),
    status: z.enum(["draft", "published"]).optional().default("published"),
  }),
});

export const updateRecipeSchema = z.object({
  body: createRecipeSchema.shape.body.partial(),
});

export const reviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5),
    text: z.string().max(1000).optional(),
  }),
});
