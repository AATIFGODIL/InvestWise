'use server';
/**
 * @fileOverview Defines an AI flow for creating personalized Memoji-style avatars.
 * This flow uses Google's nano-banana model to generate an image based on a
 * user's text prompt and/or an uploaded reference photo.
 *
 * - createAvatar: The main function that clients call to generate an avatar.
 * - CreateAvatarInput: The type for the input (prompt and/or photo).
 * - CreateAvatarOutput: The type for the output (the generated image data URI).
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
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

export async function createAvatar(input: CreateAvatarInput): Promise<CreateAvatarOutput> {
  return createAvatarFlow(input);
}

// This prompt guides the AI to generate avatars in a specific style.
// It conditionally includes the prompt and photo based on user input.
const prompt = ai.definePrompt({
  name: 'createAvatarPrompt',
  input: { schema: CreateAvatarInputSchema },
  output: { schema: CreateAvatarOutputSchema },
  model: googleAI.model('gemini-2.5-flash-image-preview'),
  config: {
    // Crucially, we must specify that we expect both TEXT and IMAGE in the response
    // even if we only use the image. This is a requirement for this model.
    responseModalities: ['TEXT', 'IMAGE'],
  },
  prompt: `You are an expert 3D avatar designer. Your task is to generate a unique 3D avatar in the style of an Apple Memoji.

The avatar should be on a clean, simple, and flat background, preferably light grey or white, to make it suitable as a profile picture.

Use the following inputs to create the avatar:

{{#if prompt}}
User's Description: {{{prompt}}}
{{/if}}

{{#if photoDataUri}}
Reference Photo: {{media url=photoDataUri}}
If a photo is provided, it should be the primary reference. Analyze the person's features, hair, and style to inspire the Memoji.
{{/if}}

Generate the avatar and provide the image data.
`,
});

// The flow orchestrates the call to the AI model.
const createAvatarFlow = ai.defineFlow(
  {
    name: 'createAvatarFlow',
    inputSchema: CreateAvatarInputSchema,
    outputSchema: CreateAvatarOutputSchema,
  },
  async (input) => {
    // Generate the avatar using the prompt and the provided input.
    const { media, text } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-image-preview'),
      prompt: [
        {text: `You are an expert 3D avatar designer. Your task is to generate a unique 3D avatar in the style of an Apple Memoji.

The avatar should be on a clean, simple, and flat background, preferably light grey or white, to make it suitable as a profile picture.

Use the following inputs to create the avatar:
${input.prompt ? `User's Description: ${input.prompt}` : ''}
`
        },
        ...(input.photoDataUri ? [{media: {url: input.photoDataUri}}] : [])
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      console.error('Avatar generation failed, AI response text:', text);
      throw new Error('Avatar generation failed. The model did not return an image.');
    }

    return { avatarDataUri: media.url };
  }
);
