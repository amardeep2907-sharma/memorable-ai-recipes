"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import RecipeForm from "@/components/RecipeForm";

export default function CreateRecipePage() {
  return (
    <ProtectedRoute>
      <RecipeForm mode="create" />
    </ProtectedRoute>
  );
}
