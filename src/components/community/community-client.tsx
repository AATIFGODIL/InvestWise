"use client";

import Leaderboard from "@/components/community/leaderboard";
import MarketNews from "./market-news";
import Quests from "@/components/community/quests";
import AskMentor from "@/components/community/ask-mentor";
import PrivacySettings from "@/components/community/privacy-settings";
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CommunityTrends from "@/components/dashboard/community-trends";
import Chatbot from "@/components/chatbot/chatbot";
import { usePrivacyStore } from "@/store/privacy-store";
import { useThemeStore } from "@/store/theme-store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { Newspaper } from "lucide-react";
import dynamic from 'next/dynamic';
import { Skeleton } from "../ui/skeleton";

const YouTubePlayer = dynamic(() => import('../shared/youtube-player'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full aspect-video" />,
});


const videos = [
  {
    title: "Following the Experts: Bear Bull Traders",
    description: "Learn from Bear Bull Traders, one of the leading voices in financial education. Note: This is a link to their channel.",
    youtubeUrl: "https://www.youtube.com/channel/UCfO2yCpx6_XU-xovhpJuaYw",
    isChannel: true,
    imageUrl: "/bull.jpg"
  },
  {
    title: "Trading Insights with Adam Khoo",
    description: "Explore trading strategies and market analysis from Adam Khoo, a professional investor and trader. Note: This is a link to his channel.",
    youtubeUrl: "https://www.youtube.com/@AdamKhoo",
    isChannel: true,
    imageUrl: "/adam-khoo.jpg"
  }
]

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

export default function CommunityClient() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'feed';
  const { showQuests } = usePrivacyStore();
  const { isClearMode, theme } = useThemeStore();
  const isLightClear = isClearMode && theme === 'light';

  return (
    <main>
      <motion.div
        className="p-4 space-y-6 pb-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 variants={itemVariants} className="text-2xl font-bold">Community</motion.h1>
        <motion.div variants={itemVariants}>
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className={cn(
              "grid w-full grid-cols-2",
              isClearMode
                ? isLightClear
                  ? "bg-card/60 ring-1 ring-white/10"
                  : "bg-white/10 ring-1 ring-white/60"
                : ""
            )}>
              <TabsTrigger value="feed" className={cn(
                isClearMode
                  ? "data-[state=active]:bg-primary/80 data-[state=active]:text-primary-foreground"
                  : ""
              )}>Feed</TabsTrigger>
              <TabsTrigger value="trends" className={cn(
                isClearMode
                  ? "data-[state=active]:bg-primary/80 data-[state=active]:text-primary-foreground"
                  : ""
              )}>Trends</TabsTrigger>
            </TabsList>
            <TabsContent value="feed" className="mt-6 space-y-6">
              <Leaderboard />
              <div className="lg:col-span-1 h-[600px]">
                <MarketNews />
              </div>
              {showQuests && <Quests />}
            </TabsContent>
            <TabsContent value="trends" className="mt-6">
              <CommunityTrends showViewAllButton={false} />
            </TabsContent>
          </Tabs>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4 pt-4">
          <h2 className="text-xl font-bold">Learn from the Experts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video) => (
              <YouTubePlayer key={video.title} videoTitle={video.title} {...video} />
            ))}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4 px-2 sm:px-6 pb-6">
              <MarketNews />
            </div>
          </Card>
        </motion.div>
        <Chatbot />
      </motion.div>
    </main>
  );
}
