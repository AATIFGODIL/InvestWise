"use client";

import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useProModeStore } from '@/store/pro-mode-store';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProModeToggleProps {
    className?: string;
    showLabel?: boolean;
}

export const ProModeToggle: React.FC<ProModeToggleProps> = ({ className, showLabel = true }) => {
    const { isProMode, setProMode } = useProModeStore();
    const router = useRouter();

    const handleToggle = (checked: boolean) => {
        setProMode(checked);
        if (checked) {
            // Redirect to Research page immediately on enabling Pro Mode
            router.push('/research');
        }
    };

    return (
        <div className={cn("flex items-center space-x-2", className)}>
            <Switch
                id="pro-mode-toggle"
                checked={isProMode}
                onCheckedChange={handleToggle}
                className="data-[state=checked]:bg-purple-600"
            />
            {showLabel && (
                <Label htmlFor="pro-mode-toggle" className="flex items-center gap-1 text-xs font-medium cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                    <Zap className={cn("h-3 w-3", isProMode ? "text-purple-500 fill-purple-500" : "")} />
                    Pro Mode
                </Label>
            )}
        </div>
    );
};
