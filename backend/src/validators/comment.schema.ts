import { z } from "zod";

export const addCommentSchema = z.object({
  body: z.object({
    text: z.string().trim().min(1, "Comment can't be empty").max(500),
    parentComment: z.string().optional(),
  }),
});
