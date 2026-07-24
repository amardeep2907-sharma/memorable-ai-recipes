"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Star, Send, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { recipeApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Review } from "@/types/review";
import StarRating from "./StarRating";
import { useLocale } from "@/context/LocaleContext";
import ListSkeleton from "./skeletons/ListSkeleton";

export default function ReviewSection({
  recipeId,
  averageRating,
  ratingsCount,
  myRating,
}: {
  recipeId: string;
  averageRating: number;
  ratingsCount: number;
  myRating: number | null;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { t } = useLocale();
  const queryClient = useQueryClient();

  const [draftRating, setDraftRating] = useState(myRating ?? 0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ data: Review[] }>({
    queryKey: ["reviews", recipeId],
    queryFn: () => recipeApi.listReviews(recipeId),
  });

  async function handleSubmit() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (draftRating < 1) {
      setError("Pick a star rating first.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await recipeApi.addReview(recipeId, draftRating, text.trim() || undefined);
      setText("");
      queryClient.invalidateQueries({ queryKey: ["reviews", recipeId] });
      queryClient.invalidateQueries({ queryKey: ["recipe", recipeId] });
    } catch {
      setError("Couldn't submit your review — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const reviews = data?.data ?? [];

  return (
    <section className="mt-12 rounded-3xl border border-line/60 bg-paper/80 p-6 shadow-sm backdrop-blur-md sm:p-8">
      
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/60 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
            <Star className="h-5 w-5 fill-amber-400" />
          </div>
          <h2 className="font-display text-2xl font-semibold italic text-ink">
            {t("recipeDetail.reviews") ?? "Ratings & Reviews"}
          </h2>
        </div>

        {ratingsCount > 0 && (
          <div className="flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-1.5 shadow-sm">
            <StarRating value={averageRating} />
            <span className="font-mono text-xs font-bold text-ink">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-xs text-ink/40">({ratingsCount})</span>
          </div>
        )}
      </div>

      {/* Review Submission Card */}
      <div className="mt-6 rounded-2xl border border-line/80 bg-paper p-5 shadow-inner">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line/40 pb-3">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink/60">
            {myRating ? "Update your rating" : "Rate this recipe"}
          </span>
          
          <div className="flex items-center gap-2">
            <StarRating value={draftRating} onChange={setDraftRating} size="h-5 w-5" />
            {draftRating > 0 && (
              <span className="font-mono text-xs font-semibold text-plum">
                {draftRating}/5
              </span>
            )}
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Optional — Share your experience, modifications, or flavor notes..."
          rows={3}
          className="mt-3 w-full rounded-xl border border-line/60 bg-paper/60 p-3 text-xs sm:text-sm text-ink placeholder:text-ink/40 focus:border-plum focus:outline-none"
        />

        {error && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-3 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-plum px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-plum/90 active:scale-95 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            <span>{submitting ? "Saving..." : myRating ? "Update Review" : "Submit Review"}</span>
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="mt-8 space-y-4">
        {isLoading && <ListSkeleton rows={3} />}

        {!isLoading && reviews.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-line/40 bg-paper/40 py-10 text-center">
            <Sparkles className="h-8 w-8 text-plum/30 mb-2" />
            <p className="font-display text-lg italic text-ink">No reviews yet</p>
            <p className="mt-0.5 text-xs text-ink/50">Be the first home chef to leave a rating!</p>
          </div>
        )}

        {reviews.map((review) => (
          <div
            key={review._id}
            className="group relative flex gap-3.5 rounded-2xl border border-line/60 bg-paper p-4 shadow-sm transition-all hover:border-plum/30"
          >
            {/* User Avatar */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/5 font-display text-sm font-bold italic text-amber-700 shadow-inner ring-2 ring-paper">
              {review.user.name.charAt(0).toUpperCase()}
            </div>

            {/* Review Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-ink sm:text-sm">
                  {review.user.name}
                </span>
                <StarRating value={review.rating} size="h-3.5 w-3.5" />
              </div>

              {review.text && (
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-ink/80">
                  {review.text}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}