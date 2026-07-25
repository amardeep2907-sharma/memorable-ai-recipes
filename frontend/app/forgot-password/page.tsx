"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { authApi } from "@/lib/api"; // ya aapka api module path
import { useLocale } from "@/context/LocaleContext";

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await authApi.forgotPassword(email);
      setMessage(res.message || "Reset link sent! Please check your email inbox.");
    } catch {
      setError("Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-stone-100 p-4 sm:p-6 lg:p-8">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl shadow-2xl border border-white/60 grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* LEFT COLUMN: Image Hero Section */}
        <div className="relative hidden lg:block lg:col-span-6 overflow-hidden bg-stone-900">
          <Image
            src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200&auto=format&fit=crop"
            alt="Artisanal Recipe Dish"
            fill
            priority
            className="object-cover opacity-90 transition-transform duration-1000 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          <div className="absolute bottom-8 left-8 right-8 z-10 text-white space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wide backdrop-blur-md border border-white/20">
              🔑 Account Recovery
            </span>
            <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight text-white/95">
              Reset Your Password Securely.
            </h2>
            <p className="text-xs text-white/70 line-clamp-2">
              We'll send you a safe, time-sensitive link to help you log back in and continue cooking.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Form */}
        <div className="lg:col-span-6 flex flex-col justify-center p-8 sm:p-12 lg:p-14">
          <div className="w-full max-w-sm mx-auto">
            <div className="space-y-2 text-left">
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
                {t("auth.forgotPassword") || "Forgot Password?"}
              </h1>
              <p className="text-sm text-stone-500">
                Enter your registered email address and we'll send you a password reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                  {t("common.email")}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-stone-200 bg-white/80 px-4 py-3 text-sm text-stone-800 placeholder-stone-400 transition-all focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 shadow-sm"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-600">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-medium text-emerald-700">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full relative flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3.5 px-4 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:from-amber-600 hover:to-orange-700 active:scale-[0.99] transition-all disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending link...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-stone-600">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-semibold text-amber-600 hover:text-amber-700 hover:underline transition-colors"
              >
                {t("common.signIn") || "Sign In"}
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}