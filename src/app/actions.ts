
'use server';

/**
 * @fileOverview Server Actions for the application.
 * This file contains asynchronous functions that can be called directly from client components
 * to handle server-side logic like AI interactions, payment processing, and database operations.
 */

import { investmentChatbot } from "@/ai/flows/investment-chatbot";
import type { InvestmentChatbotOutput } from "@/ai/types/investment-chatbot-types";
import { stockPrediction } from "@/ai/flows/stock-prediction";
import type { StockPredictionOutput } from "@/ai/types/stock-prediction-types";
import { createAvatar } from "@/ai/flows/create-avatar-flow";
import type { CreateAvatarInput, CreateAvatarOutput } from "@/ai/types/create-avatar-types";
import { gateway } from "@/lib/braintree";
import { db } from "@/lib/firebase/admin";
import { type BraintreeGateway, type Customer, type Transaction as BraintreeTransaction } from "braintree";
import { type Transaction } from "@/store/transaction-store";

/**
 * A standardized result type for server actions to ensure consistent responses.
 */
type ActionResult = {
  success: boolean;
  response: string;
  error?: string;
};

/**
 * A standardized result type for the stock prediction action.
 */
type StockPredictionResult = {
    success: boolean;
    prediction?: StockPredictionOutput;
    error?: string;
}

/**
 * Calls the investment chatbot AI flow to answer a user's query.
 * @param {string} query - The user's question about an investment term.
 * @param {string} [fileDataUri] - Optional file data as a data URI string.
 * @returns {Promise<ActionResult>} An object with the chatbot's response or an error.
 */
export async function handleInvestmentQuery(query: string, fileDataUri?: string): Promise<ActionResult> {
  if (!query && !fileDataUri) {
    return { success: false, response: "", error: "Your question cannot be empty." };
  }

  try {
    const result = await investmentChatbot({ query, fileDataUri });
    return { success: true, response: result.response };
  } catch (error) {
    console.error("Error calling investment chatbot flow:", error);
    return {
      success: false,
      response: "",
      error: "I'm sorry, but I encountered an unexpected issue. Please try asking again later.",
    };
  }
}

/**
 * Calls the stock prediction AI flow to generate a forecast for a given stock symbol.
 * @param {string} symbol - The stock symbol (e.g., AAPL).
 * @returns {Promise<StockPredictionResult>} An object with the prediction data or an error.
 */
export async function handleStockPrediction(symbol: string): Promise<StockPredictionResult> {
    if (!symbol) {
        return { success: false, error: "Stock symbol cannot be empty." };
    }

    try {
        const result = await stockPrediction({ symbol });
        if (!result) {
             return { success: false, error: "You have reached the daily limit for predictions. Please try again tomorrow." };
        }
        return { success: true, prediction: result };
    } catch (error: any) {
        console.error("Error calling stock prediction flow:", error);
        return {
            success: false,
            error: error.message || "An unexpected error occurred while generating the prediction.",
        };
    }
}

/**
 * Calls the AI avatar creation flow.
 * @param {CreateAvatarInput} input - The user's prompt and/or photo.
 * @returns {Promise<{success: boolean, avatar?: CreateAvatarOutput, error?: string}>} The generated avatar or an error.
 */
export async function handleAvatarCreation(input: CreateAvatarInput): Promise<{success: boolean, avatar?: CreateAvatarOutput, error?: string}> {
  if (!input.prompt && !input.photoDataUri) {
    return { success: false, error: "Please provide a prompt or a photo." };
  }

  try {
    const result = await createAvatar(input);
    if (!result || !result.avatarDataUri) {
      throw new Error("The AI model did not return an image. Please try a different prompt or image.");
    }
    return { success: true, avatar: result };
  } catch (error: any) {
    console.error("Error calling avatar creation flow:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred while creating your avatar.",
    };
  }
}


// --- Braintree Payment Actions ---

/**
 * Generates a client token from Braintree to initialize the payment Drop-in UI.
 * This token authorizes the client to communicate with Braintree.
 * @returns {Promise<string>} A promise that resolves to the Braintree client token.
 */
export async function getClientToken(): Promise<string> {
    try {
        const response = await gateway.clientToken.generate({});
        return response.clientToken;
    } catch (error) {
        console.error("Braintree client token generation failed:", error);
        throw new Error("Failed to initialize the payment form.");
    }
}

/**
 * Saves a payment method nonce to the Braintree vault.
 * It creates a new Braintree customer record if one doesn't exist for the user ID.
 * The resulting payment method token is stored in the user's Firestore document.
 * @param {object} data - Contains the payment method nonce and user ID.
 * @returns {Promise<{ success: boolean; token?: string }>} An object indicating success and the new payment method token.
 */
export async function vaultPaymentMethod(data: { nonce: string; userId: string }): Promise<{ success: boolean; token?: string }> {
    const { nonce, userId } = data;
    if (!nonce || !userId) {
        throw new Error("Payment nonce and User ID are required to save a card.");
    }

    try {
        let braintreeCustomer: Customer;
        
        try {
            // Attempt to find an existing customer in Braintree.
            braintreeCustomer = await gateway.customer.find(userId);
            
            // If the customer exists, add the new payment method to their profile.
            const updateResult = await gateway.paymentMethod.create({
                customerId: userId,
                paymentMethodNonce: nonce,
                options: { makeDefault: true }
            });

            if (!updateResult.success) {
                console.error("Braintree payment method update failed:", updateResult.message);
                throw new Error(updateResult.message);
            }
            braintreeCustomer = await gateway.customer.find(userId);

        } catch (error) {
            // If not found, create a new Braintree customer with the provided payment method.
            const customerResult = await gateway.customer.create({
                id: userId, // Use the Firebase UID as the Braintree Customer ID for easy mapping.
                paymentMethodNonce: nonce,
            });

            if (!customerResult.success) {
                console.error("Braintree customer creation failed:", customerResult.message);
                throw new Error(customerResult.message);
            }
            braintreeCustomer = customerResult.customer;
        }

        // Find the default payment method and get its token.
        const defaultPaymentMethod = braintreeCustomer.paymentMethods?.find(pm => (pm as any).default);
        const token = defaultPaymentMethod?.token;

        if (!token) {
            throw new Error("No default payment method token was returned from Braintree.");
        }

        // Store the Braintree token in Firestore for future transactions.
        await db.collection("users").doc(userId).set({
            paymentMethodToken: token,
        }, { merge: true });

        return { success: true, token };
    } catch (err: any) {
        console.error("Vaulting payment method failed:", err);
        throw new Error(err.message || "An unexpected error occurred while saving your payment method.");
    }
}

/**
 * Creates a transaction using a vaulted payment method from Braintree.
 * It retrieves the user's payment token from Firestore to process the payment.
 * @param {object} data - Contains the user ID and the transaction amount.
 * @returns {Promise<{ success: boolean; transactionId?: string }>} An object indicating success and the transaction ID.
 */
export async function createTransaction(data: { userId: string; amount: string }): Promise<{ success: boolean; transactionId?: string }> {
    const { userId, amount } = data;
    if (!userId || !amount) {
        throw new Error("User ID and transaction amount are required.");
    }
    
    // Retrieve the user's vaulted payment method token from Firestore.
    const userDoc = await db.collection("users").doc(userId).get();
    const token = userDoc.data()?.paymentMethodToken;

    if (!token) {
        throw new Error("No payment method on file for this user. Please add one in your profile.");
    }

    const result = await gateway.transaction.sale({
        amount,
        paymentMethodToken: token,
        options: { submitForSettlement: true }, // Immediately submit for settlement.
    });

    if (result.success) {
        return { success: true, transactionId: result.transaction?.id };
    } else {
        console.error("Braintree transaction failed:", result.message);
        throw new Error(result.message);
    }
}

// --- Community Feature Actions ---

/**
 * Represents a user's data as displayed on the leaderboard.
 */
export type LeaderboardUser = {
  rank: number;
  uid: string;
  name: string;
  photoURL: string;
  gain: number;
};

/**
 * Fetches and ranks user data for the community leaderboard.
 * It filters users based on their privacy settings and sorts them by portfolio gain.
 * @returns {Promise<{ success: boolean; data?: LeaderboardUser[]; error?: string; }>} Leaderboard data or an error.
 */
export async function getLeaderboardData(): Promise<{ success: boolean; data?: LeaderboardUser[]; error?: string; }> {
    try {
        const usersSnapshot = await db.collection('users').get();

        if (usersSnapshot.empty) {
            return { success: true, data: [] };
        }
        
        // Filter users based on their leaderboard visibility settings.
        const usersData = usersSnapshot.docs
            .map(doc => ({
                uid: doc.id,
                ...doc.data(),
            }))
            .filter(user => (user as any).leaderboardVisibility === 'public' || (user as any).leaderboardVisibility === 'anonymous');
        
        // Sort users by their total portfolio gain/loss in descending order.
        const sortedUsers = usersData.sort((a, b) => ((b as any).portfolio?.summary?.totalGainLoss || 0) - ((a as any).portfolio?.summary?.totalGainLoss || 0));

        // Format the data for the leaderboard, anonymizing names where needed.
        const leaderboardData: LeaderboardUser[] = sortedUsers.slice(0, 10).map((userData, index) => {
            const isAnonymous = (userData as any).leaderboardVisibility === 'anonymous';
            
            return {
                rank: index + 1,
                uid: (userData as any).uid,
                name: isAnonymous ? 'Anonymous Investor' : (userData as any).username || 'Investor',
                photoURL: (userData as any).photoURL || '',
                gain: (userData as any).portfolio?.summary?.totalGainLoss || 0,
            };
        });

        return { success: true, data: leaderboardData };
    } catch (error: any) {
        console.error("Error fetching leaderboard data:", error);
        return { success: false, error: "Failed to fetch leaderboard data. Please try again later." };
    }
}

/**
 * Fetches the trade history for a specific user from Firestore.
 * @param {string} userId - The UID of the user whose history is being requested.
 * @returns {Promise<{ success: boolean; data?: Transaction[]; error?: string; }>} The user's trade history or an error.
 */
export async function getTradeHistory(userId: string): Promise<{ success: boolean; data?: Transaction[]; error?: string; }> {
    if (!userId) {
        return { success: false, error: "A User ID is required to fetch trade history." };
    }

    try {
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            return { success: false, error: "User not found." };
        }
        
        const transactions = userDoc.data()?.transactions || [];

        return { success: true, data: transactions };
    } catch (error: any) {
        console.error("Error fetching trade history:", error);
        return { success: false, error: "Failed to fetch trade history." };
    }
}
