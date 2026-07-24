import { Schema, model, Document, Types } from "mongoose";

export interface IRecipeIngredient {
  name: string;
  quantity?: string;
  unit?: string;
}

export interface IRecipe extends Document {
  title: string;
  description: string;
  imageUrl: string;
  images: string[];
  videoUrl?: string;
  source: "spoonacular" | "user";
  spoonacularId?: number;
  author?: Types.ObjectId;
  ingredients: IRecipeIngredient[];
  steps: string[];
  cuisine: string[];
  mealType: string[];
  diets: string[];
  seasons: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  nutrition: { calories?: number; protein?: number; carbs?: number; fat?: number };
  status: "draft" | "published";
  likesCount: number;
  savesCount: number;
  averageRating: number;
  ratingsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const recipeSchema = new Schema<IRecipe>(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, default: "", maxlength: 1000 },
    imageUrl: { type: String, default: "" },
    images: { type: [String], default: [] },
    videoUrl: { type: String, default: "" },
    source: { type: String, enum: ["spoonacular", "user"], required: true },
    spoonacularId: { type: Number, index: true, sparse: true },
    author: { type: Schema.Types.ObjectId, ref: "User", index: true, sparse: true },
    ingredients: [{ name: { type: String, required: true }, quantity: String, unit: String }],
    steps: { type: [String], default: [] },
    cuisine: { type: [String], default: [], index: true },
    mealType: { type: [String], default: [], index: true },
    diets: { type: [String], default: [], index: true },
    // A recipe can suit more than one season (e.g. a soup for Autumn AND
    // Winter), so this is an array like cuisine/mealType/diets rather than
    // a single value. Left empty on recipes where seasonality doesn't
    // really apply (a plain omelette, say).
    seasons: {
      type: [String],
      enum: ["Spring", "Summer", "Autumn", "Winter"],
      default: [],
      index: true,
    },
    prepTimeMinutes: { type: Number, default: 0 },
    cookTimeMinutes: { type: Number, default: 0 },
    servings: { type: Number, default: 2 },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
    nutrition: { calories: Number, protein: Number, carbs: Number, fat: Number },
    status: { type: String, enum: ["draft", "published"], default: "published" },
    likesCount: { type: Number, default: 0 },
    savesCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

recipeSchema.index({ title: "text", description: "text" });

export default model<IRecipe>("Recipe", recipeSchema);
