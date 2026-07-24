import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";
dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",

  mongoUri: process.env.MONGODB_URI || "",

  jwt: {
  accessSecret: process.env.JWT_ACCESS_SECRET || "",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "",

  accessExpiresIn:
    (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as SignOptions["expiresIn"],

  refreshExpiresIn:
    (process.env.JWT_REFRESH_EXPIRES_IN || "30d") as SignOptions["expiresIn"],
},

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  },

  spoonacularApiKey: process.env.SPOONACULAR_API_KEY || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },

  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },

  // Where "Contact us" form submissions get forwarded - defaults to the
  // SMTP account itself so it works out of the box once email is configured.
  contactEmail: process.env.CONTACT_EMAIL || process.env.SMTP_USER || "",
};
