import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", className)}
    >
      <path
        d="M4 7L10 25L16 7L22 25L28 7"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <line
        x1="16"
        y1="0"
        x2="16"
        y2="32"
        stroke="#4C1D95"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
