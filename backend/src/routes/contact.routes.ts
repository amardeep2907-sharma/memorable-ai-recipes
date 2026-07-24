import { Router } from "express";
import { submitContactMessage } from "../controllers/contact.controller";
import { validate } from "../middleware/validate";
import { submitContactSchema } from "../validators/contact.schema";
import { authLimiter } from "../middleware/rateLimiter";

const router = Router();

// Reuses the auth rate-limit tier - generous for real visitors, tight
// enough to discourage the endpoint being scripted for spam.
router.post("/", authLimiter, validate(submitContactSchema), submitContactMessage);

export default router;
