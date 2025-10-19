/**
 * Realtime Database Service
 * Direct Firebase Realtime Database operations for GPS tracking and chat
 * 
 * Use this for:
 * - Live GPS location tracking
 * - Real-time chat
 * - Live status updates
 * - Any real-time collaborative features
 */

import { realtimeDb } from '../config/firebase';
import { 
  ref, 
  set, 
  get, 
  update, 
  remove, 
  onValue, 
  push, 
  serverTimestamp,
  query,
  orderByChild,
  limitToLast,
  off
} from 'firebase/database';

// ============================================
// GPS LOCATION TRACKING
// ============================================

/**
 * Update pet location
 */
export const updatePetLocation = async (petId, locationData) => {
  try {
    const { latitude, longitude, accuracy, timestamp } = locationData;
    
    const locationRef = ref(realtimeDb, `pet_locations/${petId}`);
    await set(locationRef, {
      latitude,
      longitude,
      accuracy: accuracy || null,
      timestamp: timestamp || Date.now(),
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Pet location updated');
    return true;
  } catch (error) {
    console.error('Error updating pet location:', error);
    throw error;
  }
};

/**
 * Get pet location (one-time)
 */
export const getPetLocation = async (petId) => {
  try {
    const locationRef = ref(realtimeDb, `pet_locations/${petId}`);
    const snapshot = await get(locationRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    }
    
    return null;
  } catch (error) {
    console.error('Error getting pet location:', error);
    throw error;
  }
};

/**
 * Subscribe to pet location updates (real-time)
 */
export const subscribeToLocation = (petId, callback) => {
  const locationRef = ref(realtimeDb, `pet_locations/${petId}`);
  
  const unsubscribe = onValue(locationRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error listening to location:', error);
  });
  
  // Return unsubscribe function
  return () => off(locationRef);
};

/**
 * Subscribe to multiple pets' locations
 */
export const subscribeToMultipleLocations = (petIds, callback) => {
  const unsubscribes = [];
  
  petIds.forEach(petId => {
    const locationRef = ref(realtimeDb, `pet_locations/${petId}`);
    
    const unsubscribe = onValue(locationRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(petId, snapshot.val());
      }
    });
    
    unsubscribes.push(() => off(locationRef));
  });
  
  // Return function to unsubscribe from all
  return () => {
    unsubscribes.forEach(unsub => unsub());
  };
};

// ============================================
// REAL-TIME CHAT
// ============================================

/**
 * Send chat message
 */
export const sendChatMessage = async (chatRoomId, messageData) => {
  try {
    const { text, senderId, senderName, senderAvatar } = messageData;
    
    const messagesRef = ref(realtimeDb, `chats/${chatRoomId}/messages`);
    const newMessageRef = push(messagesRef);
    
    await set(newMessageRef, {
      text,
      senderId,
      senderName: senderName || 'Anonymous',
      senderAvatar: senderAvatar || null,
      timestamp: serverTimestamp(),
      read: false
    });
    
    // Update chat room metadata
    const chatRoomRef = ref(realtimeDb, `chats/${chatRoomId}/metadata`);
    await update(chatRoomRef, {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
      lastSenderId: senderId
    });
    
    console.log('✅ Message sent');
    return newMessageRef.key;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Get chat messages (one-time, last N messages)
 */
export const getChatMessages = async (chatRoomId, limitCount = 50) => {
  try {
    const messagesRef = ref(realtimeDb, `chats/${chatRoomId}/messages`);
    const messagesQuery = query(
      messagesRef,
      orderByChild('timestamp'),
      limitToLast(limitCount)
    );
    
    const snapshot = await get(messagesQuery);
    const messages = [];
    
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        messages.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }
    
    return messages;
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

/**
 * Subscribe to chat messages (real-time)
 */
export const subscribeToChatMessages = (chatRoomId, callback, limitCount = 50) => {
  const messagesRef = ref(realtimeDb, `chats/${chatRoomId}/messages`);
  const messagesQuery = query(
    messagesRef,
    orderByChild('timestamp'),
    limitToLast(limitCount)
  );
  
  const unsubscribe = onValue(messagesQuery, (snapshot) => {
    const messages = [];
    
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        messages.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }
    
    callback(messages);
  }, (error) => {
    console.error('Error listening to messages:', error);
  });
  
  return () => off(messagesQuery);
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (chatRoomId, messageIds) => {
  try {
    const updates = {};
    
    messageIds.forEach(messageId => {
      updates[`chats/${chatRoomId}/messages/${messageId}/read`] = true;
      updates[`chats/${chatRoomId}/messages/${messageId}/readAt`] = serverTimestamp();
    });
    
    await update(ref(realtimeDb), updates);
    
    console.log('✅ Messages marked as read');
    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// ============================================
// ONLINE STATUS
// ============================================

/**
 * Set user online status
 */
export const setUserOnlineStatus = async (userId, isOnline) => {
  try {
    const statusRef = ref(realtimeDb, `user_status/${userId}`);
    await set(statusRef, {
      online: isOnline,
      lastSeen: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error setting online status:', error);
    throw error;
  }
};

/**
 * Subscribe to user online status
 */
export const subscribeToUserStatus = (userId, callback) => {
  const statusRef = ref(realtimeDb, `user_status/${userId}`);
  
  const unsubscribe = onValue(statusRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback({ online: false, lastSeen: null });
    }
  });
  
  return () => off(statusRef);
};

// ============================================
// LIVE UPDATES (Generic)
// ============================================

/**
 * Set live data
 */
export const setLiveData = async (path, data) => {
  try {
    const dataRef = ref(realtimeDb, path);
    await set(dataRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error setting live data:', error);
    throw error;
  }
};

/**
 * Subscribe to live data
 */
export const subscribeToLiveData = (path, callback) => {
  const dataRef = ref(realtimeDb, path);
  
  const unsubscribe = onValue(dataRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  });
  
  return () => off(dataRef);
};

export default {
  // GPS Location
  updatePetLocation,
  getPetLocation,
  subscribeToLocation,
  subscribeToMultipleLocations,
  
  // Chat
  sendChatMessage,
  getChatMessages,
  subscribeToChatMessages,
  markMessagesAsRead,
  
  // Status
  setUserOnlineStatus,
  subscribeToUserStatus,
  
  // Generic
  setLiveData,
  subscribeToLiveData
};

