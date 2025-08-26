
"use client";

import CreateGoal from "@/components/goals/create-goal";
import GoalList from "@/components/goals/goal-list";
import EducationalVideo from "@/components/shared/educational-video";
import Chatbot from "@/components/chatbot/chatbot";
import { useGoalStore } from "@/store/goal-store";

const videos = [
    {
        title: "Why Setting Financial Goals is Crucial",
        description: "Learn how clear goals can accelerate your investment journey and lead to financial success.",
        image: "https://placehold.co/600x400.png",
        hint: "planning writing"
    },
    {
        title: "Short-Term vs. Long-Term Goals",
        description: "Understand the difference and how to approach investing for each type of goal.",
        image: "https://placehold.co/600x400.png",
        hint: "calendar time"
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
                    <EducationalVideo key={video.title} {...video} />
                ))}
            </div>
        </div>
        <Chatbot />
      </div>
    </main>
  );
}
