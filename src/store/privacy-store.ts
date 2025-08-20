
import { create } from 'zustand';

export type LeaderboardVisibility = "public" | "anonymous" | "hidden";

export interface PrivacyState {
  leaderboardVisibility: LeaderboardVisibility;
  showQuests: boolean;
  setLeaderboardVisibility: (visibility: LeaderboardVisibility) => void;
  setShowQuests: (show: boolean) => void;
  loadPrivacySettings: (settings: { leaderboardVisibility: LeaderboardVisibility, showQuests: boolean }) => void;
  resetPrivacySettings: () => void;
}

export const usePrivacyStore = create<PrivacyState>((set) => ({
  leaderboardVisibility: 'public',
  showQuests: true,
  
  setLeaderboardVisibility: (visibility) => {
    set({ leaderboardVisibility: visibility });
  },

  setShowQuests: (show) => {
    set({ showQuests: show });
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
