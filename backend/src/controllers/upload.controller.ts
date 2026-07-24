import { Response } from "express";
import { cloudinaryService } from "../services/cloudinary.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthedRequest } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";

// POST /api/uploads/image  (multipart/form-data, field name "image")
// Optional body field "folder": "recipes" | "avatars" (defaults to "recipes")
export const uploadRecipeImage = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const file = (req as AuthedRequest & { file?: Express.Multer.File }).file;
  if (!file) throw ApiError.badRequest("No image file provided (expected field 'image')");

  const folder = req.body.folder === "avatars" ? "avatars" : "recipes";
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

  const result = await cloudinaryService.uploadImage(dataUri, folder);
  res.status(201).json({ success: true, data: result });
});

// POST /api/uploads/video  (multipart/form-data, field name "video", max 50MB)
export const uploadRecipeVideo = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const file = (req as AuthedRequest & { file?: Express.Multer.File }).file;
  if (!file) throw ApiError.badRequest("No video file provided (expected field 'video')");

  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  const result = await cloudinaryService.uploadVideo(dataUri);
  res.status(201).json({ success: true, data: result });
});
