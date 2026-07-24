import { Schema, model, Document, Types } from "mongoose";

export type AIInteractionType =
  | "recommendation" | "cooking_assistant" | "ingredient_substitute"
  | "meal_plan" | "recipe_summary" | "nutrition_explainer" | "chat";

export interface IAIRecommendationHistory extends Document {
  user: Types.ObjectId;
  type: AIInteractionType;
  prompt: string;
  response: string;
  relatedRecipes: Types.ObjectId[];
  createdAt: Date;
}

const aiHistorySchema = new Schema<IAIRecommendationHistory>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["recommendation", "cooking_assistant", "ingredient_substitute", "meal_plan", "recipe_summary", "nutrition_explainer", "chat"],
      required: true,
    },
    prompt: { type: String, required: true },
    response: { type: String, required: true },
    relatedRecipes: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default model<IAIRecommendationHistory>("AIRecommendationHistory", aiHistorySchema);
