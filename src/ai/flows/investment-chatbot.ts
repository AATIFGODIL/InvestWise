
'use server';

/**
 * @fileOverview Defines an AI-powered chatbot flow for explaining investment terms.
 * This file contains the Genkit flow and prompt for the chatbot.
 *
 * - investmentChatbot: The primary function that clients call to interact with the chatbot.
 */

import { getAi } from '@/ai/genkit';
import {
  InvestmentChatbotInputSchema,
  type InvestmentChatbotInput,
  InvestmentChatbotOutputSchema,
  type InvestmentChatbotOutput,
} from '@/ai/types/investment-chatbot-types';

/**
 * An asynchronous function that serves as the entry point for the investment chatbot.
 */
export async function investmentChatbot(input: InvestmentChatbotInput): Promise<InvestmentChatbotOutput> {
  const ai = getAi();

  // Define prompt at runtime
  const prompt = ai.definePrompt({
    name: 'investmentChatbotPrompt',
    input: { schema: InvestmentChatbotInputSchema },
    output: { schema: InvestmentChatbotOutputSchema },
    model: 'googleai/gemini-2.5-pro',
    prompt: `You are a friendly and helpful AI assistant named InvestWise Bot. 
  Your primary goal is to explain complex investment terms to beginners in a simple, clear, and encouraging way.
  Avoid jargon where possible, or explain it immediately. Use analogies if they help clarify a concept.

  {{#if context}}
  User Context:
  {{#if context.route}}
  - Current Page: {{context.route}}
  {{/if}}
  {{#if context.symbol}}
  - Active Stock: {{context.symbol}}
  {{/if}}
  {{#if context.price}}
  - Current Price: $\${{context.price}}
  {{/if}}
  {{/if}}

  User's Question: {{{query}}}

  {{#if fileDataUri}}
  The user has also attached the following file. Use it as context for your response.
  Attached File: {{media url=fileDataUri}}
  {{/if}}

  Please provide a helpful, context-aware, and easy-to-understand explanation based on the user's query and any attached file.`,
    config: {
      googleSearchRetrieval: true,
    },
  });

  const { output } = await prompt(input);
  return output!;
}
