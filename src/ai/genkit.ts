// InvestWise - A modern stock trading and investment education platform for young investors
import { genkit, type Genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { getEnvVar } from '@/lib/env';

let _ai: Genkit | null = null;

/**
 * Get the Genkit AI instance. Initializes lazily on first call to ensure
 * environment variables are available (important for App Hosting).
 */
export function getAi(): Genkit {
  if (!_ai) {
    _ai = genkit({
      plugins: [
        googleAI({
          apiKey: getEnvVar('GOOGLE_API_KEY') || getEnvVar('GEMINI_API_KEY'),
        }),
      ],
      model: 'googleai/gemini-2.0-flash',
    });
  }
  return _ai;
}
 