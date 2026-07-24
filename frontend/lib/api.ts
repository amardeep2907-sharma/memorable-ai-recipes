import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api",
  withCredentials: true, // sends the httpOnly refresh-token cookie
});

// The access token lives in memory only (not localStorage) — it's short-lived
// and re-issued from the refresh cookie on page load. AuthContext is the only
// thing that should call setAuthToken(); everything else just uses `api`.
let accessToken: string | null = null;
let authFailureListener: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  accessToken = token;
}

export function getAuthToken() {
  return accessToken;
}

// AuthContext registers this so the interceptor can clear React state when a
// refresh attempt fails (e.g. the refresh cookie expired or was revoked).
export function setOnAuthFailure(listener: (() => void) | null) {
  authFailureListener = listener;
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});


api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const isRefreshCall = original?.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && original && !original._retried && !isRefreshCall) {
      original._retried = true;
      try {
        const refreshRes = await api.post("/auth/refresh");
        setAuthToken(refreshRes.data.data.accessToken);
        original.headers.Authorization = `Bearer ${refreshRes.data.data.accessToken}`;
        return api(original);
      } catch (refreshError) {
        setAuthToken(null);
        authFailureListener?.();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const recipeApi = {
  search: (params: Record<string, string | number | undefined>) =>
    api.get("/recipes", { params }).then((r) => r.data),
  getById: (id: string) => api.get(`/recipes/${id}`).then((r) => r.data),
  similar: (id: string) => api.get(`/recipes/${id}/similar`).then((r) => r.data),
  recommended: () => api.get("/recipes/recommended").then((r) => r.data),
  like: (id: string) => api.post(`/recipes/${id}/like`).then((r) => r.data),
  save: (id: string) => api.post(`/recipes/${id}/save`).then((r) => r.data),
  create: (payload: Record<string, unknown>) => api.post("/recipes", payload).then((r) => r.data),
  update: (id: string, payload: Record<string, unknown>) =>
    api.patch(`/recipes/${id}`, payload).then((r) => r.data),
  listReviews: (id: string) => api.get(`/recipes/${id}/reviews`).then((r) => r.data),
  addReview: (id: string, rating: number, text?: string) =>
    api.post(`/recipes/${id}/reviews`, { rating, text }).then((r) => r.data),
};

export const aiApi = {
  cookingAssistant: (ingredients: string, dietaryNotes?: string) =>
    api.post("/ai/cooking-assistant", { ingredients, dietaryNotes }).then((r) => r.data),
  substitute: (missingIngredient: string, context?: string) =>
    api.post("/ai/substitute", { missingIngredient, context }).then((r) => r.data),
  mealPlan: (goal: string, days?: number) =>
    api.post("/ai/meal-plan", { goal, days }).then((r) => r.data),
  summarize: (recipeText: string) => api.post("/ai/summarize", { recipeText }).then((r) => r.data),
  nutritionExplainer: (nutritionFacts: string) =>
    api.post("/ai/nutrition-explainer", { nutritionFacts }).then((r) => r.data),
  smartSearch: (query: string) => api.post("/ai/smart-search", { query }).then((r) => r.data),
  chat: (messages: { role: "user" | "assistant"; content: string }[]) =>
    api.post("/ai/chat", { messages }).then((r) => r.data),
  history: () => api.get("/ai/history").then((r) => r.data),
};

export const userApi = {
  myRecipes: () => api.get("/users/me/recipes").then((r) => r.data),
  saved: () => api.get("/users/me/saved").then((r) => r.data),
  moveSaved: (recipeId: string, collectionName: string) =>
    api.patch(`/users/me/saved/${recipeId}`, { collectionName }).then((r) => r.data),
  liked: () => api.get("/users/me/liked").then((r) => r.data),
  notifications: () => api.get("/users/me/notifications").then((r) => r.data),
  markNotificationRead: (id: string) => api.patch(`/users/me/notifications/${id}/read`).then((r) => r.data),
  getMe: () => api.get("/users/me").then((r) => r.data),
  updateMe: (payload: Record<string, unknown>) => api.patch("/users/me", payload).then((r) => r.data),
  getPublicProfile: (id: string) => api.get(`/users/${id}`).then((r) => r.data),
  follow: (id: string) => api.post(`/users/${id}/follow`).then((r) => r.data),
  unfollow: (id: string) => api.delete(`/users/${id}/follow`).then((r) => r.data),
  featured: () => api.get("/users/featured").then((r) => r.data),
  feed: () => api.get("/users/me/feed").then((r) => r.data),
};

export const authApi = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }).then((r) => r.data),
  register: (name: string, email: string, password: string) =>
    api.post("/auth/register", { name, email, password }).then((r) => r.data),
  google: (idToken: string) => api.post("/auth/google", { idToken }).then((r) => r.data),
};

export const uploadApi = {
  image: (file: File, folder: "recipes" | "avatars" = "recipes") => {
    const form = new FormData();
    form.append("image", file);
    form.append("folder", folder);
    return api
      .post("/uploads/image", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },
  video: (file: File) => {
    const form = new FormData();
    form.append("video", file);
    return api
      .post("/uploads/video", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },
};

export const adminApi = {
  getStats: () => api.get("/admin/stats").then((r) => r.data),
  listUsers: (page = 1) => api.get("/admin/users", { params: { page } }).then((r) => r.data),
  setUserRole: (id: string, role: "user" | "admin") =>
    api.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data),
  listPendingRecipes: () => api.get("/admin/recipes/pending").then((r) => r.data),
  approveRecipe: (id: string) => api.patch(`/admin/recipes/${id}/approve`).then((r) => r.data),
  deleteRecipe: (id: string) => api.delete(`/admin/recipes/${id}`).then((r) => r.data),

  listCategories: () => api.get("/admin/categories").then((r) => r.data),
  createCategory: (payload: { name: string; type: string; imageUrl?: string }) =>
    api.post("/admin/categories", payload).then((r) => r.data),
  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`).then((r) => r.data),

  listComments: () => api.get("/admin/comments").then((r) => r.data),
  deleteComment: (id: string) => api.delete(`/admin/comments/${id}`).then((r) => r.data),

  listReviews: () => api.get("/admin/reviews").then((r) => r.data),
  deleteReview: (id: string) => api.delete(`/admin/reviews/${id}`).then((r) => r.data),

  listReports: (status = "pending") => api.get("/admin/reports", { params: { status } }).then((r) => r.data),
  updateReportStatus: (id: string, status: "resolved" | "dismissed") =>
    api.patch(`/admin/reports/${id}`, { status }).then((r) => r.data),

  listSubscribers: () => api.get("/admin/newsletter/subscribers").then((r) => r.data),

  listContactMessages: (status?: string) =>
    api.get("/admin/contact-messages", { params: { status } }).then((r) => r.data),
  updateContactMessageStatus: (id: string, status: "new" | "read" | "resolved") =>
    api.patch(`/admin/contact-messages/${id}`, { status }).then((r) => r.data),

  listBlogPosts: () => api.get("/admin/blog").then((r) => r.data),
  listPendingBlogPosts: () => api.get("/admin/blog/pending").then((r) => r.data),
  approveBlogPost: (id: string) => api.patch(`/admin/blog/${id}/approve`).then((r) => r.data),
  updateBlogPost: (id: string, payload: Record<string, unknown>) =>
    api.patch(`/admin/blog/${id}`, payload).then((r) => r.data),
  deleteBlogPost: (id: string) => api.delete(`/admin/blog/${id}`).then((r) => r.data),
};

export const reportApi = {
  create: (targetType: "recipe" | "comment" | "review" | "user", targetId: string, reason: string) =>
    api.post("/reports", { targetType, targetId, reason }).then((r) => r.data),
};

export const mealPlanApi = {
  mine: () => api.get("/meal-plans/mine").then((r) => r.data),
  getById: (id: string) => api.get(`/meal-plans/${id}`).then((r) => r.data),
  update: (id: string, payload: Record<string, unknown>) =>
    api.patch(`/meal-plans/${id}`, payload).then((r) => r.data),
  delete: (id: string) => api.delete(`/meal-plans/${id}`).then((r) => r.data),
};

export const newsletterApi = {
  subscribe: (email: string) => api.post("/newsletter/subscribe", { email }).then((r) => r.data),
  unsubscribe: (token: string) => api.get(`/newsletter/unsubscribe/${token}`).then((r) => r.data),
};

export const contactApi = {
  submit: (name: string, email: string, subject: string, message: string) =>
    api.post("/contact", { name, email, subject, message }).then((r) => r.data),
};

export const blogApi = {
  list: (page = 1) => api.get("/blog", { params: { page } }).then((r) => r.data),
  getBySlug: (slug: string) => api.get(`/blog/${slug}`).then((r) => r.data),
  create: (payload: Record<string, unknown>) => api.post("/blog", payload).then((r) => r.data),
  update: (id: string, payload: Record<string, unknown>) =>
    api.patch(`/blog/${id}`, payload).then((r) => r.data),
  delete: (id: string) => api.delete(`/blog/${id}`).then((r) => r.data),
  mine: () => api.get("/blog/me/mine").then((r) => r.data),
};

export const analyticsApi = {
  // Fire-and-forget - failures here should never affect the user's experience.
  track: (path: string) => api.post("/analytics/track", { path }).catch(() => undefined),
};

export const commentApi = {
  list: (recipeId: string) => api.get(`/recipes/${recipeId}/comments`).then((r) => r.data),
  add: (recipeId: string, text: string, parentComment?: string) =>
    api.post(`/recipes/${recipeId}/comments`, { text, parentComment }).then((r) => r.data),
  remove: (id: string) => api.delete(`/recipes/comments/${id}`).then((r) => r.data),
};
