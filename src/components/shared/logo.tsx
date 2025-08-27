import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", className)}
    >
      <path
        d="M2 24L8 4H12L14 14L16 4H20L26 24H21L18 10L14 24L10 10L7 24H2Z"
        fill="currentColor"
      />
    </svg>
  );
}
