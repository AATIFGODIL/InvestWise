
"use server";

import { investmentChatbot } from "@/ai/flows/investment-chatbot";

type ActionResult = {
  success: boolean;
  response: string;
  error?: string;
};

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
