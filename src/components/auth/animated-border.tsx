"use client";

import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/theme-store";

interface AnimatedBorderProps {
  className?: string;
}

export default function AnimatedBorder({ className }: AnimatedBorderProps) {
    // We only need isClearMode from the store for this component's logic
    const { isClearMode } = useThemeStore();

    // Calculate the path length:
    // Radius = 10 (from 1 to 11, 43 to 53)
    // Straight side length = 43 - 11 = 32
    // Total straight length = 32 * 4 = 128
    // Corner (4 * 1/4 * 2 * PI * R) = 2 * PI * 10 ≈ 62.83
    // Total path length ≈ 128 + 62.83 = 190.83
    const pathLength = 191; // Round up

    return (
        <div
            className={cn(
                "absolute inset-0 w-full h-full rounded-xl pointer-events-none overflow-hidden",
                className
            )}
        >
            <svg
                className="absolute inset-0 w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                preserveAspectRatio="none"
                // 1. ADDED: The viewBox to scale the path correctly.
                viewBox="0 0 54 54"
            >
                <path
                    d="M1,11 V43 C1,48.5228 5.47715,53 11,53 H43 C48.5228,53 53,48.5228 53,43 V11 C53,5.47715 48.5228,1 43,1 H11 C5.47715,1 1,5.47715 1,11"
                    className={cn(
                        "stroke-primary [animation:draw-border_2s_linear_forwards]"
                        // 3. REMOVED: Redundant drop-shadow and dasharray/offset
                    )}
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{
                        // 2. ADDED: Correct path length for the animation
                        strokeDasharray: pathLength,
                        strokeDashoffset: pathLength,
                        // 3. This is the single, clean source of truth for the shadow
                        filter: isClearMode ? 'drop-shadow(0 0 3px hsl(var(--primary)))' : 'none',
                        vectorEffect: "non-scaling-stroke",
                    }}
                />
            </svg>
        </div>
    );
}
