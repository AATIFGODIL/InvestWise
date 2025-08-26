
"use client";

import CreateGoal from "@/components/goals/create-goal";
import GoalList from "@/components/goals/goal-list";
import Chatbot from "@/components/chatbot/chatbot";
import { useGoalStore } from "@/store/goal-store";
import YouTubePlayer from "../shared/youtube-player";

const videos = [
    {
        title: "Setting SMART Financial Goals",
        description: "Learn how to set Specific, Measurable, Achievable, Relevant, and Time-bound goals for your financial future.",
        youtubeUrl: "https://www.youtube.com/watch?v=UwTxtkGplUs",
    },
    {
        title: "The Psychology of Trading",
        description: "Understand the emotional and psychological aspects of trading to maintain discipline and make better decisions.",
        youtubeUrl: "https://www.youtube.com/watch?v=sauPy2JHzI0",
    }
]

export default function GoalsClient() {
  const { goals, addGoal } = useGoalStore();

  return (
    <main>
      <div className="p-4 space-y-6 pb-24">
        <h1 className="text-2xl font-bold">Goals</h1>
        <CreateGoal onAddGoal={addGoal} />
        <GoalList goals={goals} />

        <div className="space-y-4 pt-4">
            <h2 className="text-xl font-bold">Learn About Goals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videos.map((video) => (
                    <YouTubePlayer key={video.title} videoTitle={video.title} description={video.description} youtubeUrl={video.youtubeUrl} />
                ))}
            </div>
        </div>
        <Chatbot />
      </div>
    </main>
  );
}
