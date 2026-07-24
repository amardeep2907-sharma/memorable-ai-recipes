import { z } from "zod";

export const updateMeSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(80).optional(),
    bio: z.string().max(300).optional(),
    avatarUrl: z.string().optional(),
    preferences: z
      .object({
        cuisines: z.array(z.string()).optional(),
        diets: z.array(z.string()).optional(),
        allergies: z.array(z.string()).optional(),
      })
      .optional(),
  }),
});
