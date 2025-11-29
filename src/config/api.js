/**
 * API Configuration
 * 
 * This file centralizes all API endpoints and defines:
 * - Firebase handles: Auth, Realtime DB (GPS/Chat), Firestore, Cloud Functions
 * - Vercel Backend handles: Stripe payments, Gemini AI
 */

import { auth } from './firebase';

// ============================================
// VERCEL BACKEND API (External APIs)
// ============================================

// Vercel API Base URL - Production URL (always points to latest deployment)
// This is the production alias URL that automatically points to the latest successful deployment
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
  'https://petcarehub-external-api.vercel.app/api';

/**
 * Get Firebase Auth token for authenticated API calls
 */
const getAuthToken = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return null; // Return null instead of throwing - API doesn't require auth
    }
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.warn('Could not get auth token (continuing without auth):', error);
    return null; // Return null instead of throwing
  }
};

/**
 * Make authenticated API call to Vercel backend
 */
const authenticatedFetch = async (endpoint, options = {}) => {
  try {
    // Get Firebase auth token (optional)
    const token = await getAuthToken();
    
    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'Origin': window.location.origin,
      ...options.headers
    };
    
    // Add auth header only if token is available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Make request
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log('🌐 Making API request to:', fullUrl);
    
    const response = await fetch(fullUrl, {
      ...options,
      headers
    });
    
    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Non-JSON response received:', text.substring(0, 200));
      
      // Check for Vercel authentication protection
      if (text.includes('Vercel Authentication') || text.includes('Authentication Required')) {
        throw new Error('Vercel Deployment Protection is enabled. Please disable it in Vercel Dashboard > Settings > Deployment Protection.');
      }
      
      // If it's HTML, likely a 404 or error page
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<!doctype')) {
        throw new Error(`API endpoint not found (${response.status}). The service may not be deployed.`);
      }
      
      throw new Error(`Server returned ${contentType || 'unknown content type'} instead of JSON. Status: ${response.status}`);
    }
    
    // Handle response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `API request failed: ${response.status}`;
      console.error('❌ API request failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
        url: fullUrl
      });
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('✅ API request successful:', { endpoint, url: fullUrl });
    return data;
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('❌ Network error - API may be unreachable:', {
        endpoint,
        url: `${API_BASE_URL}${endpoint}`,
        error: error.message
      });
      throw new Error('Unable to reach the API service. Please check your connection or try again later.');
    }
    
    console.error('❌ API request error:', {
      error: error.message,
      endpoint,
      url: `${API_BASE_URL}${endpoint}`,
      type: error.name
    });
    throw error;
  }
};

// ============================================
// STRIPE PAYMENT API (Vercel Backend)
// ============================================

/**
 * Create Stripe payment intent
 * @param {Object} paymentData - Payment details
 * @returns {Promise<Object>} Payment intent data with clientSecret
 */
export const createPaymentIntent = async (paymentData) => {
  const {
    amount,
    currency = 'usd',
    serviceName,
    serviceId,
    bookingId,
    metadata = {}
  } = paymentData;
  
  try {
    const result = await authenticatedFetch('/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        currency,
        serviceName,
        serviceId,
        userId: auth.currentUser?.uid,
        bookingId,
        metadata
      })
    });
    
    console.log('✅ Payment intent created:', result.paymentIntentId);
    return result;
  } catch (error) {
    console.error('❌ Payment intent creation failed:', error);
    throw error;
  }
};

// ============================================
// GEMINI AI API (Vercel Backend)
// ============================================

/**
 * Generate AI response using Gemini
 * @param {string} message - User message
 * @param {string} sessionId - Chat session ID
 * @param {Object} context - Additional context
 * @returns {Promise<Object>} AI response
 */
export const generateAIResponse = async (message, sessionId, context = {}) => {
  try {
    const result = await authenticatedFetch('/generate-ai-response', {
      method: 'POST',
      body: JSON.stringify({
        message,
        sessionId,
        context: {
          ...context,
          userId: auth.currentUser?.uid,
          userEmail: auth.currentUser?.email
        }
      })
    });
    
    console.log('✅ AI response generated');
    return result;
  } catch (error) {
    console.error('❌ AI response generation failed:', error);
    throw error;
  }
};

/**
 * Analyze image using Gemini Vision
 * @param {string} imageData - Base64 image data or URL
 * @param {string} prompt - Analysis prompt
 * @returns {Promise<Object>} Analysis result
 */
export const analyzeImage = async (imageData, prompt = 'Analyze this image') => {
  try {
    const result = await authenticatedFetch('/generate-ai-response', {
      method: 'POST',
      body: JSON.stringify({
        message: prompt,
        sessionId: `image_analysis_${Date.now()}`,
        context: {
          type: 'image_analysis',
          imageData,
          userId: auth.currentUser?.uid
        }
      })
    });
    
    console.log('✅ Image analyzed');
    return result;
  } catch (error) {
    console.error('❌ Image analysis failed:', error);
    throw error;
  }
};

// ============================================
// FIRESTORE STORAGE API (Vercel Backend)
// ============================================

/**
 * Store data to Firestore via backend
 * @param {string} collection - Firestore collection name
 * @param {Object} data - Data to store
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Document ID and success status
 */
export const storeToFirestore = async (collection, data, metadata = {}) => {
  try {
    const result = await authenticatedFetch('/store-ai-output', {
      method: 'POST',
      body: JSON.stringify({
        collection,
        data: {
          ...data,
          userId: auth.currentUser?.uid,
          userEmail: auth.currentUser?.email,
          timestamp: new Date().toISOString()
        },
        userId: auth.currentUser?.uid,
        sessionId: metadata.sessionId || `session_${Date.now()}`,
        metadata: {
          ...metadata,
          source: 'vercel-backend'
        }
      })
    });
    
    console.log('✅ Data stored to Firestore:', result.documentId);
    return result;
  } catch (error) {
    console.error('❌ Firestore storage failed:', error);
    throw error;
  }
};

/**
 * Retrieve data from Firestore via backend
 * @param {string} collection - Firestore collection name
 * @param {Object} query - Query parameters
 * @returns {Promise<Object>} Retrieved documents
 */
export const retrieveFromFirestore = async (collection, query = {}) => {
  try {
    const queryParams = new URLSearchParams({
      collection,
      userId: auth.currentUser?.uid,
      limit: query.limit || 10,
      ...query
    });
    
    const result = await authenticatedFetch(`/store-ai-output?${queryParams}`, {
      method: 'GET'
    });
    
    console.log('✅ Data retrieved from Firestore:', result.count, 'documents');
    return result;
  } catch (error) {
    console.error('❌ Firestore retrieval failed:', error);
    throw error;
  }
};

// ============================================
// API HEALTH CHECK
// ============================================

/**
 * Check API health status
 * @returns {Promise<Object>} API status
 */
export const checkAPIHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      headers: {
        'Origin': window.location.origin
      }
    });
    
    if (!response.ok) {
      throw new Error('API health check failed');
    }
    
    const data = await response.json();
    console.log('✅ API is healthy:', data);
    return data;
  } catch (error) {
    console.error('❌ API health check failed:', error);
    throw error;
  }
};

// ============================================
// FIREBASE SERVICES (Direct Access)
// ============================================

/**
 * Firebase services are accessed directly via:
 * - Authentication: import { auth } from './firebase'
 * - Firestore: import { db } from './firebase'
 * - Realtime DB: import { realtimeDb } from './firebase'
 * - Storage: import { storage } from './firebase'
 * 
 * Use Cases:
 * - User authentication: auth.signInWithEmailAndPassword()
 * - Real-time GPS tracking: realtimeDb.ref('locations')
 * - Real-time chat: realtimeDb.ref('chats')
 * - Bookings & user data: db.collection('bookings')
 * - Notifications: Cloud Functions (auto-triggered)
 */

export default {
  // Vercel Backend APIs
  createPaymentIntent,
  generateAIResponse,
  analyzeImage,
  storeToFirestore,
  retrieveFromFirestore,
  checkAPIHealth,
  
  // Configuration
  API_BASE_URL
};

