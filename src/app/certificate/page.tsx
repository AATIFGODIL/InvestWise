
"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { useUserStore } from "@/store/user-store";
import Certificate from "@/components/dashboard/certificate";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Download, ArrowLeft } from "lucide-react";

export default function CertificatePage() {
  const { username } = useUserStore();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    // Generate the date only on the client-side after the component has mounted
    // This prevents a hydration mismatch between server and client.
    setCurrentDate(new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }));
  }, []); // Empty dependency array ensures this runs only once on the client

  const handleDownload = useCallback(() => {
    if (certificateRef.current === null) {
      return;
    }

    // Dynamically import the library only when the function is called
    import('html-to-image').then(({ toPng }) => {
      toPng(certificateRef.current!, { cacheBust: true })
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = "InvestWise-Certificate.png";
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error("Failed to download certificate image:", err);
        });
    });
  }, []);

  return (
    <div className="bg-muted/40 min-h-screen flex flex-col items-center justify-center p-4">
      <div ref={certificateRef}>
        <Certificate name={username} date={currentDate} />
      </div>
      <div className="mt-8 flex gap-4">
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <Button onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download Certificate
        </Button>
      </div>
    </div>
  );
}
