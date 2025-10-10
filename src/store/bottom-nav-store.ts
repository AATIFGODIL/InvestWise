
import { create } from 'zustand';

interface BottomNavState {
  activeIndex: number | null;
  setActiveIndex: (index: number) => void;
  clearActiveIndex: () => void;
}

export const useBottomNavStore = create<BottomNavState>((set) => ({
  activeIndex: null,
  setActiveIndex: (index) => set({ activeIndex: index }),
  clearActiveIndex: () => set({ activeIndex: null }),
}));
