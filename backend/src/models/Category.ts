import { Schema, model, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  type: "cuisine" | "mealType" | "diet";
  imageUrl?: string;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    type: { type: String, enum: ["cuisine", "mealType", "diet"], required: true },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export default model<ICategory>("Category", categorySchema);
