
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
    position: 'left' | 'right';
    size: 'icon' | 'expanded';
}

interface FavoritesState {
    favorites: Favorite[];
    leftExpanded: Favorite | null;
    rightExpanded: Favorite | null;
    loadFavorites: (favorites: Favorite[]) => void;
    addFavorite: (favorite: Omit<Favorite, 'id' | 'position' | 'size'>) => void;
    removeFavoriteByName: (name: string) => void;
    setFavorites: (favorites: Favorite[]) => void;
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
    leftExpanded: null,
    rightExpanded: null,

    loadFavorites: (favorites) => {
        set(
          produce((state) => {
            state.favorites = favorites || [];
          })
        );
    },

    addFavorite: (favorite) => {
        const newFavorite: Favorite = {
            ...favorite,
            id: favorite.value + Date.now(),
            position: 'left',
            size: 'icon',
        };

        set(
          produce((state: FavoritesState) => {
            // Prevent duplicates
            if (!state.favorites.some(f => f.value === newFavorite.value)) {
                 state.favorites.push(newFavorite);
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
        set(produce(draft => {
            draft.favorites = newFavorites;
            draft.leftExpanded = newFavorites.find(f => f.position === 'left' && f.size === 'expanded') || null;
            draft.rightExpanded = newFavorites.find(f => f.position === 'right' && f.size === 'expanded') || null;
            
            const { leftExpanded, rightExpanded } = draft;

            draft.favorites.forEach(f => {
                if (f.position === 'left' && f.id !== leftExpanded?.id) f.size = 'icon';
                if (f.position === 'right' && f.id !== rightExpanded?.id) f.size = 'icon';
            });
        }));
        updateFavoritesInFirestore(get().favorites);
    },

    resetFavorites: () => set({ favorites: [], leftExpanded: null, rightExpanded: null }),
}));
