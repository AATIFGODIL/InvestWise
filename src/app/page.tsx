// InvestWise - A modern stock trading and investment education platform for young investors

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import PageSkeleton from "@/components/layout/page-skeleton";
import { LandingExperience } from "@/components/marketing/landing-experience";

// The root page. Signed-in users go straight to their dashboard; everyone else
// gets the landing page, which is what `/` is for — sending a first-time
// visitor to a sign-in form asks them to open an account for a product they
// have not been shown yet.
export default function Home() {
  const router = useRouter();
  const { user, hydrating } = useAuth();

  useEffect(() => {
    if (!hydrating && user) {
      // `replace`, not `push`: a signed-in user pressing Back should leave the
      // app, not bounce off this redirect and straight back into it.
      router.replace("/dashboard");
    }
  }, [user, hydrating, router]);

  // The landing page paints while auth is still resolving, rather than holding
  // a skeleton until it has. Firebase takes a few hundred ms to say who this
  // is, and spending them on a skeleton means the landing's own opening — a
  // loader whose sculpture is meant to be on screen from the first frame —
  // starts late and looks like it arrived from nowhere. Its loader already
  // covers that beat, so a signed-in visitor sees the same splash they'd have
  // seen either way and is redirected out from under it, usually before the
  // page behind it has assembled at all.
  if (!hydrating && user) {
    return (
      <div className="h-screen w-screen">
        <PageSkeleton />
      </div>
    );
  }

  return <LandingExperience />;
}
