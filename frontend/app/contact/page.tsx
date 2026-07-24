"use client";

import { useState } from "react";
import { Mail, Check } from "lucide-react";
import { contactApi } from "@/lib/api";
import { useLocale } from "@/context/LocaleContext";

export default function ContactPage() {
  const { t } = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await contactApi.submit(name.trim(), email.trim(), subject.trim(), message.trim());
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <Check className="h-8 w-8 text-sage" />
        <h1 className="mt-4 font-display text-2xl italic">{t("contact.sentTitle")}</h1>
        <p className="mt-2 text-sm text-ink/60">{t("contact.sentSubtitle")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-plum">
        <Mail className="h-3.5 w-3.5" /> {t("contact.title")}
      </p>
      <h1 className="mt-2 font-display text-4xl italic">{t("contact.heading")}</h1>
      <p className="mt-3 text-sm text-ink/60">{t("contact.subtitle")}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-wide text-ink/50">{t("common.name")}</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-white/60 px-3 py-2 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-ink/50">{t("common.email")}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-white/60 px-3 py-2 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-ink/50">{t("contact.subject")}</label>
          <input
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-white/60 px-3 py-2 text-sm focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-ink/50">{t("contact.message")}</label>
          <textarea
            required
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-white/60 p-3 text-sm focus:outline-none"
          />
        </div>

        {status === "error" && (
          <p className="text-sm text-plum">Something went wrong — please try again.</p>
        )}

        <button type="submit" disabled={status === "loading"} className="btn-primary w-full">
          {status === "loading" ? t("contact.sending") : t("contact.send")}
        </button>
      </form>
    </div>
  );
}
