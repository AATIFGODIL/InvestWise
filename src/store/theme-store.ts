
import { create } from 'zustand';

export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  isClearMode: boolean;
  primaryColor: string; // Add primary color to the store
  setTheme: (theme: Theme) => void;
  setClearMode: (isClear: boolean) => void;
  setPrimaryColor: (color: string) => void; // Add setter for primary color
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
    return '#775DEF'; // Default color
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
  }
}));
