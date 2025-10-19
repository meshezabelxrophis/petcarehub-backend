/**
 * Payment Service
 * Handles Stripe payment processing via Vercel backend
 */

import { createPaymentIntent, storeToFirestore } from '../config/api';
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

/**
 * Process payment for a booking
 * @param {Object} bookingData - Booking information
 * @returns {Promise<Object>} Payment intent with client secret
 */
export const processPayment = async (bookingData) => {
  const {
    bookingId,
    serviceId,
    serviceName,
    amount,
    currency = 'usd',
    userId
  } = bookingData;
  
  try {
    console.log('🔄 Processing payment...', { bookingId, amount });
    
    // Create payment intent via Vercel backend
    const paymentIntent = await createPaymentIntent({
      amount,
      currency,
      serviceName,
      serviceId,
      bookingId,
      metadata: {
        bookingId,
        serviceId,
        userId
      }
    });
    
    // Update booking with payment intent ID in Firestore (Firebase direct)
    if (bookingId) {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        paymentIntentId: paymentIntent.paymentIntentId,
        paymentStatus: 'pending',
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Booking updated with payment intent');
    }
    
    // Store payment record via backend (will save to Firestore)
    await storeToFirestore('payment_intents', {
      paymentIntentId: paymentIntent.paymentIntentId,
      bookingId,
      serviceId,
      serviceName,
      amount,
      currency,
      status: 'pending'
    }, {
      sessionId: `payment_${bookingId}`,
      type: 'payment_intent'
    });
    
    console.log('✅ Payment processing complete');
    
    return {
      success: true,
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId
    };
  } catch (error) {
    console.error('❌ Payment processing failed:', error);
    throw error;
  }
};

/**
 * Confirm payment completion
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @param {string} bookingId - Associated booking ID
 */
export const confirmPayment = async (paymentIntentId, bookingId) => {
  try {
    console.log('🔄 Confirming payment...', { paymentIntentId, bookingId });
    
    // Update booking payment status in Firestore (Firebase direct)
    if (bookingId) {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        paymentStatus: 'completed',
        paymentConfirmedAt: new Date().toISOString(),
        status: 'confirmed',
        updatedAt: new Date().toISOString()
      });
    }
    
    // Store payment confirmation via backend
    await storeToFirestore('payment_confirmations', {
      paymentIntentId,
      bookingId,
      status: 'completed',
      confirmedAt: new Date().toISOString()
    }, {
      sessionId: `payment_confirm_${bookingId}`,
      type: 'payment_confirmation'
    });
    
    console.log('✅ Payment confirmed');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Payment confirmation failed:', error);
    throw error;
  }
};

export default {
  processPayment,
  confirmPayment
};

