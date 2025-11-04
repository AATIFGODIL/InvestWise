
"use client";

import { useState, useEffect } from 'react';
import { type User } from 'firebase/auth';
import { doc, getDoc, type Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

// Import all necessary store hooks
import { useUserStore } from "@/store/user-store";
import { usePortfolioStore } from "@/store/portfolio-store";
import { useNotificationStore } from "@/store/notification-store";
import { useGoalStore } from "@/store/goal-store";
import { useAutoInvestStore } from "@/store/auto-invest-store";
import { useThemeStore } from "@/store/theme-store";
import { usePrivacyStore } from "@/store/privacy-store";

/**
 * A hook to fetch and hydrate all user-related data from Firestore
 * into various Zustand stores.
 * @param user The Firebase auth user object.
 * @returns An object containing the loading state.
 */
export default function useUserData(user: User | null) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If there's no user, there's no data to load.
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchAndHydrate = async () => {
      setLoading(true);
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Get the update functions from each store
          const { setUsername, setPhotoURL } = useUserStore.getState();
          const { loadInitialData } = usePortfolioStore.getState();
          const { setNotifications } = useNotificationStore.getState();
          const { loadGoals } = useGoalStore.getState();
          const { loadAutoInvestments } = useAutoInvestStore.getState();
          const { setTheme } = useThemeStore.getState();
          const { loadPrivacySettings } = usePrivacyStore.getState();
          
          const createdAt = ((userData as any).createdAt as Timestamp)?.toDate() || new Date();

          // Hydrate all stores with the fetched data
          setTheme((userData as any).theme || "light");
          setUsername((userData as any).username || "Investor");
          setPhotoURL((userData as any).photoURL || "");
          loadInitialData((userData as any).portfolio?.holdings || [], (userData as any).portfolio?.summary || null, createdAt);
          setNotifications((userData as any).notifications || []);
          loadGoals((userData as any).goals || []);
          loadAutoInvestments((userData as any).autoInvestments || []);
          loadPrivacySettings({
              leaderboardVisibility: (userData as any).leaderboardVisibility || "public",
              showQuests: (userData as any).showQuests === undefined ? true : (userData as any).showQuests,
          });

        } else {
            console.error("User document not found for hydration!");
        }
      } catch (error) {
        console.error("Failed to fetch and hydrate user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndHydrate();
  }, [user]); // This effect runs whenever the user object changes.

  return { loading };
}
