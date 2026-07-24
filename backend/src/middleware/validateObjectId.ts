import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError";

// Guards routes that assume req.params[paramName] is a real Mongo document
// (likes, saves, reviews, comments) against IDs like "spoonacular:12345" -
// those recipes aren't in our database, so liking/saving/reviewing/
// commenting on them isn't supported yet. Without this, they'd hit
// Mongoose with an invalid ObjectId and crash as an unhandled 500 instead
// of a clean, expected 400.
export function requireMongoId(paramName: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const value = req.params[paramName];
    if (!mongoose.isValidObjectId(value)) {
      throw ApiError.badRequest("This action isn't available for externally-sourced recipes yet");
    }
    next();
  };
}
