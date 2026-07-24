"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { analyticsApi } from "@/lib/api";

// Fires a fire-and-forget page-view ping on every route change, feeding the
// admin dashboard's "Visitors today / this week" cards. No cookies, no
// session stitching - just a path + timestamp, per PageView's own comment.
export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    analyticsApi.track(pathname);
  }, [pathname]);

  return null;
}
