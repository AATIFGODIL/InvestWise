import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export default function Logo({ className, width = "auto", height = 32 }: LogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 220 200"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", className)}
      fill="currentColor"
    >
      {/* Dot above the i */}
      <circle cx="60" cy="44" r="22" />
      {/* Lowercase "i" (rounded) */}
      <rect x="48" y="70" width="24" height="72" rx="12" />
      {/* Stylized "w" (bold, rounded, right-leaned) */}
      <path d="
        M 90 142
        Q 108 90, 122 142
        Q 135 90, 154 142
        Q 163 170, 187 70
        Q 180 140, 154 142
        " />
    </svg>
  );
}
