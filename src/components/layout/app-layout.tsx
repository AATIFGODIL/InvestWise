
"use client";

import Header from "@/components/layout/header";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="w-full bg-background font-body">
      <Header />
      {children}
    </div>
  );
}
