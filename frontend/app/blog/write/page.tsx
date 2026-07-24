"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import BlogPostForm from "@/components/BlogPostForm";

export default function WriteBlogPostPage() {
  return (
    <ProtectedRoute>
      <BlogPostForm mode="create" />
    </ProtectedRoute>
  );
}
