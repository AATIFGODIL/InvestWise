// InvestWise - A modern stock trading and investment education platform for young investors

import { create } from 'zustand';
import { doc, getDoc } from "firebase/firestore";
import { db } from '@/lib/firebase/config';

interface UserState {
  username: string;
  photoURL: string | null;
  paymentMethodToken: string | null;
  loading: boolean;
  setUsername: (username: string) => void;
  setPhotoURL: (photoURL: string) => void;
  fetchPaymentMethodToken: (userId: string) => Promise<void>;
  reset: () => void;
}

const initialState = {
  username: 'Investor',
  photoURL: null,
  paymentMethodToken: null,
  loading: true,
}

// Export the hook directly
export const useUserStore = create<UserState>((set) => ({
  ...initialState,
  setUsername: (username) => set({ username }),
  setPhotoURL: (photoURL) => set({ photoURL }),
  
  fetchPaymentMethodToken: async (userId: string) => {
    set({ loading: true });
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        set({ paymentMethodToken: userData.paymentMethodToken || null });
      } else {
        set({ paymentMethodToken: null });
      }
    } catch (error) {
      console.error("Failed to fetch payment method token:", error);
      set({ paymentMethodToken: null });
    } finally {
      set({ loading: false });
    }
  },

  reset: () => set(initialState),
}));
