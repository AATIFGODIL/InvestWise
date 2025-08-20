
"use client";

import { useUserStore } from "@/store/user-store";
import Certificate from "@/components/dashboard/certificate";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CertificatePage() {
  const { username } = useUserStore();
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-muted/40 min-h-screen flex flex-col items-center justify-center p-4">
      <Certificate name={username} date={currentDate} />
      <Button asChild className="mt-8">
          <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
