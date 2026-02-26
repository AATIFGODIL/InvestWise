// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import { useState, useEffect, useCallback } from 'react';
import { type User } from 'firebase/auth';
import { doc, getDoc, type Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { type UserData } from "@/types/user";

// Import all necessary store hooks
import { useUserStore } from "@/store/user-store";
import { usePortfolioStore } from "@/store/portfolio-store";
import { useNotificationStore } from "@/store/notification-store";
import { useGoalStore } from "@/store/goal-store";
import { useAutoInvestStore } from "@/store/auto-invest-store";
import { useThemeStore } from "@/store/theme-store";
import { usePrivacyStore } from "@/store/privacy-store";
import { useWatchlistStore } from "@/store/watchlist-store";
import { useTransactionStore } from "@/store/transaction-store";
import { useFavoritesStore } from '@/store/favorites-store';

/**
 * A hook to fetch and hydrate all user-related data from Firestore
 * into various Zustand stores.
 * @param user The Firebase auth user object.
 * @returns An object containing the loading state.
 */
export default function useUserData(user: User | null) {
  const [loading, setLoading] = useState(true);

  const fetchAndHydrate = useCallback(async (userToFetch: User) => {
    setLoading(true);
    try {
      const userDocRef = doc(db, "users", userToFetch.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData;

        // Get the update functions from each store
        const { setUsername, setPhotoURL } = useUserStore.getState();
        const { loadInitialData, invalidateChartCache } = usePortfolioStore.getState();
        const { setNotifications } = useNotificationStore.getState();
        const { loadGoals } = useGoalStore.getState();
        const { loadAutoInvestments } = useAutoInvestStore.getState();
        const { setTheme, setClearMode, setPrimaryColor, setSidebarOrientation } = useThemeStore.getState();
        const { loadPrivacySettings } = usePrivacyStore.getState();
        const { loadWatchlist } = useWatchlistStore.getState();
        const { loadTransactions } = useTransactionStore.getState();
        const { loadFavorites } = useFavoritesStore.getState();

        const createdAt = (userData.createdAt as Timestamp)?.toDate() || new Date();

        // Hydrate all stores with the fetched data
        setTheme(userData.theme || "light");
        setClearMode(userData.isClearMode || false);
        setPrimaryColor(userData.primaryColor || '#775DEF');
        setSidebarOrientation(userData.sidebarOrientation || 'left');
        setUsername(userData.username || "Investor");
        setPhotoURL(userData.photoURL || "");

        // IMPORTANT: Load transactions BEFORE portfolio data.
        // The chart reconstruction logic (`reconstructPortfolioHistory`) in the portfolio store
        // reads from the transaction store. Loading transactions first ensures they are
        // available when `fetchChartData` is triggered by the PortfolioValue component.
        loadTransactions(userData.transactions || []);

        // Invalidate chart cache so it refetches with the fresh transaction data
        invalidateChartCache();

        loadInitialData(userData.portfolio?.holdings || [], userData.portfolio?.summary || null, createdAt);
        setNotifications(userData.notifications || []);
        loadGoals(userData.goals || []);
        loadAutoInvestments(userData.autoInvestments || []);
        loadPrivacySettings({
          leaderboardVisibility: userData.leaderboardVisibility || "public",
          showQuests: userData.showQuests === undefined ? true : userData.showQuests,
        });
        loadWatchlist(userData.watchlist || []);
        loadFavorites(userData.favorites || []);

      } else {
        console.error("User document not found for hydration!");
      }
    } catch (error) {
      console.error("Failed to fetch and hydrate user data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // If there's no user, there's no data to load.
    if (!user) {
      setLoading(false);
      return;
    }

    fetchAndHydrate(user);
  }, [user, fetchAndHydrate]);

  return { loading };
}
