/**
 * Backend Notification Service
 * Creates notifications in Firestore for users
 */

const { db } = require('../config/firebaseAdmin');
const { UserService } = require('./firestoreService');

/**
 * Get Firebase Auth UID from user ID (handles both numeric IDs and Firebase UIDs)
 */
async function getFirebaseUID(userId) {
  if (!userId) return null;
  
  // If it's already a Firebase UID (long string), return it
  if (typeof userId === 'string' && userId.length > 20) {
    return userId;
  }
  
  // Otherwise, try to find user by originalId or uid
  try {
    const usersRef = db.collection('users');
    
    // Try to find by Firebase UID first
    const userDoc = await usersRef.doc(String(userId)).get();
    if (userDoc.exists) {
      return userDoc.id;
    }
    
    // Try to find by originalId (numeric ID)
    const querySnapshot = await usersRef
      .where('originalId', '==', Number(userId))
      .limit(1)
      .get();
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id; // Return the Firebase UID (document ID)
    }
    
    // If numeric, try as string
    const querySnapshot2 = await usersRef
      .where('originalId', '==', String(userId))
      .limit(1)
      .get();
    
    if (!querySnapshot2.empty) {
      return querySnapshot2.docs[0].id;
    }
    
    console.warn(`⚠️  Could not find Firebase UID for user ID: ${userId}`);
    return String(userId); // Fallback to original ID
  } catch (error) {
    console.error('❌ Error looking up user ID:', error);
    return String(userId); // Fallback
  }
}

/**
 * Send notification via Firestore
 * @param {string} recipientUserId - User ID to send notification to (can be numeric or Firebase UID)
 * @param {Object} notificationData - Notification data
 */
async function sendNotification(recipientUserId, notificationData) {
  try {
    const {
      title,
      body,
      type, // 'like', 'comment', 'geofence', 'booking', 'payment', 'provider_booking'
      relatedId, // postId, bookingId, petId, etc.
      senderName,
      imageUrl,
    } = notificationData;

    if (!recipientUserId) {
      console.warn('⚠️  No recipientUserId provided for notification');
      return false;
    }

    // Get Firebase Auth UID
    const firebaseUID = await getFirebaseUID(recipientUserId);
    
    if (!firebaseUID) {
      console.warn(`⚠️  Could not resolve Firebase UID for: ${recipientUserId}`);
      return false;
    }

    // Create notification document
    const notificationRef = db.collection('notifications').doc(`${firebaseUID}_${Date.now()}`);
    
    await notificationRef.set({
      userId: firebaseUID,
      title,
      body,
      type,
      relatedId: relatedId || null,
      senderName: senderName || 'PetCare Hub',
      imageUrl: imageUrl || null,
      read: false,
      createdAt: new Date().toISOString(),
    });

    console.log(`✅ Notification sent to user: ${firebaseUID} (original ID: ${recipientUserId})`);
    return true;
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    return false;
  }
}

/**
 * Notify user that booking was created/confirmed
 */
async function notifyBookingConfirmed(userId, serviceName, bookingDate) {
  if (!userId) return false;
  
  const formattedDate = new Date(bookingDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  return sendNotification(userId, {
    title: '✅ Booking Confirmed',
    body: `Your ${serviceName} appointment on ${formattedDate} has been confirmed!`,
    type: 'booking',
    relatedId: null,
    senderName: 'PetCare Hub',
  });
}

/**
 * Notify provider of new booking
 */
async function notifyProviderNewBooking(providerId, customerName, serviceName, bookingDate) {
  if (!providerId) return false;
  
  const formattedDate = new Date(bookingDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  return sendNotification(providerId, {
    title: '📅 New Booking',
    body: `New booking from ${customerName} for ${serviceName} on ${formattedDate}`,
    type: 'provider_booking',
    relatedId: null,
    senderName: customerName,
  });
}

/**
 * Notify pet owner when provider confirms booking
 */
async function notifyProviderConfirmedBooking(ownerId, providerName, serviceName, bookingDate) {
  if (!ownerId) return false;
  
  const formattedDate = new Date(bookingDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  return sendNotification(ownerId, {
    title: '✅ Provider Confirmed',
    body: `${providerName} confirmed your ${serviceName} appointment on ${formattedDate}`,
    type: 'booking',
    relatedId: null,
    senderName: providerName,
  });
}

module.exports = {
  sendNotification,
  notifyBookingConfirmed,
  notifyProviderNewBooking,
  notifyProviderConfirmedBooking,
};

