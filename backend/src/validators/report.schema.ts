import { z } from "zod";

export const createReportSchema = z.object({
  body: z.object({
    targetType: z.enum(["recipe", "comment", "review", "user"]),
    targetId: z.string().min(1),
    reason: z.string().trim().min(1, "Please describe the issue").max(500),
  }),
});
