/**
 * Gemini AI Response Generator
 * POST /api/generate-ai-response
 * 
 * Generates AI responses using Google Gemini with Firestore context
 */

const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// TEMPORARY: Skip Firebase Admin - just use hardcoded data or accept from frontend
// This avoids Firestore permission issues
const USE_FIREBASE_ADMIN = false;

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

// Initialize Firebase Admin (only if enabled)
if (USE_FIREBASE_ADMIN && !require('firebase-admin').apps.length) {
  const admin = require('firebase-admin');
  try {
    // Check if we have base64-encoded or regular JSON service account
    const serviceAccountB64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (!serviceAccountB64 && !serviceAccountStr) {
      console.error('⚠️ No Firebase credentials found in env vars');
    } else {
      let serviceAccount;
      
      // Try base64-encoded version first (more reliable for newlines)
      if (serviceAccountB64) {
        console.log('🔑 Using base64-encoded service account');
        const decoded = Buffer.from(serviceAccountB64, 'base64').toString('utf-8');
        serviceAccount = JSON.parse(decoded);
      } else {
        console.log('🔑 Using JSON string service account');
        serviceAccount = JSON.parse(serviceAccountStr);
        
        // Fix newlines in private key
        if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
          // Replace literal \n with actual newlines
          serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
      }
      
      // Validate the service account has required fields
      if (!serviceAccount.private_key || !serviceAccount.client_email) {
        throw new Error('Invalid service account: missing private_key or client_email');
      }
      
      // Initialize Firebase Admin
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id || 'fyppp-5b4f0'
      });
      
      console.log('✅ Firebase Admin initialized successfully!');
      console.log('📋 Project ID:', serviceAccount.project_id);
      console.log('📧 Client Email:', serviceAccount.client_email);
    }
  } catch (error) {
    console.error('⚠️ Firebase Admin init failed:', error.message);
    console.error('Full error:', error);
  }
}

const db = null; // Disabled for now - will get data from frontend context instead

// In-memory session storage (for serverless, consider using Redis in production)
const chatSessions = new Map();

/**
 * Fetch real-time data from Firestore to provide context
 */
async function fetchDatabaseContext() {
  if (!db) {
    console.warn('⚠️ Firestore not available, using generic context');
    return { providers: [], services: [], bookings: [], stats: null };
  }

  try {
    // Fetch ONLY active services to filter out demo data
    const servicesSnapshot = await db.collection('services')
      .where('isActive', '==', true)
      .limit(50)
      .get();
    
    console.log(`📊 Found ${servicesSnapshot.size} ACTIVE services in Firestore`);
    
    const services = [];
    const providerIds = new Set();
    
    servicesSnapshot.forEach(doc => {
      const data = doc.data();
      // Log each service for debugging
      console.log(`Service: ${data.name} - ₨${data.price} (Provider: ${data.providerId || data.provider_name})`);
      
      services.push({
        id: doc.id,
        name: data.name || 'Unknown Service',
        price: data.price || 0,
        category: data.category || 'general',
        providerId: data.providerId || data.provider_id,
        providerName: data.provider_name || data.providerName,
        description: data.description || ''
      });
      if (data.providerId) providerIds.add(data.providerId);
      if (data.provider_id) providerIds.add(data.provider_id);
    });

    // Fetch provider details - try both exact ID match and originalId match
    const providers = [];
    if (providerIds.size > 0) {
      // First, try to get providers by document ID
      const providerPromises = Array.from(providerIds).map(id => 
        db.collection('users').doc(id).get()
      );
      const providerDocs = await Promise.all(providerPromises);
      
      providerDocs.forEach(doc => {
        if (doc.exists) {
          const data = doc.data();
          providers.push({
            id: doc.id,
            name: data.name || 'Unknown Provider',
            address: data.address || 'Location not specified',
            phone: data.phone || '',
            role: data.role || 'provider'
          });
        }
      });
      
      // Also try to match by originalId (for migrated data)
      for (const id of providerIds) {
        if (id.startsWith('user_')) {
          const originalId = parseInt(id.replace('user_', ''));
          if (!isNaN(originalId)) {
            const querySnapshot = await db.collection('users')
              .where('originalId', '==', originalId)
              .limit(1)
              .get();
            
            querySnapshot.forEach(doc => {
              const data = doc.data();
              if (!providers.find(p => p.id === doc.id)) {
                providers.push({
                  id: doc.id,
                  name: data.name || 'Unknown Provider',
                  address: data.address || 'Location not specified',
                  phone: data.phone || '',
                  role: data.role || 'provider'
                });
              }
            });
          }
        }
      }
    }

    // Get booking statistics
    const bookingsSnapshot = await db.collection('bookings')
      .limit(100)
      .get();
    
    let totalBookings = 0;
    let confirmedBookings = 0;
    
    bookingsSnapshot.forEach(doc => {
      const data = doc.data();
      totalBookings++;
      if (data.status === 'confirmed') confirmedBookings++;
    });

    return {
      services,
      providers,
      stats: {
        total_bookings: totalBookings,
        confirmed_bookings: confirmedBookings
      }
    };
  } catch (error) {
    console.error('❌ Error fetching database context:', error);
    return { providers: [], services: [], stats: null };
  }
}

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

        // Use context data passed from frontend (which has Firestore access)
        console.log('📊 Using context data from request...');
        const dbContext = context.firestoreData || { services: [], providers: [], stats: null };
        
        console.log(`   - Services found: ${dbContext.services?.length || 0}`);
        console.log(`   - Providers found: ${dbContext.providers?.length || 0}`);
        
        // Build context text with real data
        let contextText = "Current PetCareHub Platform Data:\n\n";
        
        // Add providers/clinics info with business hours
        if (dbContext.providers.length > 0) {
          contextText += "Available Service Providers:\n";
          dbContext.providers.forEach((provider, index) => {
            const address = provider.address || 'Location not specified';
            const phone = provider.phone || 'No phone';
            contextText += `${index + 1}. ${provider.name} - ${address}`;
            
            // Add phone if available
            if (provider.phone) {
              contextText += ` | Phone: ${phone}`;
            }
            
            // Add business hours if available
            if (provider.businessHours && Object.keys(provider.businessHours).length > 0) {
              contextText += `\n   Business Hours:\n`;
              const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
              days.forEach(day => {
                const hours = provider.businessHours[day];
                if (hours && hours.isOpen) {
                  contextText += `   - ${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours.open} - ${hours.close}\n`;
                } else if (hours && !hours.isOpen) {
                  contextText += `   - ${day.charAt(0).toUpperCase() + day.slice(1)}: Closed\n`;
                }
              });
            } else {
              contextText += `\n   Business Hours: Not specified\n`;
            }
            contextText += "\n";
          });
        }
        
        // Add services info with provider names
        if (dbContext.services.length > 0) {
          contextText += "Available Services:\n";
          dbContext.services.forEach((service, index) => {
            const provider = dbContext.providers.find(p => p.id === service.providerId);
            const providerName = provider ? provider.name : (service.providerName || 'Unknown Provider');
            const price = service.price ? `₨${service.price}` : 'Price on request';
            contextText += `${index + 1}. ${service.name} by ${providerName} - ${price}\n`;
          });
          contextText += "\n";
        } else {
          console.warn('⚠️ No services found in Firestore');
        }
        
        // Add booking stats
        if (dbContext.stats) {
          contextText += `Platform Stats: ${dbContext.stats.total_bookings} total bookings, ${dbContext.stats.confirmed_bookings} confirmed\n\n`;
        }

        console.log('✅ Context built with real data');

        // Build comprehensive system prompt with real data
        const defaultSystemPrompt = `You are PetCareHub AI Assistant. 

${contextText}

CRITICAL INSTRUCTIONS: 
- When users ask about services or pricing, ALWAYS use the EXACT provider names and prices from the data above
- DO NOT give generic answers - reference the specific data provided
- If a service exists in the list, tell the user the exact provider name and price
- If a service doesn't exist, politely say we don't currently offer that service

PROVIDER TIMINGS & AVAILABILITY:
- When users ask about provider timings, availability, or operating hours, refer to the Business Hours listed above
- Clearly state which days the provider is open and what their hours are
- If business hours are not specified, mention that they should contact the provider directly
- Example: "Dr. Smith's clinic is open Monday-Friday 9:00 AM to 5:00 PM, and Saturday 10:00 AM to 3:00 PM. They're closed on Sundays."

ANIMAL TYPE CLARIFICATION:
- When users ask about a service (grooming, veterinary care, training, etc.), ALWAYS ask what type of animal they have
- Ask: "Is this for a dog, cat, or another type of animal?" or similar natural questions
- This helps provide more specific and accurate service recommendations
- Different animals may require different services or have different pricing
- Examples of when to ask:
  * User: "I need grooming services" → You: "I'd be happy to help! Is this for a dog, cat, or another type of animal?"
  * User: "What veterinary services do you offer?" → You: "We offer various veterinary services. Could you tell me what type of pet you have - a dog, cat, or another animal?"
  * User: "How much does training cost?" → You: "I can help with that! First, could you let me know what type of animal you're looking to train?"

You help users with:
- Tracking their pets using GPS
- Finding nearby clinics and booking services  
- Answering FAQs about pets and pet care
- Guiding users about our platform features
- Providing information about provider availability and timings

IMPORTANT SAFETY AND BEHAVIOR RULES:
- Do NOT provide medical diagnoses or specific medical advice
- Always recommend visiting a veterinarian for serious health issues or concerns
- Keep answers friendly, conversational, and directly related to PetCareHub services
- Never answer questions unrelated to pets, clinics, or services - redirect politely back to PetCareHub topics
- If asked about non-pet topics, respond: "I'm here to help with pet care and PetCareHub services. How can I assist you with your pet's needs today?"

Always use the real data provided in your context when answering questions about our platform.`;

        const finalSystemPrompt = systemPrompt || defaultSystemPrompt;

        // Get or initialize chat history
        if (!chatSessions.has(sessionId)) {
          chatSessions.set(sessionId, []);
        }
        const chatHistory = chatSessions.get(sessionId);

        // Add user message to history
        chatHistory.push({ role: 'user', content: message });

        // Keep only last 10 messages (5 exchanges)
        if (chatHistory.length > 10) {
          chatHistory.splice(0, chatHistory.length - 10);
        }

        // Initialize Gemini AI
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Get the model - using gemini-2.0-flash-exp (latest, better performance)
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Build conversation for Gemini
        let conversationText = finalSystemPrompt + "\n\nConversation:\n";
        chatHistory.forEach((msg, index) => {
          if (index < chatHistory.length - 1) {
            conversationText += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
          }
        });
        conversationText += `\nUser: ${message}\nAssistant:`;

        // Generate response using the SDK
        const result = await model.generateContent(conversationText);
        const response = await result.response;
        const reply = response.text() || 'I apologize, but I could not generate a response.';

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

