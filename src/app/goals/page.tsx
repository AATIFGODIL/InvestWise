
"use client";

import { useState } from "react";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import CreateGoal from "@/components/goals/create-goal";
import GoalList from "@/components/goals/goal-list";
import EducationalVideo from "@/components/shared/educational-video";
import { initialGoals, goalIcons } from "@/data/goals.tsx";
import Chatbot from "@/components/chatbot/chatbot";

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

export interface Goal {
    id: string;
    name: string;
    icon: React.ReactNode;
    current: number;
    target: number;
    progress: number;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);

  const addGoal = (newGoal: Omit<Goal, 'id' | 'icon' | 'progress' | 'current'>) => {
    const goal: Goal = {
        ...newGoal,
        id: newGoal.name.toLowerCase().replace(/\s/g, '-'),
        current: 0,
        progress: 0,
        icon: goalIcons.default,
    };
    setGoals(prevGoals => [...prevGoals, goal]);
  };

  return (
    <div className="w-full bg-background font-body">
      <Header />
      <main className="p-4 space-y-6 pb-40">
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
      </main>
      <Chatbot />
      <BottomNav />
    </div>
  );
}
