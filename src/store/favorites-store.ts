
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
    removeFavorite: (index: number) => void;
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
        // Keep only the newest favorite, so the array length is max 2
        const updatedFavorites = [favorite, ...currentFavorites].slice(0, 2);
        set({ favorites: updatedFavorites });
        updateFavoritesInFirestore(updatedFavorites);
    },

    removeFavorite: (index) => {
        const updatedFavorites = get().favorites.filter((_, i) => i !== index);
        set({ favorites: updatedFavorites });
        updateFavoritesInFirestore(updatedFavorites);
    },

    resetFavorites: () => set({ favorites: [] }),
}));
