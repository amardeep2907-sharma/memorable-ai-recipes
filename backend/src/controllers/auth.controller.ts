import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/generateTokens";
import { env } from "../config/env";

const googleClient = new OAuth2Client(env.google.clientId);

function setRefreshCookie(res: Response, token: string) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw ApiError.badRequest("name, email and password are required");

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: passwordHash });

  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });
  setRefreshCookie(res, refreshToken);

  res.status(201).json({ success: true, data: { user: { id: user.id, name: user.name, email: user.email }, accessToken } });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !user.password) throw ApiError.unauthorized("Invalid email or password");

  const matches = await bcrypt.compare(password, user.password);
  if (!matches) throw ApiError.unauthorized("Invalid email or password");

  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });
  setRefreshCookie(res, refreshToken);

  res.json({ success: true, data: { user: { id: user.id, name: user.name, email: user.email }, accessToken } });
});

export const googleLogin = asyncHandler(async (req: Request, res: Response) => {
  const { idToken } = req.body;
  if (!idToken) throw ApiError.badRequest("idToken is required");

  const ticket = await googleClient.verifyIdToken({ idToken, audience: env.google.clientId });
  const payload = ticket.getPayload();
  if (!payload?.email) throw ApiError.unauthorized("Invalid Google token");

  let user = await User.findOne({ email: payload.email });
  if (!user) {
    user = await User.create({
      name: payload.name ?? payload.email.split("@")[0],
      email: payload.email,
      googleId: payload.sub,
      avatarUrl: payload.picture ?? "",
      isVerified: true,
    });
  }

  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });
  setRefreshCookie(res, refreshToken);

  res.json({ success: true, data: { user: { id: user.id, name: user.name, email: user.email }, accessToken } });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw ApiError.unauthorized("Missing refresh token");
  }

  const payload = verifyRefreshToken(token);

  const accessToken = generateAccessToken({
    userId: payload.userId,
    role: payload.role,
  });

  res.json({
    success: true,
    data: { accessToken },
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Logged out" });
});
