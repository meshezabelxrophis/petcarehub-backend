/**
 * Vercel Serverless API - Main Entry Point
 * Handles CORS and routes requests to appropriate handlers
 */

const cors = require('cors');

// CORS configuration for Firebase Hosting
const allowedOrigins = [
  'https://fyppp-5b4f0.web.app',
  'https://fyppp-5b4f0.firebaseapp.com',
  'http://localhost:3000', // For local development
  'http://localhost:5003'  // Firebase emulator
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

const corsMiddleware = cors(corsOptions);

module.exports = async (req, res) => {
  // Apply CORS
  return new Promise((resolve) => {
    corsMiddleware(req, res, () => {
      // Handle OPTIONS request
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return resolve();
      }

      // Health check endpoint
      res.status(200).json({
        status: 'ok',
        message: 'PetCareHub External API',
        version: '1.0.0',
        endpoints: {
          stripe: '/api/create-payment-intent',
          gemini: '/api/generate-ai-response',
          firestore: '/api/store-ai-output'
        }
      });
      
      resolve();
    });
  });
};

