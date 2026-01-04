
import { create } from 'zustand';
import { doc, updateDoc, getFirestore } from "firebase/firestore";
import { auth } from '@/lib/firebase/config';
import { usePortfolioStore } from './portfolio-store';
import { useNotificationStore } from './notification-store';

const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY as string;

export interface AutoInvestment {
    id: string;
    symbol: string;
    amount: number;
    frequency: "Daily" | "Weekly" | "Bi-weekly" | "Monthly";
    nextDate: string; // ISO String
}

interface AutoInvestState {
    autoInvestments: AutoInvestment[];
    loadAutoInvestments: (investments: AutoInvestment[]) => void;
    addAutoInvestment: (investment: Omit<AutoInvestment, 'id' | 'nextDate'>) => void;
    updateAutoInvestment: (id: string, updatedInvestment: AutoInvestment) => void;
    removeAutoInvestment: (id: string) => void;
    checkForDueTrades: () => void;
    advanceNextDate: (id: string) => void;
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

const getNextDate = (frequency: AutoInvestment['frequency']): Date => {
    const date = new Date();
    switch (frequency) {
        case 'Daily':
            date.setDate(date.getDate() + 1);
            break;
        case 'Weekly':
            date.setDate(date.getDate() + 7);
            break;
        case 'Bi-weekly':
            date.setDate(date.getDate() + 14);
            break;
        case 'Monthly':
            date.setMonth(date.getMonth() + 1);
            break;
    }
    return date;
}

export const useAutoInvestStore = create<AutoInvestState>((set, get) => ({
    autoInvestments: [],

    loadAutoInvestments: (investments) => set({ autoInvestments: investments || [] }),

    addAutoInvestment: async (investment) => {
        const { executeTrade } = usePortfolioStore.getState();

        // 1. Fetch current price for the initial trade
        if (!API_KEY) {
            console.error("Finnhub API key not configured.");
            return;
        }
        const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${investment.symbol}&token=${API_KEY}`);
        const data = await res.json();

        if (!data || typeof data.c === 'undefined' || data.c === 0) {
            console.error(`Could not fetch a valid price for ${investment.symbol}. Auto-invest not created.`);
            // In a real app, you'd show a toast to the user here.
            return;
        }
        const currentPrice = data.c;
        const quantity = parseFloat((investment.amount / currentPrice).toFixed(6));

        // 2. Execute the initial trade immediately
        executeTrade({
            symbol: investment.symbol,
            qty: quantity,
            price: currentPrice,
            description: "Auto-Invest Initial Trade"
        });

        // 3. Create the auto-investment plan for the future
        const newInvestment: AutoInvestment = {
            ...investment,
            id: `${investment.symbol}-${Date.now()}`,
            nextDate: getNextDate(investment.frequency).toISOString(),
        };
        const updatedInvestments = [...get().autoInvestments, newInvestment];
        set({ autoInvestments: updatedInvestments });
        updateAutoInvestInFirestore(updatedInvestments);
    },

    updateAutoInvestment: (id, updatedInvestment) => {
        const updatedInvestments = get().autoInvestments.map(inv =>
            inv.id === id ? updatedInvestment : inv
        );
        set({ autoInvestments: updatedInvestments });
        updateAutoInvestInFirestore(updatedInvestments);
    },

    removeAutoInvestment: (id) => {
        const updatedInvestments = get().autoInvestments.filter(inv => inv.id !== id);
        set({ autoInvestments: updatedInvestments });
        updateAutoInvestInFirestore(updatedInvestments);
    },

    checkForDueTrades: () => {
        const today = new Date();
        const dueInvestments = get().autoInvestments.filter(inv => new Date(inv.nextDate) <= today);

        if (dueInvestments.length === 0) return;

        const { addNotification, notifications } = useNotificationStore.getState();

        for (const investment of dueInvestments) {
            const notificationId = `autotrade-${investment.id}`;

            // Check if an unread notification for this trade already exists
            const alreadyNotified = notifications.some(n => n.id === notificationId && !n.read);

            if (alreadyNotified) continue;

            addNotification({
                id: notificationId,
                title: 'Auto-Invest Due',
                description: `Your scheduled investment for ${investment.symbol} is ready. Click to review and execute.`,
                href: '/explore',
                type: 'default',
                read: false,
                createdAt: new Date().toISOString()
            });
        }
    },

    advanceNextDate: (id: string) => {
        const investment = get().autoInvestments.find(inv => inv.id === id);
        if (!investment) return;

        const updatedInvestment = {
            ...investment,
            nextDate: getNextDate(investment.frequency).toISOString()
        };
        get().updateAutoInvestment(id, updatedInvestment);
    },


    resetAutoInvest: () => set({ autoInvestments: [] }),
}));
