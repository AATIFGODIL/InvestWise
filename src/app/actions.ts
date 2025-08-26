
"use server";

import { investmentChatbot } from "@/ai/flows/investment-chatbot";
import { stockPrediction } from "@/ai/flows/stock-prediction";
import type { StockPredictionOutput } from "@/ai/types/stock-prediction-types";
import { gateway } from "@/lib/braintree";
import { db } from "@/lib/firebase/admin";
import { type BraintreeGateway, type Customer, type Transaction as BraintreeTransaction } from "braintree";
import { type Transaction } from "@/store/transaction-store";


type ActionResult = {
  success: boolean;
  response: string;
  error?: string;
};

type StockPredictionResult = {
    success: boolean;
    prediction?: StockPredictionOutput;
    error?: string;
}

export async function handleInvestmentQuery(query: string): Promise<ActionResult> {
  if (!query) {
    return { success: false, response: "", error: "Query cannot be empty." };
  }

  try {
    const result = await investmentChatbot({ query });
    return { success: true, response: result.response };
  } catch (error) {
    console.error("Error calling investment chatbot flow:", error);
    return {
      success: false,
      response: "",
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

export async function handleStockPrediction(symbol: string): Promise<StockPredictionResult> {
    if (!symbol) {
        return { success: false, error: "Symbol cannot be empty." };
    }

    try {
        const result = await stockPrediction({ symbol });
        return { success: true, prediction: result };
    } catch (error: any) {
        console.error("Error calling stock prediction flow:", error);
        return {
            success: false,
            error: error.message || "An unexpected error occurred while generating the prediction.",
        };
    }
}

// Braintree Actions

export async function getClientToken(): Promise<string> {
    try {
        const response = await gateway.clientToken.generate({});
        return response.clientToken;
    } catch (error) {
        console.error("Braintree token generation failed:", error);
        throw new Error("Failed to get payment client token.");
    }
}

export async function vaultPaymentMethod(data: { nonce: string; userId: string }): Promise<{ success: boolean; token?: string }> {
    const { nonce, userId } = data;
    if (!nonce || !userId) {
        throw new Error("Nonce and User ID are required.");
    }

    try {
        let braintreeCustomer: Customer;
        
        try {
            // Try to find an existing customer
            braintreeCustomer = await gateway.customer.find(userId);
            // If found, update their payment method
            const updateResult = await gateway.paymentMethod.create({
                customerId: userId,
                paymentMethodNonce: nonce,
                options: {
                    makeDefault: true
                }
            });

            if (!updateResult.success) {
                console.error("Braintree payment method update failed:", updateResult.message);
                throw new Error(updateResult.message);
            }
             braintreeCustomer = await gateway.customer.find(userId);

        } catch (error) {
            // If customer not found, create a new one
            const customerResult = await gateway.customer.create({
                id: userId,
                paymentMethodNonce: nonce,
            });

            if (!customerResult.success) {
                console.error("Braintree customer creation failed:", customerResult.message);
                throw new Error(customerResult.message);
            }
            braintreeCustomer = customerResult.customer;
        }

        const defaultPaymentMethod = braintreeCustomer.paymentMethods?.find(pm => pm.default);
        const token = defaultPaymentMethod?.token;

        if (!token) {
            throw new Error("No payment method token returned from Braintree.");
        }

        await db.collection("users").doc(userId).set({
            paymentMethodToken: token,
        }, { merge: true });

        return { success: true, token };
    } catch (err: any) {
        console.error("Vaulting payment method failed:", err);
        throw new Error(err.message || "An unexpected error occurred during vaulting.");
    }
}

export async function createTransaction(data: { userId: string; amount: string }): Promise<{ success: boolean; transactionId?: string }> {
    const { userId, amount } = data;
    if (!userId || !amount) {
        throw new Error("User ID and amount are required.");
    }
    
    const doc = await db.collection("users").doc(userId).get();
    const token = doc.data()?.paymentMethodToken;

    if (!token) {
        throw new Error("No payment method on file for this user.");
    }

    const result = await gateway.transaction.sale({
        amount,
        paymentMethodToken: token,
        options: { submitForSettlement: true },
    });

    if (result.success) {
        return { success: true, transactionId: result.transaction?.id };
    } else {
        console.error("Braintree transaction failed:", result.message);
        throw new Error(result.message);
    }
}

// Community Actions
export type LeaderboardUser = {
  rank: number;
  uid: string;
  name: string;
  gain: number;
};

export async function getLeaderboardData(): Promise<{ success: boolean; data?: LeaderboardUser[]; error?: string; }> {
    try {
        // This query requires a composite index on (leaderboardVisibility, portfolio.summary.totalGainLoss)
        const usersSnapshot = await db
            .collection('users')
            .where('leaderboardVisibility', 'in', ['public', 'anonymous'])
            .orderBy('portfolio.summary.totalGainLoss', 'desc')
            .limit(10)
            .get();

        if (usersSnapshot.empty) {
            return { success: true, data: [] };
        }

        const leaderboardData = usersSnapshot.docs.map((doc, index) => {
            const userData = doc.data();
            const isAnonymous = userData.leaderboardVisibility === 'anonymous';
            
            return {
                rank: index + 1,
                uid: doc.id,
                name: isAnonymous ? 'Anonymous' : userData.username || 'Investor',
                gain: userData.portfolio?.summary?.totalGainLoss || 0,
            };
        });

        return { success: true, data: leaderboardData };
    } catch (error: any) {
        console.error("Error fetching leaderboard data:", error);
        if (error.code === 'failed-precondition') {
             return { success: false, error: "Database index not found. Please create the required composite index in your Firestore settings." };
        }
        return { success: false, error: "Failed to fetch leaderboard data." };
    }
}

export async function getTradeHistory(userId: string): Promise<{ success: boolean; data?: Transaction[]; error?: string; }> {
    if (!userId) {
        return { success: false, error: "User ID is required." };
    }

    try {
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            return { success: false, error: "User not found." };
        }
        
        const transactions = userDoc.data()?.transactions || [];

        // Timestamps are already stored as ISO strings, no conversion needed.
        return { success: true, data: transactions };
    } catch (error: any) {
        console.error("Error fetching trade history:", error);
        return { success: false, error: "Failed to fetch trade history." };
    }
}
