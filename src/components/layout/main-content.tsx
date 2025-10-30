
"use client";

import { cn } from "@/lib/utils";

export default function MainContent({ 
  children, 
  isSpecialLayoutRoute,
  disableScroll,
}: { 
  children: React.ReactNode, 
  isSpecialLayoutRoute?: boolean,
  disableScroll?: boolean,
}) {
  return (
    <div 
      className={cn(
        "flex-1", 
        !isSpecialLayoutRoute && "pt-20",
        !disableScroll && "overflow-y-auto",
      )}
    >
      {children}
    </div>
  );
}
