import { Response } from "express";
import crypto from "crypto";
import NewsletterSubscriber from "../models/NewsletterSubscriber";
import { emailService } from "../services/email.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { AuthedRequest } from "../middleware/auth";
import { env } from "../config/env";

function confirmationEmailHtml(unsubscribeUrl: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Welcome to the Memorable newsletter 👋</h2>
      <p>One email a week: a seasonal pick, a trending recipe, and a tip from the AI assistant.</p>
      <p style="color: #888; font-size: 12px; margin-top: 32px;">
        Didn't mean to sign up? <a href="${unsubscribeUrl}">Unsubscribe</a> any time.
      </p>
    </div>
  `;
}

// POST /api/newsletter/subscribe  { email }  (public)
export const subscribe = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { email } = req.body;

  let subscriber = await NewsletterSubscriber.findOne({ email });

  if (subscriber?.isActive) {
    return res.json({ success: true, message: "You're already subscribed." });
  }

  if (subscriber && !subscriber.isActive) {
    subscriber.isActive = true;
    subscriber.subscribedAt = new Date();
    subscriber.unsubscribedAt = undefined;
    await subscriber.save();
  } else {
    subscriber = await NewsletterSubscriber.create({
      email,
      unsubscribeToken: crypto.randomBytes(24).toString("hex"),
    });
  }

  const unsubscribeUrl = `${env.clientUrl}/unsubscribe/${subscriber.unsubscribeToken}`;
  // Best-effort: subscription is already saved above, so a flaky SMTP
  // provider doesn't turn a successful signup into a failed request.
  await emailService.send(email, "Welcome to the Memorable newsletter", confirmationEmailHtml(unsubscribeUrl));

  res.status(201).json({ success: true, message: "Subscribed! Check your inbox for a confirmation." });
});

// GET /api/newsletter/unsubscribe/:token  (public - link clicked from an email, no auth)
export const unsubscribe = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const subscriber = await NewsletterSubscriber.findOneAndUpdate(
    { unsubscribeToken: req.params.token },
    { isActive: false, unsubscribedAt: new Date() },
    { new: true }
  );
  if (!subscriber) throw ApiError.notFound("Invalid or already-used unsubscribe link");
  res.json({ success: true, message: "You've been unsubscribed." });
});

// GET /api/admin/newsletter/subscribers  (admin only)
export const listSubscribers = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { page = "1", limit = "50" } = req.query as Record<string, string>;
  const [subscribers, total] = await Promise.all([
    NewsletterSubscriber.find({ isActive: true })
      .sort({ subscribedAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit)),
    NewsletterSubscriber.countDocuments({ isActive: true }),
  ]);
  res.json({ success: true, data: subscribers, meta: { total } });
});
