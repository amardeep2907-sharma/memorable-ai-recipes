import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { uploadImage, uploadVideo } from "../middleware/upload";
import { uploadRecipeImage, uploadRecipeVideo } from "../controllers/upload.controller";

const router = Router();

router.post("/image", requireAuth, uploadImage.single("image"), uploadRecipeImage);
router.post("/video", requireAuth, uploadVideo.single("video"), uploadRecipeVideo);

export default router;
