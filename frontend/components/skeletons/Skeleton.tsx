import { cn } from "@/lib/utils";

// Base shimmer block - compose with width/height/rounding via className.
// e.g. <Skeleton className="h-4 w-24 rounded-full" />
export default function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-md", className)} />;
}
