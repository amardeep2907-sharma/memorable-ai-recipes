export interface FeedActor {
  _id: string;
  name: string;
  avatarUrl?: string;
}

export interface FeedRecipeRef {
  _id: string;
  title: string;
  imageUrl?: string;
}

export type FeedItemType = "recipe_published" | "recipe_liked" | "comment_added" | "review_added";

export interface FeedItem {
  id: string;
  type: FeedItemType;
  actor: FeedActor;
  recipe: FeedRecipeRef;
  text?: string;
  rating?: number;
  createdAt: string;
}
