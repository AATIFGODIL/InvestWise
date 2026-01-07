import { genkit, type Genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

let _ai: Genkit | null = null;

export function getAi(): Genkit {
  if (!_ai) {
    _ai = genkit({
      plugins: [googleAI({ apiKey: process.env.GOOGLE_API_KEY })],
      model: 'googleai/gemini-2.5-pro',
    });
  }
  return _ai;
}

// For backwards compatibility with existing imports
export const ai = new Proxy({} as Genkit, {
  get(_, prop) {
    return (getAi() as any)[prop];
  },
});
