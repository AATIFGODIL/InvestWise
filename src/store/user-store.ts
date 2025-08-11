
import { create } from 'zustand';

interface UserState {
  username: string;
  setUsername: (username: string) => void;
  reset: () => void;
}

const initialState = {
  username: 'Investor',
}

const useUserStore = create<UserState>((set) => ({
  ...initialState,
  setUsername: (username) => set({ username }),
  reset: () => set(initialState),
}));

export default useUserStore;
