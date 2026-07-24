import { Router } from "express";
import { trackPageView } from "../controllers/analytics.controller";

const router = Router();

router.post("/track", trackPageView);

export default router;
