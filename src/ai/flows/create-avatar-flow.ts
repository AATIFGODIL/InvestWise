// InvestWise - A modern stock trading and investment education platform for young investors

'use server';
/**
 * @fileOverview Defines an AI flow for creating personalized Memoji-style avatars.
 * This flow uses Google's nano-banana model to generate an image based on a
 * user's text prompt and/or an uploaded reference photo.
 *
 * - createAvatar: The main function that clients call to generate an avatar.
 */

import { getAi } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import {
  CreateAvatarInputSchema,
  type CreateAvatarInput,
  CreateAvatarOutputSchema,
  type CreateAvatarOutput,
} from '@/ai/types/create-avatar-types';

export async function createAvatar(input: CreateAvatarInput): Promise<CreateAvatarOutput> {
  const ai = getAi();

  // Construct the text prompt
  const textPrompt = `You are an expert 3D avatar designer. Your task is to generate a unique 3D avatar in the style of an Apple Memoji. The avatar should be on a clean, simple, and flat background, preferably light grey or white, to make it suitable as a profile picture. Use the following inputs to create the avatar: ${input.prompt ? `User's Description: ${input.prompt}` : ''
    } ${input.photoDataUri ? 'If a photo is provided, it should be the primary reference. Analyze the person\'s features, hair, and style to inspire the Memoji.' : ''
    }`;

  // Construct the prompt parts for the AI model
  const promptParts: Array<{ text: string } | { media: { url: string } }> = [{ text: textPrompt }];
  if (input.photoDataUri) {
    promptParts.push({ media: { url: input.photoDataUri } });
  }

  // Generate the avatar using the prompt and the provided input.
  const { media, text } = await ai.generate({
    model: googleAI.model('gemini-2.5-flash-image-preview'),
    prompt: promptParts,
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
