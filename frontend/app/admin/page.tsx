"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutGrid, Users as UsersIcon, ClipboardCheck, ShieldAlert,
  Check, Trash2, Sparkles, BookOpen, ChefHat, Tag, MessageCircle, Star, Flag, Plus, Mail,
  Newspaper, Inbox, ArrowUpRight, ShieldCheck, Search, Filter, Layers
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { AdminStats, PendingRecipe, AdminUser, Subscriber } from "@/types/admin";
import { Category, AdminComment, AdminReview, Report } from "@/types/admin-extra";
import { BlogPost, AdminContactMessage } from "@/types/blog";
import ProtectedRoute from "@/components/ProtectedRoute";
import StatCardsSkeleton from "@/components/skeletons/StatCardsSkeleton";
import ListSkeleton from "@/components/skeletons/ListSkeleton";
import TableSkeleton from "@/components/skeletons/TableSkeleton";

type Tab =
  | "overview" | "pending" | "users" | "categories" | "comments" | "reviews" | "reports"
  | "newsletter" | "blog" | "messages";

const TABS: { id: Tab; label: string; icon: typeof LayoutGrid }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "pending", label: "Pending recipes", icon: ClipboardCheck },
  { id: "users", label: "Users", icon: UsersIcon },
  { id: "categories", label: "Categories", icon: Tag },
  { id: "comments", label: "Comments", icon: MessageCircle },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "reports", label: "Reports", icon: Flag },
  { id: "newsletter", label: "Newsletter", icon: Mail },
  { id: "blog", label: "Blog", icon: Newspaper },
  { id: "messages", label: "Messages", icon: Inbox },
];

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}

function AdminDashboardContent() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-500 selection:text-white">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-purple-600/15 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-pink-600/10 blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-600/10 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-800/60 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-purple-400 backdrop-blur-md">
              <ShieldAlert className="h-3.5 w-3.5 text-purple-400 animate-pulse" /> Command Center
            </div>
            <h1 className="mt-3 font-serif text-4xl sm:text-5xl tracking-tight text-white font-medium">
              Kitchen Control Room
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-xl">
              Moderate submitted recipes, manage global platform access, tune categories, and review real-time activity metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs text-slate-300 shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              System Live
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="mb-8 overflow-x-auto no-scrollbar pb-2">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-4">
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`group flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/30 ring-1 ring-white/20"
                      : "bg-slate-900/60 text-slate-400 border border-slate-800/60 hover:border-slate-700 hover:bg-slate-800/60 hover:text-slate-200"
                  }`}
                >
                  <Icon className={`h-4 w-4 transition-transform duration-200 ${active ? "scale-110 text-white" : "text-slate-400 group-hover:scale-105"}`} />
                  {label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="transition-all duration-300">
          {tab === "overview" && <OverviewPanel />}
          {tab === "pending" && <PendingRecipesPanel />}
          {tab === "users" && <UsersPanel />}
          {tab === "categories" && <CategoriesPanel />}
          {tab === "comments" && <CommentsPanel />}
          {tab === "reviews" && <ReviewsPanel />}
          {tab === "reports" && <ReportsPanel />}
          {tab === "newsletter" && <NewsletterPanel />}
          {tab === "blog" && <BlogPanel />}
          {tab === "messages" && <MessagesPanel />}
        </main>
      </div>
    </div>
  );
}

function OverviewPanel() {
  const { data, isLoading, isError } = useQuery<{ data: AdminStats }>({
    queryKey: ["admin", "stats"],
    queryFn: () => adminApi.getStats(),
  });

  if (isLoading) return <StatCardsSkeleton />;
  if (isError) return <AdminAccessNotice />;

  const stats = data!.data;
  const cards = [
    { label: "Total users", value: stats.totalUsers, icon: UsersIcon, gradient: "from-blue-500/10 to-indigo-500/10", border: "border-blue-500/20" },
    { label: "Total recipes", value: stats.totalRecipes, icon: BookOpen, gradient: "from-purple-500/10 to-pink-500/10", border: "border-purple-500/20" },
    { label: "Spoonacular recipes", value: stats.spoonacularRecipes, icon: ChefHat, gradient: "from-amber-500/10 to-orange-500/10", border: "border-amber-500/20" },
    { label: "User-submitted", value: stats.userRecipes, icon: ClipboardCheck, gradient: "from-emerald-500/10 to-teal-500/10", border: "border-emerald-500/20" },
    { label: "AI interactions", value: stats.aiUsageCount, icon: Sparkles, gradient: "from-fuchsia-500/10 to-purple-500/10", border: "border-fuchsia-500/20" },
    { label: "Visitors today", value: stats.dailyVisitors, icon: LayoutGrid, gradient: "from-cyan-500/10 to-blue-500/10", border: "border-cyan-500/20" },
    { label: "Visitors this week", value: stats.weeklyVisitors, icon: LayoutGrid, gradient: "from-violet-500/10 to-purple-500/10", border: "border-violet-500/20" },
    { label: "Newsletter subscribers", value: stats.newsletterSubscribers, icon: Mail, gradient: "from-rose-500/10 to-pink-500/10", border: "border-rose-500/20" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, gradient, border }) => (
        <div
          key={label}
          className={`group relative overflow-hidden rounded-2xl border ${border} bg-slate-900/60 bg-gradient-to-br ${gradient} p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-950/20`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
            <div className="rounded-xl border border-white/10 bg-slate-950/50 p-2.5 text-purple-400 group-hover:scale-110 transition-transform">
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
          </div>
          <p className="mt-4 font-mono text-4xl font-bold tracking-tight text-white">{value.toLocaleString()}</p>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-400">
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" /> Live updated
          </div>
        </div>
      ))}
    </div>
  );
}

function PendingRecipesPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery<{ data: PendingRecipe[] }>({
    queryKey: ["admin", "pending-recipes"],
    queryFn: () => adminApi.listPendingRecipes(),
  });

  async function approve(id: string) {
    await adminApi.approveRecipe(id);
    queryClient.invalidateQueries({ queryKey: ["admin", "pending-recipes"] });
  }

  async function remove(id: string) {
    await adminApi.deleteRecipe(id);
    queryClient.invalidateQueries({ queryKey: ["admin", "pending-recipes"] });
  }

  if (isLoading) return <ListSkeleton rows={4} />;
  if (isError) return <AdminAccessNotice />;

  const recipes = data!.data;
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center backdrop-blur-md">
        <ShieldCheck className="h-12 w-12 text-emerald-400/80 mb-3" />
        <p className="text-lg font-medium text-slate-200">Queue is Clear</p>
        <p className="mt-1 text-sm text-slate-500">No pending recipes require approval right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recipes.map((recipe) => (
        <div
          key={recipe._id}
          className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md transition-all hover:border-slate-700 hover:bg-slate-900"
        >
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
              {recipe.imageUrl ? (
                <Image src={recipe.imageUrl} alt={recipe.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-700">
                  <ChefHat className="h-6 w-6" />
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-slate-100 text-lg group-hover:text-purple-300 transition-colors">{recipe.title}</p>
              <p className="mt-1 text-xs text-slate-400">
                by <span className="text-slate-200 font-medium">{recipe.author?.name ?? "Unknown"}</span> · {new Date(recipe.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => approve(recipe._id)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all"
            >
              <Check className="h-4 w-4" /> Approve
            </button>
            <button
              onClick={() => remove(recipe._id)}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 text-slate-400 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
              aria-label="Delete recipe"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function UsersPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery<{ data: AdminUser[] }>({
    queryKey: ["admin", "users"],
    queryFn: () => adminApi.listUsers(),
  });

  async function toggleRole(user: AdminUser) {
    const nextRole = user.role === "admin" ? "user" : "admin";
    await adminApi.setUserRole(user._id, nextRole);
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
  }

  if (isLoading) return <TableSkeleton columns={5} rows={6} />;
  if (isError) return <AdminAccessNotice />;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="p-4 pl-6">User</th>
              <th className="p-4">Email</th>
              <th className="p-4">Joined</th>
              <th className="p-4">Role</th>
              <th className="p-4 text-right pr-6">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {data!.data.map((user) => (
              <tr key={user._id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-4 pl-6 font-medium text-slate-200">{user.name}</td>
                <td className="p-4 text-slate-400">{user.email}</td>
                <td className="p-4 text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      user.role === "admin"
                        ? "border border-purple-500/30 bg-purple-500/10 text-purple-300"
                        : "border border-slate-800 bg-slate-800/50 text-slate-400"
                    }`}
                  >
                    {user.role === "admin" && <ShieldAlert className="h-3 w-3" />}
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-right pr-6">
                  <button
                    onClick={() => toggleRole(user)}
                    className="inline-flex items-center rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-700 transition-all"
                  >
                    {user.role === "admin" ? "Revoke admin" : "Make admin"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const CATEGORY_TYPES = ["cuisine", "mealType", "diet"] as const;

function CategoriesPanel() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [type, setType] = useState<(typeof CATEGORY_TYPES)[number]>("cuisine");

  const { data, isLoading, isError } = useQuery<{ data: Category[] }>({
    queryKey: ["admin", "categories"],
    queryFn: () => adminApi.listCategories(),
  });

  async function handleCreate() {
    if (!name.trim()) return;
    await adminApi.createCategory({ name: name.trim(), type });
    setName("");
    queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
  }

  async function handleDelete(id: string) {
    await adminApi.deleteCategory(id);
    queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
  }

  if (isLoading) return <ListSkeleton rows={3} />;
  if (isError) return <AdminAccessNotice />;

  const categories = data!.data;

  return (
    <div className="space-y-6">
      {/* Creation Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4 text-purple-400" /> Create New Category
        </h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-slate-400">Category Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mediterranean, Vegan, Breakfast"
              className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>
          <div className="sm:w-48">
            <label className="text-xs font-medium text-slate-400">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as (typeof CATEGORY_TYPES)[number])}
              className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
            >
              <option value="cuisine">Cuisine</option>
              <option value="mealType">Meal type</option>
              <option value="diet">Diet</option>
            </select>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 hover:opacity-90 transition-all"
          >
            <Plus className="h-4 w-4" /> Add Category
          </button>
        </div>
      </div>

      {/* Category Lists */}
      {categories.length === 0 ? (
        <p className="text-sm text-slate-500">No categories found. Create one above.</p>
      ) : (
        <div className="space-y-6">
          {CATEGORY_TYPES.map((groupType) => {
            const group = categories.filter((c) => c.type === groupType);
            if (group.length === 0) return null;
            return (
              <div key={groupType} className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5">
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-purple-400 mb-3">{groupType}</p>
                <div className="flex flex-wrap gap-2">
                  {group.map((cat) => (
                    <div
                      key={cat._id}
                      className="group flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 py-1.5 text-xs text-slate-200 hover:border-slate-700 transition-all"
                    >
                      <span>{cat.name}</span>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors"
                        aria-label={`Remove ${cat.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CommentsPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery<{ data: AdminComment[] }>({
    queryKey: ["admin", "comments"],
    queryFn: () => adminApi.listComments(),
  });

  async function remove(id: string) {
    await adminApi.deleteComment(id);
    queryClient.invalidateQueries({ queryKey: ["admin", "comments"] });
  }

  if (isLoading) return <ListSkeleton rows={4} />;
  if (isError) return <AdminAccessNotice />;

  const comments = data!.data;
  if (comments.length === 0) return <p className="text-sm text-slate-500">No comments to moderate.</p>;

  return (
    <div className="space-y-3">
      {comments.map((c) => (
        <div key={c._id} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="space-y-1">
            <p className="text-sm text-slate-200">{c.text}</p>
            <p className="text-xs text-slate-400">
              <span className="text-slate-300 font-medium">{c.user?.name ?? "Unknown User"}</span> on{" "}
              {c.recipe ? (
                <Link href={`/recipes/${c.recipe._id}`} className="text-purple-400 hover:underline">
                  {c.recipe.title}
                </Link>
              ) : (
                <span className="italic text-slate-500">[Deleted Recipe]</span>
              )}{" "}
              · {new Date(c.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => remove(c._id)}
            className="rounded-xl border border-slate-800 bg-slate-950/60 p-2 text-slate-400 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
            aria-label="Delete comment"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function ReviewsPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery<{ data: AdminReview[] }>({
    queryKey: ["admin", "reviews"],
    queryFn: () => adminApi.listReviews(),
  });

  async function remove(id: string) {
    await adminApi.deleteReview(id);
    queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
  }

  if (isLoading) return <ListSkeleton rows={4} />;
  if (isError) return <AdminAccessNotice />;

  const reviews = data!.data;
  if (reviews.length === 0) return <p className="text-sm text-slate-500">No reviews yet.</p>;

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div key={r._id} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-1 text-amber-400 text-sm">
              {"★".repeat(r.rating)}
              <span className="text-slate-700">{"★".repeat(5 - r.rating)}</span>
            </div>
            {r.text && <p className="mt-1.5 text-sm text-slate-200">{r.text}</p>}
            <p className="mt-1 text-xs text-slate-400">
              <span className="text-slate-300 font-medium">{r.user?.name ?? "Unknown User"}</span> on{" "}
              {r.recipe ? (
                <Link href={`/recipes/${r.recipe._id}`} className="text-purple-400 hover:underline">
                  {r.recipe.title}
                </Link>
              ) : (
                <span className="italic text-slate-500">[Deleted Recipe]</span>
              )}{" "}
              · {new Date(r.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => remove(r._id)}
            className="rounded-xl border border-slate-800 bg-slate-950/60 p-2 text-slate-400 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
            aria-label="Delete review"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function ReportsPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery<{ data: Report[] }>({
    queryKey: ["admin", "reports"],
    queryFn: () => adminApi.listReports("pending"),
  });

  async function resolve(id: string, status: "resolved" | "dismissed") {
    await adminApi.updateReportStatus(id, status);
    queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
  }

  if (isLoading) return <ListSkeleton rows={4} />;
  if (isError) return <AdminAccessNotice />;

  const reports = data!.data;
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center backdrop-blur-md">
        <ShieldCheck className="h-12 w-12 text-emerald-400/80 mb-3" />
        <p className="text-lg font-medium text-slate-200">No Pending Reports</p>
        <p className="mt-1 text-sm text-slate-500">All community flags and reports are addressed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <div key={r._id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md">
          <div>
            <span className="inline-block rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-300 uppercase tracking-wide">
              {r.targetType}
            </span>
            <p className="mt-2 text-sm text-slate-200">{r.reason}</p>
            <p className="mt-1 text-xs text-slate-400">
              Reported by <span className="text-slate-300 font-medium">{r.reportedBy.name}</span> · {new Date(r.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => resolve(r._id, "resolved")}
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all"
            >
              Resolve
            </button>
            <button
              onClick={() => resolve(r._id, "dismissed")}
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function NewsletterPanel() {
  const { data, isLoading, isError } = useQuery<{ data: Subscriber[]; meta: { total: number } }>({
    queryKey: ["admin", "newsletter"],
    queryFn: () => adminApi.listSubscribers(),
  });

  if (isLoading) return <TableSkeleton columns={2} rows={6} />;
  if (isError) return <AdminAccessNotice />;

  const subscribers = data!.data;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Total Subscribers: <span className="text-purple-400 font-mono">{data!.meta.total}</span>
        </p>
      </div>

      {subscribers.length === 0 ? (
        <p className="text-sm text-slate-500">No active subscribers currently.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="p-4 pl-6">Email Address</th>
                <th className="p-4 pr-6 text-right">Subscribed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {subscribers.map((s) => (
                <tr key={s._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 pl-6 font-mono text-slate-200">{s.email}</td>
                  <td className="p-4 pr-6 text-right text-slate-400">{new Date(s.subscribedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function BlogPanel() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"pending" | "all">("pending");

  const pendingQuery = useQuery<{ data: BlogPost[] }>({
    queryKey: ["admin", "blog", "pending"],
    queryFn: () => adminApi.listPendingBlogPosts(),
    enabled: view === "pending",
  });
  const allQuery = useQuery<{ data: BlogPost[] }>({
    queryKey: ["admin", "blog", "all"],
    queryFn: () => adminApi.listBlogPosts(),
    enabled: view === "all",
  });

  const query = view === "pending" ? pendingQuery : allQuery;
  const { data, isLoading, isError } = query;

  async function approve(id: string) {
    await adminApi.approveBlogPost(id);
    queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
  }

  async function remove(id: string) {
    await adminApi.deleteBlogPost(id);
    queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
  }

  async function unpublish(id: string) {
    await adminApi.updateBlogPost(id, { status: "draft" });
    queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => setView("pending")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            view === "pending"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-900/30"
              : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200"
          }`}
        >
          Pending review
        </button>
        <button
          onClick={() => setView("all")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            view === "all"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-900/30"
              : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200"
          }`}
        >
          All posts
        </button>
      </div>

      <div>
        {isLoading && <ListSkeleton rows={4} />}
        {isError && <AdminAccessNotice />}

        {!isLoading && !isError && data!.data.length === 0 && (
          <p className="text-sm text-slate-500">
            {view === "pending" ? "Nothing waiting for review — the queue is clear." : "No posts found."}
          </p>
        )}

        {!isLoading && !isError && data!.data.length > 0 && (
          <div className="space-y-3">
            {data!.data.map((post) => (
              <div key={post._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-100 text-base">{post.title}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        post.status === "published"
                          ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : "border border-purple-500/30 bg-purple-500/10 text-purple-300"
                      }`}
                    >
                      {post.status === "published" ? "Live" : "Pending"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {post.status !== "published" ? (
                    <button
                      onClick={() => approve(post._id)}
                      className="inline-flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => unpublish(post._id)}
                      className="rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-all"
                    >
                      Unpublish
                    </button>
                  )}
                  <button
                    onClick={() => remove(post._id)}
                    className="rounded-xl border border-slate-800 bg-slate-950/60 p-2 text-slate-400 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
                    aria-label="Delete post"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MessagesPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery<{ data: AdminContactMessage[] }>({
    queryKey: ["admin", "messages"],
    queryFn: () => adminApi.listContactMessages(),
  });

  async function setStatus(id: string, status: "new" | "read" | "resolved") {
    await adminApi.updateContactMessageStatus(id, status);
    queryClient.invalidateQueries({ queryKey: ["admin", "messages"] });
  }

  if (isLoading) return <ListSkeleton rows={4} />;
  if (isError) return <AdminAccessNotice />;

  const messages = data!.data;
  if (messages.length === 0) return <p className="text-sm text-slate-500">Inbox is empty.</p>;

  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <div key={m._id} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-100 text-base">{m.subject}</p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    m.status === "new"
                      ? "border border-purple-500/30 bg-purple-500/10 text-purple-300"
                      : m.status === "resolved"
                      ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border border-slate-800 bg-slate-800/50 text-slate-400"
                  }`}
                >
                  {m.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                <span className="text-slate-300 font-medium">{m.name}</span> ({m.email}) · {new Date(m.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {m.status !== "read" && (
                <button
                  onClick={() => setStatus(m._id, "read")}
                  className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-all"
                >
                  Mark read
                </button>
              )}
              {m.status !== "resolved" && (
                <button
                  onClick={() => setStatus(m._id, "resolved")}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all"
                >
                  Resolve
                </button>
              )}
            </div>
          </div>
          <p className="mt-4 rounded-xl border border-slate-800/60 bg-slate-950/40 p-3.5 whitespace-pre-line text-sm text-slate-300 leading-relaxed">
            {m.message}
          </p>
        </div>
      ))}
    </div>
  );
}

function AdminAccessNotice() {
  return (
    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-300 backdrop-blur-md">
      Couldn't load admin data — make sure you're signed in with an admin account.
      The API rejects this section with a 403 status code for non-admin accounts.
    </div>
  );
}