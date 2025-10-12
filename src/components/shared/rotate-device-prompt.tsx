
"use client";

import { Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/theme-store";

export default function RotateDevicePrompt() {
    const { isClearMode, theme } = useThemeStore();
    const isLightClear = isClearMode && theme === 'light';

    return (
        <div 
            id="rotate-prompt"
            className={cn(
                "fixed inset-0 z-[100] flex-col items-center justify-center text-center p-8",
                 isClearMode
                    ? isLightClear
                        ? "bg-card/80 text-foreground"
                        : "bg-black/80 text-white"
                    : "bg-background text-foreground"
            )}
            style={{
                backdropFilter: isClearMode ? "blur(16px)" : "none",
            }}
        >
            <div className="relative shimmer-bg w-full h-full flex flex-col items-center justify-center rounded-2xl border border-white/10">
                <div className="rotate-phone-icon">
                    <Smartphone className="h-24 w-24 mb-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Please Rotate Your Device</h2>
                <p className="max-w-sm">
                    For the best experience, this application is designed to be used in landscape mode.
                </p>
            </div>
        </div>
    );
}
