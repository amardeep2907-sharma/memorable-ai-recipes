import { Schema, model, Document } from "mongoose";

export interface INewsletterSubscriber extends Document {
  email: string;
  isActive: boolean;
  unsubscribeToken: string;
  subscribedAt: Date;
  unsubscribedAt?: Date;
}

const newsletterSubscriberSchema = new Schema<INewsletterSubscriber>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  isActive: { type: Boolean, default: true },
  unsubscribeToken: { type: String, required: true, unique: true },
  subscribedAt: { type: Date, default: Date.now },
  unsubscribedAt: { type: Date },
});

export default model<INewsletterSubscriber>("NewsletterSubscriber", newsletterSubscriberSchema);
