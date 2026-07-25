import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/generateTokens";
import { env } from "../config/env";
import { sendEmail } from "../utils/SendEmail";

const googleClient = new OAuth2Client(env.google.clientId);

// Node environment check
const isProduction = env.nodeEnv === "production" || process.env.NODE_ENV === "production";

function setRefreshCookie(res: Response, token: string) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    // Production me HTTPS + sameSite none, Localhost par secure: false + sameSite lax
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
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

  try {
    const payload = verifyRefreshToken(token);

    const accessToken = generateAccessToken({
      userId: payload.userId,
      role: payload.role,
    });

    res.json({
      success: true,
      data: { accessToken },
    });
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
  res.json({ success: true, message: "Logged out" });
});

/* ==========================================
   ADDED FORGOT & RESET PASSWORD CONTROLLERS
========================================== */

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) throw ApiError.badRequest("Email is required");

  const user = await User.findOne({ email });
  // Security best practice: User exist nahi bhi kare to success respond karo taaki email enumeration vulnerability na ho
  if (!user) {
    res.json({
      success: true,
      message: "If an account with that email exists, we have sent a reset link.",
    });
    return;
  }

  // 1. Unhashed Token generate karo frontend me send karne ke liye
  const resetToken = crypto.randomBytes(32).toString("hex");

  // 2. Token ko hash karke DB me save karo
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 Minutes Expiry
  await user.save();

  // 3. Reset URL
  const resetUrl = `${env.clientUrl}/reset-password?token=${resetToken}`;

  // 4. Email send karo with Styled HTML Action Button
  try {
    await sendEmail({
      to: user.email,
      subject: "Reset Your Password - Recipe App",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 12px;">
          <h2 style="color: #1c1917; margin-bottom: 12px;">Reset Your Password</h2>
          <p style="font-size: 14px; color: #57534e; line-height: 1.5;">
            You requested a password reset for your Recipe App account. Click the button below to choose a new password:
          </p>
          <div style="margin: 28px 0;">
            <a href="${resetUrl}" 
               target="_blank" 
               style="background-color: #f97316; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 12px; color: #78716c;">
            If the button above does not work, copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; color: #0284c7; word-break: break-all;">
            <a href="${resetUrl}" target="_blank" style="color: #0284c7;">${resetUrl}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #f5f5f4; margin: 20px 0;" />
          <p style="font-size: 11px; color: #a8a29e;">
            This link is valid for 15 minutes. If you did not request this email, please ignore it.
          </p>
        </div>
      `,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    throw ApiError.internal("Email could not be sent. Please try again later.");
  }

  res.json({
    success: true,
    message: "If an account with that email exists, we have sent a reset link.",
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    throw ApiError.badRequest("Token and new password are required");
  }

  // 1. Incoming raw token ko hash karo DB match ke liye
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // 2. Token match aur expiry check karo
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    throw ApiError.badRequest("Invalid or expired password reset token");
  }

  // 3. Password Hash aur Save karo
  user.password = await bcrypt.hash(newPassword, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: "Password reset successful. You can now login with your new password.",
  });
});