import { Response } from "express";
import ContactMessage from "../models/ContactMessage";
import { emailService } from "../services/email.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthedRequest } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

function notificationEmailHtml(name: string, email: string, subject: string, message: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>New contact form submission</h2>
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p style="white-space: pre-line; border-left: 3px solid #7A2E3B; padding-left: 12px;">${message}</p>
    </div>
  `;
}

// POST /api/contact  (public)
export const submitContactMessage = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { name, email, subject, message } = req.body;

  await ContactMessage.create({ name, email, subject, message });

  // Best-effort: the message is already saved above, so a flaky SMTP
  // provider doesn't turn a successful submission into a failed request -
  // it just won't get emailed until an admin checks the dashboard instead.
  if (env.contactEmail) {
    await emailService.send(
      env.contactEmail,
      `[Memorable contact] ${subject}`,
      notificationEmailHtml(name, email, subject, message)
    );
  }

  res.status(201).json({ success: true, message: "Thanks - we'll get back to you soon." });
});

// GET /api/admin/contact-messages?status=new  (admin only)
export const listContactMessages = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { status } = req.query as Record<string, string>;
  const filter = status ? { status } : {};
  const messages = await ContactMessage.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: messages });
});

// PATCH /api/admin/contact-messages/:id  { status }  (admin only)
export const updateContactMessageStatus = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const message = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!message) throw ApiError.notFound("Message not found");
  res.json({ success: true, data: message });
});
