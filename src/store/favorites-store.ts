
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
    loadFavorites: (favorites: Favorite[]) => void;
    addFavorite: (favorite: Omit<Favorite, 'id' | 'size'>) => void;
    removeFavorite: (value: string) => void;
    setFavorites: (favorites: Favorite[]) => void;
    toggleFavoriteSize: (id: string) => void;
    resetFavorites: () => void;
}

const updateFavoritesInFirestore = (favorites: Favorite[]) => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(getFirestore(), "users", user.uid);
    updateDoc(userDocRef, { favorites: favorites }).catch(error => {
        console.error("Failed to update favorites in Firestore:", error);
    });
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
    favorites: [],

    loadFavorites: (favorites) => {
         const initialFavorites = (favorites || []).map(fav => ({ ...fav, size: fav.size || 'icon' }));
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

    removeFavorite: (value: string) => {
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

    toggleFavoriteSize: (id: string) => {
        set(
            produce((state: FavoritesState) => {
                const favorite = state.favorites.find(f => f.id === id);
                if (favorite) {
                    favorite.size = favorite.size === 'icon' ? 'pill' : 'icon';
                }
            })
        );
        updateFavoritesInFirestore(get().favorites);
    },

    resetFavorites: () => set({ favorites: [] }),
}));

    