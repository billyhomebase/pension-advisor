import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { rateLimiter } from './middleware/rateLimit.js';
import chatRoutes from './routes/chat.js';

const app = express();

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Parse JSON bodies
app.use(express.json());

// Rate limiting
app.use('/api', rateLimiter);

// API routes
app.use('/api/chat', chatRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Pension Chat API',
    version: '1.0.0',
    status: 'running'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);

  if (!config.openaiApiKey) {
    console.warn('Warning: OPENAI_API_KEY not set. API calls will fail.');
  }
});
