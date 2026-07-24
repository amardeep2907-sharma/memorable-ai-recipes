"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, X, Send, Loader2, Sparkles, Clock, Bot, User } from "lucide-react";
import { aiApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Recipe } from "@/types/recipe";
import { formatMinutes } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  recipes?: Recipe[];
}

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm your AI culinary assistant — ask me for recipe recommendations on Memorable, ingredient substitutes, " +
    "custom meal plans, or nutritional insights!",
};

export default function FloatingChatWidget() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await aiApi.chat(nextMessages.slice(-20));
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.response, recipes: res.data.recipes ?? [] },
      ]);
    } catch {
      setError("Something went wrong — try sending that again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Floating Chat Drawer */}
      {open && (
        <div className="mb-4 flex h-[30rem] w-[22rem] flex-col overflow-hidden rounded-3xl border border-line/80 bg-paper/95 shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-4 duration-300 sm:w-[26rem]">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line/60 bg-paper/80 px-4 py-3.5 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-plum/10 text-plum">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold italic text-ink">Culinary Copilot</h3>
                <p className="text-[10px] text-ink/50 font-mono">AI Recipe & Cooking Assistant</p>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-1.5 text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4 [scrollbar-width:thin]">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div className="flex items-end gap-2 max-w-[88%]">
                  {m.role === "assistant" && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-plum/10 text-plum font-bold text-[10px] mb-1">
                      AI
                    </div>
                  )}

                  <div
                    className={`whitespace-pre-line rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                      m.role === "user"
                        ? "bg-gradient-to-r from-plum to-plum/90 text-white font-medium rounded-br-xs"
                        : "border border-line/60 bg-paper text-ink/80 rounded-bl-xs"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>

                {/* Recipe Suggestions Carousel */}
                {m.recipes && m.recipes.length > 0 && (
                  <div className="mt-3 flex w-full gap-2.5 overflow-x-auto pb-2 pl-8 [scrollbar-width:none]">
                    {m.recipes.map((recipe) => (
                      <Link
                        key={recipe._id}
                        href={`/recipes/${recipe._id}`}
                        className="group flex w-36 shrink-0 flex-col overflow-hidden rounded-2xl border border-line/60 bg-paper shadow-sm transition-all hover:-translate-y-0.5 hover:border-plum/40 hover:shadow-md"
                      >
                        <div className="relative aspect-square w-full bg-line/40">
                          {recipe.imageUrl ? (
                            <Image
                              src={recipe.imageUrl}
                              alt={recipe.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center font-display text-[10px] italic text-plum/40">
                              Preview
                            </div>
                          )}
                        </div>

                        <div className="p-2.5">
                          <p className="line-clamp-2 font-display text-xs font-semibold italic text-ink transition-colors group-hover:text-plum">
                            {recipe.title}
                          </p>
                          {(recipe.prepTimeMinutes || recipe.cookTimeMinutes) && (
                            <p className="mt-1 flex items-center gap-1 font-mono text-[10px] text-ink/50">
                              <Clock className="h-2.5 w-2.5 text-amber-500" />
                              {formatMinutes((recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0))}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center gap-2 text-ink/50 pl-8">
                <div className="flex items-center gap-2 rounded-2xl border border-line/60 bg-paper px-3 py-2 text-xs">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-plum" />
                  <span className="font-mono text-[11px]">Searching culinary index...</span>
                </div>
              </div>
            )}
          </div>

          {error && <p className="px-4 pb-1 font-mono text-[11px] text-rose-600">{error}</p>}

          {/* Input Bar */}
          <div className="border-t border-line/60 bg-paper/90 p-3 backdrop-blur-md">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 rounded-full border border-line/80 bg-paper p-1 shadow-inner focus-within:border-plum">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask for recipes, tips, or substitutes..."
                  className="w-full bg-transparent px-3 py-1.5 text-xs text-ink placeholder:text-ink/40 focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-plum text-white shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <p className="py-1 text-center text-xs text-ink/60">
                <Link href="/login" className="font-semibold text-plum hover:underline">
                  Sign in
                </Link>{" "}
                to chat with AI Copilot.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Floating FAB Trigger Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close AI chat" : "Open AI chat"}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-plum text-white shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 group"
      >
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-plum opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400 border-2 border-paper"></span>
        </span>

        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

    </div>
  );
}