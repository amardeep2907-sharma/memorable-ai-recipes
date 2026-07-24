import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB(): Promise<void> {
  if (!env.mongoUri) {
    console.warn(
      "[db] MONGODB_URI is not set - skipping connection. Set it in .env to connect to MongoDB Atlas."
    );
    return;
  }

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(env.mongoUri);
    console.log("[db] MongoDB connected");
  } catch (err) {
    console.error("[db] MongoDB connection failed:", err);
    process.exit(1);
  }
}
