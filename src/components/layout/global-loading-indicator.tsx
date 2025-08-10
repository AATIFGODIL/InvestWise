
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import useLoadingStore from "@/store/loading-store";

export default function GlobalLoadingIndicator() {
  const { isLoading, hideLoading } = useLoadingStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Hide loading indicator whenever the path changes.
    hideLoading();
  }, [pathname, searchParams, hideLoading]);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
}
