import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", className)}
    >
      <path
        d="M25 56C25 43.8333 32.1 35.5 40 35C47.9 34.5 54.1667 43.8333 55 56V75"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M50 56C50 43.8333 57.1 35.5 65 35C72.9 34.5 79.1667 43.8333 80 56V75"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="25" cy="22" r="8" fill="currentColor" />
    </svg>
  );
}
