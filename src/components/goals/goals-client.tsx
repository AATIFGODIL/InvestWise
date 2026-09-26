// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import CreateGoal from "@/components/goals/create-goal";
import GoalList from "@/components/goals/goal-list";

import { useGoalStore } from "@/store/goal-store";
import { motion } from "framer-motion";

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

        <motion.div variants={itemVariants} id="create-goal-tutorial">
          <CreateGoal onAddGoal={addGoal} />
        </motion.div>

        <motion.div variants={itemVariants} id="goal-list-tutorial">
          <GoalList goals={goals} />
        </motion.div>

      </motion.div>
    </main>
  );
}
