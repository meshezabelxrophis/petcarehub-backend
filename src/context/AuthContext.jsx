import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange } from '../services/authService';

// Create Auth Context
export const AuthContext = createContext();

// Auth Context Provider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 AuthContext: Setting up Firebase auth listener...');
    
    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthChange((user) => {
      console.log('🔐 AuthContext: Auth state changed:', user ? `${user.name} (${user.role})` : 'null');
      setCurrentUser(user);
      setLoading(false);
      
      // Sync with localStorage for backward compatibility
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('🔐 AuthContext: Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  // Login user (called by login/signup pages)
  const login = (userData) => {
    console.log('🔐 AuthContext: Manual login called for:', userData.email);
    setCurrentUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Logout user (will be called by authService.logout)
  const logout = () => {
    console.log('🔐 AuthContext: Logout called');
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    isAuthenticated: !!currentUser,
    isPetOwner: currentUser?.role === 'petOwner' || currentUser?.account_type === 'petOwner',
    isServiceProvider: currentUser?.role === 'serviceProvider' || currentUser?.account_type === 'serviceProvider',
    isAdmin: currentUser?.role === 'admin' || currentUser?.account_type === 'admin',
    // Additional user info
    userId: currentUser?.uid || currentUser?.id,
    userRole: currentUser?.role || currentUser?.account_type,
    userName: currentUser?.name || currentUser?.displayName,
    userEmail: currentUser?.email,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
