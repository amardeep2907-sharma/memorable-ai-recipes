import { Schema, model, Document } from "mongoose";

// Deliberately minimal - just enough to answer "how many visits today /
// this week" for the admin dashboard. Not a real analytics pipeline (no
// session stitching, no user agent parsing, no geo).
export interface IPageView extends Document {
  path: string;
  createdAt: Date;
}

const pageViewSchema = new Schema<IPageView>(
  {
    path: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

pageViewSchema.index({ createdAt: -1 });

export default model<IPageView>("PageView", pageViewSchema);
