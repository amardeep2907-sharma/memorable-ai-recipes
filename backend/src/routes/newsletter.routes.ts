import { Router } from "express";
import { subscribe, unsubscribe } from "../controllers/newsletter.controller";
import { validate } from "../middleware/validate";
import { subscribeSchema } from "../validators/newsletter.schema";
import { authLimiter } from "../middleware/rateLimiter";

const router = Router();

// Reuses the auth rate limiter tier (20/15min) - generous for real signups,
// tight enough to discourage scripting the endpoint.
router.post("/subscribe", authLimiter, validate(subscribeSchema), subscribe);
router.get("/unsubscribe/:token", unsubscribe);

export default router;
