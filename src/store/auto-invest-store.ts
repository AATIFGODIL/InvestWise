
import { create } from 'zustand';
import { doc, updateDoc, getFirestore } from "firebase/firestore";
import { auth } from '@/lib/firebase/config';

export interface AutoInvestment {
    name: string;
    amount: number;
    frequency: string;
    nextDate?: string;
}

interface AutoInvestState {
  autoInvestments: AutoInvestment[];
  loadAutoInvestments: (investments: AutoInvestment[]) => void;
  addAutoInvestment: (investment: Omit<AutoInvestment, 'nextDate'>) => void;
  updateAutoInvestment: (name: string, updatedInvestment: AutoInvestment) => void;
  removeAutoInvestment: (name: string) => void;
  resetAutoInvest: () => void;
}

const updateAutoInvestInFirestore = (investments: AutoInvestment[]) => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(getFirestore(), "users", user.uid);
    updateDoc(userDocRef, { autoInvestments: investments }).catch(error => {
        console.error("Failed to update auto-investments in Firestore:", error);
    });
};

const useAutoInvestStore = create<AutoInvestState>((set, get) => ({
    autoInvestments: [],

    loadAutoInvestments: (investments) => set({ autoInvestments: investments || [] }),
    
    addAutoInvestment: (investment) => {
        const newInvestmentWithDate: AutoInvestment = {
            ...investment,
            nextDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        };
        const updatedInvestments = [...get().autoInvestments, newInvestmentWithDate];
        set({ autoInvestments: updatedInvestments });
        updateAutoInvestInFirestore(updatedInvestments);
    },

    updateAutoInvestment: (name, updatedInvestment) => {
        const updatedInvestments = get().autoInvestments.map(inv => 
            inv.name === name ? updatedInvestment : inv
        );
        set({ autoInvestments: updatedInvestments });
        updateAutoInvestInFirestore(updatedInvestments);
    },

    removeAutoInvestment: (name) => {
        const updatedInvestments = get().autoInvestments.filter(inv => inv.name !== name);
        set({ autoInvestments: updatedInvestments });
        updateAutoInvestInFirestore(updatedInvestments);
    },

    resetAutoInvest: () => set({ autoInvestments: [] }),
}));

export default useAutoInvestStore;
