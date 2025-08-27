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
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", className)}
    >
      {/* Dot above the i */}
      <circle cx="60" cy="50" r="20" fill="currentColor"/>
      {/* Lowercase "i" */}
      <rect x="50" y="80" width="20" height="70" rx="10" fill="currentColor"/>
      {/* Stylized "w" */}
      <path d="M80 150 Q95 95 110 150 Q125 95 140 150" stroke="currentColor" strokeWidth="20" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
