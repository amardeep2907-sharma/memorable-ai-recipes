import { Schema, model, Document, Types } from "mongoose";

export interface ISavedRecipe extends Document {
  user: Types.ObjectId;
  recipe: Types.ObjectId;
  collectionName: string;
  createdAt: Date;
}

const savedRecipeSchema = new Schema<ISavedRecipe>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    recipe: { type: Schema.Types.ObjectId, ref: "Recipe", required: true, index: true },
    collectionName: { type: String, default: "Saved" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

savedRecipeSchema.index({ user: 1, recipe: 1 }, { unique: true });

export default model<ISavedRecipe>("SavedRecipe", savedRecipeSchema);
