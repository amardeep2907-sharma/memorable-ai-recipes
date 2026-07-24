export interface RecipeIngredient {
  name: string;
  quantity?: string;
  unit?: string;
}

export interface Nutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface Recipe {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  images: string[];
  videoUrl?: string;
  source: "spoonacular" | "user";
  spoonacularId?: number;
  author?: { _id: string; name: string; avatarUrl?: string };
  ingredients: RecipeIngredient[];
  steps: string[];
  cuisine: string[];
  mealType: string[];
  diets: string[];
  seasons: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  status: "draft" | "published";
  nutrition: Nutrition;
  likesCount: number;
  savesCount: number;
  averageRating: number;
  ratingsCount: number;
  createdAt: string;
}

export interface RecipeSearchResult {
  data: Recipe[];
  meta: { page: number; limit: number; total: number };
}

export interface ViewerState {
  liked: boolean;
  saved: boolean;
  myRating: number | null;
}

export interface RecipeDetailResult {
  data: Recipe;
  viewerState: ViewerState;
}
