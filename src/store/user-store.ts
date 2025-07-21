
import { create } from 'zustand';

interface UserState {
  username: string;
  setUsername: (username: string) => void;
}

const useUserStore = create<UserState>((set) => ({
  username: 'First-Time Investor',
  setUsername: (username) => set({ username }),
}));

export default useUserStore;
