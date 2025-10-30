"use client";

import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/theme-store";

interface AnimatedBorderProps {
  className?: string;
}

export default function AnimatedBorder({ className }: AnimatedBorderProps) {
    const { isClearMode } = useThemeStore();

    const width = 382;
    const height = 532;
    const radius = 12;

    const halfPathLength = (width / 2 - radius) + (height - 2 * radius) + (width / 2 - radius) + (Math.PI * radius);

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
                viewBox={`0 0 ${width} ${height}`}
            >
                {/* Left Path */}
                <path
                    d={`M${width/2},1 H${radius} A${radius-1} ${radius-1} 0 0 0 1,${radius+1} V${height-radius-1} A${radius-1} ${radius-1} 0 0 0 ${radius},${height-1} H${width/2}`}
                    className={cn(
                        "stroke-primary [animation:draw-border_4s_linear_forwards]"
                    )}
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{
                        strokeDasharray: halfPathLength,
                        strokeDashoffset: halfPathLength,
                        filter: isClearMode ? 'drop-shadow(0 0 3px hsl(var(--primary)))' : 'none',
                        vectorEffect: "non-scaling-stroke",
                    }}
                />
                 {/* Right Path */}
                <path
                    d={`M${width/2},1 H${width-radius} A${radius-1} ${radius-1} 0 0 1 ${width-1},${radius+1} V${height-radius-1} A${radius-1} ${radius-1} 0 0 1 ${width-radius},${height-1} H${width/2}`}
                    className={cn(
                        "stroke-primary [animation:draw-border_4s_linear_forwards]"
                    )}
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{
                        strokeDasharray: halfPathLength,
                        strokeDashoffset: halfPathLength,
                        filter: isClearMode ? 'drop-shadow(0 0 3px hsl(var(--primary)))' : 'none',
                        vectorEffect: "non-scaling-stroke",
                    }}
                />
            </svg>
        </div>
    );
}
