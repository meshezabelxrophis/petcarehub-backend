import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { prefersReducedMotion } from '../animations/animationConfig';
import { API_ENDPOINTS } from '../config/backend';

const ProfileCompletionNotification = () => {
  const { currentUser, isServiceProvider } = useAuth();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [profileComplete, setProfileComplete] = useState(true);
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    setShouldReduceMotion(prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (!isServiceProvider || !currentUser) return;

    // Check if provider profile is complete
    const checkProfileCompletion = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.PROVIDER_PROFILE(currentUser.id));
        if (!response.ok) {
          // If profile doesn't exist, it's incomplete
          setProfileComplete(false);
          setIsVisible(true);
          return;
        }

        const profile = await response.json();
        
        // Check if essential fields are filled with actual content
        const isComplete = profile.phone && profile.phone.trim() !== '' &&
                          profile.address && profile.address.trim() !== '' &&
                          profile.bio && profile.bio.trim() !== '' &&
                          profile.business_hours &&
                          Object.keys(profile.business_hours).length > 0;
        
        console.log('Profile completion check:', {
          phone: profile.phone,
          address: profile.address,
          business_hours: profile.business_hours,
          bio: profile.bio,
          isComplete
        });
        
        setProfileComplete(isComplete);
        setIsVisible(!isComplete);
      } catch (error) {
        console.error('Error checking profile completion:', error);
        // Assume incomplete if we can't check
        setProfileComplete(false);
        setIsVisible(true);
      }
    };

    checkProfileCompletion();
    
    // Re-check every 30 seconds in case profile was updated
    const interval = setInterval(checkProfileCompletion, 30000);
    
    return () => clearInterval(interval);
  }, [currentUser, isServiceProvider, location.pathname]);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  // Expose a refresh function that can be called from outside
  const refreshProfileStatus = async () => {
    if (!isServiceProvider || !currentUser) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.PROVIDER_PROFILE(currentUser.id));
      if (!response.ok) {
        setProfileComplete(false);
        setIsVisible(true);
        return;
      }

      const profile = await response.json();
      
      const isComplete = profile.phone && profile.phone.trim() !== '' &&
                        profile.address && profile.address.trim() !== '' &&
                        profile.bio && profile.bio.trim() !== '' &&
                        profile.business_hours &&
                        Object.keys(profile.business_hours).length > 0;
      
      setProfileComplete(isComplete);
      setIsVisible(!isComplete);
    } catch (error) {
      console.error('Error refreshing profile completion:', error);
    }
  };

  // Expose refresh function globally for external calls
  React.useEffect(() => {
    window.refreshProfileCompletion = refreshProfileStatus;
    return () => {
      delete window.refreshProfileCompletion;
    };
  }, [currentUser, isServiceProvider]);

  // Animation variants
  const notificationVariants = shouldReduceMotion ? {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  } : {
    hidden: { 
      opacity: 0, 
      scale: 0.9, 
      x: 50,
      y: -20 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.5
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      x: 30,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  if (!isServiceProvider || !isVisible || profileComplete) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            variants={notificationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-400 p-4 rounded-lg shadow-lg backdrop-blur-sm"
            style={{
              boxShadow: '0 10px 25px rgba(251, 146, 60, 0.15)'
            }}
          >
            <div className="flex items-start">
              <motion.div 
                className="flex-shrink-0"
                initial={shouldReduceMotion ? false : { scale: 0, rotate: -180 }}
                animate={shouldReduceMotion ? false : { scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </motion.div>
              <div className="ml-3 flex-1">
                <motion.h3 
                  className="text-sm font-medium text-orange-800"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Complete Your Profile
                </motion.h3>
                <motion.div 
                  className="mt-2 text-sm text-orange-700"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <p>
                    Please complete your provider profile to start offering services and managing bookings.
                  </p>
                </motion.div>
                <motion.div 
                  className="mt-4 flex justify-between items-center"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex gap-2">
                    <motion.div
                      whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                      whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                    >
                      <Link
                        to="/profile"
                        className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-orange-500 hover:to-orange-600 transition-all duration-200 shadow-md"
                      >
                        Complete Profile
                      </Link>
                    </motion.div>
                    <motion.button
                      onClick={refreshProfileStatus}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md"
                      whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                      whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                      title="Refresh profile status"
                    >
                      ↻
                    </motion.button>
                  </div>
                  <motion.button
                    onClick={handleDismiss}
                    className="text-orange-400 hover:text-orange-600 text-lg font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-orange-100 transition-colors"
                    whileHover={shouldReduceMotion ? {} : { scale: 1.1, rotate: 90 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
                  >
                    ✕
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileCompletionNotification;
