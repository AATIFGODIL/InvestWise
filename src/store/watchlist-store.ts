
import { create } from 'zustand';
import { doc, updateDoc, getFirestore } from "firebase/firestore";
import { auth } from '@/lib/firebase/config';

interface WatchlistState {
  watchlist: string[]; // Just store symbols
  addSymbol: (symbol: string) => void;
  removeSymbol: (symbol: string) => void;
  loadWatchlist: (symbols: string[]) => void;
  resetWatchlist: () => void;
}

const updateWatchlistInFirestore = (watchlist: string[]) => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(getFirestore(), "users", user.uid);
    updateDoc(userDocRef, { watchlist }).catch(error => {
        console.error("Failed to update watchlist in Firestore:", error);
    });
};

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
    watchlist: [],

    loadWatchlist: (symbols) => set({ watchlist: symbols || [] }),

    addSymbol: (symbol) => {
        const currentWatchlist = get().watchlist;
        if (currentWatchlist.includes(symbol)) return; // Don't add duplicates
        const updatedWatchlist = [...currentWatchlist, symbol];
        set({ watchlist: updatedWatchlist });
        updateWatchlistInFirestore(updatedWatchlist);
    },

    removeSymbol: (symbol) => {
        const updatedWatchlist = get().watchlist.filter(s => s !== symbol);
        set({ watchlist: updatedWatchlist });
        updateWatchlistInFirestore(updatedWatchlist);
    },

    resetWatchlist: () => set({ watchlist: [] }),
}));
