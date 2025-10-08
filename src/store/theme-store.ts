
import { create } from 'zustand';

export type Theme = "light" | "dark" | "clear";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'clear') {
      return storedTheme;
    }
  }
  return 'light'; 
};


export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      const root = document.documentElement;
      root.classList.remove('light', 'dark', 'clear');
      if (theme === 'clear') {
        // For clear theme, we might want a dark background as base
        root.classList.add('dark'); 
      }
      root.classList.add(theme);
    }
    set({ theme });
  },
}));
