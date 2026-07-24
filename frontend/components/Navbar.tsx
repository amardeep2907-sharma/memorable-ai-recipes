"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChefHat,
  Bookmark,
  User,
  LogOut,
  ShieldAlert,
  Settings,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  PlusCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLocale();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  async function handleLogout() {
    await logout();
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line/60 bg-paper/85 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        
        {/* Brand Logo Text - Direct Home Page Redirect */}
        <Link 
          href="/" 
          aria-label="Go to Home Page"
          className="group flex shrink-0 items-center gap-2 transition-transform duration-200 active:scale-95"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-plum/10 text-plum shadow-inner transition-all duration-300 group-hover:bg-plum group-hover:text-white group-hover:shadow-md group-hover:shadow-plum/20">
            <ChefHat className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" strokeWidth={2} />
          </div>
          <span className="font-display text-xl sm:text-2xl italic font-bold tracking-tight text-ink transition-colors group-hover:text-plum">
            Memorable<span className="text-plum">.</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 font-sans text-xs font-semibold tracking-wide text-ink/75 lg:flex">
          <Link 
            href="/search" 
            className="rounded-xl px-3 py-2 transition-all duration-200 hover:bg-plum/5 hover:text-plum active:scale-95 whitespace-nowrap"
          >
            {t("nav.discover")}
          </Link>
          
          {isAuthenticated && (
            <Link 
              href="/feed" 
              className="rounded-xl px-3 py-2 transition-all duration-200 hover:bg-plum/5 hover:text-plum active:scale-95 whitespace-nowrap"
            >
              {t("nav.feed")}
            </Link>
          )}

          <Link 
            href="/dashboard" 
            className="rounded-xl px-3 py-2 transition-all duration-200 hover:bg-plum/5 hover:text-plum active:scale-95 whitespace-nowrap"
          >
            {t("nav.myKitchen")}
          </Link>
          
          <Link 
            href="/blog" 
            className="rounded-xl px-3 py-2 transition-all duration-200 hover:bg-plum/5 hover:text-plum active:scale-95 whitespace-nowrap"
          >
            {t("nav.blog")}
          </Link>

          {/* AI Tool Link */}
          <Link 
            href="/ai-tools" 
            className="group ml-1 flex items-center gap-1.5 rounded-full border border-plum/20 bg-plum/10 px-3 py-1.5 text-xs font-semibold text-plum transition-all duration-300 hover:border-plum/40 hover:bg-plum hover:text-white hover:shadow-md hover:shadow-plum/20 active:scale-95 whitespace-nowrap"
          >
            <Sparkles className="h-3.5 w-3.5 text-plum transition-colors group-hover:text-white" />
            {t("nav.askAI")}
          </Link>

          {user?.role === "admin" && (
            <Link 
              href="/admin" 
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-50/80 px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition-all hover:bg-rose-100 hover:border-rose-500/40 active:scale-95 whitespace-nowrap"
            >
              <ShieldAlert className="h-3.5 w-3.5" /> Admin
            </Link>
          )}
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden items-center gap-2.5 md:flex shrink-0">
          
          <LanguageSwitcher />

          <Link 
            href="/dashboard" 
            aria-label="Saved recipes" 
            className="rounded-full p-2 text-ink/70 transition-all duration-200 hover:bg-plum/5 hover:text-plum active:scale-90"
          >
            <Bookmark className="h-4 w-4" />
          </Link>

          {/* Share Recipe CTA */}
          <Link 
            href="/create-recipe" 
            className="flex items-center gap-1.5 rounded-full bg-plum px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-plum/20 transition-all duration-200 hover:bg-plum/90 hover:shadow-md hover:shadow-plum/30 active:scale-95 whitespace-nowrap"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            {t("nav.shareRecipe")}
          </Link>

          {/* Auth State */}
          {isAuthenticated ? (
            <div className="relative">
              <button 
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 rounded-full border border-line bg-paper/90 p-1 pr-2 transition-all duration-200 hover:border-plum/40 hover:bg-plum/5 active:scale-95"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-plum font-display text-xs italic font-bold text-white shadow-inner">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-ink/50 transition-transform duration-300 ${profileDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-line/80 bg-paper p-1.5 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-lg">
                  <div className="border-b border-line/80 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink/40">Signed in as</p>
                    <p className="truncate text-xs font-semibold text-ink mt-0.5">{user?.name}</p>
                  </div>
                  <div className="pt-1 space-y-0.5">
                    <Link
                      href="/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-ink/80 transition-colors hover:bg-ink/5 hover:text-ink"
                    >
                      <Settings className="h-3.5 w-3.5 text-ink/50" /> Settings
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
                    >
                      <LogOut className="h-3.5 w-3.5" /> {t("common.signOut")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href="/login" 
              className="flex items-center gap-1.5 rounded-full border border-line bg-paper px-3.5 py-2 text-xs font-semibold text-ink transition-all duration-200 hover:border-plum/40 hover:bg-plum/5 active:scale-95 whitespace-nowrap"
            >
              <User className="h-3.5 w-3.5" /> {t("common.signIn")}
            </Link>
          )}
        </div>

        {/* Mobile Nav Toggle */}
        <div className="flex items-center gap-1.5 lg:hidden shrink-0">
          <LanguageSwitcher />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl border border-line bg-paper/80 p-2 text-ink/80 transition-colors hover:bg-ink/5 active:scale-90"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="w-full border-t border-line/60 bg-paper/95 px-4 pb-6 pt-3 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-1 max-w-full overflow-hidden">
            <Link 
              href="/search" 
              onClick={() => setMobileMenuOpen(false)} 
              className="rounded-xl px-3 py-2.5 text-xs font-semibold text-ink/80 hover:bg-ink/5 hover:text-ink"
            >
              {t("nav.discover")}
            </Link>
            {isAuthenticated && (
              <Link 
                href="/feed" 
                onClick={() => setMobileMenuOpen(false)} 
                className="rounded-xl px-3 py-2.5 text-xs font-semibold text-ink/80 hover:bg-ink/5 hover:text-ink"
              >
                {t("nav.feed")}
              </Link>
            )}
            <Link 
              href="/dashboard" 
              onClick={() => setMobileMenuOpen(false)} 
              className="rounded-xl px-3 py-2.5 text-xs font-semibold text-ink/80 hover:bg-ink/5 hover:text-ink"
            >
              {t("nav.myKitchen")}
            </Link>
            <Link 
              href="/blog" 
              onClick={() => setMobileMenuOpen(false)} 
              className="rounded-xl px-3 py-2.5 text-xs font-semibold text-ink/80 hover:bg-ink/5 hover:text-ink"
            >
              {t("nav.blog")}
            </Link>
            <Link 
              href="/ai-tools" 
              onClick={() => setMobileMenuOpen(false)} 
              className="flex items-center gap-2 rounded-xl border border-plum/20 bg-plum/10 px-3 py-2.5 text-xs font-semibold text-plum"
            >
              <Sparkles className="h-4 w-4" /> {t("nav.askAI")}
            </Link>

            <div className="my-1.5 border-t border-line/60" />

            <Link 
              href="/create-recipe" 
              onClick={() => setMobileMenuOpen(false)} 
              className="flex items-center justify-center gap-2 rounded-xl bg-plum py-2.5 text-xs font-semibold text-white shadow-md shadow-plum/20"
            >
              <PlusCircle className="h-4 w-4" /> {t("nav.shareRecipe")}
            </Link>

            {isAuthenticated ? (
              <div className="mt-1 flex flex-col gap-1">
                <Link 
                  href="/settings" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-ink/80 hover:bg-ink/5"
                >
                  <Settings className="h-4 w-4 text-ink/50" /> Settings
                </Link>
                <button 
                  type="button"
                  onClick={handleLogout} 
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" /> {t("common.signOut")}
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setMobileMenuOpen(false)} 
                className="mt-1 flex items-center justify-center gap-2 rounded-xl border border-line py-2.5 text-xs font-semibold text-ink hover:bg-ink/5"
              >
                <User className="h-4 w-4" /> {t("common.signIn")}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}