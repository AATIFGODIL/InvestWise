
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
    size: 'icon' | 'expanded';
}

interface FavoritesState {
    favorites: Favorite[];
    expandedFavorite: Favorite | null;
    loadFavorites: (favorites: (Omit<Favorite, 'size'> & { size?: 'icon' | 'expanded' })[]) => void;
    addFavorite: (favorite: Omit<Favorite, 'id' | 'size'>) => void;
    removeFavoriteByName: (name: string) => void;
    setFavorites: (favorites: Favorite[]) => void;
    resetFavorites: () => void;
}

const updateFavoritesInFirestore = (favorites: Favorite[]) => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(getFirestore(), "users", user.uid);
    // Now we persist the entire favorite object, including the size.
    updateDoc(userDocRef, { favorites: favorites }).catch(error => {
        console.error("Failed to update favorites in Firestore:", error);
    });
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
    favorites: [],
    expandedFavorite: null,

    loadFavorites: (favorites) => {
         // When loading, ensure every favorite has a 'size' property, defaulting to 'icon'.
         const initialFavorites = (favorites || []).map(fav => ({ ...fav, size: fav.size || 'icon' } as Favorite));
        set({ favorites: initialFavorites, expandedFavorite: initialFavorites.find(f => f.size === 'expanded') || null });
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
        set(produce((draft: FavoritesState) => {
            const expandedId = newFavorites.find(f => f.size === 'expanded')?.id;
            
            // Create a new array with updated sizes based on the new order
            const updatedFavorites = newFavorites.map(f => ({
                ...f,
                // If an item is expanded, all others must be icons.
                size: (expandedId && f.id !== expandedId) ? 'icon' as const : f.size,
            }));

            draft.favorites = updatedFavorites;
            draft.expandedFavorite = updatedFavorites.find(f => f.size === 'expanded') || null;
        }));
        updateFavoritesInFirestore(get().favorites);
    },

    resetFavorites: () => set({ favorites: [], expandedFavorite: null }),
}));
