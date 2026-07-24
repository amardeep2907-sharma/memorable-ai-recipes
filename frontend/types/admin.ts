export interface AdminStats {
  totalUsers: number;
  totalRecipes: number;
  spoonacularRecipes: number;
  userRecipes: number;
  aiUsageCount: number;
  dailyVisitors: number;
  weeklyVisitors: number;
  newsletterSubscribers: number;
}

export interface Subscriber {
  _id: string;
  email: string;
  subscribedAt: string;
}

export interface PendingRecipe {
  _id: string;
  title: string;
  imageUrl: string;
  author?: { _id: string; name: string; email: string };
  createdAt: string;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}
