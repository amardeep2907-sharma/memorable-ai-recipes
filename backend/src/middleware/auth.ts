import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyAccessToken } from "../utils/generateTokens";

export interface AuthedRequest extends Request {
  user?: { userId: string; role: "user" | "admin" };
}

export function requireAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) throw ApiError.unauthorized("Missing access token");

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    throw ApiError.unauthorized("Invalid or expired access token");
  }
}

// For routes that are public but behave differently for a signed-in viewer
// (e.g. a recipe detail page wants to know "did I like/save this?"). Unlike
// requireAuth, a missing or invalid token is not an error here - it just
// leaves req.user unset.
export function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (token) {
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // ignore - treat as anonymous
    }
  }
  next();
}

export function requireAdmin(req: AuthedRequest, _res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") throw ApiError.forbidden("Admin access required");
  next();
}
