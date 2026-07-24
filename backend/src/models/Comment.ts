import { Schema, model, Document, Types } from "mongoose";

export interface IComment extends Document {
  user: Types.ObjectId;
  recipe: Types.ObjectId;
  text: string;
  parentComment?: Types.ObjectId;
  createdAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    recipe: { type: Schema.Types.ObjectId, ref: "Recipe", required: true, index: true },
    text: { type: String, required: true, maxlength: 500 },
    parentComment: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
  },
  { timestamps: true }
);

export default model<IComment>("Comment", commentSchema);
