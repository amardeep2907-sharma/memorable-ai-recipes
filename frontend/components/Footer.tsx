"use client";

import Link from "next/link";
import { ChefHat, Heart, Instagram, Twitter, Facebook, Github } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

export default function Footer() {
  const { t } = useLocale();

  return (
    <footer className="border-t border-line/60 bg-paper/80 pt-16 pb-12 text-sm text-ink/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          
          {/* Brand Info Column */}
          <div className="lg:col-span-4">
            <Link 
              href="/" 
              className="group inline-flex items-center gap-2.5 transition-transform duration-200 active:scale-95"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-plum/10 text-plum transition-colors group-hover:bg-plum group-hover:text-white">
                <ChefHat className="h-5 w-5" strokeWidth={2} />
              </div>
              <span className="font-display text-2xl italic font-semibold tracking-tight text-ink">
                Memorable
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/60">
              {t("footer.tagline") ?? "Discover, create, and share unforgettable culinary moments powered by AI."}
            </p>

            {/* Social Icons */}
            <div className="mt-6 flex items-center gap-3 text-ink/60">
              <a href="#" aria-label="Instagram" className="rounded-full border border-line p-2 transition-all hover:border-plum hover:bg-plum/10 hover:text-plum">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Twitter" className="rounded-full border border-line p-2 transition-all hover:border-plum hover:bg-plum/10 hover:text-plum">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Facebook" className="rounded-full border border-line p-2 transition-all hover:border-plum hover:bg-plum/10 hover:text-plum">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Github" className="rounded-full border border-line p-2 transition-all hover:border-plum hover:bg-plum/10 hover:text-plum">
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8 lg:gap-12">
            
            {/* Column 1: Explore */}
            <div className="flex flex-col gap-3">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-ink">
                {t("footer.explore") ?? "Explore"}
              </span>
              <Link href="/search" className="transition-colors hover:text-plum">
                {t("footer.search") ?? "Discover Recipes"}
              </Link>
              <Link href="/dashboard" className="transition-colors hover:text-plum">
                {t("footer.dashboard") ?? "My Kitchen"}
              </Link>
              <Link href="/blog" className="transition-colors hover:text-plum">
                {t("nav.blog") ?? "Culinary Blog"}
              </Link>
              <Link href="/ai-tools" className="transition-colors hover:text-plum">
                {t("nav.askAI") ?? "Ask AI Assistant"}
              </Link>
            </div>

            {/* Column 2: Company */}
            <div className="flex flex-col gap-3">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-ink">
                {t("footer.company") ?? "Company"}
              </span>
              <Link href="/about" className="transition-colors hover:text-plum">
                {t("footer.aboutUs") ?? "About Us"}
              </Link>
              <Link href="/contact" className="transition-colors hover:text-plum">
                {t("footer.contact") ?? "Contact"}
              </Link>
              <Link href="/privacy" className="transition-colors hover:text-plum">
                Privacy Policy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-plum">
                Terms of Service
              </Link>
            </div>

            {/* Column 3: Account */}
            <div className="flex flex-col gap-3">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-ink">
                {t("footer.account") ?? "Account"}
              </span>
              <Link href="/login" className="transition-colors hover:text-plum">
                {t("common.signIn") ?? "Sign In"}
              </Link>
              <Link href="/register" className="transition-colors hover:text-plum">
                {t("footer.createAccount") ?? "Create Account"}
              </Link>
              <Link href="/settings" className="transition-colors hover:text-plum">
                Settings
              </Link>
            </div>

          </div>

        </div>

        {/* Bottom Bar: Copyright */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line/60 pt-8 text-xs text-ink/50 sm:flex-row">
          <p>
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>

          <p className="flex items-center gap-1">
            Crafted with <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> for food lovers everywhere.
          </p>
        </div>

      </div>
    </footer>
  );
}