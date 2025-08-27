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
      fill="currentColor"
    >
      <path
        d="M56 28 a18 18 0 1 1 0 -0.0001Z M56 64
           v75
           a12 12 0 0 0 12 12
           h0
           a12 12 0 0 0 12 -12
           L80 94
           l18 57
           a12 12 0 0 0 11 9
           h0
           a12 12 0 0 0 11 -9
           l18 -57
           L138 139
           a12 12 0 0 0 12 12
           h0
           a12 12 0 0 0 12 -12
           v-75
           a12 12 0 0 0 -12 -12
           h-84
           a12 12 0 0 0 -12 12
           Z"
      />
    </svg>
  );
}
