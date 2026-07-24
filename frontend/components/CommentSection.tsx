"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send, Trash2, Loader2, Sparkles, User } from "lucide-react";
import { commentApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Comment } from "@/types/comment";
import { timeAgo } from "@/lib/utils";
import ReportButton from "./ReportButton";
import ListSkeleton from "./skeletons/ListSkeleton";
import { useLocale } from "@/context/LocaleContext";

export default function CommentSection({ recipeId }: { recipeId: string }) {
  const queryClient = useQueryClient();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { t } = useLocale();
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ data: Comment[] }>({
    queryKey: ["comments", recipeId],
    queryFn: () => commentApi.list(recipeId),
  });

  async function handlePost() {
    if (!text.trim()) return;
    setPosting(true);
    setError(null);
    try {
      await commentApi.add(recipeId, text.trim());
      setText("");
      queryClient.invalidateQueries({ queryKey: ["comments", recipeId] });
    } catch {
      setError("Sign in to leave a comment.");
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(id: string) {
    await commentApi.remove(id);
    queryClient.invalidateQueries({ queryKey: ["comments", recipeId] });
  }

  const comments = data?.data ?? [];

  return (
    <section className="mt-12 rounded-3xl border border-line/60 bg-paper/80 p-6 shadow-sm backdrop-blur-md sm:p-8">
      
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-line/60 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-plum/10 text-plum">
            <MessageCircle className="h-5 w-5" />
          </div>
          <h2 className="font-display text-2xl font-semibold italic text-ink">
            {t("recipeDetail.comments") ?? "Community Discussion"}
          </h2>
        </div>
        <span className="rounded-full bg-plum/10 px-3 py-1 font-mono text-xs font-bold text-plum">
          {comments.length}
        </span>
      </div>

      {/* Input Comment Box */}
      <div className="mt-6">
        <div className="relative overflow-hidden rounded-2xl border border-line/80 bg-paper shadow-inner focus-within:border-plum focus-within:ring-2 focus-within:ring-plum/10">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              isAuthenticated
                ? "Share a tip, a tweak, or how the recipe turned out for you..."
                : "Sign in to leave a comment and join the discussion..."
            }
            rows={3}
            className="w-full bg-transparent p-4 text-xs text-ink placeholder:text-ink/40 focus:outline-none sm:text-sm"
          />

          <div className="flex items-center justify-between border-t border-line/40 bg-ink/5 px-4 py-2.5">
            <span className="text-[11px] font-medium text-ink/50">
              {isAuthenticated ? `Posting as ${currentUser?.name}` : "Guest Mode"}
            </span>

            <button
              onClick={handlePost}
              disabled={posting || !text.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-plum px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-plum/90 active:scale-95 disabled:opacity-50"
              aria-label="Post comment"
            >
              {posting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>Post Comment</span>
            </button>
          </div>
        </div>
        {error && <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>}
      </div>

      {/* Comments List */}
      <div className="mt-8 space-y-4">
        {isLoading && <ListSkeleton rows={3} />}

        {!isLoading && comments.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-line/40 bg-paper/40 py-10 text-center">
            <Sparkles className="h-8 w-8 text-plum/30 mb-2" />
            <p className="font-display text-lg italic text-ink">No comments yet</p>
            <p className="mt-0.5 text-xs text-ink/50">Be the first home chef to start the conversation!</p>
          </div>
        )}

        {comments.map((comment) => (
          <div
            key={comment._id}
            className="group relative flex gap-3.5 rounded-2xl border border-line/60 bg-paper p-4 shadow-sm transition-all hover:border-plum/30"
          >
            {/* User Avatar */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-plum/20 to-plum/5 font-display text-sm font-bold italic text-plum shadow-inner ring-2 ring-paper">
              {comment.user.name.charAt(0).toUpperCase()}
            </div>

            {/* Comment Body */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-ink sm:text-sm">
                    {comment.user.name}
                  </span>
                  <span className="font-mono text-[10px] text-ink/40">
                    {timeAgo(comment.createdAt)}
                  </span>
                </div>

                {/* Actions: Delete / Report */}
                <div className="flex items-center gap-1">
                  {currentUser?._id !== comment.user._id && (
                    <ReportButton targetType="comment" targetId={comment._id} />
                  )}

                  {currentUser?._id === comment.user._id && (
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="rounded-lg p-1.5 text-ink/30 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Delete comment"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Text Body */}
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-ink/80">
                {comment.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}