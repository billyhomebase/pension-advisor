import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Logs directory path
const LOGS_DIR = path.join(__dirname, '..', 'logs');

// Ensure logs directory exists
function ensureLogsDir() {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

// Get log file path for a session
function getLogFilePath(sessionId) {
  const date = new Date().toISOString().split('T')[0];
  return path.join(LOGS_DIR, `chat_${date}_${sessionId}.json`);
}

// Read existing log or create new structure
function readOrCreateLog(sessionId) {
  const filePath = getLogFilePath(sessionId);

  if (fs.existsSync(filePath)) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading log file:', error);
    }
  }

  return {
    sessionId,
    createdAt: new Date().toISOString(),
    interactions: []
  };
}

// Save log to file
function saveLog(sessionId, logData) {
  ensureLogsDir();
  const filePath = getLogFilePath(sessionId);

  try {
    fs.writeFileSync(filePath, JSON.stringify(logData, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing log file:', error);
  }
}

/**
 * Log a ChatGPT interaction
 * @param {string} sessionId - Unique session identifier
 * @param {string} type - Type of interaction ('message' or 'greeting')
 * @param {object} request - The request sent to ChatGPT
 * @param {object} response - The response received from ChatGPT
 */
export function logInteraction(sessionId, type, request, response) {
  if (!sessionId) {
    console.warn('No sessionId provided for logging');
    return;
  }

  const logData = readOrCreateLog(sessionId);

  const interaction = {
    timestamp: new Date().toISOString(),
    type,
    request: {
      messages: request.messages,
      customerContext: request.customerContext || null
    },
    response: {
      success: response.success,
      content: response.content,
      usage: response.usage || null,
      error: response.error || null
    }
  };

  logData.interactions.push(interaction);
  logData.lastUpdated = new Date().toISOString();

  saveLog(sessionId, logData);

  console.log(`[Logger] Session ${sessionId}: Logged ${type} interaction`);
}

/**
 * Get all logs for a session
 * @param {string} sessionId - Unique session identifier
 * @returns {object|null} - Log data or null if not found
 */
export function getSessionLog(sessionId) {
  const filePath = getLogFilePath(sessionId);

  if (fs.existsSync(filePath)) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading log file:', error);
    }
  }

  return null;
}

/**
 * List all log files
 * @returns {string[]} - Array of log file names
 */
export function listLogs() {
  ensureLogsDir();

  try {
    return fs.readdirSync(LOGS_DIR)
      .filter(file => file.endsWith('.json'))
      .sort()
      .reverse();
  } catch (error) {
    console.error('Error listing logs:', error);
    return [];
  }
}
