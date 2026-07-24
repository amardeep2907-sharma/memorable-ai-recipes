"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { 
  CalendarDays, 
  Loader2, 
  Pencil, 
  Trash2, 
  Check, 
  X, 
  Clock, 
  Sun, 
  SunMedium, 
  Moon,
  ArrowLeft,
  Calendar
} from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { mealPlanApi } from "@/lib/api";
import { MealPlan, MealDay } from "@/types/mealPlan";

export default function MealPlanDetailPage() {
  return (
    <ProtectedRoute>
      <MealPlanDetailContent />
    </ProtectedRoute>
  );
}

const MEAL_SLOTS = [
  { key: "breakfast", label: "Breakfast", time: "08:00 AM", icon: Sun, badge: "bg-amber-500/10 text-amber-600" },
  { key: "lunch", label: "Lunch", time: "01:00 PM", icon: SunMedium, badge: "bg-orange-500/10 text-orange-600" },
  { key: "dinner", label: "Dinner", time: "08:00 PM", icon: Moon, badge: "bg-indigo-500/10 text-indigo-600" },
] as const;

function MealPlanDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<{ data: MealPlan }>({
    queryKey: ["meal-plan", params.id],
    queryFn: () => mealPlanApi.getById(params.id),
  });

  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [draft, setDraft] = useState<MealDay | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function startEdit(day: MealDay) {
    setEditingDay(day.day);
    setDraft({ ...day });
  }

  async function saveDay() {
    if (!data?.data || !draft) return;
    setSaving(true);
    try {
      const nextDays = data.data.days.map((d) => (d.day === draft.day ? draft : d));
      const res = await mealPlanApi.update(params.id, { days: nextDays });
      queryClient.setQueryData(["meal-plan", params.id], res);
      setEditingDay(null);
      setDraft(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await mealPlanApi.delete(params.id);
      router.push("/dashboard?tab=mealplans");
    } finally {
      setDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-plum" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="font-display text-2xl italic text-ink">Meal Plan Not Found</h2>
        <Link href="/dashboard?tab=mealplans" className="mt-4 inline-flex items-center gap-1.5 text-xs text-plum hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const plan = data.data;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      
      {/* Top Simple Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-plum uppercase tracking-wider">
            <CalendarDays className="h-4 w-4" />
            <span>Weekly Planner Schedule</span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-semibold italic text-ink sm:text-3xl">
            {plan.goal}
          </h1>
          <p className="mt-1 text-xs text-ink/50 flex items-center gap-2">
            <span>{plan.days.length} Days Schedule</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(plan.createdAt).toLocaleDateString()}
            </span>
          </p>
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors"
        >
          {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          <span>{deleting ? "Deleting..." : "Delete Plan"}</span>
        </button>
      </div>

      {/* Clean Timeline List */}
      <div className="mt-8 space-y-6">
        {plan.days.map((day) => {
          const isEditing = editingDay === day.day;

          return (
            <div
              key={day.day}
              className="rounded-2xl border border-line bg-paper p-5 shadow-xs transition-all hover:border-plum/30"
            >
              {/* Day Title Row */}
              <div className="flex items-center justify-between border-b border-line/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-plum text-xs font-bold text-white">
                    D{day.day}
                  </span>
                  <h3 className="font-display text-lg font-semibold italic text-ink">
                    Day {day.day}
                  </h3>
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={saveDay}
                      disabled={saving}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
                    >
                      {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingDay(null);
                        setDraft(null);
                      }}
                      className="rounded-lg border border-line p-1.5 text-ink/60 hover:bg-ink/5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(day)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-ink/50 hover:text-plum"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {/* Time Slots Table/Grid */}
              <div className="mt-4 grid grid-cols-1 divide-y divide-line/40 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
                {MEAL_SLOTS.map(({ key, label, time, icon: Icon, badge }) => (
                  <div key={key} className="p-3 first:pl-0 last:pr-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 text-plum" />
                        <span className="font-display text-sm font-semibold italic text-ink">{label}</span>
                      </div>
                      <span className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold ${badge}`}>
                        {time}
                      </span>
                    </div>

                    {isEditing && draft ? (
                      <textarea
                        value={draft[key]}
                        onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                        rows={2}
                        className="w-full rounded-lg border border-line bg-paper/60 p-2 text-xs text-ink focus:border-plum focus:outline-none"
                      />
                    ) : (
                      <p className="text-xs text-ink/80 leading-relaxed">
                        {day[key] || "—"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}