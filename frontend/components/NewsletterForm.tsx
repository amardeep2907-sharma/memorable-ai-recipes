"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Mail, ArrowRight, AlertCircle, Sparkles, Check } from "lucide-react";
import { newsletterApi } from "@/lib/api";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await newsletterApi.subscribe(email.trim());
      setMessage(res.message ?? "Welcome to our kitchen newsletter!");
      setStatus("done");
      setEmail("");
    } catch {
      setMessage("Something went wrong — please try again.");
      setStatus("error");
    }
  }

  /* Success State Card */
  if (status === "done") {
    return (
      <div className="mt-6 w-full max-w-md mx-auto animate-in fade-in zoom-in-95 duration-300">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent p-6 text-center shadow-xl backdrop-blur-xl">
          {/* Subtle Background Glow */}
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 shadow-inner ring-1 ring-emerald-500/30">
              <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
            </div>

            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              You're on the list!
            </h3>
            
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 max-w-[280px]">
              {message}
            </p>

            <button
              type="button"
              onClick={() => {
                setStatus("idle");
                setMessage(null);
              }}
              className="mt-4 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 px-4 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-900 transition-all shadow-sm"
            >
              Subscribe another email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="group relative">
        {/* Subtle Outer Glow Effect on Hover/Focus */}
        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 opacity-0 blur transition duration-500 group-hover:opacity-100 focus-within:opacity-100" />

        <div className="relative flex items-center rounded-full border border-neutral-200/80 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 p-1.5 shadow-lg shadow-black/5 backdrop-blur-xl transition-all focus-within:border-neutral-400 dark:focus-within:border-neutral-600">
          
          {/* Email Icon with Subtle Highlight */}
          <div className="pl-3.5 pr-2 text-neutral-400 dark:text-neutral-500">
            <Mail className="h-4 w-4" />
          </div>

          {/* Input Field */}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address..."
            className="w-full bg-transparent text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none"
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === "loading" || !email.trim()}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-neutral-900 dark:bg-white px-5 py-2.5 text-xs font-medium text-white dark:text-neutral-900 shadow-md transition-all hover:bg-neutral-800 dark:hover:bg-neutral-100 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin text-current" />
            ) : (
              <>
                <span>Join</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Trust Badge / Micro Text */}
      <div className="mt-2.5 flex items-center justify-between px-4 text-[11px] text-neutral-400 dark:text-neutral-500">
        <span className="flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-amber-500" /> Weekly recipes & kitchen tips
        </span>
        <span className="flex items-center gap-1">
          <Check className="h-3 w-3 text-emerald-500" /> No spam
        </span>
      </div>

      {/* Error Feedback Message */}
      {status === "error" && (
        <div className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}