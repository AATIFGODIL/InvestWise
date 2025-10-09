
import { create } from 'zustand';
import { useAuth } from '@/hooks/use-auth';
import { doc, updateDoc, getFirestore } from 'firebase/firestore';
import { auth } from '@/lib/firebase/config';

export interface Favorite {
    type: 'stock' | 'action';
    name: string;
    value: string; // symbol for stock, name for action
    iconName: string;
}

interface FavoritesState {
    favorites: Favorite[];
    loadFavorites: (favorites: Favorite[]) => void;
    addFavorite: (favorite: Favorite) => void;
    removeFavoriteByName: (name: string) => void;
    resetFavorites: () => void;
}

const updateFavoritesInFirestore = (favorites: Favorite[]) => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(getFirestore(), "users", user.uid);
    updateDoc(userDocRef, { favorites }).catch(error => {
        console.error("Failed to update favorites in Firestore:", error);
    });
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
    favorites: [],

    loadFavorites: (favorites) => set({ favorites: favorites || [] }),

    addFavorite: (favorite) => {
        const currentFavorites = get().favorites;
        // Prevent duplicates
        if (currentFavorites.some(f => f.value === favorite.value)) return;
        
        // Keep only the newest favorite, so the array length is max 2
        const updatedFavorites = [favorite, ...currentFavorites].slice(0, 2);
        set({ favorites: updatedFavorites });
        updateFavoritesInFirestore(updatedFavorites);
    },

    removeFavoriteByName: (value: string) => {
        const updatedFavorites = get().favorites.filter((fav) => fav.value !== value);
        set({ favorites: updatedFavorites });
        updateFavoritesInFirestore(updatedFavorites);
    },

    resetFavorites: () => set({ favorites: [] }),
}));
