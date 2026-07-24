import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageViewTracker from "@/components/PageViewTracker";
import FloatingChatWidget from "@/components/FloatingChatWidget";
import Providers from "./providers";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const jbmono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jbmono", weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "Memorable — Recipes worth remembering",
  description: "Discover, cook, and share recipes with an AI sous-chef that knows what's in your fridge.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${jbmono.variable}`}>
      <body className="font-sans">
        <Providers>
          <PageViewTracker />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <FloatingChatWidget />
        </Providers>
      </body>
    </html>
  );
}
