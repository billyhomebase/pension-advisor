import express from 'express';
import { sendMessage, getInitialGreeting } from '../services/openai.js';
import { logInteraction, getSessionLog, listLogs } from '../services/logger.js';

const router = express.Router();

// Send a message and get AI response
router.post('/message', async (req, res) => {
  try {
    const { messages, customerContext, sessionId } = req.body;

    // Validate request
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: messages must be an array'
      });
    }

    // Validate message format
    const validRoles = ['user', 'assistant'];
    for (const msg of messages) {
      if (!msg.role || !validRoles.includes(msg.role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid message format: each message must have a valid role'
        });
      }
      if (!msg.content || typeof msg.content !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Invalid message format: each message must have content'
        });
      }
    }

    const response = await sendMessage(messages, customerContext);

    // Log the interaction
    logInteraction(sessionId, 'message', { messages, customerContext }, response);

    res.json(response);
  } catch (error) {
    console.error('Chat message error:', error);

    // Log the error
    const { sessionId, messages, customerContext } = req.body;
    logInteraction(sessionId, 'message', { messages, customerContext }, {
      success: false,
      error: error.message || 'Unknown error'
    });

    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return res.status(503).json({
        success: false,
        error: 'Service temporarily unavailable. Please try again later.'
      });
    }

    if (error.code === 'invalid_api_key') {
      return res.status(500).json({
        success: false,
        error: 'Service configuration error. Please contact support.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process message. Please try again.'
    });
  }
});

// Get initial greeting to start conversation
router.post('/greeting', async (req, res) => {
  try {
    const { sessionId } = req.body;
    const response = await getInitialGreeting();

    // Log the greeting interaction
    logInteraction(sessionId, 'greeting', { messages: ['[Initial greeting request]'] }, response);

    res.json(response);
  } catch (error) {
    console.error('Greeting error:', error);

    // Log the error
    const { sessionId } = req.body;
    logInteraction(sessionId, 'greeting', { messages: ['[Initial greeting request]'] }, {
      success: false,
      error: error.message || 'Unknown error'
    });

    res.status(500).json({
      success: false,
      error: 'Failed to start conversation. Please refresh and try again.'
    });
  }
});

// Get logs for a session
router.get('/logs/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const log = getSessionLog(sessionId);

  if (log) {
    res.json({ success: true, log });
  } else {
    res.status(404).json({ success: false, error: 'Log not found' });
  }
});

// List all logs
router.get('/logs', (req, res) => {
  const logs = listLogs();
  res.json({ success: true, logs });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
