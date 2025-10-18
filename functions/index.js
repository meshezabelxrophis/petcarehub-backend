const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();
const realtimeDb = admin.database();

/**
 * IMPORTANT: These functions are designed for Firebase Spark (Free) Plan
 * - No outbound network requests to paid services
 * - Limited to Firebase services only
 * - Resource limits: 125K invocations/month, 40K GB-seconds, 40K CPU-seconds
 */

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * Returns distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// ============================================================================
// Authentication Triggers
// ============================================================================

/**
 * Create user profile on signup
 * Triggered when a new user is created via Firebase Auth
 *
 * NOTE: This is a FALLBACK function. The client-side authService.js
 * creates the user document directly with proper role assignment.
 * This function only runs if the client-side creation fails.
 */
exports.createUserProfile = functions.auth.user().onCreate(async (user) => {
  try {
    // Check if user document already exists (created by client)
    const userDoc = await db.collection('users').doc(user.uid).get();

    if (userDoc.exists) {
      console.log(`User profile already exists for ${user.uid} - skipping creation`);
      return null;
    }

    // Fallback: Create basic user profile
    console.log(`Creating fallback user profile for ${user.uid}`);

    const userProfile = {
      id: user.uid,
      uid: user.uid,
      email: user.email,
      name: user.displayName || user.email?.split('@')[0] || 'User',
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      photoURL: user.photoURL || '',
      role: 'petOwner', // Default role for fallback
      accountType: 'petOwner',
      phone: '',
      address: '',
      bio: '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      profileComplete: false,
    };

    await db.collection('users').doc(user.uid).set(userProfile);

    console.log(`✅ Fallback user profile created for ${user.uid} with role: petOwner`);
    return null;
  } catch (error) {
    console.error('❌ Error creating user profile:', error);
    return null;
  }
});

/**
 * Set custom claims for role-based access
 * This allows role checking in security rules without extra Firestore reads
 */
exports.setUserClaims = functions.firestore
    .document('users/{userId}')
    .onCreate(async (snap, context) => {
      try {
        const userData = snap.data();
        const userId = context.params.userId;
        const role = userData.role || 'petOwner';

        // Set custom claims for the user
        await admin.auth().setCustomUserClaims(userId, {
          role: role,
          accountType: role,
        });

        console.log(`✅ Custom claims set for user ${userId}: role=${role}`);
        return null;
      } catch (error) {
        console.error('❌ Error setting custom claims:', error);
        return null;
      }
    });

/**
 * Update custom claims when user role changes
 */
exports.updateUserClaims = functions.firestore
    .document('users/{userId}')
    .onUpdate(async (change, context) => {
      try {
        const beforeData = change.before.data();
        const afterData = change.after.data();
        const userId = context.params.userId;

        // Check if role changed
        if (beforeData.role !== afterData.role) {
          const newRole = afterData.role || 'petOwner';

          // Update custom claims
          await admin.auth().setCustomUserClaims(userId, {
            role: newRole,
            accountType: newRole,
          });

          console.log(`✅ Custom claims updated for user ${userId}: role=${newRole}`);
        }

        return null;
      } catch (error) {
        console.error('❌ Error updating custom claims:', error);
        return null;
      }
    });

/**
 * Clean up user data on account deletion
 * Triggered when a user is deleted
 */
exports.cleanupUserData = functions.auth.user().onDelete(async (user) => {
  try {
    const batch = db.batch();

    // Delete user profile
    batch.delete(db.collection('users').doc(user.uid));

    // Delete user's pets
    const petsSnapshot = await db.collection('pets')
        .where('ownerId', '==', user.uid)
        .get();

    petsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete user's bookings
    const bookingsSnapshot = await db.collection('bookings')
        .where('userId', '==', user.uid)
        .get();

    bookingsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    console.log(`User data cleaned up for ${user.uid}`);
    return null;
  } catch (error) {
    console.error('Error cleaning up user data:', error);
    return null;
  }
});

// ============================================================================
// Firestore Triggers
// ============================================================================

/**
 * Update service rating when a new review is added
 */
exports.updateServiceRating = functions.firestore
    .document('reviews/{reviewId}')
    .onCreate(async (snap, context) => {
      try {
        const review = snap.data();
        const serviceId = review.serviceId;

        if (!serviceId) return null;

        // Get all reviews for this service
        const reviewsSnapshot = await db.collection('reviews')
            .where('serviceId', '==', serviceId)
            .get();

        // Calculate average rating
        let totalRating = 0;
        let count = 0;

        reviewsSnapshot.forEach((doc) => {
          totalRating += doc.data().rating;
          count++;
        });

        const averageRating = count > 0 ? totalRating / count : 0;

        // Update service document
        await db.collection('services').doc(serviceId).update({
          rating: averageRating,
          reviewCount: count,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`Updated rating for service ${serviceId}: ${averageRating}`);
        return null;
      } catch (error) {
        console.error('Error updating service rating:', error);
        return null;
      }
    });

/**
 * Send notification when booking status changes
 */
exports.onBookingStatusChange = functions.firestore
    .document('bookings/{bookingId}')
    .onUpdate(async (change, context) => {
      try {
        const before = change.before.data();
        const after = change.after.data();

        // Check if status changed
        if (before.status === after.status) {
          return null;
        }

        const bookingId = context.params.bookingId;
        const userId = after.userId;
        const providerId = after.providerId;
        const newStatus = after.status;

        // Create notification for user
        await db.collection('notifications').add({
          userId: userId,
          type: 'booking_status_change',
          title: 'Booking Status Updated',
          message: `Your booking status has been changed to: ${newStatus}`,
          bookingId: bookingId,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Also notify the provider (for future enhancement)
        if (providerId) {
          await db.collection('notifications').add({
            userId: providerId,
            type: 'booking_status_change',
            title: 'Booking Updated',
            message: `Booking status changed to: ${newStatus}`,
            bookingId: bookingId,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        console.log(`Notification sent for booking ${bookingId}`);
        return null;
      } catch (error) {
        console.error('Error sending notification:', error);
        return null;
      }
    });

/**
 * Update conversation's last message
 */
exports.updateConversationLastMessage = functions.firestore
    .document('messages/{messageId}')
    .onCreate(async (snap, context) => {
      try {
        const message = snap.data();
        const conversationId = message.conversationId;

        if (!conversationId) return null;

        await db.collection('conversations').doc(conversationId).update({
          lastMessage: message.text,
          lastMessageTime: message.timestamp,
          lastMessageSender: message.senderId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return null;
      } catch (error) {
        console.error('Error updating conversation:', error);
        return null;
      }
    });

// ============================================================================
// Booking Triggers (NEW)
// ============================================================================

/**
 * Notify clinic/provider when a new booking is created
 * Triggered when a booking document is created in Firestore
 */
exports.onBookingCreate = functions.firestore
    .document('bookings/{bookingId}')
    .onCreate(async (snap, context) => {
      try {
        const booking = snap.data();
        const bookingId = context.params.bookingId;
        const providerId = booking.providerId;
        const userId = booking.userId;

        if (!providerId) {
          console.log('No providerId found for booking:', bookingId);
          return null;
        }

        // Get user details
        const userDoc = await db.collection('users').doc(userId).get();
        const userName = userDoc.exists ? userDoc.data().name : 'A user';

        // Get service details
        let serviceName = 'a service';
        if (booking.serviceId) {
          const serviceDoc = await db.collection('services').doc(booking.serviceId).get();
          if (serviceDoc.exists) {
            serviceName = serviceDoc.data().name || serviceName;
          }
        }

        // Create notification in Firestore for the provider
        await db.collection('notifications').add({
          userId: providerId,
          type: 'new_booking',
          title: '🎉 New Booking Request',
          message: `${userName} booked ${serviceName} on ${booking.date || 'a selected date'}`,
          bookingId: bookingId,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Add activity to provider's Realtime Database activity feed
        const activityRef = realtimeDb.ref(`activity_feed/${providerId}`).push();
        await activityRef.set({
          type: 'booking',
          message: `New booking from ${userName} for ${serviceName}`,
          timestamp: admin.database.ServerValue.TIMESTAMP,
          read: false,
          bookingId: bookingId,
          userId: userId,
        });

        console.log(`✅ Booking notification sent to provider ${providerId} for booking ${bookingId}`);
        return null;
      } catch (error) {
        console.error('❌ Error notifying provider of new booking:', error);
        return null;
      }
    });

// ============================================================================
// Realtime Database Triggers
// ============================================================================

/**
 * Log pet location updates for tracking history
 */
exports.logPetLocationUpdate = functions.database
    .ref('/petLocations/{petId}')
    .onUpdate(async (change, context) => {
      try {
        const petId = context.params.petId;
        const location = change.after.val();

        // Store location history in Firestore for long-term storage
        await db.collection('petLocationHistory').add({
          petId: petId,
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: location.timestamp,
          accuracy: location.accuracy || null,
          battery: location.battery || null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return null;
      } catch (error) {
        console.error('Error logging pet location:', error);
        return null;
      }
    });

/**
 * Check if pet left safe zone and trigger alert
 * Triggered when GPS location is updated in Realtime Database
 */
exports.onGpsUpdate = functions.database
    .ref('/gps_tracking/{petId}')
    .onUpdate(async (change, context) => {
      try {
        const petId = context.params.petId;
        const newLocation = change.after.val();
        const lat = newLocation.lat;
        const lng = newLocation.lng;

        if (!lat || !lng) {
          console.log('Invalid GPS data for pet:', petId);
          return null;
        }

        // Get pet details from Firestore
        const petDoc = await db.collection('pets').doc(petId).get();
        if (!petDoc.exists) {
          console.log('Pet not found:', petId);
          return null;
        }

        const pet = petDoc.data();
        const ownerId = pet.ownerId;
        const petName = pet.name || 'Your pet';

        // Get safe zone settings (if configured)
        const safeZone = pet.safeZone;

        if (!safeZone || !safeZone.enabled) {
          // No safe zone configured, skip alert
          return null;
        }

        // Calculate distance from safe zone center
        const distance = calculateDistance(
            lat,
            lng,
            safeZone.centerLat,
            safeZone.centerLng,
        );

        // Check if pet is outside safe zone radius (in meters)
        const radiusMeters = safeZone.radiusMeters || 100;

        if (distance > radiusMeters) {
          console.log(`⚠️ Pet ${petId} is outside safe zone! Distance: ${distance.toFixed(0)}m`);

          // Check if we already sent an alert recently (avoid spam)
          const recentAlertRef = realtimeDb.ref(`safe_zone_alerts/${petId}/lastAlert`);
          const lastAlertSnapshot = await recentAlertRef.once('value');
          const lastAlertTime = lastAlertSnapshot.val() || 0;
          const now = Date.now();
          const fiveMinutes = 5 * 60 * 1000;

          if (now - lastAlertTime < fiveMinutes) {
            console.log('Alert already sent recently, skipping...');
            return null;
          }

          // Send alert to owner's activity feed
          const activityRef = realtimeDb.ref(`activity_feed/${ownerId}`).push();
          await activityRef.set({
            type: 'safe_zone_alert',
            message: `⚠️ ${petName} has left the safe zone! Current distance: ${distance.toFixed(0)}m`,
            timestamp: admin.database.ServerValue.TIMESTAMP,
            read: false,
            petId: petId,
            latitude: lat,
            longitude: lng,
            distance: Math.round(distance),
          });

          // Also create Firestore notification for persistence
          await db.collection('notifications').add({
            userId: ownerId,
            type: 'safe_zone_alert',
            title: '⚠️ Safe Zone Alert',
            message: `${petName} has left the safe zone! Distance: ${distance.toFixed(0)}m`,
            petId: petId,
            latitude: lat,
            longitude: lng,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Update last alert timestamp
          await recentAlertRef.set(now);

          console.log(`✅ Safe zone alert sent to owner ${ownerId}`);
        }

        return null;
      } catch (error) {
        console.error('❌ Error checking safe zone:', error);
        return null;
      }
    });

/**
 * Notify receiver when a new message is sent
 * Triggered when a new message is added to Realtime Database
 */
exports.onNewMessage = functions.database
    .ref('/messages/{chatId}/{messageId}')
    .onCreate(async (snapshot, context) => {
      try {
        const message = snapshot.val();
        const chatId = context.params.chatId;
        const messageId = context.params.messageId;
        const senderId = message.senderId;
        const receiverId = message.receiverId;
        const text = message.text;

        if (!receiverId || !senderId) {
          console.log('Invalid message data:', messageId);
          return null;
        }

        // Get sender details
        const senderDoc = await db.collection('users').doc(senderId).get();
        const senderName = senderDoc.exists ? senderDoc.data().name : 'Someone';

        // Add notification to receiver's activity feed
        const activityRef = realtimeDb.ref(`activity_feed/${receiverId}`).push();
        await activityRef.set({
          type: 'message',
          message: `💬 New message from ${senderName}: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`,
          timestamp: admin.database.ServerValue.TIMESTAMP,
          read: false,
          senderId: senderId,
          chatId: chatId,
          messageId: messageId,
        });

        // Also create Firestore notification for persistence
        await db.collection('notifications').add({
          userId: receiverId,
          type: 'new_message',
          title: `💬 Message from ${senderName}`,
          message: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
          senderId: senderId,
          chatId: chatId,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`✅ Message notification sent to ${receiverId} from ${senderName}`);
        return null;
      } catch (error) {
        console.error('❌ Error sending message notification:', error);
        return null;
      }
    });

// ============================================================================
// HTTP Callable Functions (for client-side calls)
// ============================================================================

/**
 * Get user statistics
 * Callable function that returns user-specific stats
 */
exports.getUserStats = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated',
    );
  }

  try {
    const userId = context.auth.uid;

    // Get user's bookings count
    const bookingsSnapshot = await db.collection('bookings')
        .where('userId', '==', userId)
        .get();

    // Get user's pets count
    const petsSnapshot = await db.collection('pets')
        .where('ownerId', '==', userId)
        .get();

    // Get user's reviews count
    const reviewsSnapshot = await db.collection('reviews')
        .where('userId', '==', userId)
        .get();

    return {
      bookingsCount: bookingsSnapshot.size,
      petsCount: petsSnapshot.size,
      reviewsCount: reviewsSnapshot.size,
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Get provider statistics
 * Callable function for service providers
 */
exports.getProviderStats = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated',
    );
  }

  try {
    const userId = context.auth.uid;

    // Get provider's services
    const servicesSnapshot = await db.collection('services')
        .where('providerId', '==', userId)
        .get();

    // Get provider's bookings
    const bookingsSnapshot = await db.collection('bookings')
        .where('providerId', '==', userId)
        .get();

    // Calculate total revenue (completed bookings)
    let totalRevenue = 0;
    let completedBookings = 0;

    bookingsSnapshot.forEach((doc) => {
      const booking = doc.data();
      if (booking.status === 'completed') {
        totalRevenue += booking.price || 0;
        completedBookings++;
      }
    });

    return {
      servicesCount: servicesSnapshot.size,
      totalBookings: bookingsSnapshot.size,
      completedBookings: completedBookings,
      totalRevenue: totalRevenue,
    };
  } catch (error) {
    console.error('Error getting provider stats:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ============================================================================
// Scheduled Functions (Note: Limited on Spark plan - use carefully)
// ============================================================================

/**
 * Clean up old location history (runs daily)
 * WARNING: Scheduled functions have limited quota on Spark plan
 */
exports.cleanupOldLocationHistory = functions.pubsub
    .schedule('0 2 * * *') // Run at 2 AM daily
    .timeZone('America/New_York')
    .onRun(async (context) => {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const oldLocations = await db.collection('petLocationHistory')
            .where('createdAt', '<', thirtyDaysAgo)
            .get();

        const batch = db.batch();
        oldLocations.forEach((doc) => {
          batch.delete(doc.ref);
        });

        await batch.commit();

        console.log(`Deleted ${oldLocations.size} old location records`);
        return null;
      } catch (error) {
        console.error('Error cleaning up location history:', error);
        return null;
      }
    });

