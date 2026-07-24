import { z } from "zod";

export const submitContactSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Name is required").max(100),
    email: z.string().trim().email("Invalid email address"),
    subject: z.string().trim().min(1, "Subject is required").max(150),
    message: z.string().trim().min(1, "Message is required").max(3000),
  }),
});

export const updateContactStatusSchema = z.object({
  body: z.object({
    status: z.enum(["new", "read", "resolved"]),
  }),
});
