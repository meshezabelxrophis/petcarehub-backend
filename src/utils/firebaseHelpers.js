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
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';

/**
 * Firestore Helper Functions
 */

// Create a new document
export const createDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating document:', error);
    return { success: false, error: error.message };
  }
};

// Read a single document
export const getDocument = async (collectionName, documentId) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'Document not found' };
    }
  } catch (error) {
    console.error('Error getting document:', error);
    return { success: false, error: error.message };
  }
};

// Update a document
export const updateDocument = async (collectionName, documentId, data) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating document:', error);
    return { success: false, error: error.message };
  }
};

// Delete a document
export const deleteDocument = async (collectionName, documentId) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting document:', error);
    return { success: false, error: error.message };
  }
};

// Query documents with filters
export const queryDocuments = async (collectionName, filters = [], orderByField = null, limitCount = null) => {
  try {
    let q = collection(db, collectionName);
    
    // Apply filters
    const constraints = [];
    filters.forEach(filter => {
      constraints.push(where(filter.field, filter.operator, filter.value));
    });
    
    // Apply ordering
    if (orderByField) {
      constraints.push(orderBy(orderByField.field, orderByField.direction || 'asc'));
    }
    
    // Apply limit
    if (limitCount) {
      constraints.push(limit(limitCount));
    }
    
    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }
    
    const querySnapshot = await getDocs(q);
    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: documents };
  } catch (error) {
    console.error('Error querying documents:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Storage Helper Functions
 */

// Upload a file to storage
export const uploadFile = async (path, file, metadata = {}) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return { 
      success: true, 
      url: downloadURL,
      fullPath: snapshot.ref.fullPath,
      metadata: snapshot.metadata
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { success: false, error: error.message };
  }
};

// Delete a file from storage
export const deleteFile = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error: error.message };
  }
};

// Get download URL for a file
export const getFileURL = async (path) => {
  try {
    const storageRef = ref(storage, path);
    const url = await getDownloadURL(storageRef);
    return { success: true, url };
  } catch (error) {
    console.error('Error getting file URL:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Batch operations
 */
export const batchCreateDocuments = async (collectionName, dataArray) => {
  try {
    const results = await Promise.all(
      dataArray.map(data => createDocument(collectionName, data))
    );
    return { success: true, results };
  } catch (error) {
    console.error('Error in batch create:', error);
    return { success: false, error: error.message };
  }
};

