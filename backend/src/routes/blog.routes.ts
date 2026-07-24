import { Router } from "express";
import { listPosts, getPostBySlug, createPost, getMyPosts, updatePost, deletePost } from "../controllers/blog.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createBlogPostSchema, updateBlogPostSchema } from "../validators/blog.schema";

const router = Router();

// Specific paths before the generic "/:slug".
router.get("/me/mine", requireAuth, getMyPosts);

router.get("/", listPosts);
router.post("/", requireAuth, validate(createBlogPostSchema), createPost);
router.get("/:slug", getPostBySlug);
router.patch("/:id", requireAuth, validate(updateBlogPostSchema), updatePost);
router.delete("/:id", requireAuth, deletePost);

export default router;
