"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { RgbaColor, RgbaColorPicker } from "react-colorful";
import { useAuth } from "@/hooks/use-auth";
import { Label } from "../ui/label";

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


export default function ColorPicker() {
    const [color, setColor] = useState<RgbaColor>({ r: 84, g: 66, b: 241, a: 1 });
    const { updateUserTheme } = useAuth();
    const debouncedColor = useDebounce(color, 200);

    useEffect(() => {
        const root = document.documentElement;
        const primaryColor = getComputedStyle(root).getPropertyValue('--primary').trim();
        if (primaryColor) {
            const [h, s, l] = primaryColor.split(' ').map(val => parseFloat(val));
            // This is a simplified conversion and might not be perfectly accurate
            // For now, we will stick to the default color on load
        }
    }, []);

    const handleColorChange = useCallback((newColor: RgbaColor) => {
        setColor(newColor);
    }, []);
    
    useEffect(() => {
        const hslString = rgbaToHslString(debouncedColor);
        document.documentElement.style.setProperty('--primary', hslString);
        updateUserTheme({}); // This will save the currently applied theme and clear mode with the new primary color
    }, [debouncedColor, updateUserTheme]);

    return (
        <div className="flex flex-col items-center gap-4">
             <Label>Primary Color</Label>
            <RgbaColorPicker color={color} onChange={handleColorChange} className="!w-full" />
        </div>
    )
}
