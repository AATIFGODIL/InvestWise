
"use server";

import { investmentChatbot } from "@/ai/flows/investment-chatbot";
import { stockPrediction, type StockPredictionOutput } from "@/ai/flows/stock-prediction";
import { gateway } from "@/lib/braintree";
import { db } from "@/lib/firebase/admin";

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
    } catch (error) {
        console.error("Error calling stock prediction flow:", error);
        return {
            success: false,
            error: "An unexpected error occurred while generating the prediction.",
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
        const customer = await gateway.customer.create({
            id: userId,
            paymentMethodNonce: nonce,
        });

        if (!customer.success) {
            console.error("Braintree customer creation failed:", customer.message);
            throw new Error(customer.message);
        }

        const token = customer.customer?.paymentMethods?.[0]?.token;
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
