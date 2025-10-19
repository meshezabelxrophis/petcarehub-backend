import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// ============================================================================
// Authentication Functions
// ============================================================================

/**
 * Sign up with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User display name
 * @param {string} role - User role (petOwner, serviceProvider, admin)
 * @param {object} additionalData - Additional user data
 * @returns {Promise<object>} User object with role
 */
export const signUpWithEmail = async (email, password, name, role = 'petOwner', additionalData = {}) => {
  try {
    console.log('🔐 Creating Firebase Auth user...');
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Firebase Auth user created:', user.uid);
    
    // Update display name
    await updateProfile(user, { displayName: name });
    
    // Create Firestore user document with role
    const userData = {
      id: user.uid,
      uid: user.uid,
      email: user.email,
      name: name,
      displayName: name,
      role: role, // petOwner, serviceProvider, admin
      accountType: role, // Backwards compatibility
      photoURL: user.photoURL || '',
      phone: additionalData.phone || '',
      address: additionalData.address || '',
      bio: additionalData.bio || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      profileComplete: false,
      
      // Provider-specific fields
      ...(role === 'serviceProvider' && {
        businessHours: {
          monday: { open: "09:00", close: "17:00", isOpen: true },
          tuesday: { open: "09:00", close: "17:00", isOpen: true },
          wednesday: { open: "09:00", close: "17:00", isOpen: true },
          thursday: { open: "09:00", close: "17:00", isOpen: true },
          friday: { open: "09:00", close: "17:00", isOpen: true },
          saturday: { open: "10:00", close: "15:00", isOpen: true },
          sunday: { open: "10:00", close: "15:00", isOpen: false }
        },
        location: additionalData.location || null,
        services: [],
        rating: 0,
        reviewCount: 0
      })
    };
    
    console.log('💾 Creating Firestore user document with role:', role);
    await setDoc(doc(db, 'users', user.uid), userData);
    
    console.log('✅ User created successfully!');
    
    return {
      uid: user.uid,
      id: user.uid,
      email: user.email,
      name: name,
      role: role,
      accountType: role,
      ...userData
    };
  } catch (error) {
    console.error('❌ Sign up error:', error);
    throw handleAuthError(error);
  }
};

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} User object with role
 */
export const signInWithEmail = async (email, password) => {
  try {
    console.log('🔐 Signing in with email...');
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Firebase Auth sign-in successful:', user.uid);
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      console.error('❌ User document not found in Firestore!');
      throw new Error('User profile not found. Please contact support.');
    }
    
    const userData = userDoc.data();
    console.log('✅ User data retrieved. Role:', userData.role);
    
    return {
      uid: user.uid,
      id: user.uid,
      email: user.email,
      name: userData.name || user.displayName,
      role: userData.role,
      accountType: userData.accountType || userData.role,
      ...userData
    };
  } catch (error) {
    console.error('❌ Sign in error:', error);
    throw handleAuthError(error);
  }
};

/**
 * Sign in with Google
 * @param {string} role - User role for new accounts (petOwner, serviceProvider)
 * @returns {Promise<object>} User object with role
 */
export const signInWithGoogle = async (role = 'petOwner') => {
  try {
    console.log('🔐 Signing in with Google...');
    
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    
    console.log('✅ Google sign-in successful:', user.uid);
    
    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      // Existing user - return their data
      const userData = userDoc.data();
      console.log('✅ Existing user. Role:', userData.role);
      
      return {
        uid: user.uid,
        id: user.uid,
        email: user.email,
        name: userData.name || user.displayName,
        role: userData.role,
        accountType: userData.accountType || userData.role,
        ...userData
      };
    } else {
      // New user - create Firestore document with specified role
      console.log('💾 Creating new user document with role:', role);
      
      const userData = {
        id: user.uid,
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        displayName: user.displayName || user.email.split('@')[0],
        role: role,
        accountType: role,
        photoURL: user.photoURL || '',
        phone: '',
        address: '',
        bio: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        profileComplete: false,
        
        // Provider-specific fields
        ...(role === 'serviceProvider' && {
          businessHours: {
            monday: { open: "09:00", close: "17:00", isOpen: true },
            tuesday: { open: "09:00", close: "17:00", isOpen: true },
            wednesday: { open: "09:00", close: "17:00", isOpen: true },
            thursday: { open: "09:00", close: "17:00", isOpen: true },
            friday: { open: "09:00", close: "17:00", isOpen: true },
            saturday: { open: "10:00", close: "15:00", isOpen: true },
            sunday: { open: "10:00", close: "15:00", isOpen: false }
          },
          location: null,
          services: [],
          rating: 0,
          reviewCount: 0
        })
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      
      console.log('✅ New user created successfully!');
      
      return {
        uid: user.uid,
        id: user.uid,
        email: user.email,
        name: userData.name,
        role: role,
        accountType: role,
        ...userData
      };
    }
  } catch (error) {
    console.error('❌ Google sign-in error:', error);
    throw handleAuthError(error);
  }
};

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    console.log('🔐 Signing out...');
    await signOut(auth);
    console.log('✅ Signed out successfully');
  } catch (error) {
    console.error('❌ Sign out error:', error);
    throw handleAuthError(error);
  }
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
export const resetPassword = async (email) => {
  try {
    console.log('📧 Sending password reset email to:', email);
    await sendPasswordResetEmail(auth, email);
    console.log('✅ Password reset email sent');
  } catch (error) {
    console.error('❌ Password reset error:', error);
    throw handleAuthError(error);
  }
};

/**
 * Get current authenticated user
 * @returns {Promise<object|null>} User object or null
 */
export const getCurrentUser = async () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        unsubscribe();
        
        if (!user) {
          resolve(null);
          return;
        }
        
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (!userDoc.exists()) {
            console.warn('⚠️ User authenticated but no Firestore document found');
            resolve({
              uid: user.uid,
              id: user.uid,
              email: user.email,
              name: user.displayName || user.email.split('@')[0],
              role: 'petOwner',
              accountType: 'petOwner'
            });
            return;
          }
          
          const userData = userDoc.data();
          resolve({
            uid: user.uid,
            id: user.uid,
            email: user.email,
            name: userData.name || user.displayName,
            role: userData.role,
            accountType: userData.accountType || userData.role,
            ...userData
          });
        } catch (error) {
          console.error('❌ Error getting user data:', error);
          reject(error);
        }
      },
      reject
    );
  });
};

/**
 * Listen to auth state changes
 * @param {function} callback - Callback function (user) => {}
 * @returns {function} Unsubscribe function
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(null);
      return;
    }
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        callback({
          uid: user.uid,
          id: user.uid,
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          role: 'petOwner',
          accountType: 'petOwner'
        });
        return;
      }
      
      const userData = userDoc.data();
      callback({
        uid: user.uid,
        id: user.uid,
        email: user.email,
        name: userData.name || user.displayName,
        role: userData.role,
        accountType: userData.accountType || userData.role,
        ...userData
      });
    } catch (error) {
      console.error('❌ Error in auth state change:', error);
      callback(null);
    }
  });
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Handle Firebase Auth errors
 * @param {object} error - Firebase error object
 * @returns {Error} Formatted error
 */
const handleAuthError = (error) => {
  const errorMessages = {
    'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Invalid email or password. Please check your credentials and try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed before completion.',
    'auth/cancelled-popup-request': 'Sign-in popup was cancelled.',
  };
  
  const message = errorMessages[error.code] || error.message || 'An error occurred during authentication.';
  return new Error(message);
};

/**
 * Check if user has specific role
 * @param {object} user - User object
 * @param {string} role - Role to check
 * @returns {boolean}
 */
export const hasRole = (user, role) => {
  if (!user) return false;
  return user.role === role || user.accountType === role;
};

/**
 * Check if user is admin
 * @param {object} user - User object
 * @returns {boolean}
 */
export const isAdmin = (user) => {
  return hasRole(user, 'admin');
};

/**
 * Check if user is service provider
 * @param {object} user - User object
 * @returns {boolean}
 */
export const isServiceProvider = (user) => {
  return hasRole(user, 'serviceProvider');
};

/**
 * Check if user is pet owner
 * @param {object} user - User object
 * @returns {boolean}
 */
export const isPetOwner = (user) => {
  return hasRole(user, 'petOwner');
};


