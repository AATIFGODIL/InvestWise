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
import { buildStockBrief, symbolsForQuery } from '@/lib/stock-brief';

/**
 * The entry point for the investment chatbot. Answers are kept deliberately
 * short; the one exception is "Explain this page", which walks through every
 * section of the page using the user's own data (sent as `context.snapshot`).
 *
 * Any stock the message is about (a ticker in the text, or the one open on the
 * Trade page) gets a live fact sheet from Finnhub and Danelfin, so questions
 * like "Analyze AAPL" are answered with real numbers.
 */
export async function investmentChatbot(input: InvestmentChatbotInput): Promise<InvestmentChatbotOutput> {
  const ai = getAi();

  const context = input.context ?? {};
  const pageDescription = context.route ? getPageDescription(context.route) : null;

  // The stock on screen only counts while it's actually on screen.
  const onScreen = context.route?.startsWith('/trade') ? context.symbol : undefined;
  const briefs = (
    await Promise.all(symbolsForQuery(input.query, onScreen).map((s) => buildStockBrief(s).catch(() => null)))
  ).filter((brief): brief is string => Boolean(brief));

  const sections: string[] = [
    `You are the assistant inside InvestWise, a paper-trading app (virtual money only) for young, beginner investors.

How to answer (follow strictly):
- Be short and to the point. Default to 1 to 3 short sentences, under 60 words.
- No greetings, pleasantries, self-introductions, emojis, or restating the question. Never pad.
- If the user just says hi, reply with one short line offering help.
- Use plain words. If you must use a term like "ETF" or "P/E", explain it in a few words.
- Use short bullets only for lists or steps.
- Use the user's own data below whenever it's relevant.
- Answer from the data you're given. Never tell the user to go look at a chart, panel, screener or another page for the answer.
- This is education, not financial advice: never tell the user to buy or sell a specific stock.`,
  ];

  if (briefs.length) {
    sections.push(`Live market data (Finnhub and Danelfin), fetched just now:\n\n${briefs.join('\n\n')}`);
    sections.push(`When the user asks to analyze a stock, or how it's doing, give a short read built from the live data above, as 4 to 6 one-line bullets with the real numbers:
- **Today**: price and today's move.
- **Trend**: where it sits in its 52-week range and its recent returns (and versus the S&P 500 if given).
- **Valuation and business**: P/E explained in a few words, plus growth or margins if given.
- **Danelfin AI**: the AI Score out of 10 and the 3-month forecast range. Only if given.
- **Analysts or news**: the analyst split, or the one headline that matters most.
- **Takeaway**: one balanced line on what to watch, not a recommendation.
Skip any bullet with no data. Don't invent numbers. For other questions about a stock, use only the figures that answer it.`);
  }

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

