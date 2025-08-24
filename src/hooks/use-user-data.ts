
"use client";

import { useState, useEffect } from 'react';
import { type User } from 'firebase/auth';
import { doc, getDoc, type Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

// Import all necessary store hooks
import { useUserStore } from "@/store/user-store";
import { usePortfolioStore } from "@/store/portfolio-store";
import { useGoalStore } from "@/store/goal-store";
import { useAutoInvestStore } from "@/store/auto-invest-store";
import { useThemeStore } from "@/store/theme-store";
import { usePrivacyStore } from "@/store/privacy-store";
import { useTransactionStore } from '@/store/transaction-store';
import { useWatchlistStore } from '@/store/watchlist-store';

/**
 * A hook to fetch and hydrate all user-related data from Firestore
 * into various Zustand stores.
 * @param user The Firebase auth user object.
 * @returns An object containing the loading state.
 */
export default function useUserData(user: User | null) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchAndHydrate = async () => {
      setLoading(true);
      try {
        await usePortfolioStore.getState().fetchMarketHolidays();
        
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const createdAt = (userData.createdAt as Timestamp)?.toDate() || new Date();
          const transactions = userData.transactions || [];

          // Hydrate all stores safely using getState() inside the async function
          useThemeStore.getState().setTheme(userData.theme || "light");
          useUserStore.getState().setUsername(userData.username || "Investor");
          useUserStore.getState().setPhotoURL(userData.photoURL || "");
          usePortfolioStore.getState().loadInitialData(userData.portfolio?.holdings || [], userData.portfolio?.summary || null, createdAt);
          useGoalStore.getState().loadGoals(userData.goals || []);
          useAutoInvestStore.getState().loadAutoInvestments(userData.autoInvestments || []);
          useTransactionStore.getState().loadTransactions(transactions);
          useWatchlistStore.getState().loadWatchlist(userData.watchlist || []);
          usePrivacyStore.getState().loadPrivacySettings({
              leaderboardVisibility: userData.leaderboardVisibility || "public",
              showQuests: userData.showQuests === undefined ? true : userData.showQuests,
          });

          useAutoInvestStore.getState().checkForDueTrades();
        } else {
            console.log("User document not found for hydration, likely a new user.");
        }
      } catch (error) {
        console.error("Failed to fetch and hydrate user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndHydrate();
  }, [user]); 

  return { loading };
}
