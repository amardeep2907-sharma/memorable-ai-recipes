"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import RecipeForm, { RecipeFormValues } from "@/components/RecipeForm";
import { recipeApi } from "@/lib/api";
import { RecipeDetailResult } from "@/types/recipe";
import { useAuth } from "@/context/AuthContext";

export default function EditRecipePage() {
  return (
    <ProtectedRoute>
      <EditRecipeContent />
    </ProtectedRoute>
  );
}

function EditRecipeContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery<RecipeDetailResult>({
    queryKey: ["recipe", params.id],
    queryFn: () => recipeApi.getById(params.id),
  });

  const recipe = data?.data;
  const isOwner = recipe?.author?._id === user?._id;

  useEffect(() => {
    if (!isLoading && recipe && !isOwner) {
      router.replace(`/recipes/${params.id}`);
    }
  }, [isLoading, recipe, isOwner, router, params.id]);

  /* Premium Full-Screen Loading State */
  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-line/60 bg-paper/80 p-8 text-center shadow-lg backdrop-blur-md">
          <Loader2 className="h-8 w-8 animate-spin text-plum" />
          <p className="font-display text-lg italic font-medium text-ink">
            Fetching recipe workspace...
          </p>
        </div>
      </div>
    );
  }

  /* Unauthorized or Error State Card */
  if (isError || !recipe || !isOwner) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-rose-200 bg-paper/80 p-8 text-center shadow-lg backdrop-blur-md">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="font-display text-2xl font-semibold italic text-ink">
            Access Restricted
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-ink/60">
            You can only edit recipes that you have created. Make sure you are signed in with the correct author account.
          </p>
          <Link
            href={params.id ? `/recipes/${params.id}` : "/dashboard"}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-plum px-6 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-plum/90"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back to Recipe
          </Link>
        </div>
      </div>
    );
  }

  /* Map Backend Model to Form Defaults */
  const initialValues: RecipeFormValues = {
    title: recipe.title,
    description: recipe.description,
    imageUrl: recipe.imageUrl,
    images: recipe.images ?? [],
    videoUrl: recipe.videoUrl ?? "",
    cuisine: recipe.cuisine,
    mealType: recipe.mealType,
    diets: recipe.diets,
    seasons: recipe.seasons,
    prepTimeMinutes: recipe.prepTimeMinutes,
    cookTimeMinutes: recipe.cookTimeMinutes,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    ingredients: recipe.ingredients.map((ing) => ({
      name: ing.name,
      quantity: ing.quantity ?? "",
      unit: ing.unit ?? "",
    })),
    steps: recipe.steps.map((s) => ({ value: s })),
    nutrition: recipe.nutrition ?? {},
  };

  return <RecipeForm mode="edit" recipeId={recipe._id} initialValues={initialValues} />;
}