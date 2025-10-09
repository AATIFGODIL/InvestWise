
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { RgbaColor, RgbaColorPicker } from "react-colorful";
import { useAuth } from "@/hooks/use-auth";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

function rgbaToHslString(rgba: RgbaColor): string {
    let { r, g, b } = rgba;
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    const hue = Math.round(h * 360);
    const saturation = Math.round(s * 100);
    const lightness = Math.round(l * 100);

    return `${hue} ${saturation}% ${lightness}%`;
}

// --- HEX / RGBA Conversion ---
const toHex = (c: number) => c.toString(16).padStart(2, '0').toUpperCase();

const rgbaToHex = (rgba: RgbaColor): string => {
    return `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`;
};

const hexToRgba = (hex: string): RgbaColor | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
          a: 1,
        }
      : null;
};

export default function ColorPicker() {
    // Default color is now the light purple: #A78BFA
    const [color, setColor] = useState<RgbaColor>({ r: 167, g: 139, b: 250, a: 1 });
    const [hexValue, setHexValue] = useState(rgbaToHex(color));
    const { updateUserTheme } = useAuth();
    const debouncedColor = useDebounce(color, 200);

    useEffect(() => {
        const root = document.documentElement;
        const primaryColor = getComputedStyle(root).getPropertyValue('--primary').trim();
        // This logic is complex, so we'll stick to the default for initialization
        // to avoid color flashes on load.
    }, []);

    const handleColorChange = useCallback((newColor: RgbaColor) => {
        setColor(newColor);
        setHexValue(rgbaToHex(newColor));
    }, []);

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHex = e.target.value;
        setHexValue(newHex);
        const newRgba = hexToRgba(newHex);
        if (newRgba) {
            setColor(newRgba);
        }
    };
    
    useEffect(() => {
        const hslString = rgbaToHslString(debouncedColor);
        document.documentElement.style.setProperty('--primary', hslString);
        updateUserTheme({}); // This will save the currently applied theme and clear mode with the new primary color
    }, [debouncedColor, updateUserTheme]);

    return (
        <div className="flex flex-col items-center gap-4">
            <RgbaColorPicker color={color} onChange={handleColorChange} className="!w-full" />
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="hex-color">Primary Color (HEX)</Label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">#</span>
                    <Input
                        id="hex-color"
                        value={hexValue.replace('#', '')}
                        onChange={handleHexChange}
                        className={cn("pl-7 font-mono", !hexToRgba(hexValue) && "border-destructive")}
                    />
                </div>
            </div>
        </div>
    )
}
