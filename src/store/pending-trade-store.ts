// InvestWise - A modern stock trading and investment education platform for young investors

import { create } from 'zustand';

interface PendingTrade {
    id: string; // Corresponds to the AutoInvestment id
    symbol: string;
    quantity: number;
    price: number;
}

interface PendingTradeState {
  pendingTrade: PendingTrade | null;
  setPendingTrade: (trade: PendingTrade) => void;
  clearPendingTrade: () => void;
}

export const usePendingTradeStore = create<PendingTradeState>((set) => ({
    pendingTrade: null,
    setPendingTrade: (trade) => set({ pendingTrade: trade }),
    clearPendingTrade: () => set({ pendingTrade: null }),
}));
