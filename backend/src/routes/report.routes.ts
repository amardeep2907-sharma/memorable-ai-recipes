import { Router } from "express";
import { createReport } from "../controllers/report.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createReportSchema } from "../validators/report.schema";

const router = Router();

router.post("/", requireAuth, validate(createReportSchema), createReport);

export default router;
