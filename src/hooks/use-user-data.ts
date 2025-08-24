
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

  // Get the update functions from each store.
  const { fetchMarketHolidays, loadInitialData } = usePortfolioStore();
  const { checkForDueTrades, loadAutoInvestments } = useAutoInvestStore();
  const { setUsername, setPhotoURL } = useUserStore();
  const { setTheme } = useThemeStore();
  const { loadGoals } = useGoalStore();
  const { loadTransactions } = useTransactionStore();
  const { loadWatchlist } = useWatchlistStore();
  const { loadPrivacySettings } = usePrivacyStore();


  useEffect(() => {
    // If there's no user, there's no data to load.
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchAndHydrate = async () => {
      setLoading(true);
      try {
        // Fetch market holidays once and for all. This will be stored in the portfolio store.
        await fetchMarketHolidays();
        
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          const createdAt = (userData.createdAt as Timestamp)?.toDate() || new Date();
          
          // Timestamps are stored as ISO strings, so no conversion is needed.
          const transactions = userData.transactions || [];

          // Hydrate all stores with the fetched data
          setTheme(userData.theme || "light");
          setUsername(userData.username || "Investor");
          setPhotoURL(userData.photoURL || "");
          loadInitialData(userData.portfolio?.holdings || [], userData.portfolio?.summary || null, createdAt);
          loadGoals(userData.goals || []);
          loadAutoInvestments(userData.autoInvestments || []);
          loadTransactions(transactions);
          loadWatchlist(userData.watchlist || []);
          loadPrivacySettings({
              leaderboardVisibility: userData.leaderboardVisibility || "public",
              showQuests: userData.showQuests === undefined ? true : userData.showQuests,
          });

          // After hydrating, check for due auto-trades
          checkForDueTrades();

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
  }, [
    user, 
    fetchMarketHolidays, 
    loadInitialData, 
    checkForDueTrades, 
    loadAutoInvestments, 
    setUsername, 
    setPhotoURL, 
    setTheme, 
    loadGoals, 
    loadTransactions, 
    loadWatchlist, 
    loadPrivacySettings
  ]); // This effect runs whenever the user or store actions change.

  return { loading };
}
