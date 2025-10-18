
"use client";

import { cn } from "@/lib/utils";

export default function MainContent({ children, isLoading, isSpecialLayoutRoute }: { children: React.ReactNode, isLoading?: boolean, isSpecialLayoutRoute?: boolean }) {
  // isLoading prop is now optional and only used by the main LayoutContent
  // The AppLayout component will render its own loader when needed.

  // This component now primarily serves as a consistent wrapper for the main content area.
  return <div className={cn("flex-1 overflow-y-auto", !isSpecialLayoutRoute && "pt-20")}>{children}</div>;
}
