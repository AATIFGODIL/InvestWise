/**
 * @fileOverview Defines TypeScript types and Zod schemas for the avatar creation AI flow.
 */

import { z } from 'zod';

export const CreateAvatarInputSchema = z.object({
  prompt: z.string().optional().describe("The user's text description for the avatar."),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo of a person to use as a reference, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type CreateAvatarInput = z.infer<typeof CreateAvatarInputSchema>;

export const CreateAvatarOutputSchema = z.object({
  avatarDataUri: z.string().describe('The generated avatar image as a data URI.'),
});
export type CreateAvatarOutput = z.infer<typeof CreateAvatarOutputSchema>;
