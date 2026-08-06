// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import { LandingExperience } from "@/components/marketing/landing-experience";

/**
 * The landing page at its own address.
 *
 * `/` renders the same component for signed-out visitors; this route exists so
 * the page stays reachable by a signed-in user who wants to see it, and so it
 * has a stable URL to link to from outside the app.
 */
export default function LandingRoute() {
  return <LandingExperience />;
}
