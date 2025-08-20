
"use client";

import { useState, useEffect } from 'react';
import { type User } from 'firebase/auth';
import { doc, getDoc, type Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

// Import all necessary store hooks
import useUserStore from "@/store/user-store";
import usePortfolioStore from "@/store/portfolio-store";
import useNotificationStore from "@/store/notification-store";
import useGoalStore from "@/store/goal-store";
import useAutoInvestStore from "@/store/auto-invest-store";
import useThemeStore from "@/store/theme-store";
import usePrivacyStore from "@/store/privacy-store";

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
          
          const createdAt = (userData.createdAt as Timestamp)?.toDate() || new Date();

          // Hydrate all stores with the fetched data
          setTheme(userData.theme || "light");
          setUsername(userData.username || "Investor");
          setPhotoURL(userData.photoURL || "");
          loadInitialData(userData.portfolio?.holdings || [], userData.portfolio?.summary || null, createdAt);
          setNotifications(userData.notifications || []);
          loadGoals(userData.goals || []);
          loadAutoInvestments(userData.autoInvestments || []);
          loadPrivacySettings({
              leaderboardVisibility: userData.leaderboardVisibility || "public",
              showQuests: userData.showQuests === undefined ? true : userData.showQuests,
          });

        } else {
            // This can happen during new user creation if this hook runs before the user document is created.
            // It's not a critical error, so we can just log it for debugging if needed, but not as an error.
            console.log("User document not found for hydration, likely a new user.");
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
