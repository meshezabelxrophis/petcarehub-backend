/**
 * Firestore Service
 * Direct Firebase Firestore operations for bookings, user data, and app data
 * 
 * Use this for:
 * - User profiles
 * - Bookings
 * - Pets
 * - Services
 * - Providers
 * - Any real-time app data
 */

import { 
  db, 
  auth 
} from '../config/firebase';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';

// ============================================
// USER OPERATIONS
// ============================================

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, data) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ User profile updated');
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// ============================================
// BOOKING OPERATIONS
// ============================================

/**
 * Create booking
 */
export const createBooking = async (bookingData) => {
  try {
    const bookingsRef = collection(db, 'bookings');
    const docRef = await addDoc(bookingsRef, {
      ...bookingData,
      userId: auth.currentUser?.uid,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Booking created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

/**
 * Get user bookings
 */
export const getUserBookings = async (userId) => {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const bookings = [];
    
    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() });
    });
    
    return bookings;
  } catch (error) {
    console.error('Error getting bookings:', error);
    throw error;
  }
};

/**
 * Update booking
 */
export const updateBooking = async (bookingId, data) => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Booking updated');
    return true;
  } catch (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
};

/**
 * Listen to booking updates (real-time)
 */
export const subscribeToBooking = (bookingId, callback) => {
  const bookingRef = doc(db, 'bookings', bookingId);
  
  return onSnapshot(bookingRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  }, (error) => {
    console.error('Error listening to booking:', error);
  });
};

// ============================================
// PET OPERATIONS
// ============================================

/**
 * Get user pets
 */
export const getUserPets = async (userId) => {
  try {
    const petsRef = collection(db, 'pets');
    const q = query(
      petsRef,
      where('ownerId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const pets = [];
    
    querySnapshot.forEach((doc) => {
      pets.push({ id: doc.id, ...doc.data() });
    });
    
    return pets;
  } catch (error) {
    console.error('Error getting pets:', error);
    throw error;
  }
};

/**
 * Add pet
 */
export const addPet = async (petData) => {
  try {
    const petsRef = collection(db, 'pets');
    const docRef = await addDoc(petsRef, {
      ...petData,
      ownerId: auth.currentUser?.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Pet added:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding pet:', error);
    throw error;
  }
};

/**
 * Update pet
 */
export const updatePet = async (petId, data) => {
  try {
    const petRef = doc(db, 'pets', petId);
    await updateDoc(petRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Pet updated');
    return true;
  } catch (error) {
    console.error('Error updating pet:', error);
    throw error;
  }
};

/**
 * Delete pet
 */
export const deletePet = async (petId) => {
  try {
    const petRef = doc(db, 'pets', petId);
    await deleteDoc(petRef);
    
    console.log('✅ Pet deleted');
    return true;
  } catch (error) {
    console.error('Error deleting pet:', error);
    throw error;
  }
};

// ============================================
// SERVICE OPERATIONS
// ============================================

/**
 * Get all services
 */
export const getAllServices = async (filters = {}) => {
  try {
    const servicesRef = collection(db, 'services');
    let q = query(servicesRef);
    
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }
    
    if (filters.providerId) {
      q = query(q, where('providerId', '==', filters.providerId));
    }
    
    const querySnapshot = await getDocs(q);
    const services = [];
    
    querySnapshot.forEach((doc) => {
      services.push({ id: doc.id, ...doc.data() });
    });
    
    return services;
  } catch (error) {
    console.error('Error getting services:', error);
    throw error;
  }
};

/**
 * Get service by ID
 */
export const getService = async (serviceId) => {
  try {
    const serviceRef = doc(db, 'services', serviceId);
    const serviceSnap = await getDoc(serviceRef);
    
    if (serviceSnap.exists()) {
      return { id: serviceSnap.id, ...serviceSnap.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting service:', error);
    throw error;
  }
};

// ============================================
// NOTIFICATIONS (Read-only - Cloud Functions create them)
// ============================================

/**
 * Get user notifications
 */
export const getUserNotifications = async (userId, limitCount = 20) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const notifications = [];
    
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });
    
    return notifications;
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Subscribe to notifications (real-time)
 */
export const subscribeToNotifications = (userId, callback) => {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    where('read', '==', false),
    orderBy('createdAt', 'desc'),
    limit(10)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const notifications = [];
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });
    callback(notifications);
  }, (error) => {
    console.error('Error listening to notifications:', error);
  });
};

export default {
  getUserProfile,
  updateUserProfile,
  createBooking,
  getUserBookings,
  updateBooking,
  subscribeToBooking,
  getUserPets,
  addPet,
  updatePet,
  deletePet,
  getAllServices,
  getService,
  getUserNotifications,
  markNotificationAsRead,
  subscribeToNotifications
};

