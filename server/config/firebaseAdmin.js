/**
 * Firebase Admin Configuration for Backend
 * 
 * This initializes Firebase Admin SDK for server-side operations
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let firebaseInitialized = false;

/**
 * Initialize Firebase Admin
 */
function initializeFirebaseAdmin() {
  if (firebaseInitialized) {
    console.log('⚠️  Firebase Admin already initialized');
    return admin;
  }

  try {
    let credential;
    
    // Try environment variables first (for Render/production)
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      console.log('🔧 Using Firebase credentials from environment variables');
      
      // Handle the private key - it might have escaped newlines
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      
      credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey
      });
      
      const databaseURL = process.env.FIREBASE_DATABASE_URL || 
                         `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`;
      
      admin.initializeApp({
        credential: credential,
        databaseURL: databaseURL
      });
      
      console.log('✅ Firebase Admin initialized with environment variables');
      console.log('✅ Project ID:', process.env.FIREBASE_PROJECT_ID);
      console.log('✅ Realtime Database URL:', databaseURL);
      
    } else {
      // Fallback to service account file (for local development)
      const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');
      
      if (fs.existsSync(serviceAccountPath)) {
        console.log('🔧 Using Firebase service account file');
        const serviceAccount = require(serviceAccountPath);
        
        const projectId = serviceAccount.project_id;
        const databaseURL = process.env.FIREBASE_DATABASE_URL || 
                           `https://${projectId}-default-rtdb.firebaseio.com`;
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: databaseURL
        });
        
        console.log('✅ Firebase Admin initialized with service account file');
        console.log('✅ Realtime Database URL:', databaseURL);
      } else {
        throw new Error('No Firebase credentials found. Please set environment variables or provide service account file.');
      }
    }
    
    firebaseInitialized = true;
    return admin;
    
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
    console.warn('\n⚠️  Firebase setup options:');
    console.warn('  Production (Render):');
    console.warn('    Set these environment variables:');
    console.warn('    - FIREBASE_PROJECT_ID');
    console.warn('    - FIREBASE_CLIENT_EMAIL');
    console.warn('    - FIREBASE_PRIVATE_KEY');
    console.warn('    - FIREBASE_DATABASE_URL');
    console.warn('');
    console.warn('  Local Development:');
    console.warn('    1. Download service account key from Firebase Console');
    console.warn('    2. Save it as firebase-service-account.json in project root\n');
    throw error;
  }
}

// Initialize on module load
initializeFirebaseAdmin();

// Export admin instance and services (initialized after initializeFirebaseAdmin)
module.exports = {
  admin,
  db: admin.firestore(),
  realtimeDb: admin.database(),
  auth: admin.auth()
};

