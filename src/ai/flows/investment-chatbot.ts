// InvestWise - A modern stock trading and investment education platform for young investors

'use server';

/**
 * @fileOverview Defines an AI-powered chatbot flow for explaining investment terms.
 * This file contains the Genkit flow and prompt for the chatbot.
 *
 * - investmentChatbot: The primary function that clients call to interact with the chatbot.
 */

import { getAi } from '@/ai/genkit';
import type { InvestmentChatbotInput, InvestmentChatbotOutput } from '@/ai/types/investment-chatbot-types';

/**
 * An asynchronous function that serves as the entry point for the investment chatbot.
 * Uses ai.generate() instead of definePrompt() to support Google Search grounding
 * (which is incompatible with JSON response mime type).
 */
export async function investmentChatbot(input: InvestmentChatbotInput): Promise<InvestmentChatbotOutput> {
  const ai = getAi();

  // Build context section of prompt
  let contextSection = '';
  if (input.context) {
    contextSection = '\nUser Context:';
    if (input.context.route) {
      contextSection += `\n- Current Page: ${input.context.route}`;
    }
    if (input.context.symbol) {
      contextSection += `\n- Active Stock: ${input.context.symbol}`;
    }
    if (input.context.price) {
      contextSection += `\n- Current Price: $${input.context.price}`;
    }
  }

  // Build the full prompt
  const systemPrompt = `You are a friendly and helpful AI assistant named InvestWise Bot. 
Your primary goal is to explain complex investment terms to beginners in a simple, clear, and encouraging way.
Avoid jargon where possible, or explain it immediately. Use analogies if they help clarify a concept.
${contextSection}

User's Question: ${input.query}

Please provide a helpful, context-aware, and easy-to-understand explanation based on the user's query.`;

  // Use ai.generate() which supports Google Search grounding with text output
  const response = await ai.generate({
    model: 'googleai/gemini-2.5-pro',
    prompt: systemPrompt,
    config: {
      googleSearchRetrieval: true,
    },
  });

  return { response: response.text };
}
