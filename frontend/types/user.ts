export interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  role: "user" | "admin";
  preferences: { cuisines: string[]; diets: string[]; allergies: string[] };
}

export interface AuthResponse {
  user: Pick<User, "_id" | "name" | "email">;
  accessToken: string;
}
