import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

// Using 2.5-flash: fast, cheap, and broadly available - swap the MODEL
// constant if you want a heavier model for higher-quality responses.
const MODEL = "gemini-3.5-flash";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!env.geminiApiKey) throw ApiError.internal("GEMINI_API_KEY is not configured");
  if (!client) client = new GoogleGenAI({ apiKey: env.geminiApiKey });
  return client;
}

async function complete(systemPrompt: string, userPrompt: string): Promise<string> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: userPrompt,
    config: { systemInstruction: systemPrompt, temperature: 0.7 },
  });
  return response.text ?? "";
}

const CHAT_SYSTEM_PROMPT =
  "You are Memorable's AI assistant, embedded as a floating chat widget on every page of the site. You have three " +
  "jobs, and you move between them naturally in one conversation: " +
  "(1) Finding real recipes - when someone wants to find, discover, or get suggestions for a recipe that could " +
  "exist on Memorable, call the search_recipes tool instead of describing a recipe from your own knowledge. Only " +
  "recipes returned by that tool are real, clickable recipes on this site - anything else you describe is just " +
  "conversational advice, not a site recipe, so don't imply otherwise. " +
  "(2) Cooking help - ingredient substitutes, day-by-day meal plans, summarizing a long recipe into quick steps, " +
  "and explaining nutrition facts in plain language. These don't need the search tool. " +
  "(3) Site support - answer \"how do I...\" questions about using Memorable (searching, saving, publishing a " +
  "recipe, following people, notifications, settings, etc.) using the site-help notes you're given, and answer " +
  "questions about the signed-in user's own account/activity using the account facts you're given. " +
  "Never invent site behavior that isn't in the notes you're given, and never claim to have changed the user's " +
  "account, data, or settings - you can describe things and point them to the right page, but you can't perform " +
  "actions on their behalf. If someone needs something outside all of this (billing, account deletion, a bug " +
  "report, anything you're not confident about), say so plainly and suggest they use the feedback/contact option " +
  "rather than guessing. " +
  "Read the conversation and respond to whatever is actually being asked - don't force every reply into a " +
  "template, and don't announce which \"mode\" you're in. Keep replies concise and skimmable, and ask a brief " +
  "clarifying question only when you genuinely can't help without more detail.";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface RecipeSearchArgs {
  keywords?: string;
  cuisine?: string;
  diet?: string;
  mealType?: string;
}

const SEARCH_RECIPES_DECLARATION = {
  name: "search_recipes",
  description:
    "Search Memorable's own recipe database. Use this whenever the person wants to find, discover, or get " +
    "suggestions for an actual recipe on the site - not for substitutes, meal planning, or general advice.",
  parametersJsonSchema: {
    type: "object",
    properties: {
      keywords: { type: "string", description: "Short search terms, e.g. 'spicy chicken curry'" },
      cuisine: { type: "string", enum: ["Indian", "Italian", "Mexican", "Chinese", "Thai"] },
      diet: { type: "string", enum: ["Vegetarian", "Vegan", "Keto", "Gluten Free", "High Protein"] },
      mealType: { type: "string", enum: ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"] },
    },
    required: [],
  },
};

// Gemini's `contents` array only uses roles "user" and "model" - map our
// "assistant" role onto "model" at the boundary.
function toGeminiContents(messages: ChatMessage[]) {
  return messages.map((m) => ({
    role: m.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: m.content }],
  }));
}

export const geminiService = {
  cookingAssistant(availableIngredients: string, dietaryNotes?: string) {
    return complete(
      "You are Memorable's cooking assistant. Given ingredients someone has on hand, suggest 3 practical recipes they could make, with a one-line description each. Keep it concise and encouraging.",
      `Ingredients: ${availableIngredients}${dietaryNotes ? `\nDietary notes: ${dietaryNotes}` : ""}`
    );
  },
  ingredientSubstitute(missingIngredient: string, context?: string) {
    return complete(
      "You suggest practical ingredient substitutes for home cooking, with brief notes on how each substitute changes taste or texture.",
      `Missing ingredient: ${missingIngredient}${context ? `\nRecipe context: ${context}` : ""}`
    );
  },
  // Returns structured day-by-day data (not prose) so the result can be
  // saved as a real MealPlan document and rendered/edited as a page,
  // rather than a wall of text the user can't do anything with afterward.
  async mealPlan(goal: string, days = 7): Promise<Array<{ day: number; breakfast: string; lunch: string; dinner: string }>> {
    const raw = await complete(
      "You are a meal-planning assistant. Given a goal and a number of days, respond with ONLY a JSON array " +
        '(no markdown, no explanation) of objects shaped like: {"day": 1, "breakfast": "...", "lunch": "...", "dinner": "..."}. ' +
        "One object per day, in order. Keep each meal entry to a short, specific dish name/description (under 15 words).",
      `Goal: ${goal}\nDuration: ${days} days`
    );
    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },
  recipeSummary(fullRecipeText: string) {
    return complete(
      "You summarize long recipes into a short, clear set of steps a beginner can follow in under a minute of reading.",
      fullRecipeText
    );
  },
  nutritionExplainer(nutritionFacts: string) {
    return complete(
      "You explain nutrition facts (calories, macros, key vitamins/minerals) in plain, friendly language, noting practical health benefits.",
      nutritionFacts
    );
  },
  personalizedRecommendationReasoning(profileSummary: string) {
    return complete(
      "Given a summary of a user's cooking history and preferences, explain briefly why the recommended recipes suit them. Two to three sentences.",
      profileSummary
    );
  },

  // Unified conversational endpoint for the floating chat widget - unlike
  // the single-shot helpers above, this sends the full message history so
  // the model has multi-turn context ("what about without dairy?" only
  // makes sense if it remembers the previous suggestion). `contextPreamble`
  // carries site-help notes and the signed-in user's own account facts.
  //
  // `searchRecipes` is dependency-injected rather than importing the Recipe
  // model here, so this service stays DB-agnostic like the rest of the file
  // - the controller owns the actual query, this just decides *when* to
  // call it based on the model's functionCalls response.
  async chat(
    messages: ChatMessage[],
    contextPreamble: string | undefined,
    searchRecipes: (args: RecipeSearchArgs) => Promise<Array<{ _id: unknown; title: string }>>
  ): Promise<{ reply: string; recipes: Array<{ _id: unknown; title: string }> }> {
    const ai = getClient();
    const systemContent = contextPreamble
      ? `${CHAT_SYSTEM_PROMPT}\n\n---\nReference notes (use only what's relevant; don't quote this verbatim):\n${contextPreamble}`
      : CHAT_SYSTEM_PROMPT;

    const baseContents = toGeminiContents(messages);

    const first = await ai.models.generateContent({
      model: MODEL,
      contents: baseContents,
      config: {
        systemInstruction: systemContent,
        temperature: 0.7,
        tools: [{ functionDeclarations: [SEARCH_RECIPES_DECLARATION] }],
      },
    });

    const call = first.functionCalls?.[0];
    const firstCandidateContent = first.candidates?.[0]?.content;

    if (!call || call.name !== "search_recipes" || !firstCandidateContent) {
      return { reply: first.text ?? "", recipes: [] };
    }

    const args: RecipeSearchArgs = (call.args as RecipeSearchArgs) ?? {};
    const recipes = await searchRecipes(args);
    const toolResultSummary = recipes.length
      ? `Found ${recipes.length} matching recipe(s) on Memorable: ${recipes.map((r) => r.title).join(", ")}. ` +
        "They'll be shown to the user as clickable cards below your reply - refer to them by name, don't repeat a list."
      : "No matching recipes were found in Memorable's database for that search.";

    // Pass `firstCandidateContent` directly to preserve the internal thought signature
    // and metadata required by Gemini models during multi-turn function calls.
    const second = await ai.models.generateContent({
      model: MODEL,
      contents: [
        ...baseContents,
        firstCandidateContent,
        {
          role: "user" as const,
          parts: [{ functionResponse: { name: "search_recipes", response: { result: toolResultSummary } } }],
        },
      ],
      config: { systemInstruction: systemContent, temperature: 0.7 },
    });

    return { reply: second.text ?? "", recipes };
  },

  // Turns a natural-language search ("something spicy and quick for
  // dinner, no meat") into structured filters the regular recipe search
  // can run against. Always returns strict JSON, no prose.
  async smartSearchFilters(naturalLanguageQuery: string): Promise<{
    keywords: string;
    cuisine?: string;
    diet?: string;
    mealType?: string;
  }> {
    const raw = await complete(
      "You convert a home cook's natural-language recipe request into a JSON object with keys: " +
        'keywords (string, short search terms), cuisine (one of Indian/Italian/Mexican/Chinese/Thai or omit), ' +
        'diet (one of Vegetarian/Vegan/Keto/"Gluten Free"/"High Protein" or omit), ' +
        'mealType (one of Breakfast/Lunch/Dinner/Snack/Dessert or omit). ' +
        "Respond with ONLY the JSON object, no markdown, no explanation.",
      naturalLanguageQuery
    );
    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned);
    } catch {
      return { keywords: naturalLanguageQuery };
    }
  },
};