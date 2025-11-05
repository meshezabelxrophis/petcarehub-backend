/**
 * Notification Service
 * Handles Firebase Cloud Messaging (FCM) push notifications
 * Works within Firebase Spark (free) plan limits
 */

import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { doc, setDoc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

// Your Firebase Cloud Messaging VAPID key (we'll generate this)
const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY;

/**
 * Request notification permission and get FCM token
 * @returns {Promise<string|null>} FCM token or null if denied
 */
export async function requestNotificationPermission(userId) {
  try {
    // Check if notifications are supported
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    // Get FCM token
    const messaging = getMessaging();
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    
    if (token) {
      console.log("✅ FCM token obtained:", token);
      
      // Save token to Firestore for this user
      await saveUserToken(userId, token);
      
      return token;
    } else {
      console.log("No registration token available");
      return null;
    }
  } catch (error) {
    console.error("Error getting notification permission:", error);
    return null;
  }
}

/**
 * Save FCM token to user's Firestore document
 */
async function saveUserToken(userId, token) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      fcmTokens: arrayUnion(token),
      notificationsEnabled: true,
      lastTokenUpdate: new Date().toISOString(),
    });
    console.log("✅ Token saved to Firestore");
  } catch (error) {
    console.error("Error saving token:", error);
  }
}

/**
 * Listen for foreground messages
 */
export function listenForMessages(callback) {
  try {
    const messaging = getMessaging();
    
    onMessage(messaging, (payload) => {
      console.log("📬 Message received:", payload);
      
      // Show notification
      if (payload.notification) {
        showNotification(
          payload.notification.title,
          payload.notification.body,
          payload.notification.icon
        );
      }
      
      // Callback for custom handling
      if (callback) {
        callback(payload);
      }
    });
  } catch (error) {
    console.error("Error setting up message listener:", error);
  }
}

/**
 * Show browser notification
 */
function showNotification(title, body, icon = "/logo192.png") {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon,
      badge: "/logo192.png",
      vibrate: [200, 100, 200],
    });
  }
}

/**
 * Send notification via Firestore (works without Cloud Functions)
 * This creates a notification document that the recipient will see
 */
export async function sendNotification(recipientUserId, notificationData) {
  try {
    const {
      title,
      body,
      type, // 'like', 'comment', 'geofence', 'booking', 'payment'
      relatedId, // postId, bookingId, petId, etc.
      senderName,
      imageUrl,
    } = notificationData;

    // Create notification document
    const notificationRef = doc(db, "notifications", `${recipientUserId}_${Date.now()}`);
    
    await setDoc(notificationRef, {
      userId: recipientUserId,
      title,
      body,
      type,
      relatedId,
      senderName: senderName || "PetCare Hub",
      imageUrl: imageUrl || null,
      read: false,
      createdAt: new Date().toISOString(),
    });

    console.log("✅ Notification sent to user:", recipientUserId);
    
    // If we want to trigger push notification, we'd need a backend
    // For now, user will see it in their notification bell
    
    return true;
  } catch (error) {
    console.error("Error sending notification:", error);
    return false;
  }
}

/**
 * Send like notification
 */
export async function notifyPostLiked(postOwnerId, likerName, postId, petName) {
  if (!postOwnerId) return;
  
  return sendNotification(postOwnerId, {
    title: "New Like ❤️",
    body: `${likerName} liked ${petName}'s photo!`,
    type: "like",
    relatedId: postId,
    senderName: likerName,
  });
}

/**
 * Send comment notification
 */
export async function notifyPostCommented(postOwnerId, commenterName, commentText, postId, petName) {
  if (!postOwnerId) return;
  
  return sendNotification(postOwnerId, {
    title: "New Comment 💬",
    body: `${commenterName} commented on ${petName}'s photo: "${commentText.substring(0, 50)}..."`,
    type: "comment",
    relatedId: postId,
    senderName: commenterName,
  });
}

/**
 * Send geofence alert notification
 */
export async function notifyGeofenceAlert(ownerId, petName, status) {
  if (!ownerId) return;
  
  const title = status === "outside" ? "⚠️ Geofence Alert!" : "✅ Back in Safe Zone";
  const body = status === "outside" 
    ? `${petName} has left the safe zone!`
    : `${petName} is back in the safe zone.`;
  
  return sendNotification(ownerId, {
    title,
    body,
    type: "geofence",
    relatedId: petName,
    senderName: "PetCare GPS",
  });
}

/**
 * Send booking confirmation notification
 */
export async function notifyBookingConfirmed(userId, serviceName, bookingDate) {
  if (!userId) return;
  
  return sendNotification(userId, {
    title: "✅ Booking Confirmed",
    body: `Your ${serviceName} appointment on ${bookingDate} has been confirmed!`,
    type: "booking",
    relatedId: null,
    senderName: "PetCare Bookings",
  });
}

/**
 * Send payment success notification
 */
export async function notifyPaymentSuccess(userId, serviceName, amount) {
  if (!userId) return;
  
  return sendNotification(userId, {
    title: "💳 Payment Successful",
    body: `Payment of $${amount} for ${serviceName} was successful!`,
    type: "payment",
    relatedId: null,
    senderName: "PetCare Payments",
  });
}

/**
 * Send new booking notification to provider
 */
export async function notifyProviderNewBooking(providerId, customerName, serviceName, bookingDate) {
  if (!providerId) return;
  
  return sendNotification(providerId, {
    title: "📅 New Booking",
    body: `${customerName} booked ${serviceName} for ${bookingDate}`,
    type: "booking",
    relatedId: null,
    senderName: customerName,
  });
}

/**
 * Get user's notification settings
 */
export async function getNotificationSettings(userId) {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return {
        enabled: userSnap.data().notificationsEnabled || false,
        tokens: userSnap.data().fcmTokens || [],
      };
    }
    return { enabled: false, tokens: [] };
  } catch (error) {
    console.error("Error getting notification settings:", error);
    return { enabled: false, tokens: [] };
  }
}

/**
 * Disable notifications for user
 */
export async function disableNotifications(userId) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      notificationsEnabled: false,
    });
    console.log("✅ Notifications disabled");
    return true;
  } catch (error) {
    console.error("Error disabling notifications:", error);
    return false;
  }
}

export default {
  requestNotificationPermission,
  listenForMessages,
  sendNotification,
  notifyPostLiked,
  notifyPostCommented,
  notifyGeofenceAlert,
  notifyBookingConfirmed,
  notifyPaymentSuccess,
  notifyProviderNewBooking,
  getNotificationSettings,
  disableNotifications,
};

