import { z } from "zod";

// User-facing: no `status` field - new posts always start as a draft
// pending admin approval, and the controller enforces that server-side
// regardless of what's sent here.
export const createBlogPostSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Title is required").max(150),
    excerpt: z.string().max(300).optional().default(""),
    content: z.string().trim().min(1, "Content is required"),
    coverImageUrl: z.string().optional().default(""),
  }),
});

export const updateBlogPostSchema = z.object({
  body: createBlogPostSchema.shape.body.partial(),
});

// Admin-only: can also directly set status (e.g. unpublishing, or fixing
// something without bouncing it through the author's review cycle).
export const adminUpdateBlogPostSchema = z.object({
  body: createBlogPostSchema.shape.body.partial().extend({
    status: z.enum(["draft", "published"]).optional(),
  }),
});
