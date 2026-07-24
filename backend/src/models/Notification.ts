import { Schema, model, Document, Types } from "mongoose";

export type NotificationType =
  | "recipe_approved" | "recipe_liked" | "new_follower" | "new_comment"
  | "weekly_ai_recommendation" | "blog_post_approved";

export interface INotification extends Document {
  user: Types.ObjectId;
  type: NotificationType;
  message: string;
  relatedRecipe?: Types.ObjectId;
  relatedBlogPost?: Types.ObjectId;
  relatedUser?: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: [
        "recipe_approved", "recipe_liked", "new_follower", "new_comment",
        "weekly_ai_recommendation", "blog_post_approved",
      ],
      required: true,
    },
    message: { type: String, required: true },
    relatedRecipe: { type: Schema.Types.ObjectId, ref: "Recipe" },
    relatedBlogPost: { type: Schema.Types.ObjectId, ref: "BlogPost" },
    relatedUser: { type: Schema.Types.ObjectId, ref: "User" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default model<INotification>("Notification", notificationSchema);
