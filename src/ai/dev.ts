import { config } from 'dotenv';
config({ path: '.env.local' });

import '@/ai/flows/investment-chatbot.ts';
import '@/ai/flows/stock-prediction.ts';

import '@/ai/flows/create-avatar-flow.ts';
import '@/ai/tools/prediction-api-tool.ts';
