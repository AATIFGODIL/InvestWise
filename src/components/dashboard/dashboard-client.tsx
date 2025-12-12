'use client';

import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { recommendedBundles, specializedBundles } from "@/data/bundles";
import CongratulationsBanner from "@/components/dashboard/congratulations-banner";
import TopNews from "./top-news";
import Chatbot from "@/components/chatbot/chatbot";
import AiPrediction from "@/components/ai/ai-prediction";
import AutoInvest from "@/components/dashboard/auto-invest";
import { useMarketStore } from "@/store/market-store";
import { Clock } from "lucide-react";
import Watchlist from "@/components/dashboard/watchlist";
import EducationalContent from "./educational-content";
import { educationalContent } from "@/data/education";
import CommunityLeaderboard from "@/components/dashboard/community-leaderboard";
import HoldingsSummary from "@/components/dashboard/holdings-summary";
import OnboardingTutorial from "@/components/dashboard/onboarding-tutorial";
import { Skeleton } from "../ui/skeleton";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { Newspaper } from "lucide-react";

// These components are loaded dynamically to improve initial page load performance.
// They will only be loaded when they are needed, reducing the client-side JavaScript bundle size.
const PortfolioValue = dynamic(() => import("@/components/portfolio/portfolio-value"), {
    ssr: false,
    loading: () => <Skeleton className="h-[550px] w-full" />,
});
const GoalProgress = dynamic(() => import("@/components/dashboard/goal-progress"), {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full min-h-[200px]" />,
});
const InvestmentBundles = dynamic(() => import("@/components/dashboard/investment-bundles"), {
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full" />,
});

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: "easeOut",
        },
    },
};

export default function DashboardClient() {
    const [userProfile, setUserProfile] = useState<string | null>(null);
    const { isMarketOpen, fetchMarketStatus } = useMarketStore();
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const profile = localStorage.getItem('userProfile');
            setUserProfile(profile);

            const hasCompletedTutorial = localStorage.getItem('hasCompletedOnboardingTutorial');
            if (!hasCompletedTutorial) {
                setShowTutorial(true);
            }
        }
        fetchMarketStatus();
    }, [fetchMarketStatus]);

    const handleTutorialComplete = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('hasCompletedOnboardingTutorial', 'true');
        }
        setShowTutorial(false);
    }

    // This function determines which set of investment bundles to show the user
    // based on their self-identified experience level from the onboarding quiz.
    const getBundlesForProfile = (profile: string | null) => {
        switch (profile) {
            case "Student":
            case "Beginner":
                return {
                    title: "Recommended Bundles",
                    description: "Start with these popular, diversified bundles.",
                    bundles: recommendedBundles,
                };
            case "Amateur":
            case "New Investor":
            case "Experienced Investor":
                return {
                    title: "Explore Specialized Bundles",
                    description: "Discover themed collections for more focused strategies.",
                    bundles: specializedBundles,
                };
            default:
                return {
                    title: "Investment Bundles",
                    description: "Collections of assets to help you diversify your portfolio.",
                    bundles: [...recommendedBundles, ...specializedBundles],
                };
        }
    }

    const bundleProps = useMemo(() => getBundlesForProfile(userProfile), [userProfile]);

    // The congratulations banner is shown only to users who are still in the early stages of their investment journey.
    const showCongrats = userProfile === "Student" || userProfile === "Beginner" || userProfile === "Amateur";

    return (
        <main>
            {showTutorial && <OnboardingTutorial onComplete={handleTutorialComplete} />}
            <motion.div
                className="p-4 space-y-6 pb-40"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants} className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Explore</h1>
                    <div className="flex items-center gap-2 text-sm text-primary">
                        <Clock className="h-4 w-4" />
                        <span>Market is {isMarketOpen ? 'open' : 'closed'}.</span>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <CongratulationsBanner show={showCongrats} userProfile={userProfile || ""} />
                </motion.div>
                <motion.div variants={itemVariants} id="portfolio-card-tutorial">
                    <PortfolioValue showTitle={true} />
                </motion.div>
                <div id="holdings-watchlist-tutorial">
                    <motion.div variants={itemVariants}>
                        <Watchlist />
                    </motion.div>
                    <motion.div variants={itemVariants} className="mt-6" id="holdings-summary-tutorial">
                        <HoldingsSummary />
                    </motion.div>
                </div>
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div id="auto-invest-tutorial">
                        <AutoInvest />
                    </div>
                    <div id="ai-prediction-tutorial">
                        <AiPrediction />
                    </div>
                </motion.div>
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GoalProgress />
                    <div id="community-leaderboard-tutorial">
                        <CommunityLeaderboard />
                    </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Newspaper className="h-5 w-5 text-primary" />
                                Market News
                            </CardTitle>
                        </CardHeader>
                        <div className="px-2 sm:px-6 pb-6">
                            <div className="col-span-12 lg:col-span-4 h-[400px] lg:h-auto">
                                <TopNews />
                            </div>
                        </div>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">Educational Content</h2>
                        <EducationalContent content={educationalContent} className="grid-cols-1 md:grid-cols-1" />
                    </div>
                    <div id="bundles-tutorial">
                        <InvestmentBundles {...bundleProps} />
                    </div>
                </motion.div>
                <Chatbot />
            </motion.div>
        </main>
    );
}
