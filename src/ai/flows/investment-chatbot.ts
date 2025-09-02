'use server';

/**
 * @fileOverview Defines an AI-powered chatbot flow for explaining investment terms.
 * This file contains the Genkit flow, prompt, and necessary types for the chatbot.
 *
 * - investmentChatbot: The primary function that clients call to interact with the chatbot.
 * - InvestmentChatbotInput: The Zod schema defining the input for the chatbot (a user's query).
 * - InvestmentChatbotOutput: The Zod schema defining the expected output from the chatbot (a helpful response).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Defines the expected input from the user.
export const InvestmentChatbotInputSchema = z.object({
  query: z.string().describe('The user\'s question about an investment term.'),
});
export type InvestmentChatbotInput = z.infer<typeof InvestmentChatbotInputSchema>;

// Defines the expected output from the AI.
export const InvestmentChatbotOutputSchema = z.object({
  response: z.string().describe('The chatbot\'s helpful and clear explanation.'),
});
export type InvestmentChatbotOutput = z.infer<typeof InvestmentChatbotOutputSchema>;

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

/**
 * Defines the AI prompt for the chatbot.
 * This prompt instructs the AI on its role, personality, and how to format the output.
 */
const prompt = ai.definePrompt({
  name: 'investmentChatbotPrompt',
  input: {schema: InvestmentChatbotInputSchema},
  output: {schema: InvestmentChatbotOutputSchema},
  prompt: `You are a friendly and helpful AI assistant named InvestWise Bot. 
  Your primary goal is to explain complex investment terms to beginners in a simple, clear, and encouraging way.
  Avoid jargon where possible, or explain it immediately. Use analogies if they help clarify a concept.

  User's Question: {{{query}}}

  Please provide a helpful and easy-to-understand explanation.`,
});

/**
 * Defines the main Genkit flow for the chatbot.
 * A flow orchestrates AI model calls and can include other logic. In this case, it simply calls the prompt.
 */
const investmentChatbotFlow = ai.defineFlow(
  {
    name: 'investmentChatbotFlow',
    inputSchema: InvestmentChatbotInputSchema,
    outputSchema: InvestmentChatbotOutputSchema,
  },
  async input => {
    // Execute the prompt with the user's input.
    const {output} = await prompt(input);

    // The '!' tells TypeScript that we are certain the output will not be null.
    return output!;
  }
);
