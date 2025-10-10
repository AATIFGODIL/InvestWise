
import { create } from 'zustand';
import { produce } from 'immer';
import { doc, updateDoc, getFirestore } from 'firebase/firestore';
import { auth } from '@/lib/firebase/config';

export interface Favorite {
    id: string;
    type: 'stock' | 'action';
    name: string;
    value: string; // symbol for stock, name for action
    iconName: string;
    logoUrl?: string;
    size: 'icon' | 'pill';
}

interface FavoritesState {
    favorites: Favorite[];
    loadFavorites: (favorites: (Omit<Favorite, 'size'> & { size?: 'icon' | 'pill' })[]) => void;
    addFavorite: (favorite: Omit<Favorite, 'id' | 'size'>) => void;
    removeFavoriteByName: (name: string) => void;
    setFavorites: (favorites: Favorite[]) => void;
    resetFavorites: () => void;
}

const updateFavoritesInFirestore = (favorites: Favorite[]) => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(getFirestore(), "users", user.uid);
    // Persist the entire favorite object, including the size.
    updateDoc(userDocRef, { favorites: favorites }).catch(error => {
        console.error("Failed to update favorites in Firestore:", error);
    });
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
    favorites: [],

    loadFavorites: (favorites) => {
         // When loading, ensure every favorite has a 'size' property, defaulting to 'icon'.
         const initialFavorites = (favorites || []).map(fav => ({ ...fav, size: fav.size || 'icon' } as Favorite));
        set({ favorites: initialFavorites });
    },

    addFavorite: (favorite) => {
        const newFavorite: Favorite = {
            ...favorite,
            id: favorite.value + Date.now(),
            size: 'icon',
        };

        set(
          produce((state: FavoritesState) => {
            if (!state.favorites.some(f => f.value === newFavorite.value)) {
                 state.favorites.unshift(newFavorite);
            }
          })
        );
        updateFavoritesInFirestore(get().favorites);
    },

    removeFavoriteByName: (value: string) => {
         set(
          produce((state: FavoritesState) => {
            state.favorites = state.favorites.filter((fav) => fav.value !== value);
          })
        );
        updateFavoritesInFirestore(get().favorites);
    },
    
    setFavorites: (newFavorites) => {
        set({ favorites: newFavorites });
        updateFavoritesInFirestore(newFavorites);
    },

    resetFavorites: () => set({ favorites: [] }),
}));
