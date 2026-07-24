import { Schema, model, Document, Types } from "mongoose";

export type ReportTargetType = "recipe" | "comment" | "review" | "user";
export type ReportStatus = "pending" | "resolved" | "dismissed";

export interface IReport extends Document {
  reportedBy: Types.ObjectId;
  targetType: ReportTargetType;
  targetId: Types.ObjectId;
  reason: string;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    targetType: { type: String, enum: ["recipe", "comment", "review", "user"], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true, index: true },
    reason: { type: String, required: true, maxlength: 500 },
    status: { type: String, enum: ["pending", "resolved", "dismissed"], default: "pending" },
  },
  { timestamps: true }
);

export default model<IReport>("Report", reportSchema);
