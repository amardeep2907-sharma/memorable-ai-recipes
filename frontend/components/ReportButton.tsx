"use client";

import { useState, useRef, useEffect } from "react";
import { Flag, Loader2, CheckCircle2, X, AlertTriangle } from "lucide-react";
import { reportApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const QUICK_REASONS = [
  "Spam or misleading",
  "Inappropriate content",
  "Harassment or hate speech",
  "Inaccurate recipe info",
];

export default function ReportButton({
  targetType,
  targetId,
  className = "",
}: {
  targetType: "recipe" | "comment" | "review" | "user";
  targetId: string;
  className?: string;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleOpen() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setOpen((prev) => !prev);
  }

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleSubmit() {
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await reportApi.create(targetType, targetId, reason.trim());
      setSubmitted(true);
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-semibold text-emerald-600 border border-emerald-500/20 ${className}`}>
        <CheckCircle2 className="h-3.5 w-3.5" />
        Reported
      </span>
    );
  }

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-ink/40 transition-all hover:bg-rose-50 hover:text-rose-600"
      >
        <Flag className="h-3.5 w-3.5" />
        <span>Report</span>
      </button>

      {/* Glassmorphic Report Popover */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-3xl border border-line/80 bg-paper/95 p-4 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          
          <div className="flex items-center justify-between border-b border-line/60 pb-2.5">
            <div className="flex items-center gap-1.5 font-display text-xs font-semibold italic text-rose-600">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Report {targetType}</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-ink/40 hover:bg-ink/5 hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {/* Quick Chips */}
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink/40 mb-1.5">
                Quick Reason
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(r)}
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-all ${
                      reason === r
                        ? "bg-rose-600 text-white shadow-xs"
                        : "border border-line/80 bg-paper/60 text-ink/70 hover:border-rose-300 hover:text-rose-600"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input Textarea */}
            <div>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe what's wrong with this..."
                rows={2}
                className="w-full rounded-xl border border-line/80 bg-paper/60 p-2.5 text-xs text-ink placeholder:text-ink/40 focus:border-rose-400 focus:outline-none shadow-inner"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-1.5 text-xs font-medium text-ink/60 hover:bg-ink/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !reason.trim()}
                className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-rose-700 active:scale-95 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Submit Report"
                )}
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}