// InvestWise - A modern stock trading and investment education platform for young investors

import { create } from 'zustand';

interface BottomNavState {
  activeIndex: number | null;
  targetPath: string | null;
  samePageIndex: number | null;
  setActiveIndex: (index: number, path?: string) => void;
  setSamePageIndex: (index: number) => void;
  clearActiveIndex: () => void;
}

export const useBottomNavStore = create<BottomNavState>((set) => ({
  activeIndex: null,
  targetPath: null,
  samePageIndex: null,
  setActiveIndex: (index, path) => set({ activeIndex: index, targetPath: path || null, samePageIndex: null }),
  setSamePageIndex: (index) => set({ samePageIndex: index, activeIndex: null, targetPath: null }),
  clearActiveIndex: () => set({ activeIndex: null, samePageIndex: null, targetPath: null }),
}));
