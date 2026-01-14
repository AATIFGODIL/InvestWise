// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import CreateGoal from "@/components/goals/create-goal";
import GoalList from "@/components/goals/goal-list";

import { useGoalStore } from "@/store/goal-store";
import { motion } from "framer-motion";
import dynamic from 'next/dynamic';
import { Skeleton } from "../ui/skeleton";

const YouTubePlayer = dynamic(() => import('../shared/youtube-player'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full aspect-video" />,
});


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

export default function GoalsClient() {
  const { goals, addGoal } = useGoalStore();

  return (
    <main>
      <motion.div
        className="p-4 space-y-6 pb-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 variants={itemVariants} className="text-2xl font-bold">Goals</motion.h1>

        <motion.div variants={itemVariants}>
          <CreateGoal onAddGoal={addGoal} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <GoalList goals={goals} />
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4 pt-4">
          <h2 className="text-xl font-bold">Learn About Goals</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-start">
            {videos.map((video) => (
              <YouTubePlayer key={video.title} videoTitle={video.title} description={video.description} youtubeUrl={video.youtubeUrl} />
            ))}
          </div>
        </motion.div>


      </motion.div>
    </main>
  );
}
