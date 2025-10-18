/**
 * Firestore Storage API
 * POST /api/store-ai-output
 * 
 * Stores AI responses and other data to Firestore using Firebase Admin SDK
 */

const cors = require('cors');
const admin = require('firebase-admin');

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
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

const corsMiddleware = cors(corsOptions);

// Initialize Firebase Admin (only once)
let firebaseInitialized = false;

function initFirebase() {
  if (firebaseInitialized) return;
  
  try {
    // Check if already initialized
    if (admin.apps.length === 0) {
      // Use service account from environment variable
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
      
      if (serviceAccount) {
        // Parse service account JSON
        const credentials = JSON.parse(serviceAccount);
        
        admin.initializeApp({
          credential: admin.credential.cert(credentials),
          databaseURL: `https://${credentials.project_id}-default-rtdb.firebaseio.com`
        });
        
        console.log('✅ Firebase Admin initialized from environment variable');
      } else {
        console.error('❌ FIREBASE_SERVICE_ACCOUNT not found in environment');
        throw new Error('Firebase service account not configured');
      }
    }
    
    firebaseInitialized = true;
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw error;
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

      try {
        // Initialize Firebase if needed
        initFirebase();
        
        const db = admin.firestore();

        // Handle POST - Store data
        if (req.method === 'POST') {
          const {
            collection = 'ai_responses',
            data,
            userId,
            sessionId,
            metadata = {}
          } = req.body;

          // Validate input
          if (!data) {
            res.status(400).json({
              error: 'Missing required field: data'
            });
            return resolve();
          }

          // Prepare document data
          const docData = {
            ...data,
            userId: userId || null,
            sessionId: sessionId || null,
            metadata: {
              ...metadata,
              source: 'external-api',
              environment: process.env.VERCEL_ENV || 'development'
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };

          // Store in Firestore
          const docRef = await db.collection(collection).add(docData);

          console.log(`✅ Data stored in Firestore: ${collection}/${docRef.id}`);

          res.status(200).json({
            success: true,
            documentId: docRef.id,
            collection: collection,
            message: 'Data stored successfully'
          });

        // Handle GET - Retrieve data
        } else if (req.method === 'GET') {
          const { collection = 'ai_responses', documentId, userId, limit = 10 } = req.query;

          // Get specific document
          if (documentId) {
            const docRef = db.collection(collection).doc(documentId);
            const doc = await docRef.get();

            if (!doc.exists) {
              res.status(404).json({
                error: 'Document not found',
                documentId: documentId
              });
              return resolve();
            }

            res.status(200).json({
              success: true,
              documentId: doc.id,
              data: doc.data()
            });
          }
          // Get documents by userId
          else if (userId) {
            const snapshot = await db.collection(collection)
              .where('userId', '==', userId)
              .orderBy('createdAt', 'desc')
              .limit(parseInt(limit))
              .get();

            const documents = [];
            snapshot.forEach(doc => {
              documents.push({
                id: doc.id,
                ...doc.data()
              });
            });

            res.status(200).json({
              success: true,
              count: documents.length,
              documents: documents
            });
          }
          // Get recent documents
          else {
            const snapshot = await db.collection(collection)
              .orderBy('createdAt', 'desc')
              .limit(parseInt(limit))
              .get();

            const documents = [];
            snapshot.forEach(doc => {
              documents.push({
                id: doc.id,
                ...doc.data()
              });
            });

            res.status(200).json({
              success: true,
              count: documents.length,
              documents: documents
            });
          }
        } else {
          res.status(405).json({ error: 'Method not allowed' });
        }

      } catch (error) {
        console.error('❌ Firestore operation error:', error);
        
        res.status(500).json({
          error: 'Firestore operation failed',
          message: error.message
        });
      }

      resolve();
    });
  });
};

