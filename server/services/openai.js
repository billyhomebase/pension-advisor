import OpenAI from 'openai';
import { config, SYSTEM_PROMPT } from '../config/index.js';

const openai = new OpenAI({
  apiKey: config.openaiApiKey
});

export async function sendMessage(messages, customerContext = null) {
  // Build system message with optional customer context
  let systemContent = SYSTEM_PROMPT;
  if (customerContext && Object.keys(customerContext).length > 0) {
    systemContent += `\n\nCurrent customer context (information already gathered):\n${JSON.stringify(customerContext, null, 2)}`;
  }

  const systemMessage = {
    role: 'system',
    content: systemContent
  };

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 1000
    });

    return {
      success: true,
      content: completion.choices[0].message.content,
      usage: completion.usage
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

export async function getInitialGreeting() {
  const systemMessage = {
    role: 'system',
    content: SYSTEM_PROMPT
  };

  const userMessage = {
    role: 'user',
    content: '[System: Generate your opening greeting message to start the conversation. This is the first message the customer will see.]'
  };

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [systemMessage, userMessage],
      temperature: 0.7,
      max_tokens: 500
    });

    return {
      success: true,
      content: completion.choices[0].message.content,
      usage: completion.usage
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}
