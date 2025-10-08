
import { create } from 'zustand';

export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  isClearMode: boolean;
  setTheme: (theme: Theme) => void;
  setClearMode: (isClear: boolean) => void;
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

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  isClearMode: getInitialClearMode(),
  
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
  }
}));
