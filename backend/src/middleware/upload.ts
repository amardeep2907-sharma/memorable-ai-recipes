import multer from "multer";
import { ApiError } from "../utils/ApiError";

// Files are buffered in memory, then handed to cloudinaryService as a base64
// data URI - no need to touch disk. 5MB cap keeps recipe/avatar photos
// reasonable; raise it if you start accepting larger originals.
const storage = multer.memoryStorage();

function imageFileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new ApiError(400, "Only image uploads are allowed"));
  }
  cb(null, true);
}

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

function videoFileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (!file.mimetype.startsWith("video/")) {
    return cb(new ApiError(400, "Only video uploads are allowed"));
  }
  cb(null, true);
}

// Recipe videos are short clips, not full episodes - 50MB keeps this
// reasonable for in-memory buffering. Raise it (and consider streaming
// straight to Cloudinary instead of buffering) if that's too restrictive.
export const uploadVideo = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: videoFileFilter,
});
