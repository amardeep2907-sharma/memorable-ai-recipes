import { Schema, model, Document } from "mongoose";

export interface IIngredient extends Document {
  name: string;
  aliases: string[];
  category?: string;
}

const ingredientSchema = new Schema<IIngredient>(
  {
    name: { type: String, required: true, unique: true, lowercase: true, trim: true },
    aliases: { type: [String], default: [] },
    category: { type: String, default: "" },
  },
  { timestamps: true }
);

export default model<IIngredient>("Ingredient", ingredientSchema);
