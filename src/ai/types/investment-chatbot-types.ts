// InvestWise - A modern stock trading and investment education platform for young investors

/**
 * @fileOverview Defines the TypeScript types and Zod schemas for the investment chatbot flow.
 * Using Zod schemas ensures type safety and data validation.
 */

import { z } from 'zod';

// Defines the expected input from the user. It now includes an optional fileDataUri.
export const InvestmentChatbotInputSchema = z.object({
  query: z.string().describe("The user's question about an investment term."),
  fileDataUri: z.string().optional().describe("An optional file, such as an image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  context: z.object({
    route: z.string().optional(),
    symbol: z.string().optional(),
    price: z.number().optional()
  }).optional().describe("Contextual information about the user's current view"),
});
export type InvestmentChatbotInput = z.infer<typeof InvestmentChatbotInputSchema>;

// Defines the expected output from the AI.
export const InvestmentChatbotOutputSchema = z.object({
  response: z.string().describe("The chatbot's helpful and clear explanation."),
});
export type InvestmentChatbotOutput = z.infer<typeof InvestmentChatbotOutputSchema>;
