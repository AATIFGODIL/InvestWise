'use server';

/**
 * @fileOverview Defines an AI-powered chatbot flow for explaining investment terms.
 * This file contains the Genkit flow and prompt for the chatbot.
 *
 * - investmentChatbot: The primary function that clients call to interact with the chatbot.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {
  InvestmentChatbotInputSchema,
  type InvestmentChatbotInput,
  InvestmentChatbotOutputSchema,
  type InvestmentChatbotOutput,
} from '@/ai/types/investment-chatbot-types';

/**
 * An asynchronous function that serves as the entry point for the investment chatbot.
 * It takes a user's query and returns a structured response from the AI.
 *
 * @param {InvestmentChatbotInput} input - The user's query wrapped in an object.
 * @returns {Promise<InvestmentChatbotOutput>} A promise that resolves to the AI's response.
 */
export async function investmentChatbot(input: InvestmentChatbotInput): Promise<InvestmentChatbotOutput> {
  return investmentChatbotFlow(input);
}

// This prompt instructs the AI on its persona and task. By defining its role as
// a friendly assistant for beginners, we ensure the responses are helpful and easy to understand.
const prompt = ai.definePrompt({
  name: 'investmentChatbotPrompt',
  input: {schema: InvestmentChatbotInputSchema},
  output: {schema: InvestmentChatbotOutputSchema},
  model: googleAI.model('gemini-2.5-pro'),
  prompt: `You are a friendly and helpful AI assistant named InvestWise Bot. 
  Your primary goal is to explain complex investment terms to beginners in a simple, clear, and encouraging way.
  Avoid jargon where possible, or explain it immediately. Use analogies if they help clarify a concept.

  User's Question: {{{query}}}

  Please provide a helpful and easy-to-understand explanation.`,
});

// A Genkit flow orchestrates AI model calls and can include other logic.
// In this case, the flow is straightforward: it simply executes the prompt with the user's input.
const investmentChatbotFlow = ai.defineFlow(
  {
    name: 'investmentChatbotFlow',
    inputSchema: InvestmentChatbotInputSchema,
    outputSchema: InvestmentChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // The '!' tells TypeScript that we are certain the output will not be null based on the prompt's design.
    return output!;
  }
);
