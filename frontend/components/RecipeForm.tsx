"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { 
  Plus, 
  Trash2, 
  ChefHat, 
  Pencil, 
  Clock, 
  Flame, 
  Users, 
  Check, 
  Sparkles, 
  Camera, 
  Film, 
  BookOpen, 
  Utensils, 
  Save, 
  Send,
  Loader2
} from "lucide-react";
import { recipeApi } from "@/lib/api";
import ImageUploader from "@/components/ImageUploader";
import GalleryUploader from "@/components/GalleryUploader";
import VideoUploader from "@/components/VideoUploader";
import { useLocale } from "@/context/LocaleContext";

const CUISINE_OPTIONS = ["Indian", "Italian", "Mexican", "Chinese", "Thai"];
const MEAL_TYPE_OPTIONS = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];
const DIET_OPTIONS = ["Vegetarian", "Vegan", "Keto", "Gluten Free", "High Protein"];
const SEASON_OPTIONS = ["Spring", "Summer", "Autumn", "Winter"];

export interface RecipeFormValues {
  title: string;
  description: string;
  imageUrl: string;
  images: string[];
  videoUrl: string;
  cuisine: string[];
  mealType: string[];
  diets: string[];
  seasons: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  ingredients: { name: string; quantity: string; unit: string }[];
  steps: { value: string }[];
  nutrition: { calories?: number; protein?: number; carbs?: number; fat?: number };
}

const EMPTY_DEFAULTS: RecipeFormValues = {
  title: "",
  description: "",
  imageUrl: "",
  images: [],
  videoUrl: "",
  cuisine: [],
  mealType: [],
  diets: [],
  seasons: [],
  prepTimeMinutes: 15,
  cookTimeMinutes: 20,
  servings: 2,
  difficulty: "easy",
  ingredients: [{ name: "", quantity: "", unit: "" }],
  steps: [{ value: "" }],
  nutrition: {},
};

function TagToggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
        active
          ? "bg-plum text-white shadow-sm ring-2 ring-plum/20"
          : "border border-line/80 bg-paper/80 text-ink/70 hover:border-plum/40 hover:text-ink"
      }`}
    >
      {active && <Check className="h-3 w-3" />}
      {label}
    </button>
  );
}

export default function RecipeForm({
  mode,
  recipeId,
  initialValues,
}: {
  mode: "create" | "edit";
  recipeId?: string;
  initialValues?: RecipeFormValues;
}) {
  const router = useRouter();
  const { t } = useLocale();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<"draft" | "published" | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RecipeFormValues>({
    defaultValues: EMPTY_DEFAULTS,
    values: initialValues,
  });

  const ingredientFields = useFieldArray({ control, name: "ingredients" });
  const stepFields = useFieldArray({ control, name: "steps" });

  const watchedValues = watch();

  async function onSubmit(values: RecipeFormValues, status: "draft" | "published") {
    setSubmitError(null);
    setSubmitting(status);
    try {
      const payload = {
        ...values,
        steps: values.steps.map((s) => s.value).filter(Boolean),
        ingredients: values.ingredients.filter((i) => i.name),
        status,
      };
      const res =
        mode === "edit" && recipeId
          ? await recipeApi.update(recipeId, payload)
          : await recipeApi.create(payload);
      router.push(`/recipes/${res.data._id}`);
    } catch {
      setSubmitError("Couldn't save the recipe. Make sure you're signed in and try again.");
    } finally {
      setSubmitting(null);
    }
  }

  const totalTime = (watchedValues.prepTimeMinutes || 0) + (watchedValues.cookTimeMinutes || 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-line/60 bg-gradient-to-b from-plum/10 via-paper to-paper p-6 shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-plum/10 blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-plum/20 bg-plum/10 px-3.5 py-1 text-xs font-semibold text-plum">
              {mode === "edit" ? <Pencil className="h-3.5 w-3.5" /> : <ChefHat className="h-3.5 w-3.5" />}
              {mode === "edit" ? "Recipe Editor" : "Recipe Builder"}
            </span>
            <h1 className="mt-2 font-display text-3xl font-semibold italic text-ink sm:text-4xl">
              {mode === "edit" ? t("recipeForm.editTitle") : t("recipeForm.newTitle")}
            </h1>
            <p className="mt-1 text-xs text-ink/60 sm:text-sm max-w-xl">
              {mode === "edit"
                ? "Update your recipe details. Saving will automatically refresh the live version."
                : "Craft your dish with detailed ingredients, step-by-step instructions, and media."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={submitting !== null}
              onClick={handleSubmit((v) => onSubmit(v, "draft"))}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-4 py-2.5 text-xs font-semibold text-ink shadow-sm transition-all hover:bg-ink/5"
            >
              {submitting === "draft" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5 text-ink/60" />}
              {submitting === "draft" ? t("recipeForm.saving") : t("recipeForm.saveAsDraft")}
            </button>
            <button
              type="button"
              disabled={submitting !== null}
              onClick={handleSubmit((v) => onSubmit(v, "published"))}
              className="inline-flex items-center gap-1.5 rounded-full bg-plum px-5 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-plum/90"
            >
              {submitting === "published" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              {submitting === "published" ? t("recipeForm.publishing") : mode === "edit" ? t("common.save") : t("recipeForm.publish")}
            </button>
          </div>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Left Column: Form Fields (8 Cols) */}
        <form className="space-y-8 lg:col-span-8" onSubmit={(e) => e.preventDefault()}>
          
          {/* Basics Section */}
          <section className="rounded-3xl border border-line/60 bg-paper p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-line/60 pb-3">
              <BookOpen className="h-4 w-4 text-plum" />
              <h2 className="font-display text-xl font-semibold italic text-ink">{t("recipeForm.basics")}</h2>
            </div>

            <div>
              <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink/60">
                {t("recipeForm.title")} *
              </label>
              <input
                {...register("title", { required: true })}
                placeholder="Grandma's Weeknight Dal Khichdi"
                className="mt-1.5 w-full rounded-2xl border border-line/80 bg-paper/60 px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-plum focus:outline-none shadow-inner"
              />
              {errors.title && <p className="mt-1.5 text-xs text-rose-600 font-medium">Title is required.</p>}
            </div>

            <div>
              <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink/60">
                {t("recipeForm.description")}
              </label>
              <textarea
                {...register("description")}
                rows={3}
                placeholder="A rich, one-pot comfort meal packed with ghee, lentils, and aromatic cumin..."
                className="mt-1.5 w-full rounded-2xl border border-line/80 bg-paper/60 p-4 text-sm text-ink placeholder:text-ink/40 focus:border-plum focus:outline-none shadow-inner"
              />
            </div>

            {/* Media Uploaders */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink/60 mb-1.5">
                  <Camera className="h-3.5 w-3.5 text-plum" /> {t("recipeForm.photo")}
                </label>
                <Controller
                  control={control}
                  name="imageUrl"
                  render={({ field }) => (
                    <ImageUploader value={field.value} onChange={field.onChange} folder="recipes" />
                  )}
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink/60 mb-1.5">
                  <Camera className="h-3.5 w-3.5 text-plum" /> {t("recipeForm.morePhotos")}
                </label>
                <Controller
                  control={control}
                  name="images"
                  render={({ field }) => (
                    <GalleryUploader value={field.value} onChange={field.onChange} max={6} folder="recipes" />
                  )}
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink/60 mb-1.5">
                  <Film className="h-3.5 w-3.5 text-plum" /> Video Reel (optional)
                </label>
                <Controller
                  control={control}
                  name="videoUrl"
                  render={({ field }) => <VideoUploader value={field.value} onChange={field.onChange} />}
                />
              </div>
            </div>

            {/* Meta Numeric Controls */}
            <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
              <div>
                <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink/60">Prep Time (min)</label>
                <input
                  type="number"
                  min={0}
                  {...register("prepTimeMinutes", { valueAsNumber: true })}
                  className="mt-1.5 w-full rounded-xl border border-line/80 bg-paper/60 px-3.5 py-2.5 font-mono text-xs text-ink focus:border-plum focus:outline-none shadow-inner"
                />
              </div>
              <div>
                <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink/60">Cook Time (min)</label>
                <input
                  type="number"
                  min={0}
                  {...register("cookTimeMinutes", { valueAsNumber: true })}
                  className="mt-1.5 w-full rounded-xl border border-line/80 bg-paper/60 px-3.5 py-2.5 font-mono text-xs text-ink focus:border-plum focus:outline-none shadow-inner"
                />
              </div>
              <div>
                <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink/60">Servings</label>
                <input
                  type="number"
                  min={1}
                  {...register("servings", { valueAsNumber: true })}
                  className="mt-1.5 w-full rounded-xl border border-line/80 bg-paper/60 px-3.5 py-2.5 font-mono text-xs text-ink focus:border-plum focus:outline-none shadow-inner"
                />
              </div>
              <div>
                <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink/60">Difficulty</label>
                <select
                  {...register("difficulty")}
                  className="mt-1.5 w-full rounded-xl border border-line/80 bg-paper/60 px-3.5 py-2.5 text-xs text-ink focus:border-plum focus:outline-none"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </section>

          {/* Categories Tags */}
          <section className="rounded-3xl border border-line/60 bg-paper p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-line/60 pb-3">
              <Utensils className="h-4 w-4 text-plum" />
              <h2 className="font-display text-xl font-semibold italic text-ink">{t("recipeForm.categories")}</h2>
            </div>

            <Controller
              control={control}
              name="cuisine"
              render={({ field }) => (
                <div>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink/50 mb-2">Cuisine</p>
                  <div className="flex flex-wrap gap-2">
                    {CUISINE_OPTIONS.map((opt) => (
                      <TagToggle
                        key={opt}
                        label={opt}
                        active={field.value.includes(opt)}
                        onClick={() =>
                          field.onChange(
                            field.value.includes(opt) ? field.value.filter((v) => v !== opt) : [...field.value, opt]
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
            />

            <Controller
              control={control}
              name="mealType"
              render={({ field }) => (
                <div>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink/50 mb-2">Meal Type</p>
                  <div className="flex flex-wrap gap-2">
                    {MEAL_TYPE_OPTIONS.map((opt) => (
                      <TagToggle
                        key={opt}
                        label={opt}
                        active={field.value.includes(opt)}
                        onClick={() =>
                          field.onChange(
                            field.value.includes(opt) ? field.value.filter((v) => v !== opt) : [...field.value, opt]
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
            />

            <Controller
              control={control}
              name="diets"
              render={({ field }) => (
                <div>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink/50 mb-2">Dietary Preference</p>
                  <div className="flex flex-wrap gap-2">
                    {DIET_OPTIONS.map((opt) => (
                      <TagToggle
                        key={opt}
                        label={opt}
                        active={field.value.includes(opt)}
                        onClick={() =>
                          field.onChange(
                            field.value.includes(opt) ? field.value.filter((v) => v !== opt) : [...field.value, opt]
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
            />

            <Controller
              control={control}
              name="seasons"
              render={({ field }) => (
                <div>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink/50 mb-2">Season (optional)</p>
                  <div className="flex flex-wrap gap-2">
                    {SEASON_OPTIONS.map((opt) => (
                      <TagToggle
                        key={opt}
                        label={opt}
                        active={field.value.includes(opt)}
                        onClick={() =>
                          field.onChange(
                            field.value.includes(opt) ? field.value.filter((v) => v !== opt) : [...field.value, opt]
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
            />
          </section>

          {/* Ingredients Section */}
          <section className="rounded-3xl border border-line/60 bg-paper p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <h2 className="font-display text-xl font-semibold italic text-ink">{t("recipeForm.ingredients")}</h2>
              <button
                type="button"
                onClick={() => ingredientFields.append({ name: "", quantity: "", unit: "" })}
                className="inline-flex items-center gap-1 rounded-full border border-line/80 bg-paper/80 px-3 py-1.5 text-xs font-semibold text-plum hover:bg-plum/5"
              >
                <Plus className="h-3.5 w-3.5" /> {t("recipeForm.addIngredient")}
              </button>
            </div>

            <div className="space-y-3">
              {ingredientFields.fields.map((field, i) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    {...register(`ingredients.${i}.name` as const)}
                    placeholder="Ingredient (e.g. Basmati Rice)"
                    className="flex-1 rounded-xl border border-line/80 bg-paper/60 px-3.5 py-2 text-xs text-ink placeholder:text-ink/40 focus:border-plum focus:outline-none"
                  />
                  <input
                    {...register(`ingredients.${i}.quantity` as const)}
                    placeholder="Qty"
                    className="w-20 rounded-xl border border-line/80 bg-paper/60 px-3 py-2 font-mono text-xs text-ink placeholder:text-ink/40 focus:border-plum focus:outline-none"
                  />
                  <input
                    {...register(`ingredients.${i}.unit` as const)}
                    placeholder="Unit"
                    className="w-24 rounded-xl border border-line/80 bg-paper/60 px-3 py-2 font-mono text-xs text-ink placeholder:text-ink/40 focus:border-plum focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => ingredientFields.remove(i)}
                    className="rounded-xl p-2 text-ink/40 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Remove ingredient"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Steps Section */}
          <section className="rounded-3xl border border-line/60 bg-paper p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <h2 className="font-display text-xl font-semibold italic text-ink">{t("recipeForm.steps")}</h2>
              <button
                type="button"
                onClick={() => stepFields.append({ value: "" })}
                className="inline-flex items-center gap-1 rounded-full border border-line/80 bg-paper/80 px-3 py-1.5 text-xs font-semibold text-plum hover:bg-plum/5"
              >
                <Plus className="h-3.5 w-3.5" /> {t("recipeForm.addStep")}
              </button>
            </div>

            <div className="space-y-3">
              {stepFields.fields.map((field, i) => (
                <div key={field.id} className="flex items-start gap-3">
                  <span className="mt-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-plum/10 font-mono text-xs font-bold text-plum">
                    {i + 1}
                  </span>
                  <textarea
                    {...register(`steps.${i}.value` as const)}
                    rows={2}
                    placeholder="Describe this step clearly..."
                    className="flex-1 rounded-xl border border-line/80 bg-paper/60 p-3 text-xs text-ink placeholder:text-ink/40 focus:border-plum focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => stepFields.remove(i)}
                    className="mt-1.5 rounded-xl p-2 text-ink/40 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Remove step"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Nutrition Section */}
          <section className="rounded-3xl border border-line/60 bg-paper p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <h2 className="font-display text-xl font-semibold italic text-ink">
                {t("recipeForm.nutrition")} <span className="text-xs font-normal not-italic text-ink/40">(optional)</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {(["calories", "protein", "carbs", "fat"] as const).map((key) => (
                <div key={key}>
                  <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink/50">{key}</label>
                  <input
                    type="number"
                    min={0}
                    {...register(`nutrition.${key}` as const, { valueAsNumber: true })}
                    className="mt-1.5 w-full rounded-xl border border-line/80 bg-paper/60 px-3.5 py-2.5 font-mono text-xs text-ink focus:border-plum focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </section>

          {submitError && <p className="text-xs text-rose-600 font-medium">{submitError}</p>}
        </form>

        {/* Right Column: Sticky Live Recipe Preview Card (4 Cols) */}
        <aside className="lg:col-span-4">
          <div className="sticky top-20 space-y-5 rounded-3xl border border-line/60 bg-paper/80 p-5 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <span className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-plum">
                <Sparkles className="h-3.5 w-3.5" /> Live Card Preview
              </span>
              <span className="rounded-full bg-plum/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-plum">
                {mode === "edit" ? "Editing" : "Draft"}
              </span>
            </div>

            {/* Live Recipe Card Container */}
            <div className="overflow-hidden rounded-2xl border border-line/60 bg-paper shadow-md">
              <div className="relative aspect-[4/3] w-full bg-line/40">
                {watchedValues.imageUrl ? (
                  <img
                    src={watchedValues.imageUrl}
                    alt={watchedValues.title || "Recipe Preview"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-plum/5 text-xs font-display italic text-plum/40">
                    Image Preview
                  </div>
                )}
                {watchedValues.diets?.[0] && (
                  <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-paper/80 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-ink backdrop-blur-md">
                    {watchedValues.diets[0]}
                  </span>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-display text-lg font-semibold italic text-ink line-clamp-1">
                  {watchedValues.title || "Recipe Title Preview"}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-ink/60">
                  {watchedValues.description || "A short delicious description will appear here..."}
                </p>

                <div className="mt-4 flex items-center gap-2 pt-2 border-t border-line/40">
                  {totalTime > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-ink/5 px-2.5 py-1 font-mono text-[10px] font-medium text-ink">
                      <Clock className="h-3 w-3 text-amber-500" /> {totalTime} min
                    </span>
                  )}
                  {watchedValues.nutrition?.calories && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-ink/5 px-2.5 py-1 font-mono text-[10px] font-medium text-ink">
                      <Flame className="h-3 w-3 text-orange-500" /> {watchedValues.nutrition.calories} kcal
                    </span>
                  )}
                  {watchedValues.servings && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-ink/5 px-2.5 py-1 font-mono text-[10px] font-medium text-ink">
                      <Users className="h-3 w-3 text-blue-500" /> {watchedValues.servings} Servings
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={submitting !== null}
                onClick={handleSubmit((v) => onSubmit(v, "published"))}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-plum py-3 text-xs font-semibold text-white shadow-md transition-all hover:bg-plum/90 active:scale-95"
              >
                {submitting === "published" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {submitting === "published" ? t("recipeForm.publishing") : mode === "edit" ? t("common.save") : t("recipeForm.publish")}
              </button>

              <button
                type="button"
                disabled={submitting !== null}
                onClick={handleSubmit((v) => onSubmit(v, "draft"))}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-line/80 bg-paper py-3 text-xs font-semibold text-ink shadow-sm transition-all hover:bg-ink/5"
              >
                {submitting === "draft" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 text-ink/60" />}
                {submitting === "draft" ? t("recipeForm.saving") : t("recipeForm.saveAsDraft")}
              </button>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}