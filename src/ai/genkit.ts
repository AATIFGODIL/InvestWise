// InvestWise - A modern stock trading and investment education platform for young investors
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
      model: 'googleai/gemini-2.5-pro',
    });
  }
  return _ai;
}
