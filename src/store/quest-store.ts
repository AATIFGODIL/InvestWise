
import { create } from 'zustand';
import { useGoalStore } from './goal-store';
import { usePortfolioStore } from './portfolio-store';
import { useAutoInvestStore } from './auto-invest-store';
import { useTransactionStore } from './transaction-store';
import useVideoProgressStore from './video-progress-store';
import { doc, getDoc, updateDoc, getFirestore, Timestamp } from "firebase/firestore";
import { auth } from '@/lib/firebase/config';

export interface Quest {
    title: string;
    progress: number;
}

interface QuestData {
    beginner: Quest[];
    intermediate: Quest[];
    pro: Quest[];
}

interface QuestState {
    questData: QuestData;
    updateQuestProgress: () => void;
}

const initialQuestData: QuestData = {
    beginner: [
        { title: "Complete your profile", progress: 100 },
        { title: "Make your first goal", progress: 0 },
        { title: "Make your first trade", progress: 0 },
    ],
    intermediate: [
        { title: "Diversify your portfolio with 3+ assets", progress: 0 },
        { title: "Set up a recurring investment", progress: 0 },
        { title: "Watch 4 educational videos", progress: 0 },
    ],
    pro: [
        { title: "Reach a portfolio value of $10,000", progress: 0 },
        { title: "Hold an investment for over 1 year", progress: 0 },
        { title: "Successfully complete 50 trades", progress: 0 }, 
    ],
};

export const useQuestStore = create<QuestState>((set, get) => ({
    questData: initialQuestData,

    updateQuestProgress: async () => {
        const { goals } = useGoalStore.getState();
        const { holdings, portfolioSummary } = usePortfolioStore.getState();
        const { autoInvestments } = useAutoInvestStore.getState();
        const { watchedVideos } = useVideoProgressStore.getState();
        const { transactions } = useTransactionStore.getState();


        const newQuestData = { ...get().questData };

        // Beginner Quests
        newQuestData.beginner[0].progress = 100; // Profile is always complete
        newQuestData.beginner[1].progress = goals.length > 0 ? 100 : 0;
        newQuestData.beginner[2].progress = transactions.length > 0 ? 100 : 0;

        // Intermediate Quests
        const diversificationProgress = Math.min((holdings.length / 3) * 100, 100);
        newQuestData.intermediate[0].progress = diversificationProgress;
        newQuestData.intermediate[1].progress = autoInvestments.length > 0 ? 100 : 0;
        const videoProgress = Math.min((watchedVideos.size / 4) * 100, 100);
        newQuestData.intermediate[2].progress = videoProgress;
        
        // Pro Quests
        const portfolioValueProgress = Math.min((portfolioSummary.totalValue / 10000) * 100, 100);
        newQuestData.pro[0].progress = portfolioValueProgress;
        const tradesProgress = Math.min((transactions.length / 50) * 100, 100);
        newQuestData.pro[2].progress = tradesProgress;

        
        const user = auth.currentUser;
        if (user) {
            const userDocRef = doc(getFirestore(), "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const createdAt = (userData.createdAt as Timestamp)?.toDate();
                if (createdAt) {
                    const oneYearAgo = new Date();
                    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                    if (createdAt <= oneYearAgo && holdings.length > 0) {
                         newQuestData.pro[1].progress = 100;
                    }
                }
            }
        }

        set({ questData: newQuestData });
    },
}));
