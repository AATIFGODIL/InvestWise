// InvestWise - A modern stock trading and investment education platform for young investors
'use client';

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
    // This effect runs only on the client-side to prevent hydration mismatches.
    // It generates the current date and sets a flag in localStorage so the
    // congratulations banner doesn't appear again after viewing the certificate.
    setCurrentDate(new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }));

    localStorage.setItem('hasViewedCertificate', 'true');
    
  }, []);

  // This function captures the certificate component as a PNG and initiates a download.
  const handleDownload = useCallback(() => {
    if (certificateRef.current === null) {
      return;
    }

    // Dynamically import the html-to-image library only when needed to reduce initial bundle size.
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
      <div className="w-full max-w-lg mx-auto">
        <div ref={certificateRef}>
            <Certificate name={username} date={currentDate} />
        </div>
        <div className="mt-8 flex gap-4 justify-center">
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
    </div>
  );
}
