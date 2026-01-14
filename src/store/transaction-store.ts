// InvestWise - A modern stock trading and investment education platform for young investors

import { create } from 'zustand';

export interface Transaction {
    symbol: string;
    action: 'buy' | 'sell';
    quantity: number;
    price: number;
    timestamp: string; // ISO 8601 format
}

interface TransactionState {
    transactions: Transaction[];
    loadTransactions: (transactions: Transaction[]) => void;
    addTransaction: (transaction: Transaction) => void;
    resetTransactions: () => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
    transactions: [],

    loadTransactions: (transactions) => {
        const sorted = transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        set({ transactions: sorted });
    },

    addTransaction: (transaction) => {
        const updatedTransactions = [transaction, ...get().transactions];
        set({ transactions: updatedTransactions });
    },
    
    resetTransactions: () => set({ transactions: [] }),
}));

export type { Transaction as TransactionType };
