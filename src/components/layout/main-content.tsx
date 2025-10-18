
"use client";

export default function MainContent({ children, isLoading }: { children: React.ReactNode, isLoading?: boolean }) {
  // isLoading prop is now optional and only used by the main LayoutContent
  // The AppLayout component will render its own loader when needed.

  // This component now primarily serves as a consistent wrapper for the main content area.
  return <div className="flex-1 overflow-y-auto pt-20">{children}</div>;
}
