export interface Review {
  _id: string;
  user: { _id: string; name: string; avatarUrl?: string };
  recipe: string;
  rating: number;
  text?: string;
  createdAt: string;
}
