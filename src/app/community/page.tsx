
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import Leaderboard from "@/components/community/leaderboard";
import Quests from "@/components/community/quests";
import AskMentor from "@/components/community/ask-mentor";
import PrivacySettings from "@/components/community/privacy-settings";
import EducationalVideo from "@/components/shared/educational-video";

const videos = [
    {
        title: "The Power of Community Investing",
        description: "Learn how sharing insights (not secrets!) can make everyone a smarter investor.",
        image: "https://placehold.co/600x400.png",
        hint: "people talking"
    },
    {
        title: "Learning from the Pros: What to Ask Mentors",
        description: "Get the most out of mentorship by asking the right questions. Here’s a guide.",
        image: "https://placehold.co/600x400.png",
        hint: "presentation teaching"
    }
]

export default function CommunityPage() {
  return (
    <div className="w-full bg-background font-body">
      <Header />
      <main className="p-4 space-y-6 pb-40">
        <h1 className="text-2xl font-bold">Community</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Leaderboard />
                <Quests />
            </div>
            <div className="space-y-6">
                <AskMentor />
                <PrivacySettings />
            </div>
        </div>
        <div className="space-y-4 pt-4">
            <h2 className="text-xl font-bold">Learn About Community</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videos.map((video) => (
                    <EducationalVideo key={video.title} {...video} />
                ))}
            </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
