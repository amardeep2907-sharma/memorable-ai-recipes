import { Router } from "express";
import { register, login, googleLogin, refresh, logout } from "../controllers/auth.controller";
import { authLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import { registerSchema, loginSchema, googleLoginSchema } from "../validators/auth.schema";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/google", authLimiter, validate(googleLoginSchema), googleLogin);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
