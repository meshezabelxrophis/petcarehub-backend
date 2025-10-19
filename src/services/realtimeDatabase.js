import { ref, set, push, onValue, onChildAdded, onChildChanged, onChildRemoved, serverTimestamp, off, get, query, orderByChild, limitToLast, equalTo } from 'firebase/database';
import { realtimeDb } from '../config/firebase';

// ============================================================================
// GPS Tracking Service
// ============================================================================

export const gpsTrackingService = {
  /**
   * Update pet's GPS location
   * @param {string} petId - Pet ID
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {object} additionalData - Battery, accuracy, etc.
   */
  updateLocation: async (petId, lat, lng, additionalData = {}) => {
    try {
      const locationRef = ref(realtimeDb, `gps_tracking/${petId}`);
      await set(locationRef, {
        lat,
        lng,
        lastUpdated: serverTimestamp(),
        ...additionalData
      });
      console.log(`✅ Location updated for pet: ${petId}`);
    } catch (error) {
      console.error('❌ Error updating location:', error);
      throw error;
    }
  },

  /**
   * Listen to pet's GPS location updates
   * @param {string} petId - Pet ID
   * @param {function} callback - Callback function (data) => {}
   * @returns {function} Unsubscribe function
   */
  listenToLocation: (petId, callback) => {
    const locationRef = ref(realtimeDb, `gps_tracking/${petId}`);
    
    const unsubscribe = onValue(locationRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        console.log(`📍 Location update for pet ${petId}:`, data);
        callback(data);
      } else {
        console.log(`⚠️ No location data for pet ${petId}`);
        callback(null);
      }
    }, (error) => {
      console.error('❌ Error listening to location:', error);
    });

    return () => {
      off(locationRef);
      console.log(`🔇 Stopped listening to pet ${petId} location`);
    };
  },

  /**
   * Get current location once (no listener)
   * @param {string} petId - Pet ID
   * @returns {Promise<object>} Location data
   */
  getLocation: async (petId) => {
    try {
      const locationRef = ref(realtimeDb, `gps_tracking/${petId}`);
      const snapshot = await get(locationRef);
      return snapshot.val();
    } catch (error) {
      console.error('❌ Error getting location:', error);
      throw error;
    }
  }
};

// ============================================================================
// Chat Service
// ============================================================================

export const chatService = {
  /**
   * Generate chat ID from two user IDs (consistent ordering)
   * @param {string} userId1 - First user ID
   * @param {string} userId2 - Second user ID
   * @returns {string} Chat ID
   */
  getChatId: (userId1, userId2) => {
    return [userId1, userId2].sort().join('_');
  },

  /**
   * Send a message
   * @param {string} chatId - Chat ID
   * @param {string} senderId - Sender user ID
   * @param {string} receiverId - Receiver user ID
   * @param {string} text - Message text
   * @returns {Promise<string>} Message ID
   */
  sendMessage: async (chatId, senderId, receiverId, text) => {
    try {
      const messagesRef = ref(realtimeDb, `messages/${chatId}`);
      const newMessageRef = push(messagesRef);
      
      await set(newMessageRef, {
        senderId,
        receiverId,
        text,
        timestamp: serverTimestamp(),
        read: false
      });
      
      console.log(`✅ Message sent in chat: ${chatId}`);
      return newMessageRef.key;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  },

  /**
   * Listen to new messages in a chat
   * @param {string} chatId - Chat ID
   * @param {function} onNewMessage - Callback for new messages
   * @param {function} onMessageChanged - Callback for message updates
   * @returns {function} Unsubscribe function
   */
  listenToMessages: (chatId, onNewMessage, onMessageChanged = null) => {
    const messagesRef = ref(realtimeDb, `messages/${chatId}`);
    
    // Listen to new messages
    const unsubscribeNew = onChildAdded(messagesRef, (snapshot) => {
      const message = {
        id: snapshot.key,
        ...snapshot.val()
      };
      console.log(`💬 New message in ${chatId}:`, message);
      onNewMessage(message);
    });

    // Listen to message changes (e.g., read status)
    let unsubscribeChanged = null;
    if (onMessageChanged) {
      unsubscribeChanged = onChildChanged(messagesRef, (snapshot) => {
        const message = {
          id: snapshot.key,
          ...snapshot.val()
        };
        console.log(`📝 Message updated in ${chatId}:`, message);
        onMessageChanged(message);
      });
    }

    // Return cleanup function
    return () => {
      off(messagesRef, 'child_added');
      if (unsubscribeChanged) {
        off(messagesRef, 'child_changed');
      }
      console.log(`🔇 Stopped listening to chat ${chatId}`);
    };
  },

  /**
   * Get chat history (last N messages)
   * @param {string} chatId - Chat ID
   * @param {number} limit - Number of messages to retrieve
   * @returns {Promise<array>} Array of messages
   */
  getChatHistory: async (chatId, limit = 50) => {
    try {
      const messagesRef = ref(realtimeDb, `messages/${chatId}`);
      const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(limit));
      
      const snapshot = await get(messagesQuery);
      const messages = [];
      
      snapshot.forEach((childSnapshot) => {
        messages.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      
      console.log(`📜 Loaded ${messages.length} messages from chat ${chatId}`);
      return messages;
    } catch (error) {
      console.error('❌ Error getting chat history:', error);
      throw error;
    }
  },

  /**
   * Mark message as read
   * @param {string} chatId - Chat ID
   * @param {string} messageId - Message ID
   */
  markAsRead: async (chatId, messageId) => {
    try {
      const messageRef = ref(realtimeDb, `messages/${chatId}/${messageId}`);
      await set(messageRef, { read: true }, { merge: true });
      console.log(`✅ Message ${messageId} marked as read`);
    } catch (error) {
      console.error('❌ Error marking message as read:', error);
      throw error;
    }
  }
};

// ============================================================================
// Activity Feed Service
// ============================================================================

export const activityFeedService = {
  /**
   * Add activity to user's feed
   * @param {string} userId - User ID
   * @param {string} type - Activity type (booking, pet_added, service_added, etc.)
   * @param {string} message - Activity message
   * @param {object} metadata - Additional data
   * @returns {Promise<string>} Activity ID
   */
  addActivity: async (userId, type, message, metadata = {}) => {
    try {
      const feedRef = ref(realtimeDb, `activity_feed/${userId}`);
      const newActivityRef = push(feedRef);
      
      await set(newActivityRef, {
        type,
        message,
        timestamp: serverTimestamp(),
        read: false,
        ...metadata
      });
      
      console.log(`✅ Activity added for user ${userId}: ${type}`);
      return newActivityRef.key;
    } catch (error) {
      console.error('❌ Error adding activity:', error);
      throw error;
    }
  },

  /**
   * Listen to user's activity feed
   * @param {string} userId - User ID
   * @param {function} onNewActivity - Callback for new activities
   * @param {number} limit - Max number of activities
   * @returns {function} Unsubscribe function
   */
  listenToActivityFeed: (userId, onNewActivity, limit = 20) => {
    const feedRef = ref(realtimeDb, `activity_feed/${userId}`);
    const feedQuery = query(feedRef, orderByChild('timestamp'), limitToLast(limit));
    
    const unsubscribe = onChildAdded(feedQuery, (snapshot) => {
      const activity = {
        id: snapshot.key,
        ...snapshot.val()
      };
      console.log(`🔔 New activity for user ${userId}:`, activity);
      onNewActivity(activity);
    });

    return () => {
      off(feedQuery, 'child_added');
      console.log(`🔇 Stopped listening to activity feed for ${userId}`);
    };
  },

  /**
   * Get activity feed (last N activities)
   * @param {string} userId - User ID
   * @param {number} limit - Number of activities
   * @returns {Promise<array>} Array of activities
   */
  getActivityFeed: async (userId, limit = 20) => {
    try {
      const feedRef = ref(realtimeDb, `activity_feed/${userId}`);
      const feedQuery = query(feedRef, orderByChild('timestamp'), limitToLast(limit));
      
      const snapshot = await get(feedQuery);
      const activities = [];
      
      snapshot.forEach((childSnapshot) => {
        activities.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      
      // Sort by timestamp descending (newest first)
      activities.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      
      console.log(`📋 Loaded ${activities.length} activities for user ${userId}`);
      return activities;
    } catch (error) {
      console.error('❌ Error getting activity feed:', error);
      throw error;
    }
  },

  /**
   * Mark activity as read
   * @param {string} userId - User ID
   * @param {string} activityId - Activity ID
   */
  markActivityAsRead: async (userId, activityId) => {
    try {
      const activityRef = ref(realtimeDb, `activity_feed/${userId}/${activityId}/read`);
      await set(activityRef, true);
      console.log(`✅ Activity ${activityId} marked as read`);
    } catch (error) {
      console.error('❌ Error marking activity as read:', error);
      throw error;
    }
  },

  /**
   * Clear all activities for a user
   * @param {string} userId - User ID
   */
  clearActivityFeed: async (userId) => {
    try {
      const feedRef = ref(realtimeDb, `activity_feed/${userId}`);
      await set(feedRef, null);
      console.log(`✅ Activity feed cleared for user ${userId}`);
    } catch (error) {
      console.error('❌ Error clearing activity feed:', error);
      throw error;
    }
  }
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if Realtime Database is connected
 * @returns {Promise<boolean>}
 */
export const checkRealtimeDBConnection = async () => {
  try {
    const connectedRef = ref(realtimeDb, '.info/connected');
    const snapshot = await get(connectedRef);
    return snapshot.val() === true;
  } catch (error) {
    console.error('❌ Error checking Realtime DB connection:', error);
    return false;
  }
};

/**
 * Listen to connection state
 * @param {function} callback - Callback (isConnected) => {}
 * @returns {function} Unsubscribe function
 */
export const listenToConnectionState = (callback) => {
  const connectedRef = ref(realtimeDb, '.info/connected');
  
  const unsubscribe = onValue(connectedRef, (snapshot) => {
    const isConnected = snapshot.val() === true;
    console.log(`🔌 Realtime DB connection: ${isConnected ? 'CONNECTED' : 'DISCONNECTED'}`);
    callback(isConnected);
  });

  return () => {
    off(connectedRef);
  };
};







