/**
 * Backend API Configuration (Render)
 * 
 * This file handles the main Express.js backend deployed on Render
 * Includes: User management, Pets, Services, Bookings, Socket.IO
 */

// ============================================
// BACKEND API URL (Render)
// ============================================

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 
  process.env.NODE_ENV === 'production'
    ? 'https://petcarehub-backend.onrender.com'
    : 'http://localhost:5001';

export const SOCKET_URL = BACKEND_URL;

console.log('🔧 Backend configured:', {
  backendUrl: BACKEND_URL,
  socketUrl: SOCKET_URL,
  environment: process.env.NODE_ENV
});

// ============================================
// API ENDPOINTS
// ============================================

export const API_ENDPOINTS = {
  // Base
  BASE: BACKEND_URL,
  HEALTH: `${BACKEND_URL}/`,
  
  // Users
  USERS: `${BACKEND_URL}/api/users`,
  LOGIN: `${BACKEND_URL}/api/login`,
  USER_BY_ID: (id) => `${BACKEND_URL}/api/users/${id}`,
  
  // Pets
  PETS: `${BACKEND_URL}/api/pets`,
  PET_BY_ID: (id) => `${BACKEND_URL}/api/pets/${id}`,
  
  // Services
  SERVICES: `${BACKEND_URL}/api/services`,
  SERVICE_BY_ID: (id) => `${BACKEND_URL}/api/services/${id}`,
  
  // Providers
  PROVIDERS: `${BACKEND_URL}/api/providers`,
  PROVIDER_PROFILE: (id) => `${BACKEND_URL}/api/providers/${id}/profile`,
  
  // Bookings
  BOOKINGS: `${BACKEND_URL}/api/bookings`,
  BOOKING_BY_ID: (id) => `${BACKEND_URL}/api/bookings/${id}`,
  PET_OWNER_BOOKINGS: (id) => `${BACKEND_URL}/api/bookings/pet-owner/${id}`,
  PROVIDER_BOOKINGS: (id) => `${BACKEND_URL}/api/bookings/provider/${id}`,
  
  // Pet Location Tracking
  PET_LOCATION: `${BACKEND_URL}/api/pet-location`,
  UPDATE_PET_LOCATION: `${BACKEND_URL}/api/update-pet-location`,
  
  // AI Chatbot
  CHATBOT: `${BACKEND_URL}/api/chatbot`,
  
  // Stripe Payments (on Render backend)
  CREATE_CHECKOUT: `${BACKEND_URL}/api/create-checkout-session`,
  PAYMENT_STATUS: (sessionId) => `${BACKEND_URL}/api/payment-status/${sessionId}`,
  USER_PAYMENTS: (userId) => `${BACKEND_URL}/api/payments/${userId}`,
  
  // Disease Prediction
  PREDICT_DISEASE: `${BACKEND_URL}/api/predict-disease`,
  DISEASE_HISTORY: (userId) => `${BACKEND_URL}/api/disease-predictions/${userId}`,
  DISEASE_STATS: (userId) => `${BACKEND_URL}/api/disease-stats/${userId}`,
};

// ============================================
// SOCKET.IO CONFIGURATION
// ============================================

export const SOCKET_CONFIG = {
  url: SOCKET_URL,
  options: {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
    timeout: 20000,
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Make API call to backend
 */
export const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

/**
 * Check backend health
 */
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.HEALTH);
    const data = await response.json();
    console.log('✅ Backend is online:', data);
    return data;
  } catch (error) {
    console.error('❌ Backend health check failed:', error);
    throw error;
  }
};

export default {
  BACKEND_URL,
  SOCKET_URL,
  API_ENDPOINTS,
  SOCKET_CONFIG,
  apiCall,
  checkBackendHealth,
};


