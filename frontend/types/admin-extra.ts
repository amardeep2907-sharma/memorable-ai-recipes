export interface Category {
  _id: string;
  name: string;
  slug: string;
  type: "cuisine" | "mealType" | "diet";
  imageUrl?: string;
}

export interface AdminComment {
  _id: string;
  user: { _id: string; name: string; email: string };
  recipe: { _id: string; title: string };
  text: string;
  createdAt: string;
}

export interface AdminReview {
  _id: string;
  user: { _id: string; name: string; email: string };
  recipe: { _id: string; title: string };
  rating: number;
  text?: string;
  createdAt: string;
}

export interface Report {
  _id: string;
  reportedBy: { _id: string; name: string; email: string };
  targetType: "recipe" | "comment" | "review" | "user";
  targetId: string;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
}

export interface FeaturedCreator {
  _id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  recipeCount: number;
  totalLikes: number;
}
