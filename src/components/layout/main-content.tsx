"use client";

import { cn } from "@/lib/utils";

export default function MainContent({ children, isSpecialLayoutRoute }: { children: React.ReactNode, isSpecialLayoutRoute?: boolean }) {
  // This component now primarily serves as a consistent padding/margin wrapper for the main content area.
  // All loading logic has been removed to ensure instantaneous transitions.
  return <div className={cn("flex-1 overflow-y-auto", !isSpecialLayoutRoute && "pt-20")}>{children}</div>;
}
