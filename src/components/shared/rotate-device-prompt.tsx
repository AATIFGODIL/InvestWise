
"use client";

import { useState, useEffect } from "react";
import { Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/theme-store";

export default function RotateDevicePrompt() {
    const { isClearMode, theme } = useThemeStore();
    const isLightClear = isClearMode && theme === 'light';

    // State to track if the component has mounted on the client
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);
    
    return null;

    /*
    return (
        <div 
            id="rotate-prompt"
            className={cn(
                "fixed inset-0 z-[100] flex-col items-center justify-center text-center p-8",
                // Apply background styles conditionally based on client-side state
                isClient && isClearMode
                    ? isLightClear
                        ? "bg-card/80 text-foreground"
                        : "bg-black/80 text-white"
                    : "bg-background text-foreground"
            )}
            style={{
                // Only apply backdrop-filter on the client to prevent mismatch
                backdropFilter: isClient && isClearMode ? "blur(16px)" : "none",
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
    */
}
