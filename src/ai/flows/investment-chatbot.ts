'use server';

/**
 * @fileOverview An investment chatbot AI agent.
 *
 * - investmentChatbot - A function that handles the chatbot interactions.
 * - InvestmentChatbotInput - The input type for the investmentChatbot function.
 * - InvestmentChatbotOutput - The return type for the investmentChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InvestmentChatbotInputSchema = z.object({
  query: z.string().describe('The user query about investment terms.'),
});
export type InvestmentChatbotInput = z.infer<typeof InvestmentChatbotInputSchema>;

const InvestmentChatbotOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user query.'),
});
export type InvestmentChatbotOutput = z.infer<typeof InvestmentChatbotOutputSchema>;

export async function investmentChatbot(input: InvestmentChatbotInput): Promise<InvestmentChatbotOutput> {
  return investmentChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'investmentChatbotPrompt',
  input: {schema: InvestmentChatbotInputSchema},
  output: {schema: InvestmentChatbotOutputSchema},
  prompt: `You are a helpful chatbot designed to explain investment terms to new users.

  User Query: {{{query}}}

  Please provide a clear and concise explanation. Focus on simplicity and ease of understanding for beginners.`,
});

const investmentChatbotFlow = ai.defineFlow(
  {
    name: 'investmentChatbotFlow',
    inputSchema: InvestmentChatbotInputSchema,
    outputSchema: InvestmentChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
