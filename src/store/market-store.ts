
import { create } from 'zustand';

interface MarketState {
  isMarketOpen: boolean | null;
  isLoading: boolean;
  error: string | null;
  fetchMarketStatus: () => Promise<void>;
}

const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY as string;

export const useMarketStore = create<MarketState>((set, get) => ({
  isMarketOpen: null,
  isLoading: true,
  error: null,

  fetchMarketStatus: async () => {
    // Prevent fetching if already fetched or no API key
    if (get().isMarketOpen !== null || !API_KEY) {
        set({ isLoading: false });
        if (!API_KEY) {
            console.error("Finnhub API key is not configured.");
            set({ error: "API key not configured." });
        }
        return;
    }
    
    set({ isLoading: true });
    try {
      const res = await fetch(`https://finnhub.io/api/v1/stock/market-status?exchange=US&token=${API_KEY}`);
      if (!res.ok) {
        throw new Error(`Finnhub API error: ${res.statusText}`);
      }
      const data = await res.json();
      set({ isMarketOpen: data.isOpen, isLoading: false, error: null });
    } catch (error: any) {
      console.error("Failed to fetch market status:", error);
      set({ isLoading: false, error: error.message, isMarketOpen: false }); // Default to closed on error
    }
  },
}));
