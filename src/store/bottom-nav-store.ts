
import { create } from 'zustand';

interface BottomNavState {
  activeIndex: number | null;
  samePageIndex: number | null;
  setActiveIndex: (index: number) => void;
  setSamePageIndex: (index: number) => void;
  clearActiveIndex: () => void;
}

export const useBottomNavStore = create<BottomNavState>((set) => ({
  activeIndex: null,
  samePageIndex: null,
  setActiveIndex: (index) => set({ activeIndex: index, samePageIndex: null }),
  setSamePageIndex: (index) => set({ samePageIndex: index, activeIndex: null }),
  clearActiveIndex: () => set({ activeIndex: null, samePageIndex: null }),
}));
