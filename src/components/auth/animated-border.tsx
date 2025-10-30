
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
                "before:absolute before:inset-0 before:bg-primary before:opacity-0 before:[animation:pulse-glow_2s_ease-out_1s_1]",
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
                    d="M1 10C1 4.47715 5.47715 1 11 1H43C48.5228 1 53 5.47715 53 11V43C53 48.5228 48.5228 53 43 53H11C5.47715 53 1 48.5228 1 43V10Z"
                    className={cn(
                        "stroke-primary [stroke-dasharray:680] [stroke-dashoffset:680] [animation:draw-border_1s_linear_forwards]",
                        isClearMode && !isLightClear && "drop-shadow-[0_0_3px_hsl(var(--primary))]"
                    )}
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{ filter: isClearMode ? 'drop-shadow(0 0 3px hsl(var(--primary)))' : 'none' }}
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
        </div>
    );
}

