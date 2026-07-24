"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (requireAdmin && user?.role !== "admin") {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, requireAdmin, user, router]);

  if (isLoading || !isAuthenticated || (requireAdmin && user?.role !== "admin")) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-plum" />
      </div>
    );
  }

  return <>{children}</>;
}
