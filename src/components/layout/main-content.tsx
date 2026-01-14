// InvestWise - A modern stock trading and investment education platform for young investors

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
      id="main-content"
      className={cn(
        "flex-1 transition-[padding] duration-500 ease-in-out",
        !isSpecialLayoutRoute && "pt-20",
        !disableScroll && "overflow-y-auto",
      )}
    >
      {children}
    </div>
  );
}
