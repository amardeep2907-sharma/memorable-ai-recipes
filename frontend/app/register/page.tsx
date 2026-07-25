"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const { t } = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerUser(name, email, password);
      router.push("/dashboard");
    } catch {
      setError("Could not create your account. That email may already be in use.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-stone-100 p-4 sm:p-6 lg:p-8">
      {/* Main Container Card */}
      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl shadow-2xl border border-white/60 grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
        
        {/* LEFT COLUMN: Food/Recipe Hero Section */}
        <div className="relative hidden lg:block lg:col-span-6 overflow-hidden bg-stone-900">
          <Image
            src="https://images.unsplash.com/photo-1546549032-9571cd6b27df?q=80&w=1200&auto=format&fit=crop"
            alt="Artisan Gourmet Recipe"
            fill
            priority
            className="object-cover opacity-90 transition-transform duration-1000 hover:scale-105"
          />
          {/* Subtle Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          {/* Floating Branding & Quote Badge */}
          <div className="absolute bottom-8 left-8 right-8 z-10 text-white space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wide backdrop-blur-md border border-white/20">
              🍳 Start Your Culinary Journey
            </span>
            <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight text-white/95">
              Unlock Thousands of Handcrafted Recipes & Tips.
            </h2>
            <p className="text-xs text-white/70 line-clamp-2">
              Create custom meal plans, save your favorite secret ingredients, and join a thriving community of home chefs.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Form Section */}
        <div className="lg:col-span-6 flex flex-col justify-center p-8 sm:p-12 lg:p-14">
          <div className="w-full max-w-sm mx-auto">
            {/* Header */}
            <div className="space-y-2 text-left">
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
                {t("auth.joinTitle")}
              </h1>
              <p className="text-sm text-stone-500">
                {t("auth.registerSubtitle")}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                  {t("common.name")}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Chef John"
                  className="w-full rounded-xl border border-stone-200 bg-white/80 px-4 py-3 text-sm text-stone-800 placeholder-stone-400 transition-all focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 shadow-sm"
                />
              </div>

              {/* Email Input */}
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

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                  {t("common.password")}
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-stone-200 bg-white/80 px-4 py-3 text-sm text-stone-800 placeholder-stone-400 transition-all focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 shadow-sm"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-600">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full relative flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3.5 px-4 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:from-amber-600 hover:to-orange-700 active:scale-[0.99] transition-all disabled:opacity-70 disabled:pointer-events-none mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t("auth.creatingAccount")}
                  </span>
                ) : (
                  t("footer.createAccount")
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-stone-200" />
              <span className="text-xs uppercase tracking-wider text-stone-400 font-medium">
                {t("auth.or")}
              </span>
              <span className="h-px flex-1 bg-stone-200" />
            </div>

            {/* Google OAuth Button */}
            <div className="w-full">
              <GoogleSignInButton />
            </div>

            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-stone-600">
              {t("auth.alreadyHaveAccount")}{" "}
              <Link
                href="/login"
                className="font-semibold text-amber-600 hover:text-amber-700 hover:underline transition-colors"
              >
                {t("common.signIn")}
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}