
import { create } from 'zustand';
import useGoalStore from './goal-store';
import usePortfolioStore from './portfolio-store';
import useAutoInvestStore from './auto-invest-store';
import useVideoProgressStore from './video-progress-store';
import { doc, getDoc, updateDoc, getFirestore, Timestamp } from "firebase/firestore";
import { auth } from '@/lib/firebase/config';

interface Quest {
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
    // We don't need a separate loader, as progress is calculated live.
}

const initialQuestData: QuestData = {
    beginner: [
        { title: "Complete your profile", progress: 100 }, // Static for now
        { title: "Make your first goal", progress: 0 },
        { title: "Make your first investment", progress: 0 },
    ],
    intermediate: [
        { title: "Diversify your portfolio with 3+ assets", progress: 0 },
        { title: "Set up a recurring investment", progress: 0 },
        { title: "Watch 5 educational videos", progress: 0 },
    ],
    pro: [
        { title: "Reach a portfolio value of $10,000", progress: 0 },
        { title: "Hold an investment for over 1 year", progress: 0 },
        { title: "Successfully complete 50 trades", progress: 0 }, // This would require a trade count in Firestore
    ],
};

const useQuestStore = create<QuestState>((set, get) => ({
    questData: initialQuestData,

    updateQuestProgress: async () => {
        const { goals } = useGoalStore.getState();
        const { holdings, portfolioSummary } = usePortfolioStore.getState();
        const { autoInvestments } = useAutoInvestStore.getState();
        const { watchedVideos } = useVideoProgressStore.getState();

        const newQuestData = { ...initialQuestData };

        // Beginner Quests
        newQuestData.beginner[0].progress = 100; // Profile completion is static for now
        newQuestData.beginner[1].progress = goals.length > 0 ? 100 : 0;
        newQuestData.beginner[2].progress = holdings.length > 0 ? 100 : 0;

        // Intermediate Quests
        const diversificationProgress = Math.min((holdings.length / 3) * 100, 100);
        newQuestData.intermediate[0].progress = diversificationProgress;
        newQuestData.intermediate[1].progress = autoInvestments.length > 0 ? 100 : 0;
        const videoProgress = Math.min((watchedVideos.size / 5) * 100, 100);
        newQuestData.intermediate[2].progress = videoProgress;
        
        // Pro Quests
        const portfolioValueProgress = Math.min((portfolioSummary.totalValue / 10000) * 100, 100);
        newQuestData.pro[0].progress = portfolioValueProgress;
        
        // "Hold for 1 year" and "50 trades" logic requires more data than is currently available.
        // For "Hold for 1 year", we would need purchase dates for each holding.
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
        // For "50 trades" we would need to store a trade counter.
        // For now, these will remain at 0 unless logic is added.


        set({ questData: newQuestData });
    },
}));

export default useQuestStore;
