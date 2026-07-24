import { Response, Request } from "express";
import PageView from "../models/PageView";
import { asyncHandler } from "../utils/asyncHandler";

// POST /api/analytics/track  { path: "/recipes/123" }  - public, fire-and-forget
export const trackPageView = asyncHandler(async (req: Request, res: Response) => {
  const path = typeof req.body?.path === "string" ? req.body.path.slice(0, 300) : "/";
  await PageView.create({ path });
  res.status(201).json({ success: true });
});
