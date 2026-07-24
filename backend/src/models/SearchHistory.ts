import { Schema, model, Document, Types } from "mongoose";

export interface ISearchHistory extends Document {
  user: Types.ObjectId;
  query: string;
  filters?: Record<string, unknown>;
  createdAt: Date;
}

const searchHistorySchema = new Schema<ISearchHistory>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    query: { type: String, required: true },
    filters: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default model<ISearchHistory>("SearchHistory", searchHistorySchema);
