// InvestWise - A modern stock trading and investment education platform for young investors

import { create } from 'zustand';
import { doc, updateDoc, getFirestore } from 'firebase/firestore';
import { auth } from '@/lib/firebase/config';

export type LeaderboardVisibility = "public" | "anonymous" | "hidden";

export interface PrivacyState {
  leaderboardVisibility: LeaderboardVisibility;
  showQuests: boolean;
  setLeaderboardVisibility: (visibility: LeaderboardVisibility) => void;
  setShowQuests: (show: boolean) => void;
  loadPrivacySettings: (settings: { leaderboardVisibility: LeaderboardVisibility, showQuests: boolean }) => void;
  resetPrivacySettings: () => void;
}

const updatePrivacyInFirestore = (settings: Partial<Pick<PrivacyState, 'leaderboardVisibility' | 'showQuests'>>) => {
    const user = auth.currentUser;
    if (!user) return;
    const userDocRef = doc(getFirestore(), "users", user.uid);
    updateDoc(userDocRef, settings).catch(error => {
        console.error("Failed to update privacy settings in Firestore:", error);
    });
};


export const usePrivacyStore = create<PrivacyState>((set) => ({
  leaderboardVisibility: 'public',
  showQuests: true,
  
  setLeaderboardVisibility: (visibility) => {
    set({ leaderboardVisibility: visibility });
    updatePrivacyInFirestore({ leaderboardVisibility: visibility });
  },

  setShowQuests: (show) => {
    set({ showQuests: show });
    updatePrivacyInFirestore({ showQuests: show });
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
