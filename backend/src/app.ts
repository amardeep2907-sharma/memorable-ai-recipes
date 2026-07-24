import "express-async-errors";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
// @ts-expect-error - no bundled types
import xss from "xss-clean";

import { env } from "./config/env";
import routes from "./routes";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";
import { generalLimiter } from "./middleware/rateLimiter";

const app: Application = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
app.use(generalLimiter);

app.get("/health", (_req, res) => res.json({ success: true, message: "Memorable API is running" }));
app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
