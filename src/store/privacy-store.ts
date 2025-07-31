
import { create } from 'zustand';
import { useAuth } from '@/hooks/use-auth'; // We'll get this from a custom hook later

export type LeaderboardVisibility = "public" | "anonymous" | "hidden";

export interface PrivacyState {
  leaderboardVisibility: LeaderboardVisibility;
  showQuests: boolean;
  setLeaderboardVisibility: (visibility: LeaderboardVisibility) => void;
  setShowQuests: (show: boolean) => void;
  loadPrivacySettings: (settings: { leaderboardVisibility: LeaderboardVisibility, showQuests: boolean }) => void;
  resetPrivacySettings: () => void;
}

// This function will be called from within the store actions
const updateFirestore = (settings: { leaderboardVisibility?: LeaderboardVisibility, showQuests?: boolean }) => {
    const { updatePrivacySettings } = useAuth.getState(); // Directly access auth hook state
    if(updatePrivacySettings) {
        updatePrivacySettings(settings);
    }
};

const usePrivacyStore = create<PrivacyState>((set, get) => ({
  leaderboardVisibility: 'public',
  showQuests: true,
  
  setLeaderboardVisibility: (visibility) => {
    set({ leaderboardVisibility: visibility });
    updateFirestore({ leaderboardVisibility: visibility });
  },

  setShowQuests: (show) => {
    set({ showQuests: show });
    updateFirestore({ showQuests: show });
  },

  loadPrivacySettings: (settings) => {
    set({
      leaderboardVisibility: settings.leaderboardVisibility,
      showQuests: settings.showQuests,
    });
  },
  
  resetPrivacySettings: () => {
      set({
          leaderboardVisibility: 'public',
          showQuests: true,
      })
  }
}));

// A bit of a hack to get around Zustand's limitations with external hooks.
// We're connecting the useAuth hook to our privacy store here.
useAuth.subscribe(
  (auth) => {
    usePrivacyStore.setState({
      updateFirestore: auth.updatePrivacySettings,
    } as any);
  }
);


export default usePrivacyStore;
