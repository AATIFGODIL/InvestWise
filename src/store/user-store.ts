
import { create } from 'zustand';

interface UserState {
  username: string;
  profilePic: string;
  setUsername: (username: string) => void;
  setProfilePic: (url: string) => void;
  reset: () => void;
}

const initialState = {
  username: 'Investor',
  profilePic: '',
}

const useUserStore = create<UserState>((set) => ({
  ...initialState,
  setUsername: (username) => set({ username }),
  setProfilePic: (url) => set({ profilePic: url }),
  reset: () => set(initialState),
}));

export default useUserStore;
