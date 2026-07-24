import { Response } from "express";
import Report from "../models/Report";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthedRequest } from "../middleware/auth";

// POST /api/reports  (any signed-in user)
export const createReport = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { targetType, targetId, reason } = req.body;
  const report = await Report.create({
    reportedBy: req.user!.userId,
    targetType,
    targetId,
    reason,
  });
  res.status(201).json({ success: true, data: report });
});

// GET /api/admin/reports?status=pending  (admin only)
export const listReports = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { status = "pending" } = req.query as Record<string, string>;
  const reports = await Report.find({ status })
    .populate("reportedBy", "name email")
    .sort({ createdAt: -1 });
  res.json({ success: true, data: reports });
});

// PATCH /api/admin/reports/:id  { status: "resolved" | "dismissed" }  (admin only)
export const updateReportStatus = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const report = await Report.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json({ success: true, data: report });
});
