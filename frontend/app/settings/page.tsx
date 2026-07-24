"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Settings, Loader2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ImageUploader from "@/components/ImageUploader";
import { userApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";

const CUISINE_OPTIONS = ["Indian", "Italian", "Mexican", "Chinese", "Thai"];
const DIET_OPTIONS = ["Vegetarian", "Vegan", "Keto", "Gluten Free", "High Protein"];

interface SettingsFormValues {
  name: string;
  bio: string;
  avatarUrl: string;
  cuisines: string[];
  diets: string[];
  allergiesText: string;
}

function TagToggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        active ? "border-plum bg-plum text-paper" : "border-line text-ink/70 hover:border-plum/40"
      }`}
    >
      {label}
    </button>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}

function SettingsContent() {
  const { refreshUser } = useAuth();
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, control, handleSubmit, reset } = useForm<SettingsFormValues>({
    defaultValues: { name: "", bio: "", avatarUrl: "", cuisines: [], diets: [], allergiesText: "" },
  });

  useEffect(() => {
    userApi
      .getMe()
      .then((res) => {
        const u = res.data;
        reset({
          name: u.name ?? "",
          bio: u.bio ?? "",
          avatarUrl: u.avatarUrl ?? "",
          cuisines: u.preferences?.cuisines ?? [],
          diets: u.preferences?.diets ?? [],
          allergiesText: (u.preferences?.allergies ?? []).join(", "),
        });
      })
      .finally(() => setLoading(false));
  }, [reset]);

  async function onSubmit(values: SettingsFormValues) {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await userApi.updateMe({
        name: values.name,
        bio: values.bio,
        avatarUrl: values.avatarUrl,
        preferences: {
          cuisines: values.cuisines,
          diets: values.diets,
          allergies: values.allergiesText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        },
      });
      await refreshUser();
      setSaved(true);
    } catch {
      setError("Couldn't save your changes — please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-plum" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-plum">
        <Settings className="h-3.5 w-3.5" /> {t("settings.title")}
      </p>
      <h1 className="mt-2 font-display text-3xl italic">{t("settings.title")}</h1>
      <p className="mt-2 text-sm text-ink/60">{t("settings.subtitle")}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-8">
        <section className="card space-y-4 p-6">
          <div>
            <label className="text-xs uppercase tracking-wide text-ink/50">{t("settings.photo")}</label>
            <div className="mt-1 max-w-xs">
              <Controller
                control={control}
                name="avatarUrl"
                render={({ field }) => (
                  <ImageUploader value={field.value} onChange={field.onChange} folder="avatars" />
                )}
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-ink/50">{t("common.name")}</label>
            <input
              {...register("name", { required: true })}
              className="mt-1 w-full rounded-lg border border-line bg-white/60 px-3 py-2 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-ink/50">{t("settings.bio")}</label>
            <textarea
              {...register("bio")}
              rows={3}
              placeholder="Tell people what you like to cook..."
              className="mt-1 w-full rounded-lg border border-line bg-white/60 px-3 py-2 text-sm focus:outline-none"
            />
          </div>
        </section>

        <section className="card space-y-5 p-6">
          <h2 className="font-display text-xl italic">{t("settings.cookingPreferences")}</h2>
          <p className="text-xs text-ink/50">{t("settings.cookingPreferencesSub")}</p>

          <Controller
            control={control}
            name="cuisines"
            render={({ field }) => (
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-ink/50">{t("settings.favoriteCuisines")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
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
            name="diets"
            render={({ field }) => (
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-ink/50">{t("settings.dietaryPreferences")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
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

          <div>
            <label className="text-xs uppercase tracking-wide text-ink/50">{t("settings.allergies")}</label>
            <input
              {...register("allergiesText")}
              placeholder="peanuts, shellfish (comma-separated)"
              className="mt-1 w-full rounded-lg border border-line bg-white/60 px-3 py-2 text-sm focus:outline-none"
            />
          </div>
        </section>

        {error && <p className="text-sm text-plum">{error}</p>}
        {saved && <p className="text-sm text-sage">{t("settings.saved")}</p>}

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? t("settings.saving") : t("settings.saveChanges")}
        </button>
      </form>
    </div>
  );
}
