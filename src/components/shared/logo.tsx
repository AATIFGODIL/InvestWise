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
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="#4C1D95"
        fontSize="48"
        fontWeight="bold"
        fontFamily="Poppins, sans-serif"
      >
        I
      </text>
    </svg>
  );
}
