
import { create } from 'zustand';

interface MarketState {
  isMarketOpen: boolean | null;
  isLoading: boolean;
  error: string | null;
  fetchMarketStatus: () => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  isMarketOpen: null,
  isLoading: false,
  error: null,

  fetchMarketStatus: async () => {
    set({ isLoading: true, error: null });

    try {
        // Corrected: Call the new, secure, server-side API route
        const res = await fetch('/api/market-status');
        
        if (!res.ok) {
            // Handle errors from our own API route
            const errorData = await res.json();
            throw new Error(errorData.error || `API error: ${res.statusText}`);
        }
        
        const data = await res.json();
        
        // The API returns a boolean `isOpen` property.
        set({ isMarketOpen: data.isOpen, isLoading: false });

    } catch (error: any) {
        console.error("Failed to fetch market status:", error);
        set({ 
            isMarketOpen: false, // Default to closed on error
            isLoading: false, 
            error: "Could not fetch market status." 
        });
    }
  },
}));

export interface MarketHoliday {
    atDate: string; // "YYYY-MM-DD"
    eventName: string;
}
