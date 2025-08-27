import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export default function Logo({ className, width = 40, height = 30 }: LogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 256 192"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", className)}
    >
      <circle cx="56" cy="28" r="18" fill="currentColor" />
      <path
        d="M56 64 V148 M56 148 C 92 96, 122 96, 140 148 C 158 96, 190 96, 208 148"
        fill="none"
        stroke="currentColor"
        strokeWidth={42}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
