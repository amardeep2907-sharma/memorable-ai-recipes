"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Newspaper, 
  Pencil, 
  Sparkles, 
  Send, 
  Loader2, 
  BookOpen, 
  FileText, 
  Image as ImageIcon,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { blogApi } from "@/lib/api";
import ImageUploader from "@/components/ImageUploader";

export interface BlogPostFormValues {
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
}

const EMPTY_VALUES: BlogPostFormValues = { 
  title: "", 
  excerpt: "", 
  content: "", 
  coverImageUrl: "" 
};

export default function BlogPostForm({
  mode,
  postId,
  initialValues,
}: {
  mode: "create" | "edit";
  postId?: string;
  initialValues?: BlogPostFormValues;
}) {
  const router = useRouter();
  const [values, setValues] = useState<BlogPostFormValues>(initialValues ?? EMPTY_VALUES);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof BlogPostFormValues>(key: K, value: BlogPostFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit() {
    if (!values.title.trim() || !values.content.trim()) {
      setError("Title and main content are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (mode === "edit" && postId) {
        await blogApi.update(postId, values);
      } else {
        await blogApi.create(values);
      }
      router.push("/dashboard?tab=posts");
    } catch {
      setError("Couldn't save your post. Make sure you're signed in and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Reading time and word count estimation
  const wordCount = values.content.trim() ? values.content.trim().split(/\s+/).length : 0;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Editorial Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-line/60 bg-gradient-to-b from-plum/10 via-paper to-paper p-6 shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-plum/10 blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-plum/20 bg-plum/10 px-3.5 py-1 text-xs font-semibold text-plum">
              {mode === "edit" ? <Pencil className="h-3.5 w-3.5" /> : <Newspaper className="h-3.5 w-3.5" />}
              {mode === "edit" ? "Article Editor" : "Editorial Journal"}
            </span>
            <h1 className="mt-2 font-display text-3xl font-semibold italic text-ink sm:text-4xl">
              {mode === "edit" ? "Update your journal post" : "Share culinary stories & insights"}
            </h1>
            <p className="mt-1 text-xs text-ink/60 sm:text-sm max-w-xl">
              {mode === "edit"
                ? "Editing a published post resubmits it for review before going live."
                : "Every post is briefly reviewed by an admin before appearing on the public blog."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-full border border-line/80 bg-paper px-4 py-2.5 text-xs font-semibold text-ink/70 hover:bg-ink/5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-plum px-6 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-plum/90 active:scale-95 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting ? "Submitting..." : mode === "edit" ? "Resubmit for Review" : "Submit for Review"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Form Workspace */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Left Column: Form Editor (8 Columns) */}
        <div className="space-y-6 lg:col-span-8">
          
          {/* Article Basics */}
          <section className="rounded-3xl border border-line/60 bg-paper p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-line/60 pb-3">
              <FileText className="h-4 w-4 text-plum" />
              <h2 className="font-display text-xl font-semibold italic text-ink">Post Details</h2>
            </div>

            {/* Title Input */}
            <div>
              <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink/60">
                Post Title *
              </label>
              <input
                value={values.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Five ways to use up leftover garden herbs..."
                className="mt-1.5 w-full rounded-2xl border border-line/80 bg-paper/60 px-4 py-3 text-sm text-ink font-medium placeholder:text-ink/40 focus:border-plum focus:outline-none shadow-inner"
              />
            </div>

            {/* Excerpt Input */}
            <div>
              <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink/60">
                Short Excerpt / Teaser
              </label>
              <textarea
                value={values.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                rows={2}
                placeholder="A quick summary or hook that appears on the main blog feed..."
                className="mt-1.5 w-full rounded-2xl border border-line/80 bg-paper/60 p-4 text-xs sm:text-sm text-ink placeholder:text-ink/40 focus:border-plum focus:outline-none shadow-inner"
              />
            </div>

            {/* Cover Image Uploader */}
            <div>
              <label className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink/60 mb-2">
                <ImageIcon className="h-3.5 w-3.5 text-plum" /> Cover Header Image
              </label>
              <div className="rounded-2xl border border-line/60 bg-paper/40 p-3">
                <ImageUploader 
                  value={values.coverImageUrl} 
                  onChange={(url) => set("coverImageUrl", url)} 
                  folder="blog" 
                />
              </div>
            </div>
          </section>

          {/* Main Body Content */}
          <section className="rounded-3xl border border-line/60 bg-paper p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-plum" />
                <h2 className="font-display text-xl font-semibold italic text-ink">Article Content *</h2>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px] text-ink/50">
                <span>{wordCount} words</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-plum" /> {readTimeMinutes} min read
                </span>
              </div>
            </div>

            <textarea
              value={values.content}
              onChange={(e) => set("content", e.target.value)}
              rows={16}
              placeholder="Write your article story here... You can structure your thoughts with paragraphs, tips, and recipe notes."
              className="w-full rounded-2xl border border-line/80 bg-paper/60 p-4 text-sm leading-relaxed text-ink placeholder:text-ink/40 focus:border-plum focus:outline-none shadow-inner font-sans"
            />
          </section>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Live Article Preview (4 Columns) */}
        <aside className="lg:col-span-4">
          <div className="sticky top-20 space-y-5 rounded-3xl border border-line/60 bg-paper/80 p-5 shadow-sm backdrop-blur-md">
            
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <span className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-plum">
                <Sparkles className="h-3.5 w-3.5" /> Live Card Preview
              </span>
              <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-amber-600 border border-amber-500/20">
                Pending Review
              </span>
            </div>

            {/* Live Card Render */}
            <div className="overflow-hidden rounded-2xl border border-line/60 bg-paper shadow-md transition-all">
              <div className="relative aspect-[16/9] w-full bg-line/40">
                {values.coverImageUrl ? (
                  <img
                    src={values.coverImageUrl}
                    alt={values.title || "Post Preview"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-plum/5 text-xs font-display italic text-plum/40">
                    Header Cover Image
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between font-mono text-[10px] text-ink/40 mb-2">
                  <span>{new Date().toLocaleDateString()}</span>
                  <span>{readTimeMinutes} min read</span>
                </div>

                <h3 className="font-display text-lg font-semibold italic text-ink line-clamp-2">
                  {values.title || "Your Post Title Will Appear Here"}
                </h3>

                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink/60">
                  {values.excerpt || "A brief teaser or excerpt will be displayed here for readers in the community journal feed..."}
                </p>
              </div>
            </div>

            {/* Review Flow Notice */}
            <div className="rounded-2xl border border-plum/20 bg-plum/5 p-4 text-xs text-ink/70">
              <p className="flex items-center gap-1.5 font-semibold text-plum mb-1">
                <CheckCircle2 className="h-4 w-4" /> Editorial Approval
              </p>
              <p className="leading-relaxed text-[11px] text-ink/60">
                Submitted articles are reviewed promptly by our community moderators before publishing to ensure high culinary standards.
              </p>
            </div>

            {/* Submit CTA */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-plum py-3 text-xs font-semibold text-white shadow-md transition-all hover:bg-plum/90 active:scale-95 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting ? "Submitting Post..." : mode === "edit" ? "Resubmit for Review" : "Submit for Review"}
            </button>

          </div>
        </aside>

      </div>
    </div>
  );
}