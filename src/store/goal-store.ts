
import { create } from 'zustand';
import { doc, updateDoc, getFirestore } from "firebase/firestore";
import { auth } from '@/lib/firebase/config';
import { goalIcons, type Goal } from "@/data/goals";

interface GoalState {
  goals: Goal[];
  loadGoals: (goals: Goal[]) => void;
  addGoal: (newGoal: Omit<Goal, 'id' | 'icon' | 'progress' | 'current'>) => void;
  resetGoals: () => void;
}

const updateGoalsInFirestore = (goals: Goal[]) => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(getFirestore(), "users", user.uid);
    updateDoc(userDocRef, { goals }).catch(error => {
        console.error("Failed to update goals in Firestore:", error);
    });
};

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],

  loadGoals: (goals) => set({ goals }),

  addGoal: (newGoalData) => {
    const newGoal: Goal = {
        ...newGoalData,
        id: newGoalData.name.toLowerCase().replace(/\s/g, '-') + '-' + Date.now(),
        current: 0,
        progress: 0,
        icon: goalIcons.default,
    };
    const updatedGoals = [...get().goals, newGoal];
    set({ goals: updatedGoals });
    updateGoalsInFirestore(updatedGoals);
  },
  
  resetGoals: () => set({ goals: [] }),
}));
