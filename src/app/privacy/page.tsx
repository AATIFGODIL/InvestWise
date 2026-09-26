// InvestWise - A modern stock trading and investment education platform for young investors

import type { Metadata } from "next";
import type React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { InvestWiseLogo } from "@/components/marketing/investwise-logo";

export const metadata: Metadata = {
  title: "Privacy Policy | InvestWise",
  description: "What InvestWise collects, why, and the choices you have.",
};

/** Where privacy questions go. */
const CONTACT_EMAIL = "aatifgodil@gmail.com";

const LAST_UPDATED = "September 27, 2026";

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "The short version",
    body: (
      <p>
        InvestWise is a paper-trading app for learning to invest. You trade with virtual money, so we never
        hold or move real funds for you. We collect what we need to run your account and the features you
        use, and we don&apos;t sell your personal information.
      </p>
    ),
  },
  {
    title: "What you give us",
    body: (
      <ul>
        <li>
          <strong>Account details:</strong> your email address, username and profile photo. If you sign in
          with Google, we receive your name, email and photo from Google.
        </li>
        <li>
          <strong>What you create in the app:</strong> your virtual portfolio, trades, goals, watchlist,
          favourites, auto-invest plans, notifications and settings such as theme and accent colour.
        </li>
        <li>
          <strong>Payment methods:</strong> if you add one in your profile, it is sent to and stored by
          Braintree, a PayPal service. InvestWise keeps a reference to it, not your full card number.
        </li>
      </ul>
    ),
  },
  {
    title: "Services that help run InvestWise",
    body: (
      <ul>
        <li>
          <strong>Google Firebase</strong> stores your account and app data, and handles sign-in.
        </li>
        <li>
          <strong>Vercel</strong> hosts the website and counts page visits with Vercel Web Analytics, which
          doesn&apos;t use cookies or identify you personally.
        </li>
        <li>
          <strong>Google Gemini</strong> powers the AI assistant, stock predictions and avatar generation.
          What you ask the assistant is sent to it to produce a reply, along with any file you attach, your
          voice input, and the page and stock you&apos;re viewing.
        </li>
        <li>
          <strong>Finnhub, TradingView, Logokit and GNews</strong> provide prices, charts, company logos and
          news. The symbols you look up are sent to them to fetch that information.
        </li>
        <li>
          <strong>YouTube</strong> plays the lesson videos. A video only loads from YouTube when you press
          play.
        </li>
        <li>
          <strong>Email:</strong> we send sign-in verification codes to your email address.
        </li>
      </ul>
    ),
  },
  {
    title: "On your device",
    body: (
      <p>
        Some preferences and progress, like which videos you&apos;ve watched, Pro Mode, and which tours
        you&apos;ve seen, are saved in your browser so the app remembers them.
      </p>
    ),
  },
  {
    title: "What others can see",
    body: (
      <p>
        The Community Leaderboard shows your username and returns. You can choose to appear anonymously or
        not at all in Settings → Privacy, and hide your quests there too.
      </p>
    ),
  },
  {
    title: "Young investors",
    body: (
      <p>
        InvestWise is built for young people. Parental controls are available in Settings, where a parent
        or guardian can be added.
      </p>
    ),
  },
  {
    title: "Your choices",
    body: (
      <ul>
        <li>Change your profile photo at any time.</li>
        <li>Change your leaderboard visibility and quest visibility in Settings.</li>
        <li>Ask us to remove a saved payment method, or to delete your account and its data.</li>
      </ul>
    ),
  },
  {
    title: "Changes to this policy",
    body: (
      <p>
        If we change how we handle your information, we&apos;ll update this page and the date at the top.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="dark min-h-screen bg-background text-foreground antialiased" style={{ colorScheme: "dark" }}>
      <div className="mx-auto max-w-2xl px-6 pb-24 pt-10">
        <div className="flex items-center justify-between">
          <Link
            href="/landing"
            className="flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2 text-sm font-medium text-foreground/80 ring-1 ring-white/10 backdrop-blur-md transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <InvestWiseLogo className="w-[150px]" sizes="150px" />
        </div>

        <h1 className="mt-14 text-[clamp(2.2rem,6vw,3.2rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated {LAST_UPDATED}</p>

        <div className="mt-12 space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold tracking-tight">{section.title}</h2>
              <div className="mt-3 text-[15px] leading-relaxed text-foreground/70 [&_li]:mt-2 [&_strong]:font-semibold [&_strong]:text-foreground/90 [&_ul]:list-disc [&_ul]:pl-5">
                {section.body}
              </div>
            </section>
          ))}

          <section>
            <h2 className="text-lg font-semibold tracking-tight">Contact</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-foreground/70">
              {CONTACT_EMAIL ? (
                <>
                  Questions about this policy or your data? Email{" "}
                  <a className="text-primary underline-offset-4 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
                    {CONTACT_EMAIL}
                  </a>
                  .
                </>
              ) : (
                "Questions about this policy or your data? Reach out to the InvestWise team."
              )}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
