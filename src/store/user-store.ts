
import { create } from 'zustand';

interface UserState {
  username: string;
  profilePic: string;
  setUsername: (username: string) => void;
  setProfilePic: (url: string) => void;
}

const useUserStore = create<UserState>((set) => ({
  username: 'Investor',
  profilePic: 'https://i.pravatar.cc/150',
  setUsername: (username) => set({ username }),
  setProfilePic: (url) => set({ profilePic: url }),
}));

export default useUserStore;
