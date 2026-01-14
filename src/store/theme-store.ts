// InvestWise - A modern stock trading and investment education platform for young investors

import { create } from 'zustand';

export type Theme = "light" | "dark";

const defaultPrimaryColor = '#775DEF';

interface ThemeState {
  theme: Theme;
  isClearMode: boolean;
  primaryColor: string;
  setTheme: (theme: Theme) => void;
  setClearMode: (isClear: boolean) => void;
  setPrimaryColor: (color: string) => void;
  resetTheme: () => void;
}

// Helper function to convert hex to HSL string for CSS variables
function hexToHslString(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '251 82% 60%'; // Default HSL if hex is invalid

    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

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

// The store now initializes with a default state, not from localStorage.
// The `use-user-data` hook is responsible for hydrating this store from Firestore.
export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'light',
  isClearMode: false,
  primaryColor: defaultPrimaryColor,
  
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
    set({ theme });
  },

  setClearMode: (isClear) => {
    set({ isClearMode: isClear });
  },

  setPrimaryColor: (color: string) => {
      // Set the color in the store for reactivity
      set({ primaryColor: color });
      
      // Also update the CSS variable directly for immediate visual feedback
      if (typeof window !== 'undefined') {
          document.documentElement.style.setProperty('--primary', hexToHslString(color));
      }
  },

  resetTheme: () => {
    if (typeof window !== 'undefined') {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add('light'); // Default to light theme
        
        // Explicitly set the primary color CSS variable back to default
        root.style.setProperty('--primary', hexToHslString(defaultPrimaryColor));
    }

    set({ 
        theme: 'light', 
        isClearMode: false, 
        primaryColor: defaultPrimaryColor 
    });
  }
}));
