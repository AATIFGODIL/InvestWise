import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// The googleAI plugin will automatically read GOOGLE_API_KEY or GEMINI_API_KEY
// from the environment at call time
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-pro',
});
