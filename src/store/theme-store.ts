
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
  resetTheme: () => void; // Add reset method
}

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
  }
  return 'light';
};

const getInitialClearMode = (): boolean => {
  if (typeof window !== 'undefined') {
    const storedClearMode = localStorage.getItem('isClearMode');
    return storedClearMode === 'true';
  }
  return false;
};

const getInitialPrimaryColor = (): string => {
    if (typeof window !== 'undefined') {
        const storedColor = localStorage.getItem('primaryColor');
        if (storedColor) return storedColor;
    }
    return defaultPrimaryColor;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  isClearMode: getInitialClearMode(),
  primaryColor: getInitialPrimaryColor(),
  
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
    set({ theme });
  },

  setClearMode: (isClear) => {
     if (typeof window !== 'undefined') {
      localStorage.setItem('isClearMode', String(isClear));
    }
    set({ isClearMode: isClear });
  },

  setPrimaryColor: (color: string) => {
      if (typeof window !== 'undefined') {
          localStorage.setItem('primaryColor', color);
      }
      set({ primaryColor: color });
  },

  resetTheme: () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('theme');
        localStorage.removeItem('isClearMode');
        localStorage.removeItem('primaryColor');
    }
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add('light'); // Default to light theme

    set({ 
        theme: 'light', 
        isClearMode: false, 
        primaryColor: defaultPrimaryColor 
    });
  }
}));
