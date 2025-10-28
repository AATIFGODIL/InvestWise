
'use client';

import { useEffect } from 'react';
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
import { useFavoritesStore } from '@/store/favorites-store';

function hexToRgba(hex: string): { r: number, g: number, b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : { r: 0, g: 0, b: 0 };
}

function getLuminance(hex: string): number {
    const { r, g, b } = hexToRgba(hex);
    const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function setForegroundForContrast(hex: string) {
    if (typeof window === 'undefined') return;
    const luminance = getLuminance(hex);
    const newForeground = luminance > 0.6 ? '222.2 84% 4.9%' : '210 40% 98%';
    document.documentElement.style.setProperty('--primary-foreground', newForeground);
}


function hexToHslString(hex: string): string {
    const { r, g, b } = hexToRgba(hex);
    const r_norm = r / 255;
    const g_norm = g / 255;
    const b_norm = b / 255;

    const max = Math.max(r_norm, g_norm, b_norm);
    const min = Math.min(r_norm, g_norm, b_norm);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r_norm: h = (g_norm - b_norm) / d + (g_norm < b_norm ? 6 : 0); break;
            case g_norm: h = (b_norm - r_norm) / d + 2; break;
            case b_norm: h = (r_norm - g_norm) / d + 4; break;
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
 * the application's state (Zustand stores) upon user login.
 *
 * @param user The Firebase auth user object.
 */
export default function useUserData(user: User | null) {

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchAndHydrate = async () => {
      try {
        await usePortfolioStore.getState().fetchMarketHolidays();
        
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const primaryColor = userData.primaryColor || '#775DEF';
          const hslString = hexToHslString(primaryColor);
          document.documentElement.style.setProperty('--primary', hslString);
          setForegroundForContrast(primaryColor);

          // Set loading state in stores
          usePortfolioStore.getState().setLoading(true);

          // Essential data for immediate render
          useThemeStore.getState().setTheme(userData.theme || "light");
          useThemeStore.getState().setClearMode(userData.isClearMode || false);
          useThemeStore.getState().setPrimaryColor(primaryColor);
          useUserStore.getState().setUsername(userData.username || "Investor");
          useUserStore.getState().setPhotoURL(userData.photoURL || "");

          // Load all data into stores
          const createdAt = (userData.createdAt as Timestamp)?.toDate() || new Date();
          usePortfolioStore.getState().loadInitialData(userData.portfolio?.holdings || [], userData.portfolio?.summary || null, createdAt);
          useGoalStore.getState().loadGoals(userData.goals || []);
          useAutoInvestStore.getState().loadAutoInvestments(userData.autoInvestments || []);
          useTransactionStore.getState().loadTransactions(userData.transactions || []);
          useWatchlistStore.getState().loadWatchlist(userData.watchlist || []);
          useFavoritesStore.getState().loadFavorites(userData.favorites || []);
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
      }
    };

    fetchAndHydrate();
  }, [user]); 

}
