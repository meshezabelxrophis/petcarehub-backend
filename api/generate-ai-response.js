/**
 * Gemini AI Response Generator
 * POST /api/generate-ai-response
 * 
 * Generates AI responses using Google Gemini
 */

const cors = require('cors');

// CORS configuration
const allowedOrigins = [
  'https://fyppp-5b4f0.web.app',
  'https://fyppp-5b4f0.firebaseapp.com',
  'http://localhost:3000',
  'http://localhost:5003'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

const corsMiddleware = cors(corsOptions);

// In-memory session storage (for serverless, consider using Redis in production)
const chatSessions = new Map();

module.exports = async (req, res) => {
  return new Promise((resolve) => {
    corsMiddleware(req, res, async () => {
      // Handle OPTIONS
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return resolve();
      }

      // Only allow POST
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return resolve();
      }

      try {
        const {
          message,
          sessionId = 'default-session',
          systemPrompt,
          context = {}
        } = req.body;

        // Validate input
        if (!message || typeof message !== 'string') {
          res.status(400).json({
            error: 'Missing or invalid message',
            required: ['message']
          });
          return resolve();
        }

        // Check for API key
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          console.error('❌ GEMINI_API_KEY not configured');
          res.status(500).json({
            error: 'Server configuration error',
            message: 'Gemini API key not configured'
          });
          return resolve();
        }

        // Get or initialize chat history
        if (!chatSessions.has(sessionId)) {
          chatSessions.set(sessionId, []);
        }
        const chatHistory = chatSessions.get(sessionId);

        // Build system prompt with context
        const defaultSystemPrompt = `You are PetCareHub AI Assistant, helping users with pet care services, booking, and pet-related questions. 

Context: ${JSON.stringify(context, null, 2)}

Guidelines:
- Be friendly, concise, and helpful
- Focus on pet care and PetCareHub services
- Don't provide medical diagnoses
- Recommend visiting a veterinarian for health concerns
- Keep responses under 200 words unless more detail is requested`;

        const finalSystemPrompt = systemPrompt || defaultSystemPrompt;

        // Add user message to history
        chatHistory.push({ role: 'user', content: message });

        // Keep only last 10 messages (5 exchanges)
        if (chatHistory.length > 10) {
          chatHistory.splice(0, chatHistory.length - 10);
        }

        // Build conversation for Gemini
        let conversationText = finalSystemPrompt + "\n\nConversation:\n";
        chatHistory.forEach((msg, index) => {
          if (index < chatHistory.length - 1) {
            conversationText += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
          }
        });
        conversationText += `\nUser: ${message}\nAssistant:`;

        // Call Gemini API (REST endpoint for better serverless compatibility)
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const geminiResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{ text: conversationText }]
            }]
          })
        });

        if (!geminiResponse.ok) {
          const errorText = await geminiResponse.text();
          throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`);
        }

        const geminiData = await geminiResponse.json();
        const reply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || 
                     'I apologize, but I could not generate a response.';

        // Add assistant response to history
        chatHistory.push({ role: 'assistant', content: reply });

        // Update session
        chatSessions.set(sessionId, chatHistory);

        // Clean up old sessions (keep only last 100)
        if (chatSessions.size > 100) {
          const oldestKey = chatSessions.keys().next().value;
          chatSessions.delete(oldestKey);
        }

        console.log(`✅ AI response generated for session: ${sessionId}`);

        res.status(200).json({
          success: true,
          reply: reply,
          sessionId: sessionId,
          messageCount: chatHistory.length
        });

      } catch (error) {
        console.error('❌ Error generating AI response:', error);
        
        res.status(500).json({
          error: 'Failed to generate AI response',
          message: error.message,
          reply: 'I apologize, but I encountered an error. Please try again.'
        });
      }

      resolve();
    });
  });
};

