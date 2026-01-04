
"use client";

import React, { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { RgbaColor, RgbaColorPicker } from "react-colorful";
import { useAuth } from "@/hooks/use-auth";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/theme-store";

function hslStringToRgba(hslString: string): RgbaColor {
    const [h, s, l] = hslString.split(' ').map(val => parseInt(val.replace('%', ''), 10));
    const saturation = s / 100;
    const lightness = l / 100;

    const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lightness - c / 2;
    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
        r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
        r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
        r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
        r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
        r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
        r = c; g = 0; b = x;
    }

    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255),
        a: 1
    };
}


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

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

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
    const { primaryColor, setPrimaryColor } = useThemeStore();
    const initialRgba = hexToRgba(primaryColor) || { r: 119, g: 93, b: 239, a: 1 };
    
    const [color, setColor] = useState<RgbaColor>(initialRgba);
    const [hexValue, setHexValue] = useState(primaryColor);
    
    const { updateUserTheme } = useAuth();
    const debouncedColor = useDebounce(color, 200);

    // Effect to update the picker's state if the global store changes
    useEffect(() => {
        const newRgba = hexToRgba(primaryColor);
        if (newRgba) {
            setColor(newRgba);
            setHexValue(primaryColor);
        }
    }, [primaryColor]);


    const handleColorChange = (newColor: RgbaColor) => {
        setColor(newColor);
        setHexValue(rgbaToHex(newColor));
    };

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHex = `#${e.target.value.replace('#', '')}`;
        setHexValue(newHex);
        const newRgba = hexToRgba(newHex);
        if (newRgba) {
            setColor(newRgba);
        }
    };
    
    // Effect to persist the debounced color change
    useEffect(() => {
        const hexColor = rgbaToHex(debouncedColor);
        
        // Update the theme store, which will trigger the persistence
        setPrimaryColor(hexColor);
        
        // Also update the CSS variable for immediate visual feedback
        const hslString = rgbaToHslString(debouncedColor);
        document.documentElement.style.setProperty('--primary', hslString);
        
        // Persist to Firestore via the auth hook
        updateUserTheme({ primaryColor: hexColor }); 
    }, [debouncedColor, updateUserTheme, setPrimaryColor]);

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
                 <p className="text-xs text-muted-foreground text-center">Default color is #775DEF</p>
            </div>
        </div>
    )
}
