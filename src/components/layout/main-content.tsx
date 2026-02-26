// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import { cn } from "@/lib/utils";

export default function MainContent({
  children,
  isSpecialLayoutRoute,
  disableScroll,
  hasSideRail,
  hasExpandedHeader,
}: {
  children: React.ReactNode,
  isSpecialLayoutRoute?: boolean,
  disableScroll?: boolean,
  hasSideRail?: boolean,
  hasExpandedHeader?: boolean,
}) {
  return (
    <div
      id="main-content"
      className={cn(
        "flex-1 transition-[padding] duration-500 ease-in-out",
        // When header is expanded (at page top), need full top padding
        // When collapsed to accent line, only need minimal padding
        hasExpandedHeader ? "pt-20" : (!isSpecialLayoutRoute ? "pt-4" : ""),
        !disableScroll && "overflow-y-auto",
        hasSideRail && "pl-[92px]",
      )}
    >
      {children}
    </div>
  );
}
