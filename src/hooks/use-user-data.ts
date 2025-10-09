
'use client';

import { useState, useEffect } from 'react';
import { type User } from 'firebase/auth';
import { doc, getDoc, type Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useUserStore } from "@/store/user-store";
import { usePortfolioStore } from "@/store/portfolio-store";
import { useGoalStore } from "@/store/goal-store";
import { useAutoInvestStore } from "@/store/auto-invest-store";
import { useThemeStore } from "@/store/theme-store";
import { usePrivacyStore } from "@/store/privacy-store";
import { useTransactionStore } from '@/store/transaction-store';
import { useWatchlistStore } from '@/store/watchlist-store';

function hexToHslString(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "251 82% 60%";

    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);

    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    const hue = Math.round(h * 360);
    const saturation = Math.round(s * 100);
    const lightness = Math.round(l * 100);
    return `${hue} ${saturation}% ${lightness}%`;
}


/**
 * A custom hook to fetch all user-related data from Firestore and hydrate
 * the application's state (Zustand stores) upon user login. This ensures
 * that the entire app has access to the most up-to-date user information.
 *
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
        // Fetch market holidays first, as they are needed for chart generation.
        await usePortfolioStore.getState().fetchMarketHolidays();
        
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const createdAt = (userData.createdAt as Timestamp)?.toDate() || new Date();
          const transactions = userData.transactions || [];
          const primaryColor = userData.primaryColor || '#775DEF';

          // Apply primary color from Firestore
          const hslString = hexToHslString(primaryColor);
          document.documentElement.style.setProperty('--primary', hslString);
          
          // Hydrate all Zustand stores with the fetched data.
          // Using getState() here is safe because this effect runs once after the stores are initialized.
          useThemeStore.getState().setTheme(userData.theme || "light");
          useThemeStore.getState().setClearMode(userData.isClearMode || false);
          useThemeStore.getState().setPrimaryColor(primaryColor);
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

          // After hydrating, check if any scheduled auto-investments are due.
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
