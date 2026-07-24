import { Schema, model, Document, Types } from "mongoose";

export interface IMealDay {
  day: number;
  breakfast: string;
  lunch: string;
  dinner: string;
}

export interface IMealPlan extends Document {
  user: Types.ObjectId;
  goal: string;
  days: IMealDay[];
  createdAt: Date;
  updatedAt: Date;
}

const mealDaySchema = new Schema<IMealDay>(
  {
    day: { type: Number, required: true },
    breakfast: { type: String, default: "" },
    lunch: { type: String, default: "" },
    dinner: { type: String, default: "" },
  },
  { _id: false }
);

const mealPlanSchema = new Schema<IMealPlan>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    goal: { type: String, required: true, maxlength: 150 },
    days: { type: [mealDaySchema], default: [] },
  },
  { timestamps: true }
);

export default model<IMealPlan>("MealPlan", mealPlanSchema);
