import dotenv from 'dotenv';
dotenv.config();

export { SYSTEM_PROMPT } from './systemPrompt.js';

export const config = {
  port: process.env.PORT || 3001,
  openaiApiKey: process.env.OPENAI_API_KEY,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development'
};
