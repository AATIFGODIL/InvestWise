
import { type Timestamp } from "firebase/firestore";
import { type Goal } from "@/data/goals";
import { type Holding, type PortfolioSummary } from "@/store/portfolio-store";
import { type Transaction } from "@/store/transaction-store";
import { type Theme } from "@/store/theme-store";

export interface UserData {
  username?: string;
  photoURL?: string;
  theme?: Theme;
  createdAt?: Timestamp;
  portfolio?: {
    holdings: Holding[];
    summary: PortfolioSummary | null;
  };
  notifications?: any[]; // Define more strictly if needed
  goals?: Goal[];
  autoInvestments?: any[]; // Define more strictly if needed
  leaderboardVisibility?: 'public' | 'private' | 'anonymous';
  showQuests?: boolean;
}
