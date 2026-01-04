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

    // Path 'd' uses an arc radius of 'radius - 1'.
    const arcRadius = radius - 1; 
    // Two 90-deg arcs = one 180-deg arc (PI * r)
    const arcLength = Math.PI * arcRadius; 
    const topBottomLength = (width / 2) - radius;
    // Straight vertical side: (height - radius - 1) - (radius + 1) = height - 2*radius - 2
    const sideLength = height - 2 * radius - 2;

    // The total length of one half-path
    const halfPathLength = topBottomLength + sideLength + topBottomLength + arcLength;

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
                preserveAspectRatio="none"
            >
                {/* Left Path */}
                <path
                    d={`M${width/2},1 H${radius} A${arcRadius} ${arcRadius} 0 0 0 1,${radius+1} V${height-radius-1} A${arcRadius} ${arcRadius} 0 0 0 ${radius},${height-1} H${width/2}`}
                    className="stroke-primary animated-border-path"
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{
                        '--path-length': halfPathLength,
                        strokeDasharray: halfPathLength,
                        filter: isClearMode ? 'drop-shadow(0 0 3px hsl(var(--primary)))' : 'none',
                        vectorEffect: "non-scaling-stroke",
                    } as React.CSSProperties}
                />
                 {/* Right Path */}
                <path
                    d={`M${width/2},1 H${width-radius} A${arcRadius} ${arcRadius} 0 0 1 ${width-1},${radius+1} V${height-radius-1} A${arcRadius} ${arcRadius} 0 0 1 ${width-radius},${height-1} H${width/2}`}
                    className="stroke-primary animated-border-path"
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{
                        '--path-length': halfPathLength,
                        strokeDasharray: halfPathLength,
                        filter: isClearMode ? 'drop-shadow(0 0 3px hsl(var(--primary)))' : 'none',
                        vectorEffect: "non-scaling-stroke",
                    } as React.CSSProperties}
                />
            </svg>
        </div>
    );
}
