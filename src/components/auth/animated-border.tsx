
"use client";

import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/theme-store";

interface AnimatedBorderProps {
  className?: string;
}

export default function AnimatedBorder({ className }: AnimatedBorderProps) {
    const { isClearMode, theme } = useThemeStore();
    const isLightClear = isClearMode && theme === 'light';

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
            >
                <path
                    d="M1,11 V43 C1,48.5228 5.47715,53 11,53 H43 C48.5228,53 53,48.5228 53,43 V11 C53,5.47715 48.5228,1 43,1 H11 C5.47715,1 1,5.47715 1,11"
                    className={cn(
                        "stroke-primary [stroke-dasharray:168] [stroke-dashoffset:168] [animation:draw-border_2s_linear_forwards]",
                        isClearMode && !isLightClear && "drop-shadow-[0_0_3px_hsl(var(--primary))]"
                    )}
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{ 
                        filter: isClearMode ? 'drop-shadow(0 0 3px hsl(var(--primary)))' : 'none',
                        vectorEffect: "non-scaling-stroke"
                    }}
                />
            </svg>
        </div>
    );
}
