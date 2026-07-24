import { Response } from "express";
import BlogPost from "../models/BlogPost";
import Notification from "../models/Notification";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthedRequest } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";

function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// GET /api/blog?page=&limit=  (public - published only)
export const listPosts = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { page = "1", limit = "10" } = req.query as Record<string, string>;
  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Number(limit), 30);

  const [posts, total] = await Promise.all([
    BlogPost.find({ status: "published" })
      .populate("author", "name avatarUrl")
      .select("title slug excerpt coverImageUrl author publishedAt")
      .sort({ publishedAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    BlogPost.countDocuments({ status: "published" }),
  ]);

  res.json({ success: true, data: posts, meta: { page: pageNum, limit: limitNum, total } });
});

// GET /api/blog/:slug  (public - published only)
export const getPostBySlug = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const post = await BlogPost.findOne({ slug: req.params.slug, status: "published" }).populate(
    "author",
    "name avatarUrl"
  );
  if (!post) throw ApiError.notFound("Post not found");
  res.json({ success: true, data: post });
});

// POST /api/blog  (any signed-in user - same moderation model as recipes:
// it's saved as a draft and only goes live once an admin approves it)
export const createPost = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { title, excerpt, content, coverImageUrl } = req.body;

  let slug = slugify(title);
  const existing = await BlogPost.findOne({ slug });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const post = await BlogPost.create({
    title,
    slug,
    excerpt,
    content,
    coverImageUrl,
    status: "draft",
    author: req.user!.userId,
  });

  res.status(201).json({ success: true, data: post });
});

// GET /api/blog/me/mine  (signed-in - the author's own posts, any status,
// so they can see what's still pending review)
export const getMyPosts = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const posts = await BlogPost.find({ author: req.user!.userId }).sort({ createdAt: -1 });
  res.json({ success: true, data: posts });
});

// PATCH /api/blog/:id  (author only - editing a live post pulls it back to
// draft for re-approval, same reasoning as re-reviewing an edited recipe)
export const updatePost = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) throw ApiError.notFound("Post not found");
  if (post.author.toString() !== req.user!.userId) throw ApiError.forbidden();

  const wasPublished = post.status === "published";
  const { title, excerpt, content, coverImageUrl } = req.body;
  if (title !== undefined) post.title = title;
  if (excerpt !== undefined) post.excerpt = excerpt;
  if (content !== undefined) post.content = content;
  if (coverImageUrl !== undefined) post.coverImageUrl = coverImageUrl;

  if (wasPublished) {
    post.status = "draft";
    post.publishedAt = undefined;
  }

  await post.save();
  res.json({ success: true, data: post, wasResubmittedForReview: wasPublished });
});

// DELETE /api/blog/:id  (author or admin)
export const deletePost = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) throw ApiError.notFound("Post not found");
  if (post.author.toString() !== req.user!.userId && req.user!.role !== "admin") {
    throw ApiError.forbidden();
  }
  await post.deleteOne();
  res.json({ success: true, message: "Post deleted" });
});

// --- Admin moderation --------------------------------------------------

// GET /api/admin/blog  (admin only - every post, any status)
export const adminListPosts = asyncHandler(async (_req: AuthedRequest, res: Response) => {
  const posts = await BlogPost.find().populate("author", "name email").sort({ createdAt: -1 });
  res.json({ success: true, data: posts });
});

// GET /api/admin/blog/pending  (admin only - draft posts awaiting review)
export const adminListPending = asyncHandler(async (_req: AuthedRequest, res: Response) => {
  const posts = await BlogPost.find({ status: "draft" })
    .populate("author", "name email")
    .sort({ createdAt: -1 });
  res.json({ success: true, data: posts });
});

// PATCH /api/admin/blog/:id/approve  (admin only)
export const approvePost = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const post = await BlogPost.findByIdAndUpdate(
    req.params.id,
    { status: "published", publishedAt: new Date() },
    { new: true }
  );
  if (!post) throw ApiError.notFound("Post not found");

  await Notification.create({
    user: post.author,
    type: "blog_post_approved",
    message: `Your post "${post.title}" was approved and is now live.`,
    relatedBlogPost: post.id,
  });

  res.json({ success: true, data: post });
});

// PATCH /api/admin/blog/:id  (admin only - full edit override, e.g. fixing
// a typo without bouncing it back through the author's review cycle)
export const adminUpdatePost = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!post) throw ApiError.notFound("Post not found");
  res.json({ success: true, data: post });
});

// DELETE /api/admin/blog/:id  (admin only)
export const adminDeletePost = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const post = await BlogPost.findByIdAndDelete(req.params.id);
  if (!post) throw ApiError.notFound("Post not found");
  res.json({ success: true, message: "Post deleted" });
});
