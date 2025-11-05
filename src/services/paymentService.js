/**
 * Payment Service
 * Handles Stripe payment processing via Vercel backend
 */

import { createPaymentIntent, storeToFirestore } from '../config/api';
import { db } from '../config/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { notifyPaymentSuccess } from './notificationService';

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
    
    // Get booking details first for notification
    let bookingData = null;
    if (bookingId) {
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingSnap = await getDoc(bookingRef);
      if (bookingSnap.exists()) {
        bookingData = { id: bookingSnap.id, ...bookingSnap.data() };
      }
    }
    
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
    
    // Send payment success notification
    if (bookingData && bookingData.userId) {
      const serviceName = bookingData.serviceName || 'Service';
      const amount = bookingData.amount || 0;
      await notifyPaymentSuccess(bookingData.userId, serviceName, amount).catch(err =>
        console.error('Failed to send payment notification:', err)
      );
    }
    
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

