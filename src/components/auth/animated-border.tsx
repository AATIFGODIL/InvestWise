"use client";

import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/theme-store";

interface AnimatedBorderProps {
  className?: string;
}

export default function AnimatedBorder({ className }: AnimatedBorderProps) {
    const { isClearMode } = useThemeStore();

    // The new card dimensions are 382x532 with a 12px radius.
    const width = 382;
    const height = 532;
    const radius = 12;

    // Calculate the new path length:
    // Straight sides: 2 * (width - 2*radius) + 2 * (height - 2*radius)
    // Corners: 2 * PI * radius
    const straightLength = 2 * (width - 2 * radius) + 2 * (height - 2 * radius);
    const cornerLength = 2 * Math.PI * radius;
    const pathLength = straightLength + cornerLength;

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
                // 1. UPDATED: The viewBox now matches the card's exact dimensions.
                viewBox={`0 0 ${width} ${height}`}
            >
                <path
                    // 2. UPDATED: The path is redrawn for the new 382x532 coordinate system with a 12px radius.
                    d={`M1,${radius} V${height - radius} A${radius - 1} ${radius - 1} 0 0 0 ${radius},${height - 1} H${width - radius} A${radius - 1} ${radius - 1} 0 0 0 ${width - 1},${height - radius} V${radius} A${radius - 1} ${radius - 1} 0 0 0 ${width - radius},1 H${radius} A${radius - 1} ${radius - 1} 0 0 0 1,${radius}`}
                    className={cn(
                        "stroke-primary [animation:draw-border_2s_linear_forwards]"
                    )}
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{
                        // 3. UPDATED: The path length is recalculated for the new dimensions.
                        strokeDasharray: pathLength,
                        strokeDashoffset: pathLength,
                        filter: isClearMode ? 'drop-shadow(0 0 3px hsl(var(--primary)))' : 'none',
                        vectorEffect: "non-scaling-stroke",
                    }}
                />
            </svg>
        </div>
    );
}
