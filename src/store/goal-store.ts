// InvestWise - A modern stock trading and investment education platform for young investors

import { create } from 'zustand';
import { doc, updateDoc, getFirestore } from "firebase/firestore";
import { auth } from '@/lib/firebase/config';
import { type Goal } from "@/data/goals";

export type { Goal };

interface GoalState {
  goals: Goal[];
  loadGoals: (goals: Goal[]) => void;
  addGoal: (newGoal: Omit<Goal, 'id' | 'icon' | 'progress' | 'current'>) => void;
  updateGoal: (goalId: string, updates: Partial<Pick<Goal, 'name' | 'target'>>) => void;
  removeGoal: (goalId: string) => void;
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

  loadGoals: (goals) => set({ goals: goals || [] }), // Handle undefined goals from Firestore

  addGoal: (newGoalData) => {
    const iconName = newGoalData.name.toLowerCase().includes('trip') || newGoalData.name.toLowerCase().includes('vacation') ? 'plane' : 'default';
    const newGoal: Goal = {
        ...newGoalData,
        id: newGoalData.name.toLowerCase().replace(/\s/g, '-') + '-' + Date.now(),
        current: 0,
        progress: 0,
        icon: iconName,
    };
    const updatedGoals = [...get().goals, newGoal];
    set({ goals: updatedGoals });
    updateGoalsInFirestore(updatedGoals);
  },
  
  updateGoal: (goalId, updates) => {
    const updatedGoals = get().goals.map(goal => {
      if (goal.id === goalId) {
        const updatedGoal = { ...goal, ...updates };
        // Recalculate icon if name changes
        if (updates.name) {
            updatedGoal.icon = updates.name.toLowerCase().includes('trip') || updates.name.toLowerCase().includes('vacation') ? 'plane' : 'default';
        }
        return updatedGoal;
      }
      return goal;
    });
    set({ goals: updatedGoals });
    updateGoalsInFirestore(updatedGoals);
  },

  removeGoal: (goalId) => {
    const updatedGoals = get().goals.filter(goal => goal.id !== goalId);
    set({ goals: updatedGoals });
    updateGoalsInFirestore(updatedGoals);
  },

  resetGoals: () => set({ goals: [] }),
}));
