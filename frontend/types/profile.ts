import { Recipe } from "./recipe";

export interface PublicProfileUser {
  _id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  followers: string[];
  following: string[];
  createdAt: string;
}

export interface PublicProfileResult {
  data: {
    user: PublicProfileUser;
    recipes: Recipe[];
  };
}
