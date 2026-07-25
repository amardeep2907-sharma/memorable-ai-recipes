import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyAccessToken } from "../utils/generateTokens";

// Standardize AuthedRequest with Express generics support for body, params, and query
export interface AuthedRequest<
  P = Record<string, any>,
  ResBody = any,
  ReqBody = any,
  ReqQuery = Record<string, any>
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: {
    id?: string;
    userId: string;
    role: "user" | "admin";
  };
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