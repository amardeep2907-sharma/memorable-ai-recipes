export interface Comment {
  _id: string;
  user: { _id: string; name: string; avatarUrl?: string };
  recipe: string;
  text: string;
  parentComment?: string | null;
  createdAt: string;
}
