import { Schema, model, Document, Types } from "mongoose";

export interface IReview extends Document {
  user: Types.ObjectId;
  recipe: Types.ObjectId;
  rating: number;
  text?: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    recipe: { type: Schema.Types.ObjectId, ref: "Recipe", required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, maxlength: 1000, default: "" },
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, recipe: 1 }, { unique: true });

export default model<IReview>("Review", reviewSchema);
