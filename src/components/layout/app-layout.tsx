
"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Loading from "@/app/loading";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import useUserStore from "@/store/user-store";
import usePortfolioStore from "@/store/portfolio-store";
import useNotificationStore from "@/store/notification-store";
import useGoalStore from "@/store/goal-store";
import useAutoInvestStore from "@/store/auto-invest-store";
import useThemeStore from "@/store/theme-store";
import usePrivacyStore from "@/store/privacy-store";
import type { Timestamp } from "firebase/firestore";

interface AppLayoutProps {
  children: React.ReactNode;
}

const fetchAndHydrateUserData = async (uid: string) => {
  const userDocRef = doc(db, "users", uid);
  const userDoc = await getDoc(userDocRef);
  if (!userDoc.exists()) {
    console.error("User document not found for hydration!");
    return false;
  }
  const userData = userDoc.data();

  const { setUsername } = useUserStore.getState();
  const { loadInitialData } = usePortfolioStore.getState();
  const { setNotifications } = useNotificationStore.getState();
  const { loadGoals } = useGoalStore.getState();
  const { loadAutoInvestments } = useAutoInvestStore.getState();
  const { setTheme } = useThemeStore.getState();
  const { loadPrivacySettings } = usePrivacyStore.getState();

  const createdAt = (userData.createdAt as Timestamp)?.toDate() || new Date();
  const theme = userData.theme || "light";

  setTheme(theme);
  setUsername(userData.username || "Investor");
  loadInitialData(userData.portfolio?.holdings || [], userData.portfolio?.summary || null, createdAt);
  setNotifications(userData.notifications || []);
  loadGoals(userData.goals || []);
  loadAutoInvestments(userData.autoInvestments || []);
  loadPrivacySettings({
    leaderboardVisibility: userData.leaderboardVisibility || "public",
    showQuests: userData.showQuests === undefined ? true : userData.showQuests,
  });
  return true;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, hydrating } = useAuth();

  useEffect(() => {
    if (user && !useUserStore.getState().username) { // Check if hydration is needed
      fetchAndHydrateUserData(user.uid);
    }
  }, [user]);

  if (hydrating) {
    return <Loading />;
  }

  return <>{children}</>;
}
