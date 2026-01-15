// InvestWise - A modern stock trading and investment education platform for young investors
'use client';

import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { recommendedBundles, specializedBundles } from "@/data/bundles";
import CongratulationsBanner from "@/components/dashboard/congratulations-banner";

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
import { ProModeToggle } from "@/components/shared/pro-mode-toggle";
import { fetchTopFinancialNewsAction } from "@/app/actions";
import { NewsArticle } from "@/lib/gnews";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

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
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [newsLoading, setNewsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const profile = localStorage.getItem('userProfile');
            setUserProfile(profile);
        }
        fetchMarketStatus();

        // Fetch news for the headlines section
        async function getNews() {
            try {
                const data = await fetchTopFinancialNewsAction(5);
                setNews(data);
            } catch (e) {
                console.error("Failed to fetch news:", e);
            } finally {
                setNewsLoading(false);
            }
        }
        getNews();
    }, [fetchMarketStatus]);

    // Check tutorial state when user is available (user-specific key)
    useEffect(() => {
        if (typeof window !== 'undefined' && user?.uid) {
            const tutorialKey = `hasCompletedOnboardingTutorial_v2_${user.uid}`;
            const hasCompletedTutorial = localStorage.getItem(tutorialKey);
            if (!hasCompletedTutorial) {
                setShowTutorial(true);
            }
        }
    }, [user?.uid]);

    const handleTutorialComplete = () => {
        if (typeof window !== 'undefined' && user?.uid) {
            const tutorialKey = `hasCompletedOnboardingTutorial_v2_${user.uid}`;
            localStorage.setItem(tutorialKey, 'true');
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
                    description: "",
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
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2 text-sm text-primary">
                            <Clock className="h-4 w-4" />
                            <span>Market is {isMarketOpen ? 'open' : 'closed'}.</span>
                        </div>
                        <ProModeToggle className="scale-90 origin-right" showLabel={true} />
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
                <motion.div variants={itemVariants} className="space-y-4" id="headlines-tutorial">
                    <h3 className="text-2xl font-bold">Latest Headlines</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {newsLoading ? (
                            <Skeleton className="h-32 w-full col-span-5" />
                        ) : news.length > 0 ? (
                            news.slice(0, 5).map((article, i) => (
                                <a
                                    key={i}
                                    href={article.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={cn(
                                        "group relative block overflow-hidden rounded-lg transition-colors border aspect-[4/3]",
                                        "bg-card border-border hover:bg-accent"
                                    )}
                                >
                                    {article.image && (
                                        <img
                                            src={article.image}
                                            alt="news"
                                            className="absolute inset-0 h-full w-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                                        />
                                    )}
                                    <div className="absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-black/90 to-transparent">
                                        <h4 className="text-sm font-medium text-white line-clamp-2 leading-tight">
                                            {article.title}
                                        </h4>
                                        <span className="text-[10px] text-zinc-400 mt-1">
                                            {article.source.name}
                                        </span>
                                    </div>
                                </a>
                            ))
                        ) : (
                            <div className="text-sm text-muted-foreground text-center py-4 col-span-5">
                                No news available at the moment.
                            </div>
                        )}
                    </div>
                </motion.div>
                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                    <div id="educational-content-tutorial">
                        <EducationalContent content={educationalContent} />
                    </div>
                    <div id="bundles-tutorial">
                        <InvestmentBundles {...bundleProps} />
                    </div>
                </motion.div>


            </motion.div>
        </main >
    );
}
