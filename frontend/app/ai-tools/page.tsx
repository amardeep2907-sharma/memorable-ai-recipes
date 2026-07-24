"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Loader2, ChefHat, Repeat, CalendarDays, FileText, Flame } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { aiApi } from "@/lib/api";
import { useLocale } from "@/context/LocaleContext";

type Tool = "cooking-assistant" | "substitute" | "meal-plan" | "summarize" | "nutrition";

const TOOLS: { id: Tool; labelKey: string; icon: typeof ChefHat }[] = [
  { id: "cooking-assistant", labelKey: "aiTools.cookingAssistant", icon: ChefHat },
  { id: "substitute", labelKey: "aiTools.substitute", icon: Repeat },
  { id: "meal-plan", labelKey: "aiTools.mealPlanner", icon: CalendarDays },
  { id: "summarize", labelKey: "aiTools.summarizer", icon: FileText },
  { id: "nutrition", labelKey: "aiTools.nutrition", icon: Flame },
];

export default function AIToolsPage() {
  return (
    <ProtectedRoute>
      <AIToolsContent />
    </ProtectedRoute>
  );
}

function AIToolsContent() {
  const [tool, setTool] = useState<Tool>("cooking-assistant");
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-plum">
        <Sparkles className="h-3.5 w-3.5" /> {t("aiTools.badge")}
      </p>
      <h1 className="mt-2 font-display text-3xl italic">{t("aiTools.title")}</h1>
      <p className="mt-2 text-sm text-ink/60">{t("aiTools.subtitle")}</p>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-line pb-4">
        {TOOLS.map(({ id, labelKey, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTool(id)}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
              tool === id ? "border-plum bg-plum text-paper" : "border-line text-ink/70 hover:border-plum/40"
            }`}
          >
            <Icon className="h-3.5 w-3.5" /> {t(labelKey)}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tool === "cooking-assistant" && <CookingAssistantTool />}
        {tool === "substitute" && <SubstituteTool />}
        {tool === "meal-plan" && <MealPlanTool />}
        {tool === "summarize" && <SummarizeTool />}
        {tool === "nutrition" && <NutritionTool />}
      </div>
    </div>
  );
}

function ResultBox({ text }: { text: string | null }) {
  if (!text) return null;
  return <div className="card mt-5 whitespace-pre-line p-4 text-sm text-ink/80">{text}</div>;
}

function CookingAssistantTool() {
  const [ingredients, setIngredients] = useState("");
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!ingredients.trim()) return;
    setLoading(true);
    try {
      const res = await aiApi.cookingAssistant(ingredients, dietaryNotes || undefined);
      setResult(res.data.response);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-ink/50">What's in your kitchen?</label>
      <textarea
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
        placeholder="rice, onion, tomato, eggs..."
        rows={3}
        className="mt-1 w-full rounded-lg border border-line bg-white/60 p-3 text-sm focus:outline-none"
      />
      <label className="mt-4 block text-xs uppercase tracking-wide text-ink/50">Dietary notes (optional)</label>
      <input
        value={dietaryNotes}
        onChange={(e) => setDietaryNotes(e.target.value)}
        placeholder="vegetarian, no dairy..."
        className="mt-1 w-full rounded-lg border border-line bg-white/60 px-3 py-2 text-sm focus:outline-none"
      />
      <button onClick={run} disabled={loading} className="btn-primary mt-4">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Suggest recipes"}
      </button>
      <ResultBox text={result} />
    </div>
  );
}

function SubstituteTool() {
  const [missingIngredient, setMissingIngredient] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!missingIngredient.trim()) return;
    setLoading(true);
    try {
      const res = await aiApi.substitute(missingIngredient, context || undefined);
      setResult(res.data.response);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-ink/50">What are you out of?</label>
      <input
        value={missingIngredient}
        onChange={(e) => setMissingIngredient(e.target.value)}
        placeholder="butter"
        className="mt-1 w-full rounded-lg border border-line bg-white/60 px-3 py-2 text-sm focus:outline-none"
      />
      <label className="mt-4 block text-xs uppercase tracking-wide text-ink/50">Recipe context (optional)</label>
      <input
        value={context}
        onChange={(e) => setContext(e.target.value)}
        placeholder="baking a cake"
        className="mt-1 w-full rounded-lg border border-line bg-white/60 px-3 py-2 text-sm focus:outline-none"
      />
      <button onClick={run} disabled={loading} className="btn-primary mt-4">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Find a substitute"}
      </button>
      <ResultBox text={result} />
    </div>
  );
}

function MealPlanTool() {
  const router = useRouter();
  const [goal, setGoal] = useState("");
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!goal.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await aiApi.mealPlan(goal, days);
      router.push(`/meal-plans/${res.data._id}`);
    } catch {
      setError("Couldn't generate a plan just now — please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-ink/50">Your goal</label>
      <input
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder="weight loss, muscle gain, vegetarian..."
        className="mt-1 w-full rounded-lg border border-line bg-white/60 px-3 py-2 text-sm focus:outline-none"
      />
      <label className="mt-4 block text-xs uppercase tracking-wide text-ink/50">Duration (days)</label>
      <input
        type="number"
        min={1}
        max={30}
        value={days}
        onChange={(e) => setDays(Number(e.target.value))}
        className="mt-1 w-24 rounded-lg border border-line bg-white/60 px-3 py-2 font-mono text-sm focus:outline-none"
      />
      <button onClick={run} disabled={loading} className="btn-primary mt-4">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Plan my week"}
      </button>
      {loading && <p className="mt-2 text-xs text-ink/50">This can take a few seconds...</p>}
      {error && <p className="mt-2 text-xs text-plum">{error}</p>}
      <p className="mt-3 text-xs text-ink/40">
        Your plan gets saved to your <Link href="/dashboard?tab=mealplans" className="text-plum hover:underline">dashboard</Link>, where you can edit or delete it later.
      </p>
    </div>
  );
}

function SummarizeTool() {
  const [recipeText, setRecipeText] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!recipeText.trim()) return;
    setLoading(true);
    try {
      const res = await aiApi.summarize(recipeText);
      setResult(res.data.response);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-ink/50">Paste a long recipe</label>
      <textarea
        value={recipeText}
        onChange={(e) => setRecipeText(e.target.value)}
        placeholder="Paste the full recipe text here..."
        rows={6}
        className="mt-1 w-full rounded-lg border border-line bg-white/60 p-3 text-sm focus:outline-none"
      />
      <button onClick={run} disabled={loading} className="btn-primary mt-4">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Summarize"}
      </button>
      <ResultBox text={result} />
    </div>
  );
}

function NutritionTool() {
  const [nutritionFacts, setNutritionFacts] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!nutritionFacts.trim()) return;
    setLoading(true);
    try {
      const res = await aiApi.nutritionExplainer(nutritionFacts);
      setResult(res.data.response);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-ink/50">Paste nutrition facts</label>
      <textarea
        value={nutritionFacts}
        onChange={(e) => setNutritionFacts(e.target.value)}
        placeholder="420 kcal, 22g protein, 38g carbs, 18g fat..."
        rows={4}
        className="mt-1 w-full rounded-lg border border-line bg-white/60 p-3 text-sm focus:outline-none"
      />
      <button onClick={run} disabled={loading} className="btn-primary mt-4">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Explain it to me"}
      </button>
      <ResultBox text={result} />
    </div>
  );
}
