import { genkit, type Genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

let _ai: Genkit | null = null;

/**
 * Get the Genkit AI instance. Initializes lazily on first call to ensure
 * environment variables are available (important for App Hosting).
 */
export function getAi(): Genkit {
  if (!_ai) {
    _ai = genkit({
      plugins: [googleAI()],
      model: 'googleai/gemini-1.5-pro',
    });
  }
  return _ai;
}
