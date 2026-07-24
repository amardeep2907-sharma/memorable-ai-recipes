import nodemailer, { Transporter } from "nodemailer";
import { env } from "../config/env";

let transporter: Transporter | null = null;
let warnedMissingConfig = false;

function getTransporter(): Transporter | null {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) {
    if (!warnedMissingConfig) {
      console.warn(
        "[email] SMTP_HOST/SMTP_USER/SMTP_PASS not set - emails will be logged, not sent. " +
          "Set them in .env (any provider works: Gmail app password, SendGrid, Resend's SMTP mode, etc.)."
      );
      warnedMissingConfig = true;
    }
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  }

  return transporter;
}

export const emailService = {
  // Best-effort by design: a subscribe/register/etc. request should still
  // succeed even if the email itself fails to send (bad SMTP creds, provider
  // downtime) - the caller decides whether that failure matters, this just
  // never throws.
  async send(to: string, subject: string, html: string): Promise<boolean> {
    const t = getTransporter();
    if (!t) {
      console.log(`[email] (not sent - no SMTP configured) To: ${to} | Subject: ${subject}`);
      return false;
    }

    try {
      await t.sendMail({ from: env.smtp.user, to, subject, html });
      return true;
    } catch (err) {
      console.error(`[email] failed to send to ${to}:`, err);
      return false;
    }
  },
};
