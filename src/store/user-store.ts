
import { create } from 'zustand';
import { doc, getDoc } from "firebase/firestore";
import { db } from '@/lib/firebase/config';

interface UserState {
  username: string;
  paymentMethodToken: string | null;
  loading: boolean;
  setUsername: (username: string) => void;
  fetchPaymentMethodToken: (userId: string) => Promise<void>;
  reset: () => void;
}

const initialState = {
  username: 'Investor',
  paymentMethodToken: null,
  loading: true,
}

const useUserStore = create<UserState>((set) => ({
  ...initialState,
  setUsername: (username) => set({ username }),
  
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

export default useUserStore;
