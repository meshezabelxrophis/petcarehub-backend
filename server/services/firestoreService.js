/**
 * Firestore Service Layer
 * 
 * This provides a clean interface for Firestore operations
 * Replaces SQLite database logic
 */

const { db, admin } = require('../config/firebaseAdmin');

/**
 * Generic Firestore Operations
 */
class FirestoreService {
  /**
   * Get all documents from a collection with optional filters
   */
  static async getAll(collectionName, filters = []) {
    try {
      let query = db.collection(collectionName);
      
      // Apply filters
      filters.forEach(filter => {
        query = query.where(filter.field, filter.operator, filter.value);
      });
      
      const snapshot = await query.get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error getting documents from ${collectionName}:`, error);
      throw error;
    }
  }
  
  /**
   * Get a single document by ID
   */
  static async getById(collectionName, docId) {
    try {
      const docRef = db.collection(collectionName).doc(docId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        return null;
      }
      
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error(`Error getting document ${docId} from ${collectionName}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new document
   */
  static async create(collectionName, data, customId = null) {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const docData = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      if (customId) {
        const docRef = db.collection(collectionName).doc(customId);
        await docRef.set(docData);
        return { id: customId, ...docData };
      } else {
        const docRef = await db.collection(collectionName).add(docData);
        return { id: docRef.id, ...docData };
      }
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }
  
  /**
   * Update a document
   */
  static async update(collectionName, docId, data) {
    try {
      const docRef = db.collection(collectionName).doc(docId);
      const updateData = {
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await docRef.update(updateData);
      return { id: docId, ...updateData };
    } catch (error) {
      console.error(`Error updating document ${docId} in ${collectionName}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a document
   */
  static async delete(collectionName, docId) {
    try {
      await db.collection(collectionName).doc(docId).delete();
      return true;
    } catch (error) {
      console.error(`Error deleting document ${docId} from ${collectionName}:`, error);
      throw error;
    }
  }
  
  /**
   * Query documents with complex filters
   */
  static async query(collectionName, queryBuilder) {
    try {
      let query = db.collection(collectionName);
      query = queryBuilder(query);
      
      const snapshot = await query.get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error querying ${collectionName}:`, error);
      throw error;
    }
  }
}

/**
 * User-specific operations
 */
class UserService {
  static async createUser(userData) {
    return await FirestoreService.create('users', userData);
  }
  
  static async getUserByEmail(email) {
    const users = await FirestoreService.getAll('users', [
      { field: 'email', operator: '==', value: email }
    ]);
    return users.length > 0 ? users[0] : null;
  }
  
  static async getUserById(userId) {
    return await FirestoreService.getById('users', userId);
  }
  
  static async updateUser(userId, userData) {
    return await FirestoreService.update('users', userId, userData);
  }
  
  static async getAllUsers() {
    return await FirestoreService.getAll('users');
  }
  
  static async getProviders() {
    return await FirestoreService.getAll('users', [
      { field: 'role', operator: '==', value: 'provider' }
    ]);
  }
}

/**
 * Pet-specific operations
 */
class PetService {
  static async createPet(petData) {
    return await FirestoreService.create('pets', petData);
  }
  
  static async getPetsByOwner(ownerId) {
    return await FirestoreService.getAll('pets', [
      { field: 'ownerId', operator: '==', value: ownerId }
    ]);
  }
  
  static async getPetById(petId) {
    return await FirestoreService.getById('pets', petId);
  }
  
  static async updatePet(petId, petData) {
    return await FirestoreService.update('pets', petId, petData);
  }
  
  static async deletePet(petId) {
    return await FirestoreService.delete('pets', petId);
  }
}

/**
 * Service-specific operations
 */
class ServiceOffering {
  static async createService(serviceData) {
    return await FirestoreService.create('services', serviceData);
  }
  
  static async getServicesByProvider(providerId) {
    return await FirestoreService.getAll('services', [
      { field: 'providerId', operator: '==', value: providerId }
    ]);
  }
  
  static async getServiceById(serviceId) {
    return await FirestoreService.getById('services', serviceId);
  }
  
  static async getAllServices() {
    return await FirestoreService.getAll('services');
  }
  
  static async updateService(serviceId, serviceData) {
    return await FirestoreService.update('services', serviceId, serviceData);
  }
  
  static async deleteService(serviceId) {
    return await FirestoreService.delete('services', serviceId);
  }
}

/**
 * Booking-specific operations
 */
class BookingService {
  static async createBooking(bookingData) {
    return await FirestoreService.create('bookings', bookingData);
  }
  
  static async getAllBookings() {
    return await FirestoreService.getAll('bookings');
  }
  
  static async getBookingsByUser(userId) {
    return await FirestoreService.query('bookings', (query) => {
      return query
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc');
    });
  }
  
  static async getBookingsByProvider(providerId) {
    return await FirestoreService.query('bookings', (query) => {
      return query
        .where('providerId', '==', providerId)
        .orderBy('createdAt', 'desc');
    });
  }
  
  static async getBookingById(bookingId) {
    return await FirestoreService.getById('bookings', bookingId);
  }
  
  static async updateBooking(bookingId, bookingData) {
    return await FirestoreService.update('bookings', bookingId, bookingData);
  }
  
  static async deleteBooking(bookingId) {
    return await FirestoreService.delete('bookings', bookingId);
  }
}

/**
 * Payment-specific operations
 */
class PaymentService {
  static async createPayment(paymentData) {
    return await FirestoreService.create('payments', paymentData);
  }
  
  static async getPaymentBySessionId(sessionId) {
    const payments = await FirestoreService.getAll('payments', [
      { field: 'stripeSessionId', operator: '==', value: sessionId }
    ]);
    return payments.length > 0 ? payments[0] : null;
  }
  
  static async updatePaymentBySessionId(sessionId, updateData) {
    const payment = await this.getPaymentBySessionId(sessionId);
    if (!payment) {
      throw new Error(`Payment not found for session: ${sessionId}`);
    }
    return await FirestoreService.update('payments', payment.id, updateData);
  }
  
  static async getPaymentsByUser(userId) {
    return await FirestoreService.getAll('payments', [
      { field: 'userId', operator: '==', value: userId }
    ]);
  }
  
  static async updatePayment(paymentId, paymentData) {
    return await FirestoreService.update('payments', paymentId, paymentData);
  }
}

module.exports = {
  FirestoreService,
  UserService,
  PetService,
  ServiceOffering,
  BookingService,
  PaymentService
};

