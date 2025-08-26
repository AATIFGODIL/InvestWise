
import { create } from 'zustand';

interface MarketState {
  isMarketOpen: boolean | null;
  isLoading: boolean;
  error: string | null;
  fetchMarketStatus: () => void;
}

const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY as string;

export const useMarketStore = create<MarketState>((set) => ({
  isMarketOpen: null,
  isLoading: false,
  error: null,

  fetchMarketStatus: async () => {
    set({ isLoading: true, error: null });

    if (!API_KEY) {
        console.error("Finnhub API key not configured. Market status is unavailable.");
        set({ 
            isMarketOpen: false, 
            isLoading: false, 
            error: "Market status is currently unavailable." 
        });
        return;
    }

    try {
        const res = await fetch(`https://finnhub.io/api/v1/stock/market-status?exchange=US&token=${API_KEY}`);
        if (!res.ok) {
            throw new Error(`Finnhub API error: ${res.statusText}`);
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
