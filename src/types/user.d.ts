// InvestWise - A modern stock trading and investment education platform for young investors

import { type Timestamp } from "firebase/firestore";
import { type Goal } from "@/data/goals";
import { type Holding, type PortfolioSummary } from "@/store/portfolio-store";
import { type Transaction } from "@/store/transaction-store";
import { type Theme } from "@/store/theme-store";
import { type Favorite } from "@/store/favorites-store";

export interface UserData {
  username?: string;
  photoURL?: string;
  theme?: Theme;
  isClearMode?: boolean;
  primaryColor?: string;
  createdAt?: Timestamp;
  portfolio?: {
    holdings: Holding[];
    summary: PortfolioSummary | null;
  };
  notifications?: any[]; // Define more strictly if needed
  goals?: Goal[];
  autoInvestments?: any[]; // Define more strictly if needed
  leaderboardVisibility?: 'public' | 'hidden' | 'anonymous';
  showQuests?: boolean;
  watchlist?: string[];
  transactions?: Transaction[];
  paymentMethodToken?: string;
  favorites?: Favorite[];
}
