// InvestWise - A modern stock trading and investment education platform for young investors
"use client";

import Leaderboard from "@/components/community/leaderboard";
import Quests from "@/components/community/quests";
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CommunityTrends from "@/components/dashboard/community-trends";

import { usePrivacyStore } from "@/store/privacy-store";
import { useThemeStore } from "@/store/theme-store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import dynamic from 'next/dynamic';
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { fetchTopFinancialNewsAction } from "@/app/actions";
import { type NewsArticle } from "@/lib/gnews";

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

  // State
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsExpanded, setNewsExpanded] = useState(false);

  useEffect(() => {
    async function getNews() {
      try {
        const data = await fetchTopFinancialNewsAction(12);
        setNews(data);
      } catch (e) {
        console.error("Failed to fetch news:", e);
      } finally {
        setNewsLoading(false);
      }
    }
    getNews();
  }, []);

  return (
    <main>
      <motion.div
        className="p-4 space-y-6 pb-40"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 variants={itemVariants} className="text-2xl font-bold">Community</motion.h1>
        <motion.div variants={itemVariants}>
          <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center w-full mb-6">
              <TabsList className={cn(
                "grid grid-cols-2 h-12 p-1.5 rounded-full relative w-full max-w-[280px] shadow-lg ring-1 ring-border",
                isClearMode
                  ? isLightClear
                    ? "bg-card/60 ring-1 ring-white/10"
                    : "bg-white/10 ring-1 ring-white/60"
                  : "bg-muted/50"
              )}>
                {['feed', 'trends'].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className={cn(
                      "relative z-10 capitalize rounded-full transition-colors h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                      activeTab === tab ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTabHighlight-community"
                        className="absolute inset-0 bg-primary rounded-full -z-10 shadow-md"
                        transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                      />
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <TabsContent value="feed" className="space-y-6">
              <Leaderboard />

              {/* Side-by-side: Quests (half-width) and Videos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {showQuests && (
                  <div className="flex flex-col">
                    <div className="flex-1 max-h-[450px] overflow-y-auto p-[1px]">
                      <Quests />
                    </div>
                  </div>
                )}
                <div className="flex flex-col space-y-4">
                  <h2 className="text-xl font-bold">Learn from the Experts</h2>
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    {videos.map((video) => (
                      <YouTubePlayer key={video.title} videoTitle={video.title} {...video} />
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="trends" className="mt-6">
              <CommunityTrends showViewAllButton={false} />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* News Section - Research Style */}
        <motion.div variants={itemVariants} className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h3 className={cn("text-lg font-semibold", isClearMode ? "text-primary-foreground" : "text-foreground")}>Latest Headlines</h3>
            <Button variant="ghost" size="sm" onClick={() => setNewsExpanded(!newsExpanded)} className={cn("hover:text-primary", isClearMode ? "text-white/70" : "text-muted-foreground")}>
              {newsExpanded ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
              {newsExpanded ? "Show Less" : "Reveal All"}
            </Button>
          </div>

          {newsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : newsExpanded ? (
            // Expanded: 2 rows of 5 items (10 total)
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {news.slice(0, 5).map((article, i) => (
                  <a key={i} href={article.url} target="_blank" rel="noreferrer" className={cn("group relative block overflow-hidden rounded-lg transition-colors border aspect-[4/3]", isClearMode ? "bg-white/10 border-white/10 hover:bg-white/20" : "bg-card border-border hover:bg-accent")}>
                    {article.image && <img src={article.image} alt="news" className="absolute inset-0 h-full w-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />}
                    <div className="absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-black/90 to-transparent">
                      <h4 className="text-sm font-medium text-white line-clamp-2 leading-tight">{article.title}</h4>
                      <span className="text-[10px] text-zinc-400 mt-1">{article.source.name}</span>
                    </div>
                  </a>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {news.slice(5, 10).map((article, i) => (
                  <a key={i} href={article.url} target="_blank" rel="noreferrer" className={cn("group relative block overflow-hidden rounded-lg transition-colors border aspect-[4/3]", isClearMode ? "bg-white/10 border-white/10 hover:bg-white/20" : "bg-card border-border hover:bg-accent")}>
                    {article.image && <img src={article.image} alt="news" className="absolute inset-0 h-full w-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />}
                    <div className="absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-black/90 to-transparent">
                      <h4 className="text-sm font-medium text-white line-clamp-2 leading-tight">{article.title}</h4>
                      <span className="text-[10px] text-zinc-400 mt-1">{article.source.name}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            // Collapsed: 2 items in compact form
            <div className="space-y-3">
              {news.slice(0, 2).map((article, i) => (
                <a key={i} href={article.url} target="_blank" rel="noreferrer" className={cn("group flex items-center p-4 gap-4 overflow-hidden rounded-lg transition-colors border", isClearMode ? "bg-white/10 border-white/10 hover:bg-white/20" : "bg-card border-border hover:bg-accent")}>
                  {article.image && <img src={article.image} alt="news" className="h-16 w-24 object-cover rounded flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <h4 className={cn("font-medium group-hover:text-primary transition-colors line-clamp-1", isClearMode ? "text-white" : "text-foreground")}>{article.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{article.description}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </motion.div>

      </motion.div>
    </main>
  );
}
 