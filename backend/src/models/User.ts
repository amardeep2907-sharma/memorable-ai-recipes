import { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  avatarUrl?: string;
  bio?: string;
  role: "user" | "admin";
  isVerified: boolean;
  preferences: {
    cuisines: string[];
    diets: string[];
    allergies: string[];
  };
  following: Types.ObjectId[];
  followers: Types.ObjectId[];
  refreshTokenHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, select: false },
    googleId: { type: String, select: false },
    avatarUrl: { type: String, default: "" },
    bio: { type: String, maxlength: 300, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false },
    preferences: {
      cuisines: { type: [String], default: [] },
      diets: { type: [String], default: [] },
      allergies: { type: [String], default: [] },
    },
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    refreshTokenHash: { type: String, select: false },
  },
  { timestamps: true }
);

export default model<IUser>("User", userSchema);
