
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", className)}
    >
      <path
        d="M12 2L2 12H6V22H10V16H14V22H18V12H22L12 2ZM12 5.69L16.31 10H7.69L12 5.69Z"
        fill="currentColor"
      />
    </svg>
  );
}
