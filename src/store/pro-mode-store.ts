// InvestWise - A modern stock trading and investment education platform for young investors

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProModeState {
    isProMode: boolean;
    setProMode: (isPro: boolean) => void;
    toggleProMode: () => void;
    // Future configuration for grid layout
    gridConfig: {
        columns: number;
        rows: number;
    };
    setGridConfig: (cols: number, rows: number) => void;
}

export const useProModeStore = create<ProModeState>()(
    persist(
        (set) => ({
            isProMode: false,
            setProMode: (isPro) => set({ isProMode: isPro }),
            toggleProMode: () => set((state) => ({ isProMode: !state.isProMode })),
            gridConfig: { columns: 2, rows: 2 },
            setGridConfig: (columns, rows) => set({ gridConfig: { columns, rows } }),
        }),
        {
            name: 'pro-mode-storage',
        }
    )
);
