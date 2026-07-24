"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import BlogPostForm from "@/components/BlogPostForm";
import { blogApi } from "@/lib/api";
import { BlogPost } from "@/types/blog";

export default function EditBlogPostPage() {
  return (
    <ProtectedRoute>
      <EditBlogPostContent />
    </ProtectedRoute>
  );
}

function EditBlogPostContent() {
  const params = useParams<{ slug: string }>();

  // The public GET /blog/:slug only returns published posts, but a draft
  // pending review needs to be editable too - so this pulls from "my
  // posts" (all statuses, author-scoped) and matches by slug instead.
  const { data, isLoading } = useQuery<{ data: BlogPost[] }>({
    queryKey: ["blog", "mine"],
    queryFn: () => blogApi.mine(),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-plum" />
      </div>
    );
  }

  const post = data?.data.find((p) => p.slug === params.slug);

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-sm text-ink/50">
        You can only edit posts you wrote yourself.
      </div>
    );
  }

  return (
    <BlogPostForm
      mode="edit"
      postId={post._id}
      initialValues={{
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverImageUrl: post.coverImageUrl,
      }}
    />
  );
}
