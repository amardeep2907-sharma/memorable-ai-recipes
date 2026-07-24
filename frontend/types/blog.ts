export interface BlogPostSummary {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  author: { _id: string; name: string; avatarUrl?: string };
  publishedAt: string;
}

export interface BlogPost extends BlogPostSummary {
  content: string;
  status: "draft" | "published";
  createdAt: string;
}

export interface AdminContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "resolved";
  createdAt: string;
}
