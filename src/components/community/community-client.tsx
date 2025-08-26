
"use client";

import Leaderboard from "@/components/community/leaderboard";
import Quests from "@/components/community/quests";
import AskMentor from "@/components/community/ask-mentor";
import PrivacySettings from "@/components/community/privacy-settings";
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CommunityTrends from "@/components/dashboard/community-trends";
import Chatbot from "@/components/chatbot/chatbot";
import { usePrivacyStore } from "@/store/privacy-store";
import YouTubePlayer from "../shared/youtube-player";

const videos = [
    {
        title: "Following the Experts: CA Rachana Ranade",
        description: "Learn from CA Rachana Ranade, one of the leading voices in financial education. Note: This is a link to a channel.",
        youtubeUrl: "https://www.youtube.com/channel/UCfO2yCpx6_XU-xovhpJuaYw",
        isChannel: true,
        imageUrl: "https://yt3.googleusercontent.com/ytc/AIdro_k-21_0-2DB-s-3a3EDi-22_p9-9135V5LJ6w=s176-c-k-c0x00ffffff-no-rj"
    },
    {
        title: "Trading Insights with Adam Khoo",
        description: "Explore trading strategies and market analysis from Adam Khoo, a professional investor and trader. Note: This is a link to a channel.",
        youtubeUrl: "https://www.youtube.com/@AdamKhoo",
        isChannel: true,
        imageUrl: "https://yt3.googleusercontent.com/ytc/AIdro_n05CF6SDB-r53e-2-2Pb-X4-3_d-4_G9G8GQ=s176-c-k-c0x00ffffff-no-rj"
    }
]

export default function CommunityClient() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'feed';
  const { showQuests } = usePrivacyStore();

  return (
    <main>
      <div className="p-4 space-y-6 pb-24">
      <h1 className="text-2xl font-bold">Community</h1>
      <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="feed">Feed</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          <TabsContent value="feed" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                      <Leaderboard />
                      <PrivacySettings />
                  </div>
                  <div className="space-y-6">
                      <AskMentor />
                      {showQuests && <Quests />}
                  </div>
              </div>
          </TabsContent>
              <TabsContent value="trends" className="mt-6">
              <CommunityTrends showViewAllButton={false} />
          </TabsContent>
      </Tabs>
      
      <div className="space-y-4 pt-4">
          <h2 className="text-xl font-bold">Learn About Community</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((video) => (
                  <YouTubePlayer key={video.title} videoTitle={video.title} {...video} />
              ))}
          </div>
      </div>
      <Chatbot />
      </div>
    </main>
  );
}
