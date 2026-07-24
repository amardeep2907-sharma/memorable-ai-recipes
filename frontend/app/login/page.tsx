"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-12">
      <h1 className="font-display text-3xl italic">{t("auth.welcomeBack")}</h1>
      <p className="mt-2 text-sm text-ink/60">{t("auth.loginSubtitle")}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
        <div>
          <label className="text-xs uppercase tracking-wide text-ink/50">{t("common.password")}</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-white/60 px-3 py-2 text-sm focus:outline-none"
          />
        </div>
        {error && <p className="text-xs text-plum">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? t("auth.signingIn") : t("common.signIn")}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs uppercase tracking-wide text-ink/40">{t("auth.or")}</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <GoogleSignInButton />

      <p className="mt-6 text-center text-sm text-ink/60">
        {t("auth.newHere")} <Link href="/register" className="text-plum hover:underline">{t("auth.createAccount")}</Link>
      </p>
    </div>
  );
}
