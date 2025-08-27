import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <svg
      width="42"
      height="32"
      viewBox="0 0 42 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", className)}
    >
      <path
        d="M5.33333 12H11.3333V28H5.33333V12ZM8.33333 0C10.5417 0 12.3333 1.79167 12.3333 4C12.3333 6.20833 10.5417 8 8.33333 8C6.125 8 4.33333 6.20833 4.33333 4C4.33333 1.79167 6.125 0 8.33333 0ZM15.3333 28H21.4583L28.3333 10.9583L35.2083 28H41.3333L31.3333 8.33333C30.25 6.45833 28.3333 5.33333 26.2917 5.33333C24.25 5.33333 22.3333 6.45833 21.25 8.33333L15.3333 18.0417V28Z"
        fill="currentColor"
      />
    </svg>
  );
}
