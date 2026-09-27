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
import { getPageDescription } from '@/data/page-descriptions';

/**
 * The entry point for the investment chatbot. Answers are kept deliberately
 * short; the one exception is "Explain this page", which walks through every
 * section of the page using the user's own data (sent as `context.snapshot`).
 */
export async function investmentChatbot(input: InvestmentChatbotInput): Promise<InvestmentChatbotOutput> {
  const ai = getAi();

  const context = input.context ?? {};
  const pageDescription = context.route ? getPageDescription(context.route) : null;

  const sections: string[] = [
    `You are the assistant inside InvestWise, a paper-trading app (virtual money only) for young, beginner investors.

How to answer (follow strictly):
- Be short and to the point. Default to 1 to 3 short sentences, under 60 words.
- No greetings, pleasantries, self-introductions, emojis, or restating the question. Never pad.
- If the user just says hi, reply with one short line offering help.
- Use plain words. If you must use a term like "ETF" or "P/E", explain it in a few words.
- Use short bullets only for lists or steps.
- Use the user's own data below whenever it's relevant.
- This is education, not financial advice: never tell the user to buy or sell a specific stock.`,
  ];

  if (context.explainPage) {
    sections.push(`The user tapped "Explain this page". Walk through EVERY section of the page below, in the order it appears. One bullet per section: the section name in bold, then what it shows using the user's actual numbers, then what they can do there. Keep each bullet to one line. Cover every section. No intro or outro.`);
  }

  if (context.route) sections.push(`Current page: ${context.route}`);
  if (pageDescription) sections.push(`What's on this page:\n${pageDescription}`);
  if (context.symbol) sections.push(`Stock being viewed: ${context.symbol}${context.price ? ` at $${context.price}` : ''}`);
  if (context.snapshot) sections.push(`The user's data:\n${context.snapshot}`);
  sections.push(`User: ${input.query}`);

  const response = await ai.generate({
    model: 'googleai/gemini-3.6-flash',
    prompt: sections.join('\n\n'),
  });

  return { response: response.text };
}

