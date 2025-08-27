import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export default function Logo({ className, width = 32, height = 32 }: LogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", className)}
      fill="currentColor"
    >
      <circle cx="26" cy="23" r="11" />
      <path d="M15,45 V85 H37 V58 C37,58 45,45 59,45 C73,45 80,58 80,58 V85 H100 V45 C100,45 85,30 72,30 C59,30 45,45 45,45 C45,45 31,30 18,30 C5,30 15,45 15,45 Z" />
    </svg>
  );
}
